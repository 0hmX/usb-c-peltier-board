// JLC silk audit: explicit graphic strokes >=0.15 mm; USB/cap outline ends trimmed for >=0.15 mm own-mask clearance. Copper/drills/courtyards preserved.
// Exact EasyEDA/JLCPCB C158004; observed 2026-10-10T03:23:59.166107+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C158004
// Unused KL variant: not populated; this 0.80-mm legacy adaptation requires a separate finished-hole/insertion fit review before fitted use.
// In-place earlier adaptation: nominal finished holes 0.80 mm per JST PH reference 0.7 +0.1/-0; original pitch/pin1/body/pads retained.
// Source: https://www.jst-mfg.com/product/pdf/eng/ePH.pdf (PCB layout, page 1).
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["pin1"],
  pin2: ["pin2"],
  pin3: ["pin3"]
} as const

export const B3B_PH_KL_LF__SN_ = (props: ChipProps<typeof pinLabels>) => {
  return (
    <connector
      standard="jst_ph"
      pinCount={3}
      pinLabels={pinLabels}
      supplierPartNumbers={{
  "jlcpcb": [
    "C158004"
  ]
}}
      manufacturerPartNumber="B3B-PH-KL(LF)(SN)"
      footprint={<footprint>
        <platedhole  portHints={["pin1"]} pcbX="1.999996mm" pcbY="0mm" holeWidth="0.8mm" holeHeight="0.8mm" outerWidth="1.524mm" outerHeight="1.524mm" rectPad={true} pcbRotation="0deg" shape="pill" />
<platedhole  portHints={["pin2"]} pcbX="0mm" pcbY="0mm" outerDiameter="1.524mm" holeDiameter="0.8mm" shape="circle" />
<platedhole  portHints={["pin3"]} pcbX="-1.999996mm" pcbY="0mm" outerDiameter="1.524mm" holeDiameter="0.8mm" shape="circle" />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":3.598926000000006,"y":0.3987800000001016},{"x":3.99999200000002,"y":0.39999919999991107}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-4.000754000000029,"y":0.3987800000001016},{"x":-3.599433999999974,"y":0.3987800000001016},{"x":-3.599433999999974,"y":2.4003000000000156},{"x":3.598926000000006,"y":2.4003000000000156},{"x":3.598926000000006,"y":0.3987800000001016}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":4.000017400000047,"y":2.8000198000000864},{"x":-3.9999919999999065,"y":2.7999944000000596}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-3.9999919999999065,"y":2.7999944000000596},{"x":-3.9999919999999065,"y":-1.70002199999999}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-1.3999717999998893,"y":-1.70002199999999},{"x":-1.3999717999998893,"y":-1.3000227999998515},{"x":-3.5999927999998818,"y":-1.3000227999998515},{"x":-3.5999927999998818,"y":-0.4000246000000516},{"x":-3.9999919999999065,"y":-0.4000246000000516}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-3.9999919999999065,"y":-1.6999965999998494},{"x":4.000017400000047,"y":-1.6999965999998494}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":4.000017400000047,"y":-1.6999965999998494},{"x":4.000017400000047,"y":2.7999944000000596}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":4.000017400000047,"y":-0.2999993999998196},{"x":3.6000182000000223,"y":-0.2999993999998196},{"x":3.6000182000000223,"y":-1.299997400000052},{"x":1.3999972000000298,"y":-1.299997400000052},{"x":1.3999972000000298,"y":-1.6999965999998494}]} />
<silkscreentext text="{NAME}" pcbX="0.009906mm" pcbY="3.8194mm" anchorAlignment="center" fontSize="1mm" />
<fabricationnotepath route={[{"x":1.3000228000000789,"y":-1.6999203999999963},{"x":3.999992000000134,"y":-1.6998950000000832},{"x":3.999992000000134,"y":2.8000959999999395},{"x":-3.999991999999793,"y":2.8000959999999395},{"x":-4.000017399999933,"y":-1.5998951999999917},{"x":-4.000017399999933,"y":-1.6998950000000832},{"x":-3.8999921999999287,"y":-1.6998950000000832},{"x":-0.999998000000005,"y":-1.6998950000000832},{"x":-1.0000233999999182,"y":-1.3998955999999225},{"x":-3.6999671999998327,"y":-1.3998955999999225},{"x":-3.6999671999998327,"y":2.500122000000033},{"x":3.6999672000001738,"y":2.500122000000033},{"x":3.6999672000001738,"y":-1.3998955999999225},{"x":1.3000228000000789,"y":-1.3998955999999225},{"x":1.3000228000000789,"y":-1.6999203999999963}]} strokeWidth="0mm" isFilled hasStroke={false} />
<courtyardoutline outline={[{"x":-4.200004799999988,"y":3.060002000000054},{"x":4.199979400000075,"y":3.060002000000054},{"x":4.199979400000075,"y":-1.9499965999998494},{"x":-4.200004799999988,"y":-1.9499965999998494},{"x":-4.200004799999988,"y":3.060002000000054}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C158004.obj?uuid=bb99f853562e453587203e597525377f",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C158004.step?uuid=bb99f853562e453587203e597525377f",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 7.900012699999957, y: 0.7449972999999546, z: 1.0549930000000005 },
      }}
      {...props}
    />
  )
}
