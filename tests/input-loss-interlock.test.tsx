import { beforeAll, describe, expect, test } from "bun:test"
import { Circuit } from "tscircuit"
import { InputLossInterlock } from "../src/board/input-loss-interlock"
import { positionSchematic } from "../src/board/schematic"

type Device = { name: string; mpn: string; pin: Record<number, string> }
let devices: Device[]

beforeAll(async () => {
  const circuit = new Circuit()
  circuit.add(<board width={110} height={85} routingDisabled schematicDisabled>
    <net name="GND" isGroundNet />
    {positionSchematic(InputLossInterlock())}
  </board>)
  await circuit.renderUntilSettled()
  const records = circuit.getCircuitJson()
  const nets = records.filter(item => item.type === "source_net")
  devices = records.filter(item => item.type === "source_component").map(component => ({
    name: component.name!, mpn: "manufacturer_part_number" in component ? component.manufacturer_part_number ?? "" : "",
    pin: Object.fromEntries(records.filter(item => item.type === "source_port").filter(port => port.source_component_id === component.source_component_id)
      .map(port => [port.pin_number!, nets.find(net => net.subcircuit_connectivity_map_key === port.subcircuit_connectivity_map_key)?.name ?? "NC"])),
  }))
}, 30000)

/** Ideal logic models use the rendered pin/net graph, not the JSX connections.
 * They test edge/polarity/reset behavior; propagation, pulse widths, transistor
 * voltage margins and analogue startup still require routed-board validation.
 */
function simulator() {
  const levels: Record<string, boolean> = { V3V3: true, GND: false, INPUT_AUXOFF: false, RUN_CLK: false }
  const memory = new Map<string, { q: boolean; clock: boolean }>()
  let otherFault = false
  function settle() {
    for (let iteration = 0; iteration < 30; iteration++) {
      const before = JSON.stringify(levels)
      for (const device of devices) {
        const { mpn, pin } = device
        const read = (number: number) => levels[pin[number]!] ?? false
        const write = (number: number, value: boolean) => { if (pin[number] !== "NC") levels[pin[number]!] = value }
        if (mpn === "SN74LVC2G17DBVR") {
          write(6, read(1)); write(4, read(3))
        } else if (mpn === "DTC114EETL") {
          expect(read(2)).toBe(false)
          // Open-collector outputs have external pullups; INPUT_FAULT_N is
          // also wired-OR with the existing supervisor/thermal/PD sources.
          write(3, !(read(1) || (pin[3] === "INPUT_FAULT_N" && otherFault)))
        } else if (mpn === "SN74LVC1G74DCUR") {
          const state = memory.get(device.name) ?? { q: false, clock: false }
          if (!read(6)) state.q = false
          else if (!read(7)) state.q = true
          else if (!state.clock && read(1)) state.q = read(2)
          state.clock = read(1)
          memory.set(device.name, state)
          write(5, state.q); write(3, !state.q)
        }
      }
      if (JSON.stringify(levels) === before) return
    }
    throw new Error("Interlock did not settle")
  }
  settle()
  return {
    set(run: boolean, auxoff: boolean, externalFault = false) {
      levels.RUN_CLK = run
      levels.INPUT_AUXOFF = auxoff
      otherFault = externalFault
      settle()
      return !levels.INPUT_FAULT_N
    },
  }
}

describe("eFuse input-loss hardware latch", () => {
  test("inrush's initially low AUXOFF does not deadlock startup", () => {
    const sim = simulator()
    expect(sim.set(false, false)).toBe(false)
    expect(sim.set(true, false)).toBe(false)
    expect(sim.set(true, true)).toBe(false)
  })

  test("a running OVLO event remains latched through input recovery and chatter", () => {
    const sim = simulator()
    sim.set(true, false)
    sim.set(true, true)
    expect(sim.set(true, false)).toBe(true)
    for (const auxoff of [true, false, true, true, false, true]) {
      expect(sim.set(true, auxoff)).toBe(true)
    }
  })

  test("RUN low clears the fault and a deliberate second startup succeeds", () => {
    const sim = simulator()
    sim.set(true, true)
    sim.set(true, false)
    expect(sim.set(false, false)).toBe(false)
    expect(sim.set(true, false)).toBe(false)
    expect(sim.set(true, true)).toBe(false)
    expect(sim.set(true, false)).toBe(true)
  })

  test("intentional shutdown clears the latch regardless of AUXOFF edge order", () => {
    for (const auxFallsFirst of [false, true]) {
      const sim = simulator()
      sim.set(true, true)
      if (auxFallsFirst) expect(sim.set(true, false)).toBe(true)
      expect(sim.set(false, auxFallsFirst ? false : true)).toBe(false)
      expect(sim.set(false, false)).toBe(false)
    }
  })

  test("new fault output cannot mask the existing wired-OR faults", () => {
    const sim = simulator()
    expect(sim.set(true, true, true)).toBe(true)
    expect(sim.set(false, false, true)).toBe(true)
    expect(sim.set(false, false, false)).toBe(false)
  })
})
