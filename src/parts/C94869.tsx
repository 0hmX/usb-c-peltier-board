// Datasheet audit: 0.8 mm square copper/paste lands at X ±0.75, Y0; mask +0.05 mm; left cathode bar.
// Authentic EasyEDA C94869, LITEON LTST-C190KRKT; direct API observed 2026-10-10T13:59:12.427Z.
import type { LedProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["cathode","neg"],
  pin2: ["anode","pos"]
} as const

export const LTST_C190KRKT = (props: LedProps) => {
  const { name = "LED1", ...restProps } = props

  return (
    <led
      name={name}
      pinLabels={pinLabels}
      supplierPartNumbers={{
  "jlcpcb": [
    "C94869"
  ]
}}
      manufacturerPartNumber="LTST-C190KRKT"
      footprint={<footprint>
        <smtpad solderMaskMargin="0.05mm" solderPasteMargin={0} portHints={["pin1","cathode","neg"]} pcbX="-0.75mm" pcbY="0mm" width="0.8mm" height="0.8mm" shape="rect" />
<smtpad solderMaskMargin="0.05mm" solderPasteMargin={0} portHints={["pin2","anode","pos"]} pcbX="0.75mm" pcbY="0mm" width="0.8mm" height="0.8mm" shape="rect" />

<silkscreenpath strokeWidth="0.15mm" route={[{"x":-1.5,"y":0.4},{"x":-1.5,"y":-0.4}]} />

<fabricationnotepath route={[{"x":0.5289295999998558,"y":0.06832600000007005},{"x":1.068933599999923,"y":0.06832600000007005},{"x":1.068933599999923,"y":-0.061671199999977944},{"x":0.5289295999998558,"y":-0.061671199999977944},{"x":0.5289295999998558,"y":0.06832600000007005}]} strokeWidth="0mm" isFilled hasStroke={false} />
<fabricationnotepath route={[{"x":0.7345679999999675,"y":-0.2671318000000156},{"x":0.7345679999999675,"y":0.27287220000005163},{"x":0.8645397999999886,"y":0.27287220000005163},{"x":0.8645397999999886,"y":-0.2671318000000156},{"x":0.7345679999999675,"y":-0.2671318000000156}]} strokeWidth="0mm" isFilled hasStroke={false} />
<fabricationnotepath route={[{"x":-1.0700004000000263,"y":0.06146800000010444},{"x":-0.5299964000000728,"y":0.06146800000010444},{"x":-0.5299964000000728,"y":-0.06852919999994356},{"x":-1.0700004000000263,"y":-0.06852919999994356},{"x":-1.0700004000000263,"y":0.06146800000010444}]} strokeWidth="0mm" isFilled hasStroke={false} />
<courtyardoutline outline={[{"x":-1.398994400000106,"y":0.6534282000000076},{"x":1.3989943999999923,"y":0.6534282000000076},{"x":1.3989943999999923,"y":-0.6534282000000076},{"x":-1.398994400000106,"y":-0.6534282000000076},{"x":-1.398994400000106,"y":0.6534282000000076}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C94869.obj?uuid=d0740cb8891c49a88b6949cb978926f3",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C94869.step?uuid=d0740cb8891c49a88b6949cb978926f3",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: -0.000012700000070253736, y: 0.00005079999993995443, z: -0.01 },
      }}
      {...restProps}
    />
  )
}