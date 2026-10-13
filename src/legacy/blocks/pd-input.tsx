import { Fragment } from "react"
import { C, Npn, R, Stusb4500, Tps259470, TwoN7002, UsbC } from "../../parts"
import { attachLogicSupplyInner2Port } from "../logic-supply-links"
import { attachSource22ExistingViaLayers, source22SameOwnedPdGroundTraceProps, source22SameOwnedPdGroundViaProps } from "../source22-routes"

const N = (name: string) => `net.${name}`
const usbGroundReturns = [[1, -41.85, 7.674888], [2, -47.8897008, 6.35], [14, -41.65, 8.7999937]] as const
const pdV3Vias: Readonly<Record<string, string>> = { R_PD_SCL: "PD_SCL_V3_VIA", R_PD_VALID: "PD_VALID_V3_VIA" }
export const usbCcLocalConnectionPlans = [
  { name: "USB_CC1_COMPLETE", net: "USB_CC1", from: "U_PD.pin1", to: "USB_CC1_ESCAPE_VIA.top",
    requiredSelectors: ["U_PD.pin2", "J_USB.pin6"],
    traces: ["USB_CC1_ESCAPE", "PD_CC1", "PD_CC1_DB", "PD_CC1_BOTTOM_LAUNCH", "USB_CC1"],
    branchEndpoints: {
      USB_CC1_ESCAPE: ["J_USB.pin6", "USB_CC1_ESCAPE_VIA.top"], PD_CC1: ["U_PD.pin1", "U_PD.pin2"],
      PD_CC1_DB: ["U_PD.pin1", "PD_CC1_IC_VIA.top"],
      PD_CC1_BOTTOM_LAUNCH: ["PD_CC1_IC_VIA.bottom", "PD_CC1_EAST_BRIDGE_VIA.bottom"],
      USB_CC1: ["PD_CC1_EAST_BRIDGE_VIA.inner2", "USB_CC1_ESCAPE_VIA.inner2"],
    } },
  { name: "USB_CC2_COMPLETE", net: "USB_CC2", from: "U_PD.pin4", to: "USB_CC2_ESCAPE_VIA.top",
    requiredSelectors: ["U_PD.pin5", "J_USB.pin12"],
    traces: ["USB_CC2_ESCAPE", "PD_CC2_DB", "PD_CC2", "PD_CC2_BOTTOM_LAUNCH", "USB_CC2"],
    branchEndpoints: {
      USB_CC2_ESCAPE: ["J_USB.pin12", "USB_CC2_ESCAPE_VIA.top"], PD_CC2_DB: ["U_PD.pin4", "U_PD.pin5"],
      PD_CC2: ["U_PD.pin4", "PD_CC2_IC_VIA.top"],
      PD_CC2_BOTTOM_LAUNCH: ["PD_CC2_IC_VIA.bottom", "PD_CC2_EAST_BRIDGE_VIA.bottom"],
      USB_CC2: ["PD_CC2_EAST_BRIDGE_VIA.inner2", "USB_CC2_ESCAPE_VIA.inner2"],
    } },
] as const
export const pdLocalConnectionPlans = [
  { name: "PD_RESET_LOCAL", net: "PD_RESET", from: "U_PD.pin6", to: "R_PD_RESET.pin1", traces: ["PD_RESET"] },
  { name: "PD_VS_LOCAL", net: "PD_VS", from: "U_PD.pin18", to: "R_PD_VS.pin2", traces: ["PD_VBUS_SENSE"] },
  { name: "PD_1V2_LOCAL", net: "PD_1V2", from: "U_PD.pin21", to: "C_PD_1V2.pin1", traces: ["PD_REG_1V2"] },
  { name: "PD_2V7_LOCAL", net: "PD_2V7", from: "U_PD.pin23", to: "C_PD_2V7.pin1",
    traces: ["PD_REG_2V7", "C_PD_2V7_A", "PD_2V7_BOTTOM_TRUNK"] },
  ...usbCcLocalConnectionPlans,
] as const
type Layer = "top" | "bottom"
type PathPoint = string | { x: number, y: number, via?: boolean, fromLayer?: Layer, toLayer?: Layer }
// Numeric points are local to the starting component, including its rotation.
const localPath = ({ path, origin: { x, y }, rotation = 0 }: {
  path: PathPoint[], origin: { x: number, y: number }, rotation?: number
}) => path.map(p =>
  typeof p === "string" ? p : { ...p, ...(rotation === 90 ? { x: p.y - y, y: x - p.x } : { x: p.x - x, y: p.y - y }) })
const transfer = (x: number, y: number, fromLayer: Layer, toLayer: Layer): PathPoint[] => [
  { x, y }, { x, y, via: true, fromLayer, toLayer }, { x, y },
]

type Passive = readonly [string, string, number, number, number, string, string, number, number]

