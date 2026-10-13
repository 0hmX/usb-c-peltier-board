import { Fragment } from "react"
import { STM32G030F6P6 } from "../../imports/STM32G030F6P6"
import { LMR50410Y5FQDBVRQ1 } from "../../imports/LMR50410Y5FQDBVRQ1"
import { TLV75533PDBVR } from "../../imports/TLV75533PDBVR"
import { SWPA4018S4R7MT } from "../../imports/SWPA4018S4R7MT"
import { A_2N7002 } from "../../imports/A_2N7002"
import { TS_1187A_B_A_B } from "../../imports/TS_1187A_B_A_B"
import { B4B_PH_K_S_LF__SN_ } from "../../imports/B4B_PH_K_S_LF__SN_"
import { A_2_54_1_5P___ } from "../../imports/A_2_54_1_5P___"
import { MMBT3904_RANGE_100_300_ } from "../parts/C20526"
import { CC0805KKX7R9BB225 } from "../../imports/CC0805KKX7R9BB225"
import { SourcedCapacitor, SourcedResistor } from "./sourced-passive"

export const controlDesign = {
  mcu: "STM32G030F6P6",
  display: "Waveshare 0.91inch OLED Module, SKU 14657",
  displaySource: "https://www.waveshare.com/0.91inch-oled-module.htm",
  displayWidthMm: 36,
  displayHeightMm: 12.5,
  outputVoltageDivider: { topOhms: 100_000, bottomOhms: 20_000 },
  inputVoltageDivider: { topOhms: 150_000, bottomOhms: 22_000 },
  currentMonitorVoltsPerAmp: 0.2,
  defaultOutputEnabled: false,
  i2cPeripheral: "I2C2",
  i2cAlternateFunction: 6,
  // PA11/PA12 are the default pad functions. Leave both SYSCFG remap bits clear.
  i2cRemap: false,
} as const

export const controlPinMap = {
  inputVoltageAdc: { pin: 1, gpio: "PB7", adcChannel: 11, net: "INPUT_VOLTAGE_ADC" },
  currentAdc: { pin: 7, gpio: "PA0", adcChannel: 0, net: "OUTPUT_CURRENT_ADC" },
  outputVoltageAdc: { pin: 8, gpio: "PA1", adcChannel: 1, net: "OUTPUT_VOLTAGE_ADC" },
  // High releases the clamp. Low, reset Hi-Z, or loss of 3V3 keeps output off.
  permission: { pin: 9, gpio: "PA2", net: "MCU_DRIVER_PERMISSION", activeHigh: true },
  driverFault: { pin: 10, gpio: "PA3", net: "DRIVER_FAULT", activeLow: true },
  minus: { pin: 11, gpio: "PA4", net: "BUTTON_MINUS", activeLow: true },
  setRun: { pin: 12, gpio: "PA5", net: "BUTTON_SET_RUN", activeLow: true },
  plus: { pin: 13, gpio: "PA6", net: "BUTTON_PLUS", activeLow: true },
  pdFault: { pin: 14, gpio: "PA7", net: "PD_FAULT_SENSE", activeLow: false },
  scl: { pin: 16, gpio: "PA11", net: "I2C_SCL" },
  sda: { pin: 17, gpio: "PA12", net: "I2C_SDA" },
  swdio: { pin: 18, gpio: "PA13", net: "SWDIO" },
  swclk: { pin: 19, gpio: "PA14", net: "SWCLK" },
} as const

