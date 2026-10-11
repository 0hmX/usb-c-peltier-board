// Exact EasyEDA/JLCPCB C51205; observed 2026-10-10T03:49:59.336517+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C51205
import type { CapacitorProps } from "@tscircuit/props"

export const CL31B475KBHNNNE = (props: Omit<CapacitorProps, "capacitance">) => {
  const { name = "C1", ...restProps } = props

  return (
    <capacitor
      name={name}
      capacitance="4.7uF"
      supplierPartNumbers={{
  "jlcpcb": [
    "C51205"
  ]
}}
      manufacturerPartNumber="CL31B475KBHNNNE"
      footprint={<footprint>
        <smtpad portHints={["pin2"]} pcbX="1.59258mm" pcbY="0mm" width="1.485011mm" height="1.7279874mm" shape="rect" />
<smtpad portHints={["pin1"]} pcbX="-1.59258mm" pcbY="0mm" width="1.485011mm" height="1.7279874mm" shape="rect" />
<courtyardoutline outline={[{"x":-2.585085499999991,"y":1.1139937000000373},{"x":2.5850854999998774,"y":1.1139937000000373},{"x":2.5850854999998774,"y":-1.1139937000000373},{"x":-2.585085499999991,"y":-1.1139937000000373},{"x":-2.585085499999991,"y":1.1139937000000373}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C51205.obj?uuid=c6790e9475e1483991d2c64340b24e96",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C51205.step?uuid=c6790e9475e1483991d2c64340b24e96",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: 0, z: -0.65 },
      }}
      {...restProps}
    />
  )
}