// Helper components use exact imported JLCPCB footprint geometry, not generic land patterns.
const resistors: readonly Passive[] = [
  ["R_PD_RESET", "100k", -26, 2.5, 0, "PD_RESET", "GND", -24, 7],
  ["R_PD_VS", "470", -28.5, 22, 0, "VBUS_RAW", "PD_VS", -30, 18],
  ["R_PD_DISCH", "1k", -28, 17.5, 0, "VBUS_TEC", "PD_DISCH", -18, 10],
  ["R_PD_SCL", "4.7k", -22, 4, 90, "V3V3", "I2C_SCL", -19, 6],
  ["R_PD_SDA", "4.7k", -22, 0.5, 90, "V3V3", "I2C_SDA", -17, 6],
  ["R_PD_ALERT", "10k", -29, 14, 0, "V3V3", "PD_ALERT", -31, 15],
  ["R_PD_VALID", "1.27k", -26, 11.5, 0, "V3V3", "PD_VALID_N", -22, 18],
  ["R_INPUT_RUN", "10k", -20, 12.5, 0, "MCU_RUN", "INPUT_ENABLE", -9, 17],
  ["R_INPUT_OFF", "100k", -21, 16, 90, "INPUT_ENABLE", "GND", -10, 10],
  ["R_PD_INHIBIT", "47k", -23, 12.5, 0, "PD_VALID_N", "PD_INHIBIT_BASE", -14, 17],
  ["R_INPUT_OV_TOP", "174k", -22, 20, 0, "VBUS_RAW", "INPUT_OVLO", -11, 20],
  ["R_INPUT_OV_BOTTOM", "10k", -21.5, 18.5, 0, "INPUT_OVLO", "GND", -11, 18],
  ["R_INPUT_ILIM", "1.27k", -14.5, 15.5, 90, "INPUT_CURRENT_MON", "GND", -4, 13],
  ["R_INPUT_ILIM_HIGH", "2.49k", -16.2, 10.5, 90, "INPUT_CURRENT_MON", "INPUT_ILIM_SWITCH", -2, 15],
  ["R_INPUT_HIGH_OFF", "100k", -19, 3, 0, "POWER_BUDGET_HIGH", "GND", 0, 7],
  ["R_INPUT_FAULT", "47k", -23, 28.5, 0, "V3V3", "INPUT_FAULT_N", -6, 18],
]

// VDD uses a 2.5 mm local feed and a 3 mm plane return bound (including 1.6 mm barrel travel).
const capacitors: readonly Passive[] = [
  ["C_PD_VDD", "1uF", -30, 7, 90, "VBUS_RAW", "GND", -31, 10],
  ["C_PD_1V2", "1uF", -30, 10, 90, "PD_1V2", "GND", -32, 12],
  ["C_PD_2V7", "1uF", -30, 4, 90, "PD_2V7", "GND", -30, 7],
  ["C_USB_IN", "1uF", -39, 19, 0, "VBUS_RAW", "GND", -33, 20],
  ["C_INPUT_DVDT", "3.3nF", -13.05, 16.3, 90, "INPUT_DVDT", "GND", -5, 9],
  ["C_INPUT_OUT", "1uF", -16, 17.7, 0, "VBUS_TEC", "GND", -3, 20],
]

// Intentionally NC: USB data/SBU, STUSB unused status outputs, eFuse AUXOFF and ITIMER.
const wires: readonly (readonly [string, string, string, number?])[] = [
  ["USB_VBUS_A", ".J_USB > .pin15", N("VBUS_RAW"), 0.4],
  ["USB_VBUS_B", ".J_USB > .pin16", N("VBUS_RAW"), 0.4],
  ["PD_DISCHARGE", ".U_PD > .pin9", N("PD_DISCH")],
  ["PD_ADDR0", ".U_PD > .pin12", N("GND")],
  ["PD_ADDR1", ".U_PD > .pin13", N("GND")],
  ["PD_VALID", ".U_PD > .pin16", N("PD_VALID_N")],
  ["PD_ALERT", ".U_PD > .pin19", N("PD_ALERT")],
  ["PD_POWER", ".U_PD > .pin24", N("VBUS_RAW")],
  ["INPUT_ENABLE", ".U_INPUT > .pin1", N("INPUT_ENABLE")],
  ["INPUT_OVLO", ".U_INPUT > .pin2", N("INPUT_OVLO")],
  ["INPUT_FAULT", ".U_INPUT > .pin4", N("INPUT_FAULT_N")],
  // Exact eFuse IN/OUT pads are only 0.3 mm wide: layout adds short necks and wide copper outside the body.
  ["INPUT_POWER_IN", ".U_INPUT > .pin5", N("VBUS_RAW"), 0.25],
  ["INPUT_POWER_OUT", ".U_INPUT > .pin6", N("VBUS_TEC"), 0.25],
  ["INPUT_CURRENT", ".U_INPUT > .pin9", N("INPUT_CURRENT_MON")],
  ["PD_INHIBIT_BASE", ".Q_PD_INHIBIT > .pin1", N("PD_INHIBIT_BASE")],
  ["PD_INHIBIT_EMITTER", ".Q_PD_INHIBIT > .pin2", N("GND")],
  ["PD_INHIBIT_COLLECTOR", ".Q_PD_INHIBIT > .pin3", N("INPUT_ENABLE")],
  ["INPUT_HIGH_GATE", ".Q_INPUT_HIGH > .pin1", N("POWER_BUDGET_HIGH")],
  ["INPUT_HIGH_SOURCE", ".Q_INPUT_HIGH > .pin2", N("GND")],
  ["INPUT_HIGH_DRAIN", ".Q_INPUT_HIGH > .pin3", N("INPUT_ILIM_SWITCH")],
]

