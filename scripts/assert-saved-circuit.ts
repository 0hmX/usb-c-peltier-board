import { deepStrictEqual, equal, match, ok } from "node:assert/strict"
import { guessCableInsertCenter } from "@tscircuit/infer-cable-insertion-point"
import saved from "../archive/captured-pcb/circuit.json"
import { assertSchematicParity, assertNoDiagnostics, sourceConnectivity, type Element } from "./schematic-parity"

export function canonical(value: unknown): unknown {
  if (typeof value === "number") ok(Number.isFinite(value), "Non-finite circuit field")
  if (Array.isArray(value)) return value.map(canonical)
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value)
    .sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonical(item)]))
  return value
}
const signature = (value: unknown) => JSON.stringify(canonical(value))
const ownId = (element: Element) => `${element.type}_id`
const records = (elements: Element[], type: string) => elements.filter(element => element.type === type)

/** The capture is immutable. Every deliberate correction is applied to a clone. */
export function expectedSavedCircuit(): Element[] {
  const expected: Element[] = structuredClone(saved).filter(element => !/(?:^|_)(?:warning|error)(?:_|$)/.test(element.type))
  equal(saved.length - expected.length, 117, "Changed historical diagnostic baseline")
  const components = records(expected, "source_component"), ports = records(expected, "source_port")
  for (const component of components) {
    const supplier = (component.supplier_part_numbers as { jlcpcb?: string[] })?.jlcpcb?.[0]
    if (supplier === "C20526" || supplier === "C7420354") Object.assign(component, {
      ftype: "simple_transistor", transistor_type: supplier === "C20526" ? "npn" : "pnp",
    })
    if (supplier === "C8545" || supplier === "C179626") Object.assign(component, {
      ftype: "simple_mosfet", channel_type: "n", mosfet_mode: "enhancement",
    })
    // Core's source diode schema emits interchangeability, while the reviewed
    // Schottky symbol type stays in the native schematic symbol metadata.
    if (component.name === "D_INPUT_PERMISSION") Object.assign(component, { ftype: "simple_diode", are_pins_interchangeable: false })
    if (supplier === "C179626") for (const port of ports.filter(port => port.source_component_id === component.source_component_id)) {
      if ([1, 2, 3, 5].includes(port.pin_number as number)) port.is_passive = true
      if (port.pin_number === 4) port.is_input = true
    }
  }
  const pin = (name: string, number: number) => {
    const component = components.find(element => element.name === name)!
    const found = ports.find(element => element.source_component_id === component.source_component_id && element.pin_number === number)
    ok(found, `Missing saved ${name}.pin${number}`)
    return found
  }
  pin("U_INPUT", 5).requires_power = true
  pin("U_INPUT", 6).provides_power = true
  pin("U_THERMAL", 8).requires_power = true
  pin("U_MCU", 5).requires_ground = true
  for (const number of [5, 7, 8, 9, 10, 11]) pin("J_USB", number).do_not_connect = true
  for (const number of [1, 2, 3]) pin("D_INPUT_PERMISSION", number).is_passive = true
  pin("D_INPUT_PERMISSION", 2).do_not_connect = true
  for (const [name, direction] of Object.entries({ J_USB: "from_left", J_HOT: "from_above", J_COLD: "from_above", J_FAN: "from_above", J_SWD: "from_above", J_UART: "from_above", J_TEC: "from_right" })) {
    const source = components.find(element => element.name === name)!
    const pcb = expected.find(element => element.type === "pcb_component" && element.source_component_id === source.source_component_id)!
    pcb.insertion_direction = direction
    const subtree = expected.filter(element => element.pcb_component_id === pcb.pcb_component_id || element.source_component_id === source.source_component_id)
    const { x, y } = guessCableInsertCenter(subtree as Parameters<typeof guessCableInsertCenter>[0])
    pcb.cable_insertion_center = { x, y }
  }
  // Native BAT54A-215 has local pad centers (+1,+/-.95), (-1,0).
  const diode = expected.find(element => element.type === "pcb_component" && element.source_component_id === "source_component_90")!
  equal(diode.width, 2.3999999999999986)
  diode.width = (-9 + .35) - (-11 - .35)
  const moved = new Map([["pcb_port_385", -9], ["pcb_port_386", -9], ["pcb_port_387", -11]])
  const pads = new Map<string, number>()
  for (const element of expected) {
    const x = moved.get(element.pcb_port_id as string)
    if (x !== undefined && ["pcb_port", "pcb_smtpad"].includes(element.type)) {
      element.x = x
      if (element.type === "pcb_smtpad") pads.set(element.pcb_smtpad_id as string, x)
    }
  }
  for (const element of records(expected, "pcb_solder_paste")) {
    const x = pads.get(element.pcb_smtpad_id as string)
    if (x !== undefined) element.x = x
  }
  for (const [id, index, x] of [["pcb_trace_423", 5, -9], ["pcb_trace_423", 6, -9], ["pcb_trace_424", 0, -9], ["pcb_trace_424", 1, -9], ["pcb_trace_427", 0, -11], ["pcb_trace_427", 1, -11]] as const) {
    const trace = expected.find(element => element.pcb_trace_id === id)!
    ;(trace.route as Element[])[index]!.x = x
  }
  const permissionTrace = expected.find(element => element.type === "source_trace" && element.name === "INPUT_ARMED_PERMISSION_LOCAL")!
  equal(permissionTrace.max_length, 9.9)
  permissionTrace.max_length = 10
  return expected
}

