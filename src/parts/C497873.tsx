// Paste control: 1:1 stencil apertures for passive pads (default toolchain shrinks to 70% linear).
// Manufacturer drawing audited 2026-10-10, page 2: https://datasheet.lcsc.com/datasheet/pdf/05d470f44ca12348d199deb5c317b252.pdf?productCode=C497873
// Existing imported lands corrected in place; NSMD +0.05 mm and 1:1 paste; courtyard includes maximum body.
// Exact EasyEDA/JLCPCB C497873; observed 2026-10-10T03:23:04.655161+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C497873
import type { InductorProps } from "@tscircuit/props"

export const YSPI0630A_220M = (props: Omit<InductorProps, "inductance">) => {
  return (
    <inductor
      inductance="22uH"
      supplierPartNumbers={{
  "jlcpcb": [
    "C497873"
  ]
}}
      manufacturerPartNumber="YSPI0630A-220M"
      footprint={<footprint>
        <smtpad solderPasteMargin={0} portHints={["pin2"]} pcbX="2.75mm" pcbY="0mm" width="1.8mm" height="3.4mm" shape="rect" solderMaskMargin="0.05mm" />
<smtpad solderPasteMargin={0} portHints={["pin1"]} pcbX="-2.75mm" pcbY="0mm" width="1.8mm" height="3.4mm" shape="rect" solderMaskMargin="0.05mm" />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":3.55,"y":1.9889999999999992},{"x":3.55,"y":3.3659999999999983},{"x":-3.55,"y":3.3659999999999983}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-3.55,"y":-1.9889999999999992},{"x":-3.55,"y":-3.3659999999999983},{"x":3.55,"y":-3.3659999999999983},{"x":3.55,"y":-1.9889999999999992}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-3.55,"y":3.3659999999999983},{"x":-3.55,"y":1.9889999999999992}]} />
<silkscreentext text="{NAME}" pcbX="0mm" pcbY="4.302mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-4.05,"y":3.8},{"x":4.05,"y":3.8},{"x":4.05,"y":-3.8},{"x":-4.05,"y":-3.8},{"x":-4.05,"y":3.8}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C497873.obj?uuid=0b2f3a6975f24ed8b415db8419764f7a",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C497873.step?uuid=0b2f3a6975f24ed8b415db8419764f7a",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: 0.000500000000000167, z: 0 },
      }}
      {...props}
    />
  )
}