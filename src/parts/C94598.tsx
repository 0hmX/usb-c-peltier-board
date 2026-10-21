// Exact EasyEDA/JLCPCB C94598 (Jiangsu Huaneng MLT-5020, 5 × 5 mm SMD magnetic transducer, 4 kHz).
// Externally driven: the coil needs a square wave through a low-side switch and flyback diode.
// Pin 1 = +, pin 2 = −, pin 3 = mechanical (no connection).
// Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C94598
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["POS"],
  pin2: ["NEG"],
  pin3: ["NC"],
} as const

export const MLT_5020 = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={{ pin1: { isPassive: true, requiresPower: true }, pin2: { isPassive: true }, pin3: { isPassive: true } }}
      supplierPartNumbers={{ jlcpcb: ["C94598"] }}
      manufacturerPartNumber="MLT-5020"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-2.3mm" pcbY="-1.75mm" width="1.7mm" height="0.7mm" shape="rect" />
        <smtpad portHints={["pin2"]} pcbX="2.3mm" pcbY="-1.75mm" width="1.7mm" height="0.7mm" shape="rect" />
        <smtpad portHints={["pin3"]} pcbX="-2.3mm" pcbY="1.75mm" width="1.7mm" height="0.7mm" shape="rect" />
        <silkscreenpath strokeWidth="0.12mm" route={[{ x: -2.5, y: -1.2 }, { x: -2.5, y: 1.2 }]} />
        <silkscreenpath strokeWidth="0.12mm" route={[{ x: 1.7, y: 2.5 }, { x: 2.5, y: 1.5 }, { x: 2.5, y: -1.2 }]} />
        <silkscreenpath strokeWidth="0.12mm" route={[{ x: -1.4, y: 2.5 }, { x: 1.7, y: 2.5 }]} />
        <silkscreenpath strokeWidth="0.12mm" route={[{ x: -1.4, y: -2.5 }, { x: 1.4, y: -2.5 }]} />
        <silkscreentext text="+" pcbX="-2.3mm" pcbY="-0.8mm" fontSize="0.6mm" />
        <courtyardoutline outline={[{ x: -3.3, y: 2.65 }, { x: 3.3, y: 2.65 }, { x: 3.3, y: -2.65 }, { x: -3.3, y: -2.65 }, { x: -3.3, y: 2.65 }]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C94598.obj?uuid=5e71db11d9fa48278b90d6344e196479",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C94598.step?uuid=5e71db11d9fa48278b90d6344e196479",
        pcbRotationOffset: 270,
      }}
      {...props}
    />
  )
}
