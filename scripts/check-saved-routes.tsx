import { deepStrictEqual, equal, throws } from "node:assert/strict"
import { mkdirSync, rmSync } from "node:fs"
import { Circuit } from "@tscircuit/core"
import { runAllSchematicChecks } from "@tscircuit/checks"
import Board from "./legacy-saved-board"
import { supplierOrientationCache } from "../src/parts/supplier-parts-engine"
import { assertSavedCircuit, assertSavedRecordTypes } from "./assert-saved-circuit"
import { assertSchematicParity } from "./schematic-parity"

// A failed fresh run must not leave an older success report looking current.
rmSync("checks/tsx-preview.json", { force: true })
const circuit = new Circuit({ platform: { localCacheEngine: supplierOrientationCache } })
const replayedPhases: string[] = []
let pourSolvers = 0
let schematicSolvers = 0
circuit.on("autorouting:start", event => {
  equal(event.autorouterName, "precomputed", "Legacy entrypoint must replay saved routes")
  equal(event.phaseName, "GROUND_ESCAPES")
  replayedPhases.push(event.phaseName)
})
circuit.on("solver:started", event => {
  if (event.solverName === "SchematicTracePipelineSolver") { schematicSolvers++; return }
  equal(event.solverName, "CopperPourPipelineSolver", "Legacy entrypoint must not solve PCB routes")
  pourSolvers++
})
const consoleDiagnostics: unknown[][] = []
const originalWarn = console.warn, originalError = console.error
console.warn = (...args) => { consoleDiagnostics.push(args); originalWarn(...args) }
console.error = (...args) => { consoleDiagnostics.push(args); originalError(...args) }
const board = Board()
equal(board.type, "board", "Legacy saved-route entry must return real TSX")
equal(board.props.schematicDisabled, false, "Legacy saved-route entry must render native schematics")
circuit.add(board)
await circuit.renderUntilSettled()
const rendered: ReturnType<typeof circuit.getCircuitJson> = JSON.parse(JSON.stringify(circuit.getCircuitJson()))
mkdirSync("checks", { recursive: true })
await Bun.write("checks/tsx-preview.circuit.json", JSON.stringify(rendered, null, 2))
deepStrictEqual(consoleDiagnostics, [], "Preview emitted console warnings or errors")
deepStrictEqual(rendered.filter(element => /_(warning|error)$/.test(element.type)), [], "Preview emitted diagnostic records")
deepStrictEqual(await runAllSchematicChecks(structuredClone(rendered)), [], "Native schematic validator emitted diagnostics")
deepStrictEqual(replayedPhases, ["GROUND_ESCAPES"])
equal(pourSolvers, 1)
equal(schematicSolvers > 0, true, "Native schematic routing must run")
equal(rendered.filter(element => element.type === "pcb_trace").length, 636)
equal(rendered.filter(element => element.type === "pcb_via").length, 434)
const schematic = assertSchematicParity(rendered)
const counts = assertSavedCircuit(rendered)
// Repeated lifecycle passes must repair lost interior ports and route metadata,
// including a route replacement that retains its allocated trace ID.
let restoredMemberships = 0
for (const via of circuit.db.pcb_via.list()) if ((via.pcb_port_ids?.length ?? 0) > 2) {
  circuit.db.pcb_via.update(via.pcb_via_id, { pcb_port_ids: via.pcb_port_ids!.slice(0, 2) })
  restoredMemberships++
}
circuit.emit("renderable:renderLifecycle:PcbManualTraceRender:start")
assertSavedRecordTypes(JSON.parse(JSON.stringify(circuit.getCircuitJson())), ["pcb_via"])
equal(restoredMemberships, 141)
const trace = circuit.db.pcb_trace.list().find(trace => trace.route.some(point => point.route_type === "via"))!
const index = trace.route.findIndex(point => point.route_type === "via")
const original = structuredClone(trace.route)
for (const removed of [["via_diameter"], ["via_hole_diameter"], ["via_diameter", "via_hole_diameter"]]) {
  const route = structuredClone(original)
  for (const field of removed) delete (route[index] as unknown as Record<string, unknown>)[field]
  circuit.db.pcb_trace.update(trace.pcb_trace_id, { route })
  circuit.emit("renderable:renderLifecycle:PcbManualTraceRender:end")
  deepStrictEqual(circuit.db.pcb_trace.get(trace.pcb_trace_id)!.route, original)
}
const conflicting = structuredClone(original)
if (conflicting[index]!.route_type !== "via") throw new Error("Expected inline via")
Object.assign(conflicting[index]!, { via_diameter: undefined, via_hole_diameter: 0.01 })
circuit.db.pcb_trace.update(trace.pcb_trace_id, { route: conflicting })
throws(() => circuit.emit("renderable:renderLifecycle:PcbManualTraceRender:end"), /Conflicting source via sizes/)
circuit.db.pcb_trace.update(trace.pcb_trace_id, { route: original })
assertSavedCircuit(JSON.parse(JSON.stringify(circuit.getCircuitJson())))
deepStrictEqual(consoleDiagnostics, [], "Repeated lifecycle passes emitted console warnings or errors")
console.warn = originalWarn; console.error = originalError
const report = { pass: true, entrypoint: "scripts/legacy-saved-board.tsx", revision: "legacy", scope: "Historical saved-route replay and capture parity; not Revision B validation", requiresCapturedRuntime: false, replayedPhases,
  routingSolverStarts: 0, pourSolvers, schematicSolvers, schematic, warnings: 0, errors: 0,
  consoleDiagnostics: 0, nativeSchematicValidatorDiagnostics: 0, comparedRecordCounts: counts, comparedRecordTypes: Object.keys(counts).length,
  comparedRecords: rendered.length, silkscreenTextUnchanged: true, restoredMemberships,
  repeatedViaMetadataRepair: true, partialViaSizesRepaired: true, conflictingViaSizesRejected: true }
await Bun.write("checks/tsx-preview.json", JSON.stringify(report, null, 2) + "\n")
console.log(JSON.stringify(report, null, 2))
