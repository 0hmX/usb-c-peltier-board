// Paste control: 1:1 stencil apertures for passive pads (default toolchain shrinks to 70% linear).
// Manufacturer drawing audited 2026-10-10, page 48: https://www.samsungsem.com/resources/file/kr/support/product_catalog/MLCC_2512.pdf
// Existing imported lands corrected in place; NSMD +0.05 mm and 1:1 paste; courtyard includes maximum body.
// Exact EasyEDA/JLCPCB C2762602; observed 2026-10-10T03:23:04.418121+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C2762602
import type { CapacitorProps } from "@tscircuit/props"

export const CL21B225KBYNNNE = (props: Omit<CapacitorProps, "capacitance">) => {
  const { name = "C1", ...restProps } = props

  return (
    <capacitor
      name={name}
      capacitance="2.2uF"
      supplierPartNumbers={{
  "jlcpcb": [
    "C2762602"
  ]
}}
      manufacturerPartNumber="CL21B225KBYNNNE"
      footprint={<footprint>
        <smtpad solderPasteMargin={0} portHints={["pin2"]} pcbX="0.92mm" pcbY="0mm" width="0.96mm" height="1.4mm" shape="rect" solderMaskMargin="0.05mm" />
<smtpad solderPasteMargin={0} portHints={["pin1"]} pcbX="-0.92mm" pcbY="0mm" width="0.96mm" height="1.4mm" shape="rect" solderMaskMargin="0.05mm" />
<silkscreenpath route={[{"x":1.8111977999999453,"y":0.9036049999999705},{"x":0.4011929999999211,"y":0.9036049999999705}]} />
<silkscreenpath route={[{"x":0.4011929999999211,"y":-0.9036049999999705},{"x":1.8111977999999453,"y":-0.9036049999999705}]} />
<silkscreenpath route={[{"x":1.9635978000000023,"y":-0.7512050000000272},{"x":1.9635978000000023,"y":0.7512050000000272}]} />
<silkscreenpath route={[{"x":-1.811197800000059,"y":0.9036049999999705},{"x":-0.40119300000003477,"y":0.9036049999999705}]} />
<silkscreenpath route={[{"x":-0.40119300000003477,"y":-0.9036049999999705},{"x":-1.811197800000059,"y":-0.9036049999999705}]} />
<silkscreenpath route={[{"x":-1.9635978000000023,"y":-0.7512050000000272},{"x":-1.9635978000000023,"y":0.7512050000000272}]} />
<silkscreenpath route={[{"x":1.8111977999999453,"y":-0.9036049999997431},{"x":1.918960873452761,"y":-0.8589680734526155},{"x":1.9635977999998886,"y":-0.7512050000000272}]} />
<silkscreenpath route={[{"x":1.9635977999998886,"y":0.7512050000000272},{"x":1.918960873452761,"y":0.8589680734527292},{"x":1.8111977999999453,"y":0.9036049999998568}]} />
<silkscreenpath route={[{"x":-1.811197800000059,"y":-0.9036049999997431},{"x":-1.9189608734528747,"y":-0.8589680734526155},{"x":-1.9635978000000023,"y":-0.7512050000000272}]} />
<silkscreenpath route={[{"x":-1.9635978000000023,"y":0.7512050000000272},{"x":-1.9189608734528747,"y":0.8589680734527292},{"x":-1.811197800000059,"y":0.9036049999998568}]} />
<silkscreentext text="{NAME}" pcbX="0.0127mm" pcbY="1.9144mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-1.65,"y":0.975},{"x":1.65,"y":0.975},{"x":1.65,"y":-0.975},{"x":-1.65,"y":-0.975},{"x":-1.65,"y":0.975}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C2762602.obj?uuid=b87ab0c5465a48b3a1c9a6dac8d30bc5",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C2762602.step?uuid=b87ab0c5465a48b3a1c9a6dac8d30bc5",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: -0.000012700000070253736, z: -0.65 },
      }}
      {...restProps}
    />
  )
}