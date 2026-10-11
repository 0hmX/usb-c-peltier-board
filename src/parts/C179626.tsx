// Silkscreen DFM: 0.15 mm strokes; omit tight cosmetic paths, retaining clear pin-1 marks.
// Imported EasyEDA/JLCPCB C179626; observed 2026-10-10T03:21:00.027208+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C179626
// In-place coordinate normalization: drain polygon center pcbY=0.9825 mm; vertices made pad-local.
// Origin normalization fixes core PCB/CPL bounds; exact onsemi p6 CASE488AA lands corrected in place.
// Drain notch 0.475 mm (imported 0.500); drain-to-lead gap 0.965 mm (imported 0.985).
import { Fragment } from "react"
import type { ChipProps } from "@tscircuit/props"

// onsemi SO8FL AND8195/D p2: 0.076 mm NSMD mask relief on every pad.
// The production exporter must honor polygon relief; raw exporter ignores it.
// Assembly adaptation for core 0.0.2123: its public polygon array importer
// ignores pad origins. Preserve this normalized copper/CPL origin; prepare-assembly
// replaces ONLY pin5 paste with these nine vented apertures before Gerber export.
// Source render alone has a full drain aperture and is not the production stencil.
// onsemi SO8FL AND8195/D p3: typical 60–80% drain paste; chosen 1.40 x 1.10 mm windows (68.9578%).
export const fetDrainPasteWindows = {
  jlcpcbPartNumber: "C179626",
  pin: 5,
  windows: [-1.5, 0, 1.5].flatMap(x => [-0.45, 0.8, 2.05].map(y => ({ x, y, width: 1.4, height: 1.1 }))),
  coverageRange: [0.6, 0.8],
} as const

const pinLabels = {
  pin1: ["S3"],
  pin2: ["S2"],
  pin3: ["S1"],
  pin4: ["G"],
  pin5: ["D"]
} as const

