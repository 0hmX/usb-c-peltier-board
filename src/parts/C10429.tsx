// Imported EasyEDA/JLCPCB C10429; observed 2026-10-10T05:16:39.252664+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C10429
// Datasheet review 2026-10-10: edited this imported footprint in place; original pin numbering/orientation retained.
// TI SN74LVC2G17 RevN DBV0006A drawing4214840/G p31: 0.60x1.10 mm, y +/-1.30 mm, x pitch0.95 mm. https://www.ti.com/lit/ds/symlink/sn74lvc2g17.pdf
// Signal paste1:1; prototype mask +0.05 mm is within maker straight-edge NSMD MAX0.07; R0.05 reference corner uses rectangular envelope as documented.
// Silk0.15 mm, pin1 marker gap0.185 mm, courtyard includes maximum3.05 mm body plus0.25 mm.
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["1A"],
  pin2: ["GND"],
  pin3: ["2A"],
  pin4: ["2Y"],
  pin5: ["VCC"],
  pin6: ["1Y"]
} as const

const pinAttributes = {
  pin2: {requiresGround: true},
  pin5: {requiresPower: true}
} as const

export const SN74LVC2G17DBVR = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C10429"
  ]
}}
      manufacturerPartNumber="SN74LVC2G17DBVR"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-0.95mm" pcbY="-1.3mm" width="0.6mm" height="1.1mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin2"]} pcbX="0mm" pcbY="-1.3mm" width="0.6mm" height="1.1mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin3"]} pcbX="0.95mm" pcbY="-1.3mm" width="0.6mm" height="1.1mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin4"]} pcbX="0.95mm" pcbY="1.3mm" width="0.6mm" height="1.1mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin5"]} pcbX="0mm" pcbY="1.3mm" width="0.6mm" height="1.1mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin6"]} pcbX="-0.95mm" pcbY="1.3mm" width="0.6mm" height="1.1mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":1.5391891999998961,"y":-0.8892031999998835},{"x":1.5391891999998961,"y":0.8892031999999972}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-1.5391892000000098,"y":-0.8892031999998835},{"x":-1.5391892000000098,"y":0.8892031999999972}]} />
<silkscreencircle strokeWidth="0.15mm" pcbX="-1.64mm" pcbY="-1.9mm" radius="0.08mm" />
<courtyardoutline outline={[{"x":-1.8,"y":2.1},{"x":1.8,"y":2.1},{"x":1.8,"y":-2.1},{"x":-1.8,"y":-2.1},{"x":-1.8,"y":2.1}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C10429.obj?uuid=229b69761e2c45dba6a83d8866dec72d",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C10429.step?uuid=229b69761e2c45dba6a83d8866dec72d",
        pcbRotationOffset: 90,
        modelOriginPosition: { x: -0.000012700000070253736, y: 0.000012700000070253736, z: -0.048939 },
      }}
      {...props}
    />
  )
}