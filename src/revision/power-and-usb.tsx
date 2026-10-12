import { Fragment } from "react"
import { Lmv393, Npn, Schottky } from "../parts"
import { CH224K } from "./parts/CH224K"
import { DTC114EETL } from "./parts/DTC114EETL"
import { StandardUsbC } from "./parts/StandardUsbC"

const net = (name: string) => "net." + name
const pd = { schSheetName: "PD", schSectionName: "PD_NEW" }
const usb = { schSheetName: "USB", schSectionName: "USB_NEW" }

export function PowerAndUsb() {
  return <>
    <StandardUsbC name="J_USB_PD" standard="usb_c" supplierPartNumbers={{ jlcpcb: ["C165948"] }}
      manufacturerPartNumber="TYPE-C-31-M-12" pcbX={-50} pcbY={23} pcbRotation={270}
      schX={-12} schY={23} {...pd}
      noConnect={["DP1", "DP2", "DM1", "DM2", "SBU1", "SBU2"]}
      connections={{ VBUS1: net("VBUS_RAW"), VBUS2: net("VBUS_RAW"), CC1: net("USB_CC1"), CC2: net("USB_CC2"),
        GND1: net("GND"), GND2: net("GND"), SHELL1: net("GND"), SHELL2: net("GND"), SHELL3: net("GND"), SHELL4: net("GND") }} />
    <CH224K name="U_PD" pcbX={-38} pcbY={23} schX={0} schY={23} {...pd}
      schPinArrangement={{ leftSide: { pins: [6, 7, 8], direction: "top-to-bottom" },
        rightSide: { pins: [9, 2, 3, 10], direction: "top-to-bottom" },
        topSide: { pins: [1], direction: "left-to-right" }, bottomSide: { pins: [4, 5, 11], direction: "left-to-right" } }}
      connections={{ pin1: net("PD_VDD"), pin2: net("PD_CFG2"), pin3: net("PD_CFG3"),
        pin4: net("PD_DATA_SHORT"), pin5: net("PD_DATA_SHORT"), pin6: net("USB_CC2"), pin7: net("USB_CC1"),
        pin8: net("PD_VBUS_SENSE"), pin9: net("PD_CFG1"), pin10: net("PD_PG_N"), pin11: net("GND") }} />
    <resistor name="R_CH_VDD" resistance="1k" footprint="1206" manufacturerPartNumber="CRCW12061K00FKEAHP"
      supplierPartNumbers={{ jlcpcb: ["C844867"] }} pcbX={-43} pcbY={27} schX={-6} schY={27} {...pd}
      connections={{ pin1: net("VBUS_RAW"), pin2: net("PD_VDD") }} />
    <resistor name="R_CH_VBUS" resistance="10k" footprint="0603" pcbX={-43} pcbY={20} schX={-6} schY={23} {...pd}
      connections={{ pin1: net("VBUS_RAW"), pin2: net("PD_VBUS_SENSE") }} />
    <capacitor name="C_CH_VDD" capacitance="1uF" footprint="0603" pcbX={-42} pcbY={23} pcbRotation={90}
      schX={0} schY={28} {...pd} connections={{ pin1: net("PD_VDD"), pin2: net("GND") }} />
    {[1, 2, 3].map(index => <Fragment key={index}>
      <DTC114EETL name={"Q_PD_CFG" + index} pcbX={-32} pcbY={29 - index * 4}
        schX={8} schY={31 - index * 5} {...pd}
        connections={{ pin1: net("PD_CFG" + index + "_LOW"), ...(index === 3 ? {} : { pin2: net("GND") }), pin3: net("PD_CFG" + index) }} />
      <resistor name={"R_PD_CFG" + index} resistance="47k" footprint="0402" pcbX={-35} pcbY={29 - index * 4}
        schX={13} schY={31 - index * 5} {...pd}
        connections={{ pin1: net("PD_VDD"), pin2: net("PD_CFG" + index) }} />
    </Fragment>)}
    <Lmv393 name="U_PD_WINDOW" pcbX={-34} pcbY={13} schX={22} schY={23} {...pd}
      connections={{ pin1: net("PD_VALID_N"), pin2: net("PD_WINDOW_SENSE"), pin3: net("PD_UV_REF"),
        pin4: net("GND"), pin5: net("PD_OV_REF"), pin6: net("PD_WINDOW_SENSE"), pin7: net("INPUT_FAULT_N"), pin8: net("V3V3") }} />
    {[
      ["R_WINDOW_TOP", "150k", -42, 15, "VBUS_RAW", "PD_WINDOW_SENSE"],
      ["R_WINDOW_BOTTOM", "10k", -42, 12, "PD_WINDOW_SENSE", "GND"],
      ["R_UV_TOP", "29.2k", -39, 9, "V3V3", "PD_UV_REF"],
      ["R_UV_BOTTOM", "10k", -35, 7, "PD_UV_REF", "GND"],
      ["R_OV_TOP", "13.3k", -30, 9, "V3V3", "PD_OV_REF"],
      ["R_OV_BOTTOM", "10k", -30, 6, "PD_OV_REF", "GND"],
      ["R_PD_VALID_PU", "4.7k", -29, 13, "V3V3", "PD_VALID_N"],
      ["R_PG_PU", "47k", -43, 17, "PD_VDD", "PD_PG_N"],
      ["R_PG_BASE", "10k", -29, 16, "PD_PG_N", "PD_PG_BASE"],
      ["R_PG_OFF", "100k", -26, 12, "PD_PG_BASE", "GND"],
    ].map(([name, resistance, pcbX, pcbY, first, second], index) =>
      <resistor key={name} name={String(name)} resistance={String(resistance)} footprint="0603"
        pcbX={Number(pcbX)} pcbY={Number(pcbY)} schX={18 + (index % 3) * 7} schY={15 - Math.floor(index / 3) * 4}
        {...pd} connections={{ pin1: net(String(first)), pin2: net(String(second)) }} />)}
    <Npn name="Q_PG_INHIBIT" pcbX={-27} pcbY={9} schX={32} schY={23} {...pd}
      connections={{ pin1: net("PD_PG_BASE"), pin2: net("GND"), pin3: net("INPUT_FAULT_N") }} />
    <capacitor name="C_PD_WINDOW" capacitance="100nF" footprint="0603" pcbX={-38} pcbY={13} pcbRotation={90}
      schX={32} schY={28} {...pd} connections={{ pin1: net("V3V3"), pin2: net("GND") }} />
    <Schottky name="D_LOGIC_PD" pcbX={-44} pcbY={3} schX={-8} schY={21} {...usb}
      connections={{ pin1: net("LOGIC_VIN"), pin2: net("VBUS_RAW") }} />
    <Schottky name="D_LOGIC_USB" pcbX={-44} pcbY={-2} schX={-8} schY={17} {...usb}
      connections={{ pin1: net("LOGIC_VIN"), pin2: net("USB_PROG_5V") }} />
    <StandardUsbC name="J_USB_PROG" standard="usb_c" supplierPartNumbers={{ jlcpcb: ["C165948"] }}
      manufacturerPartNumber="TYPE-C-31-M-12" pcbX={-50} pcbY={-19} pcbRotation={270}
      schX={0} schY={23} schPinStyle={{ pin14: { marginTop: 0.3 } }} {...usb} noConnect={["SBU1", "SBU2"]}
      connections={{ VBUS1: net("USB_PROG_5V"), VBUS2: net("USB_PROG_5V"),
        DP1: net("USB_DP_PORT"), DP2: net("USB_DP_PORT"), DM1: net("USB_DM_PORT"), DM2: net("USB_DM_PORT"),
        CC1: net("USB_PROG_CC1"), CC2: net("USB_PROG_CC2"), GND1: net("GND"), GND2: net("GND"),
        SHELL1: net("GND"), SHELL2: net("GND"), SHELL3: net("GND"), SHELL4: net("GND") }} />
    {[1, 2].map(index => <resistor key={index} name={"R_USB_CC" + index} resistance="5.1k" footprint="0603"
      pcbX={-45} pcbY={-14 - index * 3} pcbRotation={90} schX={-3 + index * 5} schY={28} {...usb}
      connections={{ pin1: net("USB_PROG_CC" + index), pin2: net("GND") }} />)}
    <capacitor name="C_USB_PROG" capacitance="1uF" footprint="0603" pcbX={-44} pcbY={-24}
      schX={-8} schY={26} {...usb} connections={{ pin1: net("USB_PROG_5V"), pin2: net("GND") }} />
    <resistor name="R_USB_DETECT_TOP" resistance="10k" footprint="0603" pcbX={-39} pcbY={-21}
      schX={7} schY={27} {...usb} connections={{ pin1: net("USB_PROG_5V"), pin2: net("USB_VBUS_DETECT") }} />
    <resistor name="R_USB_DETECT_BOTTOM" resistance="10k" footprint="0603" pcbX={-39} pcbY={-24}
      schX={12} schY={27} {...usb} connections={{ pin1: net("USB_VBUS_DETECT"), pin2: net("GND") }} />
    <Npn name="Q_USB_PRESENT" pcbX={-39} pcbY={-17} schX={20} schY={23} {...usb}
      connections={{ pin1: net("USB_PRESENT_BASE"), pin2: net("GND"), pin3: net("USB_DATA_DISABLE") }} />
    <resistor name="R_USB_PRESENT" resistance="47k" footprint="0603" pcbX={-42} pcbY={-12}
      schX={20} schY={28} {...usb} connections={{ pin1: net("USB_PROG_5V"), pin2: net("USB_PRESENT_BASE") }} />
    <resistor name="R_USB_PRESENT_OFF" resistance="47k" footprint="0603" pcbX={-38} pcbY={-12}
      schX={25} schY={28} {...usb} connections={{ pin1: net("USB_PRESENT_BASE"), pin2: net("GND") }} />
    <resistor name="R_USB_BLEED" resistance="100" footprint="1206" manufacturerPartNumber="CRCW1206100RFKEAHP"
      pcbX={-43} pcbY={-4} schX={30} schY={28} {...usb}
      connections={{ pin1: net("USB_PROG_5V"), pin2: net("GND") }} />
    <resistor name="R_USB_DATA_OFF" resistance="10k" footprint="0603" pcbX={-35} pcbY={-15}
      schX={25} schY={23} {...usb} connections={{ pin1: net("V3V3"), pin2: net("USB_DATA_DISABLE") }} />
    <Npn name="Q_USB_SERVICE" pcbX={-43} pcbY={-8} schX={20} schY={17} {...usb}
      connections={{ pin1: net("USB_PRESENT_BASE"), pin2: net("GND"), pin3: net("INPUT_FAULT_N") }} />
    <pinheader name="J_SERVICE" pinCount={2} footprint="pinrow2_p2.54" pcbX={-39} pcbY={-34}
      schX={30} schY={17} {...usb} connections={{ pin1: net("INPUT_FAULT_N"), pin2: net("GND") }} />
  </>
}
