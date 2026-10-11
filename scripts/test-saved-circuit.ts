import { equal, throws } from "node:assert/strict"
import { assertSavedPrePourSnapshot, assertSavedRecordTypes, expectedSavedCircuit } from "./assert-saved-circuit"
import { assertSchematicParity, type Element } from "./schematic-parity"

const baseline = expectedSavedCircuit(), types = [...new Set(baseline.map(element => element.type))]
const results: { name: string; pass: boolean }[] = []
const rejected = (name: string, original: Element[], mutate: (elements: Element[]) => void, assert: (elements: Element[]) => unknown) => {
  const elements = structuredClone(original); mutate(elements); throws(() => assert(elements), name)
  results.push({ name, pass: true })
}
const unchanged = (name: string, elements: Element[], assert: (elements: Element[]) => unknown) => {
  assert(elements); results.push({ name, pass: true })
}
const physical = (elements: Element[]) => assertSavedRecordTypes(elements, types)
const first = (elements: Element[], type: string) => elements.find(element => element.type === type)!
unchanged("approved immutable-capture adapter", baseline, physical)
unchanged("outer record reordering", [...baseline].reverse(), physical)
const allocated = new Map<string, string>()
for (const element of baseline) {
  const id = element[`${element.type}_id`]
  if (typeof id === "string") allocated.set(id, id.replace(/_(\d+)$/, (_, n) => `_${Number(n) + 10000}`))
  if (typeof element.subcircuit_id === "string") allocated.set(element.subcircuit_id, element.subcircuit_id.replace(/_(\d+)$/, (_, n) => `_${Number(n) + 10000}`))
  if (typeof element.subcircuit_connectivity_map_key === "string") allocated.set(element.subcircuit_connectivity_map_key, `renumbered_${element.subcircuit_connectivity_map_key}`)
}
const renumber = (value: unknown): unknown => typeof value === "string" ? allocated.get(value) ?? value :
  Array.isArray(value) ? value.map(renumber) : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, renumber(item)])) : value
unchanged("bijective identities and all foreign references", renumber(baseline) as Element[], physical)
const mutations: [string, (elements: Element[]) => void][] = [
  ["interior saved copper route", elements => { (first(elements, "pcb_trace").route as { x: number }[])[1]!.x += .01 }],
  ["saved pad center", elements => { first(elements, "pcb_smtpad").x = Number(first(elements, "pcb_smtpad").x) + .01 }],
  ["via hole diameter", elements => { first(elements, "pcb_via").hole_diameter = .35 }],
  ["saved via ordered physical layer stack", elements => { first(elements, "pcb_via").layers = [...first(elements, "pcb_via").layers as string[]].reverse() }],
  ["unexpected finalized via group metadata", elements => { first(elements, "pcb_via").pcb_group_id = "pcb_group_0" }],
  ["source trace connectivity", elements => { first(elements, "source_trace").connected_source_port_ids = ["source_port_1", "source_port_16"] }],
  ["solder-mask coverage", elements => { first(elements, "pcb_smtpad").is_covered_with_solder_mask = true }],
  ["silkscreen style flag", elements => { first(elements, "pcb_silkscreen_text").is_mirrored = true }],
  ["copper pour net", elements => { first(elements, "pcb_copper_pour").source_net_id = "source_net_1" }],
  ["supplier identity", elements => { first(elements, "source_component").manufacturer_part_number = "wrong" }],
  ["native capacitor rotation must retain saved aliases", elements => {
    const port = elements.find(element => element.type === "source_port" && element.source_port_id === "source_port_565")!
    port.port_hints = (port.port_hints as string[]).filter(alias => alias !== "pos")
  }],
  ["diode passive semantics", elements => { elements.find(element => element.type === "source_port" && element.source_port_id === "source_port_385")!.is_passive = false }],
  ["historical warning restoration", elements => { elements.push({ type: "pcb_trace_warning", pcb_trace_warning_id: "pcb_trace_warning_bad", message: "must fail" }) }],
  ["malformed allocated artwork ID", elements => { const text = first(elements, "pcb_silkscreen_text"); text.pcb_silkscreen_text_id = [text.pcb_silkscreen_text_id] }],
  ["non-finite field where capture has null", elements => { first(elements, "pcb_smtpad").pcb_component_id = NaN }],
  ["non-bijective source identity", elements => { const parts = elements.filter(element => element.type === "source_component"); parts[1]!.source_component_id = parts[0]!.source_component_id }],
]
for (const [name, mutate] of mutations) rejected(name, baseline, mutate, physical)

