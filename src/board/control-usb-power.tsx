import { USB4085_GF_A } from "../../imports/USB4085_GF_A"
import { USBLC6_2SC6 } from "../../imports/USBLC6_2SC6"
import { TPS2116DRLR } from "../../imports/TPS2116DRLR"
import { LMR50410Y5FQDBVRQ1 } from "../../imports/LMR50410Y5FQDBVRQ1"
import { TLV75533PDBVR } from "../../imports/TLV75533PDBVR"
import { SWPA4018S4R7MT } from "../../imports/SWPA4018S4R7MT"
import { CC0805KKX7R9BB225 as Capacitor2u2F } from "../../imports/CC0805KKX7R9BB225"
import { CC0603KRX7R9BB104 as Capacitor100nF } from "../parts/C14663"
import { CC0603KRX7R8BB105 as Capacitor1uF } from "../../imports/CC0603KRX7R8BB105"
import { CL21A106KAYNNNE as Capacitor10uF } from "../../imports/CL21A106KAYNNNE"
import { A_0603WAF1001T5E as Resistor0603 } from "../../imports/A_0603WAF1001T5E"

export function ProgrammingAndLogicPower() {
  return <>
    <USB4085_GF_A name="J_PROGRAM" pcbX={-33} pcbY={-20} pcbRotation={270} schSheetName="CONTROL"
      connections={{ pin1: "net.PROGRAM_CC1", pin14: "net.PROGRAM_CC2",
        pin2: "net.GND", pin8: "net.GND", pin9: "net.GND", pin16: "net.GND", pin17: "net.GND",
        pin3: "net.PROGRAM_VBUS", pin7: "net.PROGRAM_VBUS", pin10: "net.PROGRAM_VBUS", pin15: "net.PROGRAM_VBUS",
        pin4: "net.PROGRAM_USB_DP", pin13: "net.PROGRAM_USB_DP", pin5: "net.PROGRAM_USB_DM", pin12: "net.PROGRAM_USB_DM" }}
      noConnect={["SBU1", "SBU2"]} />
    <USBLC6_2SC6 name="U_PROGRAM_ESD" pcbX={-26} pcbY={-25} schSheetName="CONTROL"
      connections={{ pin1: "net.PROGRAM_USB_DM", pin6: "net.PROGRAM_USB_DM", pin3: "net.PROGRAM_USB_DP",
        pin4: "net.PROGRAM_USB_DP", pin2: "net.GND", pin5: "net.LOGIC_5V" }} />
    <Capacitor100nF name="C_PROGRAM_ESD" maxVoltageRating="50V" pcbX={-26} pcbY={-28} schSheetName="CONTROL"
      connections={{ pin1: "net.LOGIC_5V", pin2: "net.GND" }} />
    {/* Program USB powers only logic. TPS2116 prevents either USB source feeding
        the other, and avoids a Schottky drop on the main converter's VCC supply. */}
    <TPS2116DRLR name="U_LOGIC_MUX" pcbX={-19} pcbY={-17} schSheetName="CONTROL" noConnect={["ST"]}
      connections={{ pin1: "net.GND", pin2: "net.LOGIC_5V", pin7: "net.LOGIC_5V", pin3: "net.AUX_5V",
        pin4: "net.GND", pin5: "net.GND", pin6: "net.PROGRAM_VBUS" }} />
    <Capacitor1uF name="C_PROGRAM_IN" maxVoltageRating="25V" pcbX={-26} pcbY={-20} schSheetName="CONTROL"
      connections={{ pin1: "net.PROGRAM_VBUS", pin2: "net.GND" }} />
    <Capacitor1uF name="C_LOGIC_MUX_OUT" maxVoltageRating="25V" pcbX={-16} pcbY={-20} schSheetName="CONTROL"
      connections={{ pin1: "net.LOGIC_5V", pin2: "net.GND" }} />
    <LMR50410Y5FQDBVRQ1 name="U_AUX" pcbX={-21} pcbY={-8} schSheetName="CONTROL"
      connections={{ pin1: "net.AUX_BOOT", pin2: "net.GND", pin3: "net.AUX_5V",
        pin4: "net.VBUS_RAW", pin5: "net.VBUS_RAW", pin6: "net.AUX_SW" }} />
    <SWPA4018S4R7MT name="L_AUX" pcbX={-14} pcbY={-8} schSheetName="CONTROL"
      connections={{ pin1: "net.AUX_SW", pin2: "net.AUX_5V" }} />
    {/* Raw PD capacitance remains below USB-C's 10 uF attachment limit. */}
    <Capacitor2u2F name="C_AUX_IN" pcbX={-26} pcbY={-8} schSheetName="CONTROL"
      connections={{ pin1: "net.VBUS_RAW", pin2: "net.GND" }} />
    <Capacitor100nF name="C_AUX_HF" maxVoltageRating="50V" pcbX={-26} pcbY={-11} schSheetName="CONTROL"
      connections={{ pin1: "net.VBUS_RAW", pin2: "net.GND" }} />
    <Capacitor100nF name="C_AUX_BOOT" maxVoltageRating="50V" pcbX={-21} pcbY={-12} schSheetName="CONTROL"
      connections={{ pin1: "net.AUX_BOOT", pin2: "net.AUX_SW" }} />
    <Capacitor10uF name="C_AUX_OUT" maxVoltageRating="25V" pcbX={-13} pcbY={-12} schSheetName="CONTROL"
      connections={{ pin1: "net.AUX_5V", pin2: "net.GND" }} />
    <TLV75533PDBVR name="U_CTRL_LDO" pcbX={-12} pcbY={-18} schSheetName="CONTROL" noConnect={["NC"]}
      connections={{ pin1: "net.LOGIC_5V", pin2: "net.GND", pin3: "net.LOGIC_5V", pin5: "net.CTRL_3V3" }} />
    <Capacitor1uF name="C_LDO_IN" maxVoltageRating="25V" pcbX={-12} pcbY={-22} schSheetName="CONTROL"
      connections={{ pin1: "net.LOGIC_5V", pin2: "net.GND" }} />
    <Capacitor1uF name="C_LDO_OUT" maxVoltageRating="25V" pcbX={-8} pcbY={-22} schSheetName="CONTROL"
      connections={{ pin1: "net.CTRL_3V3", pin2: "net.GND" }} />
    <Resistor0603 name="R_PROGRAM_CC1" resistance="5.1k" pcbX={-27} pcbY={-14} schSheetName="CONTROL"
      manufacturerPartNumber="0603WAF5101T5E" supplierPartNumbers={{ jlcpcb: ["C23186"] }}
      connections={{ pin1: "net.PROGRAM_CC1", pin2: "net.GND" }} />
    <Resistor0603 name="R_PROGRAM_CC2" resistance="5.1k" pcbX={-27} pcbY={-17} schSheetName="CONTROL"
      manufacturerPartNumber="0603WAF5101T5E" supplierPartNumbers={{ jlcpcb: ["C23186"] }}
      connections={{ pin1: "net.PROGRAM_CC2", pin2: "net.GND" }} />
    <silkscreentext text="USB PROGRAM" pcbX={-33} pcbY={-12.5} fontSize={0.75} />
  </>
}
