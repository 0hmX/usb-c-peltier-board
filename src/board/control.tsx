import { Fragment } from "react"
import { RP2040 } from "../../imports/RP2040"
import { W25Q128JVSIQ } from "../../imports/W25Q128JVSIQ"
import { ABM8_272_T3 } from "../../imports/ABM8_272_T3"
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
import { connectorPlacements } from "../assembly/connector-placement"

export const controlDesign = {
  mcu: "RP2040",
  programming: "Native USB full-speed CDC and ROM UF2/BOOTSEL",
  flash: { part: "W25Q128JVSIQ", bytes: 16 * 1024 * 1024 },
  outputVoltageDivider: { topOhms: 100_000, bottomOhms: 20_000 },
  inputVoltageDivider: { topOhms: 150_000, bottomOhms: 22_000 },
  programVbusDivider: { topOhms: 15_000, bottomOhms: 20_000 },
  logicSupplySelection: "highest voltage",
  currentMonitorVoltsPerAmp: 0.2,
  defaultOutputEnabled: false,
  i2cPeripheral: "I2C0",
  usbClockHz: 48_000_000,
  crystalHz: 12_000_000,
  usbExternalCrystalRequired: true,
} as const

// Physical pins are for Raspberry Pi RP2040 QFN56, including exposed pad 57.
export const controlPinMap = {
  currentAdc: { pin: 38, gpio: "GP26", adcChannel: 0, net: "OUTPUT_CURRENT_ADC" },
  outputVoltageAdc: { pin: 39, gpio: "GP27", adcChannel: 1, net: "OUTPUT_VOLTAGE_ADC" },
  inputVoltageAdc: { pin: 40, gpio: "GP28", adcChannel: 2, net: "INPUT_VOLTAGE_ADC" },
  programVbus: { pin: 41, gpio: "GP29", adcChannel: 3, net: "PROGRAM_VBUS_SENSE" },
  driverFault: { pin: 5, gpio: "GP3", net: "DRIVER_FAULT", activeLow: true },
  pdFault: { pin: 6, gpio: "GP4", net: "PD_FAULT_SENSE", activeLow: false },
  // GP2 is unused by the ROM USB bootloader; the external gate pulldown keeps output off.
  permission: { pin: 4, gpio: "GP2", net: "MCU_DRIVER_PERMISSION", activeHigh: true },
  runLed: { pin: 8, gpio: "GP6", net: "LED_RUN_DRIVE", activeHigh: true },
  faultLed: { pin: 9, gpio: "GP7", net: "LED_FAULT_DRIVE", activeHigh: true },
  usbDm: { pin: 46, net: "RP_USB_DM" },
  usbDp: { pin: 47, net: "RP_USB_DP" },
  swdio: { pin: 25, net: "SWDIO" },
  swclk: { pin: 24, net: "SWCLK" },
  run: { pin: 26, net: "MCU_RUN" },
  bootsel: { pin: 56, net: "QSPI_SS", padNet: "BOOTSEL_PAD" },
  scl: { pin: 3, gpio: "GP1", net: "I2C_SCL" },
  sda: { pin: 2, gpio: "GP0", net: "I2C_SDA" },
} as const

const control = { schSheetName: "CONTROL" }
const resistors = [
  ["R_PROGRAM_CC1", "5.1k", -27, -14, "PROGRAM_CC1", "GND"],
  ["R_PROGRAM_CC2", "5.1k", -27, -17, "PROGRAM_CC2", "GND"],
  ["R_SCL", "4.7k", -8.5, -8, "CTRL_3V3", "I2C_SCL"],
  ["R_SDA", "4.7k", -8.5, -10.5, "CTRL_3V3", "I2C_SDA"],
  ["R_RUN", "10k", 12, -26, "CTRL_3V3", "MCU_RUN"],
  ["R_USB_DM", "27", 8.5, -11.5, "PROGRAM_USB_DM", "RP_USB_DM"],
  ["R_USB_DP", "27", 8.5, -13.5, "PROGRAM_USB_DP", "RP_USB_DP"],
  ["R_XOUT", "1k", 3.5, -23, "XOUT", "XOUT_CRYSTAL"],
  ["R_BOOTSEL", "1k", 7, -5, "BOOTSEL_PAD", "QSPI_SS"],
  ["R_FLASH_CS", "10k", 7, -2, "CTRL_3V3", "QSPI_SS"],
  ["R_KILL_DRIVE", "1k", 8.5, -15.5, "MCU_DRIVER_PERMISSION", "DRIVER_RELEASE_GATE"],
  ["R_KILL_RESET", "47k", 12, -11, "LOGIC_5V", "DRIVER_KILL_BASE"],
  ["R_RELEASE_OFF", "100k", 20, -19, "DRIVER_RELEASE_GATE", "GND"],
  ["R_PD_FAULT_SENSE", "10k", 16, -8, "PD_FAULT", "PD_FAULT_SENSE"],
  ["R_DRIVER_FAULT", "4.7k", 16, -19, "CTRL_3V3", "DRIVER_FAULT"],
  ["R_I_ADC", "1k", 8.5, -19, "DRIVER_CURRENT_MONITOR", "OUTPUT_CURRENT_ADC"],
  ["R_V_ADC_TOP", "100k", 16, -11, "TEC_POS", "OUTPUT_VOLTAGE_ADC"],
  ["R_V_ADC_BOTTOM", "20k", 16, -15, "OUTPUT_VOLTAGE_ADC", "GND"],
  ["R_PD_ADC_TOP", "150k", -20, -25, "VBUS_QUALIFIED", "INPUT_VOLTAGE_ADC"],
  ["R_PD_ADC_BOTTOM", "22k", -16, -25, "INPUT_VOLTAGE_ADC", "GND"],
  ["R_PROGRAM_SENSE_TOP", "15k", 8, -23, "PROGRAM_VBUS", "PROGRAM_VBUS_SENSE"],
  ["R_PROGRAM_SENSE_BOTTOM", "20k", 12, -23, "PROGRAM_VBUS_SENSE", "GND"],
] as const

