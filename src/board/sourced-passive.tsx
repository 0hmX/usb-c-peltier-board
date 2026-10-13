import type { CapacitorProps, ResistorProps } from "@tscircuit/props"
import { A_0603WAF1001T5E } from "../../imports/A_0603WAF1001T5E"
import { CC0603KRX7R8BB105 } from "../../imports/CC0603KRX7R8BB105"
import { CL21A106KAYNNNE } from "../../imports/CL21A106KAYNNNE"
import { CL10A475KP8NNNC } from "../../imports/CL10A475KP8NNNC"
import { CC0603KRX7R9BB472 } from "../../imports/CC0603KRX7R9BB472"
import { CC0603JRNPO0BN101 } from "../../imports/CC0603JRNPO0BN101"
import { CC0603KRX7R9BB224 } from "../../imports/CC0603KRX7R9BB224"
import { CC0603KRX7R9BB104 } from "../parts/C14663"

// All resistor values use the same UNI-ROYAL 0603 family land pattern and
// supplier body model; the exact purchasing identifier follows the value.
export const sourcedResistors = {
  "10": ["C22859", "0603WAF100JT5E"],
  "1k": ["C21190", "0603WAF1001T5E"],
  "2.2k": ["C4190", "0603WAF2201T5E"],
  "4.7k": ["C23162", "0603WAF4701T5E"],
  "5.1k": ["C23186", "0603WAF5101T5E"],
  "10k": ["C25804", "0603WAF1002T5E"],
  "15k": ["C22809", "0603WAF1502T5E"],
  "20k": ["C4184", "0603WAF2002T5E"],
  "22k": ["C31850", "0603WAF2202T5E"],
  "27.4k": ["C22964", "0603WAF2742T5E"],
  "47k": ["C25819", "0603WAF4702T5E"],
  "49.9k": ["C23184", "0603WAF4992T5E"],
  "100k": ["C25803", "0603WAF1003T5E"],
  "130k": ["C22795", "0603WAF1303T5E"],
  "150k": ["C22807", "0603WAF1503T5E"],
} as const

export function SourcedResistor(props: Omit<ResistorProps, "resistance"> & {
  resistance: keyof typeof sourcedResistors
}) {
  const [partNumber, manufacturerPartNumber] = sourcedResistors[props.resistance]
  return <A_0603WAF1001T5E {...props} manufacturerPartNumber={manufacturerPartNumber}
    supplierPartNumbers={{ jlcpcb: [partNumber] }} />
}

export const sourcedCapacitors = {
  "100pF": { component: CC0603JRNPO0BN101, voltage: "100V", part: "C107033" },
  "4.7nF": { component: CC0603KRX7R9BB472, voltage: "50V", part: "C106218" },
  "100nF": { component: CC0603KRX7R9BB104, voltage: "50V", part: "C14663" },
  "220nF": { component: CC0603KRX7R9BB224, voltage: "50V", part: "C107083" },
  "1uF": { component: CC0603KRX7R8BB105, voltage: "25V", part: "C106858" },
  "4.7uF": { component: CL10A475KP8NNNC, voltage: "10V", part: "C1705" },
  "10uF": { component: CL21A106KAYNNNE, voltage: "25V", part: "C15850" },
} as const

export function SourcedCapacitor({ capacitance, ...props }: Omit<CapacitorProps, "capacitance"> & {
  capacitance: keyof typeof sourcedCapacitors
}) {
  const { component: Component, voltage } = sourcedCapacitors[capacitance]
  return <Component {...props} maxVoltageRating={voltage} />
}
