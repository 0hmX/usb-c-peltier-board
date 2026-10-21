// Exact EasyEDA/JLCPCB C965555 (Worldsemi WS2812B-2020, 2.0 × 2.0 mm addressable RGB LED).
// Pin 1 = DOUT, 2 = GND, 3 = DIN, 4 = VDD (3.7–5.3 V; DIN high threshold 0.7 × VDD).
// Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C965555
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["DOUT"],
  pin2: ["GND"],
  pin3: ["DIN"],
  pin4: ["VDD"],
} as const

export const WS2812B_2020 = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={{ pin1: { isOutput: true }, pin2: { requiresGround: true }, pin3: { isInput: true },
        pin4: { requiresPower: true } }}
      supplierPartNumbers={{ jlcpcb: ["C965555"] }}
      manufacturerPartNumber="WS2812B-2020"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-0.915mm" pcbY="0.55mm" width="0.9mm" height="0.7mm" shape="rect" />
        <smtpad portHints={["pin2"]} pcbX="-0.915mm" pcbY="-0.55mm" width="0.9mm" height="0.7mm" shape="rect" />
        <smtpad portHints={["pin3"]} pcbX="0.915mm" pcbY="-0.55mm" width="0.9mm" height="0.7mm" shape="rect" />
        <smtpad portHints={["pin4"]} pcbX="0.915mm" pcbY="0.55mm" width="0.9mm" height="0.7mm" shape="rect" />
        <silkscreenpath strokeWidth="0.12mm" route={[{ x: -1.2, y: 1.2 }, { x: 1.2, y: 1.2 }]} />
        <silkscreenpath strokeWidth="0.12mm" route={[{ x: -1.2, y: -1.2 }, { x: 1.2, y: -1.2 }]} />
        <silkscreencircle pcbX="-1.7mm" pcbY="0.9mm" radius="0.1mm" strokeWidth="0.12mm" />
        <courtyardoutline outline={[{ x: -1.6, y: 1.35 }, { x: 1.6, y: 1.35 }, { x: 1.6, y: -1.35 }, { x: -1.6, y: -1.35 }, { x: -1.6, y: 1.35 }]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C965555.obj?uuid=caa88715b11f4aa189b02e52bbb84e4f",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C965555.step?uuid=caa88715b11f4aa189b02e52bbb84e4f",
        pcbRotationOffset: 0,
      }}
      {...props}
    />
  )
}
