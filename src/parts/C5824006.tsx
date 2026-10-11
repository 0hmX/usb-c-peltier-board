// Silkscreen DFM: 0.15 mm strokes; omit tight cosmetic paths, retaining clear pin-1 marks.
// Imported EasyEDA/JLCPCB C5824006; observed 2026-10-10T03:21:00.008403+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C5824006
// Datasheet correction in place: Yageo PA_E Jan31 2018 V10 p7 Table6, 8mohm row: A7.36 B4.06 C1.65 D3.68 mm.
// Lands are 1.65 x 3.68 mm, centers +/-2.855 mm; preserve imported numbering for Kelvin reference.
import type { ResistorProps } from "@tscircuit/props"

export const PA2512FKE7W0R008E = (props: Omit<ResistorProps, "resistance">) => {
  const { name = "R1", ...restProps } = props

  return (
    <resistor
      name={name}
      resistance="8mohm"
      supplierPartNumbers={{
  "jlcpcb": [
    "C5824006"
  ]
}}
      manufacturerPartNumber="PA2512FKE7W0R008E"
      footprint={<footprint>
        <smtpad solderPasteMargin={0} solderMaskMargin={0.05} portHints={["pin2"]} pcbX="2.855mm" pcbY="0mm" width="1.65mm" height="3.68mm" shape="rect" />
<smtpad solderPasteMargin={0} solderMaskMargin={0.05} portHints={["pin1"]} pcbX="-2.855mm" pcbY="0mm" width="1.65mm" height="3.68mm" shape="rect" />
<silkscreentext text="{NAME}" pcbX="0mm" pcbY="2.9558mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-3.957549100000051,"y":1.9780001000000311},{"x":3.9575490999999374,"y":1.9780001000000311},{"x":3.9575490999999374,"y":-1.9780001000000311},{"x":-3.957549100000051,"y":-1.9780001000000311},{"x":-3.957549100000051,"y":1.9780001000000311}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C5824006.obj?uuid=311a5ea298274ff3b9740151e78a7465",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C5824006.step?uuid=311a5ea298274ff3b9740151e78a7465",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0.000012700000070253736, y: 0, z: 0 },
      }}
      {...restProps}
    />
  )
}