const prePour = structuredClone(baseline).filter(element => element.type !== "pcb_copper_pour")
const lateFields = ["start_pcb_port_id", "end_pcb_port_id", "is_inside_copper_pour", "copper_pour_id"]
for (const trace of prePour.filter(element => element.type === "pcb_trace"))
  for (const point of trace.route as Element[]) for (const field of lateFields) delete point[field]
unchanged("exact native pre-pour source and physical phase", prePour, assertSavedPrePourSnapshot)
const prePourMutations: [string, (elements: Element[]) => void][] = [
  ["pre-pour saved route width", elements => { (first(elements, "pcb_trace").route as Element[])[0]!.width = .49 }],
  ["pre-pour interior route coordinate", elements => { (first(elements, "pcb_trace").route as Element[])[1]!.x = -43.71 }],
  ["pre-pour route source ownership", elements => { first(elements, "pcb_trace").source_trace_id = "source_trace_1" }],
  ["pre-pour via size", elements => { first(elements, "pcb_via").hole_diameter = .31 }],
  ["pre-pour unexpected phase metadata", elements => { first(elements, "pcb_trace").is_antenna_trace = false }],
]
for (const [name, mutate] of prePourMutations) rejected(name, prePour, mutate, assertSavedPrePourSnapshot)
for (const field of lateFields) rejected(`unexpected pre-pour ${field}`, prePour, elements => {
  ;(first(elements, "pcb_trace").route as Element[])[0]![field] = null
}, assertSavedPrePourSnapshot)

