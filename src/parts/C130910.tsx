// Datasheet review: imported copper geometry corrected in place; explicit mask +0.05 mm and controlled paste.
// Symbol correction: BAT54A common anode pin3; pin1/2 cathodes. Manufacturer: https://assets.nexperia.com/documents/data-sheet/BAT54A.pdf
// Exact EasyEDA/JLCPCB C130910; observed 2026-10-10T03:23:57.281177+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C130910
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["K1"],
  pin2: ["K2"],
  pin3: ["A"]
} as const

export const BAT54A_215 = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      supplierPartNumbers={{
  "jlcpcb": [
    "C130910"
  ]
}}
      manufacturerPartNumber="BAT54A,215"
      footprint={<footprint>
        <smtpad solderMaskMargin="0.05mm" solderPasteMargin={-0.05} portHints={["pin1"]} pcbX="0.85mm" pcbY="-0.95mm" width="0.7mm" height="0.6mm" shape="rect" />
<smtpad solderMaskMargin="0.05mm" solderPasteMargin={-0.05} portHints={["pin2"]} pcbX="0.85mm" pcbY="0.95mm" width="0.7mm" height="0.6mm" shape="rect" />
<smtpad solderMaskMargin="0.05mm" solderPasteMargin={-0.05} portHints={["pin3"]} pcbX="-0.85mm" pcbY="0mm" width="0.7mm" height="0.6mm" shape="rect" />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":0.8586978000000727,"y":1.65},{"x":-0.8586978000000727,"y":1.65},{"x":-0.8586978000000727,"y":0.7}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":0.8586978000000727,"y":-1.65},{"x":-0.8586978000000727,"y":-1.65},{"x":-0.8586978000000727,"y":-0.7}]} />
<silkscreencircle pcbX="0mm" pcbY="-0.95mm" radius="0.075mm" strokeWidth="0.15mm" />
<silkscreentext text="{NAME}" pcbX="0.0635mm" pcbY="2.524mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-1.87,"y":1.75},{"x":1.87,"y":1.75},{"x":1.87,"y":-1.75},{"x":-1.87,"y":-1.75},{"x":-1.87,"y":1.75}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C130910.obj?uuid=cefd4596db214da394d9632b2b88f8f2",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C130910.step?uuid=cefd4596db214da394d9632b2b88f8f2",
        pcbRotationOffset: 90,
        modelOriginPosition: { x: -0.000012700000070253736, y: 0, z: 0 },
      }}
      {...props}
    />
  )
}