/**
 * 15/20 V USB-C PD sink, protected input, and default-low hardware enable.
 * NVM must contain 15V/3A and 20V/3A PDOs, REQ_SRC_CURRENT=1, POWER_ONLY_ABOVE_5V=1.
 * Firmware enables high-current mode only after fresh RDO/source-capability validation.
 */
export function PdInput() {
  return <>
    <silkscreentext text="USB-C" pcbX={-45} pcbY={21} fontSize={1.7} />
    <UsbC noConnect={["SBU2", "DN2", "DP1", "DN1", "DP2", "SBU1"]} name="J_USB" pcbX={-45.11557} pcbY={12} pcbRotation={270} schX={-13.32} schY={-1.0} />
    {usbGroundReturns.map(([pin, pcbX, pcbY]) => <Fragment key={`USB_GND_${pin}`}>
      <via name={`USB_GND_${pin}_VIA`} pcbX={pcbX} pcbY={pcbY} holeDiameter={0.3} outerDiameter={0.7}
        fromLayer="top" toLayer="bottom" connectsTo="net.GND" tented />
      <trace name={`USB_GND_${pin}`} from={`J_USB.pin${pin}`} to={`USB_GND_${pin}_VIA.top`} thickness={0.5}
        pcbPath={[`J_USB.pin${pin}`, `USB_GND_${pin}_VIA.top`]} />
    </Fragment>)}
    <via name="USB_CC1_ESCAPE_VIA" pcbX={-44.2} pcbY={13.249934} holeDiameter={0.3} outerDiameter={0.7}
      fromLayer="top" toLayer="bottom" connectsTo="net.USB_CC1" tented {...{ ref: attachLogicSupplyInner2Port }} />
    <trace name="USB_CC1_ESCAPE" from="J_USB.pin6" to="USB_CC1_ESCAPE_VIA.top" thickness={0.2}
      pcbPath={["J_USB.pin6", "USB_CC1_ESCAPE_VIA.top"]} />
    <via name="USB_CC2_ESCAPE_VIA" pcbX={-44.3} pcbY={10.24994} holeDiameter={0.3} outerDiameter={0.7}
      fromLayer="top" toLayer="bottom" connectsTo="net.USB_CC2" tented {...{ ref: attachLogicSupplyInner2Port }} />
    <trace name="USB_CC2_ESCAPE" from="J_USB.pin12" to="USB_CC2_ESCAPE_VIA.top" thickness={0.2}
      pcbPath={["J_USB.pin12", "USB_CC2_ESCAPE_VIA.top"]} />
    <via name="PD_SCL_V3_VIA" pcbX={-22.9} pcbY={3.25} holeDiameter={0.3} outerDiameter={0.7}
      fromLayer="top" toLayer="bottom" connectsTo="net.V3V3" tented {...{ ref: attachLogicSupplyInner2Port }} />
    <via name="PD_VALID_V3_VIA" pcbX={-26.7} pcbY={10.55} holeDiameter={0.3} outerDiameter={0.7}
      fromLayer="top" toLayer="bottom" connectsTo="net.V3V3" tented {...{ ref: attachLogicSupplyInner2Port }} />
    <trace name="PD_SCL_VALID_V3_TRUNK" from="PD_SCL_V3_VIA.inner2" to="PD_VALID_V3_VIA.inner2" thickness={0.2}
      pcbPathRelativeTo="PD_SCL_V3_VIA.inner2"
      pcbPath={["PD_SCL_V3_VIA.inner2", { x: -3.8, y: 3.8 }, "PD_VALID_V3_VIA.inner2"]} />
    {/* Join the entry GND contact to its grounded plated shell, away from the PCB edge. */}
    <trace name="USB_GND_13" from="J_USB.pin13" to="net.GND" thickness={0.3}
      pcbPathRelativeTo="J_USB.pin13"
      pcbPath={["J_USB.pin13", { x: -3.755238, y: 1.9755672 }, "J_USB.pin4"]} />
    <trace name="USB_GND_4" from="J_USB.pin4" to="net.GND" thickness={0.3}
      pcbPath={["J_USB.pin4", "J_USB.pin3"]} />
    <via name="USB_SHELL_GND_VIA" pcbX={-47.8897008} pcbY={17.75} holeDiameter={0.3} outerDiameter={0.7}
      fromLayer="top" toLayer="bottom" connectsTo="net.GND" tented />
    <trace name="USB_GND_3" from="J_USB.pin3" to="net.GND" thickness={0.3}
      pcbPathRelativeTo="J_USB.pin3"
      pcbPath={["J_USB.pin3", { x: -5.75, y: -2.7741308 }]} />
    <via name="USB_ENTRY_GND_VIA" pcbX={-37.5} pcbY={19} holeDiameter={0.3} outerDiameter={0.7}
      fromLayer="top" toLayer="bottom" connectsTo="net.GND" tented />
    <Stusb4500 name="U_PD" pcbX={-26} pcbY={7} schX={-3.96} schY={-1.0} schPinStyle={{ pin16: { marginBottom: .6 }, pin18: { marginBottom: .4 } }}
      connections={{ pin7: N("I2C_SCL"), pin8: N("I2C_SDA") }} />
    <Tps259470 name="U_INPUT" pcbX={-18} pcbY={15} schX={7.56} schY={0.0} />
    {/* Start at the reviewed L-land copper anchors. The short 0.20 mm
        escapes reach ordinary full-through barrels clear of every SMT land;
        native routing can continue from these outside-package contacts. */}
    <via name="INPUT_ENABLE_ESCAPE_VIA" pcbX={-19.5} pcbY={16.6} holeDiameter={0.3} outerDiameter={0.7}
      fromLayer="top" toLayer="bottom" connectsTo="net.INPUT_ENABLE" tented />
    <trace name="INPUT_ENABLE_ESCAPE" from="U_INPUT.pin1" to="INPUT_ENABLE_ESCAPE_VIA.top" thickness={0.2}
      pcbPathRelativeTo="U_INPUT.pin1" pcbPath={localPath({ path: [
        "U_INPUT.pin1", { x: -19.1, y: 15.7 }, { x: -19.5, y: 16.1 }, "INPUT_ENABLE_ESCAPE_VIA.top",
      ], origin: { x: -18, y: 15 } })} />
    <trace name="INPUT_ENABLE_CONTINUATION" from="INPUT_ENABLE_ESCAPE_VIA.top" to="net.INPUT_ENABLE" thickness={0.2} />
    <via name="INPUT_FAULT_ESCAPE_VIA" pcbX={-20} pcbY={13.6} holeDiameter={0.3} outerDiameter={0.7}
      fromLayer="top" toLayer="bottom" connectsTo="net.INPUT_FAULT_N" tented {...{ref:attachSource22ExistingViaLayers}} />
    <trace name="INPUT_FAULT_ESCAPE" from="U_INPUT.pin4" to="INPUT_FAULT_ESCAPE_VIA.top" thickness={0.2}
      pcbPathRelativeTo="U_INPUT.pin4" pcbPath={localPath({ path: [
        "U_INPUT.pin4", { x: -19.3, y: 14.3 }, "INPUT_FAULT_ESCAPE_VIA.top",
      ], origin: { x: -18, y: 15 } })} />
    <trace name="INPUT_FAULT_CONTINUATION" from="INPUT_FAULT_ESCAPE_VIA.top" to="net.INPUT_FAULT_N" thickness={0.2} />
    <via name="INPUT_DVDT_ESCAPE_VIA" pcbX={-15.7} pcbY={13.8} holeDiameter={0.3} outerDiameter={0.7}
      fromLayer="top" toLayer="bottom" connectsTo="net.INPUT_DVDT" tented {...{ ref: attachLogicSupplyInner2Port }} />
    <via name="INPUT_DVDT_CAP_VIA" pcbX={-13.05} pcbY={14.6} holeDiameter={0.3} outerDiameter={0.7}
      fromLayer="top" toLayer="bottom" connectsTo="net.INPUT_DVDT" tented {...{ ref: attachLogicSupplyInner2Port }} />
    <trace name="INPUT_SLEW" from="U_INPUT.pin7" to="INPUT_DVDT_ESCAPE_VIA.top" thickness={0.2} maxLength={1.7}
      pcbPathRelativeTo="U_INPUT.pin7" pcbPath={localPath({ path: [
        "U_INPUT.pin7", { x: -16.5, y: 14.3 }, { x: -16, y: 13.8 }, "INPUT_DVDT_ESCAPE_VIA.top",
      ], origin: { x: -18, y: 15 } })} />
    <trace name="INPUT_DVDT_FULL_TRUNK" from="INPUT_DVDT_ESCAPE_VIA.inner2" to="INPUT_DVDT_CAP_VIA.inner2" thickness={0.2} maxLength={3}
      pcbPathRelativeTo="INPUT_DVDT_ESCAPE_VIA.inner2"
      pcbPath={["INPUT_DVDT_ESCAPE_VIA.inner2", { x: 1.85, y: 0 }, "INPUT_DVDT_CAP_VIA.inner2"]} />
    <trace name="INPUT_DVDT_CAP_ESCAPE" from="INPUT_DVDT_CAP_VIA.top" to="C_INPUT_DVDT.pin1" thickness={0.2} maxLength={1}
      pcbPath={["INPUT_DVDT_CAP_VIA.top", "C_INPUT_DVDT.pin1"]} />
    <via name="INPUT_DVDT_GND_VIA" pcbX={-13.05} pcbY={18} holeDiameter={0.3} outerDiameter={0.7}
      fromLayer="top" toLayer="bottom" connectsTo="net.GND" tented />
    <trace name="INPUT_DVDT_LOCAL_GROUND" from="C_INPUT_DVDT.pin2" to="INPUT_DVDT_GND_VIA.top" thickness={0.2} maxLength={1}
      pcbPath={["C_INPUT_DVDT.pin2", "INPUT_DVDT_GND_VIA.top"]} />
    <Npn name="Q_PD_INHIBIT" pcbX={-19.5} pcbY={9} schX={3.96} schY={-1.0} />
    <TwoN7002 name="Q_INPUT_HIGH" pcbX={-13.5} pcbY={12} schX={13.32} schY={-1.0} />
    {/* Ground enters the common exposed pad and exits through grounded pin10,
        keeping both left-side regulator escape corridors open. */}
    <via name="PD_VDD_RETURN_VIA" pcbX={-31.21} pcbY={7.885} holeDiameter={0.3} outerDiameter={0.7}
      fromLayer="top" toLayer="bottom" connectsTo="net.GND" tented />
    <trace name="PD_VSYS_GROUND" from="U_PD.pin22" to="net.GND" thickness={0.2}
      pcbPathRelativeTo="U_PD.pin22"
      pcbPath={["U_PD.pin22", { x: -0.25, y: -0.25 }, "U_PD.pin25"]} />
    <trace name="PD_EXPOSED_GROUND" from="U_PD.pin25" to="net.GND" thickness={0.2}
      pcbPathRelativeTo="U_PD.pin25"
      pcbPath={["U_PD.pin25", { x: 0.25, y: 0.25 }, "U_PD.pin10"]} />
    <via {...source22SameOwnedPdGroundViaProps} />
    <trace {...source22SameOwnedPdGroundTraceProps} pcbPath={[...source22SameOwnedPdGroundTraceProps.pcbPath]} />
    <via name="INPUT_GND_VIA" pcbX={-15.8} pcbY={14.775} holeDiameter={0.3} outerDiameter={0.7}
      fromLayer="top" toLayer="bottom" connectsTo="net.GND" tented />
    <trace name="INPUT_GROUND" from="U_INPUT.pin8" to="net.GND" thickness={0.2}
      pcbPathRelativeTo="U_INPUT.pin8" pcbPath={["U_INPUT.pin8", { x: 2.2, y: -0.225 }]} />
    <via name="INPUT_ILIM_GND_VIA" pcbX={-14.5} pcbY={17.15} holeDiameter={0.3} outerDiameter={0.7}
      fromLayer="top" toLayer="bottom" connectsTo="net.GND" tented />
    {/* Support currents use narrow branches; main USB/eFuse current stays in the reviewed wide copper. */}
    <trace name="PD_RAW_MONITOR_FEED" from="R_PD_VS.pin1" to="C_USB_IN.pin1" thickness={0.25}
      pcbPathRelativeTo="R_PD_VS.pin1" pcbPath={localPath({ path: [
        "R_PD_VS.pin1", { x: -31.6, y: 25 }, { x: -39.72, y: 25 }, "C_USB_IN.pin1",
      ], origin: { x: -28.5, y: 22 } })} />
    <trace name="PD_RAW_OVLO_FEED" from="R_INPUT_OV_TOP.pin1" to="R_PD_VS.pin1" thickness={0.25}
      pcbPathRelativeTo="R_INPUT_OV_TOP.pin1" pcbPath={localPath({ path: [
        "R_INPUT_OV_TOP.pin1", ...transfer(-22.75, 21.2, "top", "bottom"),
        { x: -24.05, y: 22.5 }, { x: -33.3, y: 22.5 }, ...transfer(-33.8, 22, "bottom", "top"), "R_PD_VS.pin1",
      ], origin: { x: -22, y: 20 } })} />
    {/* This sensing feeder uses the authentic 0.30 mm IN land. Main load
        current is carried by the separate reviewed raw-input collector. */}
    <trace name="PD_RAW_IN_SUPPORT" from="U_INPUT.pin5" to="R_INPUT_OV_TOP.pin1" thickness={0.25}
      pcbPathRelativeTo="U_INPUT.pin5" pcbPath={localPath({ path: [
        "U_INPUT.pin5", { x: -18.25, y: 20.5 }, { x: -18.95, y: 21.2 },
        { x: -22.75, y: 21.2 }, "R_INPUT_OV_TOP.pin1",
      ], origin: { x: -18, y: 15 } })} />
    {/* Rail feed has a separate bound from the short IC-to-capacitor decoupling loop. */}
    <trace name="PD_RAW_BYPASS_FEED" from="C_PD_VDD.pin1" to="C_USB_IN.pin1" thickness={0.25} maxLength={26}
      pcbPathRelativeTo="C_PD_VDD.pin1" pcbPath={localPath({ path: [
        "C_PD_VDD.pin1", ...transfer(-32, 6.115, "top", "bottom"),
        { x: -33.8, y: 7.915 }, { x: -33.8, y: 16.5 }, { x: -35.3, y: 18 },
        ...transfer(-40.5, 18, "bottom", "top"), { x: -39.72, y: 18.78 }, "C_USB_IN.pin1",
      ], origin: { x: -30, y: 7 }, rotation: 90 })} />
    {/* 2.5 mm pin-center bound accommodates the audited 0805/QFN courtyards. */}
    <trace name="PD_LOCAL_VDD" from="U_PD.pin24" to="C_PD_VDD.pin1" thickness={0.2} maxLength={2.5}
      pcbPathRelativeTo="U_PD.pin24" pcbPath={localPath({ path: [
        "U_PD.pin24", { x: -29.635, y: 5.75 }, "C_PD_VDD.pin1",
      ], origin: { x: -26, y: 7 } })} />
    <trace name="PD_RESET" from="U_PD.pin6" to="R_PD_RESET.pin1" thickness={0.2}
      pcbPathRelativeTo="U_PD.pin6" pcbPath={localPath({ path: [
        "U_PD.pin6", { x: -24.75, y: 4.5 }, "R_PD_RESET.pin1",
      ], origin: { x: -26, y: 7 } })} />
    <trace name="PD_VBUS_SENSE" from="U_PD.pin18" to="R_PD_VS.pin2" thickness={0.2}
      pcbPathRelativeTo="U_PD.pin18" pcbPath={localPath({ path: [
        "U_PD.pin18", { x: -27.5, y: 9.15 }, { x: -27.5, y: 14.6 },
        { x: -28.4, y: 15.5 }, { x: -28.4, y: 19 }, "R_PD_VS.pin2",
      ], origin: { x: -26, y: 7 } })} />
    {/* These explicit 3.5 mm bounds cover the fitted local signal and its plane return. */}
    <trace name="PD_REG_1V2" from="U_PD.pin21" to="C_PD_1V2.pin1" thickness={0.2} maxLength={3.5}
      pcbPathRelativeTo="U_PD.pin21" pcbPath={localPath({ path: [
        "U_PD.pin21", { x: -28.6, y: 7.25 }, { x: -28.6, y: 8.15 }, { x: -29.73, y: 9.28 }, "C_PD_1V2.pin1",
      ], origin: { x: -26, y: 7 } })} />
    <via name="PD_2V7_IC_VIA" pcbX={-28.76} pcbY={6.44} holeDiameter={0.3} outerDiameter={0.7}
      fromLayer="top" toLayer="bottom" connectsTo="net.PD_2V7" tented />
    <via name="PD_2V7_CAP_VIA" pcbX={-31.05} pcbY={4.15} holeDiameter={0.3} outerDiameter={0.7}
      fromLayer="top" toLayer="bottom" connectsTo="net.PD_2V7" tented />
    <trace name="PD_REG_2V7" from="U_PD.pin23" to="PD_2V7_IC_VIA.top" thickness={0.2}
      pcbPathRelativeTo="U_PD.pin23" pcbPath={localPath({ path: [
        "U_PD.pin23", { x: -28.4, y: 6.25 }, { x: -28.59, y: 6.44 }, "PD_2V7_IC_VIA.top",
      ], origin: { x: -26, y: 7 } })} />
    <trace name="C_PD_2V7_A" from="C_PD_2V7.pin1" to="PD_2V7_CAP_VIA.top" thickness={0.2}
      pcbPathRelativeTo="C_PD_2V7.pin1" pcbPath={localPath({ path: [
        "C_PD_2V7.pin1", { x: -30.18, y: 3.28 }, "PD_2V7_CAP_VIA.top",
      ], origin: { x: -30, y: 4 }, rotation: 90 })} />
    <trace name="PD_2V7_BOTTOM_TRUNK" from="PD_2V7_IC_VIA.bottom" to="PD_2V7_CAP_VIA.bottom" thickness={0.2}
      pcbPath={["PD_2V7_IC_VIA.bottom", "PD_2V7_CAP_VIA.bottom"]} />
    <trace name="PD_PROTECTED_DISCHARGE_FEED" from="R_PD_DISCH.pin1" to="U_INPUT.pin6" thickness={0.25}
      pcbPathRelativeTo="R_PD_DISCH.pin1" pcbPath={localPath({ path: [
        "R_PD_DISCH.pin1", { x: -33, y: 17.5 }, ...transfer(-33, 14.3, "top", "bottom"),
        { x: -31, y: 12.3 }, { x: -19.5, y: 12.3 }, ...transfer(-18.7, 11.5, "bottom", "top"),
        { x: -17.75, y: 12.45 }, "U_INPUT.pin6",
      ], origin: { x: -28, y: 17.5 } })} />
    <trace name="PD_PROTECTED_BYPASS_FEED" from="C_INPUT_OUT.pin1" to="U_INPUT.pin6" thickness={0.25} maxLength={3.2}
      pcbPathRelativeTo="C_INPUT_OUT.pin1" pcbPath={localPath({ path: [
        "C_INPUT_OUT.pin1", { x: -16.8, y: 17.7 }, { x: -17.75, y: 16.75 }, "U_INPUT.pin6",
      ], origin: { x: -16, y: 17.7 } })} />
    {resistors.map(([name, resistance, pcbX, pcbY, pcbRotation, a, b, schX, schY]) => <Fragment key={name}>
      <R key={name} name={name} resistance={resistance} partId={name === "R_PD_VS" ? "C513643" : name === "R_PD_DISCH" ? "C54315" : undefined} pcbX={pcbX} pcbY={pcbY} pcbRotation={pcbRotation} schX={(schX + 18.5) * .72} schY={schY - 13} schRotation={["R_PD_SCL", "R_PD_SDA"].includes(name) ? 270 : 0} />
      <trace name={`${name}_A`} from={`.${name} > .pin1`} to={pdV3Vias[name] ? `${pdV3Vias[name]}.top` : N(a)}
        {...(pdV3Vias[name] ? { thickness: 0.2, pcbPathRelativeTo: `${name}.pin1`, pcbPath: name === "R_PD_VALID"
          ? localPath({ path: [`${name}.pin1`, { x: -26.7, y: 11.4 }, `${pdV3Vias[name]}.top`], origin: { x: pcbX, y: pcbY }, rotation: pcbRotation })
          : [`${name}.pin1`, `${pdV3Vias[name]}.top`] } : {})} />
      <trace name={`${name}_B`} from={`.${name} > .pin2`} to={name === "R_INPUT_ILIM" ? "INPUT_ILIM_GND_VIA.top" : N(b)}
        {...(name === "R_INPUT_ILIM" ? { thickness: 0.2, pcbPath: ["R_INPUT_ILIM.pin2", "INPUT_ILIM_GND_VIA.top"] } : {})} />
    </Fragment>)}
    {capacitors.map(([name, capacitance, pcbX, pcbY, pcbRotation, a, b, schX, schY]) => <Fragment key={name}>
      <C key={name} name={name} capacitance={capacitance} partId={name === "C_PD_VDD" ? "C28323" : capacitance === "1uF" ? "C15849" : undefined}
        pcbX={pcbX} pcbY={pcbY} pcbRotation={pcbRotation} schX={(schX + 18.5) * .72} schY={schY - 13}
        {...(name === "C_PD_1V2" ? { maxDecouplingTraceLength: 3.5 } : {})} />
      {name !== "C_PD_2V7" && <trace name={`${name}_A`} from={`.${name} > .pin1`} to={N(a)}
        {...(name === "C_PD_VDD" ? { maxLength: 2.5 } : {})} />}
      <trace name={`${name}_B`} from={`.${name} > .pin2`} to={N(b)}
        {...(name === "C_PD_VDD" ? { maxLength: 3, thickness: 0.2, pcbPathRelativeTo: "C_PD_VDD.pin2",
          pcbPath: ["C_PD_VDD.pin2", { x: 0.885, y: 1.21 }] } : {})}
        {...(name === "C_USB_IN" ? { thickness: 0.2, pcbPathRelativeTo: "C_USB_IN.pin2",
          pcbPath: ["C_USB_IN.pin2", { x: 1.5, y: 0 }] } : {})} />
    </Fragment>)}
    {wires.map(([name, from, to, width]) => <Fragment key={name}><trace name={name} from={from} to={to} width={width ?? 0.2} /></Fragment>)}
    {/* Keep the main ground layer intact: cross to inner2 before the raw-power column. */}
    <via name="PD_CC1_IC_VIA" pcbX={-28.4} pcbY={4.9} holeDiameter={0.3} outerDiameter={0.7}
      fromLayer="top" toLayer="bottom" connectsTo="net.USB_CC1" tented />
    <via name="PD_CC1_EAST_BRIDGE_VIA" pcbX={-32.7} pcbY={3.4} holeDiameter={0.3} outerDiameter={0.7}
      fromLayer="top" toLayer="bottom" connectsTo="net.USB_CC1" tented {...{ ref: attachLogicSupplyInner2Port }} />
    <trace name="PD_CC1" from="U_PD.pin1" to="U_PD.pin2" thickness={0.2}
      pcbPathRelativeTo="U_PD.pin1" pcbPath={["U_PD.pin1", "U_PD.pin2"]} />
    <trace name="PD_CC1_DB" from="U_PD.pin1" to="PD_CC1_IC_VIA.top" thickness={0.2}
      pcbPathRelativeTo="U_PD.pin1" pcbPath={localPath({ path: [
        "U_PD.pin1", { x: -27.45, y: 4.9 }, "PD_CC1_IC_VIA.top",
      ], origin: { x: -26, y: 7 } })} />
    <trace name="PD_CC1_BOTTOM_LAUNCH" from="PD_CC1_IC_VIA.bottom" to="PD_CC1_EAST_BRIDGE_VIA.bottom" thickness={0.2}
      pcbPathRelativeTo="PD_CC1_IC_VIA.bottom" pcbPath={localPath({ path: [
        "PD_CC1_IC_VIA.bottom", { x: -28.4, y: 3.4 }, "PD_CC1_EAST_BRIDGE_VIA.bottom",
      ], origin: { x: -28.4, y: 4.9 } })} />
    <trace name="USB_CC1" from="PD_CC1_EAST_BRIDGE_VIA.inner2" to="USB_CC1_ESCAPE_VIA.inner2" thickness={0.2}
      pcbPathRelativeTo="PD_CC1_EAST_BRIDGE_VIA.inner2" pcbPath={localPath({ path: [
        "PD_CC1_EAST_BRIDGE_VIA.inner2", { x: -32.7, y: 8.5 }, { x: -36.1, y: 11.9 },
        { x: -42.850066, y: 11.9 }, "USB_CC1_ESCAPE_VIA.inner2",
      ], origin: { x: -32.7, y: 3.4 } })} />
    <via name="PD_CC2_IC_VIA" pcbX={-26.3} pcbY={4.1} holeDiameter={0.3} outerDiameter={0.7}
      fromLayer="top" toLayer="bottom" connectsTo="net.USB_CC2" tented />
    <via name="PD_CC2_EAST_BRIDGE_VIA" pcbX={-34.2} pcbY={2.7} holeDiameter={0.3} outerDiameter={0.7}
      fromLayer="top" toLayer="bottom" connectsTo="net.USB_CC2" tented {...{ ref: attachLogicSupplyInner2Port }} />
    <trace name="PD_CC2_DB" from="U_PD.pin4" to="U_PD.pin5" thickness={0.2}
      pcbPathRelativeTo="U_PD.pin4" pcbPath={["U_PD.pin4", "U_PD.pin5"]} />
    <trace name="PD_CC2" from="U_PD.pin4" to="PD_CC2_IC_VIA.top" thickness={0.2}
      pcbPathRelativeTo="U_PD.pin4" pcbPath={localPath({ path: [
        "U_PD.pin4", { x: -25.75, y: 4.65 }, "PD_CC2_IC_VIA.top",
      ], origin: { x: -26, y: 7 } })} />
    <trace name="PD_CC2_BOTTOM_LAUNCH" from="PD_CC2_IC_VIA.bottom" to="PD_CC2_EAST_BRIDGE_VIA.bottom" thickness={0.2}
      pcbPathRelativeTo="PD_CC2_IC_VIA.bottom" pcbPath={localPath({ path: [
        "PD_CC2_IC_VIA.bottom", { x: -26.3, y: 2.7 }, "PD_CC2_EAST_BRIDGE_VIA.bottom",
      ], origin: { x: -26.3, y: 4.1 } })} />
    <trace name="USB_CC2" from="PD_CC2_EAST_BRIDGE_VIA.inner2" to="USB_CC2_ESCAPE_VIA.inner2" thickness={0.2}
      pcbPathRelativeTo="PD_CC2_EAST_BRIDGE_VIA.inner2" pcbPath={localPath({ path: [
        "PD_CC2_EAST_BRIDGE_VIA.inner2", { x: -34.2, y: 6.5 }, { x: -38.2, y: 10.5 },
        { x: -42.35, y: 10.5 }, { x: -42.60006, y: 10.24994 }, "USB_CC2_ESCAPE_VIA.inner2",
      ], origin: { x: -34.2, y: 2.7 } })} />
  </>
}
