import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["CC1","A5"],
  pin2: ["GND1","A1"],
  pin3: ["VBUS1","A4"],
  pin4: ["Dp1","A6"],
  pin5: ["Dn1","A7"],
  pin6: ["SBU1","A8"],
  pin7: ["VBUS2","A9"],
  pin8: ["GND2","A12"],
  pin9: ["GND3","B12"],
  pin10: ["VBUS3","B9"],
  pin11: ["SBU2","B8"],
  pin12: ["Dn2","B7"],
  pin13: ["Dp2","B6"],
  pin14: ["CC2","B5"],
  pin15: ["VBUS4","B4"],
  pin16: ["GND4","B1"],
  pin17: ["S1"]
} as const

export const USB4085_GF_A = (props: ChipProps<typeof pinLabels>) => {
  return (
    <connector standard="usb_c"
      pinAttributes={{ pin2: { requiresGround: true }, pin8: { requiresGround: true },
        pin9: { requiresGround: true }, pin16: { requiresGround: true }, pin17: { requiresGround: true },
        pin3: { isPassive: true }, pin7: { isPassive: true }, pin10: { isPassive: true }, pin15: { isPassive: true } }}
      pinLabels={pinLabels}
      supplierPartNumbers={{
  "jlcpcb": [
    "C7095263"
  ]
}}
      manufacturerPartNumber="USB4085-GF-A"
      footprint={<footprint>
        <platedhole  portHints={["pin1"]} pcbX="-1.27508mm" pcbY="2.180082mm" holeWidth="0.40005mm" holeHeight="0.399796mm" outerWidth="0.649986mm" outerHeight="0.649986mm" shape="pill" />
<platedhole  portHints={["pin2"]} pcbX="-2.975102mm" pcbY="2.180082mm" holeWidth="0.40005mm" holeHeight="0.399796mm" outerWidth="0.649986mm" outerHeight="0.649986mm" shape="pill" />
<platedhole  portHints={["pin3"]} pcbX="-2.124964mm" pcbY="2.180082mm" holeWidth="0.40005mm" holeHeight="0.399796mm" outerWidth="0.649986mm" outerHeight="0.649986mm" shape="pill" />
<platedhole  portHints={["pin4"]} pcbX="-0.424942mm" pcbY="2.180082mm" holeWidth="0.40005mm" holeHeight="0.399796mm" outerWidth="0.649986mm" outerHeight="0.649986mm" shape="pill" />
<platedhole  portHints={["pin5"]} pcbX="0.424942mm" pcbY="2.180082mm" holeWidth="0.40005mm" holeHeight="0.399796mm" outerWidth="0.649986mm" outerHeight="0.649986mm" shape="pill" />
<platedhole  portHints={["pin6"]} pcbX="1.27508mm" pcbY="2.180082mm" holeWidth="0.40005mm" holeHeight="0.399796mm" outerWidth="0.649986mm" outerHeight="0.649986mm" shape="pill" />
<platedhole  portHints={["pin7"]} pcbX="2.124964mm" pcbY="2.180082mm" holeWidth="0.40005mm" holeHeight="0.399796mm" outerWidth="0.649986mm" outerHeight="0.649986mm" shape="pill" />
<platedhole  portHints={["pin8"]} pcbX="2.975102mm" pcbY="2.180082mm" holeWidth="0.40005mm" holeHeight="0.399796mm" outerWidth="0.649986mm" outerHeight="0.649986mm" shape="pill" />
<platedhole  portHints={["pin9"]} pcbX="-2.975102mm" pcbY="0.830072mm" holeWidth="0.40005mm" holeHeight="0.399796mm" outerWidth="0.649986mm" outerHeight="0.649986mm" shape="pill" />
<platedhole  portHints={["pin10"]} pcbX="-2.119884mm" pcbY="0.830072mm" holeWidth="0.40005mm" holeHeight="0.399796mm" outerWidth="0.649986mm" outerHeight="0.649986mm" shape="pill" />
<platedhole  portHints={["pin11"]} pcbX="-1.27mm" pcbY="0.830072mm" holeWidth="0.40005mm" holeHeight="0.399796mm" outerWidth="0.649986mm" outerHeight="0.649986mm" shape="pill" />
<platedhole  portHints={["pin12"]} pcbX="-0.420116mm" pcbY="0.830072mm" holeWidth="0.40005mm" holeHeight="0.399796mm" outerWidth="0.649986mm" outerHeight="0.649986mm" shape="pill" />
<platedhole  portHints={["pin13"]} pcbX="0.430022mm" pcbY="0.830072mm" holeWidth="0.40005mm" holeHeight="0.399796mm" outerWidth="0.649986mm" outerHeight="0.649986mm" shape="pill" />
<platedhole  portHints={["pin14"]} pcbX="1.279906mm" pcbY="0.830072mm" holeWidth="0.40005mm" holeHeight="0.399796mm" outerWidth="0.649986mm" outerHeight="0.649986mm" shape="pill" />
<platedhole  portHints={["pin15"]} pcbX="2.130044mm" pcbY="0.830072mm" holeWidth="0.40005mm" holeHeight="0.399796mm" outerWidth="0.649986mm" outerHeight="0.649986mm" shape="pill" />
<platedhole  portHints={["pin16"]} pcbX="2.979928mm" pcbY="0.830072mm" holeWidth="0.40005mm" holeHeight="0.399796mm" outerWidth="0.649986mm" outerHeight="0.649986mm" shape="pill" />
<platedhole  portHints={["pin17"]} pcbX="-4.325112mm" pcbY="1.199896mm" holeWidth="0.599948mm" holeHeight="2.100072mm" outerWidth="0.899922mm" outerHeight="2.400046mm" shape="pill" />
<platedhole  portHints={["pin17"]} pcbX="4.325112mm" pcbY="1.199896mm" holeWidth="0.599948mm" holeHeight="2.100072mm" outerWidth="0.899922mm" outerHeight="2.400046mm" shape="pill" />
<platedhole  portHints={["pin17"]} pcbX="-4.325112mm" pcbY="-2.180082mm" holeWidth="0.599948mm" holeHeight="1.400048mm" outerWidth="0.899922mm" outerHeight="1.700022mm" shape="pill" />
<platedhole  portHints={["pin17"]} pcbX="4.325112mm" pcbY="-2.180082mm" holeWidth="0.599948mm" holeHeight="1.400048mm" outerWidth="0.899922mm" outerHeight="1.700022mm" shape="pill" />
<silkscreenpath route={[{"x":-3.509975200000099,"y":3.660089200000016},{"x":-2.269997999999987,"y":3.660089200000016},{"x":-2.89501580000001,"y":3.0500828000001547},{"x":-3.509975200000099,"y":3.665118399999983}]} />
<silkscreenpath route={[{"x":-4.469993600000066,"y":-0.4331969999999501},{"x":4.4699935999999525,"y":-0.4331969999999501}]} />
<silkscreenpath route={[{"x":4.4699935999999525,"y":2.6155142000002343},{"x":4.4699935999999525,"y":2.74010120000014},{"x":-4.449978399999964,"y":2.74010120000014}]} />
<silkscreenpath route={[{"x":4.4699935999999525,"y":-1.1144757999998092},{"x":4.4699935999999525,"y":-0.21551899999985835}]} />
<silkscreenpath route={[{"x":-4.469993600000066,"y":-3.245484999999917},{"x":-4.469993600000066,"y":-6.429883000000018},{"x":4.4699935999999525,"y":-6.429883000000018},{"x":4.4699935999999525,"y":-3.245484999999917}]} />
<silkscreenpath route={[{"x":-4.469993600000066,"y":-0.21551899999985835},{"x":-4.469993600000066,"y":-1.1144757999998092}]} />
<silkscreenpath route={[{"x":-4.469993600000066,"y":2.74010120000014},{"x":-4.469993600000066,"y":2.6155142000002343}]} />
<silkscreencircle pcbX="-2.080006mm" pcbY="-1.297686mm" radius="0.457708mm" />
<silkscreencircle pcbX="2.169922mm" pcbY="-1.297686mm" radius="0.457708mm" />
<silkscreentext text="{NAME}" pcbX="0mm" pcbY="4.674872mm" anchorAlignment="center" fontSize="1mm" />
<fabricationnotepath route={[{"x":-2.8949903999998696,"y":3.0500828000001547},{"x":-3.5099497999999585,"y":3.660089200000016},{"x":-2.284983999999895,"y":3.660089200000016},{"x":-2.8949903999998696,"y":3.0500828000001547}]} strokeWidth="0mm" isFilled hasStroke={false} />
<courtyardoutline outline={[{"x":-5.02507300000002,"y":3.010091000000102},{"x":5.02507300000002,"y":3.010091000000102},{"x":5.02507300000002,"y":-6.659867799999915},{"x":-5.02507300000002,"y":-6.659867799999915},{"x":-5.02507300000002,"y":3.010091000000102}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C7095263.obj?uuid=93a4c9e821b34e2aa62f203849b72926",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C7095263.step?uuid=93a4c9e821b34e2aa62f203849b72926",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: 1.8248883999999634, z: 0.09999559999999974 },
      }}
      {...props}
    />
  )
}
