// Imported EasyEDA/JLCPCB C138706; observed 2026-10-10T03:29:26.403149+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C138706
// Datasheet review 2026-10-10: edited imported footprint in place; pin order/orientation retained.
// TI INA219 Rev G p34 D0008A layout 4214825/C: 0.60x1.55 mm at +/-2.70 mm, 1.27 mm pitch. https://www.ti.com/lit/ds/symlink/ina219.pdf
// Signal paste 1:1; mask expansion 0.07 mm (TI NSMD straight-edge example maximum; prototype corner treatment is rectangular); silk stroke 0.15 mm.
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["A1"],
  pin2: ["A0"],
  pin3: ["SDA"],
  pin4: ["SCL"],
  pin5: ["VS"],
  pin6: ["GND"],
  pin7: ["VIN_NEG"],
  pin8: ["VIN_POS"]
} as const

const pinAttributes = {
  pin5: {requiresPower: true},
  pin6: {requiresGround: true}
} as const

export const INA219AIDR = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C138706"
  ]
}}
      manufacturerPartNumber="INA219AIDR"
      footprint={<footprint>
        <smtpad portHints={["pin5"]} pcbX="1.905mm" pcbY="2.7mm" width="0.6mm" height="1.55mm" shape="rect" solderMaskMargin="0.07mm" solderPasteMargin={0} />
<smtpad portHints={["pin6"]} pcbX="0.635mm" pcbY="2.7mm" width="0.6mm" height="1.55mm" shape="rect" solderMaskMargin="0.07mm" solderPasteMargin={0} />
<smtpad portHints={["pin7"]} pcbX="-0.635mm" pcbY="2.7mm" width="0.6mm" height="1.55mm" shape="rect" solderMaskMargin="0.07mm" solderPasteMargin={0} />
<smtpad portHints={["pin8"]} pcbX="-1.905mm" pcbY="2.7mm" width="0.6mm" height="1.55mm" shape="rect" solderMaskMargin="0.07mm" solderPasteMargin={0} />
<smtpad portHints={["pin4"]} pcbX="1.905mm" pcbY="-2.7mm" width="0.6mm" height="1.55mm" shape="rect" solderMaskMargin="0.07mm" solderPasteMargin={0} />
<smtpad portHints={["pin3"]} pcbX="0.635mm" pcbY="-2.7mm" width="0.6mm" height="1.55mm" shape="rect" solderMaskMargin="0.07mm" solderPasteMargin={0} />
<smtpad portHints={["pin2"]} pcbX="-0.635mm" pcbY="-2.7mm" width="0.6mm" height="1.55mm" shape="rect" solderMaskMargin="0.07mm" solderPasteMargin={0} />
<smtpad portHints={["pin1"]} pcbX="-1.905mm" pcbY="-2.7mm" width="0.6mm" height="1.55mm" shape="rect" solderMaskMargin="0.07mm" solderPasteMargin={0} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-2.5262078000000656,"y":-1.5214091999999937},{"x":2.526207799999952,"y":-1.5214091999999937}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-2.5262078000000656,"y":1.5214092000001074},{"x":2.526207799999952,"y":1.5214092000001074}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-2.5262078000000656,"y":-0.43538139999998293},{"x":-2.5262078000000656,"y":-1.5214091999999937}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-2.5262078000000656,"y":0.44889420000004066},{"x":-2.5262078000000656,"y":1.5214092000001074}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-2.0675600000000713,"y":-1.5214091999999937},{"x":-2.5262078000000656,"y":-1.5214091999999937}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-0.7975599999999758,"y":-1.5214091999999937},{"x":-1.7424400000001015,"y":-1.5214091999999937}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":0.47244000000000597,"y":-1.5214091999999937},{"x":-0.47244000000011965,"y":-1.5214091999999937}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":1.7424399999999878,"y":-1.5214091999999937},{"x":0.7975599999999758,"y":-1.5214091999999937}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":2.526207799999952,"y":-1.5214091999999937},{"x":2.0675599999999577,"y":-1.5214091999999937}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":2.526207799999952,"y":1.5214092000001074},{"x":2.526207799999952,"y":-1.5214091999999937}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-2.0675600000000713,"y":1.5214092000001074},{"x":-2.5262078000000656,"y":1.5214092000001074}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-0.7975599999999758,"y":1.5214092000001074},{"x":-1.7424400000001015,"y":1.5214092000001074}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":0.47244000000000597,"y":1.5214092000001074},{"x":-0.47244000000011965,"y":1.5214092000001074}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":1.7424399999999878,"y":1.5214092000001074},{"x":0.7975599999999758,"y":1.5214092000001074}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":2.526207799999952,"y":1.5214092000001074},{"x":2.0675599999999577,"y":1.5214092000001074}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-2.526208,"y":-0.43538139999986925},{"x":-2.305139,"y":-0.37614616677331014},{"x":-2.143305,"y":-0.21431250000000546},{"x":-2.08407,"y":0.006756400000085705},{"x":-2.143305,"y":0.22782530000017687},{"x":-2.305139,"y":0.38965896677336787},{"x":-2.526208,"y":0.44889420000004066}]} />
<silkscreencircle strokeWidth="0.15mm" pcbX="-1.905mm" pcbY="-1.016mm" radius="0.150114mm" />
<silkscreentext text="{NAME}" pcbX="0.0127mm" pcbY="4.2004mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-2.75,"y":3.75},{"x":2.75,"y":3.75},{"x":2.75,"y":-3.75},{"x":-2.75,"y":-3.75},{"x":-2.75,"y":3.75}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C138706.obj?uuid=ec3b9f9b31a74655be3e55848dbee9c1",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C138706.step?uuid=ec3b9f9b31a74655be3e55848dbee9c1",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: -0.000012700000070253736, y: 0, z: 0 },
      }}
      {...props}
    />
  )
}