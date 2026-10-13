import { CYPD3177_24LQXQT } from "../../imports/CYPD3177_24LQXQT"
import { TPS56837RPAR } from "../../imports/TPS56837RPAR"
import { AO4407A } from "../../imports/AO4407A"
import { USB4085_GF_A } from "../../imports/USB4085_GF_A"
import { GRM32ER71E226KE15L } from "../../imports/GRM32ER71E226KE15L"
import { KF301_5_0_2P } from "../parts/C474881"
import { MMBT3904_RANGE_100_300_ } from "../parts/C20526"
import { CL32A106KBJNNNE } from "../parts/C380537"
import { GRM31CC72A475KE11L } from "../parts/C237304"
import { CC0603KRX7R9BB104 } from "../parts/C14663"
import { SRP1040VA_5R6M } from "./parts/SRP1040VA_5R6M"
import { passiveFootprint } from "./passive-footprint"

// One TEC1-12706. A fixed-voltage power adapter, not a thermostat.
export const design = {
  module: "TEC1-12706",
  moduleSource: "https://protosupplies.com/product/tec1-12706-thermoelectric-peltier-cooling-device/",
  inputVoltageV: 20,
  requestedCurrentA: 5,
  nominalOutputVoltageV: 0.6 * (1 + 383 / 20),
  targetOutputCurrentA: 6,
  switchingFrequencyHz: 500_000,
  inductanceH: 5.6e-6,
  boardWidthMm: 60,
  boardHeightMm: 40,
} as const

const pd = { schSheetName: "PD" }
const power = { schSheetName: "POWER" }
const resistors = [
  ["R_GATE", "1k", -9, 16, "PD_GATE_DRIVE", "PD_GATE", "PD"],
  ["R_GATE_OFF", "49.9k", -14, 16, "PFET_SOURCE", "PD_GATE", "PD"],
  ["R_DC_SENSE", "1k", -10, -1, "VBUS_QUALIFIED", "PD_VDC_OUT", "PD"],
  ["R_FAULT_BASE", "10k", -4, -3, "PD_FAULT", "FAULT_BASE", "POWER"],
  ["R_FAULT_OFF", "100k", -4, -6, "FAULT_BASE", "GND", "POWER"],
  // External UVLO rejects the initial 5 V and legacy non-PD sources.
  ["R_EN_TOP", "130k", 1, 0, "VBUS_QUALIFIED", "BUCK_EN", "POWER"],
  ["R_EN_BOTTOM", "10k", 1, -3, "BUCK_EN", "GND", "POWER"],
  // TI's 12 V / 500 kHz combination, datasheet table 7-2.
  ["R_FB_TOP", "383k", 8, 0, "V12_OUT", "BUCK_FB", "POWER"],
  ["R_FB_BOTTOM", "20k", 8, -3, "BUCK_FB", "GND", "POWER"],
  ["R_MODE", "10k", 1, 6, "BUCK_MODE", "GND", "POWER"],
] as const

