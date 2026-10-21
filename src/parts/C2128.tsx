// Exact EasyEDA/JLCPCB C2128 (CJ 1N4148WS, SOD-323 switching diode, JLC basic part).
// Pin 1 = cathode (band), pin 2 = anode.
// Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C2128
import type { DiodeProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["cathode", "neg"],
  pin2: ["anode", "pos"],
} as const

export const Diode1N4148WS = (props: DiodeProps) => {
  return (
    <diode
      pinLabels={pinLabels}
      supplierPartNumbers={{ jlcpcb: ["C2128"] }}
      manufacturerPartNumber="1N4148WS"
      footprint={<footprint>
        <smtpad portHints={["pin1", "cathode", "neg"]} pcbX="-1.172mm" pcbY="0mm" width="1mm" height="0.7mm" shape="rect" />
        <smtpad portHints={["pin2", "anode", "pos"]} pcbX="1.172mm" pcbY="0mm" width="1mm" height="0.7mm" shape="rect" />
        <silkscreenpath strokeWidth="0.12mm" route={[{ x: -0.5, y: 0.65 }, { x: -0.5, y: -0.65 }]} />
        <silkscreenpath strokeWidth="0.12mm" route={[{ x: -0.85, y: 0.65 }, { x: 0.85, y: 0.65 }]} />
        <silkscreenpath strokeWidth="0.12mm" route={[{ x: -0.85, y: -0.65 }, { x: 0.85, y: -0.65 }]} />
        <courtyardoutline outline={[{ x: -1.9, y: 0.8 }, { x: 1.9, y: 0.8 }, { x: 1.9, y: -0.8 }, { x: -1.9, y: -0.8 }, { x: -1.9, y: 0.8 }]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C2128.obj?uuid=7459fe65e23146c0a8d836e46a0add72",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C2128.step?uuid=7459fe65e23146c0a8d836e46a0add72",
        pcbRotationOffset: 0,
      }}
      {...props}
    />
  )
}
