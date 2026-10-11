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
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-0.2801873999999316,"y":-0.8621328959997995},{"x":-1.080160400000068,"y":-0.8621328959997995}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":0.28026359999989836,"y":-0.8626883939998335},{"x":1.080236599999921,"y":-0.8626883939998335}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-0.2801873999999316,"y":0.8627809770000694},{"x":-1.080160400000068,"y":0.8627809770000694}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":0.28026359999989836,"y":0.8621946180001409},{"x":1.080236599999921,"y":0.8621946180001409}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-1.3899134000000686,"y":-0.48569041800011675},{"x":-1.3899134000000686,"y":0.4863693600000049}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":1.3900149999998348,"y":0.4857212790000112},{"x":1.3900149999998348,"y":-0.4863076379999397}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":1.080185799999981,"y":0.8621946180001409},{"x":1.299277109074751,"y":0.7519262581328309},{"x":1.3900149999998348,"y":0.4857212790000112}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":1.3900149999998348,"y":-0.4862459160001508},{"x":1.2992681283295724,"y":-0.7524309449204651},{"x":1.080185799999981,"y":-0.8626883939998335}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-1.0801096000000143,"y":-0.8621328959997995},{"x":-1.2991755087698493,"y":-0.7518645365035053},{"x":-1.3899134000000686,"y":-0.48569041800011675}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-1.3899134000000686,"y":0.4862767770000453},{"x":-1.2991934705021322,"y":0.7524907954811811},{"x":-1.0801096000000143,"y":0.8627809770000694}]} />
<silkscreentext text="{NAME}" pcbX="-0.0127mm" pcbY="1.7112mm" anchorAlignment="center" fontSize="1mm" />
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