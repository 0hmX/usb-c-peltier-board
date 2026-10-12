import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["IN"],
  pin2: ["GND"],
  pin3: ["OUT"]
} as const

const pinAttributes = {
  pin2: {requiresGround: true}
} as const

export const DTC114EETL = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      symbol={
        <symbol>
          <schematictext text={props.name ?? "Q"} schX={-0.65} schY={0.9} fontSize={0.18} />
          <port name="pin3" pinNumber={3} aliases={["OUT"]} direction="up" schX={0.2} schY={0.8} schStemLength={0.4} />
          <port name="pin2" pinNumber={2} aliases={["GND"]} direction="down" schX={0.2} schY={-0.8} schStemLength={0.4} />
          <port name="pin1" pinNumber={1} aliases={["IN"]} direction="left" schX={-1} schY={0} schStemLength={0.4} />
          <schematicpath points={[{"x":-0.6,"y":0},{"x":-0.52,"y":0},{"x":-0.5,"y":0.06},{"x":-0.46,"y":-0.06},{"x":-0.42,"y":0.06},{"x":-0.38,"y":-0.06},{"x":-0.34,"y":0.06},{"x":-0.3,"y":-0.06},{"x":-0.28,"y":0},{"x":-0.2,"y":0},{"x":0,"y":0}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0,"y":0.18},{"x":0,"y":-0.18}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0,"y":-0.06},{"x":0.2,"y":-0.2},{"x":0.2,"y":-0.4},{"x":-0.2,"y":-0.4},{"x":-0.2,"y":-0.32},{"x":-0.26,"y":-0.3},{"x":-0.14,"y":-0.26},{"x":-0.26,"y":-0.22},{"x":-0.14,"y":-0.18},{"x":-0.26,"y":-0.14},{"x":-0.14,"y":-0.1},{"x":-0.2,"y":-0.08},{"x":-0.2,"y":0}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.2,"y":0.4},{"x":0.2,"y":0.2},{"x":0,"y":0.06}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.2,"y":-0.2},{"x":0.08,"y":-0.18},{"x":0.14,"y":-0.1},{"x":0.2,"y":-0.2}]} strokeColor="#880000" isFilled fillColor="#880000" />
        </symbol>
      }
      supplierPartNumbers={{
  "jlcpcb": [
    "C79605"
  ]
}}
      manufacturerPartNumber="DTC114EETL"
      footprint={<footprint>
        <smtpad portHints={["pin3"]} pcbX="-0.649986mm" pcbY="-0.000127mm" width="0.5100066mm" height="0.3999992mm" shape="rect" />
<smtpad portHints={["pin1"]} pcbX="0.649986mm" pcbY="-0.499999mm" width="0.5100066mm" height="0.3999992mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="0.649986mm" pcbY="0.499999mm" width="0.5100066mm" height="0.3999992mm" shape="rect" />
<silkscreenpath route={[{"x":0.45001180000002705,"y":-0.10086339999998017},{"x":0.45001180000002705,"y":0.1008634000000086}]} />
<silkscreenpath route={[{"x":0.45001180000002705,"y":-0.8999981999999989},{"x":0.45001180000002705,"y":-0.8991345999999965}]} />
<silkscreenpath route={[{"x":-0.45001179999999863,"y":0.39913559999999393},{"x":-0.45001179999999863,"y":0.8999981999999989}]} />
<silkscreenpath route={[{"x":-0.45001179999999863,"y":-0.8999981999999989},{"x":-0.45001179999999863,"y":-0.39913559999999393}]} />
<silkscreenpath route={[{"x":-0.45001179999999863,"y":-0.8999981999999989},{"x":0.45001180000002705,"y":-0.8999981999999989}]} />
<silkscreenpath route={[{"x":-0.45001179999999863,"y":0.8999981999999989},{"x":0.45001180000002705,"y":0.8999981999999989}]} />
<silkscreenpath route={[{"x":0.45001180000002705,"y":0.8991346000000107},{"x":0.45001180000002705,"y":0.8999981999999989}]} />
<silkscreencircle pcbX="0.759968mm" pcbY="-1.010031mm" radius="0.067056mm" />
<silkscreentext text={props.name?.replace("Q_PD_", "") ?? "Q"} pcbX={props.name === "Q_PD_CFG1" ? -2.5 : 0} pcbY={props.name === "Q_PD_CFG1" ? 0 : -1.5} anchorAlignment="center" fontSize="0.7mm" />
<courtyardoutline outline={[{"x":-1.1506839999999983,"y":1.1551290000000165},{"x":1.2289160000000123,"y":1.1551290000000165},{"x":1.2289160000000123,"y":-1.3260709999999847},{"x":-1.1506839999999983,"y":-1.3260709999999847},{"x":-1.1506839999999983,"y":1.1551290000000165}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C79605.obj?uuid=3dc99d09648d4392979bbf6561129f61",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C79605.step?uuid=3dc99d09648d4392979bbf6561129f61",
        pcbRotationOffset: 180,
        modelOriginPosition: { x: 0, y: 0, z: -0.149083 },
      }}
      {...props}
    />
  )
}
