import { deepStrictEqual, equal, ok } from "node:assert/strict"
import { mkdirSync } from "node:fs"
import { Circuit } from "@tscircuit/core"
import Board from "../index"
import savedCircuit from "../captured-pcb/circuit.json"
import { supplierOrientationCache } from "../src/parts/supplier-parts-engine"

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
const preservedTypes = ["source_port", "source_trace", "pcb_port", "pcb_trace", "pcb_via",
  "pcb_smtpad", "pcb_plated_hole", "pcb_hole", "pcb_keepout", "pcb_copper_pour"] as const
const counts = Object.fromEntries(preservedTypes.map(type => {
  const actual = rendered.filter(element => element.type === type)
  deepStrictEqual(actual, savedCircuit.filter(element => element.type === type), `Changed saved ${type}`)
  return [type, actual.length]
}))
const silk = (elements: { type: string; [key: string]: unknown }[]) => elements
  .filter(element => element.type === "pcb_silkscreen_text")
  .map(({ text, anchor_position, font_size, ccw_rotation }) => ({ text, anchor_position, font_size, ccw_rotation }))
  .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
deepStrictEqual(silk(rendered), silk(savedCircuit))
ok(rendered.some(element => element.type === "source_component" && element.name === "U_INPUT"))
const report = { pass: true, entrypoint: "index.tsx", requiresCapturedRuntime: false, replayedPhases,
  routingSolverStarts: 0, pourSolvers, exactSavedGeometry: counts, silkscreenTextUnchanged: true }
await Bun.write("checks/tsx-preview.json", JSON.stringify(report, null, 2) + "\n")
console.log(JSON.stringify(report, null, 2))
