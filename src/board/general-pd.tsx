import { CYPD3177_24LQXQT } from "../../imports/CYPD3177_24LQXQT"
import { AO4407A } from "../../imports/AO4407A"
import { USB4085_GF_A } from "../../imports/USB4085_GF_A"
import { KF301_5_0_2P } from "../parts/C474881"
import { MMBT3904_RANGE_100_300_ } from "../parts/C20526"
import { GRM31CC72A475KE11L } from "../parts/C237304"
import { AdjustablePowerStage } from "./power-stage"
import { ControlBlock } from "./control"
import { A_0603WAF1001T5E as Resistor0603 } from "../../imports/A_0603WAF1001T5E"
import { CC0603KRX7R9BB104 as Capacitor100nF } from "../parts/C14663"
import { CC0603KRX7R8BB105 as Capacitor1uF } from "../../imports/CC0603KRX7R8BB105"

export function GeneralPdDriverBoard({ schematicDisabled = false }: { schematicDisabled?: boolean } = {}) {
  return <board width={80} height={60} layers={4} thickness={1.6}
    title="USB-C PD Peltier driver · adjustable CC/CV · unrouted prototype"
    routingDisabled routeRemaining={false} schematicDisabled={schematicDisabled}
    pcbSx={{ "& footprint silkscreentext": { visibility: "hidden" } }}
    schTraceAutoLabelEnabled schMaxTraceDistance={0.5}>
    <net name="GND" isGroundNet />
    <schematicsheet name="PD" displayName="100 W USB-C PD input" sheetIndex={1} />
    <schematicsheet name="POWER" displayName="Adjustable voltage and current limits" sheetIndex={2} />
    <schematicsheet name="CONTROL" displayName="USB programming, debug and status" sheetIndex={3} sheetSize="ANSI_B" sheetWidth={279.4} sheetHeight={431.8} />
    <USB4085_GF_A name="J_USB" pcbX={-33} pcbY={10} pcbRotation={270} schSheetName="PD"
      connections={{ pin1: "net.CC1", pin14: "net.CC2",
        pin2: "net.GND", pin8: "net.GND", pin9: "net.GND", pin16: "net.GND", pin17: "net.GND",
        pin3: "net.VBUS_RAW", pin7: "net.VBUS_RAW", pin10: "net.VBUS_RAW", pin15: "net.VBUS_RAW" }}
      noConnect={["pin4", "pin5", "pin6", "pin11", "pin12", "pin13"]} />
    <CYPD3177_24LQXQT name="U_PD" pcbX={-29} pcbY={19} schSheetName="PD"
      connections={{
        // Datasheet tables 2–4: MIN=MAX=20 V, COARSE=5 A, FINE=0 A.
        pin1: "net.PD_3V3", pin2: "net.PD_3V3", pin3: "net.PD_GATE_DRIVE",
        pin5: "net.PD_3V3", pin6: "net.GND", pin9: "net.PD_FAULT", pin11: "net.PD_VDC_OUT",
        pin14: "net.CC2", pin15: "net.CC1", pin18: "net.VBUS_RAW", pin19: "net.GND",
        pin22: "net.GND", pin23: "net.PD_3V3", pin24: "net.PD_CORE", pin25: "net.GND",
      }} noConnect={["SAFE_PWR_EN", "HPI_INT", "GPIO_1", "FLIP", "HPI_SDA", "HPI_SCL", "DNU1", "DNU2", "D_NEG", "D_POS"]} />
    {/* Every parallel MOSFET source and drain pin is wired explicitly. */}
    <AO4407A name="Q_INPUT" pcbX={-31} pcbY={1} schSheetName="PD" />
    <trace from=".Q_INPUT > .pin1" to="net.PFET_SOURCE" />
    <trace from=".Q_INPUT > .pin2" to="net.PFET_SOURCE" />
    <trace from=".Q_INPUT > .pin3" to="net.PFET_SOURCE" />
    <trace from=".Q_INPUT > .pin4" to="net.PD_GATE" />
    <trace from=".Q_INPUT > .pin5" to="net.VBUS_RAW" />
    <trace from=".Q_INPUT > .pin6" to="net.VBUS_RAW" />
    <trace from=".Q_INPUT > .pin7" to="net.VBUS_RAW" />
    <trace from=".Q_INPUT > .pin8" to="net.VBUS_RAW" />
    <AO4407A name="Q_REVERSE" pcbX={-21} pcbY={1} schSheetName="PD" />
    <trace from=".Q_REVERSE > .pin1" to="net.PFET_SOURCE" />
    <trace from=".Q_REVERSE > .pin2" to="net.PFET_SOURCE" />
    <trace from=".Q_REVERSE > .pin3" to="net.PFET_SOURCE" />
    <trace from=".Q_REVERSE > .pin4" to="net.PD_GATE" />
    <trace from=".Q_REVERSE > .pin5" to="net.VBUS_QUALIFIED" />
    <trace from=".Q_REVERSE > .pin6" to="net.VBUS_QUALIFIED" />
    <trace from=".Q_REVERSE > .pin7" to="net.VBUS_QUALIFIED" />
    <trace from=".Q_REVERSE > .pin8" to="net.VBUS_QUALIFIED" />
    <GRM31CC72A475KE11L name="C_USB" pcbX={-35} pcbY={23} schSheetName="PD"
      connections={{ pin1: "net.VBUS_RAW", pin2: "net.GND" }} />
    <Capacitor100nF name="C_PD_VBUS" maxVoltageRating="50V" pcbX={-27} pcbY={13} schSheetName="PD"
      connections={{ pin1: "net.VBUS_RAW", pin2: "net.GND" }} />
    <Capacitor1uF name="C_PD_3V3" maxVoltageRating="25V" pcbX={-31} pcbY={26} schSheetName="PD"
      connections={{ pin1: "net.PD_3V3", pin2: "net.GND" }} />
    <Capacitor100nF name="C_PD_3V3_HF1" maxVoltageRating="50V" pcbX={-27} pcbY={26} schSheetName="PD"
      connections={{ pin1: "net.PD_3V3", pin2: "net.GND" }} />
    <Capacitor100nF name="C_PD_3V3_HF2" maxVoltageRating="50V" pcbX={-23} pcbY={26} schSheetName="PD"
      connections={{ pin1: "net.PD_3V3", pin2: "net.GND" }} />
    <Capacitor1uF name="C_PD_CORE" maxVoltageRating="25V" pcbX={-24} pcbY={18} schSheetName="PD"
      connections={{ pin1: "net.PD_CORE", pin2: "net.GND" }} />
    <MMBT3904_RANGE_100_300_ name="Q_PD_FAULT" pcbX={-14} pcbY={-4} schSheetName="PD"
      connections={{ pin1: "net.PD_FAULT_BASE", pin2: "net.GND", pin3: "net.DRIVER_ENABLE" }} />
    <Resistor0603 name="R_GATE" resistance="1k" pcbX={-33} pcbY={-5} schSheetName="PD"
      manufacturerPartNumber="0603WAF1001T5E" supplierPartNumbers={{ jlcpcb: ["C21190"] }}
      connections={{ pin1: "net.PD_GATE_DRIVE", pin2: "net.PD_GATE" }} />
    <Resistor0603 name="R_GATE_OFF" resistance="49.9k" pcbX={-28} pcbY={-5} schSheetName="PD"
      manufacturerPartNumber="0603WAF4992T5E" supplierPartNumbers={{ jlcpcb: ["C23184"] }}
      connections={{ pin1: "net.PFET_SOURCE", pin2: "net.PD_GATE" }} />
    <Resistor0603 name="R_DC_SENSE" resistance="1k" pcbX={-25} pcbY={8} schSheetName="PD"
      manufacturerPartNumber="0603WAF1001T5E" supplierPartNumbers={{ jlcpcb: ["C21190"] }}
      connections={{ pin1: "net.VBUS_QUALIFIED", pin2: "net.PD_VDC_OUT" }} />
    <Resistor0603 name="R_FAULT_BASE" resistance="10k" pcbX={-21} pcbY={-4} schSheetName="PD"
      manufacturerPartNumber="0603WAF1002T5E" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.PD_FAULT", pin2: "net.PD_FAULT_BASE" }} />
    <Resistor0603 name="R_FAULT_OFF" resistance="100k" pcbX={-25} pcbY={-4} schSheetName="PD"
      manufacturerPartNumber="0603WAF1003T5E" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.PD_FAULT_BASE", pin2: "net.GND" }} />
    <AdjustablePowerStage />
    <ControlBlock />
    <KF301_5_0_2P name="J_TEC" pcbX={34} pcbY={24} pcbRotation={90} schSheetName="POWER"
      connections={{ pin1: "net.TEC_POS", pin2: "net.GND" }} />
    <silkscreentext text="PD POWER" pcbX={-35} pcbY={16.8} fontSize={0.8} />
    <silkscreentext text="+" pcbX={28.5} pcbY={21.5} fontSize={1} />
    <silkscreentext text="−" pcbX={28.5} pcbY={26.5} fontSize={1} />
  </board>
}
