import { KT_0603Y } from "../../imports/KT_0603Y"
import { KT_0603YG } from "../../imports/KT_0603YG"
import { KT_0603R } from "../../imports/KT_0603R"
import { A_0603WAF1001T5E as Resistor0603 } from "../../imports/A_0603WAF1001T5E"

export function StatusAndDebug() {
  return <>
    <group name="DEBUG_NOTES" schSheetName="DEBUG" schX={0} schY={0} schLayout={{ layoutMode: "none" }}>
      <schematictext text="LOGIC POWER" schX={-7.5} schY={6.5} fontSize={0.4} />
      <schematictext text="TEC RUN / GP6" schX={0} schY={6.5} fontSize={0.4} />
      <schematictext text="FAULT / GP7" schX={7.5} schY={6.5} fontSize={0.4} />
      <schematictext text="Yellow: 3V3 present" schX={-7.5} schY={1.55} fontSize={0.25} />
      <schematictext text="Green: output running" schX={0} schY={1.55} fontSize={0.25} />
      <schematictext text="Red: latched protection" schX={7.5} schY={1.55} fontSize={0.25} />
      <schematictext text="PROGRAMMING / RECOVERY" schX={-9.75} schY={1} fontSize={0.35} anchor="left" />
      <schematictext text="POWER RAILS / REFERENCE" schX={-9.75} schY={-2} fontSize={0.35} anchor="left" />
      <schematictext text="CONVERTER / LOAD / CURRENT SHUNT" schX={-9.75} schY={-5} fontSize={0.35} anchor="left" />
      <schematictext text="I2C CONTROL BUS" schX={-9.75} schY={-8} fontSize={0.35} anchor="left" />
      <schematictext text="BOOTSEL: short to GND during MCU_RUN reset, then release when RPI-RP2 appears." schX={-9.75} schY={-10.5} fontSize={0.25} anchor="left" />
      <schematictext text="All testpoints are fitted 1.5 mm copper pads; doNotPlace excludes them from the purchased BOM." schX={-9.75} schY={-11.1} fontSize={0.25} anchor="left" />
    </group>
    <Resistor0603 name="R_LED_POWER" schX={-7.5} schY={4.5} schRotation={270} resistance="1k" pcbX={23} pcbY={-19} schSheetName="DEBUG"
      manufacturerPartNumber="0603WAF1001T5E" supplierPartNumbers={{ jlcpcb: ["C21190"] }}
      connections={{ pin1: "net.CTRL_3V3", pin2: "net.LED_POWER_ANODE" }} />
    <KT_0603Y name="LED_POWER" schX={-7.5} schY={3} schRotation={270} pcbX={23} pcbY={-16} schSheetName="DEBUG"
      connections={{ pin1: "net.LED_POWER_ANODE", pin2: "net.GND" }} />
    <Resistor0603 name="R_LED_RUN" schX={0} schY={4.5} schRotation={270} resistance="1k" pcbX={26.5} pcbY={-19} schSheetName="DEBUG"
      manufacturerPartNumber="0603WAF1001T5E" supplierPartNumbers={{ jlcpcb: ["C21190"] }}
      connections={{ pin1: "net.LED_RUN_DRIVE", pin2: "net.LED_RUN_ANODE" }} />
    <KT_0603YG name="LED_RUN" schX={0} schY={3} schRotation={270} pcbX={26.5} pcbY={-16} schSheetName="DEBUG"
      connections={{ pin2: "net.LED_RUN_ANODE", pin1: "net.GND" }} />
    <Resistor0603 name="R_LED_FAULT" schX={7.5} schY={4.5} schRotation={270} resistance="1k" pcbX={30} pcbY={-19} schSheetName="DEBUG"
      manufacturerPartNumber="0603WAF1001T5E" supplierPartNumbers={{ jlcpcb: ["C21190"] }}
      connections={{ pin1: "net.LED_FAULT_DRIVE", pin2: "net.LED_FAULT_ANODE" }} />
    <KT_0603R name="LED_FAULT" schX={7.5} schY={3} schRotation={270} pcbX={30} pcbY={-16} schSheetName="DEBUG"
      connections={{ pin1: "net.LED_FAULT_ANODE", pin2: "net.GND" }} />
    <silkscreentext text="3V3" pcbX={23} pcbY={-14} fontSize={0.8} />
    <silkscreentext text="RUN" pcbX={26.5} pcbY={-14} fontSize={0.8} />
    <silkscreentext text="FAULT" pcbX={30} pcbY={-14} fontSize={0.8} />
    <testpoint name="TP_SWDIO" schX={-8.25} schY={0} schRotation={0} footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={4.5} pcbY={-28.5} schSheetName="DEBUG"
      connections={{ pin1: "net.SWDIO" }} />
    <silkscreentext text="SWDIO" pcbX={4.5} pcbY={-29.65} fontSize={0.55} />
    <testpoint name="TP_SWCLK" schX={-3.75} schY={0} schRotation={0} footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={1.5} pcbY={-28.5} schSheetName="DEBUG"
      connections={{ pin1: "net.SWCLK" }} />
    <silkscreentext text="SWCLK" pcbX={1.5} pcbY={-29.65} fontSize={0.55} />
    <testpoint name="TP_BOOTSEL" schX={0.75} schY={0} schRotation={0} footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={-9.5} pcbY={-5.5} schSheetName="DEBUG"
      connections={{ pin1: "net.BOOTSEL_PAD" }} />
    <silkscreentext text="BOOTSEL" pcbX={-9.5} pcbY={-6.75} fontSize={0.55} />
    <testpoint name="TP_RUN" schX={5.25} schY={0} schRotation={0} footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={7.5} pcbY={-28.5} schSheetName="DEBUG"
      connections={{ pin1: "net.MCU_RUN" }} />
    <silkscreentext text="RESET" pcbX={7.5} pcbY={-29.65} fontSize={0.55} />
    <testpoint name="TP_3V3" schX={-8.25} schY={-3} schRotation={0} footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={-8.9} pcbY={-18.149976} schSheetName="DEBUG"
      connections={{ pin1: "net.CTRL_3V3" }} />
    <silkscreentext text="3V3" pcbX={-8.9} pcbY={-19.399976} fontSize={0.55} />
    <testpoint name="TP_GND" schX={-3.75} schY={-3} schRotation={0} footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={10.5} pcbY={-28.5} schSheetName="DEBUG"
      connections={{ pin1: "net.GND" }} />
    <silkscreentext text="GND" pcbX={10.5} pcbY={-29.65} fontSize={0.55} />
    <testpoint name="TP_RAW_PD" schX={0.75} schY={-3} schRotation={0} footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={-29.5} pcbY={9} schSheetName="DEBUG"
      connections={{ pin1: "net.VBUS_RAW" }} />
    <silkscreentext text="RAW PD" pcbX={-29.5} pcbY={7.75} fontSize={0.55} />
    <testpoint name="TP_QUAL_PD" schX={5.25} schY={-3} schRotation={0} footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={-13.3} pcbY={13.5} schSheetName="DEBUG"
      connections={{ pin1: "net.VBUS_QUALIFIED" }} />
    <silkscreentext text="QUAL PD" pcbX={-13.3} pcbY={12.25} fontSize={0.55} />
    <testpoint name="TP_5V" schX={9.75} schY={-3} schRotation={0} footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={-22} pcbY={-18.699976} schSheetName="DEBUG"
      connections={{ pin1: "net.LOGIC_5V" }} />
    <silkscreentext text="5V" pcbX={-22} pcbY={-19.949976} fontSize={0.55} />
    <testpoint name="TP_TEC" schX={-8.25} schY={-6} schRotation={0} footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={18.5} pcbY={-0.5} schSheetName="DEBUG"
      connections={{ pin1: "net.TEC_POS" }} />
    <silkscreentext text="TEC +" pcbX={18.5} pcbY={-1.75} fontSize={0.55} />
    <testpoint name="TP_OUT" schX={-3.75} schY={-6} schRotation={0} footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={20.1} pcbY={10} schSheetName="DEBUG"
      connections={{ pin1: "net.DRIVER_OUT" }} />
    <silkscreentext text="OUT" pcbX={20.1} pcbY={8.75} fontSize={0.55} />
    <testpoint name="TP_EN" schX={0.75} schY={-6} schRotation={0} footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={8.8} pcbY={-8} schSheetName="DEBUG"
      connections={{ pin1: "net.DRIVER_ENABLE" }} />
    <silkscreentext text="EN" pcbX={8.8} pcbY={-9.25} fontSize={0.55} />
    <testpoint name="TP_ISP" schX={5.25} schY={-6} schRotation={0} layer="top" footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={12} pcbY={-0.5} schSheetName="DEBUG"
      connections={{ pin1: "net.DRIVER_ISP" }} />
    <silkscreentext text="ISP" layer="top" pcbX={12} pcbY={0.8} fontSize={0.55} />
    <testpoint name="TP_ISN" schX={9.75} schY={-6} schRotation={0} layer="top" footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={6.5} pcbY={2.5} schSheetName="DEBUG"
      connections={{ pin1: "net.DRIVER_ISN" }} />
    <silkscreentext text="ISN" layer="top" pcbX={6.5} pcbY={1.2} fontSize={0.55} />
    <testpoint name="TP_SCL" schX={-8.25} schY={-9} schRotation={0} footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={-11} pcbY={-7.8} schSheetName="DEBUG"
      connections={{ pin1: "net.I2C_SCL" }} />
    <silkscreentext text="SCL" pcbX={-11} pcbY={-9.05} fontSize={0.55} />
    <testpoint name="TP_SDA" schX={-3.75} schY={-9} schRotation={0} footprintVariant="pad" padDiameter={1.5} doNotPlace
      pcbStyle={{ silkscreenTextVisibility: "hidden" }} pcbX={-11} pcbY={-10.7} schSheetName="DEBUG"
      connections={{ pin1: "net.I2C_SDA" }} />
    <silkscreentext text="SDA" pcbX={-11} pcbY={-11.95} fontSize={0.55} />
  </>
}