const control = { schSheetName: "CONTROL" }
const resistors = [
  ["R_SCL", "4.7k", -2, -9, "CTRL_3V3", "I2C_SCL"],
  ["R_SDA", "4.7k", 2, -9, "CTRL_3V3", "I2C_SDA"],
  ["R_RESET", "10k", -7, -20, "CTRL_3V3", "MCU_RESET"],
  ["R_KILL_DRIVE", "1k", 8, -15, "MCU_DRIVER_PERMISSION", "DRIVER_RELEASE_GATE"],
  ["R_KILL_RESET", "47k", 8, -11, "AUX_5V", "DRIVER_KILL_BASE"],
  ["R_RELEASE_OFF", "100k", 20, -19, "DRIVER_RELEASE_GATE", "GND"],
  ["R_PD_FAULT_SENSE", "10k", 2, -19, "PD_FAULT", "PD_FAULT_SENSE"],
  ["R_DRIVER_FAULT", "4.7k", 16, -19, "CTRL_3V3", "DRIVER_FAULT"],
  ["R_I_ADC", "1k", 8, -19, "DRIVER_CURRENT_MONITOR", "OUTPUT_CURRENT_ADC"],
  ["R_V_ADC_TOP", "100k", 16, -11, "TEC_POS", "OUTPUT_VOLTAGE_ADC"],
  ["R_V_ADC_BOTTOM", "20k", 16, -15, "OUTPUT_VOLTAGE_ADC", "GND"],
  ["R_PD_ADC_TOP", "150k", -20, -19, "VBUS_QUALIFIED", "INPUT_VOLTAGE_ADC"],
  ["R_PD_ADC_BOTTOM", "22k", -16, -19, "INPUT_VOLTAGE_ADC", "GND"],
] as const

