import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { RootCircuit } from "@tscircuit/core"
import type { CircuitJson } from "circuit-json"
import { installTraceWidthDiagnostics } from "../src/trace-width-diagnostics"

// Historical copper is the current board's preserved routing and retains the
// 44 native attribution warnings, so this fixture survives a corrected build.
const saved: CircuitJson = JSON.parse(readFileSync(new URL("../captured-pcb/circuit.json", import.meta.url), "utf8"))
const clone = () => structuredClone(saved)
const event = { effectName: "board:drc-checks", phase: "PcbDesignRuleChecks", asyncEffectId: "fixture:drc" }
const finishDrc = (circuit: RootCircuit) => {
  circuit.emit("asyncEffect:start", event)
  circuit.emit("asyncEffect:end", event)
}
const setup = (fixture = clone()) => {
  const circuit = new RootCircuit()
  circuit.db.insertAll(fixture)
  const seeded = structuredClone(circuit.db.toArray())
  const receipts = installTraceWidthDiagnostics(circuit)
  return { circuit, receipts, seeded }
}
const undersize = (name: string) => {
  const fixture = clone()
  const source = fixture.find(element => element.type === "source_trace" && element.name === name)
  if (source?.type !== "source_trace") throw new Error(`Missing ${name}`)
  const trace = fixture.find(element => element.type === "pcb_trace" && element.source_trace_id === source.source_trace_id)
  if (trace?.type !== "pcb_trace") throw new Error(`Missing owned route ${name}`)
  for (const point of trace.route) if (point.route_type === "wire") point.width = .2
  return { fixture, source, trace }
}
const nonWidthElements = (fixture: CircuitJson) => fixture.filter(element => element.type !== "pcb_trace_warning")

