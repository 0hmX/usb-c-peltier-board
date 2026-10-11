// Silkscreen DFM: 0.15 mm strokes; omit tight cosmetic paths, retaining clear pin-1 marks.
// Manufacturing adaptation: removed 8 unnetted via-in-pad children; 21 imported pad numbers preserved.
// Imported EasyEDA/JLCPCB C671324; observed 2026-10-10T03:14:09.170910+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C671324
// Datasheet correction in place: ADI 37411fg p22 FE Rev L, 0.45 x 1.05 mm leads, row centers +/-2.775 mm, minimum 3.86 x 2.74 mm GND EP.
// Preserves all 21 imported pad numbers; do not reimport over this audited geometry.
import type { ChipProps, FootprintSoupElements } from "@tscircuit/props"

// EP and leads request 0.04 mm NSMD relief; production polygon-mask export
// must honor EP margin (raw exporter ignores polygon margins).
// Six vented EP apertures: 71.76% paste area; lead pads remain 1:1.
// Generic ADI AN-772 window guidance; assembler must approve FE stencil/reflow.
const epId = "C671324_imported_pin21"
const lt3741EpWithPaste = [
  { type: "pcb_smtpad", pcb_smtpad_id: epId, x: 0, y: 0, shape: "polygon", layer: "top", port_hints: ["pin21"], soldermask_margin: 0.04, points: [{ x: -1.93, y: -1.37 }, { x: 1.93, y: -1.37 }, { x: 1.93, y: 1.37 }, { x: -1.93, y: 1.37 }] },
  ...[-1.3, 0, 1.3].flatMap(x => [-0.625, 0.625].map(y => ({ type: "pcb_solder_paste", pcb_smtpad_id: epId, shape: "polygon", layer: "top", points: [{ x: x - 0.575, y: y - 0.55 }, { x: x + 0.575, y: y - 0.55 }, { x: x + 0.575, y: y + 0.55 }, { x: x - 0.575, y: y + 0.55 }] }))),
]

const pinLabels = {
  pin1: ["VCC_INT"],
  pin2: ["GND1"],
  pin3: ["VIN"],
  pin4: ["EN","UVLO"],
  pin5: ["VREF"],
  pin6: ["CTRL2"],
  pin7: ["GND2"],
  pin8: ["CTRL1"],
  pin9: ["SS"],
  pin10: ["FB"],
  pin11: ["SENSE_POS"],
  pin12: ["SENSE_NEG"],
  pin13: ["VC"],
  pin14: ["RT"],
  pin15: ["SYNC"],
  pin16: ["GND3"],
  pin17: ["HG"],
  pin18: ["SW"],
  pin19: ["CBOOT"],
  pin20: ["LG"],
  pin21: ["GND4"]
} as const

const pinAttributes = {
  pin2: {requiresGround: true},
  pin3: {requiresPower: true},
  pin7: {requiresGround: true},
  pin16: {requiresGround: true},
  pin21: {requiresGround: true}
} as const

export const LT3741EFE_1_PBF = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C671324"
  ]
}}
      manufacturerPartNumber="LT3741EFE-1#PBF"
      footprint={lt3741EpWithPaste as FootprintSoupElements[]}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C671324.obj?uuid=f8ba5b4174b9490d8c445fbe2ed40b80",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C671324.step?uuid=f8ba5b4174b9490d8c445fbe2ed40b80",
        pcbRotationOffset: 90,
        modelOriginPosition: { x: 0, y: 0.000012700000070253736, z: -0.019205 },
      }}
      {...props}
    >
      <footprint>
        <smtpad solderPasteMargin={0} solderMaskMargin={0.04} portHints={["pin1"]} pcbX="-2.9250000000000003mm" pcbY="-2.775mm" width="0.45mm" height="1.05mm" shape="rect" />
