import { Fragment } from "react"
import { STM32G0B1KBT6 } from "../../imports/STM32G0B1KBT6"
import { USB4085_GF_A } from "../../imports/USB4085_GF_A"
import { USBLC6_2SC6 } from "../../imports/USBLC6_2SC6"
import { TPS2116DRLR } from "../../imports/TPS2116DRLR"
import { LMR50410Y5FQDBVRQ1 } from "../../imports/LMR50410Y5FQDBVRQ1"
import { TLV75533PDBVR } from "../../imports/TLV75533PDBVR"
import { SWPA4018S4R7MT } from "../../imports/SWPA4018S4R7MT"
import { A_2N7002 } from "../../imports/A_2N7002"
import { KT_0603R } from "../../imports/KT_0603R"
import { KT_0603YG } from "../../imports/KT_0603YG"
import { KT_0603Y } from "../../imports/KT_0603Y"
import { MMBT3904_RANGE_100_300_ } from "../parts/C20526"
import { CC0805KKX7R9BB225 } from "../../imports/CC0805KKX7R9BB225"
import { SourcedCapacitor, SourcedResistor } from "./sourced-passive"

export const controlDesign = {
  mcu: "STM32G0B1KBT6",
  programming: "Native USB full-speed CDC and ROM DFU",
  outputVoltageDivider: { topOhms: 100_000, bottomOhms: 20_000 },
  inputVoltageDivider: { topOhms: 150_000, bottomOhms: 22_000 },
  programVbusDivider: { topOhms: 15_000, bottomOhms: 20_000 },
  logicSupplySelection: "highest voltage",
  currentMonitorVoltsPerAmp: 0.2,
  defaultOutputEnabled: false,
  i2cPeripheral: "I2C1",
  i2cAlternateFunction: 6,
  usbClockHz: 48_000_000,
  usbExternalCrystalRequired: false,
} as const

// Physical pins are for the exact LQFP32 part, not the LQFP48 variant.
export const controlPinMap = {
  currentAdc: { pin: 7, gpio: "PA0", adcChannel: 0, net: "OUTPUT_CURRENT_ADC" },
  outputVoltageAdc: { pin: 8, gpio: "PA1", adcChannel: 1, net: "OUTPUT_VOLTAGE_ADC" },
  inputVoltageAdc: { pin: 10, gpio: "PA3", adcChannel: 3, net: "INPUT_VOLTAGE_ADC" },
  programVbus: { pin: 11, gpio: "PA4", net: "PROGRAM_VBUS_SENSE" },
  driverFault: { pin: 12, gpio: "PA5", net: "DRIVER_FAULT", activeLow: true },
  pdFault: { pin: 14, gpio: "PA7", net: "PD_FAULT_SENSE", activeLow: false },
  // PB0 is not driven by the ROM bootloader. PA2 can be ROM USART2 TX.
  permission: { pin: 15, gpio: "PB0", net: "MCU_DRIVER_PERMISSION", activeHigh: true },
  runLed: { pin: 16, gpio: "PB1", net: "LED_RUN_DRIVE", activeHigh: true },
  faultLed: { pin: 17, gpio: "PB2", net: "LED_FAULT_DRIVE", activeHigh: true },
  usbDm: { pin: 22, gpio: "PA11", net: "PROGRAM_USB_DM" },
  usbDp: { pin: 23, gpio: "PA12", net: "PROGRAM_USB_DP" },
  swdio: { pin: 24, gpio: "PA13", net: "SWDIO" },
  swclkBoot0: { pin: 25, gpio: "PA14", net: "SWCLK_BOOT0" },
  scl: { pin: 30, gpio: "PB6", net: "I2C_SCL" },
  sda: { pin: 31, gpio: "PB7", net: "I2C_SDA" },
} as const