// A physical via connects two sheets. Native connectivity must come exclusively
// from the two drawn wire stubs and their matching labels, never source unions.
const schematic: Element[] = [
  ...[0, 1].map(n => ({ type: "source_component", source_component_id: `source_component_${n}`, name: `R${n + 1}`, ftype: "simple_resistor", resistance: 1000 })),
  ...[0, 1, 2, 3].map(n => ({ type: "source_port", source_port_id: `source_port_${n}`, source_component_id: `source_component_${Math.floor(n / 2)}`, name: `pin${n % 2 + 1}`, pin_number: n % 2 + 1 })),
  { type: "source_net", source_net_id: "source_net_0", name: "SIG", subcircuit_connectivity_map_key: "signal_key" },
  { type: "source_manually_placed_via", source_manually_placed_via_id: "source_manually_placed_via_0", source_net_id: "source_net_0" },
  ...[4, 5].map(n => ({ type: "source_port", source_port_id: `source_port_${n}`, source_component_id: "source_manually_placed_via_0", name: n === 4 ? "top" : "bottom" })),
  ...[0, 1].map(n => ({ type: "source_trace", source_trace_id: `source_trace_${n}`, connected_source_port_ids: [`source_port_${n + 1}`, `source_port_${n + 4}`], connected_source_net_ids: [], subcircuit_connectivity_map_key: "signal_key" })),
  ...[0, 1].map(n => ({ type: "schematic_sheet", schematic_sheet_id: `schematic_sheet_${n}`, name: `Sheet${n}`, display_name: `Sheet${n}`, sheet_index: n, sheet_size: "a4", sheet_width: 297, sheet_height: 210, center: { x: 0, y: 0 } })),
  ...[0, 1].map(n => ({ type: "schematic_component", schematic_component_id: `schematic_component_${n}`, source_component_id: `source_component_${n}`, schematic_sheet_id: `schematic_sheet_${n}`, center: { x: 0, y: 0 }, size: { width: .6, height: .65 }, is_box_with_pins: true })),
  ...[0, 1, 2, 3].map(n => ({ type: "schematic_port", schematic_port_id: `schematic_port_${n}`, source_port_id: `source_port_${n}`, schematic_component_id: `schematic_component_${Math.floor(n / 2)}`, schematic_sheet_id: `schematic_sheet_${Math.floor(n / 2)}`, center: { x: n % 2 ? .3 : -.3, y: 0 }, pin_number: n % 2 + 1, facing_direction: n % 2 ? "right" : "left", is_connected: n === 1 || n === 2 })),
  ...[0, 1].map(n => ({ type: "schematic_trace", schematic_trace_id: `schematic_trace_${n}`, source_trace_id: `source_trace_${n}`, schematic_sheet_id: `schematic_sheet_${n}`, subcircuit_connectivity_map_key: "signal_key", edges: [{ from: { x: n ? -.3 : .3, y: 0 }, to: { x: n ? -.9 : .9, y: 0 } }], junctions: [] })),
  ...[0, 1].map(n => ({ type: "schematic_text", schematic_text_id: `schematic_text_${n}`, source_trace_id: `source_trace_${n}`, schematic_sheet_id: `schematic_sheet_${n}`, text: "SIG", font_size: .12, position: { x: n ? -.44 : .44, y: .06 }, rotation: 0, anchor: n ? "right" : "left", color: "#840000" })),
]
const parity = (elements: Element[]) => assertSchematicParity(elements, { board: false })
unchanged("independent two-sheet native labels and via contraction", schematic, parity)
const directLabel = structuredClone(schematic).filter(element => element.schematic_trace_id !== "schematic_trace_0" && element.schematic_text_id !== "schematic_text_0")
directLabel.find(element => element.type === "schematic_port" && element.schematic_port_id === "schematic_port_1")!.is_connected = false
directLabel.push({ type: "schematic_net_label", schematic_net_label_id: "schematic_net_label_0", source_net_id: "source_net_0", text: "SIG", schematic_sheet_id: "schematic_sheet_0", anchor_position: { x: .3, y: 0 }, center: { x: .3, y: 0 }, anchor_side: "left" })
unchanged("native direct pin label retains false drawn-wire flag", directLabel, parity)
rejected("false connected flag on an actual native wire", schematic, elements => {
  elements.find(element => element.type === "schematic_port" && element.schematic_port_id === "schematic_port_1")!.is_connected = false
}, parity)
rejected("native trace stroke outside drawable area", schematic, elements => {
  ;(first(elements, "schematic_trace").edges as { to: { x: number } }[])[0]!.to.x = 15.5
}, parity)
rejected("native net label glyph outside drawable area", directLabel, elements => {
  first(elements, "schematic_net_label").anchor_position = { x: 15.5, y: 0 }
  first(elements, "schematic_net_label").center = { x: 15.5, y: 0 }
}, parity)
const syntheticLabel = structuredClone(schematic)
first(syntheticLabel, "schematic_trace").source_trace_id = "inline-net-label-clearance-28-SIG"
unchanged("authenticated native inline label clearance trace", syntheticLabel, parity)
rejected("synthetic label trace names wrong actual net", syntheticLabel, elements => {
  first(elements, "schematic_trace").source_trace_id = "inline-net-label-clearance-28-FOREIGN"
}, parity)
rejected("synthetic label trace has foreign connectivity key", syntheticLabel, elements => {
  first(elements, "schematic_trace").subcircuit_connectivity_map_key = "foreign_key"
}, parity)
rejected("synthetic label trace has no drawn label", syntheticLabel, elements => {
  elements.splice(elements.findIndex(element => element.type === "schematic_text"), 1)
}, parity)
const nativeMutations: [string, (elements: Element[]) => void][] = [
  ["missing source pin representation", elements => { elements.splice(elements.findIndex(element => element.type === "schematic_port"), 1) }],
  ["wrong native pin number", elements => { first(elements, "schematic_port").pin_number = 99 }],
  ["wrong native display pin alias", elements => { first(elements, "schematic_port").display_pin_label = "WRONG" }],
  ["wrong native component pin alias", elements => { first(elements, "schematic_component").port_labels = { pin1: "WRONG" } }],
  ["wrong native component owner", elements => { first(elements, "schematic_port").source_port_id = "source_port_2" }],
  ["dangling wire endpoint", elements => { (first(elements, "schematic_trace").edges as { from: { y: number } }[])[0]!.from.y += .2 }],
  ["cross-sheet net label typo", elements => { first(elements, "schematic_text").text = "WRONG" }],
  ["missing drawn cross-sheet label", elements => { elements.splice(elements.findIndex(element => element.type === "schematic_text"), 1) }],
  ["wrong native wire net key", elements => { first(elements, "schematic_trace").subcircuit_connectivity_map_key = "foreign_key" }],
  ["foreign generated artwork reference", elements => { elements.push({ type: "pcb_silkscreen_text", pcb_silkscreen_text_id: "pcb_silkscreen_text_0" }); first(elements, "schematic_text").schematic_component_id = "pcb_silkscreen_text_0" }],
  ["malformed geometry", elements => { first(elements, "schematic_port").center = { x: Infinity, y: 0 } }],
  ["unknown native semantic field", elements => { first(elements, "schematic_trace").ignored_semantics = true }],
  ["unknown nested edge field", elements => { (first(elements, "schematic_trace").edges as Record<string, unknown>[])[0]!.foreign_wire = true }],
  ["native geometry outside converted A4 drawable area", elements => { first(elements, "schematic_text").position = { x: 50, y: 0 } }],
  ["restored native warning", elements => { elements.push({ type: "schematic_layout_error", schematic_layout_error_id: "schematic_layout_error_0", message: "must fail" }) }],
]
for (const [name, mutate] of nativeMutations) rejected(name, schematic, mutate, parity)
const bridge = structuredClone(schematic).filter(element => element.schematic_text_id !== "schematic_text_0")
Object.assign(first(bridge, "schematic_trace"), {
  edges: [
    { from: { x: .3, y: 0 }, to: { x: .3, y: .5 } },
    { from: { x: .3, y: .5 }, to: { x: -.9, y: -.5 }, is_crossing: true },
    { from: { x: -.9, y: -.5 }, to: { x: -1.5, y: -.5 } },
  ],
})
bridge.push({ type: "schematic_net_label", schematic_net_label_id: "schematic_net_label_0", source_net_id: "source_net_0", text: "SIG", schematic_sheet_id: "schematic_sheet_0", anchor_position: { x: -1.5, y: -.5 }, center: { x: -1.5, y: -.5 }, anchor_side: "right" })
unchanged("native bridge does not join pin on crossing chord", bridge, parity)
rejected("ordinary wire crossing a pin creates a short", bridge, elements => {
  delete (first(elements, "schematic_trace").edges as Record<string, unknown>[])[1]!.is_crossing
}, parity)
const unlabelled = structuredClone(schematic).filter(element => element.type !== "schematic_text")
for (const element of unlabelled) {
  if (element.type === "schematic_port") element.is_connected = true
  if (element.type === "schematic_trace") {
    delete element.source_trace_id; delete element.subcircuit_connectivity_map_key
    element.edges = [{ from: { x: -.3, y: 0 }, to: { x: .3, y: 0 } }]
  }
}
throws(() => parity(unlabelled), /Native schematic connectivity differs from source graph/, "Source unions cannot join native wire islands")
results.push({ name: "source unions cannot seed native graph", pass: true })
const branch = structuredClone(schematic)
branch.push({ type: "schematic_trace", schematic_trace_id: "schematic_trace_4", source_trace_id: "source_trace_0", schematic_sheet_id: "schematic_sheet_0", subcircuit_connectivity_map_key: "signal_key", edges: [{ from: { x: .6, y: .5 }, to: { x: .6, y: 0 } }], junctions: [] })
branch.push({ type: "schematic_net_label", schematic_net_label_id: "schematic_net_label_0", source_net_id: "source_net_0", text: "SIG", schematic_sheet_id: "schematic_sheet_0", anchor_position: { x: .6, y: .5 }, center: { x: .6, y: .5 }, anchor_side: "top" })
unchanged("same-net T branch without duplicate junction record", branch, parity)
const displaced = structuredClone(branch)
;(displaced.find(element => element.schematic_trace_id === "schematic_trace_4")!.edges as { to: { y: number } }[])[0]!.to.y = .02
throws(() => parity(displaced), /Dangling native wire endpoint/)
results.push({ name: "branch end moved off conductor", pass: true })
const crossing = structuredClone(schematic)
crossing.push({ type: "source_net", source_net_id: "source_net_1", name: "ALT", subcircuit_connectivity_map_key: "alt_key" })
crossing.push({ type: "source_trace", source_trace_id: "source_trace_2", connected_source_port_ids: ["source_port_0", "source_port_3"], connected_source_net_ids: ["source_net_1"], subcircuit_connectivity_map_key: "alt_key" })
for (const element of crossing) if (element.type === "schematic_port") element.is_connected = true
crossing.push({ type: "schematic_trace", schematic_trace_id: "schematic_trace_2", source_trace_id: "source_trace_2", schematic_sheet_id: "schematic_sheet_0", subcircuit_connectivity_map_key: "alt_key", edges: [
  { from: { x: -.3, y: 0 }, to: { x: -.3, y: .5 } },
  { from: { x: -.3, y: .5 }, to: { x: .6, y: .5 } },
  { from: { x: .6, y: .5 }, to: { x: .6, y: -.5 } },
], junctions: [] })
crossing.push({ type: "schematic_trace", schematic_trace_id: "schematic_trace_3", source_trace_id: "source_trace_2", schematic_sheet_id: "schematic_sheet_1", subcircuit_connectivity_map_key: "alt_key", edges: [{ from: { x: .3, y: 0 }, to: { x: .9, y: 0 } }], junctions: [] })
for (const [index, sheet, anchor] of [[0, 0, { x: .6, y: -.5 }], [1, 1, { x: .9, y: 0 }]] as const) crossing.push({ type: "schematic_net_label", schematic_net_label_id: `schematic_net_label_${index}`, source_net_id: "source_net_1", text: "ALT", schematic_sheet_id: `schematic_sheet_${sheet}`, anchor_position: anchor, center: anchor, anchor_side: "top" })
unchanged("uncoupled ordinary interior crossing without junction", crossing, parity)
const shorted = structuredClone(crossing)
;(shorted.find(element => element.schematic_trace_id === "schematic_trace_2")!.edges as { to: { y: number } }[])[2]!.to.y = 0
Object.assign(shorted.find(element => element.schematic_net_label_id === "schematic_net_label_0")!, { anchor_position: { x: .6, y: 0 }, center: { x: .6, y: 0 } })
throws(() => parity(shorted), /Native wire on wrong net/)
results.push({ name: "foreign-net T endpoint short", pass: true })
equal(results.filter(result => result.pass).length, results.length)
if (import.meta.main) {
  await Bun.write("checks/team-audit/schematic-parity-plan/focused-tests.json", JSON.stringify({ pass: true, tests: results.length, results }, null, 2))
  console.log(JSON.stringify({ pass: true, tests: results.length }))
}