/** Allocation changes are a bijection, never an excuse to drop foreign references. */
function identityMap(actual: Element[], expected: Element[], subsetTypes: string[] = []) {
  const forward = new Map<string, string>(), reverse = new Map<string, string>()
  const bind = (actualId: unknown, expectedId: unknown) => {
    equal(typeof actualId, "string", "Malformed actual identity")
    equal(typeof expectedId, "string", "Malformed expected identity")
    const a = actualId as string, e = expectedId as string
    ok(!forward.has(a) || forward.get(a) === e, `Conflicting actual identity ${a}`)
    ok(!reverse.has(e) || reverse.get(e) === a, `Non-bijective identity ${e}`)
    forward.set(a, e); reverse.set(e, a)
  }
  const remap = (value: unknown): unknown => {
    if (typeof value === "string") return forward.get(value) ?? value
    if (Array.isArray(value)) return value.map(remap)
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, remap(item)]))
    return value
  }
  const pair = (type: string, key: (element: Element, actual: boolean) => unknown) => {
    const want = records(expected, type), got = records(actual, type), index = new Map<string, Element[]>()
    for (const element of want) {
      const k = signature(key(element, false)); index.set(k, [...index.get(k) ?? [], element])
    }
    if (subsetTypes.includes(type)) ok(got.length <= want.length, `Extra ${type}`)
    else equal(got.length, want.length, `Changed ${type} count`)
    for (const element of got) {
      const k = signature(key(element, true)), matches = index.get(k)
      ok(matches?.length, `No saved ${type} identity for ${k.slice(0, 240)}`)
      const target = matches.shift()!
      bind(element[ownId(element)], target[ownId(target)])
    }
  }
  pair("source_component", element => element.name)
  pair("source_net", element => element.name)
  pair("source_group", element => element.name ?? { is_subcircuit: element.is_subcircuit })
  for (const element of records(actual, "source_group")) {
    const target = expected.find(candidate => candidate.source_group_id === forward.get(element.source_group_id as string) && candidate.type === "source_group")!
    if (target.subcircuit_id !== undefined) bind(element.subcircuit_id, target.subcircuit_id)
  }
  const viaPosition = (elements: Element[], element: Element) => elements.find(candidate => candidate.type === "pcb_component" && candidate.source_component_id === element.source_manually_placed_via_id)?.center
  pair("source_manually_placed_via", (element, isActual) => [viaPosition(isActual ? actual : expected, element), isActual ? remap(element.source_net_id) : element.source_net_id])
  pair("source_port", (element, isActual) => [isActual ? remap(element.source_component_id) : element.source_component_id, element.pin_number ?? element.name])
  pair("source_trace", (element, isActual) => element.name ?? [
    isActual ? remap(element.connected_source_port_ids) : element.connected_source_port_ids,
    isActual ? remap(element.connected_source_net_ids) : element.connected_source_net_ids,
  ].map(array => [...array as string[]].sort()))
  for (const element of records(actual, "source_net")) {
    const target = expected.find(candidate => candidate.source_net_id === forward.get(element.source_net_id as string) && candidate.type === "source_net")!
    if (target.subcircuit_connectivity_map_key !== undefined) bind(element.subcircuit_connectivity_map_key, target.subcircuit_connectivity_map_key)
  }
  pair("source_bus", element => element.name)
  pair("source_board", () => "board")
  pair("pcb_board", () => "board")
  pair("pcb_group", (element, isActual) => isActual ? remap(element.source_group_id) : element.source_group_id)
  pair("pcb_component", (element, isActual) => isActual ? remap(element.source_component_id) : element.source_component_id)
  pair("pcb_port", (element, isActual) => isActual ? remap(element.source_port_id) : element.source_port_id)
  pair("pcb_trace", (element, isActual) => isActual ? remap(element.source_trace_id) : element.source_trace_id)
  pair("pcb_via", element => [element.x, element.y])
  const paired = new Set(["source_component", "source_net", "source_group", "source_manually_placed_via", "source_port", "source_trace", "source_bus", "source_board", "pcb_board", "pcb_group", "pcb_component", "pcb_port", "pcb_trace", "pcb_via"])
  // Dependency order puts pads before their solder-paste references.
  const rest = [...new Set(expected.map(element => element.type))].filter(type => !paired.has(type) && type !== "source_project_metadata")
  rest.sort((a, b) => Number(a === "pcb_solder_paste") - Number(b === "pcb_solder_paste"))
  for (const type of rest) pair(type, (element, isActual) => {
    const copy = { ...element }; delete copy[ownId(element)]
    return isActual ? remap(copy) : copy
  })
  return { remap, forward }
}

