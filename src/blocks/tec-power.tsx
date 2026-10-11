import type { SourcePadConnectionPlan } from "../source-pad-connections"
import { C, R, Lt3741, PowerNfet, PowerInductor, PowerShunt, Schottky, Pnp, Npn, Ina219, TecTerminal } from "../parts"

/** Filtered, unidirectional CC/CV buck. All parts use audited JLCPCB-sourced footprints.
 *  Nominal v0: 11.21 V ceiling, ~5 A commanded; hardware current-limit target
 *  below 6 A; qualification required for unspecified sense-filter bias errors.
 *  See design-notes/power.md for tolerance and compensation calculations.
 */
export const TecPower = () => (
  <>
    <Lt3741 name="U2" pcbX={-5} pcbY={12} schX={0} schY={0}
      connections={{
        pin1: "net.TEC_VCC_INT", pin3: "net.VBUS_TEC",
        pin4: "net.TEC_EN_UVLO", pin5: "net.TEC_VREF", pin6: "net.TEC_HARD_LIMIT",
        pin7: "net.GND", pin8: "net.TEC_CURRENT_COMMAND", pin9: "net.TEC_SS",
        pin10: "net.TEC_FB", pin11: "net.TEC_SENSE_P_FILTERED", pin12: "net.TEC_SENSE_N_FILTERED",
        pin13: "net.TEC_VC", pin14: "net.TEC_RT",
        pin17: "net.TEC_HG", pin18: "net.TEC_SW", pin19: "net.TEC_BOOT",
        pin20: "net.TEC_LG",
      }} />

    <PowerNfet name="Q20" pcbX={4} pcbY={18} pcbRotation={90} schX={6} schY={-1}
      connections={{ pin1: "net.TEC_SW", pin2: "net.TEC_SW", pin3: "net.TEC_SW", pin4: "net.TEC_HIGH_GATE", pin5: "net.VBUS_TEC" }} />
    <PowerNfet name="Q21" pcbX={4} pcbY={9} pcbRotation={270} schX={6} schY={2}
      connections={{ pin4: "net.TEC_LOW_GATE", pin5: "net.TEC_SW" }} />
    <PowerInductor name="L2" pcbX={16.5} pcbY={12} schX={9} schY={0}
      connections={{ pin1: "net.TEC_SW", pin2: "net.TEC_INDUCTOR_OUT" }} />
    <PowerShunt name="R20" pcbX={28.5} pcbY={12} schX={12} schY={0}
      connections={{ pin1: "net.TEC_INDUCTOR_OUT", pin2: "net.TEC_POS" }} />

    <R name="R21" resistance="2.2" pcbX={-4} pcbY={17.5} pcbRotation={90} schX={3.5} schY={-1}
      connections={{ pin1: "net.TEC_HG", pin2: "net.TEC_HIGH_GATE" }} />
    <R name="R22" resistance="2.2" pcbX={-8} pcbY={17.5} pcbRotation={90} schX={3.5} schY={2}
      connections={{ pin1: "net.TEC_LG", pin2: "net.TEC_LOW_GATE" }} />
    <R name="R23" resistance="100k" pcbX={10} pcbY={20} schX={7} schY={-2.5}
      connections={{ pin1: "net.TEC_HIGH_GATE", pin2: "net.TEC_SW" }} />
    <R name="R24" resistance="100k" pcbX={10} pcbY={3} schX={7} schY={3.5}
      connections={{ pin1: "net.TEC_LOW_GATE", pin2: "net.GND" }} />

    <Schottky name="D20" pcbX={-10.5} pcbY={19} pcbRotation={90} schX={-3} schY={-2}
      connections={{ pin1: "net.TEC_BOOT", pin2: "net.TEC_VCC_INT" }} />
    <C name="C20" capacitance="220nF" partId="C64705" pcbX={-6.5} pcbY={18.7} pcbRotation={90} schX={-1} schY={-3}
      connections={{ pin1: "net.TEC_BOOT", pin2: "net.TEC_SW" }} />
    <C name="C21" capacitance="22uF" partId="C45783" maxDecouplingTraceLength={6} pcbX={-11} pcbY={8} pcbRotation={90} schX={-4} schY={-1}
      connections={{ pin1: "net.TEC_VCC_INT", pin2: "net.GND" }} />
    <C name="C41" capacitance="22uF" partId="C45783" pcbX={-11} pcbY={4} pcbRotation={90} schX={-6} schY={-1}
      connections={{ pin1: "net.TEC_VCC_INT", pin2: "net.GND" }} />
    <C name="C22" capacitance="100nF" pcbX={-8.5} pcbY={5.25} schX={-4} schY={1}
      connections={{ pin1: "net.TEC_VCC_INT" }} />
    <C name="C24" capacitance="1uF" partId="C28323" pcbX={-7.25} pcbY={6.95} schX={-3} schY={3}
      connections={{ pin1: "net.VBUS_TEC", pin2: "net.GND" }} />
    <C name="C25" capacitance="10uF" partId="C380537" pcbX={-5} pcbY={25} pcbRotation={90} schX={5} schY={-4}
      connections={{ pin1: "net.VBUS_TEC", pin2: "net.GND" }} />
    <C name="C26" capacitance="10uF" partId="C380537" pcbX={-1.5} pcbY={25} pcbRotation={90} schX={7} schY={-4}
      connections={{ pin1: "net.VBUS_TEC", pin2: "net.GND" }} />
    <C name="C27" capacitance="10uF" partId="C380537" pcbX={2} pcbY={25} pcbRotation={90} schX={9} schY={-4}
      connections={{ pin1: "net.VBUS_TEC", pin2: "net.GND" }} />
    <C name="C38" capacitance="10uF" partId="C380537" pcbX={5.5} pcbY={25} pcbRotation={90} schX={5} schY={-6}
      connections={{ pin1: "net.VBUS_TEC", pin2: "net.GND" }} />
    <C name="C39" capacitance="10uF" partId="C380537" pcbX={9} pcbY={25} pcbRotation={90} schX={7} schY={-6}
      connections={{ pin1: "net.VBUS_TEC", pin2: "net.GND" }} />
    <C name="C40" capacitance="10uF" partId="C380537" pcbX={12.5} pcbY={25} pcbRotation={90} schX={9} schY={-6}
      connections={{ pin1: "net.VBUS_TEC", pin2: "net.GND" }} />
    <C name="C28" capacitance="100uF" partId="C19270709" pcbX={19} pcbY={23} schX={11} schY={-4}
      connections={{ pin1: "net.VBUS_TEC" }} />
    <C name="C29" capacitance="220uF" partId="C19270707" pcbX={29} pcbY={-2} pcbRotation={90} schX={14} schY={2}
      connections={{ pin1: "net.TEC_POS", pin2: "net.GND" }} />
    <C name="C30" capacitance="22uF" partId="C309062" pcbX={30} pcbY={7} pcbRotation={90} schX={12} schY={2}
      connections={{ pin1: "net.TEC_POS" }} />
    <C name="C31" capacitance="22uF" partId="C309062" pcbX={26} pcbY={7} pcbRotation={90} schX={10} schY={2}
      connections={{ pin1: "net.TEC_POS" }} />

    <R name="R25" resistance="10" pcbX={1.5} pcbY={14.2} pcbRotation={180} schX={3} schY={4}
      connections={{ pin1: "net.TEC_INDUCTOR_OUT", pin2: "net.TEC_SENSE_P_FILTERED" }} />
    <R name="R26" resistance="10" pcbX={1.5} pcbY={12.8} pcbRotation={180} schX={5} schY={4}
      connections={{ pin1: "net.TEC_POS", pin2: "net.TEC_SENSE_N_FILTERED" }} />
    <C name="C32" capacitance="33nF" pcbX={-0.75} pcbY={13.4} pcbRotation={270} schX={4} schY={5.5}
      connections={{ pin1: "net.TEC_SENSE_P_FILTERED", pin2: "net.TEC_SENSE_N_FILTERED" }} />
    <R name="R27" resistance="22k" pcbX={-10} pcbY={23} schX={0} schY={5}
      connections={{ pin1: "net.TEC_VC", pin2: "net.TEC_COMP_RC" }} />
    <C name="C33" capacitance="4.7nF" pcbX={-13} pcbY={23} schX={0} schY={7}
      connections={{ pin1: "net.TEC_COMP_RC", pin2: "net.GND" }} />
    <R name="R28" resistance="82.5k" pcbX={-4} pcbY={20.2} schX={-2} schY={5}
      connections={{ pin1: "net.TEC_RT" }} />
    <C name="C34" capacitance="100nF" pcbX={-1} pcbY={6.5} schX={-1} schY={-5}
      connections={{ pin1: "net.TEC_SS", pin2: "net.GND" }} />
    <C name="C35" capacitance="10nF" pcbX={-4} pcbY={7} schX={-3} schY={-5}
      connections={{ pin1: "net.TEC_VREF", pin2: "net.GND" }} />

    <R name="R29" resistance="100k" pcbX={0} pcbY={1} schX={3} schY={-5}
      connections={{ pin1: "net.TEC_POS", pin2: "net.TEC_FB" }} />
    <R name="R30" resistance="12.1k" pcbX={3} pcbY={1} schX={3} schY={-7}
      connections={{ pin1: "net.TEC_FB", pin2: "net.GND" }} />
    <R name="R31" resistance="61.9k" pcbX={-8} pcbY={2} schX={-5} schY={-5}
      connections={{ pin1: "net.TEC_VREF", pin2: "net.TEC_HARD_LIMIT" }} />
    <R name="R32" resistance="100k" pcbX={-5} pcbY={2} schX={-5} schY={-7}
      connections={{ pin1: "net.TEC_HARD_LIMIT" }} />
    <C name="C36" capacitance="100nF" pcbX={-2} pcbY={3.5} schX={-7} schY={-7}
      connections={{ pin1: "net.TEC_HARD_LIMIT", pin2: "net.GND" }} />
    <R name="R33" resistance="16.9k" pcbX={-15} pcbY={5.5} schX={-7} schY={-3}
      connections={{ pin1: "net.TEC_DAC", pin2: "net.TEC_CURRENT_COMMAND" }} />
    <R name="R34" resistance="10k" pcbX={-15} pcbY={3} schX={-9} schY={-3}
      connections={{ pin1: "net.TEC_CURRENT_COMMAND", pin2: "net.GND" }} />
    <C name="C37" capacitance="100nF" pcbX={-12} pcbY={1} schX={-9} schY={-5}
      connections={{ pin1: "net.TEC_CURRENT_COMMAND", pin2: "net.GND" }} />

    {/* Supply absent, reset or latched fault => NPN off => PNP off => EN=0. */}
    <Pnp name="Q22" pcbX={-13} pcbY={27} schX={-8} schY={2}
      connections={{ pin1: "net.TEC_PERMISSION_PNP_BASE", pin2: "net.VBUS_TEC", pin3: "net.TEC_PERMISSION_SUPPLY" }} />
    <Npn name="Q23" pcbX={-13} pcbY={31} schX={-10} schY={4}
      connections={{ pin1: "net.TEC_PERMISSION_NPN_BASE", pin2: "net.GND", pin3: "net.TEC_PERMISSION_PNP_DRIVE" }} />
    <R name="R35" resistance="100k" pcbX={-17} pcbY={27} schX={-8} schY={0}
      connections={{ pin1: "net.VBUS_TEC", pin2: "net.TEC_PERMISSION_PNP_BASE" }} />
    <R name="R36" resistance="47k" pcbX={-17} pcbY={30} schX={-10} schY={2}
      connections={{ pin1: "net.TEC_PERMISSION_PNP_BASE", pin2: "net.TEC_PERMISSION_PNP_DRIVE" }} />
    <R name="R37" resistance="10k" pcbX={-17} pcbY={33} schX={-12} schY={4}
      connections={{ pin1: "net.TEC_SAFE_EN", pin2: "net.TEC_PERMISSION_NPN_BASE" }} />
    <R name="R38" resistance="100k" pcbX={-13} pcbY={34} schX={-10} schY={6}
      connections={{ pin1: "net.TEC_PERMISSION_NPN_BASE", pin2: "net.GND" }} />
    <R name="R39" resistance="75k" pcbX={-9} pcbY={28} schX={-6} schY={2}
      connections={{ pin1: "net.TEC_PERMISSION_SUPPLY", pin2: "net.TEC_EN_UVLO" }} />
    <R name="R40" resistance="12.1k" pcbX={-6} pcbY={30} schX={-6} schY={4}
      connections={{ pin1: "net.TEC_EN_UVLO", pin2: "net.GND" }} />

    {/* Independent telemetry on the physical 8 mΩ shunt, address 0x40.
        SOIC pinout differs from INA219 SOT-23; keep the numeric map below. */}
    <Ina219 name="U_TEC_MON" pcbX={29} pcbY={22} pcbRotation={180} schX={14} schY={5}
      connections={{ pin3: "net.I2C_SDA",
        pin4: "net.I2C_SCL", pin5: "net.V3V3", pin6: "net.GND",
        pin7: "net.TEC_MON_SENSE_N", pin8: "net.TEC_MON_SENSE_P" }} />
    <R name="R41" resistance="10" pcbX={27} pcbY={17.5} schX={11} schY={4}
      connections={{ pin1: "net.TEC_INDUCTOR_OUT", pin2: "net.TEC_MON_SENSE_P" }} />
    <R name="R42" resistance="10" pcbX={30} pcbY={17.5} schX={11} schY={6}
      connections={{ pin1: "net.TEC_POS", pin2: "net.TEC_MON_SENSE_N" }} />
    <C name="C42" capacitance="100nF" partId="C14663" pcbX={28.5} pcbY={15.5} schX={12} schY={7.5}
      connections={{ pin1: "net.TEC_MON_SENSE_P", pin2: "net.TEC_MON_SENSE_N" }} />
    <C name="C43" capacitance="100nF" partId="C14663" pcbX={25} pcbY={20} pcbRotation={90} schX={16} schY={5}
      connections={{ pin2: "net.GND" }} />
    <via name="TEC_MON_C43_GND" pcbX={25} pcbY={21.65} holeDiameter={0.3} outerDiameter={0.7}
      fromLayer="top" toLayer="bottom" connectsTo="net.GND" tented />
    <trace name="TEC_MON_C43_GND_RETURN" from="C43.pin2" to="TEC_MON_C43_GND.top" thickness={0.2} maxLength={1}
      pcbPathRelativeTo="C43.pin2" pcbPath={["C43.pin2", "TEC_MON_C43_GND.top"]} />
    <C name="C44" capacitance="100nF" partId="C14663" pcbX={5.5} pcbY={13.4} pcbRotation={270} schX={3} schY={-3}
      connections={{ pin1: "net.VBUS_TEC" }} />
    <trace name="TEC_LOCAL_COMMUTATION_VIN" from="C44.pin1" to="Q20.pin5" thickness={0.5}
      pcbPathRelativeTo="C44.pin1"
      pcbPath={["C44.pin1", { x: -1.1, y: -0.4 }, { x: -2.1, y: -0.4 },
        { x: -4.1825, y: -2.4825 }, "Q20.pin5"]} />
    <trace name="TEC_LOCAL_COMMUTATION_GND" from="C44.pin2" to="net.GND" thickness={0.5}
      pcbPathRelativeTo="C44.pin2"
      pcbPath={["C44.pin2", { x: 0.7, y: -1.1 }]} />
    <trace name="TEC_MON_KELVIN_P" from="R20.pin1" to="R41.pin1" thickness={0.2}
      pcbPathRelativeTo="R20.pin1"
      pcbPath={["R20.pin1", { x: -1.4, y: 0 },
        { x: -1.4, y: 1 }, { x: -1.4, y: 1, via: true, fromLayer: "top", toLayer: "bottom" }, { x: -1.4, y: 1 },
        { x: -1.4, y: 5.7 },
        { x: -2.3, y: 6.6 }, { x: -2.3, y: 6.6, via: true, fromLayer: "bottom", toLayer: "top" }, { x: -2.3, y: 6.6 },
        { x: -2.3, y: 5.55 }, "R41.pin1"]} />
    <trace name="TEC_MON_KELVIN_N" from="R20.pin2" to="R42.pin1" thickness={0.2}
      pcbPathRelativeTo="R20.pin2"
      pcbPath={["R20.pin2", { x: 1.4, y: 0 },
        { x: 1.4, y: 1 }, { x: 1.4, y: 1, via: true, fromLayer: "top", toLayer: "bottom" }, { x: 1.4, y: 1 },
        { x: 1.4, y: 4.25 },
        { x: 1.7, y: 4.55 }, { x: 1.7, y: 4.55, via: true, fromLayer: "bottom", toLayer: "top" }, { x: 1.7, y: 4.55 }, "R42.pin1"]} />

    {/* Explicit low-current taps prevent the main 3 mm net width from forcing
        oversized feedback, controller-bias or permission routes. */}
    <via name="TEC_VIN_PICKUP" pcbX={-9.3} pcbY={6.95}
      holeDiameter={0.3} outerDiameter={0.7} fromLayer="top" toLayer="bottom"
      connectsTo="net.VBUS_TEC" tented />
    <trace name="TEC_CONTROLLER_VIN" from="U2.pin3" to="TEC_VIN_PICKUP.bottom" thickness={0.2}
      pcbPathRelativeTo="U2.pin3"
      pcbPath={["U2.pin3", { x: -1.625, y: -3.6 }, { x: -0.325, y: -3.6 },
        { x: -0.325, y: -4 }, { x: -0.325, y: -4, via: true, fromLayer: "top", toLayer: "bottom" }, { x: -0.325, y: -4 },
        { x: -0.325, y: -5.05 }, "TEC_VIN_PICKUP.bottom"]} />
    <trace name="TEC_CONTROLLER_VIN_CAP" from="C24.pin1" to="TEC_VIN_PICKUP.top" thickness={0.2}
      maxLength={1.5} pcbPath={["C24.pin1", "TEC_VIN_PICKUP.top"]} />
    <trace name="TEC_CONTROLLER_VIN_FEED" from="C25.pin1" to="TEC_VIN_PICKUP.bottom" thickness={0.2}
      maxLength={30} pcbPathRelativeTo="C25.pin1"
      pcbPath={["C25.pin1", { x: -3, y: 0 }, { x: -3, y: 0, via: true, fromLayer: "top", toLayer: "bottom" }, { x: -3, y: 0 },
        { x: -3, y: 5 }, { x: -17.35, y: 5 }, "TEC_VIN_PICKUP.bottom"]} />
    <trace name="TEC_PERMISSION_POWER" from="Q22.pin2" to="C25.pin1" thickness={0.25}
      maxLength={18} pcbPathRelativeTo="Q22.pin2"
      pcbPath={["Q22.pin2", { x: 1, y: 2 }, { x: 1, y: 2, via: true, fromLayer: "top", toLayer: "bottom" }, { x: 1, y: 2 },
        { x: 1, y: -2.5 }, { x: 5.8, y: -2.5 }, { x: 5.8, y: -2.5, via: true, fromLayer: "bottom", toLayer: "top" }, { x: 5.8, y: -2.5 },
        { x: 6.3, y: -3 }, { x: 7.435, y: -3 }, "C25.pin1"]} />
    <trace name="TEC_PERMISSION_PULLUP" from="R35.pin1" to="Q22.pin2" thickness={0.25}
      pcbPathRelativeTo="R35.pin1"
      pcbPath={["R35.pin1", { x: -0.75, y: 0.95 }, "Q22.pin2"]} />
    <trace name="TEC_FEEDBACK_PICKUP" from="R29.pin1" to="C29.pin1" thickness={0.2}
      maxLength={35} pcbPathRelativeTo="R29.pin1"
      pcbPath={["R29.pin1", { x: -0.75, y: -2 }, { x: 1, y: -3.75 },
        { x: 27.080079, y: -3.75 }, "C29.pin1"]} />
    <trace name="TEC_SW_BOOT_RETURN" from="U2.pin18" to="C20.pin2" thickness={0.2}
      maxLength={7} pcbPathRelativeTo="U2.pin18"
      pcbPath={["U2.pin18", { x: -1.625, y: 3.7 }, { x: -2.3, y: 4.375 },
        { x: -2.3, y: 7.42 }, "C20.pin2"]} />
    <trace name="TEC_SW_REFERENCE" from="U2.pin18" to="Q20.pin1" thickness={0.2}
      pcbPathRelativeTo="U2.pin18"
      pcbPath={["U2.pin18", { x: -1.625, y: 3.9 },
        { x: -1.625, y: 3.9, via: true, fromLayer: "top", toLayer: "bottom" }, { x: -1.625, y: 3.9 },
        { x: -1.625, y: 3.1 }, { x: 12.7425, y: 3.1 },
        { x: 12.7425, y: 3.1, via: true, fromLayer: "bottom", toLayer: "top" }, { x: 12.7425, y: 3.1 }, "Q20.pin1"]} />
    <trace name="TEC_HIGH_GATE_PULLDOWN_RETURN" from="R23.pin2" to="Q20.pin3" thickness={0.2}
      pcbPathRelativeTo="R23.pin2"
      pcbPath={["R23.pin2", { x: 0.75, y: -2 }, { x: -3.2525, y: -2 }, "Q20.pin3"]} />

    {/* Separate protected fan supply: the quiet ADC tap never carries fan current.
        The 0.8 mm branch has a <=5 W routing envelope; initial fan is 12 V / <=0.25 A.
        Qualified fan plus converter overhead must stay <=4 W; TEC copper stays 3 mm. */}
    <trace name="FAN_PROTECTED_POWER_FEED" from="C28.pin1" to="FAN_INPUT_PICKUP.bottom" thickness={0.8} maxLength={150}
      pcbPathRelativeTo="C28.pin1"
      pcbPath={["C28.pin1", { x: -2.669921, y: 2.3 }, { x: -1.669921, y: 3.3 },
        { x: 14, y: 3.3 }, { x: 29.8, y: -12.5 },
        { x: 29.8, y: -31.1 }, { x: 29.8, y: -31.1, via: true, fromLayer: "top", toLayer: "bottom" }, { x: 29.8, y: -31.1 },
        { x: 12.5, y: -31.1 }, { x: 12.5, y: -32.565 },
        "FAN_INPUT_PICKUP.bottom"]} />

    {/* Non-sinking buck: bleed stored output charge after stop/fault. */}
    <R name="R45" resistance="10k" pcbX={25} pcbY={-8.5} schX={14} schY={-2}
      connections={{ pin1: "net.TEC_POS", pin2: "net.GND" }} />
    <trace name="TEC_OUTPUT_BLEED_FEED" from="R45.pin1" to="C29.pin1" thickness={0.2}
      pcbPathRelativeTo="R45.pin1"
      pcbPath={["R45.pin1", { x: 1, y: 1.8 }, { x: 4, y: 1.8 }, "C29.pin1"]} />

    <TecTerminal name="J_TEC" pcbX={44} pcbY={0} pcbRotation={90} schX={16} schY={0}
      connections={{ pin1: "net.TEC_POS" }} />
    <silkscreentext text="TEC+" pcbX={40} pcbY={-6.5} fontSize={2} />
    <silkscreentext text="TEC−" pcbX={40} pcbY={7} fontSize={2} />
    <silkscreenpath route={[{ x: 48, y: -1 }, { x: 49, y: 0 }, { x: 48, y: 1 }]} strokeWidth={0.15} />
    <trace name="TEC_OUTPUT_TERMINAL" from="R20.pin2" to="J_TEC.pin1" thickness={3}
      pcbPathRelativeTo="R20.pin2"
      pcbPath={["R20.pin2", { x: 6.5, y: 0 }, { x: 6.5, y: -14.499995 }, "J_TEC.pin1"]} />

    {/* Explicit wire landing points before and after each via keep native geometry/checks aligned.
        Numeric pcbPath waypoints are local to the named anchor component, including
        its rotation; selector endpoints resolve globally. Layout owns the corridors. */}
    <trace name="TEC_INPUT_HOT_LOOP" from="C26.pin1" to="Q20.pin5" thickness={3}
      pcbPathRelativeTo="C26.pin1"
      pcbPath={["C26.pin1", { x: -2.3, y: 0 }, { x: -6.8175, y: -4.5175 }, "Q20.pin5"]} />
    <trace name="TEC_HIGH_SOURCE_SW" from="Q20.pin1" to="L2.pin1" thickness={2.5}
      pcbPathRelativeTo="Q20.pin1"
      pcbPath={["Q20.pin1", { x: -1.905, y: -4.25 }, { x: -4.605, y: -6.95 }, "L2.pin1"]} />
    <trace name="TEC_LOW_DRAIN_SW" from="Q21.pin5" to="L2.pin1" thickness={3}
      pcbPathRelativeTo="Q21.pin5"
      pcbPath={["Q21.pin5", { x: 0, y: 3.95 }, "L2.pin1"]} />
    <trace name="TEC_INDUCTOR_TO_SHUNT" from="L2.pin2" to="R20.pin1" thickness={3}
      pcbPath={["L2.pin2", "R20.pin1"]} />
    <trace name="TEC_SHUNT_TO_FILTER" from="R20.pin2" to="C29.pin1" thickness={3}
      pcbPathRelativeTo="R20.pin2"
      pcbPath={["R20.pin2", { x: 6.5, y: 0 }, { x: 6.5, y: -16.669921 }, "C29.pin1"]} />
    <trace name="TEC_HIGH_SOURCE_12" from="Q20.pin1" to="Q20.pin2" thickness={0.6}
      pcbPath={["Q20.pin1", "Q20.pin2"]} />
    <trace name="TEC_HIGH_SOURCE_23" from="Q20.pin2" to="Q20.pin3" thickness={0.6}
      pcbPath={["Q20.pin2", "Q20.pin3"]} />
    <trace name="TEC_LOW_SOURCE_12" from="Q21.pin2" to="net.GND" thickness={0.6}
      pcbPath={["Q21.pin2", "Q21.pin1"]} />
    <trace name="TEC_LOW_SOURCE_23" from="Q21.pin3" to="net.GND" thickness={0.6}
      pcbPath={["Q21.pin3", "Q21.pin2"]} />
    <trace name="TEC_SENSE_KELVIN_P" from="R20.pin1" to="R25.pin1" thickness={0.2}
      pcbPathRelativeTo="R20.pin1"
      pcbPath={["R20.pin1", { x: -1.4, y: 0 }, { x: -1.4, y: 0, via: true, fromLayer: "top", toLayer: "bottom" }, { x: -1.4, y: 0 },
        { x: -1.4, y: -2.5 }, { x: -2.4, y: -3.5 }, { x: -23.3, y: -3.5 },
        { x: -23.3, y: 1.2 },
        { x: -24.3, y: 2.2 }, { x: -24.3, y: 2.2, via: true, fromLayer: "bottom", toLayer: "top" }, { x: -24.3, y: 2.2 }, "R25.pin1"]} />
    <trace name="TEC_SENSE_KELVIN_N" from="R20.pin2" to="R26.pin1" thickness={0.2}
      pcbPathRelativeTo="R20.pin2"
      pcbPath={["R20.pin2", { x: 1.4, y: 0 }, { x: 1.4, y: 0, via: true, fromLayer: "top", toLayer: "bottom" }, { x: 1.4, y: 0 },
        { x: 1.4, y: -3 }, { x: 0.4, y: -4 }, { x: -24.1, y: -4 }, { x: -25.1, y: -3 },
        { x: -25.1, y: 0.8 }, { x: -25.1, y: 0.8, via: true, fromLayer: "bottom", toLayer: "top" }, { x: -25.1, y: 0.8 }, "R26.pin1"]} />

    {/* Fixed local controller escapes keep the filtered sense nodes and gate
        drive off the later global routing graph. Sense-N passes above the
        existing EP thermal-via row on bottom, using ordinary through barrels. */}
    <trace name="TEC_FILTERED_SENSE_P_U2" from="U2.pin11" to="C32.pin1" thickness={0.2} maxLength={6}
      pcbPathRelativeTo="U2.pin11"
      pcbPath={["U2.pin11", { x: 2.925, y: 3.75 }, { x: 3.1, y: 3.925 },
        { x: 3.75, y: 3.925 }, { x: 4.25, y: 3.425 }, "C32.pin1"]} />
    <trace name="TEC_FILTERED_SENSE_P_FILTER" from="C32.pin1" to="R25.pin2" thickness={0.2} maxLength={2}
      pcbPathRelativeTo="C32.pin1"
      pcbPath={["C32.pin1", { x: -0.72, y: 1.42 }, "R25.pin2"]} />
    {/* 5.762 mm planar plus two conservative 1.76 mm through barrels. */}
    <trace name="TEC_FILTERED_SENSE_N_U2" from="U2.pin12" to="C32.pin2" thickness={0.2} maxLength={9.4}
      pcbPathRelativeTo="U2.pin12"
      pcbPath={["U2.pin12", { x: 2.275, y: 1.85 },
        { x: 2.275, y: 1.85, via: true, fromLayer: "top", toLayer: "bottom" }, { x: 2.275, y: 1.85 },
        { x: 3.45, y: 1.85 }, { x: 4.25, y: 1.05 }, { x: 4.25, y: -0.4 },
        { x: 4.25, y: -0.4, via: true, fromLayer: "bottom", toLayer: "top" }, { x: 4.25, y: -0.4 },
        "C32.pin2"]} />
    <trace name="TEC_FILTERED_SENSE_N_FILTER" from="C32.pin2" to="R26.pin2" thickness={0.2} maxLength={2}
      pcbPathRelativeTo="C32.pin2"
      pcbPath={["C32.pin2", { x: 0.72, y: 1.38 }, "R26.pin2"]} />
    <trace name="TEC_HG_LOCAL_U2" from="U2.pin17" to="R21.pin1" thickness={0.2} maxLength={5}
      pcbPathRelativeTo="U2.pin17"
      pcbPath={["U2.pin17", { x: -0.975, y: 4.8 }, { x: -0.35, y: 5.425 },
        { x: 0.325, y: 5.425 }, "R21.pin1"]} />
    <trace name="TEC_LG_LOCAL_U2" from="U2.pin20" to="R22.pin1" thickness={0.2} maxLength={3}
      pcbPathRelativeTo="U2.pin20"
      pcbPath={["U2.pin20", { x: -2.925, y: 4.675 }, "R22.pin1"]} />
    <trace name="TEC_COMP_RC_LOCAL" from="R27.pin2" to="C33.pin1" thickness={0.2} maxLength={6}
      pcbPathRelativeTo="R27.pin2"
      pcbPath={["R27.pin2", { x: -0.05, y: 0.8 }, { x: -2.875, y: 0.8 }, "C33.pin1"]} />
    <via name="PERMISSION_PICKUP_REMOTE" pcbX={-18.6} pcbY={29} holeDiameter={0.3} outerDiameter={0.7}
      fromLayer="top" toLayer="bottom" connectsTo="net.VBUS_TEC" tented />
    <via name="PERMISSION_PICKUP_LOCAL" pcbX={-16.6} pcbY={19.4} holeDiameter={0.3} outerDiameter={0.7}
      fromLayer="top" toLayer="bottom" connectsTo="net.VBUS_TEC" tented />
    <trace name="TEC_PERMISSION_DIRECT_PROTECTED_PICKUP"
      from="R35.pin1" to="PERMISSION_PICKUP_REMOTE.top" thickness={0.2} maxLength={2.4}
      pcbPathRelativeTo="R35.pin1"
      pcbPath={["R35.pin1", { x: -0.75, y: 1.15 }, "PERMISSION_PICKUP_REMOTE.top"]} />
    <trace name="TEC_PERMISSION_PICKUP_BOTTOM"
      from="PERMISSION_PICKUP_REMOTE.bottom" to="PERMISSION_PICKUP_LOCAL.bottom" thickness={0.2} maxLength={10.5}
      pcbPathRelativeTo="PERMISSION_PICKUP_REMOTE.bottom"
      pcbPath={["PERMISSION_PICKUP_REMOTE.bottom", { x: 2, y: -2 }, "PERMISSION_PICKUP_LOCAL.bottom"]} />
    <trace name="TEC_PERMISSION_PICKUP_CAP"
      from="PERMISSION_PICKUP_LOCAL.top" to="C_INPUT_OUT.pin1" thickness={0.2} maxLength={1.8}
      pcbPathRelativeTo="PERMISSION_PICKUP_LOCAL.top"
      pcbPath={["PERMISSION_PICKUP_LOCAL.top", { x: 0, y: -1.58 }, "C_INPUT_OUT.pin1"]} />

    {/* Local capacitor returns use ordinary plated barrels outside exposed
        pads and component courtyards. Layout owns their broad top collectors. */}
    <via name="TEC_INPUT_RETURN_EAST_1" pcbX={24.25} pcbY={22.5} holeDiameter={0.3} outerDiameter={0.7} fromLayer="top" toLayer="bottom" connectsTo="net.GND" tented={true} />
    <via name="TEC_INPUT_RETURN_EAST_2" pcbX={24.25} pcbY={23.5} holeDiameter={0.3} outerDiameter={0.7} fromLayer="top" toLayer="bottom" connectsTo="net.GND" tented={true} />
    <via name="TEC_INPUT_RETURN_EAST_3" pcbX={24.25} pcbY={24.5} holeDiameter={0.3} outerDiameter={0.7} fromLayer="top" toLayer="bottom" connectsTo="net.GND" tented={true} />
    <via name="TEC_OUTPUT_RETURN_MID_1" pcbX={28} pcbY={8.7} holeDiameter={0.3} outerDiameter={0.7} fromLayer="top" toLayer="bottom" connectsTo="net.GND" tented={true} />
    <via name="TEC_OUTPUT_RETURN_MID_2" pcbX={28} pcbY={9.6} holeDiameter={0.3} outerDiameter={0.7} fromLayer="top" toLayer="bottom" connectsTo="net.GND" tented={true} />
    <via name="TEC_OUTPUT_RETURN_EAST_1" pcbX={32} pcbY={8.4} holeDiameter={0.3} outerDiameter={0.7} fromLayer="top" toLayer="bottom" connectsTo="net.GND" tented={true} />
    <via name="TEC_OUTPUT_RETURN_EAST_2" pcbX={32} pcbY={9.3} holeDiameter={0.3} outerDiameter={0.7} fromLayer="top" toLayer="bottom" connectsTo="net.GND" tented={true} />
    <trace name="TEC_INPUT_RETURN_EAST_1_FEED" from="C28.pin2" to="TEC_INPUT_RETURN_EAST_1.top" thickness={0.6} maxLength={5} pcbPathRelativeTo="C28.pin2" pcbPath={["C28.pin2", { x: 3.169921, y: -0.500000 }, "TEC_INPUT_RETURN_EAST_1.top"]} />
    <trace name="TEC_INPUT_RETURN_EAST_2_FEED" from="C28.pin2" to="TEC_INPUT_RETURN_EAST_2.top" thickness={0.6} maxLength={5} pcbPathRelativeTo="C28.pin2" pcbPath={["C28.pin2", { x: 3.169921, y: 0.500000 }, "TEC_INPUT_RETURN_EAST_2.top"]} />
    <trace name="TEC_INPUT_RETURN_EAST_3_FEED" from="C28.pin2" to="TEC_INPUT_RETURN_EAST_3.top" thickness={0.6} maxLength={5} pcbPathRelativeTo="C28.pin2" pcbPath={["C28.pin2", { x: 4.169921, y: 1.500000 }, "TEC_INPUT_RETURN_EAST_3.top"]} />
    <trace name="TEC_OUTPUT_RETURN_MID_1_FEED" from="C31.pin2" to="TEC_OUTPUT_RETURN_MID_1.top" thickness={0.6} maxLength={5} pcbPathRelativeTo="C31.pin2" pcbPath={["C31.pin2", { x: 1.700000, y: -0.135000 }, "TEC_OUTPUT_RETURN_MID_1.top"]} />
    <trace name="TEC_OUTPUT_RETURN_MID_2_FEED" from="C31.pin2" to="TEC_OUTPUT_RETURN_MID_2.top" thickness={0.6} maxLength={5} pcbPathRelativeTo="C31.pin2" pcbPath={["C31.pin2", { x: 2.600000, y: -1.035000 }, "TEC_OUTPUT_RETURN_MID_2.top"]} />
    <trace name="TEC_OUTPUT_RETURN_EAST_1_FEED" from="C30.pin2" to="TEC_OUTPUT_RETURN_EAST_1.top" thickness={0.6} maxLength={5} pcbPathRelativeTo="C30.pin2" pcbPath={["C30.pin2", { x: 1.400000, y: -0.165000 }, "TEC_OUTPUT_RETURN_EAST_1.top"]} />
    <trace name="TEC_OUTPUT_RETURN_EAST_2_FEED" from="C30.pin2" to="TEC_OUTPUT_RETURN_EAST_2.top" thickness={0.6} maxLength={5} pcbPathRelativeTo="C30.pin2" pcbPath={["C30.pin2", { x: 2.300000, y: -0.735000 }, "TEC_OUTPUT_RETURN_EAST_2.top"]} />
    <trace name="TEC_OUTPUT_RETURN_CAP_TIE" from="C31.pin2" to="net.GND" thickness={0.6} maxLength={6} pcbPathRelativeTo="C31.pin2" pcbPath={["C31.pin2", "C30.pin2"]} />
    <ConverterLocalRoutes />
  </>
)

