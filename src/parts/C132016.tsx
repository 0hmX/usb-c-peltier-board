// Imported EasyEDA/JLCPCB C132016; observed 2026-10-10T03:20:59.089357+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C132016
// Datasheet review 2026-10-10: edited this imported footprint in place; original pin order/orientation retained.
// Signal paste 1:1; mask expansion 0.07 mm (TI NSMD straight-edge example maximum; prototype corner treatment is rectangular); silk stroke 0.15 mm. Silk trimmed to >=0.15 mm from local mask openings.
// TI TLV8x3 RevE p23 DBZ0003A layout4214838/F: 1.30x0.60mm at +/-1.05mm, 0.95mm pitch. https://www.ti.com/lit/ds/symlink/tlv803.pdf
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["GND"],
  pin2: ["N_RESET"],
  pin3: ["VDD"]
} as const

const pinAttributes = {
  pin1: {requiresGround: true},
  pin3: {requiresPower: true}
} as const

export const TLV803SDBZR = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C132016"
  ]
}}
      manufacturerPartNumber="TLV803SDBZR"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="1.05mm" pcbY="-0.95mm" width="1.3mm" height="0.6mm" shape="rect" solderMaskMargin="0.07mm" solderPasteMargin={0} />
<smtpad portHints={["pin2"]} pcbX="1.05mm" pcbY="0.95mm" width="1.3mm" height="0.6mm" shape="rect" solderMaskMargin="0.07mm" solderPasteMargin={0} />
<smtpad portHints={["pin3"]} pcbX="-1.05mm" pcbY="0mm" width="1.3mm" height="0.6mm" shape="rect" solderMaskMargin="0.07mm" solderPasteMargin={0} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":0.7262,"y":1.545},{"x":-0.7262,"y":1.545},{"x":-0.7262,"y":0.595}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":0.7262,"y":-1.545},{"x":-0.7262,"y":-1.545},{"x":-0.7262,"y":-0.595}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":0.7262,"y":0.355},{"x":0.7262,"y":-0.355}]} />
<silkscreencircle strokeWidth="0.15mm" pcbX="1.75mm" pcbY="-1.635mm" radius="0.08mm" />
<courtyardoutline outline={[{"x":-1.95,"y":1.8},{"x":1.95,"y":1.8},{"x":1.95,"y":-1.8},{"x":-1.95,"y":-1.8},{"x":-1.95,"y":1.8}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C132016.obj?uuid=d777607a152f4f3aac9bb0d0c14ed6fd",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C132016.step?uuid=d777607a152f4f3aac9bb0d0c14ed6fd",
        pcbRotationOffset: 180,
        modelOriginPosition: { x: 0.000012700000070253736, y: -0.000012699999956566899, z: 0.050795 },
      }}
      {...props}
    />
  )
}