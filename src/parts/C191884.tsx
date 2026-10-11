// Imported EasyEDA/JLCPCB C191884; observed 2026-10-10T03:35:29.731410+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C191884
// Datasheet review 2026-10-10: edited imported footprint in place; pin order/orientation retained.
// TI TPS54202 Rev C p29 DDC0006A layout 4214841/E: 0.60x1.10 mm at +/-1.35 mm, 0.95 mm pitch. https://www.ti.com/lit/ds/symlink/tps54202.pdf
// Signal paste 1:1; mask expansion 0.07 mm (TI NSMD straight-edge example maximum; prototype corner treatment is rectangular); silk stroke 0.15 mm.
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["GND"],
  pin2: ["SW"],
  pin3: ["VIN"],
  pin4: ["FB"],
  pin5: ["EN"],
  pin6: ["BOOT"]
} as const

const pinAttributes = {
  pin1: {requiresGround: true},
  pin3: {requiresPower: true}
} as const

export const TPS54202DDCR = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C191884"
  ]
}}
      manufacturerPartNumber="TPS54202DDCR"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-0.95mm" pcbY="-1.35mm" width="0.6mm" height="1.1mm" shape="rect" solderMaskMargin="0.07mm" solderPasteMargin={0} />
<smtpad portHints={["pin2"]} pcbX="0mm" pcbY="-1.35mm" width="0.6mm" height="1.1mm" shape="rect" solderMaskMargin="0.07mm" solderPasteMargin={0} />
<smtpad portHints={["pin3"]} pcbX="0.95mm" pcbY="-1.35mm" width="0.6mm" height="1.1mm" shape="rect" solderMaskMargin="0.07mm" solderPasteMargin={0} />
<smtpad portHints={["pin4"]} pcbX="0.95mm" pcbY="1.35mm" width="0.6mm" height="1.1mm" shape="rect" solderMaskMargin="0.07mm" solderPasteMargin={0} />
<smtpad portHints={["pin5"]} pcbX="0mm" pcbY="1.35mm" width="0.6mm" height="1.1mm" shape="rect" solderMaskMargin="0.07mm" solderPasteMargin={0} />
<smtpad portHints={["pin6"]} pcbX="-0.95mm" pcbY="1.35mm" width="0.6mm" height="1.1mm" shape="rect" solderMaskMargin="0.07mm" solderPasteMargin={0} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":1.56,"y":-0.8892031999998835},{"x":1.56,"y":0.8892031999999972}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-1.56,"y":-0.8892031999998835},{"x":-1.56,"y":0.8892031999999972}]} />
<silkscreencircle strokeWidth="0.15mm" pcbX="-1.64mm" pcbY="-1.95mm" radius="0.08mm" />
<courtyardoutline outline={[{"x":-1.8,"y":2.15},{"x":1.8,"y":2.15},{"x":1.8,"y":-2.15},{"x":-1.8,"y":-2.15},{"x":-1.8,"y":2.15}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C191884.obj?uuid=229b69761e2c45dba6a83d8866dec72d",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C191884.step?uuid=229b69761e2c45dba6a83d8866dec72d",
        pcbRotationOffset: 90,
        modelOriginPosition: { x: -0.000012700000070253736, y: 0.000012700000070253736, z: -0.048939 },
      }}
      {...props}
    />
  )
}