// Imported EasyEDA/JLCPCB C7984; observed 2026-10-10T03:21:00.312369+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C7984
// Datasheet review 2026-10-10: edited this imported footprint in place; original pin order/orientation retained.
// Signal paste 1:1; mask expansion 0.07 mm (TI NSMD straight-edge example maximum; prototype corner treatment is rectangular); silk stroke 0.15 mm.
// TI LMV393 datasheet RevV p35 D0008A layout4214825/C: 0.60x1.55mm at +/-2.70mm, 1.27mm pitch. https://www.ti.com/lit/ds/symlink/lmv393.pdf
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["1OUT"],
  pin2: ["1IN_NEG"],
  pin3: ["1IN_POS"],
  pin4: ["GND"],
  pin5: ["2IN_POS"],
  pin6: ["2IN_NEG"],
  pin7: ["2OUT"],
  pin8: ["VCC_POS"]
} as const

const pinAttributes = {
  pin4: {requiresGround: true}
} as const

export const LMV393IDR = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C7984"
  ]
}}
      manufacturerPartNumber="LMV393IDR"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-1.905mm" pcbY="-2.7mm" width="0.6mm" height="1.55mm" shape="rect" solderMaskMargin="0.07mm" solderPasteMargin={0} />
<smtpad portHints={["pin2"]} pcbX="-0.635mm" pcbY="-2.7mm" width="0.6mm" height="1.55mm" shape="rect" solderMaskMargin="0.07mm" solderPasteMargin={0} />
<smtpad portHints={["pin3"]} pcbX="0.635mm" pcbY="-2.7mm" width="0.6mm" height="1.55mm" shape="rect" solderMaskMargin="0.07mm" solderPasteMargin={0} />
<smtpad portHints={["pin4"]} pcbX="1.905mm" pcbY="-2.7mm" width="0.6mm" height="1.55mm" shape="rect" solderMaskMargin="0.07mm" solderPasteMargin={0} />
<smtpad portHints={["pin8"]} pcbX="-1.905mm" pcbY="2.7mm" width="0.6mm" height="1.55mm" shape="rect" solderMaskMargin="0.07mm" solderPasteMargin={0} />
<smtpad portHints={["pin7"]} pcbX="-0.635mm" pcbY="2.7mm" width="0.6mm" height="1.55mm" shape="rect" solderMaskMargin="0.07mm" solderPasteMargin={0} />
<smtpad portHints={["pin6"]} pcbX="0.635mm" pcbY="2.7mm" width="0.6mm" height="1.55mm" shape="rect" solderMaskMargin="0.07mm" solderPasteMargin={0} />
<smtpad portHints={["pin5"]} pcbX="1.905mm" pcbY="2.7mm" width="0.6mm" height="1.55mm" shape="rect" solderMaskMargin="0.07mm" solderPasteMargin={0} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-2.4999950000001263,"y":-1.4999970000000076},{"x":2.499994999999899,"y":-1.4999970000000076}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-2.4999950000001263,"y":1.4999969999998939},{"x":2.499994999999899,"y":1.4999969999998939}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-2.4999950000001263,"y":-1.4999970000000076},{"x":-2.4999950000001263,"y":-0.7265669999998181}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-2.4999950000001263,"y":1.4999969999998939},{"x":-2.4999950000001263,"y":0.7262875999999778}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":2.499994999999899,"y":1.4999969999998939},{"x":2.499994999999899,"y":-1.4999970000000076}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-2.4999950000001263,"y":-0.7265669999998181},{"x":-2.2625565730616017,"y":-0.6727720384950544},{"x":-2.056152369867391,"y":-0.5436666188794561},{"x":-1.9038872877111999,"y":-0.3537028085727343},{"x":-1.822805887847835,"y":-0.12414516642888884},{"x":-1.8219844264158382,"y":0.11930961309167287},{"x":-1.9015148578508843,"y":0.34940918924542075},{"x":-2.0524945415012326,"y":0.5403962034508822},{"x":-2.25802280368805,"y":0.6708915593560505},{"x":-2.495092800000066,"y":0.7262876000000915}]} />
<silkscreencircle strokeWidth="0.15mm" pcbX="-1.778mm" pcbY="-1.016mm" radius="0.150114mm" />
<courtyardoutline outline={[{"x":-2.75,"y":3.931},{"x":2.75,"y":3.931},{"x":2.75,"y":-3.931},{"x":-2.75,"y":-3.931},{"x":-2.75,"y":3.931}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C7984.obj?uuid=7abc64c95a1a4a04a4ef38f9097c870b",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C7984.step?uuid=7abc64c95a1a4a04a4ef38f9097c870b",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0.000012700000070253736, y: 0, z: 0 },
      }}
      {...props}
    />
  )
}