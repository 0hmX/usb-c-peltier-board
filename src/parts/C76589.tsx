// Exact EasyEDA/JLCPCB C76589; observed 2026-10-10T03:21:01.430583+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C76589
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["pin1"],
  pin2: ["pin2"]
} as const

export const NTCG163JF103FT1 = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      symbol={
        <symbol>
          <port name="pin2" pinNumber={2} aliases={["2"]} direction="right" schX={0.4} schY={0} schStemLength={0.2} />
          <port name="pin1" pinNumber={1} aliases={["1"]} direction="left" schX={-0.4} schY={0} schStemLength={0.2} />
          <schematicrect schX={0} schY={0} width={0.4} height={0.16} strokeWidth={0.02} color="#880000" />
          <schematicpath points={[{"x":-0.2,"y":-0.12},{"x":-0.1,"y":-0.12},{"x":0.18,"y":0.16}]} strokeColor="#880000" />
          <schematictext schX={0} schY={0.36} text="{NAME}" fontSize={0.2} anchor="bottom_center" />
        </symbol>
      }
      supplierPartNumbers={{
  "jlcpcb": [
    "C76589"
  ]
}}
      manufacturerPartNumber="NTCG163JF103FT1"
      footprint={<footprint>
        <smtpad portHints={["pin2"]} pcbX="0.753364mm" pcbY="0mm" width="0.8064754mm" height="0.8640064mm" shape="rect" />
<smtpad portHints={["pin1"]} pcbX="-0.753364mm" pcbY="0mm" width="0.8064754mm" height="0.8640064mm" shape="rect" />
<silkscreenpath route={[{"x":0.42621199999996406,"y":-0.6606031999999686},{"x":1.3850873999999749,"y":-0.6606031999999686},{"x":1.3850873999999749,"y":0.6606031999999686},{"x":0.42621199999996406,"y":0.6606031999999686}]} />
<silkscreenpath route={[{"x":-0.42621200000007775,"y":-0.6606031999999686},{"x":-1.3850874000000886,"y":-0.6606031999999686},{"x":-1.3850874000000886,"y":0.6606031999999686},{"x":-0.42621200000007775,"y":0.6606031999999686}]} />
<silkscreentext text="{NAME}" pcbX="-0.0127mm" pcbY="1.6604mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-1.4066016999998965,"y":0.6820032000000538},{"x":1.4066016999997828,"y":0.6820032000000538},{"x":1.4066016999997828,"y":-0.6820032000000538},{"x":-1.4066016999998965,"y":-0.6820032000000538},{"x":-1.4066016999998965,"y":0.6820032000000538}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C76589.obj?uuid=6bd5cd867e9542ebae21caaf5d2d4c4d",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C76589.step?uuid=6bd5cd867e9542ebae21caaf5d2d4c4d",
        pcbRotationOffset: 90,
        modelOriginPosition: { x: -0.004999999999999977, y: 0, z: -0.01 },
      }}
      {...props}
    />
  )
}