import { beforeAll, describe, expect, test } from "bun:test"
import { Circuit } from "tscircuit"
import { Tec12706PdBoard } from "../src/board/tec1-12706"

let circuit: InstanceType<typeof Circuit>
beforeAll(async () => {
  circuit = new Circuit()
  circuit.add(<Tec12706PdBoard schematicDisabled />)
  await circuit.renderUntilSettled()
})

function pinNet(name: string, pin: number) {
  const component = circuit.db.source_component.list().find(item => item.name === name)!
  const port = circuit.db.source_port.list().find(item =>
    item.source_component_id === component.source_component_id && item.pin_number === pin)!
  const trace = circuit.db.source_trace.list().find(item =>
    item.connected_source_port_ids.includes(port.source_port_id))!
  return circuit.db.source_net.list().find(net => trace.connected_source_net_ids.includes(net.source_net_id))?.name
}

describe("one TEC1-12706 PD power adapter", () => {
  test("one 5 A USB input and one TEC output; no controller or service interfaces", () => {
    const parts = circuit.db.source_component.list()
    expect(parts.filter(item => item.name.startsWith("J_")).map(item => item.name).sort()).toEqual(["J_TEC", "J_USB"])
    expect(parts.filter(item => item.name.startsWith("U_")).map(item => item.name).sort()).toEqual(["U_BUCK", "U_PD"])
    expect(parts.find(item => item.name === "J_USB")?.manufacturer_part_number).toBe("USB4085-GF-A")
    expect(parts.length).toBeLessThan(35)
    expect(circuit.db.pcb_trace.list()).toHaveLength(0)
    expect(circuit.db.pcb_via.list()).toHaveLength(0)
    expect(circuit.getCircuitJson().filter(item => item.type.endsWith("_error"))).toHaveLength(0)
  })

  test("physical PD configuration requests 20 V and 5 A", () => {
    for (const pin of [1, 2, 5, 23]) expect(pinNet("U_PD", pin)).toBe("PD_3V3")
    expect(pinNet("U_PD", 6)).toBe("GND")
    expect(pinNet("U_PD", 18)).toBe("VBUS_RAW")
    for (const pin of [19, 22, 25]) expect(pinNet("U_PD", pin)).toBe("GND")
    expect(pinNet("J_USB", 1)).toBe("CC1")
    expect(pinNet("J_USB", 14)).toBe("CC2")
    for (const pin of [3, 7, 10, 15]) expect(pinNet("J_USB", pin)).toBe("VBUS_RAW")
  })

  test("common-source PFET pair and buck keep raw VBUS off the TEC terminal", () => {
    for (const name of ["Q_INPUT", "Q_REVERSE"]) {
      for (const pin of [1, 2, 3]) expect(pinNet(name, pin)).toBe("PFET_SOURCE")
      expect(pinNet(name, 4)).toBe("PD_GATE")
    }
    for (const pin of [5, 6, 7, 8]) {
      expect(pinNet("Q_INPUT", pin)).toBe("VBUS_RAW")
      expect(pinNet("Q_REVERSE", pin)).toBe("VBUS_QUALIFIED")
    }
    expect(pinNet("U_BUCK", 8)).toBe("VBUS_QUALIFIED")
    expect(pinNet("U_BUCK", 6)).toBe("BUCK_SW")
    expect(pinNet("L_OUT", 1)).toBe("BUCK_SW")
    expect(pinNet("L_OUT", 2)).toBe("V12_OUT")
    expect(pinNet("J_TEC", 1)).toBe("V12_OUT")
    expect(pinNet("J_TEC", 2)).toBe("GND")
  })

  test("PD fault clamps EN; physical feedback resistors set nominal 12 V", () => {
    expect(pinNet("U_PD", 9)).toBe("PD_FAULT")
    expect(pinNet("R_FAULT_BASE", 1)).toBe("PD_FAULT")
    expect(pinNet("R_FAULT_BASE", 2)).toBe("FAULT_BASE")
    expect(pinNet("Q_FAULT", 1)).toBe("FAULT_BASE")
    expect(pinNet("Q_FAULT", 2)).toBe("GND")
    expect(pinNet("Q_FAULT", 3)).toBe("BUCK_EN")
    expect(pinNet("U_BUCK", 1)).toBe("BUCK_EN")
    const parts = circuit.db.source_component.list()
    const top = parts.find(item => item.name === "R_FB_TOP")!
    const bottom = parts.find(item => item.name === "R_FB_BOTTOM")!
    if (!("resistance" in top) || !("resistance" in bottom)) throw new Error("Missing feedback resistors")
    expect(0.6 * (1 + Number(top.resistance) / Number(bottom.resistance))).toBeCloseTo(12.09, 2)
    expect(pinNet("R_FB_TOP", 1)).toBe("V12_OUT")
    expect(pinNet("R_FB_TOP", 2)).toBe("BUCK_FB")
    expect(pinNet("R_FB_BOTTOM", 1)).toBe("BUCK_FB")
    expect(pinNet("R_FB_BOTTOM", 2)).toBe("GND")
  })
})