export function ControlBlock() {
  return <>
    {/* Auxiliary bias stays powered at raw USB voltage. TPS55289 VCC is AUX_5V,
        so its I2C pins are not back-powered by the MCU while its EN is low. */}
    <LMR50410Y5FQDBVRQ1 name="U_AUX" pcbX={-30} pcbY={-12} {...control}
      connections={{ pin1: "net.AUX_BOOT", pin2: "net.GND", pin3: "net.AUX_5V",
        pin4: "net.VBUS_RAW", pin5: "net.VBUS_RAW", pin6: "net.AUX_SW" }} />
    <SWPA4018S4R7MT name="L_AUX" pcbX={-23} pcbY={-12} {...control}
      connections={{ pin1: "net.AUX_SW", pin2: "net.AUX_5V" }} />
    {/* Keep raw-VBUS capacitance below USB-C's 10 uF limit before PD negotiation. */}
    <CC0805KKX7R9BB225 name="C_AUX_IN" pcbX={-33} pcbY={-19} {...control}
      connections={{ pin1: "net.VBUS_RAW", pin2: "net.GND" }} />
    <SourcedCapacitor name="C_AUX_HF" capacitance="100nF" pcbX={-33} pcbY={-9} {...control}
      connections={{ pin1: "net.VBUS_RAW", pin2: "net.GND" }} />
    <SourcedCapacitor name="C_AUX_BOOT" capacitance="100nF" pcbX={-27} pcbY={-8} {...control}
      connections={{ pin1: "net.AUX_BOOT", pin2: "net.AUX_SW" }} />
    <SourcedCapacitor name="C_AUX_OUT" capacitance="10uF" pcbX={-21} pcbY={-8} {...control}
      connections={{ pin1: "net.AUX_5V", pin2: "net.GND" }} />
    <TLV75533PDBVR name="U_CTRL_LDO" pcbX={-15} pcbY={-12} {...control} noConnect={["NC"]}
      connections={{ pin1: "net.AUX_5V", pin2: "net.GND", pin3: "net.AUX_5V", pin5: "net.CTRL_3V3" }} />
    <SourcedCapacitor name="C_LDO_IN" capacitance="1uF" pcbX={-17} pcbY={-8} {...control}
      connections={{ pin1: "net.AUX_5V", pin2: "net.GND" }} />
    <SourcedCapacitor name="C_LDO_OUT" capacitance="1uF" pcbX={-12} pcbY={-8} {...control}
      connections={{ pin1: "net.CTRL_3V3", pin2: "net.GND" }} />
    <STM32G030F6P6 name="U_MCU" pcbX={-3} pcbY={-14} {...control}

      noConnect={["PB9", "PC15_OSC32_OUT", "PB0", "PB3"]}
      connections={{
        pin1: "net.INPUT_VOLTAGE_ADC", pin4: "net.CTRL_3V3", pin5: "net.GND", pin6: "net.MCU_RESET",
        pin7: "net.OUTPUT_CURRENT_ADC", pin8: "net.OUTPUT_VOLTAGE_ADC", pin9: "net.MCU_DRIVER_PERMISSION",
        pin10: "net.DRIVER_FAULT", pin11: "net.BUTTON_MINUS", pin12: "net.BUTTON_SET_RUN",
        pin13: "net.BUTTON_PLUS", pin14: "net.PD_FAULT_SENSE", pin16: "net.I2C_SCL",
        pin17: "net.I2C_SDA", pin18: "net.SWDIO", pin19: "net.SWCLK",
      }} />
    <SourcedCapacitor name="C_MCU_HF" capacitance="100nF" pcbX={-10} pcbY={-12} {...control}
      connections={{ pin1: "net.CTRL_3V3", pin2: "net.GND" }} />
    <SourcedCapacitor name="C_MCU_BULK" capacitance="4.7uF" pcbX={-7} pcbY={-9} {...control}
      connections={{ pin1: "net.CTRL_3V3", pin2: "net.GND" }} />
    <SourcedCapacitor name="C_MCU_RESET" capacitance="100nF" pcbX={-10} pcbY={-17} {...control}
      connections={{ pin1: "net.MCU_RESET", pin2: "net.GND" }} />
    <MMBT3904_RANGE_100_300_ name="Q_MCU_KILL" pcbX={12} pcbY={-8} {...control}
      connections={{ pin1: "net.DRIVER_KILL_BASE", pin2: "net.GND", pin3: "net.DRIVER_ENABLE" }} />
    <A_2N7002 name="Q_MCU_RELEASE" pcbX={21} pcbY={-8} {...control}
      connections={{ pin1: "net.DRIVER_RELEASE_GATE", pin2: "net.GND", pin3: "net.DRIVER_KILL_BASE" }} />
    {resistors.map(([name, resistance, x, y, a, b]) => <SourcedResistor key={name} name={name}
      resistance={resistance} pcbX={x} pcbY={y} {...control}
      connections={{ pin1: "net." + a, pin2: "net." + b }} />)}
    {[["C_I_ADC", "OUTPUT_CURRENT_ADC", 12, -19], ["C_V_ADC", "OUTPUT_VOLTAGE_ADC", 20, -15],
      ["C_PD_ADC", "INPUT_VOLTAGE_ADC", -12, -19]].map(([name, net, x, y]) =>
      <SourcedCapacitor key={name} name={String(name)} capacitance="100nF" pcbX={Number(x)} pcbY={Number(y)} {...control}
        connections={{ pin1: "net." + net, pin2: "net.GND" }} />)}
    {/* XKB switch drawing: 1/3 share one contact, 2/4 share the other. */}
    {[["MINUS", -11], ["SET_RUN", 0], ["PLUS", 11]].map(([id, x]) => <Fragment key={String(id)}>
      <TS_1187A_B_A_B name={"SW_" + id} pcbX={Number(x)} pcbY={-25} {...control}
        connections={{ pin1: "net.BUTTON_" + id, pin3: "net.BUTTON_" + id, pin2: "net.GND", pin4: "net.GND" }} />
      <SourcedResistor name={"R_BUTTON_" + id} resistance="10k" pcbX={Number(x)} pcbY={-21} {...control}
        connections={{ pin1: "net.CTRL_3V3", pin2: "net.BUTTON_" + id }} />
    </Fragment>)}
    {/* Waveshare schematic J1 order is SCL, SDA, GND, VCC; qualify a matching cable. */}
    <B4B_PH_K_S_LF__SN_ name="J_DISPLAY" pcbX={-28} pcbY={-25} {...control}
      connections={{ pin1: "net.I2C_SCL", pin2: "net.I2C_SDA", pin3: "net.GND", pin4: "net.CTRL_3V3" }} />
    <A_2_54_1_5P___ name="J_SWD" pcbX={34} pcbY={-20} pcbRotation={90} {...control}
      connections={{ pin1: "net.CTRL_3V3", pin2: "net.SWDIO", pin3: "net.SWCLK", pin4: "net.GND", pin5: "net.MCU_RESET" }} />
    <silkscreentext text="−" pcbX={-11} pcbY={-29} fontSize={1.2} />
    <silkscreentext text="SET / RUN" pcbX={0} pcbY={-29} fontSize={0.8} />
    <silkscreentext text="+" pcbX={11} pcbY={-29} fontSize={1.2} />
    <silkscreentext text="OLED · 3V3" pcbX={-28} pcbY={-29} fontSize={0.8} />
    <silkscreentext text="HOLD SET: ON/OFF" pcbX={7} pcbY={-6} fontSize={0.8} />
  </>
}