<smtpad solderPasteMargin={0} solderMaskMargin={0.04} portHints={["pin2"]} pcbX="-2.275mm" pcbY="-2.775mm" width="0.45mm" height="1.05mm" shape="rect" />
<smtpad solderPasteMargin={0} solderMaskMargin={0.04} portHints={["pin3"]} pcbX="-1.625mm" pcbY="-2.775mm" width="0.45mm" height="1.05mm" shape="rect" />
<smtpad solderPasteMargin={0} solderMaskMargin={0.04} portHints={["pin4"]} pcbX="-0.9750000000000001mm" pcbY="-2.775mm" width="0.45mm" height="1.05mm" shape="rect" />
<smtpad solderPasteMargin={0} solderMaskMargin={0.04} portHints={["pin5"]} pcbX="-0.325mm" pcbY="-2.775mm" width="0.45mm" height="1.05mm" shape="rect" />
<smtpad solderPasteMargin={0} solderMaskMargin={0.04} portHints={["pin6"]} pcbX="0.325mm" pcbY="-2.775mm" width="0.45mm" height="1.05mm" shape="rect" />
<smtpad solderPasteMargin={0} solderMaskMargin={0.04} portHints={["pin7"]} pcbX="0.9750000000000001mm" pcbY="-2.775mm" width="0.45mm" height="1.05mm" shape="rect" />
<smtpad solderPasteMargin={0} solderMaskMargin={0.04} portHints={["pin8"]} pcbX="1.625mm" pcbY="-2.775mm" width="0.45mm" height="1.05mm" shape="rect" />
<smtpad solderPasteMargin={0} solderMaskMargin={0.04} portHints={["pin9"]} pcbX="2.275mm" pcbY="-2.775mm" width="0.45mm" height="1.05mm" shape="rect" />
<smtpad solderPasteMargin={0} solderMaskMargin={0.04} portHints={["pin10"]} pcbX="2.9250000000000003mm" pcbY="-2.775mm" width="0.45mm" height="1.05mm" shape="rect" />
<smtpad solderPasteMargin={0} solderMaskMargin={0.04} portHints={["pin20"]} pcbX="-2.9250000000000003mm" pcbY="2.775mm" width="0.45mm" height="1.05mm" shape="rect" />
<smtpad solderPasteMargin={0} solderMaskMargin={0.04} portHints={["pin19"]} pcbX="-2.275mm" pcbY="2.775mm" width="0.45mm" height="1.05mm" shape="rect" />
<smtpad solderPasteMargin={0} solderMaskMargin={0.04} portHints={["pin18"]} pcbX="-1.625mm" pcbY="2.775mm" width="0.45mm" height="1.05mm" shape="rect" />
<smtpad solderPasteMargin={0} solderMaskMargin={0.04} portHints={["pin17"]} pcbX="-0.9750000000000001mm" pcbY="2.775mm" width="0.45mm" height="1.05mm" shape="rect" />
<smtpad solderPasteMargin={0} solderMaskMargin={0.04} portHints={["pin16"]} pcbX="-0.325mm" pcbY="2.775mm" width="0.45mm" height="1.05mm" shape="rect" />
<smtpad solderPasteMargin={0} solderMaskMargin={0.04} portHints={["pin15"]} pcbX="0.325mm" pcbY="2.775mm" width="0.45mm" height="1.05mm" shape="rect" />
<smtpad solderPasteMargin={0} solderMaskMargin={0.04} portHints={["pin14"]} pcbX="0.9750000000000001mm" pcbY="2.775mm" width="0.45mm" height="1.05mm" shape="rect" />
<smtpad solderPasteMargin={0} solderMaskMargin={0.04} portHints={["pin13"]} pcbX="1.625mm" pcbY="2.775mm" width="0.45mm" height="1.05mm" shape="rect" />
<smtpad solderPasteMargin={0} solderMaskMargin={0.04} portHints={["pin12"]} pcbX="2.275mm" pcbY="2.775mm" width="0.45mm" height="1.05mm" shape="rect" />
<smtpad solderPasteMargin={0} solderMaskMargin={0.04} portHints={["pin11"]} pcbX="2.9250000000000003mm" pcbY="2.775mm" width="0.45mm" height="1.05mm" shape="rect" />
<silkscreenpath strokeWidth={0.15} route={[{"x":-3.326206200000115,"y":-1.7663921999999275},{"x":-3.326206200000115,"y":1.7663921999999275},{"x":3.3262061999998878,"y":1.7663921999999275},{"x":3.3262061999998878,"y":-1.7663921999999275},{"x":-3.326206200000115,"y":-1.7663921999999275}]} />
<silkscreencircle strokeWidth={0.15} pcbX="-2.9250000000000003mm" pcbY="-1.013968mm" radius="0.150114mm" />
<silkscreentext text="{NAME}" pcbX="-0.1778mm" pcbY="4.556mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-3.499980800000003,"y":3.951605499999914},{"x":3.50000620000003,"y":3.951605499999914},{"x":3.50000620000003,"y":-3.951605499999914},{"x":-3.499980800000003,"y":-3.951605499999914},{"x":-3.499980800000003,"y":3.951605499999914}]} />
      </footprint>
    </chip>
  )
}
