// Paste control: 1:1 stencil apertures for passive pads (default toolchain shrinks to 70% linear).
// Manufacturer drawing audited 2026-10-10, page 11: https://img.pcbx.com/erp/file/part/spec/CC0201CRNPO9BN5R6-Yageo.pdf
// Existing imported lands corrected in place; NSMD +0.05 mm and 1:1 paste; courtyard includes maximum body.
// Exact EasyEDA/JLCPCB C14663; observed 2026-10-10T03:21:00.696553+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C14663
import type { CapacitorProps } from "@tscircuit/props"

export const CC0603KRX7R9BB104 = (props: Omit<CapacitorProps, "capacitance">) => {
  const { name = "C1", ...restProps } = props

  return (
    <capacitor
      name={name}
      capacitance="100nF"
      supplierPartNumbers={{
  "jlcpcb": [
    "C14663"
  ]
}}
      manufacturerPartNumber="CC0603KRX7R9BB104"
      footprint={<footprint>
        <smtpad solderPasteMargin={0} portHints={["pin2"]} pcbX="0.7mm" pcbY="0mm" width="0.8mm" height="0.9mm" shape="rect" solderMaskMargin="0.05mm" />
<smtpad solderPasteMargin={0} portHints={["pin1"]} pcbX="-0.7mm" pcbY="0mm" width="0.8mm" height="0.9mm" shape="rect" solderMaskMargin="0.05mm" />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-0.2801873999999316,"y":-0.9011594879997897},{"x":-1.080160400000068,"y":-0.9011594879997897}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":0.28026359999989836,"y":-0.9017401319998253},{"x":1.080236599999921,"y":-0.9017401319998253}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-0.2801873999999316,"y":0.9018369060000718},{"x":-1.080160400000068,"y":0.9018369060000718}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":0.28026359999989836,"y":0.9012240040001466},{"x":1.080236599999921,"y":0.9012240040001466}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-1.3899134000000686,"y":-0.5076764040001217},{"x":-1.3899134000000686,"y":0.5083860800000047}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":1.3900149999998348,"y":0.5077086620000113},{"x":1.3900149999998348,"y":-0.5083215639999367}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":1.080185799999981,"y":0.9012240040001466},{"x":1.299277109074751,"y":0.7859640722869914},{"x":1.3900149999998348,"y":0.5077086620000113}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":1.3900149999998348,"y":-0.5082570480001573},{"x":1.2992681283295724,"y":-0.7864916049785925},{"x":1.080185799999981,"y":-0.9017401319998253}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-1.0801096000000143,"y":-0.9011594879997897},{"x":-1.2991755087698493,"y":-0.7858995566744452},{"x":-1.3899134000000686,"y":-0.5076764040001217}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-1.3899134000000686,"y":0.508289306000047},{"x":-1.2991934705021322,"y":0.7865541648239501},{"x":-1.0801096000000143,"y":0.9018369060000718}]} />
<silkscreentext text="{NAME}" pcbX="-0.0127mm" pcbY="1.7112mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-1.35,"y":0.75},{"x":1.35,"y":0.75},{"x":1.35,"y":-0.75},{"x":-1.35,"y":-0.75},{"x":-1.35,"y":0.75}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C14663.obj?uuid=ac9b32e974bc448eab36b1293f859dcb",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C14663.step?uuid=ac9b32e974bc448eab36b1293f859dcb",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: 0, z: -0.4 },
      }}
      {...restProps}
    />
  )
}