import { TS3USB221ARSER } from "../../imports/TS3USB221ARSER"
import { USBLC6_2SC6 } from "../../imports/USBLC6_2SC6"

const usb = { schSheetName: "USB", schSectionName: "USB_NEW" }

export function UsbDataPath() {
  return <>
    <TS3USB221ARSER name="U_USB_SWITCH" symbol={undefined} pcbX={-35} pcbY={-20}
      schX={10} schY={19} {...usb} noConnect={["pin3", "pin4"]}
      connections={{ pin1: "net.USB_DP_SWITCH", pin2: "net.USB_DM_SWITCH",
        pin5: "net.GND", pin6: "net.USB_DATA_DISABLE", pin7: "net.USB_DM_PORT",
        pin8: "net.USB_DP_PORT", pin9: "net.GND", pin10: "net.V3V3" }} />
    <USBLC6_2SC6 name="U_USB_ESD" symbol={undefined} pcbX={-45} pcbY={-22}
      schX={10} schY={12} {...usb}
      connections={{ pin1: "net.USB_DP_PORT", pin6: "net.USB_DP_PORT",
        pin3: "net.USB_DM_PORT", pin4: "net.USB_DM_PORT", pin2: "net.GND", pin5: "net.USB_PROG_5V" }} />
    <capacitor name="C_USB_SWITCH" capacitance="100nF" footprint="0402" pcbX={-35} pcbY={-22.5}
      schX={17} schY={12} {...usb} connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
  </>
}
