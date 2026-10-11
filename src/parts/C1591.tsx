// Paste control: 1:1 stencil apertures for passive pads (default toolchain shrinks to 70% linear).
// Exact EasyEDA/JLCPCB C1591; observed 2026-10-10T03:21:00.824001+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C1591
import type { CapacitorProps } from "@tscircuit/props"

export const CL10B104KB8NNNC = (props: Omit<CapacitorProps, "capacitance">) => {
  const { name = "C1", ...restProps } = props

  return (
    <capacitor
      name={name}
      capacitance="100nF"
      supplierPartNumbers={{
  "jlcpcb": [
    "C1591"
  ]
}}
      manufacturerPartNumber="CL10B104KB8NNNC"
      footprint={<footprint>
        <smtpad solderPasteMargin={0} portHints={["pin2"]} pcbX="0.700024mm" pcbY="0mm" width="0.7999984mm" height="0.8999982mm" shape="rect" />
<smtpad solderPasteMargin={0} portHints={["pin1"]} pcbX="-0.700024mm" pcbY="0mm" width="0.7999984mm" height="0.8999982mm" shape="rect" />
<courtyardoutline outline={[{"x":-1.3500232000000096,"y":0.6999991000000136},{"x":1.350023199999896,"y":0.6999991000000136},{"x":1.350023199999896,"y":-0.6999991000000136},{"x":-1.3500232000000096,"y":-0.6999991000000136},{"x":-1.3500232000000096,"y":0.6999991000000136}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C1591.obj?uuid=ac9b32e974bc448eab36b1293f859dcb",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C1591.step?uuid=ac9b32e974bc448eab36b1293f859dcb",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: 0, z: -0.4 },
      }}
      {...restProps}
    />
  )
}