// Imported EasyEDA/JLCPCB C144198; observed 2026-10-10T03:14:11.325488+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C144198
// Datasheet review 2026-10-10: edited this imported footprint in place; original pin order/orientation retained.
// Signal paste 1:1; mask expansion 0.05 mm; silk stroke 0.15 mm.
// Microchip C04-2028A CH land pattern, DS00049BG p52: 0.60x1.10mm at +/-1.40mm, 0.95mm pitch; C04-2028B CH repeats dimensions. https://ww1.microchip.com/downloads/en/PackagingSpec/00049BG.pdf
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["VOUT"],
  pin2: ["VSS"],
  pin3: ["VDD"],
  pin4: ["SDA"],
  pin5: ["SCL"],
  pin6: ["A0"]
} as const

const pinAttributes = {
  pin2: {requiresGround: true},
  pin3: {requiresPower: true}
} as const

export const MCP4725A0T_E_CH = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C144198"
  ]
}}
      manufacturerPartNumber="MCP4725A0T-E/CH"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-0.95mm" pcbY="-1.4mm" width="0.6mm" height="1.1mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin2"]} pcbX="0mm" pcbY="-1.4mm" width="0.6mm" height="1.1mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin3"]} pcbX="0.95mm" pcbY="-1.4mm" width="0.6mm" height="1.1mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin4"]} pcbX="0.95mm" pcbY="1.4mm" width="0.6mm" height="1.1mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin5"]} pcbX="0mm" pcbY="1.4mm" width="0.6mm" height="1.1mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin6"]} pcbX="-0.95mm" pcbY="1.4mm" width="0.6mm" height="1.1mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":1.5391891999998961,"y":-0.8892031999998835},{"x":1.5391891999998961,"y":0.8892031999999972}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-1.5391892000000098,"y":-0.8892031999998835},{"x":-1.5391892000000098,"y":0.8892031999999972}]} />
<silkscreencircle strokeWidth="0.15mm" pcbX="-1.64mm" pcbY="-2.0mm" radius="0.08mm" />
<courtyardoutline outline={[{"x":-1.8,"y":2.2},{"x":1.8,"y":2.2},{"x":1.8,"y":-2.2},{"x":-1.8,"y":-2.2},{"x":-1.8,"y":2.2}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C144198.obj?uuid=229b69761e2c45dba6a83d8866dec72d",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C144198.step?uuid=229b69761e2c45dba6a83d8866dec72d",
        pcbRotationOffset: 90,
        modelOriginPosition: { x: -0.000012700000070253736, y: 0.000012700000070253736, z: -0.048939 },
      }}
      {...props}
    />
  )
}