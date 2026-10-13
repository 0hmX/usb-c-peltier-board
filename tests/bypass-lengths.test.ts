import { describe, expect, test } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"
import { auditBypassLengths, circleIntervals, pillIntervals, polygonIntervals, rectangleIntervals } from "../scripts/audit-bypass-lengths"

const measure = (intervals: [number, number][]) => intervals.reduce((total, [a, b]) => total + b - a, 0)
const rectangle = (id: string, port: string, x: number, width: number) => ({
  type: "pcb_smtpad", pcb_smtpad_id: id, pcb_port_id: port,
  shape: "rect", x, y: 0, width, height: 2, layer: "top",
})

function fixture(end = 6, maxExposedLength = 4, pads = [rectangle("PAD_A", "PORT_A", 0, 2), rectangle("PAD_B", "PORT_B", end, 2)]) {
  const circuit = [
    { type: "pcb_port", pcb_port_id: "PORT_A", source_port_id: "SOURCE_A", x: 0, y: 0, layers: ["top"] },
    { type: "pcb_port", pcb_port_id: "PORT_B", source_port_id: "SOURCE_B", x: end, y: 0, layers: ["top"] },
    { type: "source_trace", source_trace_id: "SOURCE_TRACE", name: "TEST_TRACE", display_name: "C1.pin1 to U1.pin1",
      connected_source_port_ids: ["SOURCE_A", "SOURCE_B"], connected_source_net_ids: [] },
    { type: "pcb_trace", pcb_trace_id: "PCB_TRACE", source_trace_id: "SOURCE_TRACE", trace_length: 999,
      route: [{ route_type: "wire", x: 0, y: 0, width: 0.2, layer: "top", start_pcb_port_id: "PORT_A" },
        { route_type: "wire", x: end, y: 0, width: 0.2, layer: "top", end_pcb_port_id: "PORT_B" }] },
    ...pads,
  ] as unknown as AnyCircuitElement[]
  const generated = { traces: [{ name: "TEST_TRACE", net: "TEST", from: "C1.pin1", to: "U1.pin1",
    layer: "top", width: 0.2, path: [{ x: 0, y: 0 }, { x: end, y: 0 }], rotation: 0, origin: { x: 0, y: 0 }, maxExposedLength }] }
  return { circuit, generated }
}

