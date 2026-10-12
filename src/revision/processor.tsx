import { StandardJstSwdSide, StandardJstUartSide } from "./parts/standard-jst-programmer.js"
import { Schottky } from "../parts"
import { RP2040 } from "./parts/RP2040"
import { W25Q16JVUXIQ } from "./parts/W25Q16JVUXIQ"
import { ABM8_272_T3 } from "./parts/ABM8_272_T3"
import { SKRPACE010 } from "./parts/SKRPACE010"

const mcu = { schSheetName: "MCU", schSectionName: "MCU_CORE" }
const support = { schSheetName: "MCU", schSectionName: "MCU_SUPPORT" }
const supplyPins = [1, 10, 22, 33, 42, 44, 48, 49]

export const processorConnections: Record<string, string> = {
  ...Object.fromEntries(supplyPins.map(pin => ["pin" + pin, "net.V3V3"])),
  pin2: "net.UART_TX_MCU", pin3: "net.UART_RX_MCU",
  pin6: "net.PD_CFG1_LOW", pin7: "net.PD_CFG2_LOW", pin8: "net.PD_CFG3_LOW",
  pin11: "net.I2C_SDA", pin12: "net.I2C_SCL", pin13: "net.FAN_PWM_DRIVE", pin14: "net.FAN_TACH_MCU",
  pin15: "net.TEC_REQUEST", pin16: "net.MCU_RUN", pin17: "net.MCU_ARM",
  pin19: "net.GND", pin20: "net.XIN", pin21: "net.XOUT", pin23: "net.V1V1",
  pin24: "net.SWCLK_MCU", pin25: "net.SWDIO_MCU", pin26: "net.MCU_NRST",
  pin27: "net.PD_VALID_N", pin28: "net.INPUT_FAULT_N", pin29: "net.INPUT_AUXOFF",
  pin36: "net.USB_VBUS_DETECT", pin38: "net.HOT_ADC", pin39: "net.COLD_ADC",
  pin40: "net.VOUT_ADC", pin41: "net.VBUS_ADC", pin43: "net.ADC_AVDD",
  pin45: "net.V1V1", pin46: "net.USB_DM_MCU", pin47: "net.USB_DP_MCU", pin50: "net.V1V1",
  pin51: "net.FLASH_SD3", pin52: "net.FLASH_SCLK", pin53: "net.FLASH_SD0",
  pin54: "net.FLASH_SD2", pin55: "net.FLASH_SD1", pin56: "net.FLASH_CS", pin57: "net.GND",
}

