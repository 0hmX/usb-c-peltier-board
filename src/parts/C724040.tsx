// Imported EasyEDA/JLCPCB C724040; observed 2026-10-10T03:14:11.085104+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C724040
// Datasheet review 2026-10-10: edited this imported footprint in place; original pin order/orientation retained.
// Signal paste 1:1; mask expansion 0.05 mm; silk stroke 0.15 mm.
// ST DS12991 Rev6 p87 Fig32: 0.40x1.35mm, 0.65mm pitch, 7.10mm outer/4.40mm inner spans. https://www.st.com/resource/en/datasheet/stm32g030f6.pdf
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["PB7","PB8"],
  pin2: ["PB9","PC14_OSC32_IN"],
  pin3: ["PC15_OSC32_OUT"],
  pin4: ["VDD","VDDA"],
  pin5: ["VSS","VSSA"],
  pin6: ["NRST"],
  pin7: ["PA0"],
  pin8: ["PA1"],
  pin9: ["PA2"],
  pin10: ["PA3"],
  pin11: ["PA4"],
  pin12: ["PA5"],
  pin13: ["PA6"],
  pin14: ["PA7"],
  pin15: ["PB0","PB1","PB2","PA8"],
  pin16: ["PA11_PA9_"],
  pin17: ["PA12_PA10_"],
  pin18: ["PA13"],
  pin19: ["PA15","PA14_BOOT0"],
  pin20: ["PB3","PB4","PB5","PB6"]
} as const

const pinAttributes = {
  pin4: {requiresPower: true},
  pin5: {requiresGround: true}
} as const

export const STM32G030F6P6 = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C724040"
  ]
}}
      manufacturerPartNumber="STM32G030F6P6"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-2.925mm" pcbY="-2.875mm" width="0.4mm" height="1.35mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin2"]} pcbX="-2.275mm" pcbY="-2.875mm" width="0.4mm" height="1.35mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin3"]} pcbX="-1.625mm" pcbY="-2.875mm" width="0.4mm" height="1.35mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin4"]} pcbX="-0.975mm" pcbY="-2.875mm" width="0.4mm" height="1.35mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin5"]} pcbX="-0.325mm" pcbY="-2.875mm" width="0.4mm" height="1.35mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin6"]} pcbX="0.325mm" pcbY="-2.875mm" width="0.4mm" height="1.35mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin7"]} pcbX="0.975mm" pcbY="-2.875mm" width="0.4mm" height="1.35mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin8"]} pcbX="1.625mm" pcbY="-2.875mm" width="0.4mm" height="1.35mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin9"]} pcbX="2.275mm" pcbY="-2.875mm" width="0.4mm" height="1.35mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin10"]} pcbX="2.925mm" pcbY="-2.875mm" width="0.4mm" height="1.35mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin20"]} pcbX="-2.925mm" pcbY="2.875mm" width="0.4mm" height="1.35mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin19"]} pcbX="-2.275mm" pcbY="2.875mm" width="0.4mm" height="1.35mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin18"]} pcbX="-1.625mm" pcbY="2.875mm" width="0.4mm" height="1.35mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin17"]} pcbX="-0.975mm" pcbY="2.875mm" width="0.4mm" height="1.35mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin16"]} pcbX="-0.325mm" pcbY="2.875mm" width="0.4mm" height="1.35mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin15"]} pcbX="0.325mm" pcbY="2.875mm" width="0.4mm" height="1.35mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin14"]} pcbX="0.975mm" pcbY="2.875mm" width="0.4mm" height="1.35mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin13"]} pcbX="1.625mm" pcbY="2.875mm" width="0.4mm" height="1.35mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin12"]} pcbX="2.275mm" pcbY="2.875mm" width="0.4mm" height="1.35mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin11"]} pcbX="2.925mm" pcbY="2.875mm" width="0.4mm" height="1.35mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-3.326206200000115,"y":-1.7713960000000952},{"x":-3.326206200000115,"y":1.7713959999999815},{"x":3.3262061999998878,"y":1.7713959999999815},{"x":3.3262061999998878,"y":-1.7713960000000952},{"x":-3.326206200000115,"y":-1.7713960000000952}]} />
<silkscreencircle strokeWidth="0.15mm" pcbX="-2.925064mm" pcbY="-1.019048mm" radius="0.150114mm" />
<courtyardoutline outline={[{"x":-3.55,"y":3.992},{"x":3.55,"y":3.992},{"x":3.55,"y":-3.992},{"x":-3.55,"y":-3.992},{"x":-3.55,"y":3.992}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C724040.obj?uuid=f8ba5b4174b9490d8c445fbe2ed40b80",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C724040.step?uuid=f8ba5b4174b9490d8c445fbe2ed40b80",
        pcbRotationOffset: 90,
        modelOriginPosition: { x: 0, y: 0.000012700000070253736, z: -0.019205 },
      }}
      {...props}
    />
  )
}