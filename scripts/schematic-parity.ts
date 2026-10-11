import { deepStrictEqual, equal, ok } from "node:assert/strict"
import * as schemas from "circuit-json"
import { getSchematicElementBounds, type SchematicElementWithBounds } from "@tscircuit/circuit-json-util"

export type Element = { type: string; [key: string]: unknown }
type Point = { x: number; y: number }
type Edge = { from: Point; to: Point; is_crossing?: boolean; from_schematic_port_id?: string; to_schematic_port_id?: string }
const ofType = (elements: Element[], type: string) => elements.filter(element => element.type === type)
const idOf = (element: Element) => element[`${element.type}_id`] as string
const EPS = 1e-7
// Pinned core's paper conversion and 5 mm drawable-area margin.
const SCHEMATIC_UNIT_TO_MM = 10.16 / 1.1
const nativeLabelTrace = /^(?:available-net-orientation|inline-net-label-clearance)-\d+-.+$/

export function assertNoDiagnostics(elements: Element[]) {
  ok(Array.isArray(elements), "Circuit JSON must be an array")
  for (const element of elements) {
    ok(element && typeof element === "object" && typeof element.type === "string", "Malformed circuit record")
    ok(!/(?:^|_)(?:warning|error)(?:_|$)/.test(element.type), `Circuit diagnostic ${element.type}: ${element.message ?? idOf(element)}`)
    ok(!("error_type" in element) && !("warning_type" in element), `Circuit diagnostic discriminator ${element.type}`)
    ok(element.severity !== "warning" && element.severity !== "error", `Circuit diagnostic severity ${idOf(element)}`)
  }
}

class Union {
  parent = new Map<string, string>()
  find(id: string): string {
    if (!this.parent.has(id)) this.parent.set(id, id)
    const parent = this.parent.get(id)!
    if (parent === id) return id
    const root = this.find(parent); this.parent.set(id, root); return root
  }
  join(ids: string[]) { if (ids.length) for (const id of ids.slice(1)) this.parent.set(this.find(id), this.find(ids[0]!)) }
}
function point(value: unknown, context: string): Point {
  ok(value && typeof value === "object", `Missing point ${context}`)
  const p = value as Point
  ok(typeof p.x === "number" && Number.isFinite(p.x) && typeof p.y === "number" && Number.isFinite(p.y), `Invalid point ${context}`)
  return p
}
const near = (a: Point, b: Point) => Math.abs(a.x - b.x) < EPS && Math.abs(a.y - b.y) < EPS
function onSegment(p: Point, edge: Edge) {
  // A native crossing edge renders as a bridge over the crossed conductor.
  if (edge.is_crossing && !near(p, edge.from) && !near(p, edge.to)) return false
  const dx = edge.to.x - edge.from.x, dy = edge.to.y - edge.from.y
  return Math.abs((p.x - edge.from.x) * dy - (p.y - edge.from.y) * dx) <= EPS * Math.max(1, Math.hypot(dx, dy)) &&
    p.x >= Math.min(edge.from.x, edge.to.x) - EPS && p.x <= Math.max(edge.from.x, edge.to.x) + EPS &&
    p.y >= Math.min(edge.from.y, edge.to.y) - EPS && p.y <= Math.max(edge.from.y, edge.to.y) + EPS
}
function finite(value: unknown, context: string): void {
  if (typeof value === "number") ok(Number.isFinite(value), `Non-finite number ${context}`)
  else if (value && typeof value === "object") for (const [key, item] of Object.entries(value)) finite(item, `${context}.${key}`)
}

