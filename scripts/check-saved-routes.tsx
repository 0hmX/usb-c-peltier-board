import { deepStrictEqual, equal, throws } from "node:assert/strict"
import { mkdirSync } from "node:fs"
import { Circuit } from "@tscircuit/core"
import Board from "../index"
import savedCircuit from "../captured-pcb/circuit.json"
import { supplierOrientationCache } from "../src/parts/supplier-parts-engine"
import { assertSavedCircuit } from "./assert-saved-circuit"

const circuit = new Circuit({ platform: { localCacheEngine: supplierOrientationCache } })
const replayedPhases: string[] = []
let pourSolvers = 0
circuit.on("autorouting:start", event => {
  equal(event.autorouterName, "precomputed", "Default preview must replay saved routes")
  equal(event.phaseName, "GROUND_ESCAPES")
  replayedPhases.push(event.phaseName)
})
circuit.on("solver:started", event => {
  equal(event.solverName, "CopperPourPipelineSolver", "Default preview must not solve routes")
  pourSolvers++
})
const board = Board()
equal(board.type, "board", "Default entry must return real TSX")
circuit.add(board)
await circuit.renderUntilSettled()
const rendered: ReturnType<typeof circuit.getCircuitJson> = JSON.parse(JSON.stringify(circuit.getCircuitJson()))
mkdirSync("checks", { recursive: true })
await Bun.write("checks/tsx-preview.circuit.json", JSON.stringify(rendered, null, 2))
deepStrictEqual(rendered.filter(element => element.type.endsWith("_error")), [])
deepStrictEqual(replayedPhases, ["GROUND_ESCAPES"])
equal(pourSolvers, 1)
const counts = assertSavedCircuit(rendered)
// Repeated lifecycle passes must repair lost interior ports and route metadata,
// including a route replacement that retains its allocated trace ID.
let restoredMemberships = 0
for (const via of circuit.db.pcb_via.list()) if ((via.pcb_port_ids?.length ?? 0) > 2) {
  circuit.db.pcb_via.update(via.pcb_via_id, { pcb_port_ids: via.pcb_port_ids!.slice(0, 2) })
  restoredMemberships++
}
circuit.emit("renderable:renderLifecycle:PcbManualTraceRender:start")
deepStrictEqual(JSON.parse(JSON.stringify(circuit.db.pcb_via.list())), savedCircuit.filter(element => element.type === "pcb_via"))
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
const report = { pass: true, entrypoint: "index.tsx", requiresCapturedRuntime: false, replayedPhases,
  routingSolverStarts: 0, pourSolvers, comparedRecordCounts: counts, comparedRecordTypes: Object.keys(counts).length,
  comparedRecords: rendered.length, silkscreenTextUnchanged: true, restoredMemberships,
  repeatedViaMetadataRepair: true, partialViaSizesRepaired: true, conflictingViaSizesRejected: true }
await Bun.write("checks/tsx-preview.json", JSON.stringify(report, null, 2) + "\n")
console.log(JSON.stringify(report, null, 2))