export const converterLocalConnectionPlans: readonly SourcePadConnectionPlan[] = [
  { name: "TEC_SS_LOCAL", net: "TEC_SS", from: "U2.pin9", to: "C34.pin1", traces: ["TEC_SS_LOCAL"] },
  { name: "TEC_RT_LOCAL", net: "TEC_RT", from: "U2.pin14", to: "R28.pin1",
    traces: ["TEC_RT_U2_ESCAPE", "TEC_RT_LOCAL", "TEC_RT_R28_ESCAPE"],
    requiredSelectors: ["U2.pin14", "R28.pin1"], branchEndpoints: {
      TEC_RT_U2_ESCAPE: ["U2.pin14", "TEC_RT_U2_TRANSFER.top"],
      TEC_RT_LOCAL: ["TEC_RT_U2_TRANSFER.bottom", "TEC_RT_R28_TRANSFER.bottom"],
      TEC_RT_R28_ESCAPE: ["TEC_RT_R28_TRANSFER.top", "R28.pin1"],
    } },
  { name: "TEC_BOOT_LOCAL_GROUP", net: "TEC_BOOT", from: "U2.pin19", to: "TEC_BOOT_DIODE_PICKUP.top",
    traces: ["TEC_BOOT_U2_ESCAPE", "TEC_BOOT_U2_LOCAL", "TEC_BOOT_DIODE_LOCAL", "TEC_BOOT_CAP_ESCAPE", "TEC_BOOT_CAP_LOCAL"],
    requiredSelectors: ["U2.pin19", "D20.pin1", "C20.pin1"], branchEndpoints: {
      TEC_BOOT_U2_ESCAPE: ["U2.pin19", "TEC_BOOT_U2_TRANSFER.top"],
      TEC_BOOT_U2_LOCAL: ["TEC_BOOT_U2_TRANSFER.bottom", "TEC_BOOT_DIODE_PICKUP.bottom"],
      TEC_BOOT_DIODE_LOCAL: ["D20.pin1", "TEC_BOOT_DIODE_PICKUP.top"],
      TEC_BOOT_CAP_ESCAPE: ["C20.pin1", "TEC_BOOT_CAP_TRANSFER.top"],
      TEC_BOOT_CAP_LOCAL: ["TEC_BOOT_CAP_TRANSFER.bottom", "TEC_BOOT_DIODE_PICKUP.bottom"],
    } },
  { name: "TEC_VCC_LOCAL_GROUP", net: "TEC_VCC_INT", from: "U2.pin1", to: "C21.pin1",
    traces: ["TEC_VCC_U2_DECOUPLER", "TEC_VCC_LOCAL_HF", "TEC_VCC_LOCAL_BULK"],
    requiredSelectors: ["U2.pin1", "C21.pin1", "C22.pin1", "C41.pin1"], branchEndpoints: {
      TEC_VCC_U2_DECOUPLER: ["U2.pin1", "C21.pin1"],
      TEC_VCC_LOCAL_HF: ["C21.pin1", "C22.pin1"],
      TEC_VCC_LOCAL_BULK: ["C21.pin1", "C41.pin1"],
    } },
]

