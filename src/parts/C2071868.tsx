// Imported EasyEDA/JLCPCB C2071868; observed 2026-10-10T03:20:58.472787+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C2071868
// Datasheet review 2026-10-10: edited this imported footprint in place; original pin order/orientation retained.
// Signal paste 1:1; mask expansion 0.05 mm; silk stroke 0.15 mm. Silk kept >=0.15 mm from local mask openings.
// Diodes AP63200/01/03/05 DS41326 Rev3-2 p17 TSOT26 suggested pad: 0.70x1.00mm, 0.95mm pitch, 3.20mm outer span. Import orientation retained90deg. https://www.diodes.com/datasheet/download/AP63200-AP63201-AP63203-AP63205.pdf
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

export const AP63200WU_7 = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C2071868"
  ]
}}
      manufacturerPartNumber="AP63200WU-7"
      footprint={<footprint>
        <smtpad portHints={["pin3"]} pcbX="1.1mm" pcbY="0.95mm" width="1mm" height="0.7mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin2"]} pcbX="1.1mm" pcbY="-0mm" width="1mm" height="0.7mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin1"]} pcbX="1.1mm" pcbY="-0.95mm" width="1mm" height="0.7mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin6"]} pcbX="-1.1mm" pcbY="-0.95mm" width="1mm" height="0.7mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin5"]} pcbX="-1.1mm" pcbY="-0mm" width="1mm" height="0.7mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin4"]} pcbX="-1.1mm" pcbY="0.95mm" width="1mm" height="0.7mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-0.899998200000141,"y":1.60},{"x":0.9000236000000541,"y":1.60}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-0.899998200000141,"y":-1.60},{"x":0.9000236000000541,"y":-1.60}]} />
<silkscreencircle strokeWidth="0.15mm" pcbX="1.397mm" pcbY="-1.80mm" radius="0.127mm" />
<silkscreentext text="{NAME}" pcbX="0.012446mm" pcbY="2.562354mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-2.151,"y":2.23},{"x":2.151,"y":2.23},{"x":2.151,"y":-2.23},{"x":-2.151,"y":-2.23},{"x":-2.151,"y":2.23}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C2071868.obj?uuid=229b69761e2c45dba6a83d8866dec72d",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C2071868.step?uuid=229b69761e2c45dba6a83d8866dec72d",
        pcbRotationOffset: 180,
        modelOriginPosition: { x: 0.000025399999913133797, y: -0.0000889000000370288, z: -0.048939 },
      }}
      {...props}
    />
  )
}