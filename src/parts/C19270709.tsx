// JLC silk audit: explicit graphic strokes >=0.15 mm; USB/cap outline ends trimmed for >=0.15 mm own-mask clearance. Copper/drills/courtyards preserved.
// Paste: explicit 1:1 land apertures as an assembly-process baseline; DMBJ specifies terminal geometry, not stencil apertures.
// JLC may optimize these apertures; qualify capacitor solder volume in the prototype assembly process.
// Exact EasyEDA/JLCPCB C19270709; observed 2026-10-10T03:20:59.925835+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C19270709
// In-place audit: DMBJ 6.3 mm can, 6.5 +/-0.2 base, 7.2 +/-0.2 lead span, 2.2 gap, 0.5..0.8 mm lead width (manufacturer page1).
// Existing pads retained; explicit silkscreen +/- added, pin1 positive at local -X, pin2 negative at +X.
import type { CapacitorProps } from "@tscircuit/props"

export const JBLM2101M035C077RTM_100UF_35V = (props: Omit<CapacitorProps, "capacitance">) => {
  const { name = "C1", ...restProps } = props

  return (
    <capacitor
      name={name}
      capacitance="100uF"
      polarized
      supplierPartNumbers={{
  "jlcpcb": [
    "C19270709"
  ]
}}
      manufacturerPartNumber="JBLM2101M035C077RTM 100UF 35V"
      footprint={<footprint>
        <silkscreentext text="+" pcbX="-4.3mm" pcbY="1.7mm" fontSize="0.8mm" />
<silkscreentext text="-" pcbX="4.3mm" pcbY="1.7mm" fontSize="0.8mm" />
        <smtpad solderPasteMargin={0} portHints={["pin2"]} pcbX="2.669921mm" pcbY="0mm" width="3.499993mm" height="1.1999976mm" shape="rect" />
<smtpad solderPasteMargin={0} portHints={["pin1"]} pcbX="-2.669921mm" pcbY="0mm" width="3.499993mm" height="1.1999976mm" shape="rect" />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":3.3020254000001614,"y":0.9},{"x":3.3020254000001614,"y":1.1428983999999218}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-3.301974599999994,"y":-0.9},{"x":-3.301974599999994,"y":-2.0321016000000327},{"x":-2.0319745999998986,"y":-3.3021016000000145},{"x":3.3020254000001614,"y":-3.3021016000000145},{"x":3.3020254000001614,"y":-0.9}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":3.3020254000001614,"y":0.9},{"x":3.3020254000001614,"y":3.3018984000000273},{"x":-1.904974599999946,"y":3.3018984000000273},{"x":-2.0319745999998986,"y":3.3018984000000273},{"x":-3.301974599999994,"y":2.031898399999932},{"x":-3.301974599999994,"y":0.9}]} />
<silkscreentext text="{NAME}" pcbX="-0.012065mm" pcbY="4.300984mm" anchorAlignment="center" fontSize="1mm" />
<fabricationnotepath route={[{"x":-2.804972799999973,"y":0.6598920000000135},{"x":-2.804972799999973,"y":-0.6600952000000007},{"x":-2.60697980000009,"y":-0.6600952000000007},{"x":-2.60697980000009,"y":0.6598920000000135},{"x":-2.804972799999973,"y":0.6598920000000135}]} strokeWidth="0mm" isFilled hasStroke={false} />
<fabricationnotepath route={[{"x":-3.101974999999811,"y":0.09890760000007504},{"x":-3.101974999999811,"y":-0.09911080000006223},{"x":-2.309977599999911,"y":-0.09911080000006223},{"x":-2.309977599999911,"y":0.09890760000007504},{"x":-3.101974999999811,"y":0.09890760000007504}]} strokeWidth="0mm" isFilled hasStroke={false} />
<fabricationnotepath route={[{"x":3.1020257999999785,"y":0.09890760000007504},{"x":3.1020257999999785,"y":-0.09911080000006223},{"x":2.3100284000000784,"y":-0.09911080000006223},{"x":2.3100284000000784,"y":0.09890760000007504},{"x":3.1020257999999785,"y":0.09890760000007504}]} strokeWidth="0mm" isFilled hasStroke={false} />
<courtyardoutline outline={[{"x":-4.669917499999883,"y":3.4998792000000094},{"x":4.669917499999883,"y":3.4998792000000094},{"x":4.669917499999883,"y":-3.5001078000000234},{"x":-4.669917499999883,"y":-3.5001078000000234},{"x":-4.669917499999883,"y":3.4998792000000094}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C19270709.obj?uuid=a6027b67871b4279b8f73163e2e1331d",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C19270709.step?uuid=a6027b67871b4279b8f73163e2e1331d",
        pcbRotationOffset: 90,
        modelOriginPosition: { x: 0.00011430000006384944, y: 0.000025400000026820635, z: -0.01 },
      }}
      {...restProps}
    />
  )
}
