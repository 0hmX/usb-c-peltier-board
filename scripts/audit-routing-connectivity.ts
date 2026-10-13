import { createHash } from "node:crypto"
import { mkdir } from "node:fs/promises"
import { difference as floatingDifference, intersection as floatingIntersection, type MultiPolygon, type Pair, type Polygon } from "polygon-clipping"
import ClipperLib from "clipper-lib"
import { ConnectivityMap, PcbConnectivityMap, findConnectedNetworks } from "circuit-json-to-connectivity-map"

type Point = { x: number; y: number }
type Bounds = { left: number; right: number; bottom: number; top: number }
type Copper = { id: string; elementId: string; kind: string; layer: string; net?: string;
  portId?: string; barrel?: string; shape: MultiPolygon; bounds: Bounds; areaMm2: number }
const arcSteps = 128, minimumContactAreaMm2 = 1e-6
const allLayers = ["top", "inner1", "inner2", "bottom"]
let integerFallbackCount = 0
// Floating sweep-line clipping can fail for coincident circular vertices.
// Integer fallback resolves those cases on a 1e-8 mm grid; contact threshold is
// substantially larger than quantization-induced slivers in this board.
function integerBoolean(a: MultiPolygon, b: MultiPolygon, subtract: boolean): MultiPolygon {
  integerFallbackCount++
  const scale = 1e8
  const paths = (shape: MultiPolygon) => shape.flatMap(polygon => polygon.map((ring, i) => {
    const path = ring.map(([x, y]) => ({ X: Math.round(x * scale), Y: Math.round(y * scale) }))
    if (ClipperLib.Clipper.Orientation(path) !== (i === 0)) path.reverse()
    return path
  }))
  const clipper = new ClipperLib.Clipper(), tree = new ClipperLib.PolyTree()
  clipper.AddPaths(paths(a), ClipperLib.PolyType.ptSubject, true)
  clipper.AddPaths(paths(b), ClipperLib.PolyType.ptClip, true)
  clipper.Execute(subtract ? ClipperLib.ClipType.ctDifference : ClipperLib.ClipType.ctIntersection, tree,
    ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero)
  return ClipperLib.JS.PolyTreeToExPolygons(tree).map(p => [p.outer, ...p.holes].map(r => r.map(q => [q.X / scale, q.Y / scale] as Pair)))
}
export function subtractCopperPolygon(a: MultiPolygon, b: Polygon): MultiPolygon {
  try { return floatingDifference(a, b) } catch { return integerBoolean(a, [b], true) }
}
const difference = subtractCopperPolygon
function intersection(a: MultiPolygon, b: MultiPolygon): MultiPolygon {
  try { return floatingIntersection(a, b) } catch { return integerBoolean(a, b, false) }
}
function area(shape: MultiPolygon): number {
  return shape.reduce((sum, polygon) => sum + polygon.reduce((part, ring, i) => part + (i ? -1 : 1)
    * Math.abs(ring.reduce((s, p, j) => { const q = ring[(j + 1) % ring.length]; return s + p[0] * q[1] - q[0] * p[1] }, 0)) / 2, 0), 0)
}
function bounds(shape: MultiPolygon): Bounds {
  const points = shape.flat(2)
  return { left: Math.min(...points.map(p => p[0])), right: Math.max(...points.map(p => p[0])),
    bottom: Math.min(...points.map(p => p[1])), top: Math.max(...points.map(p => p[1])) }
}
function overlaps(a: Bounds, b: Bounds) {
  return a.left < b.right && a.right > b.left && a.bottom < b.top && a.top > b.bottom
}
// Inscribed copper, circumscribed drill: positive contact is conservative.
function capsule(a: Point, b: Point, radius: number, drill = false): Polygon {
  if (drill) radius /= Math.cos(Math.PI / arcSteps)
  const angle = Math.atan2(b.y - a.y, b.x - a.x), ring: Pair[] = []
  for (const [center, offset] of [[b, -Math.PI / 2], [a, Math.PI / 2]] as const)
    for (let i = 0; i <= arcSteps / 2; i++) {
      const theta = angle + offset + i * 2 * Math.PI / arcSteps
      ring.push([center.x + radius * Math.cos(theta), center.y + radius * Math.sin(theta)])
    }
  return [ring]
}
function pill(p: Point, width: number, height: number, rotation = 0, drill = false): Polygon {
  const half = Math.abs(width - height) / 2, theta = (rotation + (height > width ? 90 : 0)) * Math.PI / 180
  const dx = half * Math.cos(theta), dy = half * Math.sin(theta)
  return capsule({ x: p.x - dx, y: p.y - dy }, { x: p.x + dx, y: p.y + dy }, Math.min(width, height) / 2, drill)
}
function roundedRect(p: any): Polygon {
  const r = Math.min(p.corner_radius ?? 0, p.width / 2, p.height / 2), ring: Pair[] = []
  const theta = (p.ccw_rotation ?? p.rotation ?? 0) * Math.PI / 180
  const transform = (x: number, y: number): Pair => [p.x + x * Math.cos(theta) - y * Math.sin(theta), p.y + x * Math.sin(theta) + y * Math.cos(theta)]
  if (r <= 0) return [[transform(-p.width / 2, -p.height / 2), transform(p.width / 2, -p.height / 2),
    transform(p.width / 2, p.height / 2), transform(-p.width / 2, p.height / 2)]]
  for (let corner = 0; corner < 4; corner++) {
    const sx = corner === 0 || corner === 3 ? 1 : -1, sy = corner < 2 ? 1 : -1
    for (let i = 0; i <= arcSteps / 4; i++) {
      const a = corner * Math.PI / 2 + i * 2 * Math.PI / arcSteps
      ring.push(transform(sx * (p.width / 2 - r) + r * Math.cos(a), sy * (p.height / 2 - r) + r * Math.sin(a)))
    }
  }
  return [ring]
}