export const debugTestpoints = [
  ["TP_SWDIO", "SWDIO", "SWDIO"], ["TP_SWCLK", "SWCLK", "SWCLK"],
  ["TP_BOOTSEL", "BOOTSEL_PAD", "BOOTSEL"], ["TP_RUN", "MCU_RUN", "RESET"], ["TP_3V3", "CTRL_3V3", "3V3"],
  ["TP_GND", "GND", "GND"], ["TP_RAW_PD", "VBUS_RAW", "RAW PD"],
  ["TP_QUAL_PD", "VBUS_QUALIFIED", "QUAL PD"], ["TP_5V", "LOGIC_5V", "5V"],
  ["TP_TEC", "TEC_POS", "TEC +"], ["TP_OUT", "DRIVER_OUT", "OUT"],
  ["TP_EN", "DRIVER_ENABLE", "EN"], ["TP_ISP", "DRIVER_ISP", "ISP"],
  ["TP_ISN", "DRIVER_ISN", "ISN"], ["TP_SCL", "I2C_SCL", "SCL"], ["TP_SDA", "I2C_SDA", "SDA"],
] as const

export function ControlBlock() {
  return <>
    <USB4085_GF_A name="J_PROGRAM" {...connectorPlacements.J_PROGRAM} {...control}
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
    <RP2040 name="U_MCU" pcbX={0} pcbY={-15} {...control}
      noConnect={["GPIO5", "GPIO8", "GPIO9", "GPIO10", "GPIO11", "GPIO12", "GPIO13", "GPIO14", "GPIO15",
        "GPIO16", "GPIO17", "GPIO18", "GPIO19", "GPIO20", "GPIO21", "GPIO22", "GPIO23", "GPIO24", "GPIO25"]}
      connections={{
        ...Object.fromEntries([1, 10, 22, 33, 42, 43, 44, 48, 49].map(pin => ["pin" + pin, "net.CTRL_3V3"])),
        pin19: "net.GND", pin57: "net.GND", pin23: "net.RP_CORE_1V1", pin50: "net.RP_CORE_1V1", pin45: "net.RP_CORE_1V1",
        pin2: "net.I2C_SDA", pin3: "net.I2C_SCL", pin4: "net.MCU_DRIVER_PERMISSION",
        pin5: "net.DRIVER_FAULT", pin6: "net.PD_FAULT_SENSE", pin8: "net.LED_RUN_DRIVE", pin9: "net.LED_FAULT_DRIVE",
        pin20: "net.XIN", pin21: "net.XOUT", pin24: "net.SWCLK", pin25: "net.SWDIO", pin26: "net.MCU_RUN",
        pin38: "net.OUTPUT_CURRENT_ADC", pin39: "net.OUTPUT_VOLTAGE_ADC", pin40: "net.INPUT_VOLTAGE_ADC", pin41: "net.PROGRAM_VBUS_SENSE",
        pin46: "net.RP_USB_DM", pin47: "net.RP_USB_DP", pin51: "net.QSPI_SD3", pin52: "net.QSPI_SCLK",
        pin53: "net.QSPI_SD0", pin54: "net.QSPI_SD2", pin55: "net.QSPI_SD1", pin56: "net.QSPI_SS",
      }} />
    {/* Winbond flash matches Raspberry Pi's reference circuit. The protected
        BOOTSEL pad can be grounded during RUN reset to enter the ROM USB loader. */}
    <W25Q128JVSIQ name="U_FLASH" pcbX={0} pcbY={-4} pcbRotation={90} {...control}
      connections={{ pin1: "net.QSPI_SS", pin2: "net.QSPI_SD1", pin3: "net.QSPI_SD2", pin4: "net.GND",
        pin5: "net.QSPI_SD0", pin6: "net.QSPI_SCLK", pin7: "net.QSPI_SD3", pin8: "net.CTRL_3V3" }} />
    <ABM8_272_T3 name="Y_MCU" pcbX={0} pcbY={-23} {...control}
      connections={{ pin1: "net.XIN", pin2: "net.GND", pin3: "net.XOUT_CRYSTAL", pin4: "net.GND" }} />
    {([
      ["C_IOVDD1", "100nF", -6, -11.5, 90, "CTRL_3V3"],
      ["C_IOVDD10", "100nF", -6, -15.5, 90, "CTRL_3V3"],
      ["C_IOVDD22", "100nF", -3.5, -20.5, 0, "CTRL_3V3"],
      ["C_IOVDD33", "100nF", 6, -18.5, 90, "CTRL_3V3"],
      ["C_IOVDD42", "100nF", 6, -15.5, 90, "CTRL_3V3"],
      ["C_IOVDD49", "100nF", -3.5, -9.1, 90, "CTRL_3V3"],
      ["C_ADC_AVDD", "100nF", 6, -12.5, 90, "CTRL_3V3"],
      ["C_USB_VDD", "100nF", 0.5, -9.1, 90, "CTRL_3V3"],
      ["C_DVDD23", "100nF", 0, -20.5, 0, "RP_CORE_1V1"],
      ["C_DVDD50", "100nF", -1.5, -9.1, 90, "RP_CORE_1V1"],
      ["C_VREG_IN", "1uF", 4.5, -9.1, 90, "CTRL_3V3"],
      ["C_VREG_OUT", "1uF", 2.5, -9.1, 90, "RP_CORE_1V1"],
      ["C_MCU_BULK", "10uF", -8, -25, 0, "CTRL_3V3"],
      ["C_MCU_RUN", "100nF", 8, -26, 0, "MCU_RUN"],
      ["C_FLASH", "100nF", -7, -4, 90, "CTRL_3V3"],
      ["C_XIN", "15pF", -3.5, -23, 0, "XIN"],
      ["C_XOUT", "15pF", 3.5, -25, 0, "XOUT_CRYSTAL"],
    ] as const).map(([name, capacitance, x, y, rotation, net]) =>
      <SourcedCapacitor key={name} name={name} capacitance={capacitance} pcbX={x} pcbY={y} pcbRotation={rotation} {...control}
        connections={{ pin1: "net." + net, pin2: "net.GND" }} />)}
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
        ["POWER", KT_0603Y, 26, -6, "CTRL_3V3", "pin1"],
        ["RUN", KT_0603YG, 31, 0, "LED_RUN_DRIVE", "pin2"],
        ["FAULT", KT_0603R, 36, 6, "LED_FAULT_DRIVE", "pin1"],
      ] as const).map(([id, Component, x, schX, drive, anodePin]) => <Fragment key={id}>
        <SourcedResistor name={"R_LED_" + id} resistance="1k" pcbX={x} pcbY={-12}
          schX={schX} schY={1.3} {...control}
          connections={{ pin1: "net." + drive, pin2: "net.LED_" + id + "_ANODE" }} />
        <Component name={"LED_" + id} pcbX={x} pcbY={-9} schX={schX} schY={-1.3} {...control}
          connections={{ [anodePin]: "net.LED_" + id + "_ANODE", [anodePin === "pin1" ? "pin2" : "pin1"]: "net.GND" }} />
      </Fragment>)}
    </group>
    <silkscreentext text="3V3" pcbX={26} pcbY={-7} fontSize={0.8} />
    <silkscreentext text="RUN" pcbX={31} pcbY={-7} fontSize={0.8} />
    <silkscreentext text="FAULT" pcbX={36} pcbY={-7} fontSize={0.8} />
    {debugTestpoints.map(([name, net, label], i) => <Fragment key={name}>
      <testpoint name={name} footprintVariant="pad" padDiameter={1.5} doNotPlace
        pcbStyle={{ silkscreenTextVisibility: "hidden" }}
        pcbX={-21 + i * 3} pcbY={-28} {...control} connections={{ pin1: "net." + net }} />
      <silkscreentext text={label} pcbX={-21 + i * 3} pcbY={-29.25} fontSize={0.55} />
    </Fragment>)}
    <silkscreentext text="USB PROGRAM" pcbX={-33} pcbY={-12.5} fontSize={0.75} />
  </>
}
