// Imported EasyEDA/JLCPCB C70285; observed 2026-10-10T03:20:57.503150+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C70285
// Datasheet review 2026-10-10: edited this imported footprint in place; original pin order/orientation retained.
// Signal paste 1:1; mask expansion 0.05 mm; silk stroke 0.15 mm. Silk trimmed to >=0.15 mm from local mask openings.
// TI SN74LVC1G74 RevG p23 DCU0008A layout4225266/A: 0.85x0.30mm at +/-1.55mm, 0.50mm pitch. https://www.ti.com/lit/ds/symlink/sn74lvc1g74.pdf
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["CLK"],
  pin2: ["D"],
  pin3: ["N_Q"],
  pin4: ["GND"],
  pin5: ["Q"],
  pin6: ["N_CLR"],
  pin7: ["N_PRE"],
  pin8: ["VCC"]
} as const

const pinAttributes = {
  pin4: {requiresGround: true},
  pin8: {requiresPower: true}
} as const

export const SN74LVC1G74DCUR = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C70285"
  ]
}}
      manufacturerPartNumber="SN74LVC1G74DCUR"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="1.55mm" pcbY="-0.75mm" width="0.85mm" height="0.3mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin2"]} pcbX="1.55mm" pcbY="-0.25mm" width="0.85mm" height="0.3mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin3"]} pcbX="1.55mm" pcbY="0.25mm" width="0.85mm" height="0.3mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin4"]} pcbX="1.55mm" pcbY="0.75mm" width="0.85mm" height="0.3mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin5"]} pcbX="-1.55mm" pcbY="0.75mm" width="0.85mm" height="0.3mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin6"]} pcbX="-1.55mm" pcbY="0.25mm" width="0.85mm" height="0.3mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin7"]} pcbX="-1.55mm" pcbY="-0.25mm" width="0.85mm" height="0.3mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin8"]} pcbX="-1.55mm" pcbY="-0.75mm" width="0.85mm" height="0.3mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-1.15,"y":1.20},{"x":1.15,"y":1.20}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":1.15,"y":-1.20},{"x":0.3326,"y":-1.20}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-1.15,"y":-1.20},{"x":-0.2824,"y":-1.20}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-0.2824,"y":-1.20},{"x":0.3326,"y":-1.20}]} />
<silkscreencircle strokeWidth="0.15mm" pcbX="1.67005mm" pcbY="-1.35mm" radius="0.143256mm" />
<courtyardoutline outline={[{"x":-2.225,"y":1.6},{"x":2.225,"y":1.6},{"x":2.225,"y":-1.6},{"x":-2.225,"y":-1.6},{"x":-2.225,"y":1.6}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C70285.obj?uuid=8d74239684c249c491a8d7817d4618b2",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C70285.step?uuid=8d74239684c249c491a8d7817d4618b2",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: -0.00008890000015071564, y: 0.00010160000010728254, z: 0 },
      }}
      {...props}
    />
  )
}