/** Independent physical audit. Net IDs classify copper; they never create graph edges. */
export function auditRoutingConnectivity(circuit: any[]) {
  const initialIntegerFallbackCount = integerFallbackCount
  const netsByKey = new Map(circuit.filter(e => e.type === "source_net").map(e => [e.subcircuit_connectivity_map_key, e.name]))
  const netsById = new Map(circuit.filter(e => e.type === "source_net").map(e => [e.source_net_id, e.name]))
  const sourcePorts = new Map(circuit.filter(e => e.type === "source_port").map(e => [e.source_port_id, e]))
  const sourceComponents = new Map(circuit.filter(e => e.type === "source_component").map(e => [e.source_component_id, e]))
  const sourceTraces = new Map(circuit.filter(e => e.type === "source_trace").map(e => [e.source_trace_id, e]))
  const pcbPorts = new Map(circuit.filter(e => e.type === "pcb_port").map(e => [e.pcb_port_id, e]))
  const portNet = (id: string) => netsByKey.get(sourcePorts.get(pcbPorts.get(id)?.source_port_id)?.subcircuit_connectivity_map_key)
  const elementNet = (e: any): string | undefined => netsById.get(e.source_net_id)
    ?? netsByKey.get(e.subcircuit_connectivity_map_key)
    ?? netsByKey.get(sourceTraces.get(e.source_trace_id)?.subcircuit_connectivity_map_key)
    ?? portNet(e.pcb_port_id)
  const selector = (id: string) => { const s = sourcePorts.get(pcbPorts.get(id)?.source_port_id)
    return s ? `${sourceComponents.get(s.source_component_id)?.name}.pin${s.pin_number}` : id }
  const unsupported: any[] = [], nodes: Copper[] = [], edges: string[][] = [], contacts: any[] = []
  const drills: { polygon: Polygon; bounds: Bounds }[] = []
  for (const e of circuit) {
    let polygon: Polygon | undefined
    if (e.type === "pcb_via" || ((e.type === "pcb_hole" || e.type === "pcb_plated_hole") && (e.shape ?? e.hole_shape) === "circle"))
      polygon = capsule(e, e, (e.hole_diameter ?? e.diameter) / 2, true)
    else if ((e.type === "pcb_plated_hole" || e.type === "pcb_hole") && (e.shape ?? e.hole_shape) === "pill")
      polygon = pill(e, e.hole_width, e.hole_height, e.ccw_rotation ?? 0, true)
    else if (e.type === "pcb_hole" || e.type === "pcb_plated_hole") unsupported.push({ type: e.type, shape: e.shape ?? e.hole_shape, reason: "Unsupported drill geometry" })
    if (polygon) drills.push({ polygon, bounds: bounds([polygon]) })
  }
  function add(e: any, elementId: string, layer: string, initial: MultiPolygon, suffix: string, barrel?: string) {
    let shape = initial
    const initialBounds = bounds(initial)
    for (const drill of drills) if (overlaps(initialBounds, drill.bounds)) shape = difference(shape, drill.polygon)
    // Difference can split an object: split pieces must never be joined by its ID.
    for (const [piece, polygon] of shape.entries()) {
      const copper: MultiPolygon = [polygon], size = area(copper)
      if (size <= minimumContactAreaMm2) continue
      const id = `${elementId}:${layer}:${suffix}:${piece}`
      nodes.push({ id, elementId, kind: e.type, layer, net: elementNet(e), portId: e.pcb_port_id,
        barrel, shape: copper, bounds: bounds(copper), areaMm2: size })
      edges.push([id])
    }
  }
  for (const e of circuit) {
    if (e.type === "pcb_smtpad") {
      let shape: MultiPolygon | undefined
      if (e.shape === "polygon") shape = [[e.points.map((p: Point): Pair => [p.x, p.y])]]
      else if (e.shape === "rect") shape = [roundedRect(e)]
      else if (e.shape === "circle") shape = [capsule(e, e, e.radius)]
      if (shape) add(e, e.pcb_smtpad_id, e.layer, shape, "pad")
      else unsupported.push({ id: e.pcb_smtpad_id, shape: e.shape })
    } else if (e.type === "pcb_via" || e.type === "pcb_plated_hole") {
      const id = e.pcb_via_id ?? e.pcb_plated_hole_id
      let shape: MultiPolygon | undefined
      if (e.type === "pcb_via" || e.shape === "circle") shape = [capsule(e, e, e.outer_diameter / 2)]
      else if (e.shape === "pill") shape = [pill(e, e.outer_width, e.outer_height, e.ccw_rotation ?? 0)]
      if (shape) for (const layer of e.layers ?? allLayers) add(e, id, layer, shape, "annulus", id)
      else unsupported.push({ id, shape: e.shape })
    } else if (e.type === "pcb_copper_pour") {
      if (e.shape !== "brep") { unsupported.push({ id: e.pcb_copper_pour_id, shape: e.shape }); continue }
      const ring = (r: any): Pair[] => r.vertices.map((p: Point) => [p.x, p.y])
      add(e, e.pcb_copper_pour_id, e.layer, [[ring(e.brep_shape.outer_ring), ...(e.brep_shape.inner_rings ?? []).map(ring)]], "pour")
    } else if (e.type === "pcb_trace") {
      for (let i = 1; i < e.route.length; i++) {
        const a = e.route[i - 1], b = e.route[i]
        if (a.route_type !== "wire" || b.route_type !== "wire") { unsupported.push({ id: e.pcb_trace_id, segment: i, reason: "Non-wire route requires explicit via/arc primitive" }); continue }
        if (a.layer !== b.layer) { unsupported.push({ id: e.pcb_trace_id, segment: i, reason: "Wire changes layer without barrel" }); continue }
        const width = Math.min(a.width, b.width, a.start_width ?? a.width, a.end_width ?? a.width, b.start_width ?? b.width, b.end_width ?? b.width)
        if (!(Number.isFinite(width) && width > 0)) { unsupported.push({ id: e.pcb_trace_id, segment: i, reason: "Invalid copper width" }); continue }
        add(e, e.pcb_trace_id, a.layer, [capsule(a, b, width / 2)], `segment${i}`)
      }
    }
  }
  const barrels = new Map<string, Copper[]>()
  for (const node of nodes) if (node.barrel) barrels.set(node.barrel, [...(barrels.get(node.barrel) ?? []), node])
  for (const [barrel, members] of barrels) {
    // An actual plated barrel, unlike an SMT port label, is a vertical conductor.
    edges.push(members.map(n => n.id))
    contacts.push({ kind: "plated-barrel", elementId: barrel, nodes: members.map(n => n.id), layers: members.map(n => n.layer) })
  }
  // Sweep by x per layer; exact finite intersection decides contact after bounds filtering.
  for (const layer of allLayers) {
    const sorted = nodes.filter(n => n.layer === layer).sort((a, b) => a.bounds.left - b.bounds.left)
    for (let i = 0; i < sorted.length; i++) for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i], b = sorted[j]
      if (b.bounds.left >= a.bounds.right) break
      if (!overlaps(a.bounds, b.bounds)) continue
      const contactAreaMm2 = area(intersection(a.shape, b.shape))
      if (contactAreaMm2 <= minimumContactAreaMm2) continue
      edges.push([a.id, b.id])
      contacts.push({ kind: "finite-copper", a: a.id, b: b.id, layer, contactAreaMm2,
        ...(a.net && b.net && a.net !== b.net ? { shortedNets: [a.net, b.net] } : {}) })
    }
  }
  // Native map constructor's trace endpoint metadata is deliberately excluded.
  // Only measured copper overlap and actual plated barrels populate its graph.
  const physical = new PcbConnectivityMap()
  physical.connMap = new ConnectivityMap(findConnectedNetworks(edges))
  const root = (node: Copper) => physical.connMap.getNetConnectedToId(node.id)!
  const physicalComponents = new Map<string, Copper[]>()
  for (const node of nodes) physicalComponents.set(root(node), [...(physicalComponents.get(root(node)) ?? []), node])
  // Only unanchored fill is eligible for cleanup. A disconnected pad, trace,
  // or plated barrel protects its entire component, regardless of net labels.
  const floatingPourComponents = [...physicalComponents.entries()]
    .filter(([, members]) => members.every(n => n.kind === "pcb_copper_pour"))
    .map(([id, members]) => ({ id, copperAreaMm2: members.reduce((sum, n) => sum + n.areaMm2, 0),
      pieces: members.map(n => ({ id: n.id, elementId: n.elementId, layer: n.layer, net: n.net,
        bounds: n.bounds, areaMm2: n.areaMm2, polygons: n.shape })) }))
    .sort((a, b) => a.id.localeCompare(b.id))
  const byPort = new Map<string, Copper[]>()
  for (const node of nodes) if (node.portId) byPort.set(node.portId, [...(byPort.get(node.portId) ?? []), node])
  const netReports = [...netsById.values()].map(net => {
    const members = nodes.filter(n => n.net === net), components = new Map<string, Copper[]>()
    for (const node of members) components.set(root(node), [...(components.get(root(node)) ?? []), node])
    const ordered = [...components.entries()].sort((a, b) => b[1].reduce((s, n) => s + n.areaMm2, 0) - a[1].reduce((s, n) => s + n.areaMm2, 0))
    const main = ordered[0]?.[0]
    const ports = [...byPort].filter(([id]) => portNet(id) === net).map(([id, copper]) => {
      const componentIds = [...new Set(copper.map(root))]
      const nodeIds = new Set(copper.map(n => n.id))
      return { pcbPortId: id, selector: selector(id), componentIds, connectedToMain: componentIds.length === 1 && componentIds[0] === main,
        contacts: contacts.filter(c => c.kind === "finite-copper" && (nodeIds.has(c.a) || nodeIds.has(c.b))) }
    })
    const missingPadPorts = [...pcbPorts].filter(([id, p]) => portNet(id) === net && sourceComponents.has(sourcePorts.get(p.source_port_id)?.source_component_id)
      && !byPort.has(id)).map(([id]) => ({ pcbPortId: id, selector: selector(id) }))
    return { net, componentCount: components.size, copperNodeCount: members.length, padPortCount: ports.length,
      passed: components.size === 1 && ports.every(p => p.connectedToMain) && !missingPadPorts.length,
      mainComponentId: main, missingPadPorts, disconnectedPorts: ports.filter(p => !p.connectedToMain),
      components: ordered.map(([id, members]) => ({ id, copperAreaMm2: members.reduce((s, n) => s + n.areaMm2, 0),
        bounds: { left: Math.min(...members.map(n => n.bounds.left)), right: Math.max(...members.map(n => n.bounds.right)),
          bottom: Math.min(...members.map(n => n.bounds.bottom)), top: Math.max(...members.map(n => n.bounds.top)) },
        layers: [...new Set(members.map(n => n.layer))],
        elements: [...new Set(members.map(n => n.elementId))], ports: [...new Set(members.filter(n => n.portId).map(n => selector(n.portId!)))] })), ports }
  })
  const shorts = contacts.filter(c => c.shortedNets)
  const pourNodeIds = new Set(nodes.filter(n => n.kind === "pcb_copper_pour").map(n => n.id))
  const bottomGround = nodes.filter(n => n.kind === "pcb_copper_pour" && n.layer === "bottom" && n.net === "GND")
  const usbReferenceTraces = circuit.filter(e => e.type === "pcb_trace" && /^USB_D[MP]/.test(elementNet(e) ?? "")
    && e.route.some((p: any) => p.route_type === "wire" && p.layer === "inner2"))
  const usbGroundClearanceMm = 0.25 // Matches the explicitly authored USB reference pour.
  const usbBottomCoverage = usbReferenceTraces.map(trace => {
    const net = elementNet(trace), endpoints = [trace.route[0], trace.route[trace.route.length - 1]]
    const transitions = circuit.filter(e => e.type === "pcb_via" && elementNet(e) === net && e.layers.includes("inner2")
      && endpoints.some(p => p?.route_type === "wire" && Math.hypot(p.x - e.x, p.y - e.y) <= e.outer_diameter / 2 + 1e-7))
    const segments: any[] = []
    for (let i = 1; i < trace.route.length; i++) {
      const a = trace.route[i - 1], b = trace.route[i]
      if (a.route_type !== "wire" || b.route_type !== "wire" || a.layer !== "inner2" || b.layer !== "inner2") continue
      const width = Math.max(a.width, b.width, a.start_width ?? a.width, a.end_width ?? a.width, b.start_width ?? b.width, b.end_width ?? b.width)
      let projection: MultiPolygon = [capsule(a, b, width / 2)]
      // Only the actual endpoint transition via footprint and its specified
      // antipad are excluded. Unrelated holes/cuts remain uncovered failures.
      for (const via of transitions) projection = difference(projection, capsule(via, via, via.outer_diameter / 2 + usbGroundClearanceMm, true))
      let uncovered = projection
      for (const copper of bottomGround) if (uncovered.length && overlaps(bounds(uncovered), copper.bounds))
        for (const polygon of copper.shape) uncovered = difference(uncovered, polygon)
      const uncoveredAreaMm2 = area(uncovered)
      segments.push({ segment: i, from: { x: a.x, y: a.y }, to: { x: b.x, y: b.y }, width,
        requiredAreaMm2: area(projection), uncoveredAreaMm2, passed: uncoveredAreaMm2 <= minimumContactAreaMm2,
        uncoveredPolygons: uncoveredAreaMm2 > minimumContactAreaMm2 ? uncovered : [] })
    }
    return { pcbTraceId: trace.pcb_trace_id, net, passed: segments.every(s => s.passed),
      excludedTransitionAntipads: transitions.map(v => ({ pcbViaId: v.pcb_via_id, x: v.x, y: v.y,
        exclusionRadiusMm: v.outer_diameter / 2 + usbGroundClearanceMm })), segments }
  })
  const usbBottomReference = { applicable: usbReferenceTraces.length > 0,
    passed: usbBottomCoverage.every(t => t.passed), groundPourPieceCount: bottomGround.length,
    method: "Full inner2 USB swept copper projection minus actual endpoint transition via footprint and authored 0.25 mm GND clearance, compared with actual bottom GND BREP copper after all drill subtraction. Unrelated antipads are not exempted.",
    traces: usbBottomCoverage }
  return { passed: !unsupported.length && !shorts.length && netReports.every(n => n.passed) && usbBottomReference.passed,
    method: "128-segment inscribed copper/circumscribed drills; all drill voids subtracted; positive finite contact >1e-6 mm2; actual plated barrels; native PcbConnectivityMap populated exclusively from physical edges",
    minimumContactAreaMm2, integerFallbackCount: integerFallbackCount - initialIntegerFallbackCount,
    copperNodeCount: nodes.length, physicalContactCount: contacts.length, unsupported,
    shorts, nets: netReports, usbBottomReference, floatingPourComponents,
    planeContacts: contacts.filter(c => c.kind === "finite-copper" && (pourNodeIds.has(c.a) || pourNodeIds.has(c.b))),
    barrelContacts: contacts.filter(c => c.kind === "plated-barrel") }
}

