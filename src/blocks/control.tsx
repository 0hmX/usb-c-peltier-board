import {
  Stm32, Mcp4725, Lmv393, FaultLatch, VoltageSupervisor,
  Ap63203, Tps54202, Npn, Pnp, Bat54a, LogicInductor, FanInductor,
  FanConnector, NtcConnector, SchmittBuffer, R, C,
} from "../parts"
import { attachLogicSupplyInner2Port } from "../logic-supply-links"

type PassiveRow = [name: string, value: string, x: number, y: number, a: string, b: string, rotation?: number]

// Manual schematic columns: logic/MCU, probes, fan supply and independent fault gates.
// These coordinates have no effect on the separately reviewed PCB placement.
const schematicPositions: Record<string, [number, number]> = {
  U_LOGIC: [-14, 10], L_LOGIC: [-10, 11], C200: [-18, 9], C201: [-14, 12], C202: [-10, 9],
  U_MCU: [0, 9], C203: [-4, 12], C204: [-2, 12], R200: [3, 12], C205: [5, 12],
  R210: [-5, 5], C209: [-5, 3], R211: [-2, 5], C210: [-2, 3],
  R222: [1, 5], R223: [4, 5], C211: [2.5, 3], R224: [1, 1], R225: [4, 1], C212: [2.5, -1],
  U_DAC: [0, -3], C206: [-3, -3], J_SWD: [-6, -1], J_UART: [-6, -5], R231: [-9, -5],
  U_THERMAL: [-13, -3], J_HOT: [-18, -1], R208: [-18, 2], R212: [-15, 0], R213: [-12, 0],
  R214: [-9, -1], R215: [-9, -3], R216: [-9, -7], R217: [-9, -9], C208: [-13, -6],
  J_COLD: [-18, -8], R209: [-18, -5],
  U_LATCH: [13, 9], R201: [8, 11], R202: [8, 9], R203: [8, 7], R204: [11, 12], R205: [16, 12], C207: [17, 9],
  U_INPUT_LATCH: [13, 3], R226: [9, 5], R227: [9, 3], R236: [16, 6], C217: [17, 3], D_INPUT_PERMISSION: [9, 1],
  U_SUPERVISOR: [17, 0], C216: [17, -2], Q_PD_LATCH: [9, -3], R206: [6, -3], R207: [6, -5],
  Q_FAULT_SOURCE: [14, -3], R232: [11, -5], R233: [14, -5], Q_FAULT_CLEAR: [14, -7], R234: [11, -7], R235: [17, -7],
  U_FAN: [0, -9], L_FAN: [4, -9], C214: [0, -6], C213: [-4, -7], C219: [-4, -9], C220: [-4, -11],
  C215: [4, -7], C218: [7, -7], R228: [1, -12], R229: [4, -12], C221: [7, -12], J_FAN: [7, -10],
  Q_FAN_PWM: [14, -11], R218: [10, -10], R219: [10, -12], R220: [17, -10], R221: [17, -12],
  U_CLEAR_BUFFER: [20, 9], C222: [20, 12], U_CLOCK_BUFFER: [20, 3], C223: [20, 6],
  Q_INPUT_CLEAR: [20, -4], R237: [20, -1], R238: [20, -7], R239: [20, -9],
  R240: [9, -13], R241: [12, -13], R242: [15, -13], R243: [20, -12],
}
const sch = (name: string) => ({ schX: schematicPositions[name][0], schY: schematicPositions[name][1] })

