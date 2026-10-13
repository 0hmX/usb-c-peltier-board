import { TPS55289RYQR } from "../../imports/TPS55289RYQR"
import { SRP1265A_4R7M } from "../../imports/SRP1265A_4R7M"
import { RLM25FEER010 } from "../../imports/RLM25FEER010"
import { GRM32ER71E226KE15L } from "../../imports/GRM32ER71E226KE15L"
import { OVZ101M1ETR_0606 } from "../../imports/OVZ101M1ETR_0606"
import { EEHZK1V101XP } from "../../imports/EEHZK1V101XP"
import { UMK325BJ106KM_T } from "../../imports/UMK325BJ106KM_T"
import { SourcedCapacitor, SourcedResistor } from "./sourced-passive"

export const powerStage = {
  part: "TPS55289RYQR",
  i2cAddress: 0x75,
  minimumOutputVoltageV: 2.1,
  maximumOutputVoltageV: 15,
  maximumCurrentSettingA: 6,
  outputPowerCeilingW: 72,
  currentSenseOhms: 0.01,
  currentSettingStepA: 0.05,
  inductanceH: 4.7e-6,
  switchingFrequencyHz: 1000 / (0.05 * 49_900 + 35) * 1e6,
  inputUvLoRisingV: 1.23 * (1 + 130 / 10),
} as const

