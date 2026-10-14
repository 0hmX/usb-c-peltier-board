import { TPS55289RYQR } from "../../imports/TPS55289RYQR"
import { SRP1265A_4R7M } from "../../imports/SRP1265A_4R7M"
import { RLM25FEER010 } from "../../imports/RLM25FEER010"
import { GRM32ER71E226KE15L } from "../../imports/GRM32ER71E226KE15L"
import { OVZ101M1ETR_0606 } from "../../imports/OVZ101M1ETR_0606"
import { EEHZK1V101XP } from "../../imports/EEHZK1V101XP"
import { UMK325BJ106KM_T } from "../../imports/UMK325BJ106KM_T"
import { A_0603WAF1001T5E as Resistor0603 } from "../../imports/A_0603WAF1001T5E"
import { CC0603KRX7R9BB104 as Capacitor100nF } from "../parts/C14663"
import { CL21A106KAYNNNE as Capacitor10uF } from "../../imports/CL21A106KAYNNNE"
import { CC0603KRX7R9BB224 as Capacitor220nF } from "../../imports/CC0603KRX7R9BB224"
import { CC0603KRX7R9BB472 as Capacitor4n7F } from "../../imports/CC0603KRX7R9BB472"
import { CC0603JRNPO0BN101 as Capacitor100pF } from "../../imports/CC0603JRNPO0BN101"

