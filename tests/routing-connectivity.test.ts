import { describe, expect, test } from "bun:test"
import { auditRoutingConnectivity } from "../scripts/audit-routing-connectivity"
import { cleanupFloatingPours } from "../scripts/cleanup-floating-pours"

const ground = { type: "source_net", source_net_id: "g", name: "GND", subcircuit_connectivity_map_key: "g" }
const usb = { type: "source_net", source_net_id: "u", name: "USB_DP_SWITCH", subcircuit_connectivity_map_key: "u" }
const layers = ["top", "inner1", "inner2", "bottom"]

function pad(x: number, number: number): any[] {
  return [
    { type: "source_component", source_component_id: `s${number}`, name: `P${number}` },
    { type: "source_port", source_port_id: `p${number}`, source_component_id: `s${number}`, pin_number: 1, subcircuit_connectivity_map_key: "g" },
    { type: "pcb_port", pcb_port_id: `p${number}`, source_port_id: `p${number}`, layers: ["top"], x, y: 0 },
    { type: "pcb_smtpad", pcb_smtpad_id: `pad${number}`, pcb_port_id: `p${number}`, shape: "rect", layer: "top", x, y: 0, width: 0.6, height: 0.6 },
  ]
}

function wire(x1: number, x2: number, net = "g", layer = "top"): any {
  return { type: "pcb_trace", pcb_trace_id: `t${x1}`, source_net_id: net, route: [
    // Deliberately retain declared endpoint IDs even when coordinates disagree.
    { route_type: "wire", layer, x: x1, y: 0, width: 0.2, start_pcb_port_id: "p1" },
    { route_type: "wire", layer, x: x2, y: 0, width: 0.2, end_pcb_port_id: "p2" },
  ] }
}

function via(x: number, net = "g"): any {
  return { type: "pcb_via", pcb_via_id: `v${x}`, source_net_id: net, x, y: 0,
    hole_diameter: 0.3, outer_diameter: 0.7, layers }
}

function plane(left = -1, right = 5, layer = "inner1"): any {
  const inner_rings = layer === "bottom" ? [0, 4].filter(x => x > left && x < right).map(x => ({
    vertices: Array.from({ length: 128 }, (_, i) => ({ x: x + 0.6 * Math.cos(i * Math.PI / 64), y: 0.6 * Math.sin(i * Math.PI / 64) })),
  })) : []
  return { type: "pcb_copper_pour", pcb_copper_pour_id: `plane${left}`, source_net_id: "g", shape: "brep", layer,
    brep_shape: { outer_ring: { vertices: [
      { x: left, y: -1 }, { x: right, y: -1 }, { x: right, y: 1 }, { x: left, y: 1 },
    ] }, inner_rings } }
}

describe("floating pour cleanup", () => {
  test("removes a drill-split fill fragment while preserving attached copper", () => {
    const pour = plane(-1, 4, "top")
    const drill = { type: "pcb_hole", pcb_hole_id: "split", shape: "circle", x: 1.5, y: 0, hole_diameter: 2.1 }
    const initial = [ground, ...pad(0, 1), pour, drill]
    const result = cleanupFloatingPours(initial)
    expect(result.before.nets[0].componentCount).toBe(2)
    expect(result.removedComponents).toHaveLength(1)
    expect(result.removedComponents[0].pieces[0].elementId).toBe(pour.pcb_copper_pour_id)
    expect(result.after.passed).toBe(true)
    expect(result.circuit.filter(e => e.type !== "pcb_copper_pour")).toEqual(initial.filter(e => e.type !== "pcb_copper_pour"))
    const second = cleanupFloatingPours(result.circuit)
    expect(second.removedComponents).toHaveLength(0)
    expect(second.circuit).toEqual(result.circuit)
  })

  test("retains a disconnected pour island attached to a pad and keeps the failure", () => {
    const initial = [ground, ...pad(0, 1), ...pad(4, 2), plane(-1, 1, "top"), plane(3, 5, "top")]
    const result = cleanupFloatingPours(initial)
    expect(result.removedComponents).toHaveLength(0)
    expect(result.circuit).toEqual(initial)
    expect(result.after.passed).toBe(false)
    expect(result.after.nets[0].componentCount).toBe(2)
  })
})

describe("physical routing connectivity", () => {
  test("rejects endpoint metadata claiming a connection across a copper gap", () => {
    const result = auditRoutingConnectivity([ground, ...pad(0, 1), ...pad(4, 2), wire(0, 0.5)])
    expect(result.passed).toBe(false)
    expect(result.nets[0].componentCount).toBe(2)
    expect(result.nets[0].disconnectedPorts.map(p => p.selector)).toContain("P2.pin1")
  })

  test("accepts finite trace copper contacting both actual solder pads", () => {
    const result = auditRoutingConnectivity([ground, ...pad(0, 1), ...pad(4, 2), wire(0, 4)])
    expect(result.passed).toBe(true)
    expect(result.nets[0].componentCount).toBe(1)
    expect(result.nets[0].ports.every(p => p.contacts.some(c => c.contactAreaMm2 > 1e-6))).toBe(true)
  })

  test("joins surface branches through actual plated barrels and inner-layer pour", () => {
    const result = auditRoutingConnectivity([ground, ...pad(0, 1), ...pad(4, 2), wire(0, 1), wire(3, 4), via(1), via(3), plane()])
    expect(result.passed).toBe(true)
    expect(result.barrelContacts).toHaveLength(2)
    expect(result.planeContacts).toHaveLength(2)
    expect(result.planeContacts.every(c => c.contactAreaMm2 > 1e-6)).toBe(true)
  })

  test("same source net IDs do not join physically disconnected barrels", () => {
    const result = auditRoutingConnectivity([ground, ...pad(0, 1), ...pad(4, 2), wire(0, 1), wire(3, 4), via(1), via(3)])
    expect(result.passed).toBe(false)
    expect(result.nets[0].componentCount).toBe(2)
  })

  test("a drill void cutting a trace splits its physical connectivity", () => {
    const hole = { type: "pcb_hole", pcb_hole_id: "cut", hole_shape: "circle", hole_diameter: 1, x: 2, y: 0 }
    const result = auditRoutingConnectivity([ground, ...pad(0, 1), ...pad(4, 2), wire(0, 4), hole])
    expect(result.passed).toBe(false)
    expect(result.nets[0].componentCount).toBe(2)
    expect(result.unsupported).toHaveLength(0)
  })
})

describe("USB bottom reference coverage", () => {
  const signal = [wire(0, 4, "u", "inner2"), via(0, "u"), via(4, "u")]

  test("covers the whole inner2 signal projection with continuous actual bottom copper", () => {
    const audit = auditRoutingConnectivity([ground, usb, ...signal, plane(-1, 5, "bottom")])
    const result = audit.usbBottomReference
    expect(audit.shorts).toHaveLength(0)
    expect(audit.passed).toBe(true)
    expect(result.applicable).toBe(true)
    expect(result.passed).toBe(true)
    expect(result.traces[0].excludedTransitionAntipads).toHaveLength(2)
  })

  test("rejects a split reference despite both pour islands having the GND label", () => {
    const result = auditRoutingConnectivity([ground, usb, ...signal, plane(-1, 1.9, "bottom"), plane(2.1, 5, "bottom")]).usbBottomReference
    expect(result.passed).toBe(false)
    expect(result.traces[0].segments[0].uncoveredAreaMm2).toBeGreaterThan(0.039)
    expect(result.traces[0].segments[0].uncoveredPolygons.length).toBeGreaterThan(0)
  })
})