// TPS55289 datasheet pin table and TI EVM SLVUCF2 figure 5-1.
// This is an unrouted first-pass CC/CV stage, requiring compensation,
// ripple, thermal and transient qualification after a power PCB is routed.
export function AdjustablePowerStage({ pcbX = 0, pcbY = 14 }: {
  pcbX?: number
  pcbY?: number
} = {}) {
  const at = (x: number, y: number) => ({ pcbX: pcbX + x, pcbY: pcbY + y, schSheetName: "POWER" })
  return <>
    <TPS55289RYQR name="U_DRIVER" {...at(0, 0)} connections={{
      pin1: "net.DRIVER_ENABLE", pin2: "net.GND",
      pin3: "net.I2C_SCL", pin4: "net.I2C_SDA", pin5: "net.GND",
      pin6: "net.DRIVER_FSW", pin7: "net.VBUS_QUALIFIED",
      pin8: "net.DRIVER_SW1", pin9: "net.GND", pin10: "net.DRIVER_SW2",
      pin11: "net.DRIVER_OUT", pin12: "net.DRIVER_ISP", pin13: "net.DRIVER_ISN",
      pin14: "net.DRIVER_FAULT", pin15: "net.DRIVER_COMP",
      pin16: "net.DRIVER_CURRENT_MONITOR", pin17: "net.GND",
      // The external 5 V auxiliary supply stays available with EN low,
      // so live MCU I2C pull-ups do not exceed the VCC + 0.3 V rating.
      pin18: "net.AUX_5V", pin19: "net.DRIVER_BOOT2",
      pin20: "net.DRIVER_BOOT1", pin21: "net.GND",
    }} />
    <SRP1265A_4R7M name="L_OUT" {...at(13, 0)} connections={{
      pin1: "net.DRIVER_SW1", pin2: "net.DRIVER_SW2",
    }} />
    <RLM25FEER010 name="R_SENSE" {...at(25, -8)} connections={{
      pin1: "net.DRIVER_OUT", pin2: "net.TEC_POS",
    }} />
    {[[-8, 5], [-8, 11], [-15, 5], [-15, 11]].map(([x, y], i) => <UMK325BJ106KM_T key={i}
      name={"C_DRIVER_IN" + (i + 1)} maxVoltageRating="50V" {...at(x!, y!)}
      connections={{ pin1: "net.VBUS_QUALIFIED", pin2: "net.GND" }} />)}
    {/* Bulk for upstream cable transients; the ceramic bank carries HF ripple.
        PD load-switch inrush with this capacitance still needs qualification. */}
    <EEHZK1V101XP name="C_DRIVER_INPUT_BULK" maxVoltageRating="35V" {...at(-18, -2)}
      connections={{ pin1: "net.VBUS_QUALIFIED", pin2: "net.GND" }} />
    <SourcedCapacitor name="C_DRIVER_INPUT_HF" capacitance="100nF" {...at(-6, 0)}
      connections={{ pin1: "net.VBUS_QUALIFIED", pin2: "net.GND" }} />
    <SourcedCapacitor name="C_DRIVER_BOOT1" capacitance="100nF" {...at(-1, 4)}
      connections={{ pin1: "net.DRIVER_BOOT1", pin2: "net.DRIVER_SW1" }} />
    <SourcedCapacitor name="C_DRIVER_BOOT2" capacitance="100nF" {...at(3, 4)}
      connections={{ pin1: "net.DRIVER_BOOT2", pin2: "net.DRIVER_SW2" }} />
    <SourcedCapacitor name="C_DRIVER_VCC" capacitance="10uF" {...at(3, 10)}
      connections={{ pin1: "net.AUX_5V", pin2: "net.GND" }} />
    <SourcedCapacitor name="C_DRIVER_VCC_HF" capacitance="100nF" {...at(-2, 10)}
      connections={{ pin1: "net.AUX_5V", pin2: "net.GND" }} />
    {[[24, 0], [24, 6], [24, 12], [31, 0]].map(([x, y], i) => <GRM32ER71E226KE15L key={i}
      name={"C_DRIVER_OUT" + (i + 1)} maxVoltageRating="25V" {...at(x!, y!)}
      connections={{ pin1: "net.DRIVER_OUT", pin2: "net.GND" }} />)}
    <SourcedCapacitor name="C_DRIVER_OUTPUT_HF" capacitance="100nF" {...at(3, -3)}
      connections={{ pin1: "net.DRIVER_OUT", pin2: "net.GND" }} />
    {/* Post-shunt bulk follows TI's EVM topology. Capacitor transients are
        distinct from the slow average current limit delivered to the TEC. */}
    <OVZ101M1ETR_0606 name="C_TEC_BULK" maxVoltageRating="25V" {...at(30, -16)}
      connections={{ pin1: "net.TEC_POS", pin2: "net.GND" }} />
    {/* Kelvin-route both sense taps after routing is commissioned. */}
    <SourcedResistor name="R_ISP_FILTER" resistance="10" {...at(9, -8)}
      connections={{ pin1: "net.DRIVER_OUT", pin2: "net.DRIVER_ISP" }} />
    <SourcedResistor name="R_ISN_FILTER" resistance="10" {...at(9, -10)}
      connections={{ pin1: "net.TEC_POS", pin2: "net.DRIVER_ISN" }} />
    <SourcedCapacitor name="C_CURRENT_FILTER" capacitance="220nF" {...at(5, -8)}
      connections={{ pin1: "net.DRIVER_ISP", pin2: "net.DRIVER_ISN" }} />
    <SourcedResistor name="R_DRIVER_FSW" resistance="49.9k" {...at(-5, -4)}
      connections={{ pin1: "net.DRIVER_FSW", pin2: "net.GND" }} />
    {/* Initial compensation is TI EVM's 27.4k / 4.7nF / 100pF network. */}
    <SourcedResistor name="R_COMP" resistance="27.4k" {...at(1, -5)}
      connections={{ pin1: "net.DRIVER_COMP", pin2: "net.DRIVER_COMP_ZERO" }} />
    <SourcedCapacitor name="C_COMP_ZERO" capacitance="4.7nF" {...at(1, -8)}
      connections={{ pin1: "net.DRIVER_COMP_ZERO", pin2: "net.GND" }} />
    <SourcedCapacitor name="C_COMP_POLE" capacitance="100pF" {...at(1, -11)}
      connections={{ pin1: "net.DRIVER_COMP", pin2: "net.GND" }} />
    {/* Independent UVLO rejects 5 V even if the MCU releases its reset clamp.
        PD fault and the reset/watchdog clamp pull DRIVER_ENABLE low. */}
    <SourcedResistor name="R_DRIVER_EN_TOP" resistance="130k" {...at(-5, -8)}
      connections={{ pin1: "net.VBUS_QUALIFIED", pin2: "net.DRIVER_ENABLE" }} />
    <SourcedResistor name="R_DRIVER_EN_BOTTOM" resistance="10k" {...at(-5, -11)}
      connections={{ pin1: "net.DRIVER_ENABLE", pin2: "net.GND" }} />
    <SourcedCapacitor name="C_DRIVER_EN" capacitance="100nF" {...at(-5, -14)}
      connections={{ pin1: "net.DRIVER_ENABLE", pin2: "net.GND" }} />
  </>
}
