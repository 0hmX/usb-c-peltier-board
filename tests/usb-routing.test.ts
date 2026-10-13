import { describe, expect, test } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"
import packet from "../src/board/routing/usb-completion.json"
import { auditUsbRouting } from "../scripts/audit-usb-routing"
import type { GeneratedCopper } from "../src/board/routing/generated-types"

function fixture() {
  const circuit: any[] = [], generated: GeneratedCopper = { traces: [], vias: structuredClone(packet.vias) }
  const components = new Map<string, string>(), ports = new Map<string, string>()
  const nets = new Map(packet.paths.map(p => [p.net, `net_${p.net}`]))
  for (const [name, id] of nets) circuit.push({ type: "source_net", name, source_net_id: id, subcircuit_connectivity_map_key: id })
  function port(selector: string, net: string, x: number, y: number) {
    if (ports.has(selector)) return ports.get(selector)!
    const [name, pin] = selector.split(".")
    if (!components.has(name)) {
      components.set(name, `component_${name}`)
      circuit.push({ type: "source_component", name, source_component_id: components.get(name) })
    }
    const id = `port_${selector}`, source = `source_${id}`
    circuit.push({ type: "source_port", source_port_id: source, source_component_id: components.get(name),
      name: pin, pin_number: Number(pin.replace("pin", "")), subcircuit_connectivity_map_key: nets.get(net) })
    circuit.push({ type: "pcb_port", pcb_port_id: id, source_port_id: source, x, y,
      layers: [pin === "inner2" ? "inner2" : "top"] })
    ports.set(selector, id)
    return id
  }
  packet.paths.forEach((p, i) => {
    const name = `trace_${i}`, id = `source_trace_${i}`, a = p.points[0], b = p.points.at(-1)!
    const start = port(p.from, p.net, a[0], a[1]), end = port(p.to, p.net, b[0], b[1])
    generated.traces.push({ name, net: p.net, from: p.from, to: p.to, layer: p.layer, width: p.width,
      path: p.points.map(([x, y]) => ({ x, y })), rotation: 0, origin: { x: 0, y: 0 } })
    circuit.push({ type: "source_trace", name, source_trace_id: id, connected_source_net_ids: [nets.get(p.net)],
      subcircuit_connectivity_map_key: nets.get(p.net) })
    circuit.push({ type: "pcb_trace", pcb_trace_id: `pcb_trace_${i}`, source_trace_id: id,
      route: p.points.map(([x, y], k) => ({ route_type: "wire", x, y, layer: p.layer, width: p.width,
        ...(k === 0 ? { start_pcb_port_id: start } : {}), ...(k === p.points.length - 1 ? { end_pcb_port_id: end } : {}) })) })
  })
  packet.vias.forEach((v, i) => circuit.push({ type: "pcb_via", pcb_via_id: `via_${i}`, x: v.x, y: v.y,
    source_net_id: nets.get(v.net), layers: ["top", "inner1", "inner2", "bottom"], outer_diameter: .7, hole_diameter: .3 }))
  return { circuit: circuit as AnyCircuitElement[], generated }
}

describe("independent native USB audit", () => {
  test("counts primary paths once, alternate bridges separately, and actual layer transitions", () => {
    const f = fixture(), result = auditUsbRouting(f.circuit, f.generated, packet)
    expect(result.problems).toEqual([])
    expect(result.members.DP.lengthMm).toBeCloseTo(48.843949, 5)
    expect(result.members.DM.lengthMm).toBeCloseTo(result.members.DP.lengthMm, 8)
    expect(result.members.DP.alternateOrientationLengthMm - result.members.DP.lengthMm).toBeCloseTo(3.248864, 5)
    expect(result.members.DP.transitionCount).toBe(2)
    expect(result.members.DM.layerSequence).toEqual(["top", "inner2", "top"])
  })
  test("accepts native point-to-point traces inheriting their net through ports", () => {
    const f = fixture()
    for (const s of f.circuit as any[]) if (s.type === "source_trace") s.connected_source_net_ids = []
    const result = auditUsbRouting(f.circuit, f.generated, packet)
    expect(result.ok).toBe(true)
    expect(result.matchedNativeTraceCount).toBe(16)
    const s: any = f.circuit.find(p => p.type === "source_trace")
    s.subcircuit_connectivity_map_key = "net_USB_DM_PORT"
    expect(auditUsbRouting(f.circuit, f.generated, packet).ok).toBe(false)
  })
  test("native trunk detour creates measured skew even when cached totals claim equality", () => {
    const f = fixture(), i = packet.paths.findIndex(p => p.net === "USB_DP_SWITCH" && p.layer === "inner2")
    const trace: any = f.circuit.find((p: any) => p.pcb_trace_id === `pcb_trace_${i}`)
    trace.route.splice(2, 0, { route_type: "wire", x: -37, y: -15, width: .2, layer: "inner2" })
    const result = auditUsbRouting(f.circuit, f.generated, packet)
    expect(result.ok).toBe(false)
    expect(result.primarySkewMm).toBeGreaterThan(.05)
    expect(result.problems.some(p => p.includes("primary skew"))).toBe(true)
  })
  test("wrong-net physical barrel cannot provide the declared transition", () => {
    const f = fixture(), via: any = f.circuit.find(p => p.type === "pcb_via")
    via.source_net_id = "net_USB_DM_SWITCH"
    const result = auditUsbRouting(f.circuit, f.generated, packet)
    expect(result.ok).toBe(false)
    expect(result.problems.some(p => p.includes("native barrel missing"))).toBe(true)
    expect(result.problems.some(p => p.includes("continuity missing"))).toBe(true)
  })
  test("native endpoint identity is checked independently from coordinate agreement", () => {
    const f = fixture(), trace: any = f.circuit.find(p => p.type === "pcb_trace")
    trace.route[0].start_pcb_port_id = "wrong_port"
    const result = auditUsbRouting(f.circuit, f.generated, packet)
    expect(result.problems.some(p => p.includes("endpoint/net continuity"))).toBe(true)
  })
})