// Connections are physical pin numbers. In the 20-pin MCU, unused GPIOs
// internally bonded to PB6/PB7/PB9/PA8/PA14 must remain in analog/input mode.
const resistors: PassiveRow[] = [
  ["R200", "10k", 6, -6, "V3V3", "MCU_NRST"],
  ["R201", "100k", -6.5, -18, "TEC_REQUEST", "GND"],
  ["R202", "4.7k", 4, -18, "TEC_REQUEST", "TEC_CLEAR_RAW"],
  ["R203", "100k", 4, -20.5, "TEC_CLEAR_RAW", "GND"],
  ["R204", "100k", 11.5, -16, "MCU_ARM", "GND"],
  ["R205", "100k", 12, -14, "TEC_SAFE_EN", "GND"],
  ["R206", "10k", 8.5, -11, "PD_VALID_N", "PD_LATCH_INHIBIT"],
  ["R207", "100k", 11.5, -11, "PD_LATCH_INHIBIT", "GND"],
  ["R208", "10k", 13.5, -27, "V3V3", "HOT_RAW"],
  ["R209", "10k", 24, -27, "V3V3", "COLD_RAW"],
  ["R210", "1k", 3, -5.5, "HOT_RAW", "HOT_ADC"],
  ["R211", "1k", 9, -5.5, "COLD_RAW", "COLD_ADC"],
  ["R212", "100k", 20.5, -25, "HOT_RAW", "HOT_HALF"],
  ["R213", "100k", 23.5, -25, "HOT_HALF", "GND"],
  ["R214", "100k", 27, -23, "V3V3", "HOT_LOW"],
  ["R215", "10k", 30, -24.5, "HOT_LOW", "GND"],
  ["R216", "13.3k", 27, -20.5, "V3V3", "HOT_HIGH"],
  ["R217", "10k", 28, -18.5, "HOT_HIGH", "GND"],
  ["R218", "4.7k", 13.5, -25, "FAN_PWM_DRIVE", "FAN_PWM_BASE"],
  ["R219", "100k", 10.5, -27, "FAN_PWM_BASE", "GND"],
  ["R220", "10k", 29, -27, "V3V3", "FAN_TACH"],
  ["R221", "1k", 27, -25, "FAN_TACH", "FAN_TACH_MCU"],
  ["R222", "100k", 12, -5.5, "VBUS_TEC", "VBUS_ADC"],
  ["R223", "10k", 12.5, -7.5, "VBUS_ADC", "GND"],
  ["R224", "100k", 15, -5.5, "TEC_POS", "VOUT_ADC"],
  ["R225", "10k", 18, -5.5, "VOUT_ADC", "GND"],
  ["R226", "100k", -7, -21, "MCU_RUN", "GND"],
  ["R227", "100k", -7, -23.5, "POWER_BUDGET_HIGH", "GND"],
  ["R228", "100k", 35.5, -15.5, "V12_FAN", "FAN_FB"],
  ["R229", "5.23k", 35.5, -18, "FAN_FB", "GND"],
  ["R231", "1k", -8, -27, "UART_RX", "UART_RX_MCU"],
  ["R232", "10k", 14, -23, "INPUT_FAULT_N", "FAULT_PNP_BASE"],
  ["R233", "100k", 16.5, -21, "V3V3", "FAULT_PNP_BASE"],
  ["R234", "10k", 16.5, -19, "FAULT_SOURCE", "FAULT_NPN_BASE"],
  ["R235", "100k", 19.5, -15, "FAULT_NPN_BASE", "GND"],
  ["R236", "100k", -12, -24.5, "INPUT_ARMED", "GND"],
  ["R237", "10k", -25.5, -9, "V3V3", "INPUT_CLEAR_RAW"],
  ["R238", "10k", -18, -15.5, "FAULT_SOURCE", "INPUT_FAULT_NPN_BASE"],
  ["R239", "100k", -19, -18, "INPUT_FAULT_NPN_BASE", "GND"],
  ["R240", "100k", -25.5, -18.5, "TEC_CLEAR_N", "GND"],
  ["R241", "100k", -25.5, -11.5, "INPUT_CLEAR_N", "GND"],
  ["R242", "100k", -22, -25, "ARM_CLK", "GND"],
  ["R243", "100k", -25.5, -25, "RUN_CLK", "GND"],
]

