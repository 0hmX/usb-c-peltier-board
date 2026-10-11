// JLC silk audit: explicit graphic strokes >=0.15 mm; USB/cap outline ends trimmed for >=0.15 mm own-mask clearance. Copper/drills/courtyards preserved.
// Exact EasyEDA/JLCPCB C131337; observed 2026-10-10T03:23:04.760866+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C131337
// In-place fit adaptation: 0.90 mm nominal finished holes; JLC -0.08 mm yields 0.82 mm minimum.
// JST FAQ recommends 0.80-0.85 mm FINISHED plated holes for 2-pole PH on glass epoxy.
// Copper/pitch/pin1/body retained. Full +0.13/-0.08 mm fab range exceeds JST preferred range; prototype fit/solder qualification required.
// Sources: https://www.jst.com/resources/faq/ ; https://jlcpcb.com/capabilities/pcb-capabilities/
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["pin1"],
  pin2: ["pin2"]
} as const

export const B2B_PH_K_S_LF__SN_ = (props: ChipProps<typeof pinLabels>) => {
  return (
    <connector
      standard="jst_ph"
      pinCount={2}
      pinLabels={pinLabels}
      supplierPartNumbers={{
  "jlcpcb": [
    "C131337"
  ]
}}
      manufacturerPartNumber="B2B-PH-K-S(LF)(SN)"
      footprint={<footprint insertionDirection="from_above">
        <platedhole  portHints={["pin2"]} pcbX="-0.999998mm" pcbY="-0.550037mm" outerDiameter="1.5999968mm" holeDiameter="0.90mm" shape="circle" />
<platedhole  portHints={["pin1"]} pcbX="0.999998mm" pcbY="-0.550037mm" outerDiameter="1.5999968mm" holeDiameter="0.90mm" shape="circle" />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-2.921000000000049,"y":-0.2960369999999557},{"x":-2.413000000000011,"y":-0.2960369999999557},{"x":-2.413000000000011,"y":1.608963000000017},{"x":2.53999999999985,"y":1.608963000000017},{"x":2.53999999999985,"y":-0.2960369999999557},{"x":2.9209999999998217,"y":-0.2960369999999557}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":3.000044799999955,"y":-0.9310370000000603},{"x":2.4920448000000306,"y":-0.9310370000000603},{"x":2.4920448000000306,"y":-1.6930370000001176},{"x":0.3330447999999251,"y":-1.6930370000001176},{"x":0.3330447999999251,"y":-2.201037000000042}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-2.921000000000049,"y":-0.9310370000000603},{"x":-2.413000000000011,"y":-0.9310370000000603},{"x":-2.413000000000011,"y":-1.6930370000001176},{"x":-0.2540000000001328,"y":-1.6930370000001176},{"x":-0.2540000000001328,"y":-2.201037000000042}]} />
<silkscreenrect pcbX="0mm" pcbY="0mm" width="5.999988mm" height="4.500118mm" strokeWidth="0.254mm" />
<fabricationnotepath route={[{"x":2.9209999999998217,"y":-0.2960369999999557},{"x":2.53999999999985,"y":-0.2960369999999557},{"x":2.53999999999985,"y":1.608963000000017},{"x":-2.4130000000001246,"y":1.608963000000017},{"x":-2.4130000000001246,"y":-0.2960369999999557},{"x":-2.921000000000163,"y":-0.2960369999999557},{"x":-2.921000000000163,"y":2.243963000000008},{"x":2.9209999999998217,"y":2.243963000000008},{"x":2.9209999999998217,"y":-0.2960369999999557}]} strokeWidth="0mm" isFilled hasStroke={false} />
<fabricationnotepath route={[{"x":3.000044800000069,"y":-0.9310369999999466},{"x":2.4920448000000306,"y":-0.9310369999999466},{"x":2.4920448000000306,"y":-1.693037000000004},{"x":0.3330448000000388,"y":-1.693037000000004},{"x":0.3330448000000388,"y":-2.201037000000042},{"x":3.0479999999997744,"y":-2.201037000000042},{"x":3.000044800000069,"y":-0.9310369999999466}]} strokeWidth="0mm" isFilled hasStroke={false} />
<fabricationnotepath route={[{"x":-0.2540000000001328,"y":-1.693037000000004},{"x":-0.2540000000001328,"y":-2.201037000000042},{"x":-2.921000000000163,"y":-2.201037000000042},{"x":-2.921000000000163,"y":-0.9310369999999466},{"x":-2.4130000000001246,"y":-0.9310369999999466},{"x":-2.4130000000001246,"y":-1.693037000000004},{"x":-0.2540000000001328,"y":-1.693037000000004}]} strokeWidth="0mm" isFilled hasStroke={false} />
<courtyardoutline outline={[{"x":-3.249994000000015,"y":2.599957199999949},{"x":3.249994000000015,"y":2.599957199999949},{"x":3.249994000000015,"y":-2.500033599999938},{"x":-3.249994000000015,"y":-2.500033599999938},{"x":-3.249994000000015,"y":2.599957199999949}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C131337.obj?uuid=ee6b32b5c03144688a5663b32f9648c4",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C131337.step?uuid=ee6b32b5c03144688a5663b32f9648c4",
        pcbRotationOffset: 180,
        modelOriginPosition: { x: -0.9995, y: -0.5500381999999945, z: -0.000006999999999646178 },
      }}
      {...props}
    />
  )
}
