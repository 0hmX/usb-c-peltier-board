// Paste control: 1:1 stencil apertures for passive pads (default toolchain shrinks to 70% linear).
// Exact EasyEDA/JLCPCB C576517; observed 2026-10-10T03:28:47.973259+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C576517
import type { CapacitorProps } from "@tscircuit/props"

export const GRM32EC72A106KE05L = (props: Omit<CapacitorProps, "capacitance">) => {
  const { name = "C1", ...restProps } = props

  return (
    <capacitor
      name={name}
      capacitance="10uF"
      supplierPartNumbers={{
  "jlcpcb": [
    "C576517"
  ]
}}
      manufacturerPartNumber="GRM32EC72A106KE05L"
      footprint={<footprint>
        <smtpad solderPasteMargin={0} portHints={["pin2"]} pcbX="1.517396mm" pcbY="0mm" width="1.634998mm" height="2.6999946mm" shape="rect" />
<smtpad solderPasteMargin={0} portHints={["pin1"]} pcbX="-1.517396mm" pcbY="0mm" width="1.634998mm" height="2.6999946mm" shape="rect" />
<courtyardoutline outline={[{"x":-2.584895000000188,"y":1.599997300000041},{"x":2.584895000000074,"y":1.599997300000041},{"x":2.584895000000074,"y":-1.599997300000041},{"x":-2.584895000000188,"y":-1.599997300000041},{"x":-2.584895000000188,"y":1.599997300000041}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C576517.obj?uuid=0f62590f50b54fa48364a4157b2b6286",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C576517.step?uuid=0f62590f50b54fa48364a4157b2b6286",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: -0.000012700000070253736, z: -1.25 },
      }}
      {...restProps}
    />
  )
}