// Silkscreen DFM: 0.15 mm strokes; omit tight cosmetic paths, retaining clear pin-1 marks.
// Imported EasyEDA/JLCPCB C179626; observed 2026-10-10T03:21:00.027208+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C179626
// In-place coordinate normalization: drain polygon center pcbY=0.9825 mm; vertices made pad-local.
// Origin normalization fixes core PCB/CPL bounds; exact onsemi p6 CASE488AA lands corrected in place.
// Drain notch 0.475 mm (imported 0.500); drain-to-lead gap 0.965 mm (imported 0.985).
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
  return (
    <chip
      pinLabels={pinLabels}
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
      {...props}
    />
  )
}