const control = { schSheetName: "CONTROL" }
const resistors = [
  ["R_PROGRAM_CC1", "5.1k", -27, -14, "PROGRAM_CC1", "GND"],
  ["R_PROGRAM_CC2", "5.1k", -27, -17, "PROGRAM_CC2", "GND"],
  ["R_SCL", "4.7k", -5, -8, "CTRL_3V3", "I2C_SCL"],
  ["R_SDA", "4.7k", -1, -8, "CTRL_3V3", "I2C_SDA"],
  ["R_RESET", "10k", 6, -26, "CTRL_3V3", "MCU_RESET"],
  ["R_BOOT0", "10k", -8, -11, "SWCLK_BOOT0", "GND"],
  ["R_KILL_DRIVE", "1k", 8, -15, "MCU_DRIVER_PERMISSION", "DRIVER_RELEASE_GATE"],
  ["R_KILL_RESET", "47k", 8, -11, "LOGIC_5V", "DRIVER_KILL_BASE"],
  ["R_RELEASE_OFF", "100k", 20, -19, "DRIVER_RELEASE_GATE", "GND"],
  ["R_PD_FAULT_SENSE", "10k", 8, -8, "PD_FAULT", "PD_FAULT_SENSE"],
  ["R_DRIVER_FAULT", "4.7k", 16, -19, "CTRL_3V3", "DRIVER_FAULT"],
  ["R_I_ADC", "1k", 8, -19, "DRIVER_CURRENT_MONITOR", "OUTPUT_CURRENT_ADC"],
  ["R_V_ADC_TOP", "100k", 16, -11, "TEC_POS", "OUTPUT_VOLTAGE_ADC"],
  ["R_V_ADC_BOTTOM", "20k", 16, -15, "OUTPUT_VOLTAGE_ADC", "GND"],
  ["R_PD_ADC_TOP", "150k", -20, -25, "VBUS_QUALIFIED", "INPUT_VOLTAGE_ADC"],
  ["R_PD_ADC_BOTTOM", "22k", -16, -25, "INPUT_VOLTAGE_ADC", "GND"],
  ["R_PROGRAM_SENSE_TOP", "15k", 8, -23, "PROGRAM_VBUS", "PROGRAM_VBUS_SENSE"],
  ["R_PROGRAM_SENSE_BOTTOM", "20k", 12, -23, "PROGRAM_VBUS_SENSE", "GND"],
] as const

export const debugTestpoints = [
  ["TP_SWDIO", "SWDIO", "SWDIO"], ["TP_BOOT0", "SWCLK_BOOT0", "CLK/BOOT0"],
  ["TP_NRST", "MCU_RESET", "NRST"], ["TP_3V3", "CTRL_3V3", "3V3"],
  ["TP_GND", "GND", "GND"], ["TP_RAW_PD", "VBUS_RAW", "RAW PD"],
  ["TP_QUAL_PD", "VBUS_QUALIFIED", "QUAL PD"], ["TP_5V", "LOGIC_5V", "5V"],
  ["TP_TEC", "TEC_POS", "TEC +"], ["TP_OUT", "DRIVER_OUT", "PRE-SHUNT"],
  ["TP_EN", "DRIVER_ENABLE", "EN"], ["TP_ISP", "DRIVER_ISP", "ISP"],
  ["TP_ISN", "DRIVER_ISN", "ISN"], ["TP_SCL", "I2C_SCL", "SCL"], ["TP_SDA", "I2C_SDA", "SDA"],
] as const