export function Tec12706PdBoard({ schematicDisabled = false }: { schematicDisabled?: boolean } = {}) {
  return <board width={design.boardWidthMm} height={design.boardHeightMm} layers={4} thickness={1.6}
    title="TEC1-12706 · USB-C PD to 12 V · unrouted prototype"
    routingDisabled routeRemaining={false} schematicDisabled={schematicDisabled}
    schTraceAutoLabelEnabled schMaxTraceDistance={0.5}>
    <net name="GND" isGroundNet />
    <schematicsheet name="PD" displayName="100 W USB-C PD input" sheetIndex={1} />
    <schematicsheet name="POWER" displayName="12 V output for one TEC1-12706" sheetIndex={2} />
    <USB4085_GF_A name="J_USB" pcbX={-23} pcbY={0} pcbRotation={270} {...pd}
      connections={{ pin1: "net.CC1", pin14: "net.CC2",
        pin2: "net.GND", pin8: "net.GND", pin9: "net.GND", pin16: "net.GND", pin17: "net.GND",
        pin3: "net.VBUS_RAW", pin7: "net.VBUS_RAW", pin10: "net.VBUS_RAW", pin15: "net.VBUS_RAW",
        pin4: "net.USB_DP", pin13: "net.USB_DP", pin5: "net.USB_DM", pin12: "net.USB_DM" }}
      noConnect={["SBU1", "SBU2"]} />
    <CYPD3177_24LQXQT name="U_PD" pcbX={-15} pcbY={-5} {...pd}
      connections={{
        // Datasheet tables 2–4: MIN=MAX=20 V, COARSE=5 A, FINE=0 A.
        pin1: "net.PD_3V3", pin2: "net.PD_3V3", pin3: "net.PD_GATE_DRIVE",
        pin5: "net.PD_3V3", pin6: "net.GND", pin9: "net.PD_FAULT", pin11: "net.PD_VDC_OUT",
        pin14: "net.CC2", pin15: "net.CC1", pin16: "net.USB_DM", pin17: "net.USB_DP",
        pin18: "net.VBUS_RAW", pin19: "net.GND", pin22: "net.GND", pin23: "net.PD_3V3",
        pin24: "net.PD_CORE", pin25: "net.GND",
      }} noConnect={["SAFE_PWR_EN", "HPI_INT", "GPIO_1", "FLIP", "HPI_SDA", "HPI_SCL", "DNU1", "DNU2"]} />
    {["Q_INPUT", "Q_REVERSE"].map((name, index) => <AO4407A key={name} name={name}
      pcbX={-14 + index * 9} pcbY={9} {...pd}
      connections={{ pin1: "net.PFET_SOURCE", pin2: "net.PFET_SOURCE", pin3: "net.PFET_SOURCE",
        pin4: "net.PD_GATE",
        ...Object.fromEntries([5, 6, 7, 8].map(pin => ["pin" + pin, index === 0 ? "net.VBUS_RAW" : "net.VBUS_QUALIFIED"])) }} />)}
    <GRM31CC72A475KE11L name="C_USB" pcbX={-23} pcbY={-10} {...pd}
      connections={{ pin1: "net.VBUS_RAW", pin2: "net.GND" }} />
    <CC0603KRX7R9BB104 name="C_PD_VBUS" pcbX={-16} pcbY={-1} {...pd}
      connections={{ pin1: "net.VBUS_RAW", pin2: "net.GND" }} />
    {[["C_PD_3V3", "PD_3V3", -18, -10], ["C_PD_CORE", "PD_CORE", -14, -10]].map(([name, rail, x, y]) =>
      <capacitor key={name} name={String(name)} capacitance="1uF" maxVoltageRating="10V"
        footprint={passiveFootprint("0603")} pcbX={Number(x)} pcbY={Number(y)} {...pd}
        connections={{ pin1: "net." + rail, pin2: "net.GND" }} />)}
    <TPS56837RPAR name="U_BUCK" pcbX={4} pcbY={9} {...power}
      noConnect={["PG"]}
      connections={{ pin1: "net.BUCK_EN", pin2: "net.BUCK_FB", pin3: "net.GND",
        pin5: "net.BUCK_SS", pin6: "net.BUCK_SW", pin7: "net.BUCK_BOOT", pin8: "net.VBUS_QUALIFIED",
        pin9: "net.GND", pin10: "net.BUCK_MODE" }} />
    <SRP1040VA_5R6M name="L_OUT" pcbX={15} pcbY={9} {...power}
      connections={{ pin1: "net.BUCK_SW", pin2: "net.V12_OUT" }} />
    {[[-4, 16], [2, 17]].map(([x, y], index) => <CL32A106KBJNNNE key={index} name={"C_IN" + (index + 1)}
      pcbX={x} pcbY={y} {...power} connections={{ pin1: "net.VBUS_QUALIFIED", pin2: "net.GND" }} />)}
    <CC0603KRX7R9BB104 name="C_BUCK_HF" pcbX={4} pcbY={13} {...power}
      connections={{ pin1: "net.VBUS_QUALIFIED", pin2: "net.GND" }} />
    <CC0603KRX7R9BB104 name="C_BOOT" pcbX={8} pcbY={16} {...power}
      connections={{ pin1: "net.BUCK_BOOT", pin2: "net.BUCK_SW" }} />
    {[[25, 11], [25, 4]].map(([x, y], index) => <GRM32ER71E226KE15L key={index} name={"C_OUT" + (index + 1)}
      pcbX={x} pcbY={y} {...power} connections={{ pin1: "net.V12_OUT", pin2: "net.GND" }} />)}
    <capacitor name="C_FF" capacitance="30pF" maxVoltageRating="50V" footprint={passiveFootprint("0603")}
      pcbX={12} pcbY={0} {...power} connections={{ pin1: "net.V12_OUT", pin2: "net.BUCK_FB" }} />
    <capacitor name="C_SS" capacitance="100nF" maxVoltageRating="16V" footprint={passiveFootprint("0603")}
      pcbX={4} pcbY={5} {...power} connections={{ pin1: "net.BUCK_SS", pin2: "net.GND" }} />
    <MMBT3904_RANGE_100_300_ name="Q_FAULT" pcbX={-4} pcbY={0} {...power}
      connections={{ pin1: "net.FAULT_BASE", pin2: "net.GND", pin3: "net.BUCK_EN" }} />
    <KF301_5_0_2P name="J_TEC" pcbX={25} pcbY={-8} pcbRotation={90} {...power}
      connections={{ pin1: "net.V12_OUT", pin2: "net.GND" }} />
    {resistors.map(([name, resistance, x, y, first, second, sheet]) => <resistor key={name} name={name}
      resistance={resistance} footprint={passiveFootprint("0603")} pcbX={x} pcbY={y} schSheetName={sheet}
      connections={{ pin1: "net." + first, pin2: "net." + second }} />)}
    <silkscreentext text="TEC1-12706" pcbX={-4} pcbY={-14} fontSize={1.4} />
    <silkscreentext text="100W PD / 5A CABLE" pcbX={-6} pcbY={-17} fontSize={1} />
    <silkscreentext text="TEC +" pcbX={18} pcbY={-10.5} fontSize={1} />
    <silkscreentext text="GND" pcbX={18} pcbY={-5.5} fontSize={1} />
    <silkscreentext text="HEATSINK REQUIRED" pcbX={6} pcbY={-9} fontSize={1} />
  </board>
}
