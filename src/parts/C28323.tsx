// Manufacturer Samsung 2012 ±0.10 row audited 2026-10-10, page 48: https://www.samsungsem.com/resources/file/kr/support/product_catalog/MLCC_2512.pdf
// Existing import corrected in place; 1:1 paste, NSMD +0.05 mm, max-body courtyard and ≥0.155 mm own-mask silk clearance.
// Exact EasyEDA/JLCPCB C28323; observed 2026-10-10T04:58:36.972204+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C28323
import type { CapacitorProps } from "@tscircuit/props"

export const CL21B105KBFNNNE = (props: Omit<CapacitorProps, "capacitance">) => {
  const { name = "C1", ...restProps } = props

  return (
    <capacitor
      name={name}
      capacitance="1uF"
      supplierPartNumbers={{
  "jlcpcb": [
    "C28323"
  ]
}}
      manufacturerPartNumber="CL21B105KBFNNNE"
      footprint={<footprint>
        <smtpad solderPasteMargin={0} solderMaskMargin="0.05mm" portHints={["pin2"]} pcbX="0.885mm" pcbY="0mm" width="0.93mm" height="1.30mm" shape="rect" />
<smtpad solderPasteMargin={0} solderMaskMargin="0.05mm" portHints={["pin1"]} pcbX="-0.885mm" pcbY="0mm" width="0.93mm" height="1.30mm" shape="rect" />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":1.8111977999999453,"y":0.930713149999969},{"x":0.4011929999999211,"y":0.930713149999969}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":0.4011929999999211,"y":-0.930713149999969},{"x":1.8111977999999453,"y":-0.930713149999969}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":1.9635978000000023,"y":-0.7737411500000275},{"x":1.9635978000000023,"y":0.7737411500000275}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-1.811197800000059,"y":0.930713149999969},{"x":-0.40119300000003477,"y":0.930713149999969}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-0.40119300000003477,"y":-0.930713149999969},{"x":-1.811197800000059,"y":-0.930713149999969}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-1.9635978000000023,"y":-0.7737411500000275},{"x":-1.9635978000000023,"y":0.7737411500000275}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":1.8111977999999453,"y":-0.9307131499997348},{"x":1.918960873452761,"y":-0.8847371156561934},{"x":1.9635977999998886,"y":-0.7737411500000275}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":1.9635977999998886,"y":0.7737411500000275},{"x":1.918960873452761,"y":0.8847371156563105},{"x":1.8111977999999453,"y":0.9307131499998519}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-1.811197800000059,"y":-0.9307131499997348},{"x":-1.9189608734528747,"y":-0.8847371156561934},{"x":-1.9635978000000023,"y":-0.7737411500000275}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-1.9635978000000023,"y":0.7737411500000275},{"x":-1.9189608734528747,"y":0.8847371156563105},{"x":-1.811197800000059,"y":0.9307131499998519}]} />
<silkscreentext text="{NAME}" pcbX="0.0127mm" pcbY="1.9144mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-1.6,"y":0.925},{"x":1.6,"y":0.925},{"x":1.6,"y":-0.925},{"x":-1.6,"y":-0.925},{"x":-1.6,"y":0.925}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C28323.obj?uuid=b87ab0c5465a48b3a1c9a6dac8d30bc5",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C28323.step?uuid=b87ab0c5465a48b3a1c9a6dac8d30bc5",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: -0.000012700000070253736, z: -0.65 },
      }}
      {...restProps}
    />
  )
}