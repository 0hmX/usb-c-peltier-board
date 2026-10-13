import { describe, expect, test } from "bun:test"
import { auditKelvinRouting } from "../scripts/audit-kelvin-routing"

type Point = { x: number; y: number }
const net = "TEC_INDUCTOR_OUT", connectivityKey = "kelvin-fixture"
const layers = ["top", "inner1", "inner2", "bottom"]

function trace(id: string, points: Point[], layer = "top", width = .2): any[] {
  return [
    { type: "source_trace", source_trace_id: `source_${id}`, name: id, subcircuit_connectivity_map_key: connectivityKey },
    { type: "pcb_trace", pcb_trace_id: id, source_trace_id: `source_${id}`,
      route: points.map(point => ({ ...point, route_type: "wire", width, layer })) },
  ]
}

function fixture() {
  const circuit: any[] = [{ type: "source_net", source_net_id: "net", name: net,
    subcircuit_connectivity_map_key: connectivityKey }]
  for (const [index, name, y] of [[0, "R20", 0], [1, "R25", 4]] as const) {
    circuit.push(
      { type: "source_component", source_component_id: `component${index}`, name },
      { type: "source_port", source_port_id: `source_port${index}`, source_component_id: `component${index}`,
        pin_number: 1, subcircuit_connectivity_map_key: connectivityKey },
      { type: "pcb_port", pcb_port_id: `port${index}`, source_port_id: `source_port${index}`, x: 0, y, layers: ["top"] },
      { type: "pcb_smtpad", pcb_smtpad_id: `pad${index}`, pcb_port_id: `port${index}`,
        layer: "top", shape: "rect", x: 0, y, width: 1, height: 1 },
    )
  }
  const paths = [
    [{ x: 0, y: 0 }, { x: 2, y: 0 }],
    [{ x: 2, y: 0 }, { x: 2, y: 4 }],
    [{ x: 2, y: 4 }, { x: 0, y: 4 }],
  ]
  paths.forEach((points, index) => circuit.push(...trace(`T${index}`, points, index === 1 ? "bottom" : "top")))
  for (const [index, y] of [[0, 0], [1, 4]]) circuit.push({ type: "pcb_via", pcb_via_id: `via${index}`,
    x: 2, y, outer_diameter: .7, hole_diameter: .3, layers, source_net_id: "net" })
  const packet = {
    shuntKelvin: {
      paths: paths.map((points, index) => ({ id: `K${index}`, net, layer: index === 1 ? "bottom" : "top", width: .2, points })),
      vias: [{ name: "A", net, x: 2, y: 0 }, { name: "B", net, x: 2, y: 4 }],
      branches: [{ from: "R20.pin1", to: "R25.pin1", pathIds: ["K0", "K1", "K2"],
        viaNames: ["A", "B"], totalLengthMm: 8, sourceEscapeLengthMm: 2 }],
    },
    viaArrays: [],
  }
  return { circuit, packet }
}

function arrayFixture() {
  const { circuit } = fixture()
  circuit.push({ type: "pcb_via", pcb_via_id: "array-extra", x: 3, y: 0,
    outer_diameter: .7, hole_diameter: .3, layers, source_net_id: "net" },
    ...trace("ARRAY_TOP", [{ x: 2, y: 0 }, { x: 3, y: 0 }]))
  return {
    circuit,
    // These tests isolate the array subsection; absence of Kelvin intent must
    // still make the complete audit fail, independently of array correctness.
    packet: { shuntKelvin: { paths: [], vias: [], branches: [] },
      viaArrays: [{ id: "A", net, points: [{ x: 2, y: 0 }, { x: 3, y: 0 }] }] },
  }
}

describe("finite-copper Kelvin independence", () => {
  test("accepts a continuous branch through actual drilled annuli", () => {
    const { circuit, packet } = fixture()
    const result = auditKelvinRouting(circuit, { traces: [] }, packet)
    expect(result.passed).toBe(true)
    expect(result.matches).toHaveLength(3)
    expect(result.kelvinBarrelContacts.every(via => via.passed)).toBe(true)
    expect(result.branchContinuity.every((branch: any) => branch.passed)).toBe(true)
    expect(result.actualBranches[0].actualLengthMm).toBeCloseTo(8)
  })

  test("rejects auxiliary reuse of a same-net Kelvin barrel and identifies its endpoints", () => {
    const { circuit, packet } = fixture()
    circuit.push(...trace("AUX", [{ x: 2, y: 0 }, { x: 4, y: 0 }]))
    const result = auditKelvinRouting(circuit, { traces: [{ name: "AUX", from: "A.top", to: "R224.pin1" }] }, packet)
    expect(result.passed).toBe(false)
    expect(result.independenceViolations.some(contact => contact.other.generatedEndpoints?.to === "R224.pin1")).toBe(true)
    expect(result.independenceViolations.some(contact => contact.kelvin.kind === "pcb_via")).toBe(true)
  })

  test("allows shared power copper confined to the actual shunt solder land", () => {
    const { circuit, packet } = fixture()
    circuit.push(...trace("LOAD", [{ x: 0, y: 0 }, { x: -2, y: 0 }]))
    const result = auditKelvinRouting(circuit, { traces: [] }, packet)
    expect(result.passed).toBe(true)
    expect(result.independenceViolations).toHaveLength(0)
  })

  test("rejects finite-width overlap even when the two centerlines never cross", () => {
    const { circuit, packet } = fixture()
    // Parallel centerlines have a 0.29 mm gap, but their half-widths total
    // 0.30 mm, producing genuine copper overlap outside the source pad.
    circuit.push(...trace("WIDE_AUX", [{ x: .8, y: .29 }, { x: 1.5, y: .29 }], "top", .4))
    const result = auditKelvinRouting(circuit, { traces: [] }, packet)
    expect(result.passed).toBe(false)
    expect(result.independenceViolations.some(contact => contact.outsideAllowedShuntLandAreaMm2 > 1e-6)).toBe(true)
  })
})

describe("parallel power-array participation", () => {
  test("rejects a member connected on top but missing a bottom connection", () => {
    const { circuit, packet } = arrayFixture()
    const result = auditKelvinRouting(circuit, { traces: [] }, packet)
    const array = result.powerArrays[0]
    expect(array.passed).toBe(false)
    expect(array.members[1].sides.find((side: any) => side.layer === "top").passed).toBe(true)
    expect(array.members[1].sides.find((side: any) => side.layer === "bottom").passed).toBe(false)
  })

  test("accepts each member when both surfaces have finite connections to the power network", () => {
    const { circuit, packet } = arrayFixture()
    circuit.push(...trace("ARRAY_BOTTOM", [{ x: 2, y: 0 }, { x: 3, y: 0 }], "bottom"))
    const result = auditKelvinRouting(circuit, { traces: [] }, packet)
    expect(result.powerArrays[0].passed).toBe(true)
    expect(result.powerArrays[0].members.every((member: any) => member.sides.every((side: any) => side.passed))).toBe(true)
  })
})