export const NTMFS5C670NLT1G = (props: ChipProps<typeof pinLabels>) => {
  const { connections, noConnect, children, ...partProps } = props
  return (
    <mosfet channelType="n" mosfetMode="enhancement"
      pinLabels={pinLabels}
      // Preserve source-port order for the saved routing IDs: three source lands, gate, drain.
      symbol={
        <symbol>
          <port name="S3" pinNumber={1} aliases={["pin1"]} direction="down" schX={-0.1} schY={-1} schStemLength={0.2} />
          <port name="S2" pinNumber={2} aliases={["pin2"]} direction="down" schX={0.2} schY={-1} schStemLength={0.2} />
          <port name="S1" pinNumber={3} aliases={["pin3"]} direction="down" schX={0.5} schY={-1} schStemLength={0.2} />
          <port name="G" pinNumber={4} aliases={["pin4"]} direction="left" schX={-0.8} schY={0} schStemLength={0.2} />
          <port name="D" pinNumber={5} aliases={["pin5"]} direction="up" schX={0.2} schY={0.8} schStemLength={0.2} />
          <schematicpath points={[{"x":0,"y":0},{"x":0.12,"y":-0.04},{"x":0.12,"y":0.04},{"x":0,"y":0}]} strokeColor="#880000" isFilled fillColor="#FEFEFE" />
          <schematicpath points={[{"x":0.4,"y":0.04},{"x":0.34,"y":-0.06},{"x":0.46,"y":-0.06},{"x":0.4,"y":0.04}]} strokeColor="#880000" isFilled fillColor="#FEFEFE" />
          <schematicpath points={[{"x":0,"y":0.14},{"x":0.2,"y":0.14},{"x":0.2,"y":0.2},{"x":0.4,"y":0.2},{"x":0.4,"y":0.04}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0,"y":0},{"x":0.2,"y":0},{"x":0.2,"y":-0.2},{"x":0.4,"y":-0.2},{"x":0.4,"y":-0.06}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.2,"y":-0.14},{"x":0,"y":-0.14}]} strokeColor="#880000" />
          <schematicpath points={[{"x":-0.04,"y":0.18},{"x":-0.04,"y":-0.18}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0,"y":0.18},{"x":0,"y":0.1}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0,"y":-0.04},{"x":0,"y":0.04}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0,"y":-0.18},{"x":0,"y":-0.1}]} strokeColor="#880000" />
          <schematicpath points={[{"x":-0.2,"y":0},{"x":-0.04,"y":0}]} strokeColor="#880000" />
          <schematicpath points={[{"x":0.48,"y":0.04},{"x":0.44,"y":0.04},{"x":0.36,"y":0.04},{"x":0.32,"y":0.04}]} strokeColor="#880000" />
          <schematicpath points={[{ x: 0.2, y: -0.2 }, { x: 0.2, y: -0.8 }]} strokeColor="#880000" />
          <schematicpath points={[{ x: -0.1, y: -0.8 }, { x: 0.5, y: -0.8 }]} strokeColor="#880000" />
          <schematicpath points={[{ x: -0.6, y: 0 }, { x: -0.2, y: 0 }]} strokeColor="#880000" />
          <schematicpath points={[{ x: 0.2, y: 0.2 }, { x: 0.2, y: 0.6 }]} strokeColor="#880000" />
          <schematictext schX={0.02} schY={1.04} text="{NAME}" fontSize={0.2} anchor="bottom_center" />
        </symbol>
      }
      supplierPartNumbers={{
  "jlcpcb": [
    "C179626"
  ]
}}
      manufacturerPartNumber="NTMFS5C670NLT1G"
      footprint={<footprint>
        <smtpad solderPasteMargin={0} solderMaskMargin={0.076} portHints={["pin5"]} pcbY="0.9825mm" points={[{x: "-2.28mm", y: "-2.265mm"}, {x: "-2.28mm", y: "-1.84mm"}, {x: "-2.775mm", y: "-1.84mm"}, {x: "-2.775mm", y: "-0.935mm"}, {x: "-2.28mm", y: "-0.935mm"}, {x: "-2.28mm", y: "2.265mm"}, {x: "-1.53mm", y: "2.265mm"}, {x: "-1.53mm", y: "1.79mm"}, {x: "1.53mm", y: "1.79mm"}, {x: "1.53mm", y: "2.265mm"}, {x: "2.28mm", y: "2.265mm"}, {x: "2.28mm", y: "-0.935mm"}, {x: "2.775mm", y: "-0.935mm"}, {x: "2.775mm", y: "-1.84mm"}, {x: "2.28mm", y: "-1.84mm"}, {x: "2.28mm", y: "-2.265mm"}]} shape="polygon" />
<smtpad solderPasteMargin={0} solderMaskMargin={0.076} portHints={["pin4"]} pcbX="1.905mm" pcbY="-2.7475mm" width="0.75mm" height="1mm" shape="rect" />
<smtpad solderPasteMargin={0} solderMaskMargin={0.076} portHints={["pin3"]} pcbX="0.635mm" pcbY="-2.7475mm" width="0.75mm" height="1mm" shape="rect" />
<smtpad solderPasteMargin={0} solderMaskMargin={0.076} portHints={["pin2"]} pcbX="-0.635mm" pcbY="-2.7475mm" width="0.75mm" height="1mm" shape="rect" />
<smtpad solderPasteMargin={0} solderMaskMargin={0.076} portHints={["pin1"]} pcbX="-1.905mm" pcbY="-2.7475mm" width="0.75mm" height="1mm" shape="rect" />
<silkscreencircle strokeWidth={0.15} pcbX="-2.70mm" pcbY="-3.35mm" radius="0.100076mm" />
<courtyardoutline outline={[{"x":-3.0250008000000435,"y":3.507499199999984},{"x":3.0250008000000435,"y":3.507499199999984},{"x":3.0250008000000435,"y":-3.5074992000000975},{"x":-3.0250008000000435,"y":-3.5074992000000975},{"x":-3.0250008000000435,"y":3.507499199999984}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C179626.obj?uuid=d525d21af93348b4b03c6aad2eeb8486",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C179626.step?uuid=d525d21af93348b4b03c6aad2eeb8486",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: -0.017513299999791343, z: 0 },
      }}
      {...partProps}
      pinAttributes={{ pin1: { isPassive: true }, pin2: { isPassive: true }, pin3: { isPassive: true },
        pin4: { isInput: true }, pin5: { isPassive: true }, ...props.pinAttributes,
        ...Object.fromEntries((noConnect ?? []).map(pin => [pin, { ...props.pinAttributes?.[pin], doNotConnect: true }])) }}
    >
      {children}
      {/* Explicit traces retain all five physical pins and their package aliases. */}
      {Object.entries(connections ?? {}).flatMap(([pin, targets]) =>
        (typeof targets === "string" ? [targets] : targets ?? []).map((to, i) =>
          <Fragment key={`${pin}-${i}`}><trace from={`.${props.name} > .${pin}`} to={to} /></Fragment>))}
    </mosfet>
  )
}
