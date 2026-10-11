// JLC silk audit: explicit graphic strokes >=0.15 mm; USB/cap outline ends trimmed for >=0.15 mm own-mask clearance. Copper/drills/courtyards preserved.
// Imported EasyEDA/JLCPCB C165948, reviewed and edited in place against HRO manufacturer land pattern (2026-10-10); observed 2026-10-10T03:14:11.325936+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C165948
// Corrections: 1.14 mm contact-pad length; peg-relative y=[+0.50,+1.64]; shell slots 0.60x1.70/1.40 with JLC-adapted 1.00x2.10/1.80 copper (0.20 mm annular ring).
// Datasheet: https://datasheet.lcsc.com/datasheet/pdf/9e56b777c022540fcce7c7f67825f55e.pdf?productCode=C165948 (HRO rev 2020-12-08).
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["EH2"],
  pin2: ["EH1"],
  pin3: ["EH4"],
  pin4: ["EH3"],
  pin5: ["SBU2","B8"],
  pin6: ["CC1","A5"],
  pin7: ["DN2","B7"],
  pin8: ["DP1","A6"],
  pin9: ["DN1","A7"],
  pin10: ["DP2","B6"],
  pin11: ["SBU1","A8"],
  pin12: ["CC2","B5"],
  pin13: ["GND1","A1B12"],
  pin14: ["GND2","B1A12"],
  pin15: ["VBUS1","B4A9"],
  pin16: ["VBUS2","A4B9"]
} as const