export function Processor() {
  return <>
    <RP2040 name="U_MCU" pcbX={-27} pcbY={-21} schX={0} schY={7} {...mcu}
      connections={processorConnections}
      noConnect={["GPIO2", "GPIO3", "GPIO7", "GPIO15", "GPIO19", "GPIO20", "GPIO21", "GPIO22", "GPIO23", "GPIO25"]}
      schPinArrangement={{
        leftSide: { pins: [2, 3, 6, 7, 8, 11, 12, 13, 14, 15, 16, 17, 24, 25, 26], direction: "top-to-bottom" },
        rightSide: { pins: [20, 21, 27, 28, 29, 36, 38, 39, 40, 41, 51, 52, 53, 54, 55, 56], direction: "top-to-bottom" },
        topSide: { pins: [1, 10, 22, 33, 42, 43, 44, 45, 48, 49, 23, 50], direction: "left-to-right" },
        bottomSide: { pins: [4, 5, 9, 18, 19, 30, 31, 32, 34, 35, 37, 46, 47, 57], direction: "left-to-right" },
      }} />
    <W25Q16JVUXIQ name="U_FLASH" pcbX={-30} pcbY={-12} schX={14} schY={10} {...support}
      connections={{ pin1: "net.FLASH_CS", pin2: "net.FLASH_SD1", pin3: "net.FLASH_SD2", pin4: "net.GND",
        pin5: "net.FLASH_SD0", pin6: "net.FLASH_SCLK", pin7: "net.FLASH_SD3", pin8: "net.V3V3", pin9: "net.GND" }} />
    <capacitor name="C_FLASH" capacitance="100nF" footprint="0402" pcbX={-32} pcbY={-12} pcbRotation={90}
      schX={20} schY={12} {...support} connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <resistor name="R_FLASH_CS" resistance="10k" footprint="0402" pcbX={-29} pcbY={-15}
      schX={14} schY={16} {...support} connections={{ pin1: "net.V3V3", pin2: "net.FLASH_CS" }} />
    <ABM8_272_T3 name="Y_MCU" pcbX={-30} pcbY={-29} schX={14} schY={0} {...support}
      connections={{ pin1: "net.XIN", pin2: "net.GND", pin3: "net.XOUT_CRYSTAL", pin4: "net.GND" }} />
    <resistor name="R_XOUT" resistance="1k" footprint="0402" pcbX={-30} pcbY={-26}
      schX={20} schY={0} {...support} connections={{ pin1: "net.XOUT", pin2: "net.XOUT_CRYSTAL" }} />
    <capacitor name="C_XIN" capacitance="15pF" footprint="0402" pcbX={-33} pcbY={-28}
      schX={12} schY={-5} {...support} connections={{ pin1: "net.XIN", pin2: "net.GND" }} />
    <capacitor name="C_XOUT" capacitance="15pF" footprint="0402" pcbX={-27} pcbY={-29}
      schX={17} schY={-5} {...support} connections={{ pin1: "net.XOUT_CRYSTAL", pin2: "net.GND" }} />
    {[
      ["C_IO1", -27, -15], ["C_IO2", -22, -19], ["C_IO3", -22, -23],
      ["C_IO4", -28, -26], ["C_IO5", -32, -23], ["C_IO6", -32, -19],
      ["C_USB_VDD", -25, -15],
    ].map(([name, pcbX, pcbY], index) => <capacitor key={name} name={String(name)} capacitance="100nF" footprint="0402"
      pcbX={Number(pcbX)} pcbY={Number(pcbY)} pcbRotation={90} schX={-8 + (index % 4) * 5} schY={-8 - Math.floor(index / 4) * 4}
      schSheetName="MCU" schSectionName="MCU_BYPASS" connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />)}
    {[
      ["C_VREG_IN", "1uF", -23, -15, "V3V3"],
      ["C_VREG_OUT", "1uF", -23, -13, "V1V1"],
      ["C_DVDD1", "100nF", -28.5, -15, "V1V1"],
      ["C_DVDD2", "100nF", -26, -26, "V1V1"],
      ["C_ADC_AVDD", "100nF", -22, -16, "ADC_AVDD"],
      ["C_MCU_BULK", "4.7uF", -35, -27, "V3V3"],
    ].map(([name, value, pcbX, pcbY, rail], index) => <capacitor key={name} name={String(name)} capacitance={String(value)} footprint="0402"
      pcbX={Number(pcbX)} pcbY={Number(pcbY)} pcbRotation={90} schX={14 + (index % 3) * 6} schY={-10 - Math.floor(index / 3) * 4}
      schSheetName="MCU" schSectionName="MCU_BYPASS" connections={{ pin1: "net." + rail, pin2: "net.GND" }} />)}
    <resistor name="R_ADC_SUPPLY" resistance="200" footprint="0402" pcbX={-22} pcbY={-14}
      schX={27} schY={0} {...support} connections={{ pin1: "net.V3V3", pin2: "net.ADC_AVDD" }} />
    <resistor name="R_RESET_PU" resistance="10k" footprint="0402" pcbX={-24} pcbY={-27}
      schX={29} schY={13} {...support} connections={{ pin1: "net.V3V3", pin2: "net.MCU_NRST" }} />
    <resistor name="R_BOOT" resistance="1k" footprint="0402" pcbX={-34} pcbY={-15}
      schX={29} schY={8} {...support} connections={{ pin1: "net.FLASH_CS", pin2: "net.BOOT_BUTTON" }} />
    <SKRPACE010 name="SW_BOOT" pcbX={-43} pcbY={-30} schX={35} schY={8} {...support}
      connections={{ pin1: "net.BOOT_BUTTON", pin2: "net.BOOT_BUTTON", pin3: "net.GND", pin4: "net.GND" }} />
    <SKRPACE010 name="SW_RESET" pcbX={-33} pcbY={-36} schX={35} schY={13} {...support}
      connections={{ pin1: "net.MCU_NRST", pin2: "net.MCU_NRST", pin3: "net.GND", pin4: "net.GND" }} />
    <Schottky name="D_RESET_SAFE" pcbX={-6} pcbY={-32} schX={29} schY={18} {...support}
      connections={{ pin1: "net.MCU_NRST", pin2: "net.INPUT_FAULT_N" }} />
    <StandardJstSwdSide name="J_SWD" pcbX={-22} pcbY={-36} schX={27} schY={-5} {...support}
      connections={{ pin1: "net.SWCLK", pin2: "net.GND", pin3: "net.SWDIO" }} />
    <StandardJstUartSide name="J_UART" role="target" pcbX={-12} pcbY={-36} schX={35} schY={-5} {...support}
      connections={{ pin1: "net.UART_RX", pin2: "net.GND", pin3: "net.UART_TX" }} />
    {[
      ["R_SWCLK", "100", -22, -29, "SWCLK", "SWCLK_MCU"],
      ["R_SWDIO", "100", -21, -31, "SWDIO", "SWDIO_MCU"],
      ["R_UART_TX", "100", -23, -32, "UART_TX_MCU", "UART_TX"],
      ["R_USB_DP", "27", -26, -13, "USB_DP_SWITCH", "USB_DP_MCU"],
      ["R_USB_DM", "27", -26, -11, "USB_DM_SWITCH", "USB_DM_MCU"],
      ["R_INPUT_PG", "10k", -23, 15, "V3V3", "INPUT_AUXOFF"],
    ].map(([name, value, pcbX, pcbY, first, second], index) => <resistor key={name} name={String(name)} resistance={String(value)}
      footprint="0402" pcbX={Number(pcbX)} pcbY={Number(pcbY)} schX={-10 + (index % 3) * 7} schY={22 + Math.floor(index / 3) * 5}
      {...support} connections={{ pin1: "net." + first, pin2: "net." + second }} />)}
    <testpoint name="TP_RESET" cadModel={null} footprint={<footprint><smtpad shape="circle" radius={1} portHints={["pin1"]} /><courtyardcircle radius={1.3} /></footprint>} pcbX={-1} pcbY={-32}
      schX={35} schY={18} {...support} connections={{ pin1: "net.MCU_NRST" }} />
  </>
}