/** Source graph is used only as the expected partition and to resolve native labels. */
export function sourceConnectivity(elements: Element[]) {
  const graph = new Union(), ports = ofType(elements, "source_port"), nets = ofType(elements, "source_net")
  const portIndex = new Map(ports.map(port => [idOf(port), port])), netIndex = new Map(nets.map(net => [idOf(net), net]))
  for (const record of [...ports, ...nets]) graph.find(idOf(record))
  for (const trace of ofType(elements, "source_trace")) {
    const portIds = trace.connected_source_port_ids as string[], netIds = trace.connected_source_net_ids as string[]
    ok(Array.isArray(portIds) && Array.isArray(netIds), `Malformed source trace ${idOf(trace)}`)
    for (const id of portIds) ok(portIndex.has(id), `Unknown trace port ${id}`)
    for (const id of netIds) ok(netIndex.has(id), `Unknown trace net ${id}`)
    graph.join([...portIds, ...netIds])
  }
  for (const via of ofType(elements, "source_manually_placed_via")) {
    const ids = ports.filter(port => port.source_component_id === idOf(via)).map(idOf)
    ok(ids.length >= 2, `Missing via layer ports ${idOf(via)}`)
    if (via.source_net_id !== undefined) { ok(netIndex.has(via.source_net_id as string)); ids.push(via.source_net_id as string) }
    graph.join(ids)
  }
  for (const component of ofType(elements, "source_component")) {
    for (const ids of (component.internally_connected_source_port_ids ?? []) as string[][]) {
      for (const id of ids) equal(portIndex.get(id)?.source_component_id, idOf(component), `Foreign internal port ${id}`)
      graph.join(ids)
    }
  }
  for (const connection of ofType(elements, "source_component_internal_connection")) {
    const ids = connection.source_port_ids as string[]
    for (const id of ids) equal(portIndex.get(id)?.source_component_id, connection.source_component_id, `Foreign internal connection ${id}`)
    graph.join(ids)
  }
  const rootNets = new Map<string, Element[]>()
  for (const net of nets) { const root = graph.find(idOf(net)); rootNets.set(root, [...rootNets.get(root) ?? [], net]) }
  const keys = new Map<string, string>()
  for (const element of elements.filter(element => ["source_port", "source_net", "source_trace"].includes(element.type))) {
    const key = element.subcircuit_connectivity_map_key
    if (typeof key !== "string") continue
    const target = element.type === "source_trace" ? [...element.connected_source_port_ids as string[], ...element.connected_source_net_ids as string[]][0] : idOf(element)
    ok(target, `Empty connectivity target ${idOf(element)}`)
    const root = graph.find(target)
    ok(!keys.has(key) || keys.get(key) === root, `Conflicting source connectivity key ${key}`)
    keys.set(key, root)
  }
  return { graph, ports, nets, portIndex, netIndex, rootNets, keys }
}

