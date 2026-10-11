// Imported EasyEDA/JLCPCB C2678061; observed 2026-10-10T03:14:10.465883+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C2678061
// Datasheet review 2026-10-10: edited this imported footprint in place; original pin order/orientation retained.
// Signal paste 1:1; mask expansion 0.05 mm; silk stroke 0.15 mm. STUSB exposed-pad paste retains 49% area (default 70% linear).
// ST DS12499 Rev8 p32 Fig12: 0.25x0.60mm at +/-1.90mm; EP2.80mm centred (D2/E2 maximum). https://www.st.com/resource/en/datasheet/stusb4500.pdf
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["CC1DB"],
  pin2: ["CC1"],
  pin3: ["NC"],
  pin4: ["CC2"],
  pin5: ["CC2DB"],
  pin6: ["RESET"],
  pin7: ["SCL"],
  pin8: ["SDA"],
  pin9: ["DISCH"],
  pin10: ["GND"],
  pin11: ["ATTACH"],
  pin12: ["ADDR0"],
  pin13: ["ADDR1"],
  pin14: ["POWER_OK3"],
  pin15: ["GPIO"],
  pin16: ["VBUS_EN_SNK"],
  pin17: ["A_B_SIDE"],
  pin18: ["VBUS_VS_DISCH"],
  pin19: ["ALERT"],
  pin20: ["POWER_OK2"],
  pin21: ["VREG_1V2"],
  pin22: ["VSYS"],
  pin23: ["VREG_2V7"],
  pin24: ["VDD"],
  pin25: ["EP"]
} as const

const pinAttributes = {
  pin3: {doNotConnect: true},
  pin10: {requiresGround: true},
  pin24: {requiresPower: true}
} as const

export const STUSB4500QTR = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C2678061"
  ]
}}
      manufacturerPartNumber="STUSB4500QTR"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-1.25mm" pcbY="-1.9mm" width="0.25mm" height="0.6mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin2"]} pcbX="-0.75mm" pcbY="-1.9mm" width="0.25mm" height="0.6mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin3"]} pcbX="-0.25mm" pcbY="-1.9mm" width="0.25mm" height="0.6mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin4"]} pcbX="0.25mm" pcbY="-1.9mm" width="0.25mm" height="0.6mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin5"]} pcbX="0.75mm" pcbY="-1.9mm" width="0.25mm" height="0.6mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin6"]} pcbX="1.25mm" pcbY="-1.9mm" width="0.25mm" height="0.6mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin7"]} pcbX="1.9mm" pcbY="-1.25mm" width="0.6mm" height="0.25mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin8"]} pcbX="1.9mm" pcbY="-0.75mm" width="0.6mm" height="0.25mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin9"]} pcbX="1.9mm" pcbY="-0.25mm" width="0.6mm" height="0.25mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin10"]} pcbX="1.9mm" pcbY="0.25mm" width="0.6mm" height="0.25mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin11"]} pcbX="1.9mm" pcbY="0.75mm" width="0.6mm" height="0.25mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin12"]} pcbX="1.9mm" pcbY="1.25mm" width="0.6mm" height="0.25mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin13"]} pcbX="1.25mm" pcbY="1.9mm" width="0.25mm" height="0.6mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin14"]} pcbX="0.75mm" pcbY="1.9mm" width="0.25mm" height="0.6mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin15"]} pcbX="0.25mm" pcbY="1.9mm" width="0.25mm" height="0.6mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin16"]} pcbX="-0.25mm" pcbY="1.9mm" width="0.25mm" height="0.6mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin17"]} pcbX="-0.75mm" pcbY="1.9mm" width="0.25mm" height="0.6mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin18"]} pcbX="-1.25mm" pcbY="1.9mm" width="0.25mm" height="0.6mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin19"]} pcbX="-1.9mm" pcbY="1.25mm" width="0.6mm" height="0.25mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin20"]} pcbX="-1.9mm" pcbY="0.75mm" width="0.6mm" height="0.25mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin21"]} pcbX="-1.9mm" pcbY="0.25mm" width="0.6mm" height="0.25mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin22"]} pcbX="-1.9mm" pcbY="-0.25mm" width="0.6mm" height="0.25mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin23"]} pcbX="-1.9mm" pcbY="-0.75mm" width="0.6mm" height="0.25mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
<smtpad portHints={["pin24"]} pcbX="-1.9mm" pcbY="-1.25mm" width="0.6mm" height="0.25mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin={0} />
{/* EP stencil process choice: 1.96 x 1.96 mm (49% area), explicitly preserving the reviewed prototype target.
    ST TN1224 Rev2 section 4.3 leaves optimum EP volume to assembly-process validation; this is not a package-specific ST stencil recommendation.
    https://www.st.com/resource/en/technical_note/tn1224-mounting-instructions-for-smd-surface-mounting-device-packages-stmicroelectronics.pdf */}
<smtpad portHints={["pin25"]} pcbX="0mm" pcbY="0mm" width="2.8mm" height="2.8mm" shape="rect" solderMaskMargin="0.05mm" solderPasteMargin="-0.42mm" />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":2.1628099999998085,"y":1.7500345999999354},{"x":2.1628099999998085,"y":2.1501353999999537},{"x":1.7627599999999575,"y":2.1501353999999537}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-2.137384599999905,"y":1.7500345999999354},{"x":-2.137384599999905,"y":2.1501353999999537},{"x":-1.737359999999967,"y":2.1501353999999537}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-1.737359999999967,"y":-2.1501353999999537},{"x":-2.137384599999905,"y":-2.1501353999999537},{"x":-2.137384599999905,"y":-1.750085399999989}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":2.1628099999998085,"y":-1.750085399999989},{"x":2.1628099999998085,"y":-2.1501353999999537},{"x":1.7627599999999575,"y":-2.1501353999999537}]} />
<silkscreencircle strokeWidth="0.15mm" pcbX="-2.4mm" pcbY="-2.4mm" radius="0.1mm" />
<courtyardoutline outline={[{"x":-2.599995300000046,"y":2.599995300000046},{"x":2.5999953000001597,"y":2.599995300000046},{"x":2.5999953000001597,"y":-2.599995300000046},{"x":-2.599995300000046,"y":-2.599995300000046},{"x":-2.599995300000046,"y":2.599995300000046}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C2678061.obj?uuid=f4a3249710724deb990f62f343cd4553",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C2678061.step?uuid=f4a3249710724deb990f62f343cd4553",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: -0.000012699999842880061, y: -0.000012700000070253736, z: 0 },
      }}
      {...props}
    />
  )
}
