// Datasheet review: imported copper geometry corrected in place; explicit mask +0.05 mm and controlled paste.
// Exact EasyEDA/JLCPCB C8545; observed 2026-10-10T03:21:00.041283+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C8545
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["G"],
  pin2: ["S"],
  pin3: ["D"]
} as const

export const A_2N7002 = (props: ChipProps<typeof pinLabels>) => {
  return (
    <mosfet channelType="n" mosfetMode="enhancement"
      pinLabels={pinLabels}
      symbol={
        <symbol>
          <schematicpath points={[{"x":0,"y":0},{"x":0.12,"y":-0.04},{"x":0.12,"y":0.04},{"x":0,"y":0}]} strokeColor="#880000" isFilled fillColor="#FEFEFE" />
          <schematicpath points={[{"x":0.4,"y":0.04},{"x":0.34,"y":-0.06},{"x":0.46,"y":-0.06},{"x":0.4,"y":0.04}]} strokeColor="#880000" isFilled fillColor="#FEFEFE" />
          <schematicpath points={[{"x":0,"y":0.14},{"x":0.2,"y":0.14},{"x":0.2,"y":0.2},{"x":0.4,"y":0.2},{"x":0.4,"y":0.04}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0,"y":0},{"x":0.2,"y":0},{"x":0.2,"y":-0.2},{"x":0.4,"y":-0.2},{"x":0.4,"y":-0.06}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.2,"y":-0.14},{"x":0,"y":-0.14}]} strokeColor="#880000" />
          <schematicpath points={[{"x":-0.04,"y":0.18},{"x":-0.04,"y":-0.18}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0,"y":0.18},{"x":0,"y":0.1}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0,"y":-0.04},{"x":0,"y":0.04}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0,"y":-0.18},{"x":0,"y":-0.1}]} strokeColor="#880000" />
          <schematicpath points={[{"x":-0.2,"y":0},{"x":-0.04,"y":0}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.48,"y":0.04},{"x":0.44,"y":0.04},{"x":0.36,"y":0.04},{"x":0.32,"y":0.04}]} strokeColor="#880000" />
          <port name="pin3" pinNumber={3} aliases={["D"]} direction="up" schX={0.2} schY={0.4} schStemLength={0.2} />
          <port name="pin1" pinNumber={1} aliases={["G"]} direction="left" schX={-0.4} schY={0} schStemLength={0.2} />
          <port name="pin2" pinNumber={2} aliases={["S"]} direction="down" schX={0.2} schY={-0.4} schStemLength={0.2} />
          <schematictext schX={0.02} schY={0.64} text="{NAME}" fontSize={0.2} anchor="bottom_center" />
        </symbol>
      }
      supplierPartNumbers={{
  "jlcpcb": [
    "C8545"
  ]
}}
      manufacturerPartNumber="2N7002"
      footprint={<footprint>
        <smtpad solderMaskMargin="0.05mm" solderPasteMargin={0} portHints={["pin1"]} pcbX="1.01mm" pcbY="-0.95mm" width="0.8mm" height="0.6mm" shape="rect" />
<smtpad solderMaskMargin="0.05mm" solderPasteMargin={0} portHints={["pin2"]} pcbX="1.01mm" pcbY="0.95mm" width="0.8mm" height="0.6mm" shape="rect" />
<smtpad solderMaskMargin="0.05mm" solderPasteMargin={0} portHints={["pin3"]} pcbX="-1.01mm" pcbY="0mm" width="0.8mm" height="0.6mm" shape="rect" />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":0.726211400000011,"y":1.65},{"x":-0.726211400000011,"y":1.65},{"x":-0.726211400000011,"y":0.7}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":0.726211400000011,"y":-1.65},{"x":-0.726211400000011,"y":-1.65},{"x":-0.726211400000011,"y":-0.7}]} />
<silkscreencircle pcbX="0mm" pcbY="-0.95mm" radius="0.075mm" strokeWidth="0.15mm" />
<courtyardoutline outline={[{"x":-1.75,"y":1.75},{"x":1.75,"y":1.75},{"x":1.75,"y":-1.75},{"x":-1.75,"y":-1.75},{"x":-1.75,"y":1.75}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C8545.obj?uuid=d777607a152f4f3aac9bb0d0c14ed6fd",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C8545.step?uuid=d777607a152f4f3aac9bb0d0c14ed6fd",
        pcbRotationOffset: 180,
        modelOriginPosition: { x: 0.000012700000070253736, y: -0.000012699999956566899, z: 0.050795 },
      }}
      {...props}
    />
  )
}