export function assertSchematicParity(elements: Element[], options: { board?: boolean } = {}) {
  assertNoDiagnostics(elements)
  const source = sourceConnectivity(elements), components = ofType(elements, "source_component")
  const componentIndex = new Map(components.map(component => [idOf(component), component]))
  const componentPorts = source.ports.filter(port => componentIndex.has(port.source_component_id as string))
  const numbered = new Set<string>()
  for (const port of componentPorts) {
    ok(Number.isInteger(port.pin_number) && Number(port.pin_number) > 0, `Invalid numbered source port ${idOf(port)}`)
    const identity = `${port.source_component_id}:${port.pin_number}`
    ok(!numbered.has(identity), `Duplicate numbered source port ${identity}`); numbered.add(identity)
  }
  const native = elements.filter(element => element.type.startsWith("schematic_"))
  ok(native.length, "Missing native schematic")
  const ids = new Map<string, Element>(), virtual = new Set<string>()
  for (const element of elements) {
    const id = element[`${element.type}_id`]
    if (id !== undefined) {
      equal(typeof id, "string", `Malformed identity ${element.type}`)
      ok(!ids.has(id as string), `Duplicate identity ${id}`); ids.set(id as string, element)
    }
    if (element.type === "source_group" && typeof element.subcircuit_id === "string") virtual.add(element.subcircuit_id)
    finite(element, idOf(element) ?? element.type)
  }
  // Allocated artwork IDs have no legitimate foreign references in this design.
  const artwork = new Set(elements.filter(element => ["pcb_silkscreen_path", "pcb_silkscreen_text"].includes(element.type)).map(idOf))
  const references = (value: unknown, owner: Element, field = ""): void => {
    if (Array.isArray(value)) { value.forEach(item => references(item, owner, field)); return }
    if (value && typeof value === "object") { for (const [key, item] of Object.entries(value)) references(item, owner, key); return }
    if (typeof value !== "string" || !/(?:_id|_ids|connectsTo)$/.test(field)) return
    if (field === `${owner.type}_id`) return
    ok(!artwork.has(value), `Foreign reference to allocated artwork ${value}`)
    if (owner.type === "schematic_net_label" && field === "source_net_id") return // Resolved electrically below.
    if (field === "source_trace_id" && owner.type === "schematic_trace" && !ids.has(value)) {
      const ports = value.match(/schematic_port_\d+/g) ?? []
      if (/^(?:net-label-to-trace-)?schematic_port_\d+--?schematic_port_\d+$/.test(value)) {
        equal(ports.length, 2); ports.forEach(id => ok(ids.get(id)?.type === "schematic_port", `Unknown synthetic trace pin ${id}`)); return
      }
      if (nativeLabelTrace.test(value)) return // Checked against its drawn label and connectivity key below.
    }
    ok(ids.has(value) || virtual.has(value), `Unknown foreign reference ${owner.type}.${field}: ${value}`)
    if (field === "subcircuit_id") ok(virtual.has(value), `Wrong subcircuit reference ${value}`)
    else if (field !== "connectsTo") {
      const targetType = field.replace(/^(?:parent_|from_|to_|start_|end_)/, "").replace(/_ids?$/, "")
      equal(ids.get(value)?.type, targetType, `Wrong foreign reference type ${owner.type}.${field}: ${value}`)
    }
  }
  for (const element of native) {
    const schema = (schemas as unknown as Record<string, { safeParse(value: unknown): { success: boolean; data?: unknown; error?: { issues: unknown[] } } }>)[element.type]
    ok(schema, `Unknown native record type ${element.type}`)
    const parsed = schema.safeParse(element)
    ok(parsed.success, `Invalid native ${idOf(element)}: ${JSON.stringify(parsed.error?.issues)}`)
    const knownExtensions: Record<string, string[]> = { schematic_sheet: ["center", "display_name"], schematic_component: ["rotation"] }
    const fields = (input: unknown, output: unknown, path = "") => {
      if (!input || typeof input !== "object") return
      for (const [key, value] of Object.entries(input)) {
        if (path === "" && knownExtensions[element.type]?.includes(key)) continue
        ok(output && typeof output === "object" && key in output, `Unknown native field ${idOf(element)}.${path}${key}`)
        fields(value, (output as Record<string, unknown>)[key], `${path}${key}.`)
      }
    }
    fields(element, parsed.data)
    if (element.type === "schematic_sheet" && element.display_name !== undefined) equal(typeof element.display_name, "string", `Malformed sheet display name ${idOf(element)}`)
    if (element.type === "schematic_component" && element.rotation !== undefined) equal(typeof element.rotation, "number", `Malformed native component rotation ${idOf(element)}`)
    references(element, element)
    equal(typeof idOf(element), "string", `Missing native identity ${element.type}`)
  }
  const sheets = ofType(native, "schematic_sheet"), sheetIndex = new Map(sheets.map(sheet => [idOf(sheet), sheet]))
  for (const sheet of sheets) {
    point(sheet.center, idOf(sheet)); ok(typeof sheet.sheet_width === "number" && sheet.sheet_width > 0 && typeof sheet.sheet_height === "number" && sheet.sheet_height > 0, `Invalid sheet dimensions ${idOf(sheet)}`)
  }
  for (const element of native) {
    const sheetId = element.schematic_sheet_id
    if (sheetId === undefined) { ok(["schematic_sheet", "schematic_group", "schematic_symbol"].includes(element.type), `Missing native geometry sheet ${idOf(element)}`); continue }
    const sheet = sheetIndex.get(sheetId as string); ok(sheet, `Unknown native geometry sheet ${idOf(element)}`)
    const center = point(sheet.center, idOf(sheet)), halfWidth = (Number(sheet.sheet_width) / 2 - 5) / SCHEMATIC_UNIT_TO_MM, halfHeight = (Number(sheet.sheet_height) / 2 - 5) / SCHEMATIC_UNIT_TO_MM
    const inside = (p: Point) => ok(Math.abs(p.x - center.x) <= halfWidth + EPS && Math.abs(p.y - center.y) <= halfHeight + EPS, `Native geometry outside sheet ${idOf(element)}`)
    const points = (value: unknown): void => {
      if (!value || typeof value !== "object") return
      if ("x" in value && "y" in value) inside(point(value, idOf(element)))
      else Object.values(value).forEach(points)
    }
    for (const field of ["center", "position", "anchor_position", "points", "edges", "junctions"]) if (element[field] !== undefined) points(element[field])
    if (["schematic_component", "schematic_net_label", "schematic_trace"].includes(element.type)) {
      const bounds = getSchematicElementBounds(element as unknown as SchematicElementWithBounds)
      if (bounds) { inside({ x: bounds.minX, y: bounds.minY }); inside({ x: bounds.maxX, y: bounds.maxY }) }
    }
    if (element.x1 !== undefined) { inside(point({ x: element.x1, y: element.y1 }, idOf(element))); inside(point({ x: element.x2, y: element.y2 }, idOf(element))) }
    if (element.center !== undefined && element.type !== "schematic_sheet") {
      const p = point(element.center, idOf(element)), size = element.size as { width?: number; height?: number } | undefined
      const radius = Number(element.radius ?? 0), width = Number(size?.width ?? element.width ?? radius * 2), height = Number(size?.height ?? element.height ?? radius * 2)
      ok(width >= 0 && height >= 0, `Negative native extent ${idOf(element)}`)
      inside({ x: p.x - width / 2, y: p.y - height / 2 }); inside({ x: p.x + width / 2, y: p.y + height / 2 })
    }
  }
  const schematicComponents = ofType(native, "schematic_component")
  const schematicComponentIndex = new Map(schematicComponents.map(component => [idOf(component), component]))
  const assertPinLabel = (port: Element, label: unknown, context: string) => {
    const aliases = [port.name, ...port.port_hints as string[] ?? [], String(port.pin_number)]
    ok(aliases.includes(label as string), `Incorrect native pin label ${context}: ${label}`)
    if (componentIndex.get(port.source_component_id as string)?.name === "U_INPUT" && port.pin_number === 3)
      equal(label, "AUXOFF", `Incorrect TPS259470A pin 3 label ${context}`)
  }
  for (const component of schematicComponents) {
    ok(componentIndex.has(component.source_component_id as string), `Unknown native component ${idOf(component)}`)
    ok(sheetIndex.has(component.schematic_sheet_id as string), `Missing component sheet ${idOf(component)}`)
    const size = component.size as { width: number; height: number }
    ok(size?.width > 0 && size?.height > 0, `Invalid component size ${idOf(component)}`)
    for (const [key, label] of Object.entries(component.port_labels ?? {})) {
      const pin = key.match(/^pin(\d+)$/)?.[1]
      const port = componentPorts.find(port => port.source_component_id === component.source_component_id && port.pin_number === Number(pin))
      ok(port, `Unknown native component pin label ${idOf(component)}.${key}`)
      assertPinLabel(port, label, `${idOf(component)}.${key}`)
    }
  }
  deepStrictEqual([...new Set(schematicComponents.map(component => component.source_component_id))].sort(), [...componentIndex.keys()].sort(), "Missing native source component")
  const schematicPorts = ofType(native, "schematic_port"), schematicPortIndex = new Map(schematicPorts.map(port => [idOf(port), port]))
  const graph = new Union(), portNodes = new Map<string, string>(), coordinates = new Map<string, { p: Point; sheet: string }>()
  const node = (sheet: string, p: Point) => {
    const key = `${sheet}:${Math.round(p.x / EPS)},${Math.round(p.y / EPS)}`
    coordinates.set(key, { sheet, p }); graph.find(key); return key
  }
  const represented = new Map<string, Element[]>()
  for (const port of schematicPorts) {
    const sourcePort = source.portIndex.get(port.source_port_id as string), component = schematicComponentIndex.get(port.schematic_component_id as string)
    ok(sourcePort && componentIndex.has(sourcePort.source_component_id as string), `Native port cannot represent physical via ${idOf(port)}`)
    ok(component, `Missing native port component ${idOf(port)}`)
    equal(component.source_component_id, sourcePort.source_component_id, `Wrong native port owner ${idOf(port)}`)
    equal(port.pin_number, sourcePort.pin_number, `Wrong native pin number ${idOf(port)}`)
    if (port.display_pin_label !== undefined) assertPinLabel(sourcePort, port.display_pin_label, idOf(port))
    equal(port.schematic_sheet_id, component.schematic_sheet_id, `Wrong native pin sheet ${idOf(port)}`)
    const p = point(port.center, idOf(port)), c = point(component.center, idOf(component)), size = component.size as { width: number; height: number }
    const extension = Number(port.distance_from_component_edge ?? 0)
    ok(extension >= 0 && Math.abs(p.x - c.x) <= size.width / 2 + extension + EPS && Math.abs(p.y - c.y) <= size.height / 2 + extension + EPS, `Native pin outside its component ${idOf(port)}`)
    const occurrences = represented.get(idOf(sourcePort)) ?? []
    ok(!occurrences.some(other => other.schematic_sheet_id === port.schematic_sheet_id), `Duplicate native pin ${idOf(sourcePort)}`)
    represented.set(idOf(sourcePort), [...occurrences, port])
    const key = node(port.schematic_sheet_id as string, point(port.center, idOf(port)))
    portNodes.set(idOf(port), key)
  }
  const usb = components.find(component => component.name === "J_USB")
  const hidden = componentPorts.filter(port => !represented.has(idOf(port)))
  for (const port of hidden) {
    ok(usb && port.source_component_id === idOf(usb) && [1, 2, 3, 4, 7, 9].includes(port.pin_number as number), `Missing native numbered pin ${idOf(port)}`)
    if ([7, 9].includes(port.pin_number as number)) equal(port.do_not_connect, true, `Hidden USB data pin must be explicitly NC ${idOf(port)}`)
    else equal(source.rootNets.get(source.graph.find(idOf(port)))?.[0]?.name, "GND", `Hidden USB shell pin must retain ground ${idOf(port)}`)
  }
  const segments: { sheet: string; edge: Edge; trace: Element; a: string; b: string }[] = []
  const degree = new Map<string, Set<string>>(), terminals = new Set(portNodes.values())
  const link = (a: string, b: string) => {
    graph.join([a, b]); if (a === b) return
    degree.set(a, new Set([...(degree.get(a) ?? []), b])); degree.set(b, new Set([...(degree.get(b) ?? []), a]))
  }
  const junctions: string[] = []
  for (const trace of ofType(native, "schematic_trace")) {
    const sheet = trace.schematic_sheet_id as string
    ok(sheetIndex.has(sheet), `Missing native trace sheet ${idOf(trace)}`)
    ok((trace.edges as Edge[])?.length, `Empty native trace ${idOf(trace)}`)
    const reference = trace.source_trace_id as string | undefined
    if (reference && nativeLabelTrace.test(reference)) equal(typeof trace.subcircuit_connectivity_map_key, "string", `Synthetic label trace lacks connectivity key ${reference}`)
    if (reference && /^(?:net-label-to-trace-)?schematic_port_\d+--?schematic_port_\d+$/.test(reference)) {
      for (const id of reference.match(/schematic_port_\d+/g)!) {
        const pin = schematicPortIndex.get(id)!
        equal(pin.schematic_sheet_id, sheet, `Synthetic trace crosses sheet ${reference}`)
        // Native branch routing can stop at another trace's junction before the
        // named destination pin. Its final drawn connectivity is checked below.
      }
    }
    for (const edge of trace.edges as Edge[]) {
      const from = point(edge.from, idOf(trace)), to = point(edge.to, idOf(trace))
      const a = node(sheet, from), b = node(sheet, to); link(a, b)
      segments.push({ sheet, edge, trace, a, b })
      for (const [field, end] of [["from_schematic_port_id", from], ["to_schematic_port_id", to]] as const) if (edge[field]) {
        const port = schematicPortIndex.get(edge[field]!); ok(port, `Missing edge pin ${edge[field]}`)
        equal(port.schematic_sheet_id, sheet); ok(near(point(port.center, idOf(port)), end), `Edge pin coordinate mismatch ${edge[field]}`)
      }
    }
    for (const p of trace.junctions as Point[] ?? []) junctions.push(node(sheet, point(p, idOf(trace))))
  }
  const attach = (key: string, requireWire = false) => {
    const location = coordinates.get(key)!, touching = segments.filter(segment => segment.sheet === location.sheet && onSegment(location.p, segment.edge))
    if (requireWire) ok(touching.length || terminals.has(key), `Dangling native label/junction ${key}`)
    for (const segment of touching) { graph.join([key, segment.a]); if (key !== segment.a && key !== segment.b) link(key, segment.a), link(key, segment.b) }
    return touching
  }
  for (const key of terminals) attach(key)
  // Native branch routes can end on an existing conductor without duplicating
  // its junction record. T connections join; interior crossing bridges do not.
  for (const key of new Set(segments.flatMap(segment => [segment.a, segment.b]))) attach(key)
  for (const key of junctions) {
    const location = coordinates.get(key)!
    ok(segments.some(segment => segment.sheet === location.sheet && onSegment(location.p, segment.edge)), `Native junction is off wire ${key}`)
    attach(key, true)
  }
  const logicalLabels = new Map<string, string[]>(), labelledNodes = new Set<string>(), coveredNets = new Set<string>()
  const resolve = (identity: unknown): string => {
    equal(typeof identity, "string", "Malformed native electrical identity")
    const id = identity as string
    if (source.portIndex.has(id) || source.netIndex.has(id)) return source.graph.find(id)
    const key = source.keys.get(id); ok(key, `Unresolved native electrical identity ${id}`); return key
  }
  const label = (root: string, text: unknown, key: string) => {
    equal(typeof text, "string", "Malformed native label text")
    const nets = source.rootNets.get(root) ?? []
    ok(nets.some(net => net.name === text), `Incorrect native label ${text} for ${nets.map(net => net.name).join("/")}`)
    attach(key, true); labelledNodes.add(key)
    logicalLabels.set(root, [...logicalLabels.get(root) ?? [], key])
    for (const net of nets) coveredNets.add(idOf(net))
  }
  for (const record of ofType(native, "schematic_net_label")) {
    const sheet = record.schematic_sheet_id as string; ok(sheetIndex.has(sheet), `Missing label sheet ${idOf(record)}`)
    label(resolve(record.source_net_id), record.text, node(sheet, point(record.anchor_position, idOf(record))))
  }
  for (const record of ofType(native, "schematic_text").filter(record => record.source_trace_id !== undefined)) {
    const trace = ids.get(record.source_trace_id as string); ok(trace?.type === "source_trace", `Unknown electrical text source ${idOf(record)}`)
    const targets = [...trace.connected_source_port_ids as string[], ...trace.connected_source_net_ids as string[]]
    ok(targets.length, `Empty electrical text target ${idOf(record)}`)
    const p = point(record.position, idOf(record)), fontSize = record.font_size as number
    const expectedRoot = source.graph.find(targets[0]!), sheet = record.schematic_sheet_id as string
    ok(sheetIndex.has(sheet), `Missing electrical text sheet ${idOf(record)}`)
    // Native labels may sit above or below a wire, and rotate with vertical
    // wires. Resolve the drawn anchor, never an arbitrary source-connected pin.
    const angle = Number(record.rotation ?? 0) * Math.PI / 180
    const candidates = [-1, 1].map(sign => ({ x: p.x - sign * Math.sin(angle) * fontSize / 2, y: p.y + sign * Math.cos(angle) * fontSize / 2 }))
    const matches = candidates.flatMap(anchor => segments.filter(segment => segment.sheet === sheet && onSegment(anchor, segment.edge) &&
      source.keys.get(segment.trace.subcircuit_connectivity_map_key as string) === expectedRoot).map(segment => ({ anchor, segment })))
    ok(matches.length, `Dangling native electrical text ${idOf(record)}`)
    equal(new Set(matches.map(({ segment }) => graph.find(segment.a))).size, 1, `Ambiguous native electrical text ${idOf(record)}`)
    const { anchor } = matches[0]!
    label(expectedRoot, record.text, node(sheet, anchor))
    // Native one-segment text stubs extend under their printed label. The
    // unpinned end of that exact segment is a labelled terminal, not a loose wire.
    for (const { segment } of matches) if ((segment.trace.edges as Edge[]).length === 1) {
      const extent = fontSize * .75 * ((record.text as string).length + 4)
      for (const end of [segment.a, segment.b]) if (!terminals.has(end)) {
        const position = coordinates.get(end)!.p
        ok(Math.hypot(position.x - p.x, position.y - p.y) <= extent, `Overextended native label stub ${idOf(record)}`)
        labelledNodes.add(end)
      }
    }
  }
  // Only actually drawn labels join separated wire islands; source unions never
  // enter the native graph. Equal source keys on two unlabelled stubs cannot join.
  for (const keys of logicalLabels.values()) graph.join(keys)
  for (const segment of segments) {
    const key = segment.trace.subcircuit_connectivity_map_key
    const reference = ids.get(segment.trace.source_trace_id as string)
    const synthetic = segment.trace.source_trace_id as string | undefined
    if (synthetic && /^(?:net-label-to-trace-)?schematic_port_\d+--?schematic_port_\d+$/.test(synthetic)) {
      for (const id of synthetic.match(/schematic_port_\d+/g)!) equal(graph.find(portNodes.get(id)!), graph.find(segment.a), `Synthetic trace disconnected from referenced pin ${id}`)
    }
    const sourceTarget = reference?.type === "source_trace" ? [...reference.connected_source_port_ids as string[], ...reference.connected_source_net_ids as string[]][0] : undefined
    if (key !== undefined || sourceTarget !== undefined) {
      const expectedRoot = key !== undefined ? resolve(key) : source.graph.find(sourceTarget!)
      if (sourceTarget !== undefined) equal(source.graph.find(sourceTarget), expectedRoot, `Wrong native source trace reference ${idOf(segment.trace)}`)
      const nativeRoot = graph.find(segment.a)
      const attachedPorts = schematicPorts.filter(port => graph.find(portNodes.get(idOf(port))!) === nativeRoot)
      for (const port of attachedPorts) equal(source.graph.find(port.source_port_id as string), expectedRoot, `Native wire on wrong net ${idOf(segment.trace)}`)
      for (const net of source.rootNets.get(expectedRoot) ?? []) if (attachedPorts.length) coveredNets.add(idOf(net))
      const traceId = segment.trace.source_trace_id as string | undefined
      if (traceId && nativeLabelTrace.test(traceId)) {
        const name = traceId.replace(/^(?:available-net-orientation|inline-net-label-clearance)-\d+-/, "")
        ok((source.rootNets.get(expectedRoot) ?? []).some(net => net.name === name), `Wrong synthetic net name ${traceId}`)
        ok([...labelledNodes].some(node => graph.find(node) === nativeRoot), `Synthetic net trace lacks drawn label ${traceId}`)
      }
    }
  }
  for (const [key, neighbors] of degree) if (neighbors.size === 1) ok(terminals.has(key) || labelledNodes.has(key), `Dangling native wire endpoint ${key}`)
  for (const port of schematicPorts) {
    const key = portNodes.get(idOf(port))!, connected = degree.has(key) || labelledNodes.has(key)
    // Pinned core leaves this flag false for labels anchored directly at a pin
    // (insertNetLabelsForPortsMissingTrace); its flag denotes a drawn wire.
    equal(port.is_connected, degree.has(key), `Incorrect native connected flag ${idOf(port)}`)
    if (source.portIndex.get(port.source_port_id as string)?.do_not_connect) equal(connected, false, `Connected NC pin ${idOf(port)}`)
  }
  const partitions = (nativeGraph: boolean) => {
    const groups = new Map<string, string[]>()
    for (const port of componentPorts.filter(port => represented.has(idOf(port)))) {
      const roots = represented.get(idOf(port))!.map(native => graph.find(portNodes.get(idOf(native))!))
      if (nativeGraph) equal(new Set(roots).size, 1, `Disconnected repeated native pin ${idOf(port)}`)
      const root = nativeGraph ? roots[0]! : source.graph.find(idOf(port))
      groups.set(root, [...groups.get(root) ?? [], idOf(port)])
    }
    return [...groups.values()].map(group => group.sort()).sort((a, b) => a.join().localeCompare(b.join()))
  }
  const actualPartitions = partitions(true), expectedPartitions = partitions(false)
  const partitionDelta = actualPartitions.filter(group => !expectedPartitions.some(expected => group.join() === expected.join())).map(group => {
    const root = source.graph.find(group[0]!), expected = expectedPartitions.find(expected => expected.includes(group[0]!))!
    const describe = (id: string) => {
      const port = source.portIndex.get(id)!
      return `${componentIndex.get(port.source_component_id as string)?.name}.${port.name}`
    }
    return { nets: source.rootNets.get(root)?.map(net => net.name) ?? [], pins: group.slice(0, 16).map(describe),
      missing: expected.filter(id => !group.includes(id)).slice(0, 16).map(describe) }
  })
  deepStrictEqual(actualPartitions, expectedPartitions, `Native schematic connectivity differs from source graph: ${JSON.stringify(partitionDelta)}`)
  deepStrictEqual([...coveredNets].sort(), [...source.netIndex.keys()].sort(), "Missing native source net representation")
  if (options.board !== false) {
    equal(components.length, 220); equal(componentPorts.length, 571); equal(source.nets.length, 104)
    equal(ofType(elements, "source_manually_placed_via").length, 317); equal(ofType(elements, "source_trace").length, 1029)
    equal(sheets.length, 4); equal(hidden.length, 6); equal(schematicPorts.length, 565)
    deepStrictEqual(sheets.map(sheet => sheet.name).sort(), ["CONTROL", "DEBUG", "PD_INPUT", "TEC_POWER"])
    deepStrictEqual(sheets.map(sheet => sheet.sheet_index).sort(), [0, 1, 2, 3])
    for (const sheet of sheets) equal(sheet.sheet_size, "a4", `Wrong native sheet size ${idOf(sheet)}`)
    for (const sheet of sheets) { equal(sheet.sheet_width, 297); equal(sheet.sheet_height, 210) }
  }
  return { sourceComponents: components.length, componentPorts: componentPorts.length, representedPorts: represented.size,
    hiddenUsbPorts: hidden.map(port => port.pin_number).sort((a, b) => Number(a) - Number(b)),
    sourceVias: ofType(elements, "source_manually_placed_via").length, sourceNets: source.nets.length,
    sourceTraces: ofType(elements, "source_trace").length, schematicRecords: native.length,
    schematicTypes: Object.fromEntries([...new Set(native.map(record => record.type))].sort().map(type => [type, ofType(native, type).length])),
    noDanglingTraces: true, connectivityParity: true }
}
