// Same UNI-ROYAL 0603WAF land family as C23251: reviewed copper edited in place; mask +0.05 mm, paste 1:1.
// Cosmetic outline omitted for 0.15 mm own-mask clearance; imported courtyard, ref and models retained.
// Exact EasyEDA/JLCPCB C23242; observed 2026-10-10T04:30:44.360111+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C23242
import type { ResistorProps } from "@tscircuit/props"

export const A_0603WAF7502T5E = (props: Omit<ResistorProps, "resistance">) => {
  const { name = "R1", ...restProps } = props

  return (
    <resistor
      name={name}
      resistance="75kohm"
      supplierPartNumbers={{
  "jlcpcb": [
    "C23242"
  ]
}}
      manufacturerPartNumber="0603WAF7502T5E"
      footprint={<footprint>
        <smtpad solderMaskMargin="0.05mm" solderPasteMargin={0} portHints={["pin2"]} pcbX="0.75mm" pcbY="0mm" width="0.65mm" height="0.8mm" shape="rect" />
<smtpad solderMaskMargin="0.05mm" solderPasteMargin={0} portHints={["pin1"]} pcbX="-0.75mm" pcbY="0mm" width="0.65mm" height="0.8mm" shape="rect" />
<courtyardoutline outline={[{"x":-1.4066016999998965,"y":0.6820032000000538},{"x":1.4066016999997828,"y":0.6820032000000538},{"x":1.4066016999997828,"y":-0.6820032000000538},{"x":-1.4066016999998965,"y":-0.6820032000000538},{"x":-1.4066016999998965,"y":0.6820032000000538}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C23242.obj?uuid=6bd5cd867e9542ebae21caaf5d2d4c4d",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C23242.step?uuid=6bd5cd867e9542ebae21caaf5d2d4c4d",
        pcbRotationOffset: 90,
        modelOriginPosition: { x: -0.004999999999999977, y: 0, z: -0.01 },
      }}
      {...restProps}
    />
  )
}