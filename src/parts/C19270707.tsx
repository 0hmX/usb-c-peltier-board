// JLC silk audit: explicit graphic strokes >=0.15 mm; USB/cap outline ends trimmed for >=0.15 mm own-mask clearance. Copper/drills/courtyards preserved.
// Paste: explicit 1:1 land apertures as an assembly-process baseline; DMBJ specifies terminal geometry, not stencil apertures.
// JLC may optimize these apertures; qualify capacitor solder volume in the prototype assembly process.
// Exact EasyEDA/JLCPCB C19270707; observed 2026-10-10T03:20:59.905777+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C19270707
// In-place audit: DMBJ 6.3 mm can, 6.5 +/-0.2 base, 7.2 +/-0.2 lead span, 2.2 gap, 0.5..0.8 mm lead width (manufacturer page1).
// Existing pads retained; explicit silkscreen +/- added, pin1 positive at local -X, pin2 negative at +X.
import type { CapacitorProps } from "@tscircuit/props"

export const JBLM2221M025C090RTM_220UF_25V = (props: Omit<CapacitorProps, "capacitance">) => {
  const { name = "C1", ...restProps } = props

  return (
    <capacitor
      name={name}
      capacitance="220uF"
      polarized
      supplierPartNumbers={{
  "jlcpcb": [
    "C19270707"
  ]
}}
      manufacturerPartNumber="JBLM2221M025C090RTM 220UF 25V"
      footprint={<footprint>
        <silkscreentext text="+" pcbX="-4.3mm" pcbY="1.7mm" fontSize="1.7mm" />
<silkscreentext text="-" pcbX="4.3mm" pcbY="1.7mm" fontSize="1.7mm" />
        <smtpad solderPasteMargin={0} portHints={["pin1"]} pcbX="-2.669921mm" pcbY="0mm" width="3.499993mm" height="1.1999976mm" shape="rect" />
<smtpad solderPasteMargin={0} portHints={["pin2"]} pcbX="2.669921mm" pcbY="0mm" width="3.499993mm" height="1.1999976mm" shape="rect" />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":3.3555431999999428,"y":-0.9},{"x":3.3756345999998985,"y":-3.375710799999979},{"x":-1.981250799999998,"y":-3.375710799999979},{"x":-3.3757107999998652,"y":-1.9812508000001117},{"x":-3.3623757999998816,"y":-0.9}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":3.3694370000000617,"y":0.9},{"x":3.376142600000094,"y":3.3761171999999533},{"x":-1.980056999999988,"y":3.3761171999999533},{"x":-3.37619339999992,"y":1.9799807999999075},{"x":-3.37619339999992,"y":0.9}]} />
<fabricationnotepath route={[{"x":3.1019496000000117,"y":0.09895840000001499},{"x":3.1019496000000117,"y":-0.09906000000000859},{"x":2.3099522000001116,"y":-0.09906000000000859},{"x":2.3099522000001116,"y":0.09895840000001499},{"x":3.1019496000000117,"y":0.09895840000001499}]} strokeWidth="0mm" isFilled hasStroke={false} />
<fabricationnotepath route={[{"x":-3.1020512000000053,"y":0.09895840000001499},{"x":-3.1020512000000053,"y":-0.09906000000000859},{"x":-2.310053799999878,"y":-0.09906000000000859},{"x":-2.310053799999878,"y":0.09895840000001499},{"x":-3.1020512000000053,"y":0.09895840000001499}]} strokeWidth="0mm" isFilled hasStroke={false} />
<fabricationnotepath route={[{"x":-2.8050490000000536,"y":0.6599428},{"x":-2.8050490000000536,"y":-0.6600444},{"x":-2.607055999999943,"y":-0.6600444},{"x":-2.607055999999943,"y":0.6599428},{"x":-2.8050490000000536,"y":0.6599428}]} strokeWidth="0mm" isFilled hasStroke={false} />
<courtyardoutline outline={[{"x":-4.669917499999997,"y":3.5498155999998744},{"x":4.669917499999997,"y":3.5498155999998744},{"x":4.669917499999997,"y":-3.5501712000000225},{"x":-4.669917499999997,"y":-3.5501712000000225},{"x":-4.669917499999997,"y":3.5498155999998744}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C19270707.obj?uuid=19c047b38b814d5099587d6a780dd6ee",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C19270707.step?uuid=19c047b38b814d5099587d6a780dd6ee",
        pcbRotationOffset: 180,
        modelOriginPosition: { x: -0.0001015999999935957, y: -0.0001778000000740576, z: -0.02 },
      }}
      {...restProps}
    />
  )
}
