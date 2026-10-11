// Paste control: 1:1 stencil apertures for passive pads (default toolchain shrinks to 70% linear).
// Manufacturer drawing audited 2026-10-10, page 2: https://datasheet.lcsc.com/datasheet/pdf/a0b12ba9dfe6b9e66b6bb852b7c71c03.pdf?productCode=C167874
// Existing imported lands corrected in place; NSMD +0.05 mm and 1:1 paste; courtyard includes maximum body.
// Exact EasyEDA/JLCPCB C167874; observed 2026-10-10T03:23:04.958047+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C167874
import type { InductorProps } from "@tscircuit/props"

export const FNR4030S4R7MT = (props: Omit<InductorProps, "inductance">) => {
  return (
    <inductor
      inductance="4.7uH"
      supplierPartNumbers={{
  "jlcpcb": [
    "C167874"
  ]
}}
      manufacturerPartNumber="FNR4030S4R7MT"
      footprint={<footprint>
        <smtpad solderPasteMargin={0} portHints={["pin1"]} pcbX="-1.5mm" pcbY="0mm" width="1.1mm" height="3.7mm" shape="rect" solderMaskMargin="0.05mm" />
<smtpad solderPasteMargin={0} portHints={["pin2"]} pcbX="1.5mm" pcbY="0mm" width="1.1mm" height="3.7mm" shape="rect" solderMaskMargin="0.05mm" />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-2.0000214000002643,"y":2.1314699559999597},{"x":1.9999959999997827,"y":2.131495736999987}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-2.0000214000002643,"y":-2.1314699559999597},{"x":1.9999959999997827,"y":-2.1314957369998715}]} />
<silkscreentext text="{NAME}" pcbX="0mm" pcbY="3.1082mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-2.35,"y":2.35},{"x":2.35,"y":2.35},{"x":2.35,"y":-2.35},{"x":-2.35,"y":-2.35},{"x":-2.35,"y":2.35}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C167874.obj?uuid=f10f9856fbf34a8a9250995f07743de3",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C167874.step?uuid=f10f9856fbf34a8a9250995f07743de3",
        pcbRotationOffset: 270,
        modelOriginPosition: { x: 0, y: 0, z: -0.01 },
      }}
      {...props}
    />
  )
}