export const TYPE_C_31_M_12 = (props: ChipProps<typeof pinLabels>) => {
  return (
    <connector
      standard="usb_c"
      pinLabels={pinLabels}
      supplierPartNumbers={{
  "jlcpcb": [
    "C165948"
  ]
}}
      manufacturerPartNumber="TYPE-C-31-M-12"
      footprint={<footprint>
        <hole pcbX="-2.899918mm" pcbY="0.9055672mm" diameter="0.5999988mm" />
<hole pcbX="2.899918mm" pcbY="0.9055672mm" diameter="0.5999988mm" />
<platedhole  portHints={["pin2"]} pcbX="4.325112mm" pcbY="-2.7741308mm" holeWidth="0.6mm" holeHeight="1.4mm" outerWidth="1.0mm" outerHeight="1.8mm" shape="pill" />
<platedhole  portHints={["pin1"]} pcbX="4.325112mm" pcbY="1.4056932mm" holeWidth="0.6mm" holeHeight="1.7mm" outerWidth="1.0mm" outerHeight="2.1mm" shape="pill" />
<platedhole  portHints={["pin4"]} pcbX="-4.325112mm" pcbY="1.4056932mm" holeWidth="0.6mm" holeHeight="1.7mm" outerWidth="1.0mm" outerHeight="2.1mm" shape="pill" />
<platedhole  portHints={["pin3"]} pcbX="-4.325112mm" pcbY="-2.7741308mm" holeWidth="0.6mm" holeHeight="1.4mm" outerWidth="1.0mm" outerHeight="1.8mm" shape="pill" />
<smtpad portHints={["pin5"]} pcbX="-1.75006mm" pcbY="1.9755672mm" width="0.2999994mm" height="1.14mm" shape="rect" />
<smtpad portHints={["pin6"]} pcbX="-1.249934mm" pcbY="1.9755672mm" width="0.2999994mm" height="1.14mm" shape="rect" />
<smtpad portHints={["pin7"]} pcbX="-0.750062mm" pcbY="1.9755672mm" width="0.2999994mm" height="1.14mm" shape="rect" />
<smtpad portHints={["pin8"]} pcbX="-0.249936mm" pcbY="1.9755672mm" width="0.2999994mm" height="1.14mm" shape="rect" />
<smtpad portHints={["pin9"]} pcbX="0.249936mm" pcbY="1.9755672mm" width="0.2999994mm" height="1.14mm" shape="rect" />
<smtpad portHints={["pin10"]} pcbX="0.750062mm" pcbY="1.9755672mm" width="0.2999994mm" height="1.14mm" shape="rect" />
<smtpad portHints={["pin11"]} pcbX="1.24968mm" pcbY="1.9755672mm" width="0.2999994mm" height="1.14mm" shape="rect" />
<smtpad portHints={["pin12"]} pcbX="1.75006mm" pcbY="1.9755672mm" width="0.2999994mm" height="1.14mm" shape="rect" />
<smtpad portHints={["pin13"]} points={[{x: "-2.8999688mm", y: "1.4055672mm"}, {x: "-2.8999688mm", y: "2.5455672mm"}, {x: "-2.8999688mm", y: "2.5455672mm"}, {x: "-3.1999682mm", y: "2.5455672mm"}, {x: "-3.1999682mm", y: "2.5455672mm"}, {x: "-3.1999682mm", y: "2.5455672mm"}, {x: "-3.1999682mm", y: "2.5455672mm"}, {x: "-3.4999422mm", y: "2.5455672mm"}, {x: "-3.4999422mm", y: "2.5455672mm"}, {x: "-3.4999422mm", y: "1.4055672mm"}, {x: "-3.4999422mm", y: "1.4055672mm"}, {x: "-3.1999428mm", y: "1.4055672mm"}, {x: "-3.1999428mm", y: "1.4055672mm"}, {x: "-3.1999428mm", y: "1.4055672mm"}, {x: "-3.1999428mm", y: "1.4055672mm"}, {x: "-2.8999688mm", y: "1.4055672mm"}]} shape="polygon" />
<smtpad portHints={["pin14"]} points={[{x: "2.8999942mm", y: "2.5455672mm"}, {x: "2.8999942mm", y: "1.4055672mm"}, {x: "2.8999942mm", y: "1.4055672mm"}, {x: "3.1999936mm", y: "1.4055672mm"}, {x: "3.1999936mm", y: "1.4055672mm"}, {x: "3.200019mm", y: "1.4055672mm"}, {x: "3.200019mm", y: "1.4055672mm"}, {x: "3.5000184mm", y: "1.4055672mm"}, {x: "3.5000184mm", y: "1.4055672mm"}, {x: "3.5000184mm", y: "2.5455672mm"}, {x: "3.5000184mm", y: "2.5455672mm"}, {x: "3.200019mm", y: "2.5455672mm"}, {x: "3.200019mm", y: "2.5455672mm"}, {x: "3.1999936mm", y: "2.5455672mm"}, {x: "3.1999936mm", y: "2.5455672mm"}, {x: "2.8999942mm", y: "2.5455672mm"}]} shape="polygon" />
<smtpad portHints={["pin15"]} points={[{x: "2.7001724mm", y: "1.4055672mm"}, {x: "2.7001724mm", y: "2.5455672mm"}, {x: "2.7001724mm", y: "2.5455672mm"}, {x: "2.400173mm", y: "2.5455672mm"}, {x: "2.400173mm", y: "2.5455672mm"}, {x: "2.4001476mm", y: "2.5455672mm"}, {x: "2.4001476mm", y: "2.5455672mm"}, {x: "2.1001482mm", y: "2.5455672mm"}, {x: "2.1001482mm", y: "2.5455672mm"}, {x: "2.1001482mm", y: "1.4055672mm"}, {x: "2.1001482mm", y: "1.4055672mm"}, {x: "2.4001476mm", y: "1.4055672mm"}, {x: "2.4001476mm", y: "1.4055672mm"}, {x: "2.400173mm", y: "1.4055672mm"}, {x: "2.400173mm", y: "1.4055672mm"}, {x: "2.7001724mm", y: "1.4055672mm"}]} shape="polygon" />
<smtpad portHints={["pin16"]} points={[{x: "-2.0999704mm", y: "1.4055672mm"}, {x: "-2.0999704mm", y: "2.5455672mm"}, {x: "-2.0999704mm", y: "2.5455672mm"}, {x: "-2.3999952mm", y: "2.5455672mm"}, {x: "-2.3999952mm", y: "2.5455672mm"}, {x: "-2.3999952mm", y: "2.5455672mm"}, {x: "-2.3999952mm", y: "2.5455672mm"}, {x: "-2.6999438mm", y: "2.5455672mm"}, {x: "-2.6999438mm", y: "2.5455672mm"}, {x: "-2.6999438mm", y: "1.4055672mm"}, {x: "-2.6999438mm", y: "1.4055672mm"}, {x: "-2.399919mm", y: "1.4055672mm"}, {x: "-2.399919mm", y: "1.4055672mm"}, {x: "-2.399919mm", y: "1.4055672mm"}, {x: "-2.399919mm", y: "1.4055672mm"}, {x: "-2.0999704mm", y: "1.4055672mm"}]} shape="polygon" />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":-4.4689776000000165,"y":-1.5741308},{"x":-4.4689776000000165,"y":0.0556932}]} />
<silkscreenpath strokeWidth="0.15mm" route={[{"x":4.471009600000116,"y":-1.5741308},{"x":4.471009600000116,"y":0.0556932}]} />
<courtyardoutline outline={[{"x":-5.17511079999997,"y":3.074130799999921},{"x":5.17511079999997,"y":3.074130799999921},{"x":5.17511079999997,"y":-5.60002099999997},{"x":-5.17511079999997,"y":-5.60002099999997},{"x":-5.17511079999997,"y":3.074130799999921}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C165948.obj?uuid=617b05f9bba7410b96c001093d8189e4",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C165948.step?uuid=617b05f9bba7410b96c001093d8189e4",
        pcbRotationOffset: 180,
        modelOriginPosition: { x: 0, y: -2.7500289000000517, z: 0.000010999999999872223 },
      }}
      {...props}
    />
  )
}
