// Datasheet review: imported copper geometry corrected in place; explicit mask +0.05 mm and controlled paste.
// Symbol correction: BAT54A common anode pin3; pin1/2 cathodes. Manufacturer: https://assets.nexperia.com/documents/data-sheet/BAT54A.pdf
// Exact EasyEDA/JLCPCB C130910; observed 2026-10-10T03:23:57.281177+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C130910
import { Fragment } from "react"
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["K1"],
  pin2: ["K2"],
  pin3: ["A"]
} as const

const dualSchottkySymbol = <symbol>
  <port name="K1" pinNumber={1} aliases={["pin1"]} direction="right" schX={1} schY={0.5} schStemLength={0.2} />
  <port name="K2" pinNumber={2} aliases={["pin2"]} direction="right" schX={1} schY={-0.5} schStemLength={0.2} />
  <port name="A" pinNumber={3} aliases={["pin3"]} direction="left" schX={-1} schY={0} schStemLength={0.2} />
  <schematicpath points={[{x:-0.8,y:0},{x:-0.45,y:0},{x:-0.45,y:0.5},{x:-0.25,y:0.5}]} />
  <schematicpath points={[{x:-0.45,y:0},{x:-0.45,y:-0.5},{x:-0.25,y:-0.5}]} />
  {[0.5,-0.5].map(y => <Fragment key={y}>
    <schematicpath points={[{x:-0.25,y:y+0.22},{x:0.2,y},{x:-0.25,y:y-0.22},{x:-0.25,y:y+0.22}]} />
    <schematicpath points={[{x:0.32,y:y+0.28},{x:0.2,y:y+0.28},{x:0.2,y:y-0.28},{x:0.08,y:y-0.28}]} />
    <schematicpath points={[{x:0.2,y},{x:0.8,y}]} />
  </Fragment>)}
  <schematictext schX={0} schY={1} text="{NAME}" fontSize={0.2} />
</symbol>

export const BAT54A_215 = (props: ChipProps<typeof pinLabels>) => {
  const { connections, noConnect, pinLabels: _, children, ...partProps } = props
  return (
    <diode
      schottky
      symbol={dualSchottkySymbol}
      supplierPartNumbers={{
  "jlcpcb": [
    "C130910"
  ]
}}
      manufacturerPartNumber="BAT54A,215"
      footprint={<footprint>
        <smtpad solderMaskMargin="0.05mm" solderPasteMargin={-0.05} portHints={["pin1"]} pcbX="1mm" pcbY="-0.95mm" width="0.7mm" height="0.6mm" shape="rect" />
<smtpad solderMaskMargin="0.05mm" solderPasteMargin={-0.05} portHints={["pin2"]} pcbX="1mm" pcbY="0.95mm" width="0.7mm" height="0.6mm" shape="rect" />
<smtpad solderMaskMargin="0.05mm" solderPasteMargin={-0.05} portHints={["pin3"]} pcbX="-1mm" pcbY="0mm" width="0.7mm" height="0.6mm" shape="rect" />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":0.8586978000000727,"y":1.65},{"x":-0.8586978000000727,"y":1.65},{"x":-0.8586978000000727,"y":0.7}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":0.8586978000000727,"y":-1.65},{"x":-0.8586978000000727,"y":-1.65},{"x":-0.8586978000000727,"y":-0.7}]} />
<silkscreencircle pcbX="0mm" pcbY="-0.95mm" radius="0.075mm" strokeWidth="0.15mm" />
<courtyardoutline outline={[{"x":-1.87,"y":1.75},{"x":1.87,"y":1.75},{"x":1.87,"y":-1.75},{"x":-1.87,"y":-1.75},{"x":-1.87,"y":1.75}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C130910.obj?uuid=cefd4596db214da394d9632b2b88f8f2",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C130910.step?uuid=cefd4596db214da394d9632b2b88f8f2",
        pcbRotationOffset: 90,
        modelOriginPosition: { x: -0.000012700000070253736, y: 0, z: 0 },
      }}
      {...partProps}
      pinAttributes={{ pin1: { isPassive: true }, pin2: { isPassive: true }, pin3: { isPassive: true },
        ...props.pinAttributes,
        ...Object.fromEntries((noConnect ?? []).map(pin => [pin, { ...props.pinAttributes?.[pin], doNotConnect: true }])) }}
    >
      {children}
      {/* Native diode connections only accept two pins; this package has three. */}
      {Object.entries(connections ?? {}).flatMap(([pin, targets]) =>
        (typeof targets === "string" ? [targets] : targets ?? []).map((to, i) =>
          <Fragment key={`${pin}-${i}`}><trace from={`.${props.name} > .${pin}`} to={to} /></Fragment>))}
    </diode>
  )
}
