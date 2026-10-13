import { beforeAll, describe, expect, test } from "bun:test"
import { Circuit } from "tscircuit"
import { boardFixture } from "./fixtures"

let circuit: InstanceType<typeof Circuit>
const roots = new Map<string, string>()
function root(id: string): string {
  const parent = roots.get(id)
  if (!parent || parent === id) return id
  const result = root(parent)
  roots.set(id, result)
  return result
}

beforeAll(async () => {
  circuit = await boardFixture()
  // Follow source wiring transitively so an accidental port-to-port or
  // net-to-net bridge cannot hide behind otherwise correct named connections.
  const join = (ids: string[]) => {
    if (!ids.length) return
    const first = root(ids[0]!)
    for (const id of ids.slice(1)) roots.set(root(id), first)
  }
  for (const trace of circuit.db.source_trace.list())
    join([...trace.connected_source_port_ids, ...trace.connected_source_net_ids])
  for (const part of circuit.db.source_component.list())
    for (const ports of part.internally_connected_source_port_ids ?? []) join(ports)
}, 15_000)

function component(name: string) {
  const part = circuit.db.source_component.list().find(item => item.name === name)
  if (!part) throw new Error(`Missing component ${name}`)
  return part
}

function pinNet(name: string, pin: number) {
  const port = circuit.db.source_port.list().find(item =>
    item.source_component_id === component(name).source_component_id && item.pin_number === pin)
  if (!port) throw new Error(`Missing physical pin ${name}.${pin}`)
  const nets = circuit.db.source_net.list().filter(net =>
    root(net.source_net_id) === root(port.source_port_id))
  if (nets.length > 1) throw new Error(`Conflicting nets on ${name}.${pin}: ${nets.map(net => net.name)}`)
  return nets[0]?.name
}

function resistance(name: string) {
  const part = component(name)
  if (!("resistance" in part)) throw new Error(`Missing resistance for ${name}`)
  return Number(part.resistance)
}

function directCapacitance(rail: string) {
  return circuit.db.source_component.list().reduce((sum, part) => {
    if (!("capacitance" in part)) return sum
    const nets = [pinNet(part.name, 1), pinNet(part.name, 2)]
    return nets.includes(rail) && nets.includes("GND")
      ? sum + Number(part.capacitance) : sum
  }, 0)
}

