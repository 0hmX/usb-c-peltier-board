// Exact EasyEDA/JLCPCB C14858; observed 2026-10-10T03:39:34.011677+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C14858
// Manufacturer drawing audited 2026-10-10, page 48: https://www.samsungsem.com/resources/file/kr/support/product_catalog/MLCC_2512.pdf
// Existing imported lands corrected in place; NSMD +0.05 mm and 1:1 paste; courtyard includes maximum body.
import type { CapacitorProps } from "@tscircuit/props"

export const CL10C101JB8NNNC = (props: Omit<CapacitorProps, "capacitance">) => {
  const { name = "C1", ...restProps } = props

  return (
    <capacitor
      name={name}
      capacitance="100pF"
      supplierPartNumbers={{
  "jlcpcb": [
    "C14858"
  ]
}}
      manufacturerPartNumber="CL10C101JB8NNNC"
      footprint={<footprint>
        <smtpad solderPasteMargin={0} portHints={["pin2"]} pcbX="0.72mm" pcbY="0mm" width="0.76mm" height="0.85mm" shape="rect" solderMaskMargin="0.05mm" />
<smtpad solderPasteMargin={0} portHints={["pin1"]} pcbX="-0.72mm" pcbY="0mm" width="0.76mm" height="0.85mm" shape="rect" solderMaskMargin="0.05mm" />
<courtyardoutline outline={[{"x":-1.35,"y":0.7},{"x":1.35,"y":0.7},{"x":1.35,"y":-0.7},{"x":-1.35,"y":-0.7},{"x":-1.35,"y":0.7}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C14858.obj?uuid=ac9b32e974bc448eab36b1293f859dcb",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C14858.step?uuid=ac9b32e974bc448eab36b1293f859dcb",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: 0, z: -0.4 },
      }}
      {...restProps}
    />
  )
}