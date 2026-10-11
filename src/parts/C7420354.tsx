// Datasheet review: imported copper geometry corrected in place; explicit mask +0.05 mm and controlled paste.
// Exact EasyEDA/JLCPCB C7420354; observed 2026-10-10T03:24:23.140178+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C7420354
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["B"],
  pin2: ["E"],
  pin3: ["C"]
} as const

export const MMBT3906 = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      symbol={
        <symbol>
          <schematicpath points={[{"x":0,"y":-0.06},{"x":0.06,"y":-0.16},{"x":0.12,"y":-0.08},{"x":0,"y":-0.06}]} strokeColor="#880000" isFilled fillColor="#880000" />
          <schematicpath points={[{"x":0,"y":0.18},{"x":0,"y":-0.18}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0,"y":-0.06},{"x":0.2,"y":-0.2}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.2,"y":0.2},{"x":0,"y":0.06}]} strokeColor="#880000" />
          <port name="pin2" pinNumber={2} aliases={["E"]} direction="down" schX={0.2} schY={-0.4} schStemLength={0.2} />
          <port name="pin3" pinNumber={3} aliases={["C"]} direction="up" schX={0.2} schY={0.4} schStemLength={0.2} />
          <port name="pin1" pinNumber={1} aliases={["B"]} direction="left" schX={-0.2} schY={0} schStemLength={0.2} />
          <schematictext schX={-0.001} schY={0.622} text="{NAME}" fontSize={0.2} anchor="bottom_center" />
        </symbol>
      }
      supplierPartNumbers={{
  "jlcpcb": [
    "C7420354"
  ]
}}
      manufacturerPartNumber="MMBT3906"
      footprint={<footprint>
        <smtpad solderMaskMargin="0.05mm" solderPasteMargin={0} portHints={["pin1"]} pcbX="1mm" pcbY="-0.95mm" width="0.9mm" height="0.8mm" shape="rect" />
<smtpad solderMaskMargin="0.05mm" solderPasteMargin={0} portHints={["pin2"]} pcbX="1mm" pcbY="0.95mm" width="0.9mm" height="0.8mm" shape="rect" />
<smtpad solderMaskMargin="0.05mm" solderPasteMargin={0} portHints={["pin3"]} pcbX="-1mm" pcbY="0mm" width="0.9mm" height="0.8mm" shape="rect" />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":0.726211400000011,"y":1.65},{"x":-0.726211400000011,"y":1.65},{"x":-0.726211400000011,"y":0.7}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":0.726211400000011,"y":-1.65},{"x":-0.726211400000011,"y":-1.65},{"x":-0.726211400000011,"y":-0.7}]} />
<silkscreencircle pcbX="0mm" pcbY="-0.95mm" radius="0.075mm" strokeWidth="0.15mm" />
<courtyardoutline outline={[{"x":-1.75,"y":1.75},{"x":1.75,"y":1.75},{"x":1.75,"y":-1.75},{"x":-1.75,"y":-1.75},{"x":-1.75,"y":1.75}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C7420354.obj?uuid=d777607a152f4f3aac9bb0d0c14ed6fd",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C7420354.step?uuid=d777607a152f4f3aac9bb0d0c14ed6fd",
        pcbRotationOffset: 180,
        modelOriginPosition: { x: 0.000012700000070253736, y: -0.000012699999956566899, z: 0.050795 },
      }}
      {...props}
    />
  )
}