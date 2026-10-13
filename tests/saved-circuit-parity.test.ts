import { expect, test } from "bun:test"
import { assertSavedRecordTypes, expectedSavedCircuit } from "../scripts/assert-saved-circuit"

test("historical parity accepts host rounding of a computed source length", () => {
  const actual = expectedSavedCircuit()
  const trace = actual.find(item => item.type === "source_trace" && item.name === "D504_SERIES_TO")!
  expect(trace.max_length).toBe(0.9099999999039864)
  trace.max_length = 0.9099999999039865
  expect(() => assertSavedRecordTypes(actual, ["source_trace"])).not.toThrow()
})

test("historical parity still rejects a changed length limit and copper coordinate", () => {
  const lengthChanged = expectedSavedCircuit()
  const trace = lengthChanged.find(item => item.type === "source_trace" && item.name === "D504_SERIES_TO")!
  trace.max_length = Number(trace.max_length) + 1e-6
  expect(() => assertSavedRecordTypes(lengthChanged, ["source_trace"])).toThrow("Changed saved circuit semantics")

  const copperChanged = expectedSavedCircuit()
  const routed = copperChanged.find(item => item.type === "pcb_trace")!
  const route = routed.route as Array<{ x: number }>
  route[0]!.x += 1e-6
  expect(() => assertSavedRecordTypes(copperChanged, ["pcb_trace"])).toThrow("Changed saved circuit semantics")
})
