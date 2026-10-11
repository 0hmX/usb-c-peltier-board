// Imported EasyEDA/JLCPCB C780769; observed 2026-10-10T03:20:57.528583+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C780769
// Datasheet review 2026-10-10: edited this imported footprint in place; original pin order/orientation retained.
// Signal paste 1:1; mask expansion 0.05 mm; silk stroke 0.15 mm. Silk trimmed to >=0.15 mm from local mask openings.
// Diodes AP63200/01/03/05 DS41326 Rev3-2 p17 TSOT26 suggested pad: 0.70x1.00mm, 0.95mm pitch, 3.20mm outer span. https://www.diodes.com/datasheet/download/AP63200-AP63201-AP63203-AP63205.pdf
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["FB"],
  pin2: ["EN"],
  pin3: ["VIN"],
  pin4: ["GND"],
  pin5: ["SW"],
  pin6: ["BST"]
} as const

const pinAttributes = {
  pin3: {requiresPower: true},
  pin4: {requiresGround: true}
} as const

export const AP63203WU_7 = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C780769"
  ]
}}
      manufacturerPartNumber="AP63203WU-7"
      footprint={<footprint>
        <smtpad portHints={["pin6"]} pcbX="-0.95mm" pcbY="1.1mm" width="0.7mm" height="1mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin5"]} pcbX="0mm" pcbY="1.1mm" width="0.7mm" height="1mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin4"]} pcbX="0.95mm" pcbY="1.1mm" width="0.7mm" height="1mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin3"]} pcbX="0.95mm" pcbY="-1.1mm" width="0.7mm" height="1mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin2"]} pcbX="0mm" pcbY="-1.1mm" width="0.7mm" height="1mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin1"]} pcbX="-0.95mm" pcbY="-1.1mm" width="0.7mm" height="1mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":1.60,"y":-0.80},{"x":1.60,"y":0.80}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-1.60,"y":-0.80},{"x":-1.60,"y":0.80}]} />
<silkscreencircle strokeWidth="0.15mm" pcbX="-1.59mm" pcbY="-1.845mm" radius="0.08mm" />
<silkscreentext text="{NAME}" pcbX="0mm" pcbY="2.7526mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-1.75,"y":2.0},{"x":1.75,"y":2.0},{"x":1.75,"y":-2.0},{"x":-1.75,"y":-2.0},{"x":-1.75,"y":2.0}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C780769.obj?uuid=2b6da6256cae46a8bf22c2998bde16a5",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C780769.step?uuid=2b6da6256cae46a8bf22c2998bde16a5",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0.000012700000070253736, y: 0, z: -0.62 },
      }}
      {...props}
    />
  )
}