describe("source-owned trace width diagnostics", () => {
  test("corrects the actual board's 44 net-wide attribution mistakes with receipts", () => {
    const { circuit, receipts, seeded } = setup()
    expect(circuit.db.pcb_trace_warning.list()).toHaveLength(44)
    finishDrc(circuit)
    expect(circuit.db.pcb_trace_warning.list()).toHaveLength(0)
    expect(nonWidthElements(circuit.db.toArray())).toEqual(nonWidthElements(seeded))
    expect(receipts).toHaveLength(1)
    expect(receipts[0]?.beforeWarningCount).toBe(44)
    expect(receipts[0]?.afterWarningCount).toBe(0)
    expect(receipts[0]?.changes).toHaveLength(44)
    expect(receipts[0]?.changes.every(change => change.before && !change.after
      && change.cause === "native-net-wide-attribution" && change.minimumOwnedWidthMm === change.requiredWidthMm)).toBe(true)
  })

  test("detects an actual owned USB ground route below its unchanged .5 mm requirement", () => {
    const { fixture, source, trace } = undersize("USB_GND_1")
    const { circuit, receipts, seeded } = setup(fixture)
    finishDrc(circuit)
    const warnings = circuit.db.pcb_trace_warning.list()
    expect(warnings).toHaveLength(1)
    expect(warnings[0]?.source_trace_id).toBe(source.source_trace_id)
    expect(warnings[0]?.pcb_trace_id).toBe(trace.pcb_trace_id)
    expect(warnings[0]?.message).toContain("requested: 0.5mm, actual: 0.2mm")
    expect(receipts[0]?.routeViolationCount).toBe(1)
    expect(nonWidthElements(circuit.db.toArray())).toEqual(nonWidthElements(seeded))
  })

  test("detects the 3 mm TEC hot-loop undersize hidden by native neckdown allowances", () => {
    const { fixture, source, trace } = undersize("TEC_INPUT_HOT_LOOP")
    const { circuit, receipts } = setup(fixture)
    finishDrc(circuit)
    const warnings = circuit.db.pcb_trace_warning.list()
    expect(warnings).toHaveLength(1)
    expect(warnings[0]?.source_trace_id).toBe(source.source_trace_id)
    expect(warnings[0]?.pcb_trace_id).toBe(trace.pcb_trace_id)
    expect(warnings[0]?.message).toContain("requested: 3mm, actual: 0.2mm")
    expect(receipts[0]?.routeViolationCount).toBe(1)
    // Live updates clear only our diagnostic after the copper is restored.
    circuit.db.pcb_trace.update(trace.pcb_trace_id, {
      route: trace.route.map(point => point.route_type === "wire" ? { ...point, width: 3 } : point),
    })
    finishDrc(circuit)
    expect(circuit.db.pcb_trace_warning.list()).toHaveLength(0)
    expect(receipts[1]?.changes[0]?.cause).toBe("owned-route-width-restored")
  })

  test("creates the missing strict TEC diagnostic when native DRC reports none", () => {
    const { fixture, source, trace } = undersize("TEC_INPUT_HOT_LOOP")
    const { circuit, receipts, seeded } = setup(fixture.filter(element => element.type !== "pcb_trace_warning"))
    finishDrc(circuit)
    expect(circuit.db.pcb_trace_warning.list()).toHaveLength(1)
    expect(circuit.db.pcb_trace_warning.list()[0]?.source_trace_id).toBe(source.source_trace_id)
    expect(circuit.db.pcb_trace_warning.list()[0]?.pcb_trace_id).toBe(trace.pcb_trace_id)
    expect(receipts[0]?.changes[0]?.cause).toBe("owned-route-below-source-width")
    expect(receipts[0]?.changes[0]?.before).toBe(null)
    expect(nonWidthElements(circuit.db.toArray())).toEqual(nonWidthElements(seeded))
  })

  test("a fresh native diagnostic replaces only the repair's generated duplicate", () => {
    const { fixture } = undersize("USB_GND_1")
    const { circuit, receipts } = setup(fixture.filter(element => element.type !== "pcb_trace_warning"))
    finishDrc(circuit)
    const { type, pcb_trace_warning_id, ...fields } = circuit.db.pcb_trace_warning.list()[0]!
    const native = structuredClone(circuit.db.pcb_trace_warning.insert(fields))
    finishDrc(circuit)
    expect(circuit.db.pcb_trace_warning.list()).toEqual([native])
    expect(receipts[1]?.changes[0]?.cause).toBe("native-width-diagnostic-retained")
    finishDrc(circuit)
    expect(circuit.db.pcb_trace_warning.list()).toEqual([native])
    expect(receipts).toHaveLength(2)
  })

  test("preserves an unrelated trace warning and every other native DRC record", () => {
    const fixture = clone()
    const template = fixture.find(element => element.type === "pcb_trace_warning")!
    if (template.type !== "pcb_trace_warning") throw new Error("Missing warning fixture")
    const unrelated = { ...template, pcb_trace_warning_id: "pcb_trace_warning_unrelated", message: "Manual route review is still required." }
    fixture.push(unrelated)
    const { circuit, seeded } = setup(fixture)
    const expected = circuit.db.pcb_trace_warning.list().find(warning => warning.message === unrelated.message)
    finishDrc(circuit)
    expect(circuit.db.pcb_trace_warning.list()).toEqual([expected!])
    expect(nonWidthElements(circuit.db.toArray())).toEqual(nonWidthElements(seeded))
  })

  test("retains a legitimate native width warning without replacing or duplicating it", () => {
    const { fixture, source, trace } = undersize("USB_GND_1")
    const native = fixture.find(element => element.type === "pcb_trace_warning" && element.source_trace_id === source.source_trace_id)
    if (native?.type !== "pcb_trace_warning") throw new Error("Missing native warning")
    const first = trace.route.find(point => point.route_type === "wire")!
    const last = trace.route.filter(point => point.route_type === "wire").at(-1)!
    native.pcb_trace_id = trace.pcb_trace_id
    native.center = { x: (first.x + last.x) / 2, y: (first.y + last.y) / 2 }
    const expected = structuredClone(native)
    const { circuit } = setup(fixture)
    finishDrc(circuit)
    expect(circuit.db.pcb_trace_warning.list()).toEqual([expected])
    finishDrc(circuit)
    expect(circuit.db.pcb_trace_warning.list()).toEqual([expected])
  })

  test("installation and repeated DRC events are idempotent, unrelated effects are ignored", () => {
    const { circuit, receipts } = setup()
    expect(installTraceWidthDiagnostics(circuit)).toBe(receipts)
    circuit.emit("asyncEffect:end", { ...event, effectName: "board:pour" })
    circuit.emit("asyncEffect:end", { ...event, error: "native DRC failed" })
    expect(circuit.db.pcb_trace_warning.list()).toHaveLength(44)
    expect(receipts).toHaveLength(0)
    finishDrc(circuit)
    finishDrc(circuit)
    expect(circuit.db.pcb_trace_warning.list()).toHaveLength(0)
    expect(receipts).toHaveLength(1)
  })
})
