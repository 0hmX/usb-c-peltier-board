// Silkscreen DFM: 0.15 mm strokes; interrupted sides clear mask by at least 0.175 mm.
// Imported EasyEDA/JLCPCB C49073699; observed 2026-10-10T03:20:58.806660+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C49073699
// Datasheet correction in place: Coilank APSW-H p1 APS1360 F14.2 G5.0 H8.0 mm.
// Exact APS source: https://atta.szlcsc.com/upload/public/pdf/source/20250415/98335F58913C6052021A459C2E812D31.pdf
// Lands now 3.1 x 5.0 mm, centers +/-5.55 mm; preserve both imported terminals.
import type { InductorProps } from "@tscircuit/props"

export const APS1360M6R8H = (props: Omit<InductorProps, "inductance">) => {
  return (
    <inductor
      inductance="6.8uH"
      supplierPartNumbers={{
  "jlcpcb": [
    "C49073699"
  ]
}}
      manufacturerPartNumber="APS1360M6R8H"
      footprint={<footprint>
        <smtpad solderPasteMargin={0} solderMaskMargin={0.05} portHints={["pin1"]} pcbX="-5.55mm" pcbY="0mm" width="3.1mm" height="5mm" shape="rect" />
<smtpad solderPasteMargin={0} solderMaskMargin={0.05} portHints={["pin2"]} pcbX="5.55mm" pcbY="0mm" width="3.1mm" height="5mm" shape="rect" />
<courtyardoutline outline={[{"x":-7.806627000000049,"y":6.549200000000155},{"x":7.7809729999999035,"y":6.549200000000155},{"x":7.7809729999999035,"y":-6.574599999999805},{"x":-7.806627000000049,"y":-6.574599999999805},{"x":-7.806627000000049,"y":6.549200000000155}]} />
      </footprint>}
      
      {...props}
    />
  )
}