type CapacitorRow = [...PassiveRow, partId?: string]
const capacitors: CapacitorRow[] = [
  ["C200", "4.7uF", -8, -12, "VBUS_RAW", "GND", 90, "C237304"],
  ["C201", "100nF", -15.5, -9.5, "LOGIC_BST", "LOGIC_SW"],
  ["C202", "22uF", -8, -6, "V3V3", "GND", 90, "C602037"],
  ["C203", "100nF", 5.5, -10.5, "V3V3", "GND"],
  ["C204", "4.7uF", 5, -13, "V3V3", "GND", 90, "C19666"],
  ["C205", "100nF", 8, -8, "MCU_NRST", "GND"],
  ["C206", "100nF", -3.5, -21.5, "V3V3", "GND"],
  ["C207", "100nF", 10.5, -23, "V3V3", "GND"],
  ["C208", "100nF", 24.5, -15, "V3V3", "GND"],
  ["C209", "100nF", 5.5, -3.5, "HOT_ADC", "GND"],
  ["C210", "100nF", 8.5, -3.5, "COLD_ADC", "GND"],
  ["C211", "100nF", 11.5, -3.5, "VBUS_ADC", "GND"],
  ["C212", "100nF", 14.5, -3.5, "VOUT_ADC", "GND"],
  ["C213", "10uF", 31.5, -10, "VBUS_TEC", "GND", 90, "C380537"],
  ["C214", "100nF", 35.5, -13.5, "FAN_BST", "FAN_SW"],
  ["C215", "22uF", 42, -17, "V12_FAN", "GND", 90, "C309062"],
  ["C216", "100nF", 7, -26.5, "V3V3", "GND"],
  ["C217", "100nF", -16.5, -24.5, "V3V3", "GND"],
  ["C218", "22uF", 46, -17, "V12_FAN", "GND", 90, "C309062"],
  ["C219", "10uF", 31.5, -15.5, "VBUS_TEC", "GND", 90, "C380537"],
  ["C220", "10uF", 31.5, -21, "VBUS_TEC", "GND", 90, "C380537"],
  ["C221", "100pF", 35.5, -20.5, "V12_FAN", "FAN_FB", 0, "C14858"],
  ["C222", "100nF", -22, -11.4, "V3V3", "GND", 90],
  ["C223", "100nF", -22, -18.5, "V3V3", "GND", 90],
]
// Actual local-input and bulk-bank envelopes; other bypasses keep the native
// default limit. Explicit upstream distribution traces have separate bounds.
const capacitorRouteLimits: Record<string, number> = { C200: 4.1, C203: 3, C204: 11.9, C206: 14.4, C207: 7.2, C208: 6.6, C213: 2.2, C216: 5, C217: 5, C219: 9, C220: 9, C222: 1.7, C223: 1.7 }
const capacitorManualGrounds = new Set(["C200", "C211", "C212", "C213", "C222", "C223"])

