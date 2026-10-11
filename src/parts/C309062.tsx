// Paste control: 1:1 stencil apertures for passive pads (default toolchain shrinks to 70% linear).
// Manufacturer drawing audited 2026-10-10, page 48: https://www.samsungsem.com/resources/file/kr/support/product_catalog/MLCC_2512.pdf
// Existing imported lands corrected in place; NSMD +0.05 mm and 1:1 paste; courtyard includes maximum body.
// Exact EasyEDA/JLCPCB C309062; observed 2026-10-10T03:21:01.404873+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C309062
import type { CapacitorProps } from "@tscircuit/props"

export const CL32B226KAJNNNE = (props: Omit<CapacitorProps, "capacitance">) => {
  const { name = "C1", ...restProps } = props

  return (
    <capacitor
      name={name}
      capacitance="22uF"
      supplierPartNumbers={{
  "jlcpcb": [
    "C309062"
  ]
}}
      manufacturerPartNumber="CL32B226KAJNNNE"
      footprint={<footprint>
        <smtpad solderPasteMargin={0} portHints={["pin2"]} pcbX="1.565mm" pcbY="0mm" width="1.38mm" height="2.75mm" shape="rect" solderMaskMargin="0.05mm" />
<smtpad solderPasteMargin={0} portHints={["pin1"]} pcbX="-1.565mm" pcbY="0mm" width="1.38mm" height="2.75mm" shape="rect" solderMaskMargin="0.05mm" />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":2.5635965999999826,"y":-1.497520499999966},{"x":2.5635965999999826,"y":1.4975205000000855}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":2.4111966000000393,"y":1.6575405000000256},{"x":0.7761985999999297,"y":1.6575405000000256}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":0.7761985999999297,"y":-1.6575405000000256},{"x":2.4111966000000393,"y":-1.6575405000000256}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-2.411196600000153,"y":1.6575405000000256},{"x":-0.7761986000000434,"y":1.6575405000000256}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-0.7761986000000434,"y":-1.6575405000000256},{"x":-2.411196600000153,"y":-1.6575405000000256}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-2.5635966000000963,"y":-1.497520499999966},{"x":-2.5635966000000963,"y":1.4975205000000855}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":2.4111966000000393,"y":-1.6575405000000256},{"x":2.518959673452855,"y":-1.6106717271254223},{"x":2.5635965999999826,"y":-1.497520499999966}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":2.5635965999999826,"y":1.4975205000000855},{"x":2.518959673452855,"y":1.6106717271255417},{"x":2.4111966000000393,"y":1.6575405000000256}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-2.411196600000153,"y":-1.6575405000000256},{"x":-2.5189596734529687,"y":-1.6106717271254223},{"x":-2.5635966000000963,"y":-1.497520499999966}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-2.5635966000000963,"y":1.4975205000000855},{"x":-2.5189596734529687,"y":1.6106717271255417},{"x":-2.411196600000153,"y":1.6575405000000256}]} />
<silkscreentext text="{NAME}" pcbX="0mm" pcbY="2.5748mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-2.51,"y":1.625},{"x":2.51,"y":1.625},{"x":2.51,"y":-1.625},{"x":-2.51,"y":-1.625},{"x":-2.51,"y":1.625}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C309062.obj?uuid=0f62590f50b54fa48364a4157b2b6286",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C309062.step?uuid=0f62590f50b54fa48364a4157b2b6286",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: -0.000012700000070253736, z: -1.25 },
      }}
      {...restProps}
    />
  )
}