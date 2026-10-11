// Paste control: 1:1 stencil apertures for passive pads (default toolchain shrinks to 70% linear).
// Manufacturer drawing audited 2026-10-10, page 48: https://www.samsungsem.com/resources/file/kr/support/product_catalog/MLCC_2512.pdf
// Existing imported lands corrected in place; NSMD +0.05 mm and 1:1 paste; courtyard includes maximum body.
// Exact EasyEDA/JLCPCB C45783; observed 2026-10-10T03:23:04.280912+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C45783
import type { CapacitorProps } from "@tscircuit/props"

export const CL21A226MAQNNNE = (props: Omit<CapacitorProps, "capacitance">) => {
  const { name = "C1", ...restProps } = props

  return (
    <capacitor
      name={name}
      capacitance="22uF"
      supplierPartNumbers={{
  "jlcpcb": [
    "C45783"
  ]
}}
      manufacturerPartNumber="CL21A226MAQNNNE"
      footprint={<footprint>
        <smtpad solderPasteMargin={0} portHints={["pin2"]} pcbX="0.905mm" pcbY="0mm" width="0.95mm" height="1.35mm" shape="rect" solderMaskMargin="0.05mm" />
<smtpad solderPasteMargin={0} portHints={["pin1"]} pcbX="-0.905mm" pcbY="0mm" width="0.95mm" height="1.35mm" shape="rect" solderMaskMargin="0.05mm" />
<courtyardoutline outline={[{"x":-1.63,"y":0.95},{"x":1.63,"y":0.95},{"x":1.63,"y":-0.95},{"x":-1.63,"y":-0.95},{"x":-1.63,"y":0.95}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C45783.obj?uuid=b87ab0c5465a48b3a1c9a6dac8d30bc5",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C45783.step?uuid=b87ab0c5465a48b3a1c9a6dac8d30bc5",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: -0.000012700000070253736, z: -0.65 },
      }}
      {...restProps}
    />
  )
}