export function ControlBlock() {
  return <>
    {/* Raw-VBUS logic supply operates at the initial 5 V PD voltage. */}
    <Ap63203 name="U_LOGIC" {...sch("U_LOGIC")} pcbX={-12} pcbY={-11} connections={{
      pin1: "net.V3V3", pin2: "net.VBUS_RAW", pin3: "net.VBUS_RAW",
      pin5: "net.LOGIC_SW", pin6: "net.LOGIC_BST",
    }} />
    <LogicInductor name="L_LOGIC" {...sch("L_LOGIC")} pcbX={-12} pcbY={-6} connections={{
      pin1: "net.LOGIC_SW", pin2: "net.V3V3",
    }} />
    <Stm32 name="U_MCU" {...sch("U_MCU")} pcbX={0} pcbY={-10} pcbRotation={90} connections={{
      pin1: "net.I2C_SDA", pin2: "net.TEC_REQUEST", pin3: "net.PD_ALERT",
      pin4: "net.V3V3", pin5: "net.GND", pin6: "net.MCU_NRST",
      pin7: "net.HOT_ADC", pin8: "net.COLD_ADC", pin9: "net.UART_TX",
      pin10: "net.UART_RX_MCU", pin11: "net.VOUT_ADC", pin12: "net.VBUS_ADC",
      pin13: "net.FAN_PWM_DRIVE", pin14: "net.FAN_TACH_MCU",
      pin15: "net.MCU_RUN", pin16: "net.MCU_ARM", pin17: "net.POWER_BUDGET_HIGH",
      pin18: "net.SWDIO", pin19: "net.SWCLK", pin20: "net.I2C_SCL",
    }} />
    {/* A fresh ARM edge is required after asynchronous hardware clear. */}
    <FaultLatch name="U_LATCH" {...sch("U_LATCH")} pcbX={8} pcbY={-19} connections={{
      pin1: "net.ARM_CLK", pin2: "net.V3V3", pin4: "net.GND",
      pin5: "net.TEC_SAFE_EN", pin6: "net.TEC_CLEAR_N",
      pin7: "net.V3V3", pin8: "net.V3V3",
    }} />
    <VoltageSupervisor name="U_SUPERVISOR" {...sch("U_SUPERVISOR")} pcbX={7} pcbY={-23.5} connections={{
      pin1: "net.GND", pin2: "net.INPUT_FAULT_N", pin3: "net.V3V3",
    }} />
    {/* Independent input fault latch requires a new RUN edge after a fault.
        The PD block ANDs its Q with live MCU_RUN to preserve reset fail-off. */}
    <FaultLatch name="U_INPUT_LATCH" {...sch("U_INPUT_LATCH")} pcbX={-14} pcbY={-21} connections={{
      pin1: "net.RUN_CLK", pin2: "net.V3V3", pin4: "net.GND",
      pin5: "net.INPUT_ARMED", pin6: "net.INPUT_CLEAR_N",
      pin7: "net.V3V3", pin8: "net.V3V3",
    }} />
    {/* BAT54A common anode pin3: a low input-latch Q clamps eFuse EN. */}
    <Bat54a name="D_INPUT_PERMISSION" {...sch("D_INPUT_PERMISSION")} pcbX={-10} pcbY={-17.5} connections={{
      pin1: "net.INPUT_ARMED", pin3: "net.INPUT_ENABLE",
    }} />
    <Npn name="Q_PD_LATCH" {...sch("Q_PD_LATCH")} pcbX={8} pcbY={-14} connections={{
      pin1: "net.PD_LATCH_INHIBIT", pin2: "net.GND", pin3: "net.INPUT_FAULT_N",
    }} />
    {/* A low hardware fault turns on this isolated low-VOL clear sink.
        TEC_REQUEST can clear the TEC latch without disabling cooldown. */}
    <Pnp name="Q_FAULT_SOURCE" {...sch("Q_FAULT_SOURCE")} pcbX={13} pcbY={-20} connections={{
      pin1: "net.FAULT_PNP_BASE", pin2: "net.V3V3", pin3: "net.FAULT_SOURCE",
    }} />
    <Npn name="Q_FAULT_CLEAR" {...sch("Q_FAULT_CLEAR")} pcbX={16} pcbY={-16} connections={{
      pin1: "net.FAULT_NPN_BASE", pin2: "net.GND", pin3: "net.TEC_CLEAR_RAW",
    }} />
    <Npn name="Q_INPUT_CLEAR" {...sch("Q_INPUT_CLEAR")} pcbX={-19} pcbY={-6.5} connections={{
      pin1: "net.INPUT_FAULT_NPN_BASE", pin2: "net.GND", pin3: "net.INPUT_CLEAR_RAW",
    }} />
    {/* True Schmitt buffers accept slow raw fault/reset edges. Their driven
        outputs meet the latch's dynamic input requirements; D/PRE stay static. */}
    <SchmittBuffer name="U_CLEAR_BUFFER" {...sch("U_CLEAR_BUFFER")} pcbX={-22} pcbY={-15} connections={{
      pin1: "net.TEC_CLEAR_RAW", pin2: "net.GND", pin3: "net.INPUT_CLEAR_RAW",
      pin4: "net.INPUT_CLEAR_N", pin5: "net.V3V3", pin6: "net.TEC_CLEAR_N",
    }} />
    <SchmittBuffer name="U_CLOCK_BUFFER" {...sch("U_CLOCK_BUFFER")} pcbX={-22} pcbY={-22.1} connections={{
      pin1: "net.MCU_ARM", pin2: "net.GND", pin3: "net.MCU_RUN",
      pin4: "net.RUN_CLK", pin6: "net.ARM_CLK",
    }} />
    <trace name="CLEAR_BUFFER_BYPASS" from="C222.pin1" to="U_CLEAR_BUFFER.pin5"
      thickness={0.2} maxLength={1.7} pcbPath={["C222.pin1", "U_CLEAR_BUFFER.pin5"]} />
    <trace name="CLOCK_BUFFER_BYPASS" from="C223.pin1" to="U_CLOCK_BUFFER.pin5"
      thickness={0.2} maxLength={1.7} pcbPath={["C223.pin1", "U_CLOCK_BUFFER.pin5"]} />
    <trace name="INPUT_LATCH_V3_TRUNK" from="C223.pin1" to="U_INPUT_LATCH.pin7"
      thickness={0.2} maxLength={7.4} pcbPathRelativeTo="C223.pin1"
      pcbPath={["C223.pin1", { x: -0.7, y: -3.4 }, { x: -2.75, y: -5.45 }, "U_INPUT_LATCH.pin7"]} />
    <trace name="CLEAR_BUFFER_V3_TRUNK" from="TP03.pin1" to="U_CLEAR_BUFFER.pin5"
      thickness={0.2} pcbPathRelativeTo="TP03.pin1"
      pcbPath={["TP03.pin1", { x: 0.4, y: 0.4 }, { x: 5.45, y: 0.4 }, { x: 6, y: -0.15 }, "U_CLEAR_BUFFER.pin5"]} />
    {/* Supply escapes are source-owned so ordinary SMT pins cannot become
        native via-in-pad targets. The short local bypass stays on top. */}
    <via name="CLOCK_VCC_ESCAPE" pcbX={-23.5} pcbY={-19.1}
      holeDiameter={0.3} outerDiameter={0.7} fromLayer="top" toLayer="bottom"
      connectsTo="net.V3V3" tented {...{ ref: attachLogicSupplyInner2Port }} />
    <trace name="CLOCK_VCC_OFF_PAD" from="U_CLOCK_BUFFER.pin5" to="CLOCK_VCC_ESCAPE.top"
      thickness={0.2} maxLength={4} pcbPathRelativeTo="U_CLOCK_BUFFER"
      pcbPath={["U_CLOCK_BUFFER.pin5", { x: 0, y: 2.1 }, { x: -0.9, y: 3 },
        "CLOCK_VCC_ESCAPE.top"]} />
    <trace name="CLOCK_VCC_OFF_PAD_CONTINUATION" from="CLOCK_VCC_ESCAPE.top" to="net.V3V3" thickness={0.2} />
    <via name="INPUT_CLEAR_PULLUP_VCC_ESCAPE" pcbX={-27.5} pcbY={-9}
      holeDiameter={0.3} outerDiameter={0.7} fromLayer="top" toLayer="bottom"
      connectsTo="net.V3V3" tented />
    <trace name="INPUT_CLEAR_PULLUP_VCC_OFF_PAD" from="R237.pin1" to="INPUT_CLEAR_PULLUP_VCC_ESCAPE.top"
      thickness={0.2} maxLength={1.3}
      pcbPath={["R237.pin1", "INPUT_CLEAR_PULLUP_VCC_ESCAPE.top"]} />
    <trace name="INPUT_CLEAR_PULLUP_VCC_OFF_PAD_CONTINUATION" from="INPUT_CLEAR_PULLUP_VCC_ESCAPE.top" to="net.V3V3" thickness={0.2} />
    {/* Preserve the shared open-collector fault node across the local control
        congestion. The bound includes 3.2 mm travel through two full barrels. */}
    <trace name="SHARED_FAULT_LOCAL_BRIDGE" from="Q_PD_LATCH.pin3" to="U_SUPERVISOR.pin2"
      thickness={0.2} maxLength={14} pcbPathRelativeTo="Q_PD_LATCH.pin3"
      pcbPath={["Q_PD_LATCH.pin3", { x: -1.01, y: -1.3 },
        { x: -1.01, y: -1.3, via: true, fromLayer: "top", toLayer: "bottom" },
        { x: -1.01, y: -1.3 }, { x: 0.05, y: -2.36 }, { x: 0.05, y: -6 },
        { x: 1.2, y: -7.15 },
        { x: 1.2, y: -7.15, via: true, fromLayer: "bottom", toLayer: "top" },
        { x: 1.2, y: -7.15 }, { x: 0.05, y: -8.3 }, "U_SUPERVISOR.pin2"]} />
    <via name="CLEAR_BUFFER_GROUND_VIA" pcbX={-22.9} pcbY={-10.7}
      holeDiameter={0.3} outerDiameter={0.7} fromLayer="top" toLayer="bottom"
      connectsTo="net.GND" tented />
    <via name="CLOCK_BUFFER_GROUND_VIA" pcbX={-22.9} pcbY={-17.8}
      holeDiameter={0.3} outerDiameter={0.7} fromLayer="top" toLayer="bottom"
      connectsTo="net.GND" tented />
    <trace name="CLEAR_BUFFER_GROUND" from="C222.pin2" to="net.GND"
      thickness={0.2} maxLength={3} pcbPath={["C222.pin2", "CLEAR_BUFFER_GROUND_VIA.top"]} />
    <trace name="CLOCK_BUFFER_GROUND" from="C223.pin2" to="net.GND"
      thickness={0.2} maxLength={1.7} pcbPath={["C223.pin2", "CLOCK_BUFFER_GROUND_VIA.top"]} />
    <Mcp4725 name="U_DAC" {...sch("U_DAC")} pcbX={0} pcbY={-20} connections={{
      pin1: "net.TEC_DAC", pin2: "net.GND", pin3: "net.V3V3",
      pin4: "net.I2C_SDA", pin5: "net.I2C_SCL", pin6: "net.GND",
    }} />
    {/* Raw sensor open = high; hot/short = low. The scaled input stays
        within LMV393 common-mode range for the complete sensor range. */}
    <Lmv393 name="U_THERMAL" {...sch("U_THERMAL")} pcbX={21} pcbY={-20} connections={{
      pin1: "net.INPUT_FAULT_N", pin2: "net.HOT_LOW", pin3: "net.HOT_HALF",
      pin4: "net.GND", pin5: "net.HOT_HIGH", pin6: "net.HOT_HALF",
      pin7: "net.INPUT_FAULT_N", pin8: "net.V3V3",
    }} />
    {/* Fan supply stays on during a TEC-only fault for cooldown. */}
    <Tps54202 name="U_FAN" {...sch("U_FAN")} pcbX={35.5} pcbY={-10} connections={{
      pin1: "net.GND", pin2: "net.FAN_SW", pin3: "net.VBUS_TEC",
      pin4: "net.FAN_FB", pin6: "net.FAN_BST",
    }} />
    {/* Fan EN is a low-current logic branch; its full-through barrel sits
        between the two pin rows, clear of both switch and feedback lands. */}
    <via name="FAN_ENABLE_VCC_ESCAPE" pcbX={35.9} pcbY={-9.8}
      holeDiameter={0.3} outerDiameter={0.7} fromLayer="top" toLayer="bottom"
      connectsTo="net.V3V3" tented {...{ ref: attachLogicSupplyInner2Port }} />
    <trace name="FAN_ENABLE_VCC_OFF_PAD" from="U_FAN.pin5" to="FAN_ENABLE_VCC_ESCAPE.top"
      thickness={0.2} maxLength={1.4} pcbPathRelativeTo="U_FAN"
      pcbPath={["U_FAN.pin5", { x: 0, y: 0.8 }, { x: 0.4, y: 0.4 },
        "FAN_ENABLE_VCC_ESCAPE.top"]} />
    <trace name="FAN_ENABLE_VCC_OFF_PAD_CONTINUATION" from="FAN_ENABLE_VCC_ESCAPE.top" to="net.V3V3" thickness={0.2} />
    <FanInductor name="L_FAN" {...sch("L_FAN")} pcbX={42.5} pcbY={-10} connections={{
      pin1: "net.FAN_SW", pin2: "net.V12_FAN",
    }} />
    <Npn name="Q_FAN_PWM" {...sch("Q_FAN_PWM")} pcbX={17} pcbY={-26} connections={{
      pin1: "net.FAN_PWM_BASE", pin2: "net.GND", pin3: "net.FAN_PWM",
    }} />
    <FanConnector name="J_FAN" {...sch("J_FAN")} pcbX={32} pcbY={-31} connections={{
      pin1: "net.GND", pin2: "net.V12_FAN", pin3: "net.FAN_TACH", pin4: "net.FAN_PWM",
    }} />
    <NtcConnector name="J_HOT" {...sch("J_HOT")} pcbX={13} pcbY={-31} connections={{
      pin1: "net.HOT_RAW", pin2: "net.GND",
    }} />
    <NtcConnector name="J_COLD" {...sch("J_COLD")} pcbX={21} pcbY={-31} connections={{
      pin1: "net.COLD_RAW", pin2: "net.GND",
    }} />
    <silkscreentext text="HOT" pcbX={13} pcbY={-34} fontSize={1.7} />
    <silkscreentext text="COLD" pcbX={21} pcbY={-34} fontSize={1.7} />
    <FanConnector name="J_SWD" {...sch("J_SWD")} pcbX={-2} pcbY={-31} connections={{
      pin1: "net.V3V3", pin2: "net.SWDIO", pin3: "net.SWCLK", pin4: "net.GND",
    }} />
    <FanConnector name="J_UART" {...sch("J_UART")} pcbX={-16} pcbY={-31} connections={{
      pin1: "net.GND", pin2: "net.UART_TX", pin3: "net.UART_RX", pin4: "net.V3V3",
    }} />
    <silkscreentext text="FAN" pcbX={32} pcbY={-34} fontSize={1.7} />
    <silkscreentext text="SWD" pcbX={-2} pcbY={-34} fontSize={1.7} />
    <silkscreentext text="UART" pcbX={-16} pcbY={-34} fontSize={1.7} />
    {/* Fan-only input support: 0.5 mm carries the qualified <=0.3 A input
        profile. The 45-degree west corridor avoids alternating GND pads. */}
    <trace name="FAN_INPUT_CAP_BANK_12" from="C213.pin1" to="C219.pin1" thickness={0.5} maxLength={9}
      pcbPathRelativeTo="C213.pin1"
      pcbPath={["C213.pin1", { x: -1.565, y: 1.2 }, { x: -2.215, y: 1.85 },
        { x: -6.415, y: 1.85 }, { x: -7.065, y: 1.2 }, "C219.pin1"]} />
    <trace name="FAN_INPUT_CAP_BANK_23" from="C219.pin1" to="C220.pin1" thickness={0.5} maxLength={9}
      pcbPathRelativeTo="C219.pin1"
      pcbPath={["C219.pin1", { x: -1.565, y: 1.2 }, { x: -2.215, y: 1.85 },
        { x: -6.415, y: 1.85 }, { x: -7.065, y: 1.2 }, "C220.pin1"]} />
    <via name="FAN_INPUT_GROUND_VIA" pcbX={29.4} pcbY={-8.435}
      holeDiameter={0.3} outerDiameter={0.7} fromLayer="top" toLayer="bottom"
      connectsTo="net.GND" tented />
    <trace name="FAN_INPUT_GROUND" from="C213.pin2" to="net.GND"
      thickness={0.5} maxLength={4.5} pcbPath={["C213.pin2", "FAN_INPUT_GROUND_VIA.top"]} />
    {/* A deliberate ground escape prevents native fanout crossing that rail. */}
    <trace name="HOT_WINDOW_GROUND_ESCAPE" from="R217.pin2" to="net.GND" thickness={0.2}
      pcbPathRelativeTo="R217.pin2"
      pcbPath={["R217.pin2", { x: 0.8, y: 0.8 }, { x: 0.6, y: 1 }]} />
    <via name="HOT_WINDOW_GROUND_VIA" pcbX={28.6} pcbY={-17.5}
      holeDiameter={0.3} outerDiameter={0.7} fromLayer="top" toLayer="bottom"
      connectsTo="net.GND" tented />
    {/* Quiet ADC tap only. The separately sized upstream fan feed must supply
        the cap bank; this bottom-layer sense trace is not a fan power trunk. */}
    <trace name="PROTECTED_INPUT_ADC_FEED" from="R222.pin1" to="FAN_INPUT_PICKUP.bottom" thickness={0.2}
      pcbPathRelativeTo="R222.pin1"
      pcbPath={["R222.pin1", { x: -1.85, y: 1.1 }, { x: -2, y: 1.1 },
        { x: -2, y: 1.1, via: true, fromLayer: "top", toLayer: "bottom" },
        { x: -2, y: 1.1 }, { x: 6, y: 1.1 }, { x: 13.165, y: -6.065 },
        "FAN_INPUT_PICKUP.bottom"]} />
    <via name="FAN_INPUT_PICKUP" pcbX={29.5} pcbY={-11.565}
      holeDiameter={0.3} outerDiameter={0.7} fromLayer="top" toLayer="bottom"
      connectsTo="net.VBUS_TEC" tented />
    {/* The shared fan-feed barrel and stub carry power independently of the ADC. */}
    <trace name="FAN_INPUT_PICKUP_TO_CAP" from="FAN_INPUT_PICKUP.top" to="C213.pin1"
      thickness={0.8} maxLength={2.1} pcbPath={["FAN_INPUT_PICKUP.top", "C213.pin1"]} />
    {/* Local fan VIN avoids the chip's top-layer GND/SW pads. */}
    <trace name="FAN_LOCAL_VIN" from="FAN_INPUT_PICKUP.bottom" to="U_FAN.pin3"
      thickness={0.5} maxLength={12} pcbPathRelativeTo="FAN_INPUT_PICKUP.bottom"
      pcbPath={["FAN_INPUT_PICKUP.bottom", { x: 0.415, y: 0.415 },
        { x: 6.75, y: 0.415 }, { x: 8, y: -0.835 },
        { x: 8, y: -0.835, via: true, fromLayer: "bottom", toLayer: "top" },
        { x: 8, y: -0.835 }, "U_FAN.pin3"]} />
    {/* Low-current FB/FF supply tap; the fan output-current path stays separate. */}
    <trace name="FAN_FEEDBACK_SUPPLY_TAP" from="R228.pin1" to="C221.pin1"
      thickness={0.2} maxLength={6} pcbPathRelativeTo="R228.pin1"
      pcbPath={["R228.pin1", { x: 0, y: -0.75 }, { x: 0, y: -4.28 }, "C221.pin1"]} />
    {/* Current-carrying output bypasses the quiet FB/FF supply tap entirely. */}
    <trace name="FAN_OUTPUT_TO_CAP_BANK" from="L_FAN.pin2" to="C218.pin1"
      thickness={0.5} maxLength={14} pcbPathRelativeTo="L_FAN.pin2"
      pcbPath={["L_FAN.pin2", { x: 3.5, y: -0.75 }, { x: 6.6, y: -0.75 },
        { x: 6.6, y: -5.465 }, "C218.pin1"]} />
    <trace name="FAN_OUTPUT_CAP_BANK" from="C218.pin1" to="C215.pin1"
      thickness={0.5} maxLength={4.1} pcbPath={["C218.pin1", "C215.pin1"]} />
    <trace name="FAN_OUTPUT_LOAD_FEED" from="C215.pin1" to="J_FAN.pin2"
      thickness={0.5} maxLength={19} pcbPathRelativeTo="C215.pin1"
      pcbPath={["C215.pin1", { x: -6, y: 0 }, { x: -12, y: 6 },
        { x: -12, y: 9 }, "J_FAN.pin2"]} />
    <trace name="TEC_OUTPUT_ADC_FEED" from="R224.pin1" to="C29.pin1" thickness={0.2} maxLength={23}
      pcbPathRelativeTo="R224.pin1"
      pcbPath={["R224.pin1", { x: 0.1, y: -0.85 }, { x: 0.1, y: -2.3 },
        { x: 9, y: -2.3 }, { x: 12.130079, y: 0.830079 }, "C29.pin1"]} />
    {/* Real always-on regulator branch, rated for the bounded internal load.
        The broad USB/eFuse power collector remains separately reviewed. */}
    <trace name="LOGIC_RAW_INPUT_FEED" from="C_USB_IN.pin1" to="C200.pin1" thickness={0.4} maxLength={80}
      pcbPathRelativeTo="C_USB_IN.pin1"
      pcbPath={["C_USB_IN.pin1", { x: -0.72, y: 1.2 },
        { x: -0.72, y: 1.2, via: true, fromLayer: "top", toLayer: "bottom" },
        { x: -0.72, y: 1.2 }, { x: 3.2, y: 1.2 }, { x: 4, y: 0.4 },
        { x: 4, y: -31.775 }, { x: 4.8, y: -32.575 }, { x: 32.6, y: -32.575 },
        { x: 32.6, y: -32.575, via: true, fromLayer: "bottom", toLayer: "top" },
        { x: 32.6, y: -32.575 }, "C200.pin1"]} />
    {/* Engineering limits distinguish upstream distribution from the actual
        local input loop; core's inferred 1 mm applies to every capacitor tap. */}
    <trace name="LOGIC_LOCAL_VIN" from="C200.pin1" to="U_LOGIC.pin3" thickness={0.4} maxLength={4.1}
      pcbPathRelativeTo="C200.pin1"
      pcbPath={["C200.pin1", { x: -1.575, y: 2 }, { x: -0.525, y: 3.05 }, "U_LOGIC.pin3"]} />
    <trace name="LOGIC_LOCAL_INPUT_RETURN" from="U_LOGIC.pin4" to="net.GND"
      thickness={0.4} maxLength={3.5} pcbPathRelativeTo="U_LOGIC.pin4"
      pcbPath={["U_LOGIC.pin4", { x: 1.475, y: 0.575 }, "C200.pin2"]} />
    <via name="LOGIC_INPUT_RETURN_VIA" pcbX={-6.4} pcbY={-10.425}
      holeDiameter={0.3} outerDiameter={0.7} fromLayer="top" toLayer="bottom"
      connectsTo="net.GND" tented />
    <trace name="LOGIC_INPUT_RETURN_TO_PLANE" from="C200.pin2" to="net.GND"
      thickness={0.4} maxLength={3.3} pcbPath={["C200.pin2", "LOGIC_INPUT_RETURN_VIA.top"]} />
    <trace name="LOGIC_LOCAL_ENABLE" from="U_LOGIC.pin3" to="U_LOGIC.pin2" thickness={0.4}
      pcbPath={["U_LOGIC.pin3", "U_LOGIC.pin2"]} />
    {resistors.map(([name, resistance, pcbX, pcbY, a, b, pcbRotation]) =>
      <R key={name} name={name} resistance={resistance} pcbX={pcbX} pcbY={pcbY}
        {...sch(name)}
        pcbRotation={pcbRotation} connections={{ ...(name === "R237" ? {} : { pin1: `net.${a}` }),
          ...(name === "R217" ? {} : { pin2: `net.${b}` }) }} />)}
    {capacitors.map(([name, capacitance, pcbX, pcbY, a, b, pcbRotation, partId]) =>
      <C key={name} name={name} capacitance={capacitance} pcbX={pcbX} pcbY={pcbY}
        {...sch(name)}
        pcbRotation={pcbRotation} partId={partId}
        maxDecouplingTraceLength={capacitorRouteLimits[name]}
        connections={{ pin1: `net.${a}`,
          ...(capacitorManualGrounds.has(name) ? {} : { pin2: `net.${b}` }) }} />)}
  </>
}
