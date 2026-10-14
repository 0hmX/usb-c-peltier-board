import { RP2040 } from "../../imports/RP2040"
import { W25Q128JVSIQ } from "../../imports/W25Q128JVSIQ"
import { ABM8_272_T3 } from "../../imports/ABM8_272_T3"
import { CC0603KRX7R9BB104 as Capacitor100nF } from "../parts/C14663"
import { CC0603KRX7R8BB105 as Capacitor1uF } from "../../imports/CC0603KRX7R8BB105"
import { CL21A106KAYNNNE as Capacitor10uF } from "../../imports/CL21A106KAYNNNE"
import { CL10C150JB8NNNC as Capacitor15pF } from "../../imports/CL10C150JB8NNNC"
import { A_0603WAF1001T5E as Resistor0603 } from "../../imports/A_0603WAF1001T5E"

export function Rp2040Control() {
  return <>
    <RP2040 name="U_MCU" pcbX={0} pcbY={-15} schSheetName="CONTROL"
      noConnect={["GPIO5", "GPIO10", "GPIO11", "GPIO12", "GPIO13", "GPIO14", "GPIO15",
        "GPIO16", "GPIO17", "GPIO18", "GPIO19", "GPIO20", "GPIO21", "GPIO22", "GPIO23", "GPIO24", "GPIO25"]}
      connections={{
        pin1: "net.CTRL_3V3", pin10: "net.CTRL_3V3", pin22: "net.CTRL_3V3",
        pin33: "net.CTRL_3V3", pin42: "net.CTRL_3V3", pin43: "net.CTRL_3V3",
        pin44: "net.CTRL_3V3", pin48: "net.CTRL_3V3", pin49: "net.CTRL_3V3",
        pin19: "net.GND", pin57: "net.GND", pin23: "net.RP_CORE_1V1", pin50: "net.RP_CORE_1V1", pin45: "net.RP_CORE_1V1",
        pin2: "net.I2C_SDA", pin3: "net.I2C_SCL", pin4: "net.MCU_DRIVER_PERMISSION",
        pin5: "net.DRIVER_FAULT", pin6: "net.PD_FAULT_SENSE", pin8: "net.LED_RUN_DRIVE", pin9: "net.LED_FAULT_DRIVE",
        pin11: "net.HOT_DATA_MCU", pin12: "net.COLD_DATA_MCU",
        pin20: "net.XIN", pin21: "net.XOUT", pin24: "net.SWCLK", pin25: "net.SWDIO", pin26: "net.MCU_RUN",
        pin38: "net.OUTPUT_CURRENT_ADC", pin39: "net.OUTPUT_VOLTAGE_ADC", pin40: "net.INPUT_VOLTAGE_ADC", pin41: "net.PROGRAM_VBUS_SENSE",
        pin46: "net.RP_USB_DM", pin47: "net.RP_USB_DP", pin51: "net.QSPI_SD3", pin52: "net.QSPI_SCLK",
        pin53: "net.QSPI_SD0", pin54: "net.QSPI_SD2", pin55: "net.QSPI_SD1", pin56: "net.QSPI_SS",
      }} />
    {/* Winbond flash matches Raspberry Pi's reference circuit. The protected
        BOOTSEL pad can be grounded during RUN reset to enter the ROM USB loader. */}
    <W25Q128JVSIQ name="U_FLASH" pcbX={0} pcbY={-4} pcbRotation={90} schSheetName="CONTROL"
      connections={{ pin1: "net.QSPI_SS", pin2: "net.QSPI_SD1", pin3: "net.QSPI_SD2", pin4: "net.GND",
        pin5: "net.QSPI_SD0", pin6: "net.QSPI_SCLK", pin7: "net.QSPI_SD3", pin8: "net.CTRL_3V3" }} />
    <ABM8_272_T3 name="Y_MCU" pcbX={0} pcbY={-23} schSheetName="CONTROL"
      connections={{ pin1: "net.XIN", pin2: "net.GND", pin3: "net.XOUT_CRYSTAL", pin4: "net.GND" }} />
    <Capacitor100nF name="C_IOVDD1" maxVoltageRating="50V" pcbX={-6} pcbY={-11.5} pcbRotation={90} schSheetName="CONTROL"
      connections={{ pin1: "net.CTRL_3V3", pin2: "net.GND" }} />
    <Capacitor100nF name="C_IOVDD10" maxVoltageRating="50V" pcbX={-6} pcbY={-15.5} pcbRotation={90} schSheetName="CONTROL"
      connections={{ pin1: "net.CTRL_3V3", pin2: "net.GND" }} />
    <Capacitor100nF name="C_IOVDD22" maxVoltageRating="50V" pcbX={-3.5} pcbY={-20.5} pcbRotation={0} schSheetName="CONTROL"
      connections={{ pin1: "net.CTRL_3V3", pin2: "net.GND" }} />
    <Capacitor100nF name="C_IOVDD33" maxVoltageRating="50V" pcbX={6} pcbY={-18.5} pcbRotation={90} schSheetName="CONTROL"
      connections={{ pin1: "net.CTRL_3V3", pin2: "net.GND" }} />
    <Capacitor100nF name="C_IOVDD42" maxVoltageRating="50V" pcbX={6} pcbY={-15.5} pcbRotation={90} schSheetName="CONTROL"
      connections={{ pin1: "net.CTRL_3V3", pin2: "net.GND" }} />
    <Capacitor100nF name="C_IOVDD49" maxVoltageRating="50V" pcbX={-3.5} pcbY={-9.1} pcbRotation={90} schSheetName="CONTROL"
      connections={{ pin1: "net.CTRL_3V3", pin2: "net.GND" }} />
    <Capacitor100nF name="C_ADC_AVDD" maxVoltageRating="50V" pcbX={6} pcbY={-12.5} pcbRotation={90} schSheetName="CONTROL"
      connections={{ pin1: "net.CTRL_3V3", pin2: "net.GND" }} />
    <Capacitor100nF name="C_USB_VDD" maxVoltageRating="50V" pcbX={0.5} pcbY={-9.1} pcbRotation={90} schSheetName="CONTROL"
      connections={{ pin1: "net.CTRL_3V3", pin2: "net.GND" }} />
    <Capacitor100nF name="C_DVDD23" maxVoltageRating="50V" pcbX={0} pcbY={-20.5} pcbRotation={0} schSheetName="CONTROL"
      connections={{ pin1: "net.RP_CORE_1V1", pin2: "net.GND" }} />
    <Capacitor100nF name="C_DVDD50" maxVoltageRating="50V" pcbX={-1.5} pcbY={-9.1} pcbRotation={90} schSheetName="CONTROL"
      connections={{ pin1: "net.RP_CORE_1V1", pin2: "net.GND" }} />
    <Capacitor1uF name="C_VREG_IN" maxVoltageRating="25V" pcbX={4.5} pcbY={-9.1} pcbRotation={90} schSheetName="CONTROL"
      connections={{ pin1: "net.CTRL_3V3", pin2: "net.GND" }} />
    <Capacitor1uF name="C_VREG_OUT" maxVoltageRating="25V" pcbX={2.5} pcbY={-9.1} pcbRotation={90} schSheetName="CONTROL"
      connections={{ pin1: "net.RP_CORE_1V1", pin2: "net.GND" }} />
    <Capacitor10uF name="C_MCU_BULK" maxVoltageRating="25V" pcbX={-8} pcbY={-25} pcbRotation={0} schSheetName="CONTROL"
      connections={{ pin1: "net.CTRL_3V3", pin2: "net.GND" }} />
    <Capacitor100nF name="C_MCU_RUN" maxVoltageRating="50V" pcbX={8} pcbY={-26} pcbRotation={0} schSheetName="CONTROL"
      connections={{ pin1: "net.MCU_RUN", pin2: "net.GND" }} />
    <Capacitor100nF name="C_FLASH" maxVoltageRating="50V" pcbX={-7} pcbY={-4} pcbRotation={90} schSheetName="CONTROL"
      connections={{ pin1: "net.CTRL_3V3", pin2: "net.GND" }} />
    <Capacitor15pF name="C_XIN" maxVoltageRating="50V" pcbX={-3.5} pcbY={-23} pcbRotation={0} schSheetName="CONTROL"
      connections={{ pin1: "net.XIN", pin2: "net.GND" }} />
    <Capacitor15pF name="C_XOUT" maxVoltageRating="50V" pcbX={3.5} pcbY={-25} pcbRotation={0} schSheetName="CONTROL"
      connections={{ pin1: "net.XOUT_CRYSTAL", pin2: "net.GND" }} />
    <Resistor0603 name="R_SCL" resistance="4.7k" pcbX={-8.5} pcbY={-8} schSheetName="CONTROL"
      manufacturerPartNumber="0603WAF4701T5E" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.CTRL_3V3", pin2: "net.I2C_SCL" }} />
    <Resistor0603 name="R_SDA" resistance="4.7k" pcbX={-8.5} pcbY={-10.5} schSheetName="CONTROL"
      manufacturerPartNumber="0603WAF4701T5E" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.CTRL_3V3", pin2: "net.I2C_SDA" }} />
    <Resistor0603 name="R_RUN" resistance="10k" pcbX={12} pcbY={-26} schSheetName="CONTROL"
      manufacturerPartNumber="0603WAF1002T5E" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.CTRL_3V3", pin2: "net.MCU_RUN" }} />
    <Resistor0603 name="R_USB_DM" resistance="27" pcbX={8.5} pcbY={-11.5} schSheetName="CONTROL"
      manufacturerPartNumber="0603WAF270JT5E" supplierPartNumbers={{ jlcpcb: ["C25190"] }}
      connections={{ pin1: "net.PROGRAM_USB_DM", pin2: "net.RP_USB_DM" }} />
    <Resistor0603 name="R_USB_DP" resistance="27" pcbX={8.5} pcbY={-13.5} schSheetName="CONTROL"
      manufacturerPartNumber="0603WAF270JT5E" supplierPartNumbers={{ jlcpcb: ["C25190"] }}
      connections={{ pin1: "net.PROGRAM_USB_DP", pin2: "net.RP_USB_DP" }} />
    <Resistor0603 name="R_XOUT" resistance="1k" pcbX={3.5} pcbY={-23} schSheetName="CONTROL"
      manufacturerPartNumber="0603WAF1001T5E" supplierPartNumbers={{ jlcpcb: ["C21190"] }}
      connections={{ pin1: "net.XOUT", pin2: "net.XOUT_CRYSTAL" }} />
    <Resistor0603 name="R_BOOTSEL" resistance="1k" pcbX={7} pcbY={-5} schSheetName="CONTROL"
      manufacturerPartNumber="0603WAF1001T5E" supplierPartNumbers={{ jlcpcb: ["C21190"] }}
      connections={{ pin1: "net.BOOTSEL_PAD", pin2: "net.QSPI_SS" }} />
    <Resistor0603 name="R_FLASH_CS" resistance="10k" pcbX={7} pcbY={-2} schSheetName="CONTROL"
      manufacturerPartNumber="0603WAF1002T5E" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.CTRL_3V3", pin2: "net.QSPI_SS" }} />
  </>
}
