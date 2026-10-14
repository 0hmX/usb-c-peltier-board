import { MMBT3904_RANGE_100_300_ } from "../parts/C20526"
import { A_2N7002 } from "../../imports/A_2N7002"
import { CC0603KRX7R9BB104 as Capacitor100nF } from "../parts/C14663"
import { A_0603WAF1001T5E as Resistor0603 } from "../../imports/A_0603WAF1001T5E"

export function PermissionAndSensing() {
  return <>
    <MMBT3904_RANGE_100_300_ name="Q_MCU_KILL" pcbX={12} pcbY={-8} schSheetName="CONTROL"
      connections={{ pin1: "net.DRIVER_KILL_BASE", pin2: "net.GND", pin3: "net.DRIVER_ENABLE" }} />
    <A_2N7002 name="Q_MCU_RELEASE" pcbX={21} pcbY={-8} schSheetName="CONTROL" />
    <trace from=".Q_MCU_RELEASE > .pin1" to="net.DRIVER_RELEASE_GATE" />
    <trace from=".Q_MCU_RELEASE > .pin2" to="net.GND" />
    <trace from=".Q_MCU_RELEASE > .pin3" to="net.DRIVER_KILL_BASE" />
    <Resistor0603 name="R_KILL_DRIVE" resistance="1k" pcbX={8.5} pcbY={-15.5} schSheetName="CONTROL"
      manufacturerPartNumber="0603WAF1001T5E" supplierPartNumbers={{ jlcpcb: ["C21190"] }}
      connections={{ pin1: "net.MCU_DRIVER_PERMISSION", pin2: "net.DRIVER_RELEASE_GATE" }} />
    <Resistor0603 name="R_KILL_RESET" resistance="47k" pcbX={12} pcbY={-11} schSheetName="CONTROL"
      manufacturerPartNumber="0603WAF4702T5E" supplierPartNumbers={{ jlcpcb: ["C25819"] }}
      connections={{ pin1: "net.LOGIC_5V", pin2: "net.DRIVER_KILL_BASE" }} />
    <Resistor0603 name="R_RELEASE_OFF" resistance="100k" pcbX={20} pcbY={-19} schSheetName="CONTROL"
      manufacturerPartNumber="0603WAF1003T5E" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.DRIVER_RELEASE_GATE", pin2: "net.GND" }} />
    <Resistor0603 name="R_PD_FAULT_SENSE" resistance="10k" pcbX={16} pcbY={-8} schSheetName="CONTROL"
      manufacturerPartNumber="0603WAF1002T5E" supplierPartNumbers={{ jlcpcb: ["C25804"] }}
      connections={{ pin1: "net.PD_FAULT", pin2: "net.PD_FAULT_SENSE" }} />
    <Resistor0603 name="R_DRIVER_FAULT" resistance="4.7k" pcbX={16} pcbY={-19} schSheetName="CONTROL"
      manufacturerPartNumber="0603WAF4701T5E" supplierPartNumbers={{ jlcpcb: ["C23162"] }}
      connections={{ pin1: "net.CTRL_3V3", pin2: "net.DRIVER_FAULT" }} />
    <Resistor0603 name="R_I_ADC" resistance="1k" pcbX={8.5} pcbY={-19} schSheetName="CONTROL"
      manufacturerPartNumber="0603WAF1001T5E" supplierPartNumbers={{ jlcpcb: ["C21190"] }}
      connections={{ pin1: "net.DRIVER_CURRENT_MONITOR", pin2: "net.OUTPUT_CURRENT_ADC" }} />
    <Resistor0603 name="R_V_ADC_TOP" resistance="100k" pcbX={16} pcbY={-11} schSheetName="CONTROL"
      manufacturerPartNumber="0603WAF1003T5E" supplierPartNumbers={{ jlcpcb: ["C25803"] }}
      connections={{ pin1: "net.TEC_POS", pin2: "net.OUTPUT_VOLTAGE_ADC" }} />
    <Resistor0603 name="R_V_ADC_BOTTOM" resistance="20k" pcbX={16} pcbY={-15} schSheetName="CONTROL"
      manufacturerPartNumber="0603WAF2002T5E" supplierPartNumbers={{ jlcpcb: ["C4184"] }}
      connections={{ pin1: "net.OUTPUT_VOLTAGE_ADC", pin2: "net.GND" }} />
    <Resistor0603 name="R_PD_ADC_TOP" resistance="150k" pcbX={-20} pcbY={-25} schSheetName="CONTROL"
      manufacturerPartNumber="0603WAF1503T5E" supplierPartNumbers={{ jlcpcb: ["C22807"] }}
      connections={{ pin1: "net.VBUS_QUALIFIED", pin2: "net.INPUT_VOLTAGE_ADC" }} />
    <Resistor0603 name="R_PD_ADC_BOTTOM" resistance="22k" pcbX={-16} pcbY={-25} schSheetName="CONTROL"
      manufacturerPartNumber="0603WAF2202T5E" supplierPartNumbers={{ jlcpcb: ["C31850"] }}
      connections={{ pin1: "net.INPUT_VOLTAGE_ADC", pin2: "net.GND" }} />
    <Resistor0603 name="R_PROGRAM_SENSE_TOP" resistance="15k" pcbX={8} pcbY={-23} schSheetName="CONTROL"
      manufacturerPartNumber="0603WAF1502T5E" supplierPartNumbers={{ jlcpcb: ["C22809"] }}
      connections={{ pin1: "net.PROGRAM_VBUS", pin2: "net.PROGRAM_VBUS_SENSE" }} />
    <Resistor0603 name="R_PROGRAM_SENSE_BOTTOM" resistance="20k" pcbX={12} pcbY={-23} schSheetName="CONTROL"
      manufacturerPartNumber="0603WAF2002T5E" supplierPartNumbers={{ jlcpcb: ["C4184"] }}
      connections={{ pin1: "net.PROGRAM_VBUS_SENSE", pin2: "net.GND" }} />
    <Capacitor100nF name="C_I_ADC" maxVoltageRating="50V" pcbX={12} pcbY={-19} schSheetName="CONTROL"
      connections={{ pin1: "net.OUTPUT_CURRENT_ADC", pin2: "net.GND" }} />
    <Capacitor100nF name="C_V_ADC" maxVoltageRating="50V" pcbX={20} pcbY={-15} schSheetName="CONTROL"
      connections={{ pin1: "net.OUTPUT_VOLTAGE_ADC", pin2: "net.GND" }} />
    <Capacitor100nF name="C_PD_ADC" maxVoltageRating="50V" pcbX={-12} pcbY={-25} schSheetName="CONTROL"
      connections={{ pin1: "net.INPUT_VOLTAGE_ADC", pin2: "net.GND" }} />
    <Capacitor100nF name="C_PROGRAM_SENSE" maxVoltageRating="50V" pcbX={16} pcbY={-23} schSheetName="CONTROL"
      connections={{ pin1: "net.PROGRAM_VBUS_SENSE", pin2: "net.GND" }} />
  </>
}
