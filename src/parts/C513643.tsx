// Cosmetic outline omitted to meet 0.15 mm mask clearance; imported copper, courtyard and ref retained.
// Datasheet review: imported copper geometry corrected in place; explicit mask +0.05 mm and controlled paste.
// Paste control: 1:1 stencil apertures for passive pads (default toolchain shrinks to 70% linear).
// Exact EasyEDA/JLCPCB C513643; observed 2026-10-10T03:23:04.012289+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C513643
import type { ResistorProps } from "@tscircuit/props"

export const RC2512FK_07470RL = (props: Omit<ResistorProps, "resistance">) => {
  const { name = "R1", ...restProps } = props

  return (
    <resistor
      name={name}
      resistance="470ohm"
      supplierPartNumbers={{
  "jlcpcb": [
    "C513643"
  ]
}}
      manufacturerPartNumber="RC2512FK-07470RL"
      footprint={<footprint>
        <smtpad solderMaskMargin="0.05mm" solderPasteMargin={0} portHints={["pin2"]} pcbX="3.1mm" pcbY="0mm" width="1.8mm" height="4mm" shape="rect" />
<smtpad solderMaskMargin="0.05mm" solderPasteMargin={0} portHints={["pin1"]} pcbX="-3.1mm" pcbY="0mm" width="1.8mm" height="4mm" shape="rect" />
<silkscreentext text="{NAME}" pcbX="0mm" pcbY="2.9558mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-4.45,"y":2.35},{"x":4.45,"y":2.35},{"x":4.45,"y":-2.35},{"x":-4.45,"y":-2.35},{"x":-4.45,"y":2.35}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C513643.obj?uuid=311a5ea298274ff3b9740151e78a7465",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C513643.step?uuid=311a5ea298274ff3b9740151e78a7465",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0.000012700000070253736, y: 0, z: 0 },
      }}
      {...restProps}
    />
  )
}