function compare(actual: Element[], types?: string[], cli = false, allowSubset = false, expected = expectedSavedCircuit()) {
  assertNoDiagnostics(actual)
  const physical = actual.filter(element => !element.type.startsWith("schematic_"))
  const discoveryExpected = types ? expected.filter(element => physical.some(candidate => candidate.type === element.type)) : expected
  const subsetTypes = types ? [...new Set(discoveryExpected.map(element => element.type))].filter(type => allowSubset || !types.includes(type)) : []
  const { remap } = identityMap(physical, discoveryExpected, subsetTypes)
  const normalize = (elements: Element[], isActual: boolean) => elements.map(element => {
    const copy = isActual ? remap(element) as Element : { ...element }
    if (copy.type === "source_project_metadata") delete copy.source_project_metadata_id
    // Native source-length calculations can differ by a floating-point ULP
    // between JS runtimes. Compare this computed limit to 1e-12 mm precision;
    // all copper coordinates, widths, via sizes and other fields stay exact.
    if (copy.type === "source_trace" && typeof copy.max_length === "number")
      copy.max_length = Number(copy.max_length.toFixed(12))
    return signature(copy)
  }).sort()
  if (cli) {
    const metadata = records(physical, "source_project_metadata")
    equal(metadata.length, 1)
    deepStrictEqual(Object.keys(metadata[0]!).sort(), ["source_filesystem_md5_hash", "type"])
    equal(typeof metadata[0]!.source_filesystem_md5_hash, "string", "Invalid CLI filesystem hash")
    match(metadata[0]!.source_filesystem_md5_hash as string, /^[a-f0-9]{32}$/)
    expected[expected.findIndex(element => element.type === "source_project_metadata")] = metadata[0]!
  } else {
    const metadata = records(physical, "source_project_metadata")
    equal(metadata.length, 1)
    equal(typeof metadata[0]!.source_project_metadata_id, "string")
  }
  const got = types ? physical.filter(element => types.includes(element.type)) : physical
  let want = types ? expected.filter(element => types.includes(element.type)) : expected
  if (allowSubset) {
    const present = new Set(got.map(element => (remap(element) as Element)[ownId(element)]))
    want = want.filter(element => present.has(element[ownId(element)]))
  }
  const actualRecords = normalize(got, true), expectedRecords = normalize(want, false)
  // Compare full serialized records as a multiset, but keep failure output bounded
  // even when a changed copper pour contains thousands of polygon vertices.
  const remaining = new Map<string, number>()
  for (const record of expectedRecords) remaining.set(record, (remaining.get(record) ?? 0) + 1)
  for (const record of actualRecords) {
    const count = remaining.get(record) ?? 0
    ok(count > 0, `Changed saved circuit semantics: ${record.slice(0, 400)}`)
    remaining.set(record, count - 1)
  }
  equal(actualRecords.length, expectedRecords.length, "Missing saved circuit records")
  return Object.fromEntries([...new Set(want.map(element => element.type))].sort().map(type => [type, records(got, type).length]))
}