if (import.meta.main) {
  const input = process.argv[2] ?? "dist/routed/circuit.json"
  const output = process.argv[3] ?? "review/routing/physical-connectivity.json"
  const text = await Bun.file(input).text(), report = auditRoutingConnectivity(JSON.parse(text))
  await mkdir(output.includes("/") ? output.slice(0, output.lastIndexOf("/")) || "/" : ".", { recursive: true })
  await Bun.write(output, JSON.stringify({ input, circuitSha256: createHash("sha256").update(text).digest("hex"), ...report }, null, 2) + "\n")
  console.log(JSON.stringify({ passed: report.passed, nodes: report.copperNodeCount, contacts: report.physicalContactCount,
    unsupported: report.unsupported.length, shorts: report.shorts.length,
    usbBottomReference: { applicable: report.usbBottomReference.applicable, passed: report.usbBottomReference.passed,
      failedTraces: report.usbBottomReference.traces.filter(t => !t.passed).map(t => t.pcbTraceId) },
    failedNets: report.nets.filter(n => !n.passed).map(n => ({ net: n.net,
      components: n.componentCount, missingPads: n.missingPadPorts.length, disconnectedPorts: n.disconnectedPorts.map(p => p.selector) })), output }, null, 2))
  if (!report.passed) process.exitCode = 1
}
