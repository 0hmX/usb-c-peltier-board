// Paste control: 1:1 stencil apertures for passive pads (default toolchain shrinks to 70% linear).
// Exact EasyEDA/JLCPCB C13585; observed 2026-10-10T03:21:01.647441+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C13585
import type { CapacitorProps } from "@tscircuit/props"

export const CL31A106KBHNNNE = (props: Omit<CapacitorProps, "capacitance">) => {
  const { name = "C1", ...restProps } = props

  return (
    <capacitor
      name={name}
      capacitance="10uF"
      supplierPartNumbers={{
  "jlcpcb": [
    "C13585"
  ]
}}
      manufacturerPartNumber="CL31A106KBHNNNE"
      footprint={<footprint>
        <smtpad solderPasteMargin={0} portHints={["pin2"]} pcbX="1.59258mm" pcbY="0mm" width="1.485011mm" height="1.7279874mm" shape="rect" />
<smtpad solderPasteMargin={0} portHints={["pin1"]} pcbX="-1.59258mm" pcbY="0mm" width="1.485011mm" height="1.7279874mm" shape="rect" />
<courtyardoutline outline={[{"x":-2.585085499999991,"y":1.1139937000000373},{"x":2.5850854999998774,"y":1.1139937000000373},{"x":2.5850854999998774,"y":-1.1139937000000373},{"x":-2.585085499999991,"y":-1.1139937000000373},{"x":-2.585085499999991,"y":1.1139937000000373}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C13585.obj?uuid=c6790e9475e1483991d2c64340b24e96",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C13585.step?uuid=c6790e9475e1483991d2c64340b24e96",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: 0, z: -0.65 },
      }}
      {...restProps}
    />
  )
}