export const converterReviewed3DPaths = [
  { name: "TEC_RT_LOCAL", traceNames: ["TEC_RT_U2_ESCAPE", "TEC_RT_LOCAL", "TEC_RT_R28_ESCAPE"],
    barrelNames: ["TEC_RT_U2_TRANSFER", "TEC_RT_R28_TRANSFER"], maxMm: 12 },
  { name: "TEC_BOOT_U2_LOCAL", traceNames: ["TEC_BOOT_U2_ESCAPE", "TEC_BOOT_U2_LOCAL"],
    barrelNames: ["TEC_BOOT_U2_TRANSFER"], maxMm: 10 },
  { name: "TEC_BOOT_CAP_LOCAL", traceNames: ["TEC_BOOT_CAP_ESCAPE", "TEC_BOOT_CAP_LOCAL"],
    barrelNames: ["TEC_BOOT_CAP_TRANSFER"], maxMm: 8 },
] as const

/** Qualified local controller paths use genuine ordinary through-via heads.
 * SS clears the independently verified ground fanout with a short chamfer.
 */
export const ConverterLocalRoutes = () => <>
  <via name="TEC_RT_U2_TRANSFER" pcbX={-4.025} pcbY={15.8} holeDiameter={0.3} outerDiameter={0.7}
    fromLayer="top" toLayer="bottom" connectsTo="net.TEC_RT" tented />
  <via name="TEC_RT_R28_TRANSFER" pcbX={-5.6} pcbY={20.2} holeDiameter={0.3} outerDiameter={0.7}
    fromLayer="top" toLayer="bottom" connectsTo="net.TEC_RT" tented />
  <via name="TEC_BOOT_U2_TRANSFER" pcbX={-7.275} pcbY={13.85} holeDiameter={0.3} outerDiameter={0.7}
    fromLayer="top" toLayer="bottom" connectsTo="net.TEC_BOOT" tented />
  <via name="TEC_BOOT_CAP_TRANSFER" pcbX={-6.6} pcbY={17.035056} holeDiameter={0.3} outerDiameter={0.7}
    fromLayer="top" toLayer="bottom" connectsTo="net.TEC_BOOT" tented />
  <via name="TEC_BOOT_DIODE_PICKUP" pcbX={-9} pcbY={17.035056} holeDiameter={0.3} outerDiameter={0.7}
    fromLayer="top" toLayer="bottom" connectsTo="net.TEC_BOOT" tented />
  <trace name="TEC_SS_LOCAL" from="U2.pin9" to="C34.pin1" thickness={0.2} maxLength={4}
    pcbPathRelativeTo="U2.pin9" pcbPath={["U2.pin9", { x: 2.275, y: -3.45 }, { x: 2.475, y: -3.65 },
      { x: 3.1, y: -3.65 }, { x: 3.3, y: -3.85 }, "C34.pin1"]} />
  <trace name="TEC_RT_U2_ESCAPE" from="U2.pin14" to="TEC_RT_U2_TRANSFER.top" thickness={0.2} maxLength={1.1}
    pcbPath={["U2.pin14", "TEC_RT_U2_TRANSFER.top"]} />
  <trace name="TEC_RT_LOCAL" from="TEC_RT_U2_TRANSFER.bottom" to="TEC_RT_R28_TRANSFER.bottom" thickness={0.2} maxLength={12}
    pcbPathRelativeTo="TEC_RT_U2_TRANSFER.bottom" pcbPath={["TEC_RT_U2_TRANSFER.bottom", { x: 0, y: 2.825 }, "TEC_RT_R28_TRANSFER.bottom"]} />
  <trace name="TEC_RT_R28_ESCAPE" from="TEC_RT_R28_TRANSFER.top" to="R28.pin1" thickness={0.2} maxLength={1.1}
    pcbPath={["TEC_RT_R28_TRANSFER.top", "R28.pin1"]} />
  <trace name="TEC_BOOT_U2_ESCAPE" from="U2.pin19" to="TEC_BOOT_U2_TRANSFER.top" thickness={0.2} maxLength={1.1}
    pcbPath={["U2.pin19", "TEC_BOOT_U2_TRANSFER.top"]} />
  <trace name="TEC_BOOT_U2_LOCAL" from="TEC_BOOT_U2_TRANSFER.bottom" to="TEC_BOOT_DIODE_PICKUP.bottom" thickness={0.2} maxLength={10}
    pcbPathRelativeTo="TEC_BOOT_U2_TRANSFER.bottom" pcbPath={["TEC_BOOT_U2_TRANSFER.bottom", { x: -1.075, y: 0 }, { x: -1.725, y: 0.65 }, "TEC_BOOT_DIODE_PICKUP.bottom"]} />
  <trace name="TEC_BOOT_DIODE_LOCAL" from="D20.pin1" to="TEC_BOOT_DIODE_PICKUP.top" thickness={0.2} maxLength={2}
    pcbPath={["D20.pin1", "TEC_BOOT_DIODE_PICKUP.top"]} />
  <trace name="TEC_BOOT_CAP_ESCAPE" from="C20.pin1" to="TEC_BOOT_CAP_TRANSFER.top" thickness={0.2} maxLength={1.1}
    pcbPathRelativeTo="C20.pin1" pcbPath={["C20.pin1", { x: -1.564944, y: 0 }, "TEC_BOOT_CAP_TRANSFER.top"]} />
  <trace name="TEC_BOOT_CAP_LOCAL" from="TEC_BOOT_CAP_TRANSFER.bottom" to="TEC_BOOT_DIODE_PICKUP.bottom" thickness={0.2} maxLength={8}
    pcbPath={["TEC_BOOT_CAP_TRANSFER.bottom", "TEC_BOOT_DIODE_PICKUP.bottom"]} />
  <trace name="TEC_VCC_U2_DECOUPLER" from="U2.pin1" to="C21.pin1" thickness={0.2} maxLength={6}
    pcbPathRelativeTo="U2.pin1"
    pcbPath={["U2.pin1", { x: -2.925, y: -3.25 }, { x: -3.8, y: -4.125 },
      { x: -4.5, y: -4.125 }, { x: -5.28, y: -4.905 }, "C21.pin1"]} />
  <trace name="TEC_VCC_LOCAL_HF" from="C21.pin1" to="C22.pin1" thickness={0.2} maxLength={3}
    pcbPathRelativeTo="C21.pin1"
    pcbPath={["C21.pin1", { x: -1.45, y: 0 }, { x: -2.75, y: -1.3 }, "C22.pin1"]} />
  <trace name="TEC_VCC_LOCAL_BULK" from="C21.pin1" to="C41.pin1" thickness={0.2} maxLength={6}
    pcbPathRelativeTo="C21.pin1"
    pcbPath={["C21.pin1", { x: -0.905, y: 0.6 }, { x: -1.555, y: 1.25 },
      { x: -4.255, y: 1.25 }, { x: -4.905, y: 0.6 }, "C41.pin1"]} />
</>