describe("general USB-C PD Peltier driver", () => {
  test("every placed part is sourced, with an error-free, unrouted and separated placement", () => {
    const parts = circuit.db.source_component.list()
    const purchased = parts.filter(part => !(part.ftype === "simple_test_point" &&
      "footprint_variant" in part && part.footprint_variant === "pad"))
    expect(purchased.filter(part => !part.manufacturer_part_number ||
      !part.supplier_part_numbers?.jlcpcb?.some(number => /^C\d+$/.test(number))).map(part => part.name)).toEqual([])
    expect(circuit.db.pcb_trace.list()).toHaveLength(0)
    expect(circuit.db.pcb_via.list()).toHaveLength(0)
    expect(circuit.getCircuitJson().filter(item => item.type.endsWith("_error")).map(item =>
      "message" in item ? item.message : item.type)).toEqual([])

    const board = circuit.db.pcb_board.list()[0]!
    if (!board.width || !board.height) throw new Error("Missing rectangular board dimensions")
    const width = board.width, height = board.height
    const placed = circuit.db.pcb_component.list().filter(part => !part.do_not_place)
    const nameOf = (id: string) => parts.find(part => part.source_component_id === id)?.name ?? id
    const outOfBounds = placed.filter(part =>
      Math.abs(part.center.x - board.center.x) + part.width / 2 > width / 2 + 0.01 ||
      Math.abs(part.center.y - board.center.y) + part.height / 2 > height / 2 + 0.01)
    expect(outOfBounds.map(part => nameOf(part.source_component_id))).toEqual([])
    const overlaps: string[] = []
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const a = placed[i]!, b = placed[j]!
        if (a.layer === b.layer &&
          Math.abs(a.center.x - b.center.x) < (a.width + b.width) / 2 - 0.01 &&
          Math.abs(a.center.y - b.center.y) < (a.height + b.height) / 2 - 0.01) {
          overlaps.push(`${nameOf(a.source_component_id)} / ${nameOf(b.source_component_id)}`)
        }
      }
    }
    expect(overlaps).toEqual([])
  })

  test("20 V / 5 A PD qualification is the only input to the load converter", () => {
    // Count the complete directly exposed capacitor bank, rather than one
    // designator: USB-C legacy attachment allows at most 10uF on raw VBUS.
    const rawCapacitanceF = directCapacitance("VBUS_RAW")
    expect(rawCapacitanceF).toBeGreaterThan(0)
    expect(rawCapacitanceF * 1.2).toBeLessThanOrEqual(10e-6)
    expect(component("J_USB").manufacturer_part_number).toBe("USB4085-GF-A")
    for (const pin of [1, 2, 5, 23]) expect(pinNet("U_PD", pin)).toBe("PD_3V3")
    expect(pinNet("U_PD", 6)).toBe("GND")
    expect(pinNet("U_PD", 18)).toBe("VBUS_RAW")
    for (const pin of [16, 17]) expect(pinNet("U_PD", pin)).toBeUndefined()
    expect(pinNet("J_USB", 1)).toBe("CC1")
    expect(pinNet("J_USB", 14)).toBe("CC2")
    for (const pin of [3, 7, 10, 15]) expect(pinNet("J_USB", pin)).toBe("VBUS_RAW")
    for (const name of ["Q_INPUT", "Q_REVERSE"]) {
      for (const pin of [1, 2, 3]) expect(pinNet(name, pin)).toBe("PFET_SOURCE")
      expect(pinNet(name, 4)).toBe("PD_GATE")
    }
    for (const pin of [5, 6, 7, 8]) {
      expect(pinNet("Q_INPUT", pin)).toBe("VBUS_RAW")
      expect(pinNet("Q_REVERSE", pin)).toBe("VBUS_QUALIFIED")
    }
    expect(pinNet("U_DRIVER", 7)).toBe("VBUS_QUALIFIED")
    expect(pinNet("R_DC_SENSE", 1)).toBe("VBUS_QUALIFIED")
    expect(pinNet("R_DC_SENSE", 2)).toBe("PD_VDC_OUT")
    expect(pinNet("U_PD", 11)).toBe("PD_VDC_OUT")
    expect(pinNet("J_TEC", 1)).toBe("TEC_POS")
    expect(pinNet("J_TEC", 2)).toBe("GND")
  })

  test("the hardware CC loop measures a series shunt and the converter has both bootstrap paths", () => {
    expect(component("U_DRIVER").manufacturer_part_number).toBe("TPS55289RYQR")
    expect(resistance("R_SENSE")).toBeCloseTo(0.01, 6)
    expect(pinNet("U_DRIVER", 11)).toBe("DRIVER_OUT")
    expect(pinNet("R_SENSE", 1)).toBe("DRIVER_OUT")
    expect(pinNet("R_SENSE", 2)).toBe("TEC_POS")
    for (const [name, rail, sense, pin] of [
      ["R_ISP_FILTER", "DRIVER_OUT", "DRIVER_ISP", 12],
      ["R_ISN_FILTER", "TEC_POS", "DRIVER_ISN", 13],
    ] as const) {
      expect(resistance(name)).toBe(10)
      expect(pinNet(name, 1)).toBe(rail)
      expect(pinNet(name, 2)).toBe(sense)
      expect(pinNet("U_DRIVER", pin)).toBe(sense)
    }
    expect(pinNet("C_CURRENT_FILTER", 1)).toBe("DRIVER_ISP")
    expect(pinNet("C_CURRENT_FILTER", 2)).toBe("DRIVER_ISN")
    expect(pinNet("L_OUT", 1)).toBe("DRIVER_SW1")
    expect(pinNet("L_OUT", 2)).toBe("DRIVER_SW2")
    for (const [name, bootPin, switchPin, bootNet, switchNet] of [
      ["C_DRIVER_BOOT1", 20, 8, "DRIVER_BOOT1", "DRIVER_SW1"],
      ["C_DRIVER_BOOT2", 19, 10, "DRIVER_BOOT2", "DRIVER_SW2"],
    ] as const) {
      expect(pinNet("U_DRIVER", bootPin)).toBe(bootNet)
      expect(pinNet("U_DRIVER", switchPin)).toBe(switchNet)
      expect(pinNet(name, 1)).toBe(bootNet)
      expect(pinNet(name, 2)).toBe(switchNet)
    }
    expect(pinNet("U_DRIVER", 2)).toBe("GND") // Physical address strap: 0x75.
    expect(pinNet("U_DRIVER", 15)).toBe("DRIVER_COMP")
    expect(pinNet("R_COMP", 1)).toBe("DRIVER_COMP")
    expect(pinNet("R_COMP", 2)).toBe("DRIVER_COMP_ZERO")
    expect(pinNet("C_COMP_ZERO", 1)).toBe("DRIVER_COMP_ZERO")
    expect(pinNet("C_COMP_ZERO", 2)).toBe("GND")
    expect(pinNet("C_COMP_POLE", 1)).toBe("DRIVER_COMP")
    expect(pinNet("C_COMP_POLE", 2)).toBe("GND")
  })

  test("reset and PD fault independently disable output while live logic has a 5 V driver bias", () => {
    expect(pinNet("U_DRIVER", 1)).toBe("DRIVER_ENABLE")
    expect(pinNet("R_DRIVER_EN_TOP", 1)).toBe("VBUS_QUALIFIED")
    expect(pinNet("R_DRIVER_EN_TOP", 2)).toBe("DRIVER_ENABLE")
    expect(pinNet("R_DRIVER_EN_BOTTOM", 1)).toBe("DRIVER_ENABLE")
    expect(pinNet("R_DRIVER_EN_BOTTOM", 2)).toBe("GND")
    const uvlo = 1.23 * (1 + resistance("R_DRIVER_EN_TOP") / resistance("R_DRIVER_EN_BOTTOM"))
    expect(uvlo).toBeGreaterThan(16)
    expect(uvlo).toBeLessThan(18.5)
    expect(pinNet("R_KILL_RESET", 1)).toBe("LOGIC_5V")
    expect(pinNet("R_KILL_RESET", 2)).toBe("DRIVER_KILL_BASE")
    expect(resistance("R_KILL_RESET")).toBe(47_000)
    expect(pinNet("U_MCU", 15)).toBe("MCU_DRIVER_PERMISSION")
    expect(pinNet("U_MCU", 9)).toBeUndefined() // ROM USART2 TX must never release the load.
    expect(pinNet("R_KILL_DRIVE", 1)).toBe("MCU_DRIVER_PERMISSION")
    expect(pinNet("R_KILL_DRIVE", 2)).toBe("DRIVER_RELEASE_GATE")
    expect(resistance("R_KILL_DRIVE")).toBe(1_000)
    // The permission MOSFET defaults off even when the MCU's 3V3 rail fails.
    expect(pinNet("R_RELEASE_OFF", 1)).toBe("DRIVER_RELEASE_GATE")
    expect(pinNet("R_RELEASE_OFF", 2)).toBe("GND")
    expect(resistance("R_RELEASE_OFF")).toBe(100_000)
    expect(pinNet("Q_MCU_RELEASE", 1)).toBe("DRIVER_RELEASE_GATE")
    expect(pinNet("Q_MCU_RELEASE", 2)).toBe("GND")
    expect(pinNet("Q_MCU_RELEASE", 3)).toBe("DRIVER_KILL_BASE")
    for (const [name, base] of [["Q_MCU_KILL", "DRIVER_KILL_BASE"], ["Q_PD_FAULT", "PD_FAULT_BASE"]]) {
      expect(pinNet(name!, 1)).toBe(base)
      expect(pinNet(name!, 2)).toBe("GND")
      expect(pinNet(name!, 3)).toBe("DRIVER_ENABLE")
    }
    expect(pinNet("U_PD", 9)).toBe("PD_FAULT")
    expect(pinNet("R_FAULT_BASE", 1)).toBe("PD_FAULT")
    expect(pinNet("R_FAULT_BASE", 2)).toBe("PD_FAULT_BASE")

    // A fixed 3.3 V SKU here would not supply the driver's required external bias.
    expect(component("U_AUX").manufacturer_part_number).toBe("LMR50410Y5FQDBVRQ1")
    expect(pinNet("U_AUX", 5)).toBe("VBUS_RAW")
    expect(pinNet("U_AUX", 3)).toBe("AUX_5V")
    expect(pinNet("L_AUX", 2)).toBe("AUX_5V")
    expect(pinNet("U_DRIVER", 18)).toBe("LOGIC_5V")
    expect(pinNet("U_DRIVER", 21)).toBe("GND")
    expect(pinNet("U_CTRL_LDO", 1)).toBe("LOGIC_5V")
    expect(pinNet("U_CTRL_LDO", 3)).toBe("LOGIC_5V")
    expect(pinNet("U_CTRL_LDO", 5)).toBe("CTRL_3V3")
    expect(pinNet("U_MCU", 4)).toBe("CTRL_3V3")
    expect(pinNet("U_MCU", 5)).toBe("GND")
    expect(pinNet("R_SCL", 1)).toBe("CTRL_3V3")
    expect(pinNet("R_SDA", 1)).toBe("CTRL_3V3")
    expect(pinNet("U_MCU", 30)).toBe("I2C_SCL")
    expect(pinNet("U_MCU", 31)).toBe("I2C_SDA")
    // ADC conversion factors must describe the installed sense network.
    for (const [top, bottom, rail, sense, pin, topOhms, bottomOhms] of [
      ["R_V_ADC_TOP", "R_V_ADC_BOTTOM", "TEC_POS", "OUTPUT_VOLTAGE_ADC", 8, 100_000, 20_000],
      ["R_PD_ADC_TOP", "R_PD_ADC_BOTTOM", "VBUS_QUALIFIED", "INPUT_VOLTAGE_ADC", 10, 150_000, 22_000],
    ] as const) {
      expect(resistance(top)).toBe(topOhms)
      expect(resistance(bottom)).toBe(bottomOhms)
      expect(pinNet(top, 1)).toBe(rail)
      expect(pinNet(top, 2)).toBe(sense)
      expect(pinNet(bottom, 1)).toBe(sense)
      expect(pinNet(bottom, 2)).toBe("GND")
      expect(pinNet("U_MCU", pin)).toBe(sense)
    }
    expect(pinNet("R_I_ADC", 1)).toBe("DRIVER_CURRENT_MONITOR")
    expect(pinNet("R_I_ADC", 2)).toBe("OUTPUT_CURRENT_ADC")
    expect(pinNet("U_MCU", 7)).toBe("OUTPUT_CURRENT_ADC")
  })

  test("programming USB powers logic through a reverse-blocking mux and exposes real recovery pads", () => {
    expect(component("U_MCU").manufacturer_part_number).toBe("STM32G0B1KBT6")
    expect(component("U_LOGIC_MUX").manufacturer_part_number).toBe("TPS2116DRLR")
    expect(directCapacitance("PROGRAM_VBUS")).toBeGreaterThan(0)
    expect(directCapacitance("PROGRAM_VBUS") * 1.2).toBeLessThanOrEqual(10e-6)
    for (const [name, net, pin] of [
      ["R_PROGRAM_CC1", "PROGRAM_CC1", 1], ["R_PROGRAM_CC2", "PROGRAM_CC2", 14],
    ] as const) {
      expect(resistance(name)).toBe(5_100)
      expect(pinNet(name, 1)).toBe(net)
      expect(pinNet(name, 2)).toBe("GND")
      expect(pinNet("J_PROGRAM", pin)).toBe(net)
    }
    for (const pin of [3, 7, 10, 15]) expect(pinNet("J_PROGRAM", pin)).toBe("PROGRAM_VBUS")
    for (const [connectorPins, mcuPin, esdPins, net] of [
      [[4, 13], 23, [3, 4], "PROGRAM_USB_DP"],
      [[5, 12], 22, [1, 6], "PROGRAM_USB_DM"],
    ] as const) {
      for (const pin of connectorPins) expect(pinNet("J_PROGRAM", pin)).toBe(net)
      for (const pin of esdPins) expect(pinNet("U_PROGRAM_ESD", pin)).toBe(net)
      expect(pinNet("U_MCU", mcuPin)).toBe(net)
    }
    for (const pin of [6, 11]) expect(pinNet("J_PROGRAM", pin)).toBeUndefined()
    for (const [pin, net] of [[1, "GND"], [2, "LOGIC_5V"], [3, "AUX_5V"],
      [4, "GND"], [5, "GND"], [6, "PROGRAM_VBUS"], [7, "LOGIC_5V"]] as const)
      expect(pinNet("U_LOGIC_MUX", pin)).toBe(net)
    // This ESD clamp must not steer self-powered ROM D+ into an unplugged PC VBUS.
    expect(pinNet("U_PROGRAM_ESD", 5)).toBe("LOGIC_5V")
    expect(pinNet("U_PROGRAM_ESD", 2)).toBe("GND")
    expect(pinNet("U_MCU", 11)).toBe("PROGRAM_VBUS_SENSE")
    expect(pinNet("R_PROGRAM_SENSE_TOP", 1)).toBe("PROGRAM_VBUS")
    expect(pinNet("R_PROGRAM_SENSE_TOP", 2)).toBe("PROGRAM_VBUS_SENSE")
    expect(resistance("R_PROGRAM_SENSE_TOP")).toBe(15_000)
    expect(resistance("R_PROGRAM_SENSE_BOTTOM")).toBe(20_000)
    expect(pinNet("R_BOOT0", 1)).toBe("SWCLK_BOOT0")
    expect(pinNet("R_BOOT0", 2)).toBe("GND")
    expect(pinNet("U_MCU", 24)).toBe("SWDIO")
    expect(pinNet("U_MCU", 25)).toBe("SWCLK_BOOT0")
    expect(pinNet("U_MCU", 6)).toBe("MCU_RESET")

    const probes = {
      TP_SWDIO: "SWDIO", TP_BOOT0: "SWCLK_BOOT0", TP_NRST: "MCU_RESET",
      TP_3V3: "CTRL_3V3", TP_GND: "GND", TP_RAW_PD: "VBUS_RAW", TP_QUAL_PD: "VBUS_QUALIFIED",
      TP_5V: "LOGIC_5V", TP_TEC: "TEC_POS", TP_OUT: "DRIVER_OUT", TP_EN: "DRIVER_ENABLE",
      TP_ISP: "DRIVER_ISP", TP_ISN: "DRIVER_ISN", TP_SCL: "I2C_SCL", TP_SDA: "I2C_SDA",
    }
    for (const [name, net] of Object.entries(probes)) {
      const source = component(name)
      expect(source.ftype).toBe("simple_test_point")
      const placed = circuit.db.pcb_component.list().find(part => part.source_component_id === source.source_component_id)!
      expect(placed.do_not_place).toBe(true)
      const pads = circuit.db.pcb_smtpad.list().filter(pad => pad.pcb_component_id === placed.pcb_component_id)
      expect(pads).toHaveLength(1)
      expect(pads[0]!.shape).toBe("circle")
      expect("radius" in pads[0]! && pads[0]!.radius).toBe(0.75)
      expect(pads[0]!.is_covered_with_solder_mask).toBe(false)
      expect(pinNet(name, 1)).toBe(net)
      const physicalPort = circuit.db.pcb_port.list().find(port => port.pcb_port_id === pads[0]!.pcb_port_id)!
      const sourcePort = circuit.db.source_port.list().find(port => port.source_port_id === physicalPort.source_port_id)!
      expect(sourcePort.source_component_id).toBe(source.source_component_id)
      expect(sourcePort.pin_number).toBe(1)
    }
    for (const [name, anode, cathode, drive, mcuPin] of [
      ["POWER", 1, 2, "CTRL_3V3", undefined],
      ["RUN", 2, 1, "LED_RUN_DRIVE", 16],
      ["FAULT", 1, 2, "LED_FAULT_DRIVE", 17],
    ] as const) {
      expect(pinNet(`LED_${name}`, anode)).toBe(`LED_${name}_ANODE`)
      expect(pinNet(`LED_${name}`, cathode)).toBe("GND")
      expect(pinNet(`R_LED_${name}`, 1)).toBe(drive)
      expect(pinNet(`R_LED_${name}`, 2)).toBe(`LED_${name}_ANODE`)
      expect(resistance(`R_LED_${name}`)).toBeGreaterThanOrEqual(1_000)
      if (mcuPin) expect(pinNet("U_MCU", mcuPin)).toBe(drive)
    }
  })
})
