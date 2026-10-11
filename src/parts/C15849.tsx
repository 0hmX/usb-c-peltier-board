// Paste control: 1:1 stencil apertures for passive pads (default toolchain shrinks to 70% linear).
// Manufacturer drawing audited 2026-10-10, page 48: https://www.samsungsem.com/resources/file/kr/support/product_catalog/MLCC_2512.pdf
// Existing imported lands corrected in place; NSMD +0.05 mm and 1:1 paste; courtyard includes maximum body.
// Exact EasyEDA/JLCPCB C15849; observed 2026-10-10T03:21:00.777268+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C15849
import type { CapacitorProps } from "@tscircuit/props"

export const CL10A105KB8NNNC = (props: Omit<CapacitorProps, "capacitance">) => {
  const { name = "C1", ...restProps } = props

  return (
    <capacitor
      name={name}
      capacitance="1uF"
      supplierPartNumbers={{
  "jlcpcb": [
    "C15849"
  ]
}}
      manufacturerPartNumber="CL10A105KB8NNNC"
      footprint={<footprint>
        <smtpad solderPasteMargin={0} portHints={["pin2"]} pcbX="0.72mm" pcbY="0mm" width="0.76mm" height="0.85mm" shape="rect" solderMaskMargin="0.05mm" />
<smtpad solderPasteMargin={0} portHints={["pin1"]} pcbX="-0.72mm" pcbY="0mm" width="0.76mm" height="0.85mm" shape="rect" solderMaskMargin="0.05mm" />
<courtyardoutline outline={[{"x":-1.35,"y":0.7},{"x":1.35,"y":0.7},{"x":1.35,"y":-0.7},{"x":-1.35,"y":-0.7},{"x":-1.35,"y":0.7}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C15849.obj?uuid=ac9b32e974bc448eab36b1293f859dcb",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C15849.step?uuid=ac9b32e974bc448eab36b1293f859dcb",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: 0, z: -0.4 },
      }}
      {...restProps}
    />
  )
}