import { CYPD3177_24LQXQT } from "../../imports/CYPD3177_24LQXQT"
import { AO4407A } from "../../imports/AO4407A"
import { USB4085_GF_A } from "../../imports/USB4085_GF_A"
import { KF301_5_0_2P } from "../parts/C474881"
import { MMBT3904_RANGE_100_300_ } from "../parts/C20526"
import { GRM31CC72A475KE11L } from "../parts/C237304"
import { AdjustablePowerStage, powerStage } from "./power-stage"
import { ControlBlock } from "./control"
import { SourcedCapacitor, SourcedResistor } from "./sourced-passive"

export const design = {
  defaultModule: "TEC1-12706",
  moduleSource: "https://www.amazon.com/dp/B00M1PM7H6",
  inputVoltageV: 20,
  requestedCurrentA: 5,
  defaultVoltageV: 12,
  defaultCurrentLimitA: 5.5,
  ...powerStage,
  boardWidthMm: 80,
  boardHeightMm: 60,
} as const

const pd = { schSheetName: "PD" }
const resistors = [
  ["R_GATE", "1k", -33, -5, "PD_GATE_DRIVE", "PD_GATE"],
  ["R_GATE_OFF", "49.9k", -28, -5, "PFET_SOURCE", "PD_GATE"],
  ["R_DC_SENSE", "1k", -25, 8, "VBUS_QUALIFIED", "PD_VDC_OUT"],
  ["R_FAULT_BASE", "10k", -21, -4, "PD_FAULT", "PD_FAULT_BASE"],
  ["R_FAULT_OFF", "100k", -25, -4, "PD_FAULT_BASE", "GND"],
] as const

export function GeneralPdDriverBoard({ schematicDisabled = false }: { schematicDisabled?: boolean } = {}) {
  return <board width={design.boardWidthMm} height={design.boardHeightMm} layers={4} thickness={1.6}
    title="USB-C PD Peltier driver · adjustable CC/CV · unrouted prototype"
    routingDisabled routeRemaining={false} schematicDisabled={schematicDisabled}
    schTraceAutoLabelEnabled schMaxTraceDistance={0.5}>
    <net name="GND" isGroundNet />
    <schematicsheet name="PD" displayName="100 W USB-C PD input" sheetIndex={1} />
    <schematicsheet name="POWER" displayName="Adjustable voltage and current limits" sheetIndex={2} />
    <schematicsheet name="CONTROL" displayName="USB programming, debug and status" sheetIndex={3} sheetSize="ANSI_B" />
    <USB4085_GF_A name="J_USB" pcbX={-33} pcbY={10} pcbRotation={270} {...pd}
      connections={{ pin1: "net.CC1", pin14: "net.CC2",
        pin2: "net.GND", pin8: "net.GND", pin9: "net.GND", pin16: "net.GND", pin17: "net.GND",
        pin3: "net.VBUS_RAW", pin7: "net.VBUS_RAW", pin10: "net.VBUS_RAW", pin15: "net.VBUS_RAW" }}
      noConnect={["pin4", "pin5", "pin6", "pin11", "pin12", "pin13"]} />
    <CYPD3177_24LQXQT name="U_PD" pcbX={-29} pcbY={19} {...pd}
      connections={{
        // Datasheet tables 2–4: MIN=MAX=20 V, COARSE=5 A, FINE=0 A.
        pin1: "net.PD_3V3", pin2: "net.PD_3V3", pin3: "net.PD_GATE_DRIVE",
        pin5: "net.PD_3V3", pin6: "net.GND", pin9: "net.PD_FAULT", pin11: "net.PD_VDC_OUT",
        pin14: "net.CC2", pin15: "net.CC1", pin18: "net.VBUS_RAW", pin19: "net.GND",
        pin22: "net.GND", pin23: "net.PD_3V3", pin24: "net.PD_CORE", pin25: "net.GND",
      }} noConnect={["SAFE_PWR_EN", "HPI_INT", "GPIO_1", "FLIP", "HPI_SDA", "HPI_SCL", "DNU1", "DNU2", "D_NEG", "D_POS"]} />
    {["Q_INPUT", "Q_REVERSE"].map((name, index) => <AO4407A key={name} name={name}
      pcbX={-31 + index * 10} pcbY={1} {...pd}
      connections={{ pin1: "net.PFET_SOURCE", pin2: "net.PFET_SOURCE", pin3: "net.PFET_SOURCE",
        pin4: "net.PD_GATE",
        ...Object.fromEntries([5, 6, 7, 8].map(pin => ["pin" + pin, index === 0 ? "net.VBUS_RAW" : "net.VBUS_QUALIFIED"])) }} />)}
    <GRM31CC72A475KE11L name="C_USB" pcbX={-35} pcbY={23} {...pd}
      connections={{ pin1: "net.VBUS_RAW", pin2: "net.GND" }} />
    <SourcedCapacitor name="C_PD_VBUS" capacitance="100nF" pcbX={-27} pcbY={13} {...pd}
      connections={{ pin1: "net.VBUS_RAW", pin2: "net.GND" }} />
    <SourcedCapacitor name="C_PD_3V3" capacitance="1uF" pcbX={-31} pcbY={26} {...pd}
      connections={{ pin1: "net.PD_3V3", pin2: "net.GND" }} />
    {[-27, -23].map((x, i) => <SourcedCapacitor key={i} name={"C_PD_3V3_HF" + (i + 1)}
      capacitance="100nF" pcbX={x} pcbY={26} {...pd}
      connections={{ pin1: "net.PD_3V3", pin2: "net.GND" }} />)}
    <SourcedCapacitor name="C_PD_CORE" capacitance="1uF" pcbX={-24} pcbY={18} {...pd}
      connections={{ pin1: "net.PD_CORE", pin2: "net.GND" }} />
    <MMBT3904_RANGE_100_300_ name="Q_PD_FAULT" pcbX={-14} pcbY={-4} {...pd}
      connections={{ pin1: "net.PD_FAULT_BASE", pin2: "net.GND", pin3: "net.DRIVER_ENABLE" }} />
    {resistors.map(([name, resistance, x, y, first, second]) => <SourcedResistor key={name} name={name}
      resistance={resistance} pcbX={x} pcbY={y} {...pd}
      connections={{ pin1: "net." + first, pin2: "net." + second }} />)}
    <AdjustablePowerStage />
    <ControlBlock />
    <KF301_5_0_2P name="J_TEC" pcbX={34} pcbY={24} pcbRotation={90} schSheetName="POWER"
      connections={{ pin1: "net.TEC_POS", pin2: "net.GND" }} />
    <silkscreentext text="USB-C PD / CC-CV" pcbX={5} pcbY={27.8} fontSize={1.3} />
    <silkscreentext text="PD POWER" pcbX={-35} pcbY={16.8} fontSize={0.8} />
    <silkscreentext text="+" pcbX={28.5} pcbY={21.5} fontSize={1} />
    <silkscreentext text="−" pcbX={28.5} pcbY={26.5} fontSize={1} />
    <silkscreentext text="2.1-15V" pcbX={30.5} pcbY={-17} fontSize={0.8} />
    <silkscreentext text="0.5-6A" pcbX={30.5} pcbY={-20} fontSize={0.8} />
    <silkscreentext text="72W MAX" pcbX={30.5} pcbY={-23} fontSize={0.8} />
  </board>
}
