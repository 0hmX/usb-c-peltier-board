import { A_0603WAF1001T5E as Resistor0603 } from "../../imports/A_0603WAF1001T5E"
import { CC0603KRX7R9BB104 as Capacitor100nF } from "../parts/C14663"
import { MMBT3904_RANGE_100_300_ } from "../parts/C20526"
import { WS2812B_2020 } from "../parts/C965555"
import { MLT_5020 } from "../parts/C94598"
import { Diode1N4148WS } from "../parts/C2128"

// Addressable RGB status LED and magnetic buzzer on two spare RP2040 GPIOs.
// WS2812B DIN must exceed 0.7 × VDD, so the LED runs from LOGIC_5V through a
// 1N4148WS (~4.0–4.4 V): 3.3 V GPIO data then meets VIH, and VDD stays above
// the 3.7 V minimum. The MLT-5020 coil is driven at ~4 kHz through a low-side
// NPN with a flyback diode; RP2040 pads reset with pull-downs, so it is silent.
export function StatusIndicators() {
  return <>
    <group name="INDICATOR_NOTES" schSheetName="INDICATORS" schX={0} schY={0} schLayout={{ layoutMode: "none" }}>
      <schematictext text="RGB STATUS LED (WS2812B, one-wire data)" schX={-9.5} schY={6.5} fontSize={0.35} anchor="left" />
      <schematictext text="BUZZER (MLT-5020, drive ~4 kHz square wave)" schX={2.5} schY={6.5} fontSize={0.35} anchor="left" />
      <schematictext text="VDD = LOGIC_5V − diode ≈ 4.2 V so 3.3 V DIN is a valid high" schX={-9.5} schY={-4.5} fontSize={0.25} anchor="left" />
      <schematictext text="RP2040 reset pull-down keeps the buzzer off" schX={2.5} schY={-4.5} fontSize={0.25} anchor="left" />
    </group>
    <WS2812B_2020 name="LED_RGB" schX={-2} schY={1.5} schSheetName="INDICATORS"
      schPinArrangement={{ leftSide: [3], rightSide: [1], topSide: [4], bottomSide: [2] }}
      pcbX={-18.2} pcbY={-29.5} pcbRotation={0} noConnect={["pin1"]}
      connections={{ pin4: "net.RGB_VDD", pin2: "net.GND", pin3: "net.RGB_DIN" }} />
    <Resistor0603 name="R_RGB_DATA" resistance="33" schX={-5.5} schY={1.3} schRotation={0} schSheetName="INDICATORS"
      pcbX={-14.6} pcbY={-30.05} pcbRotation={0}
      manufacturerPartNumber="0603WAF330JT5E" supplierPartNumbers={{ jlcpcb: ["C23140"] }}
      connections={{ pin1: "net.RGB_DATA", pin2: "net.RGB_DIN" }} />
    <Diode1N4148WS name="D_RGB_SUPPLY" schX={-2} schY={4.5} schRotation={180} schSheetName="INDICATORS"
      pcbX={-23.2} pcbY={-30} pcbRotation={90}
      connections={{ pin2: "net.LOGIC_5V", pin1: "net.RGB_VDD" }} />
    <Capacitor100nF name="C_RGB" maxVoltageRating="50V" schX={1} schY={2.5} schRotation={270} schSheetName="INDICATORS"
      pcbX={-21} pcbY={-29.5} pcbRotation={90}
      connections={{ pin1: "net.RGB_VDD", pin2: "net.GND" }} />
    <MLT_5020 name="BZ_STATUS" schX={6} schY={3} schSheetName="INDICATORS"
      schPinArrangement={{ topSide: [1], bottomSide: [2], rightSide: [3] }}
      pcbX={-36.3} pcbY={-29.3} pcbRotation={0} noConnect={["pin3"]}
      connections={{ pin1: "net.CTRL_3V3", pin2: "net.BUZZER_COIL" }} />
    <Diode1N4148WS name="D_BUZZER" schX={9} schY={3} schRotation={90} schSheetName="INDICATORS"
      pcbX={-30.8} pcbY={-31} pcbRotation={180}
      connections={{ pin1: "net.CTRL_3V3", pin2: "net.BUZZER_COIL" }} />
    <MMBT3904_RANGE_100_300_ name="Q_BUZZER" schX={6.2} schY={-1} schRotation={0} schSheetName="INDICATORS"
      pcbX={-30.5} pcbY={-28} pcbRotation={0}
      connections={{ pin1: "net.BUZZER_BASE", pin2: "net.GND", pin3: "net.BUZZER_COIL" }} />
    <Resistor0603 name="R_BUZZER_BASE" resistance="1k" schX={3.5} schY={-1} schRotation={0} schSheetName="INDICATORS"
      pcbX={-26.6} pcbY={-28.95} pcbRotation={180}
      manufacturerPartNumber="0603WAF1001T5E" supplierPartNumbers={{ jlcpcb: ["C21190"] }}
      connections={{ pin1: "net.BUZZER_DRIVE", pin2: "net.BUZZER_BASE" }} />
    <silkscreentext text="RGB" pcbX={-18.2} pcbY={-27.5} fontSize={0.8} />
    <silkscreentext text="BUZZER" pcbX={-36.3} pcbY={-26.1} fontSize={0.7} />
  </>
}
