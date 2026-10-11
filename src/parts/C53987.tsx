// Paste control: 1:1 stencil apertures for passive pads (default toolchain shrinks to 70% linear).
// Manufacturer drawing audited 2026-10-10, page 28: https://www.fhcomp.com/uploads/20260922/110408_%E9%80%9A%E7%94%A8%E5%9E%8B%E7%B3%BB%E5%88%97%E5%A4%9A%E5%B1%82%E7%89%87%E5%BC%8F%E9%99%B6%E7%93%B7%E7%94%B5%E5%AE%B9%E5%99%A8-A0006.pdf
// Existing imported lands corrected in place; NSMD +0.05 mm and 1:1 paste; courtyard includes maximum body.
// Exact EasyEDA/JLCPCB C53987; observed 2026-10-10T03:23:03.439878+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C53987
import type { CapacitorProps } from "@tscircuit/props"

export const A_0603B472K500NT = (props: Omit<CapacitorProps, "capacitance">) => {
  const { name = "C1", ...restProps } = props

  return (
    <capacitor
      name={name}
      capacitance="4.7nF"
      supplierPartNumbers={{
  "jlcpcb": [
    "C53987"
  ]
}}
      manufacturerPartNumber="0603B472K500NT"
      footprint={<footprint>
        <smtpad solderPasteMargin={0} portHints={["pin2"]} pcbX="0.675mm" pcbY="0mm" width="0.65mm" height="0.75mm" shape="rect" solderMaskMargin="0.05mm" />
<smtpad solderPasteMargin={0} portHints={["pin1"]} pcbX="-0.675mm" pcbY="0mm" width="0.65mm" height="0.75mm" shape="rect" solderMaskMargin="0.05mm" />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-0.2801873999999316,"y":-0.7095743999998376},{"x":-1.080160400000068,"y":-0.7095743999998376}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":0.28026359999989836,"y":-0.7100315999998656},{"x":1.080236599999921,"y":-0.7100315999998656}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-0.2801873999999316,"y":0.7101078000000598},{"x":-1.080160400000068,"y":0.7101078000000598}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":0.28026359999989836,"y":0.7096252000001186},{"x":1.080236599999921,"y":0.7096252000001186}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-1.3899134000000686,"y":-0.3997452000000976},{"x":-1.3899134000000686,"y":0.40030400000000554}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":1.3900149999998348,"y":0.39977060000001075},{"x":1.3900149999998348,"y":-0.4002531999999519}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":1.080185799999981,"y":0.7096252000001186},{"x":1.299277109074751,"y":0.6188693482574763},{"x":1.3900149999998348,"y":0.39977060000001075}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":1.3900149999998348,"y":-0.40020240000012564},{"x":1.2992681283295724,"y":-0.6192847283296032},{"x":1.080185799999981,"y":-0.7100315999998656}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-1.0801096000000143,"y":-0.7095743999998376},{"x":-1.2991755087698493,"y":-0.6188185485625581},{"x":-1.3899134000000686,"y":-0.3997452000000976}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-1.3899134000000686,"y":0.40022780000003877},{"x":-1.2991934705021322,"y":0.6193339880503572},{"x":-1.0801096000000143,"y":0.7101078000000598}]} />
<silkscreentext text="{NAME}" pcbX="-0.0127mm" pcbY="1.7112mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-1.25,"y":0.7},{"x":1.25,"y":0.7},{"x":1.25,"y":-0.7},{"x":-1.25,"y":-0.7},{"x":-1.25,"y":0.7}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C53987.obj?uuid=ac9b32e974bc448eab36b1293f859dcb",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C53987.step?uuid=ac9b32e974bc448eab36b1293f859dcb",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: 0, z: -0.4 },
      }}
      {...restProps}
    />
  )
}