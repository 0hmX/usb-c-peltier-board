// Cosmetic outline omitted to meet 0.15 mm mask clearance; imported copper, courtyard and ref retained.
// Datasheet review: imported copper geometry corrected in place; explicit mask +0.05 mm and controlled paste.
// Paste control: 1:1 stencil apertures for passive pads (default toolchain shrinks to 70% linear).
// Exact EasyEDA/JLCPCB C23138; observed 2026-10-10T03:23:02.874742+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C23138
import type { ResistorProps } from "@tscircuit/props"

export const A_0603WAF3300T5E = (props: Omit<ResistorProps, "resistance">) => {
  const { name = "R1", ...restProps } = props

  return (
    <resistor
      name={name}
      resistance="330ohm"
      supplierPartNumbers={{
  "jlcpcb": [
    "C23138"
  ]
}}
      manufacturerPartNumber="0603WAF3300T5E"
      footprint={<footprint>
        <smtpad solderMaskMargin="0.05mm" solderPasteMargin={0} portHints={["pin2"]} pcbX="0.75mm" pcbY="0mm" width="0.65mm" height="0.8mm" shape="rect" />
<smtpad solderMaskMargin="0.05mm" solderPasteMargin={0} portHints={["pin1"]} pcbX="-0.75mm" pcbY="0mm" width="0.65mm" height="0.8mm" shape="rect" />
<silkscreentext text="{NAME}" pcbX="-0.0127mm" pcbY="1.6604mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-1.4066016999998965,"y":0.6820032000000538},{"x":1.4066016999997828,"y":0.6820032000000538},{"x":1.4066016999997828,"y":-0.6820032000000538},{"x":-1.4066016999998965,"y":-0.6820032000000538},{"x":-1.4066016999998965,"y":0.6820032000000538}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C23138.obj?uuid=6bd5cd867e9542ebae21caaf5d2d4c4d",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C23138.step?uuid=6bd5cd867e9542ebae21caaf5d2d4c4d",
        pcbRotationOffset: 90,
        modelOriginPosition: { x: -0.004999999999999977, y: 0, z: -0.01 },
      }}
      {...restProps}
    />
  )
}