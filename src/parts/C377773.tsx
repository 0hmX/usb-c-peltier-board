// Manufacturer drawing audited 2026-10-10: Samsung MLCC page 48, 2012 ±0.15 row.
// Existing imported lands corrected in place; NSMD +0.05 mm, 1:1 paste, maximum-body courtyard.
// Paste control: 1:1 stencil apertures for passive pads (default toolchain shrinks to 70% linear).
// Exact EasyEDA/JLCPCB C377773; observed 2026-10-10T03:23:04.115969+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C377773
import type { CapacitorProps } from "@tscircuit/props"

export const CL21A225KBQNNNE = (props: Omit<CapacitorProps, "capacitance">) => {
  const { name = "C1", ...restProps } = props

  return (
    <capacitor
      name={name}
      capacitance="2.2uF"
      supplierPartNumbers={{
  "jlcpcb": [
    "C377773"
  ]
}}
      manufacturerPartNumber="CL21A225KBQNNNE"
      footprint={<footprint>
        <smtpad solderPasteMargin={0} portHints={["pin2"]} pcbX="0.905mm" pcbY="0mm" width="0.95mm" height="1.35mm" shape="rect" solderMaskMargin="0.05mm" />
<smtpad solderPasteMargin={0} portHints={["pin1"]} pcbX="-0.905mm" pcbY="0mm" width="0.95mm" height="1.35mm" shape="rect" solderMaskMargin="0.05mm" />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":1.8111977999999453,"y":0.9578212999999676},{"x":0.4011929999999211,"y":0.9578212999999676}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":0.4011929999999211,"y":-0.9578212999999676},{"x":1.8111977999999453,"y":-0.9578212999999676}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":1.9635978000000023,"y":-0.7962773000000278},{"x":1.9635978000000023,"y":0.7962773000000278}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-1.811197800000059,"y":0.9578212999999676},{"x":-0.40119300000003477,"y":0.9578212999999676}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-0.40119300000003477,"y":-0.9578212999999676},{"x":-1.811197800000059,"y":-0.9578212999999676}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-1.9635978000000023,"y":-0.7962773000000278},{"x":-1.9635978000000023,"y":0.7962773000000278}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":1.8111977999999453,"y":-0.9578212999997265},{"x":1.918960873452761,"y":-0.9105061578597713},{"x":1.9635977999998886,"y":-0.7962773000000278}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":1.9635977999998886,"y":0.7962773000000278},{"x":1.918960873452761,"y":0.9105061578598919},{"x":1.8111977999999453,"y":0.957821299999847}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-1.811197800000059,"y":-0.9578212999997265},{"x":-1.9189608734528747,"y":-0.9105061578597713},{"x":-1.9635978000000023,"y":-0.7962773000000278}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-1.9635978000000023,"y":0.7962773000000278},{"x":-1.9189608734528747,"y":0.9105061578598919},{"x":-1.811197800000059,"y":0.957821299999847}]} />
<silkscreentext text="{NAME}" pcbX="0.0127mm" pcbY="1.9144mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-1.63,"y":0.95},{"x":1.63,"y":0.95},{"x":1.63,"y":-0.95},{"x":-1.63,"y":-0.95},{"x":-1.63,"y":0.95}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C377773.obj?uuid=b87ab0c5465a48b3a1c9a6dac8d30bc5",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C377773.step?uuid=b87ab0c5465a48b3a1c9a6dac8d30bc5",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: -0.000012700000070253736, z: -0.65 },
      }}
      {...restProps}
    />
  )
}