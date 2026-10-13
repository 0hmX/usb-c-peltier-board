import { describe, expect, test } from "bun:test"
import { Circuit } from "tscircuit"
import { StandardJstThermistorSide } from "../src/board/parts/StandardJstThermistorSide"
import { StandardJstFanSide } from "../src/board/parts/StandardJstFanSide"

async function fixture() {
  const circuit = new Circuit()
  circuit.pcbRoutingDisabled = true
  circuit.add(<board width={60} height={16} schematicDisabled>
    <StandardJstThermistorSide name="J_HOT" pcbX={0}
      connections={{ NTC: "net.HOT", GND: "net.GND" }} />
    <StandardJstThermistorSide name="J_COLD" pcbX={10}
      connections={{ NTC: "net.COLD", GND: "net.GND" }} />
    <StandardJstFanSide name="J_FAN" pcbX={20}
      connections={{ GND: "net.GND", V12: "net.FAN_12V", TACH: "net.TACH", PWM: "net.PWM" }} />
  </board>)
  await circuit.renderUntilSettled()
  return circuit
}

function expectPinMap(circuit: InstanceType<typeof Circuit>, name: string, expected: [number, string, string][]) {
  const component = circuit.db.source_component.list().find(component => component.name === name)!
  expect(component).toBeDefined()
  const ports = circuit.db.source_port.list()
    .filter(port => port.source_component_id === component.source_component_id)
    .sort((first, second) => first.pin_number! - second.pin_number!)
  expect(ports.map(port => [port.pin_number, port.name])).toEqual(
    expected.map(([pinNumber, signal]) => [pinNumber, signal]))
  for (const [pinNumber, signal, netName] of expected) {
    const port = ports.find(port => port.pin_number === pinNumber)!
    expect(port.port_hints).toContain(signal)
    expect(port.port_hints).toContain(`pin${pinNumber}`)
    const net = circuit.db.source_net.list().find(net => net.name === netName)!
    expect(net).toBeDefined()
    const traces = circuit.db.source_trace.list()
      .filter(trace => trace.connected_source_port_ids.includes(port.source_port_id))
    expect(traces).toHaveLength(1)
    expect(traces[0]!.connected_source_net_ids).toEqual([net.source_net_id])
    const pcbPorts = circuit.db.pcb_port.list()
      .filter(pcbPort => pcbPort.source_port_id === port.source_port_id)
    expect(pcbPorts).toHaveLength(1)
    const pads = circuit.db.pcb_smtpad.list()
      .filter(pad => pad.pcb_port_id === pcbPorts[0]!.pcb_port_id)
    expect(pads).toHaveLength(1)
    expect(pads[0]!.port_hints).toEqual([`pin${pinNumber}`])
  }
}

describe("JST thermistor and fan connectors", () => {
  test("thermistors preserve signal and ground on physical pins 1 and 2", async () => {
    const circuit = await fixture()
    expectPinMap(circuit, "J_HOT", [[1, "NTC", "HOT"], [2, "GND", "GND"]])
    expectPinMap(circuit, "J_COLD", [[1, "NTC", "COLD"], [2, "GND", "GND"]])
  })

  test("fan preserves ground, supply, tach and PWM on physical pins 1 through 4", async () => {
    expectPinMap(await fixture(), "J_FAN", [
      [1, "GND", "GND"], [2, "V12", "FAN_12V"], [3, "TACH", "TACH"], [4, "PWM", "PWM"],
    ])
  })

  test("all connectors retain real side-entry JST packages and CAD models", async () => {
    const circuit = await fixture()
    const components = circuit.db.source_component.list()
    expect(components.map(component => component.name).sort()).toEqual(["J_COLD", "J_FAN", "J_HOT"])
    expect(circuit.db.pcb_component.list()).toHaveLength(3)
    expect(circuit.db.cad_component.list()).toHaveLength(3)
    for (const component of components) {
      const pinCount = component.name === "J_FAN" ? 4 : 2
      const supplierId = pinCount === 4 ? "C160404" : "C160402"
      expect(component).toMatchObject({
        ftype: "simple_connector",
        standard: "jst_sh",
        pin_count: pinCount,
        manufacturer_part_number: `SM0${pinCount}B-SRSS-TB(LF)(SN)`,
        supplier_part_numbers: { jlcpcb: [supplierId] },
      })
      const pcb = circuit.db.pcb_component.list()
        .find(pcb => pcb.source_component_id === component.source_component_id)!
      expect(pcb).toBeDefined()
      expect(pcb.do_not_place).toBe(false)
      expect(pcb.cable_insertion_center!.y).toBeLessThan(pcb.center.y)
      const pads = circuit.db.pcb_smtpad.list()
        .filter(pad => pad.pcb_component_id === pcb.pcb_component_id)
      expect(pads).toHaveLength(pinCount + 2)
      expect(pads.filter(pad => pad.pcb_port_id)).toHaveLength(pinCount)
      expect(pads.filter(pad => !pad.pcb_port_id)).toHaveLength(2)
      const models = circuit.db.cad_component.list()
        .filter(model => model.source_component_id === component.source_component_id)
      expect(models).toHaveLength(1)
      const model = models[0]!
      expect(model.pcb_component_id).toBe(pcb.pcb_component_id)
      expect(model.model_obj_url).toContain(`https://modelcdn.tscircuit.com/easyeda_models/assets/${supplierId}.obj?`)
      expect(model.model_step_url).toContain(`https://modelcdn.tscircuit.com/easyeda_models/assets/${supplierId}.step?`)
      expect(model.rotation).toEqual({ x: 0, y: 0, z: 0 })
    }
  })
})