describe("actual exposed bypass copper", () => {
  test("pad interiors and cached 999mm length cannot change the exposed bound", () => {
    const { circuit, generated } = fixture()
    const result = auditBypassLengths(circuit, generated)
    expect(result.passed).toBe(true)
    expect(result.measurements[0].nativeWireLength).toBeCloseTo(6, 10)
    expect(result.measurements[0].attachedPadMetalLength).toBeCloseTo(2, 10)
    expect(result.measurements[0].exposedLength).toBeCloseTo(4, 10)
    expect(result.measurements[0].cachedNativeLengthsIgnored).toEqual([999])
    // Native pcbStraightLine sometimes clips these pad interiors and sometimes
    // retains them, depending on width. The physical exposed bound is identical.
    const clipped = structuredClone(circuit)
    const trace = clipped.find(p => p.type === "pcb_trace")!
    if (trace.type !== "pcb_trace") throw new Error("Fixture trace missing")
    if (trace.route[0].route_type === "wire") trace.route[0].x = 1
    if (trace.route[1].route_type === "wire") trace.route[1].x = 5
    expect(auditBypassLengths(clipped, generated).measurements[0].exposedLength).toBeCloseTo(4, 10)
    generated.traces[0].maxExposedLength = 3.99
    expect(auditBypassLengths(circuit, generated).passed).toBe(false)
  })

  test("overlapping attached lands are subtracted only once", () => {
    const { circuit, generated } = fixture(4, 0, [rectangle("PAD_A", "PORT_A", 0, 6), rectangle("PAD_B", "PORT_B", 4, 6)])
    const result = auditBypassLengths(circuit, generated)
    expect(result.passed).toBe(true)
    expect(result.measurements[0].attachedPadMetalLength).toBeCloseTo(4, 10)
    expect(result.measurements[0].exposedLength).toBeCloseTo(0, 10)
  })

  test("a concave pad notch stays exposed instead of becoming bounding-box copper", () => {
    const ring = [{ x: -2, y: -1 }, { x: 2, y: -1 }, { x: 2, y: 1 }, { x: 1, y: 1 },
      { x: 1, y: 0 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: -2, y: 1 }]
    const intervals = polygonIntervals({ x: -3, y: 0.5 }, { x: 3, y: 0.5 }, ring)
    expect(intervals).toHaveLength(2)
    expect(measure(intervals) * 6).toBeCloseTo(2, 10)
    expect((1 - measure(intervals)) * 6).toBeCloseTo(4, 10)
  })

  test("drilled contact annulus and drill void have separate measured lengths", () => {
    const { circuit, generated } = fixture(2, 1, [rectangle("PAD_A", "PORT_A", 0, 1)])
    circuit.push({ type: "pcb_via", pcb_via_id: "VIA_B", x: 2, y: 0,
      outer_diameter: 1, hole_diameter: 0.4, layers: ["top", "bottom"], pcb_port_ids: ["PORT_B"] } as AnyCircuitElement)
    const result = auditBypassLengths(circuit, generated)
    expect(result.passed).toBe(true)
    expect(result.measurements[0].nativeWireLength).toBeCloseTo(2, 10)
    expect(result.measurements[0].attachedPadMetalLength).toBeCloseTo(0.8, 10)
    expect(result.measurements[0].attachedDrillVoidLength).toBeCloseTo(0.2, 10)
    expect(result.measurements[0].exposedLength).toBeCloseTo(1, 10)
  })

  test("circular lands use exact chords and zero-measure tangencies", () => {
    expect(measure(circleIntervals({ x: -2, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 0 }, 1))).toBeCloseTo(0.5, 10)
    expect(measure(circleIntervals({ x: -2, y: 0.6 }, { x: 2, y: 0.6 }, { x: 0, y: 0 }, 1))).toBeCloseTo(0.4, 10)
    expect(circleIntervals({ x: -2, y: 1 }, { x: 2, y: 1 }, { x: 0, y: 0 }, 1)).toEqual([])
  })

  test("rotated rectangles and pill lands retain exact orientation and rounded ends", () => {
    expect(measure(rectangleIntervals({ x: -2, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 0 }, 2, 1, 90))).toBeCloseTo(0.25, 10)
    expect(measure(pillIntervals({ x: -3, y: 0 }, { x: 3, y: 0 }, { x: 0, y: 0 }, 4, 2))).toBeCloseTo(2 / 3, 10)
    expect(measure(pillIntervals({ x: -3, y: 0 }, { x: 3, y: 0 }, { x: 0, y: 0 }, 4, 2, 90))).toBeCloseTo(1 / 3, 10)
    expect(measure(pillIntervals({ x: -3, y: 0.6 }, { x: 3, y: 0.6 }, { x: 0, y: 0 }, 4, 2))).toBeCloseTo(0.6, 10)
  })

  test("stale builds and absent exposed constraints cannot claim a passing audit", () => {
    const { circuit, generated } = fixture()
    const stale = auditBypassLengths(circuit, { traces: [...generated.traces, { ...generated.traces[0], name: "MISSING_TRACE" }] })
    expect(stale.passed).toBe(false)
    expect(stale.inputErrors).toHaveLength(1)
    expect(stale.violations.some(p => p.errors.includes("Missing native source trace"))).toBe(true)
    const unconstrained = { traces: generated.traces.map(({ maxExposedLength: _, ...trace }) => trace) }
    expect(auditBypassLengths(circuit, unconstrained).status).toBe("missing-exposed-length-constraints")
    expect(auditBypassLengths(circuit, unconstrained).passed).toBe(false)
  })
})
