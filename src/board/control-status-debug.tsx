import { KT_0603Y } from "../../imports/KT_0603Y"
import { KT_0603YG } from "../../imports/KT_0603YG"
import { KT_0603R } from "../../imports/KT_0603R"
import { A_0603WAF1001T5E as Resistor0603 } from "../../imports/A_0603WAF1001T5E"

export function StatusAndDebug() {
  return <>
    <group name="STATUS" schSheetName="CONTROL">
      <Resistor0603 name="R_LED_POWER" resistance="1k" pcbX={26} pcbY={-12} schX={-6} schY={1.3} schSheetName="CONTROL"
        manufacturerPartNumber="0603WAF1001T5E" supplierPartNumbers={{ jlcpcb: ["C21190"] }}
        connections={{ pin1: "net.CTRL_3V3", pin2: "net.LED_POWER_ANODE" }} />
      <KT_0603Y name="LED_POWER" pcbX={26} pcbY={-9} schX={-6} schY={-1.3} schSheetName="CONTROL"
        connections={{ pin1: "net.LED_POWER_ANODE", pin2: "net.GND" }} />
      <Resistor0603 name="R_LED_RUN" resistance="1k" pcbX={31} pcbY={-12} schX={0} schY={1.3} schSheetName="CONTROL"
        manufacturerPartNumber="0603WAF1001T5E" supplierPartNumbers={{ jlcpcb: ["C21190"] }}
        connections={{ pin1: "net.LED_RUN_DRIVE", pin2: "net.LED_RUN_ANODE" }} />
      <KT_0603YG name="LED_RUN" pcbX={31} pcbY={-9} schX={0} schY={-1.3} schSheetName="CONTROL"
        connections={{ pin2: "net.LED_RUN_ANODE", pin1: "net.GND" }} />
      <Resistor0603 name="R_LED_FAULT" resistance="1k" pcbX={36} pcbY={-12} schX={6} schY={1.3} schSheetName="CONTROL"
        manufacturerPartNumber="0603WAF1001T5E" supplierPartNumbers={{ jlcpcb: ["C21190"] }}
        connections={{ pin1: "net.LED_FAULT_DRIVE", pin2: "net.LED_FAULT_ANODE" }} />
      <KT_0603R name="LED_FAULT" pcbX={36} pcbY={-9} schX={6} schY={-1.3} schSheetName="CONTROL"
        connections={{ pin1: "net.LED_FAULT_ANODE", pin2: "net.GND" }} />
    </group>
    <silkscreentext text="3V3" pcbX={26} pcbY={-7} fontSize={0.8} />
    <silkscreentext text="RUN" pcbX={31} pcbY={-7} fontSize={0.8} />
    <silkscreentext text="FAULT" pcbX={36} pcbY={-7} fontSize={0.8} />
    <testpoint name="TP_SWDIO" footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={-21} pcbY={-28} schSheetName="CONTROL"
      connections={{ pin1: "net.SWDIO" }} />
    <silkscreentext text="SWDIO" pcbX={-21} pcbY={-29.25} fontSize={0.55} />
    <testpoint name="TP_SWCLK" footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={-18} pcbY={-28} schSheetName="CONTROL"
      connections={{ pin1: "net.SWCLK" }} />
    <silkscreentext text="SWCLK" pcbX={-18} pcbY={-29.25} fontSize={0.55} />
    <testpoint name="TP_BOOTSEL" footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={-15} pcbY={-28} schSheetName="CONTROL"
      connections={{ pin1: "net.BOOTSEL_PAD" }} />
    <silkscreentext text="BOOTSEL" pcbX={-15} pcbY={-29.25} fontSize={0.55} />
    <testpoint name="TP_RUN" footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={-12} pcbY={-28} schSheetName="CONTROL"
      connections={{ pin1: "net.MCU_RUN" }} />
    <silkscreentext text="RESET" pcbX={-12} pcbY={-29.25} fontSize={0.55} />
    <testpoint name="TP_3V3" footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={-9} pcbY={-28} schSheetName="CONTROL"
      connections={{ pin1: "net.CTRL_3V3" }} />
    <silkscreentext text="3V3" pcbX={-9} pcbY={-29.25} fontSize={0.55} />
    <testpoint name="TP_GND" footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={-6} pcbY={-28} schSheetName="CONTROL"
      connections={{ pin1: "net.GND" }} />
    <silkscreentext text="GND" pcbX={-6} pcbY={-29.25} fontSize={0.55} />
    <testpoint name="TP_RAW_PD" footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={-3} pcbY={-28} schSheetName="CONTROL"
      connections={{ pin1: "net.VBUS_RAW" }} />
    <silkscreentext text="RAW PD" pcbX={-3} pcbY={-29.25} fontSize={0.55} />
    <testpoint name="TP_QUAL_PD" footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={0} pcbY={-28} schSheetName="CONTROL"
      connections={{ pin1: "net.VBUS_QUALIFIED" }} />
    <silkscreentext text="QUAL PD" pcbX={0} pcbY={-29.25} fontSize={0.55} />
    <testpoint name="TP_5V" footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={3} pcbY={-28} schSheetName="CONTROL"
      connections={{ pin1: "net.LOGIC_5V" }} />
    <silkscreentext text="5V" pcbX={3} pcbY={-29.25} fontSize={0.55} />
    <testpoint name="TP_TEC" footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={6} pcbY={-28} schSheetName="CONTROL"
      connections={{ pin1: "net.TEC_POS" }} />
    <silkscreentext text="TEC +" pcbX={6} pcbY={-29.25} fontSize={0.55} />
    <testpoint name="TP_OUT" footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={9} pcbY={-28} schSheetName="CONTROL"
      connections={{ pin1: "net.DRIVER_OUT" }} />
    <silkscreentext text="OUT" pcbX={9} pcbY={-29.25} fontSize={0.55} />
    <testpoint name="TP_EN" footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={12} pcbY={-28} schSheetName="CONTROL"
      connections={{ pin1: "net.DRIVER_ENABLE" }} />
    <silkscreentext text="EN" pcbX={12} pcbY={-29.25} fontSize={0.55} />
    <testpoint name="TP_ISP" footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={15} pcbY={-28} schSheetName="CONTROL"
      connections={{ pin1: "net.DRIVER_ISP" }} />
    <silkscreentext text="ISP" pcbX={15} pcbY={-29.25} fontSize={0.55} />
    <testpoint name="TP_ISN" footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={18} pcbY={-28} schSheetName="CONTROL"
      connections={{ pin1: "net.DRIVER_ISN" }} />
    <silkscreentext text="ISN" pcbX={18} pcbY={-29.25} fontSize={0.55} />
    <testpoint name="TP_SCL" footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={21} pcbY={-28} schSheetName="CONTROL"
      connections={{ pin1: "net.I2C_SCL" }} />
    <silkscreentext text="SCL" pcbX={21} pcbY={-29.25} fontSize={0.55} />
    <testpoint name="TP_SDA" footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={24} pcbY={-28} schSheetName="CONTROL"
      connections={{ pin1: "net.I2C_SDA" }} />
    <silkscreentext text="SDA" pcbX={24} pcbY={-29.25} fontSize={0.55} />
  </>
}
