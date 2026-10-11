// Datasheet review: SMA recommended land geometry retained; explicit mask +0.05 mm and 1:1 paste.
// Exact EasyEDA/JLCPCB C2480; observed 2026-10-10T03:23:56.840191+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C2480
import type { DiodeProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["cathode","neg"],
  pin2: ["anode","pos"]
} as const

export const SS14 = (props: DiodeProps) => {
  const { name = "D1", ...restProps } = props

  return (
    <diode
      name={name}
      pinLabels={pinLabels}
      supplierPartNumbers={{
  "jlcpcb": [
    "C2480"
  ]
}}
      manufacturerPartNumber="SS14"
      footprint={<footprint>
        <smtpad solderMaskMargin="0.05mm" solderPasteMargin={0} portHints={["pin2","anode","pos"]} pcbX="1.964944mm" pcbY="0mm" width="1.5199868mm" height="1.6800068mm" shape="rect" />
<smtpad solderMaskMargin="0.05mm" solderPasteMargin={0} portHints={["pin1","cathode","neg"]} pcbX="-1.964944mm" pcbY="0mm" width="1.5199868mm" height="1.6800068mm" shape="rect" />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-0.7238745999998173,"y":0},{"x":0.7500112000000172,"y":0}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-0.24998679999998785,"y":0.49999899999988884},{"x":-0.24998679999998785,"y":-0.4999990000000025}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":0.25001220000012836,"y":0.49999899999988884},{"x":-0.24998679999998785,"y":0},{"x":0.25001220000012836,"y":-0.4999990000000025},{"x":0.25001220000012836,"y":0.49999899999988884}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":2.099995799999988,"y":-1.15},{"x":2.099995799999988,"y":-1.2999973999999384}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":2.099995799999988,"y":1.299997400000052},{"x":2.099995799999988,"y":1.15}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-2.099995799999988,"y":1.299997400000052},{"x":2.099995799999988,"y":1.299997400000052}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-2.099995799999988,"y":1.15},{"x":-2.099995799999988,"y":1.299997400000052}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-2.099995799999988,"y":-1.2999973999999384},{"x":-2.099995799999988,"y":-1.15}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":2.099995799999988,"y":-1.2999973999999384},{"x":-2.099995799999988,"y":-1.2999973999999384}]} />
<silkscreentext text="{NAME}" pcbX="0.0127mm" pcbY="2.2954mm" anchorAlignment="center" fontSize="1mm" />
<fabricationnotepath route={[{"x":-2.4318722000000434,"y":-0.09657079999999496},{"x":-2.4318722000000434,"y":0.09657079999999496},{"x":-1.6593820000000505,"y":0.09657079999999496},{"x":-1.6593820000000505,"y":-0.09657079999999496},{"x":-2.4318722000000434,"y":-0.09657079999999496}]} strokeWidth="0mm" isFilled hasStroke={false} />
<fabricationnotepath route={[{"x":2.4318722000000434,"y":-0.09657079999999496},{"x":2.4318722000000434,"y":0.09657079999999496},{"x":1.6593820000000505,"y":0.09657079999999496},{"x":1.6593820000000505,"y":-0.09657079999999496},{"x":2.4318722000000434,"y":-0.09657079999999496}]} strokeWidth="0mm" isFilled hasStroke={false} />
<fabricationnotepath route={[{"x":2.1421852000000854,"y":-0.6437376000000086},{"x":2.1421852000000854,"y":0.6437376000000086},{"x":1.9490690000000086,"y":0.6437376000000086},{"x":1.9490690000000086,"y":-0.6437376000000086},{"x":2.1421852000000854,"y":-0.6437376000000086}]} strokeWidth="0mm" isFilled hasStroke={false} />
<courtyardoutline outline={[{"x":-2.9749374000000444,"y":1.5350114000000303},{"x":2.9749374000000444,"y":1.5350114000000303},{"x":2.9749374000000444,"y":-1.5349860000001172},{"x":-2.9749374000000444,"y":-1.5349860000001172},{"x":-2.9749374000000444,"y":1.5350114000000303}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C2480.obj?uuid=2ad98c37c5614ad18681cbd22e4725e1",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C2480.step?uuid=2ad98c37c5614ad18681cbd22e4725e1",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: -0.000012699999956566899, z: -1.05 },
      }}
      {...restProps}
    />
  )
}