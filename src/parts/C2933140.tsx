// Cosmetic outline omitted to meet 0.15 mm mask clearance; imported copper, courtyard and ref retained.
// Datasheet review: FOJAN FRC0603F land dimensions; imported footprint edited in place.
// Exact EasyEDA/JLCPCB C2933140; observed 2026-10-10T03:47:51.994388+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C2933140
import type { ResistorProps } from "@tscircuit/props"

export const FRC0603F1332TS = (props: Omit<ResistorProps, "resistance">) => {
  const { name = "R1", ...restProps } = props

  return (
    <resistor
      name={name}
      resistance="13.3kohm"
      supplierPartNumbers={{
  "jlcpcb": [
    "C2933140"
  ]
}}
      manufacturerPartNumber="FRC0603F1332TS"
      footprint={<footprint>
        <smtpad solderMaskMargin="0.05mm" solderPasteMargin={0} portHints={["pin2"]} pcbX="0.8mm" pcbY="0mm" width="0.7mm" height="0.9mm" shape="rect" />
<smtpad solderMaskMargin="0.05mm" solderPasteMargin={0} portHints={["pin1"]} pcbX="-0.8mm" pcbY="0mm" width="0.7mm" height="0.9mm" shape="rect" />
<courtyardoutline outline={[{"x":-1.4066016999998965,"y":0.6820032000000538},{"x":1.4066016999997828,"y":0.6820032000000538},{"x":1.4066016999997828,"y":-0.6820032000000538},{"x":-1.4066016999998965,"y":-0.6820032000000538},{"x":-1.4066016999998965,"y":0.6820032000000538}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C2933140.obj?uuid=6bd5cd867e9542ebae21caaf5d2d4c4d",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C2933140.step?uuid=6bd5cd867e9542ebae21caaf5d2d4c4d",
        pcbRotationOffset: 90,
        modelOriginPosition: { x: -0.004999999999999977, y: 0, z: -0.01 },
      }}
      {...restProps}
    />
  )
}