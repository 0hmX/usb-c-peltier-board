import { expect, test } from "bun:test"
import { Circuit, type Port } from "@tscircuit/core"
import { Npn } from "../src/parts"
import { installSupplierPortAnchors, repairSymbolPortSelectors } from "../src/component-port-anchors"

function fixture(install = false) {
  const circuit = new Circuit()
  if (install) installSupplierPortAnchors(circuit)
  circuit.add(<board width={20} height={20} schematicDisabled>
    <Npn name="Q1" pcbX={0} pcbY={0} />
    <resistor name="R1" resistance="10k" footprint="0402" pcbX={5} pcbY={0} />
    <trace from="Q1.pin1" to="R1.pin1" />
    <trace from="Q1.pin2" to="net.GND" />
    <trace from="Q1.pin3" to="R1.pin2" />
  </board>)
  const stop = new Error("Stop before routing")
  circuit.on("renderable:renderLifecycle:PcbManualTraceRender:start", () => { throw stop })
  try { circuit.render() } catch (error) { if (error !== stop) throw error }
  return circuit
}

test("symbol PCB selectors resolve the original port without changing circuit records", () => {
  const circuit = fixture()
  const ports = circuit.selectAll("port") as Port[]
  const symbolPorts = ports.filter(port => port.parent?.componentName === "Symbol")
  const ordinary = ports.filter(port => port.parent?.componentName !== "Symbol")
  expect(symbolPorts).toHaveLength(3)
  for (const port of symbolPorts)
    expect(port.getSubcircuit().selectOne(port.getPortSelector(), { type: "port" })).toBeNull()
  const before = JSON.stringify(circuit.db.toArray())
  const ordinaryGetters = ordinary.map(port => port.getPortSelector)
  repairSymbolPortSelectors(circuit)
  expect(JSON.stringify(circuit.db.toArray())).toBe(before)
  for (const port of symbolPorts) {
    expect(port.getSubcircuit().selectAll(port.getPortSelector())).toEqual([port])
    expect(circuit.db.pcb_port.get(port.pcb_port_id!)!.source_port_id).toBe(port.source_port_id)
  }
  expect(ordinary.every((port, i) => port.getPortSelector === ordinaryGetters[i])).toBe(true)
  const getters = ports.map(port => port.getPortSelector)
  repairSymbolPortSelectors(circuit)
  expect(ports.every((port, i) => port.getPortSelector === getters[i])).toBe(true)
})

test("the public attachment lifecycle repairs selectors before routing", () => {
  for (const port of fixture(true).selectAll("port") as Port[])
    if (port.pcb_port_id)
      expect(port.getSubcircuit().selectOne(port.getPortSelector(), { type: "port" })).toBe(port)
})
