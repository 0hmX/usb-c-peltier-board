// Manufacturer drawing audited 2026-10-10: Samsung MLCC page 48, 2012 ±0.20 row.
// Existing imported lands corrected in place; NSMD +0.05 mm, 1:1 paste, maximum-body courtyard.
// Paste control: 1:1 stencil apertures for passive pads (default toolchain shrinks to 70% linear).
// Exact EasyEDA/JLCPCB C602037; observed 2026-10-10T03:26:49.307306+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C602037
import type { CapacitorProps } from "@tscircuit/props"

export const CL21A226MAYNNNE = (props: Omit<CapacitorProps, "capacitance">) => {
  const { name = "C1", ...restProps } = props

  return (
    <capacitor
      name={name}
      capacitance="22uF"
      supplierPartNumbers={{
  "jlcpcb": [
    "C602037"
  ]
}}
      manufacturerPartNumber="CL21A226MAYNNNE"
      footprint={<footprint>
        <smtpad solderPasteMargin={0} portHints={["pin2"]} pcbX="0.92mm" pcbY="0mm" width="0.96mm" height="1.4mm" shape="rect" solderMaskMargin="0.05mm" />
<smtpad solderPasteMargin={0} portHints={["pin1"]} pcbX="-0.92mm" pcbY="0mm" width="0.96mm" height="1.4mm" shape="rect" solderMaskMargin="0.05mm" />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":1.8111977999999453,"y":0.9804114249999664},{"x":0.4011929999999211,"y":0.9804114249999664}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":0.4011929999999211,"y":-0.9804114249999664},{"x":1.8111977999999453,"y":-0.9804114249999664}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":1.9635978000000023,"y":-0.8150574250000282},{"x":1.9635978000000023,"y":0.8150574250000282}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-1.811197800000059,"y":0.9804114249999664},{"x":-0.40119300000003477,"y":0.9804114249999664}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-0.40119300000003477,"y":-0.9804114249999664},{"x":-1.811197800000059,"y":-0.9804114249999664}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-1.9635978000000023,"y":-0.8150574250000282},{"x":-1.9635978000000023,"y":0.8150574250000282}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":1.8111977999999453,"y":-0.9804114249997196},{"x":1.918960873452761,"y":-0.9319803596960863},{"x":1.9635977999998886,"y":-0.8150574250000282}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":1.9635977999998886,"y":0.8150574250000282},{"x":1.918960873452761,"y":0.9319803596962096},{"x":1.8111977999999453,"y":0.9804114249998429}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-1.811197800000059,"y":-0.9804114249997196},{"x":-1.9189608734528747,"y":-0.9319803596960863},{"x":-1.9635978000000023,"y":-0.8150574250000282}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-1.9635978000000023,"y":0.8150574250000282},{"x":-1.9189608734528747,"y":0.9319803596962096},{"x":-1.811197800000059,"y":0.9804114249998429}]} />
<silkscreentext text="{NAME}" pcbX="0.0127mm" pcbY="1.9144mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-1.65,"y":0.975},{"x":1.65,"y":0.975},{"x":1.65,"y":-0.975},{"x":-1.65,"y":-0.975},{"x":-1.65,"y":0.975}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C602037.obj?uuid=b87ab0c5465a48b3a1c9a6dac8d30bc5",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C602037.step?uuid=b87ab0c5465a48b3a1c9a6dac8d30bc5",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: -0.000012700000070253736, z: -0.65 },
      }}
      {...restProps}
    />
  )
}