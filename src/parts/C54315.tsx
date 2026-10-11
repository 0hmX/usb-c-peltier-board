// Cosmetic outline omitted to meet 0.15 mm mask clearance; imported copper, courtyard and ref retained.
// Datasheet review: imported copper geometry corrected in place; explicit mask +0.05 mm and controlled paste.
// Paste control: 1:1 stencil apertures for passive pads (default toolchain shrinks to 70% linear).
// Exact EasyEDA/JLCPCB C54315; observed 2026-10-10T03:25:19.686637+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C54315
import type { ResistorProps } from "@tscircuit/props"

export const A_25121WF1001T4E = (props: Omit<ResistorProps, "resistance">) => {
  const { name = "R1", ...restProps } = props

  return (
    <resistor
      name={name}
      resistance="1kohm"
      supplierPartNumbers={{
  "jlcpcb": [
    "C54315"
  ]
}}
      manufacturerPartNumber="25121WF1001T4E"
      footprint={<footprint>
        <smtpad solderMaskMargin="0.05mm" solderPasteMargin={0} portHints={["pin2"]} pcbX="3.3mm" pcbY="0mm" width="1.6mm" height="3.3mm" shape="rect" />
<smtpad solderMaskMargin="0.05mm" solderPasteMargin={0} portHints={["pin1"]} pcbX="-3.3mm" pcbY="0mm" width="1.6mm" height="3.3mm" shape="rect" />
<courtyardoutline outline={[{"x":-4.35,"y":2.1},{"x":4.35,"y":2.1},{"x":4.35,"y":-2.1},{"x":-4.35,"y":-2.1},{"x":-4.35,"y":2.1}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C54315.obj?uuid=311a5ea298274ff3b9740151e78a7465",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C54315.step?uuid=311a5ea298274ff3b9740151e78a7465",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0.000012700000070253736, y: 0, z: 0 },
      }}
      {...restProps}
    />
  )
}