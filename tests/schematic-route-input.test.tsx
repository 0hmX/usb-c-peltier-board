import { expect, test } from "bun:test"
import { TPS259470ARPWR } from "../src/parts/C3662799"
import { Circuit } from "@tscircuit/core"
import { SchematicTracePipelineSolver } from "@tscircuit/schematic-trace-solver"
import { installSchematicRouteInput } from "../src/schematic-route-input"

function fixture() {
  return new SchematicTracePipelineSolver({
    chips: [..."abcdef"].map((pinId, i) => ({
      chipId: `chip${i}`, center: { x: i * 3, y: 0 }, width: 1, height: 1,
      pins: [{ pinId, x: i * 3, y: 1 }],
    })),
    // Merging these three initial groups leaves aliases in core's map.
    directConnections: [["d", "c"], ["f", "b"], ["e", "a"], ["b", "e"], ["c", "a"]]
      .map(pinIds => ({ pinIds: pinIds as [string, string] })),
    netConnections: [{ netId: "N", pinIds: [..."abcdef"] }],
  })
}
function finishMsp(solver: SchematicTracePipelineSolver) {
  for (let i = 0; i < 100 && solver.currentPipelineStepIndex === 0; i++) solver.step()
  expect(solver.currentPipelineStepIndex).toBe(1)
}

test("public solver hook repairs the merge order without changing edges", () => {
  expect(() => finishMsp(fixture())).toThrow("Duplicate pinId detected")
  const circuit = new Circuit()
  const receipts = installSchematicRouteInput(circuit)
  expect(installSchematicRouteInput(circuit)).toBe(receipts)
  const solver = fixture()
  const input = solver.getConstructorParams()[0]
  const edges = [...input.directConnections]
  const before = structuredClone(input)
  const emit = () => circuit.emit("solver:started", {
    type: "solver:started", solverName: "SchematicTracePipelineSolver", solverParams: input,
  })
  emit()
  expect(input.directConnections).toHaveLength(edges.length)
  expect(edges.every(edge => input.directConnections.includes(edge))).toBe(true)
  expect({ ...input, directConnections: edges }).toEqual(before)
  expect(receipts[0]!.repairedOrder).toEqual([0, 4, 2, 3, 1])
  const repaired = [...input.directConnections]
  emit()
  expect(input.directConnections).toEqual(repaired)
  expect(receipts[1]!.changed).toBe(false)
  finishMsp(solver)
})

test("only the schematic solver is changed and conflicting pin positions fail", () => {
  const circuit = new Circuit()
  const receipts = installSchematicRouteInput(circuit)
  const input = fixture().getConstructorParams()[0]
  const before = structuredClone(input)
  circuit.emit("solver:started", { type: "solver:started", solverName: "OtherSolver", solverParams: input })
  expect(input).toEqual(before)
  expect(receipts).toHaveLength(0)
  const pin = input.chips[0]!.pins[0]!
  input.chips[0]!.pins.push({ ...pin, x: pin.x + 1 })
  const conflict = structuredClone(input)
  expect(() => circuit.emit("solver:started", {
    type: "solver:started", solverName: "SchematicTracePipelineSolver", solverParams: input,
  })).toThrow("Conflicting schematic positions for a")
  expect(input).toEqual(conflict)
  expect(receipts).toHaveLength(0)
})


test("AUXOFF display correction preserves source and PCB identities and is part-specific", () => {
  const render = (install: boolean) => {
    const circuit = new Circuit()
    if (install) installSchematicRouteInput(circuit)
    circuit.add(<board width={30} height={10} schLayout={{ layoutMode: "none" }}>
      <TPS259470ARPWR name="U1" pcbX={-5} schX={-5} />
      <TPS259470ARPWR name="U2" manufacturerPartNumber="OTHER" pcbX={0} schX={0} />
      <TPS259470ARPWR name="U3" supplierPartNumbers={{ jlcpcb: ["OTHER"] }} pcbX={5} schX={5} />
    </board>)
    const stop = new Error("Stop before PCB routing")
    circuit.on("renderable:renderLifecycle:PcbManualTraceRender:start", () => { throw stop })
    try { circuit.render() } catch (error) { if (error !== stop) throw error }
    return circuit
  }
  const original = render(false), corrected = render(true)
  const physicalAndSource = (circuit: Circuit) => circuit.db.toArray().filter(record =>
    record.type.startsWith("source_") || record.type.startsWith("pcb_"))
  expect(physicalAndSource(corrected)).toEqual(physicalAndSource(original))
  for (const component of corrected.db.source_component.list()) {
    const sourcePort = corrected.db.source_port.list().find(port =>
      port.source_component_id === component.source_component_id && port.pin_number === 3)!
    expect(sourcePort.port_hints).toContain("PG")
    expect(sourcePort.port_hints).toContain("AUXOFF")
    const port = corrected.db.schematic_port.list().find(port => port.source_port_id === sourcePort.source_port_id)!
    const schematic = corrected.db.schematic_component.get(port.schematic_component_id!)!
    const expected = component.name === "U1" ? "AUXOFF" : "PG"
    expect(port.display_pin_label).toBe(expected)
    expect(schematic.port_labels?.pin3).toBe(expected)
    expect(schematic.port_labels?.pin4).toBe("N_FLT")
  }
})