export function assertSavedRecordTypes(actual: Element[], types: string[], options: { allowSubset?: boolean } = {}) {
  return compare(actual, types, false, options.allowSubset)
}

/** Native DRC adds endpoint references after pouring; pour rendering annotates
 * 36 captured wire points. This SDK-only phase contract authenticates those
 * exact later annotations before comparing every remaining source/route field. */
export function assertSavedPrePourSnapshot(actual: Element[]) {
  equal(records(actual, "pcb_copper_pour").length, 0, "Pre-pour snapshot already contains pours")
  const annotationFields = ["start_pcb_port_id", "end_pcb_port_id", "is_inside_copper_pour", "copper_pour_id"]
  for (const trace of records(actual, "pcb_trace")) {
    ok(Array.isArray(trace.route), "Malformed pre-pour route")
    for (const point of trace.route as Element[]) for (const field of annotationFields)
      ok(!(field in point), `Unexpected pre-pour annotation ${field}`)
  }
  const expected = expectedSavedCircuit(), source = sourceConnectivity(expected)
  const index = new Map(expected.map(element => [element[ownId(element)], element]))
  let endpoints = 0, pours = 0
  for (const trace of records(expected, "pcb_trace")) {
    const owner = index.get(trace.source_trace_id)!
    const targets = [...owner.connected_source_port_ids as string[], ...owner.connected_source_net_ids as string[]]
    const root = source.graph.find(targets[0]!)
    const route = trace.route as Element[]
    for (const [position, point] of route.entries()) {
      for (const field of annotationFields.slice(0, 2)) if (field in point) {
        const port = index.get(point[field])!
        equal(port?.type, "pcb_port", "Invalid captured endpoint reference")
        equal(position, field === "start_pcb_port_id" ? 0 : route.length - 1)
        ok(Math.abs(Number(port.x) - Number(point.x)) < 1e-9 && Math.abs(Number(port.y) - Number(point.y)) < 1e-9)
        ok((port.layers as string[]).includes(point.layer as string))
        equal(source.graph.find(port.source_port_id as string), root, "Captured endpoint belongs to a foreign source net")
        endpoints++
      }
      if ("is_inside_copper_pour" in point || "copper_pour_id" in point) {
        const pour = index.get(point.copper_pour_id)!
        equal(point.is_inside_copper_pour, true)
        equal(pour?.type, "pcb_copper_pour", "Invalid captured pour annotation")
        equal(pour.layer, point.layer)
        equal(source.graph.find(pour.source_net_id as string), root, "Captured annotation belongs to a foreign pour net")
        pours++
      }
      for (const field of annotationFields) delete point[field]
    }
  }
  equal(endpoints, 1182, "Changed captured late endpoint annotations")
  equal(pours, 36, "Changed captured late pour annotations")
  const types = [...new Set(expected.filter(element => element.type.startsWith("source_")).map(element => element.type)), "pcb_smtpad", "pcb_port", "pcb_trace", "pcb_via"]
  const counts = compare(actual, types, false, false, expected)
  return { phase: "PcbCopperPourRender:start", endpointAnnotationsPending: endpoints, pourAnnotationsPending: pours, counts }
}
export function assertSavedCircuit(actual: Element[], cli = false) {
  const counts = compare(actual, undefined, cli)
  assertSchematicParity(actual)
  return counts
}

if (import.meta.main) {
  const path = Bun.argv[2]
  if (!path) throw new Error("Usage: bun run scripts/assert-saved-circuit.ts <CLI circuit.json>")
  const counts = assertSavedCircuit(await Bun.file(path).json(), true)
  console.log(JSON.stringify({ pass: true, path, recordTypes: Object.keys(counts).length, records: Object.values(counts).reduce((a, b) => a + b, 0), counts }, null, 2))
}
