// Exact EasyEDA/JLCPCB C2984759; observed 2026-10-10T03:24:24.475434+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C2984759
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
          <port name="pin3" pinNumber={3} aliases={["C"]} direction="up" schX={0.2} schY={0.4} schStemLength={0.2} />
          <port name="pin2" pinNumber={2} aliases={["E"]} direction="down" schX={0.2} schY={-0.4} schStemLength={0.2} />
          <port name="pin1" pinNumber={1} aliases={["B"]} direction="left" schX={-0.2} schY={0} schStemLength={0.2} />
          <schematicpath points={[{"x":0.06,"y":-0.1},{"x":0.2,"y":-0.2}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.2,"y":0.2},{"x":0,"y":0.06}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0,"y":0.18},{"x":0,"y":-0.18}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0,"y":-0.06},{"x":0.12,"y":-0.08},{"x":0.06,"y":-0.16},{"x":0,"y":-0.06}]} strokeColor="#880000" isFilled fillColor="#880000" />
          <schematictext schX={0} schY={0.63} text="{NAME}" fontSize={0.2} anchor="bottom_center" />
        </symbol>
      }
      supplierPartNumbers={{
  "jlcpcb": [
    "C2984759"
  ]
}}
      manufacturerPartNumber="MMBT3906"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="0.999998mm" pcbY="-0.94996mm" width="0.999998mm" height="0.6500114mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="0.999998mm" pcbY="0.94996mm" width="0.999998mm" height="0.6500114mm" shape="rect" />
<smtpad portHints={["pin3"]} pcbX="-0.999998mm" pcbY="0mm" width="0.999998mm" height="0.6500114mm" shape="rect" />
<silkscreenpath route={[{"x":0.726211400000011,"y":1.5262098000000606},{"x":-0.726211400000011,"y":1.5262098000000606},{"x":-0.726211400000011,"y":0.49458879999997407}]} />
<silkscreenpath route={[{"x":0.726211400000011,"y":-1.5262097999999469},{"x":-0.726211400000011,"y":-1.5262097999999469},{"x":-0.726211400000011,"y":-0.49458879999997407}]} />
<silkscreenpath route={[{"x":0.726211400000011,"y":0.45539659999997184},{"x":0.726211400000011,"y":-0.45539659999985815}]} />
<courtyardoutline outline={[{"x":-1.7499969999998939,"y":1.6999844000000621},{"x":1.7499969999998939,"y":1.6999844000000621},{"x":1.7499969999998939,"y":-1.7000097999999753},{"x":-1.7499969999998939,"y":-1.7000097999999753},{"x":-1.7499969999998939,"y":1.6999844000000621}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C2984759.obj?uuid=d777607a152f4f3aac9bb0d0c14ed6fd",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C2984759.step?uuid=d777607a152f4f3aac9bb0d0c14ed6fd",
        pcbRotationOffset: 180,
        modelOriginPosition: { x: 0.000012700000070253736, y: -0.000012699999956566899, z: 0.050795 },
      }}
      {...props}
    />
  )
}