// TPS55289 datasheet pin table and TI EVM SLVUCF2 figure 5-1.
// This is an unrouted first-pass CC/CV stage, requiring compensation,
// ripple, thermal and transient qualification after a power PCB is routed.
export function AdjustablePowerStage() {
  return <>
    <TPS55289RYQR name="U_DRIVER" pcbX={0} pcbY={14} schSheetName="POWER" connections={{
      pin1: "net.DRIVER_ENABLE", pin2: "net.GND",
      pin3: "net.I2C_SCL", pin4: "net.I2C_SDA", pin5: "net.GND",
      pin6: "net.DRIVER_FSW", pin7: "net.VBUS_QUALIFIED",
      pin8: "net.DRIVER_SW1", pin9: "net.GND", pin10: "net.DRIVER_SW2",
      pin11: "net.DRIVER_OUT", pin12: "net.DRIVER_ISP", pin13: "net.DRIVER_ISN",
      pin14: "net.DRIVER_FAULT", pin15: "net.DRIVER_COMP",
      pin16: "net.DRIVER_CURRENT_MONITOR", pin17: "net.GND",
      // The external 5 V auxiliary supply stays available with EN low,
      // so live MCU I2C pull-ups do not exceed the VCC + 0.3 V rating.
      pin18: "net.LOGIC_5V", pin19: "net.DRIVER_BOOT2",
      pin20: "net.DRIVER_BOOT1", pin21: "net.GND",
    }} />
    <SRP1265A_4R7M name="L_OUT" pcbX={13} pcbY={14} schSheetName="POWER" connections={{
      pin1: "net.DRIVER_SW1", pin2: "net.DRIVER_SW2",
    }} />
    <RLM25FEER010 name="R_SENSE" pcbX={25} pcbY={6} schSheetName="POWER" connections={{
      pin1: "net.DRIVER_OUT", pin2: "net.TEC_POS",
    }} />
    <UMK325BJ106KM_T name="C_DRIVER_IN1" maxVoltageRating="50V" pcbX={-8} pcbY={19} schSheetName="POWER"
      connections={{ pin1: "net.VBUS_QUALIFIED", pin2: "net.GND" }} />
    <UMK325BJ106KM_T name="C_DRIVER_IN2" maxVoltageRating="50V" pcbX={-8} pcbY={25} schSheetName="POWER"
      connections={{ pin1: "net.VBUS_QUALIFIED", pin2: "net.GND" }} />
    <UMK325BJ106KM_T name="C_DRIVER_IN3" maxVoltageRating="50V" pcbX={-15} pcbY={19} schSheetName="POWER"
      connections={{ pin1: "net.VBUS_QUALIFIED", pin2: "net.GND" }} />
    <UMK325BJ106KM_T name="C_DRIVER_IN4" maxVoltageRating="50V" pcbX={-15} pcbY={25} schSheetName="POWER"
      connections={{ pin1: "net.VBUS_QUALIFIED", pin2: "net.GND" }} />
    {/* Bulk for upstream cable transients; the ceramic bank carries HF ripple.
        PD load-switch inrush with this capacitance still needs qualification. */}
    <EEHZK1V101XP name="C_DRIVER_INPUT_BULK" maxVoltageRating="35V" pcbX={-18} pcbY={12} schSheetName="POWER"
      connections={{ pin1: "net.VBUS_QUALIFIED", pin2: "net.GND" }} />
    <Capacitor100nF name="C_DRIVER_INPUT_HF" maxVoltageRating="50V" pcbX={-6} pcbY={14} schSheetName="POWER"
      connections={{ pin1: "net.VBUS_QUALIFIED", pin2: "net.GND" }} />
    <Capacitor100nF name="C_DRIVER_BOOT1" maxVoltageRating="50V" pcbX={-1} pcbY={18} schSheetName="POWER"
      connections={{ pin1: "net.DRIVER_BOOT1", pin2: "net.DRIVER_SW1" }} />
    <Capacitor100nF name="C_DRIVER_BOOT2" maxVoltageRating="50V" pcbX={3} pcbY={18} schSheetName="POWER"
      connections={{ pin1: "net.DRIVER_BOOT2", pin2: "net.DRIVER_SW2" }} />
    <Capacitor10uF name="C_DRIVER_VCC" maxVoltageRating="25V" pcbX={3} pcbY={24} schSheetName="POWER"
      connections={{ pin1: "net.LOGIC_5V", pin2: "net.GND" }} />
    <Capacitor100nF name="C_DRIVER_VCC_HF" maxVoltageRating="50V" pcbX={-2} pcbY={24} schSheetName="POWER"
      connections={{ pin1: "net.LOGIC_5V", pin2: "net.GND" }} />
    <GRM32ER71E226KE15L name="C_DRIVER_OUT1" maxVoltageRating="25V" pcbX={24} pcbY={14} schSheetName="POWER"
      connections={{ pin1: "net.DRIVER_OUT", pin2: "net.GND" }} />
    <GRM32ER71E226KE15L name="C_DRIVER_OUT2" maxVoltageRating="25V" pcbX={24} pcbY={20} schSheetName="POWER"
      connections={{ pin1: "net.DRIVER_OUT", pin2: "net.GND" }} />
    <GRM32ER71E226KE15L name="C_DRIVER_OUT3" maxVoltageRating="25V" pcbX={24} pcbY={26} schSheetName="POWER"
      connections={{ pin1: "net.DRIVER_OUT", pin2: "net.GND" }} />
    <GRM32ER71E226KE15L name="C_DRIVER_OUT4" maxVoltageRating="25V" pcbX={31} pcbY={14} schSheetName="POWER"
      connections={{ pin1: "net.DRIVER_OUT", pin2: "net.GND" }} />
    <Capacitor100nF name="C_DRIVER_OUTPUT_HF" maxVoltageRating="50V" pcbX={3} pcbY={11} schSheetName="POWER"
      connections={{ pin1: "net.DRIVER_OUT", pin2: "net.GND" }} />
    {/* Post-shunt bulk follows TI's EVM topology. Capacitor transients are
        distinct from the slow average current limit delivered to the TEC. */}
    <OVZ101M1ETR_0606 name="C_TEC_BULK" maxVoltageRating="25V" pcbX={30} pcbY={-2} schSheetName="POWER"
      connections={{ pin1: "net.TEC_POS", pin2: "net.GND" }} />
    {/* Kelvin-route both sense taps after routing is commissioned. */}
    <Resistor0603 name="R_ISP_FILTER" resistance="10"
      manufacturerPartNumber="0603WAF100JT5E" supplierPartNumbers={{ jlcpcb: ["C22859"] }} pcbX={9} pcbY={6} schSheetName="POWER"
      connections={{ pin1: "net.DRIVER_OUT", pin2: "net.DRIVER_ISP" }} />
    <Resistor0603 name="R_ISN_FILTER" resistance="10"
      manufacturerPartNumber="0603WAF100JT5E" supplierPartNumbers={{ jlcpcb: ["C22859"] }} pcbX={9} pcbY={4} schSheetName="POWER"
      connections={{ pin1: "net.TEC_POS", pin2: "net.DRIVER_ISN" }} />
    <Capacitor220nF name="C_CURRENT_FILTER" maxVoltageRating="50V" pcbX={5} pcbY={6} schSheetName="POWER"
      connections={{ pin1: "net.DRIVER_ISP", pin2: "net.DRIVER_ISN" }} />
    <Resistor0603 name="R_DRIVER_FSW" resistance="49.9k"
      manufacturerPartNumber="0603WAF4992T5E" supplierPartNumbers={{ jlcpcb: ["C23184"] }} pcbX={-5} pcbY={10} schSheetName="POWER"
      connections={{ pin1: "net.DRIVER_FSW", pin2: "net.GND" }} />
    {/* Initial compensation is TI EVM's 27.4k / 4.7nF / 100pF network. */}
    <Resistor0603 name="R_COMP" resistance="27.4k"
      manufacturerPartNumber="0603WAF2742T5E" supplierPartNumbers={{ jlcpcb: ["C22964"] }} pcbX={1} pcbY={9} schSheetName="POWER"
      connections={{ pin1: "net.DRIVER_COMP", pin2: "net.DRIVER_COMP_ZERO" }} />
    <Capacitor4n7F name="C_COMP_ZERO" maxVoltageRating="50V" pcbX={1} pcbY={6} schSheetName="POWER"
      connections={{ pin1: "net.DRIVER_COMP_ZERO", pin2: "net.GND" }} />
    <Capacitor100pF name="C_COMP_POLE" maxVoltageRating="100V" pcbX={1} pcbY={3} schSheetName="POWER"
      connections={{ pin1: "net.DRIVER_COMP", pin2: "net.GND" }} />
    {/* Independent UVLO rejects 5 V even if the MCU releases its reset clamp.
        PD fault and the reset/watchdog clamp pull DRIVER_ENABLE low. */}
    <Resistor0603 name="R_DRIVER_EN_TOP" resistance="130k"
      manufacturerPartNumber="0603WAF1303T5E" supplierPartNumbers={{ jlcpcb: ["C22795"] }} pcbX={-5} pcbY={6} schSheetName="POWER"
      connections={{ pin1: "net.VBUS_QUALIFIED", pin2: "net.DRIVER_ENABLE" }} />
    <Resistor0603 name="R_DRIVER_EN_BOTTOM" resistance="10k"
      manufacturerPartNumber="0603WAF1002T5E" supplierPartNumbers={{ jlcpcb: ["C25804"] }} pcbX={-5} pcbY={3} schSheetName="POWER"
      connections={{ pin1: "net.DRIVER_ENABLE", pin2: "net.GND" }} />
    <Capacitor100nF name="C_DRIVER_EN" maxVoltageRating="50V" pcbX={-5} pcbY={0} schSheetName="POWER"
      connections={{ pin1: "net.DRIVER_ENABLE", pin2: "net.GND" }} />
  </>
}