export function ControlBlock() {
  return <>
    <USB4085_GF_A name="J_PROGRAM" pcbX={-33} pcbY={-20} pcbRotation={270} {...control}
      connections={{ pin1: "net.PROGRAM_CC1", pin14: "net.PROGRAM_CC2",
        pin2: "net.GND", pin8: "net.GND", pin9: "net.GND", pin16: "net.GND", pin17: "net.GND",
        pin3: "net.PROGRAM_VBUS", pin7: "net.PROGRAM_VBUS", pin10: "net.PROGRAM_VBUS", pin15: "net.PROGRAM_VBUS",
        pin4: "net.PROGRAM_USB_DP", pin13: "net.PROGRAM_USB_DP", pin5: "net.PROGRAM_USB_DM", pin12: "net.PROGRAM_USB_DM" }}
      noConnect={["SBU1", "SBU2"]} />
    <USBLC6_2SC6 name="U_PROGRAM_ESD" pcbX={-26} pcbY={-25} {...control}
      connections={{ pin1: "net.PROGRAM_USB_DM", pin6: "net.PROGRAM_USB_DM", pin3: "net.PROGRAM_USB_DP",
        pin4: "net.PROGRAM_USB_DP", pin2: "net.GND", pin5: "net.LOGIC_5V" }} />
    <SourcedCapacitor name="C_PROGRAM_ESD" capacitance="100nF" pcbX={-26} pcbY={-28} {...control}
      connections={{ pin1: "net.LOGIC_5V", pin2: "net.GND" }} />
    {/* Program USB powers only logic. TPS2116 prevents either USB source feeding
        the other, and avoids a Schottky drop on the main converter's VCC supply. */}
    <TPS2116DRLR name="U_LOGIC_MUX" pcbX={-19} pcbY={-17} {...control} noConnect={["ST"]}
      connections={{ pin1: "net.GND", pin2: "net.LOGIC_5V", pin7: "net.LOGIC_5V", pin3: "net.AUX_5V",
        pin4: "net.GND", pin5: "net.GND", pin6: "net.PROGRAM_VBUS" }} />
    <SourcedCapacitor name="C_PROGRAM_IN" capacitance="1uF" pcbX={-26} pcbY={-20} {...control}
      connections={{ pin1: "net.PROGRAM_VBUS", pin2: "net.GND" }} />
    <SourcedCapacitor name="C_LOGIC_MUX_OUT" capacitance="1uF" pcbX={-16} pcbY={-20} {...control}
      connections={{ pin1: "net.LOGIC_5V", pin2: "net.GND" }} />
    <LMR50410Y5FQDBVRQ1 name="U_AUX" pcbX={-21} pcbY={-8} {...control}
      connections={{ pin1: "net.AUX_BOOT", pin2: "net.GND", pin3: "net.AUX_5V",
        pin4: "net.VBUS_RAW", pin5: "net.VBUS_RAW", pin6: "net.AUX_SW" }} />
    <SWPA4018S4R7MT name="L_AUX" pcbX={-14} pcbY={-8} {...control}
      connections={{ pin1: "net.AUX_SW", pin2: "net.AUX_5V" }} />
    {/* Raw PD capacitance remains below USB-C's 10 uF attachment limit. */}
    <CC0805KKX7R9BB225 name="C_AUX_IN" pcbX={-26} pcbY={-8} {...control}
      connections={{ pin1: "net.VBUS_RAW", pin2: "net.GND" }} />
    <SourcedCapacitor name="C_AUX_HF" capacitance="100nF" pcbX={-26} pcbY={-11} {...control}
      connections={{ pin1: "net.VBUS_RAW", pin2: "net.GND" }} />
    <SourcedCapacitor name="C_AUX_BOOT" capacitance="100nF" pcbX={-21} pcbY={-12} {...control}
      connections={{ pin1: "net.AUX_BOOT", pin2: "net.AUX_SW" }} />
    <SourcedCapacitor name="C_AUX_OUT" capacitance="10uF" pcbX={-13} pcbY={-12} {...control}
      connections={{ pin1: "net.AUX_5V", pin2: "net.GND" }} />
    <TLV75533PDBVR name="U_CTRL_LDO" pcbX={-12} pcbY={-18} {...control} noConnect={["NC"]}
      connections={{ pin1: "net.LOGIC_5V", pin2: "net.GND", pin3: "net.LOGIC_5V", pin5: "net.CTRL_3V3" }} />
    <SourcedCapacitor name="C_LDO_IN" capacitance="1uF" pcbX={-12} pcbY={-22} {...control}
      connections={{ pin1: "net.LOGIC_5V", pin2: "net.GND" }} />
    <SourcedCapacitor name="C_LDO_OUT" capacitance="1uF" pcbX={-8} pcbY={-22} {...control}
      connections={{ pin1: "net.CTRL_3V3", pin2: "net.GND" }} />
    <STM32G0B1KBT6 name="U_MCU" pcbX={0} pcbY={-15} {...control}
      noConnect={["PB9", "PC14_OSC32_IN", "PC15_OSC32_OUT", "PA2", "PA6", "PA8", "PA9", "PC6", "PA10", "PA15", "PB3", "PB4", "PB5", "PB8"]}
      connections={{ pin4: "net.CTRL_3V3", pin5: "net.GND", pin6: "net.MCU_RESET",
        pin7: "net.OUTPUT_CURRENT_ADC", pin8: "net.OUTPUT_VOLTAGE_ADC", pin10: "net.INPUT_VOLTAGE_ADC",
        pin11: "net.PROGRAM_VBUS_SENSE", pin12: "net.DRIVER_FAULT", pin14: "net.PD_FAULT_SENSE",
        pin15: "net.MCU_DRIVER_PERMISSION", pin16: "net.LED_RUN_DRIVE", pin17: "net.LED_FAULT_DRIVE",
        pin22: "net.PROGRAM_USB_DM", pin23: "net.PROGRAM_USB_DP", pin24: "net.SWDIO", pin25: "net.SWCLK_BOOT0",
        pin30: "net.I2C_SCL", pin31: "net.I2C_SDA" }} />
    <SourcedCapacitor name="C_MCU_HF" capacitance="100nF" pcbX={-1} pcbY={-23} {...control}
      connections={{ pin1: "net.CTRL_3V3", pin2: "net.GND" }} />
    <SourcedCapacitor name="C_MCU_BULK" capacitance="4.7uF" pcbX={-5} pcbY={-23} {...control}
      connections={{ pin1: "net.CTRL_3V3", pin2: "net.GND" }} />
    <SourcedCapacitor name="C_MCU_RESET" capacitance="100nF" pcbX={4} pcbY={-23} {...control}
      connections={{ pin1: "net.MCU_RESET", pin2: "net.GND" }} />
    <MMBT3904_RANGE_100_300_ name="Q_MCU_KILL" pcbX={12} pcbY={-8} {...control}
      connections={{ pin1: "net.DRIVER_KILL_BASE", pin2: "net.GND", pin3: "net.DRIVER_ENABLE" }} />
    <A_2N7002 name="Q_MCU_RELEASE" pcbX={21} pcbY={-8} {...control}
      connections={{ pin1: "net.DRIVER_RELEASE_GATE", pin2: "net.GND", pin3: "net.DRIVER_KILL_BASE" }} />
    {resistors.map(([name, resistance, x, y, a, b]) => <SourcedResistor key={name} name={name}
      resistance={resistance} pcbX={x} pcbY={y} {...control}
      connections={{ pin1: "net." + a, pin2: "net." + b }} />)}
    {[["C_I_ADC", "OUTPUT_CURRENT_ADC", 12, -19], ["C_V_ADC", "OUTPUT_VOLTAGE_ADC", 20, -15],
      ["C_PD_ADC", "INPUT_VOLTAGE_ADC", -12, -25], ["C_PROGRAM_SENSE", "PROGRAM_VBUS_SENSE", 16, -23]].map(([name, net, x, y]) =>
      <SourcedCapacitor key={name} name={String(name)} capacitance="100nF" pcbX={Number(x)} pcbY={Number(y)} {...control}
        connections={{ pin1: "net." + net, pin2: "net.GND" }} />)}
    <group name="STATUS" schSheetName="CONTROL">
      {([
        ["POWER", KT_0603Y, -9, -6, "CTRL_3V3", "pin1"],
        ["RUN", KT_0603YG, 0, 0, "LED_RUN_DRIVE", "pin2"],
        ["FAULT", KT_0603R, 9, 6, "LED_FAULT_DRIVE", "pin1"],
      ] as const).map(([id, Component, x, schX, drive, anodePin]) => <Fragment key={id}>
        <SourcedResistor name={"R_LED_" + id} resistance="1k" pcbX={x} pcbY={-4}
          schX={schX} schY={1.3} {...control}
          connections={{ pin1: "net." + drive, pin2: "net.LED_" + id + "_ANODE" }} />
        <Component name={"LED_" + id} pcbX={x} pcbY={-1} schX={schX} schY={-1.3} {...control}
          connections={{ [anodePin]: "net.LED_" + id + "_ANODE", [anodePin === "pin1" ? "pin2" : "pin1"]: "net.GND" }} />
      </Fragment>)}
    </group>
    <silkscreentext text="3V3" pcbX={-9} pcbY={1} fontSize={0.8} />
    <silkscreentext text="RUN" pcbX={0} pcbY={1} fontSize={0.8} />
    <silkscreentext text="FAULT" pcbX={9} pcbY={1} fontSize={0.8} />
    {debugTestpoints.map(([name, net, label], i) => <Fragment key={name}>
      <testpoint name={name} footprintVariant="pad" padDiameter={1.5} doNotPlace
        pcbX={-21 + i * 3} pcbY={-28} {...control} connections={{ pin1: "net." + net }} />
      <silkscreentext text={label} pcbX={-21 + i * 3} pcbY={-25.2} pcbRotation={90} fontSize={0.6} />
    </Fragment>)}
    <silkscreentext text="USB PROGRAM" pcbX={-33} pcbY={-12.5} fontSize={0.75} />
  </>
}
