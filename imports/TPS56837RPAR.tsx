import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["EN"],
  pin2: ["FB"],
  pin3: ["AGND"],
  pin4: ["PG"],
  pin5: ["SS"],
  pin6: ["SW"],
  pin7: ["BOOT"],
  pin8: ["VIN"],
  pin9: ["PGND"],
  pin10: ["MODE"]
} as const

const pinAttributes = {
  pin3: {requiresGround: true},
  pin8: {requiresPower: true},
  pin9: {requiresGround: true}
} as const

export const TPS56837RPAR = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C22428366"
  ]
}}
      manufacturerPartNumber="TPS56837RPAR"
      footprint={<footprint>
        <smtpad portHints={["pin4"]} pcbX="0.6993636mm" pcbY="-1.4499971mm" width="0.2500122mm" height="0.5999988mm" shape="rect" />
<smtpad portHints={["pin3"]} pcbX="0.1997456mm" pcbY="-1.4499971mm" width="0.2500122mm" height="0.5999988mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="-0.3001264mm" pcbY="-1.4499971mm" width="0.2500122mm" height="0.5999988mm" shape="rect" />
<smtpad portHints={["pin1"]} pcbX="-0.8005064mm" pcbY="-1.4499971mm" width="0.2500122mm" height="0.5999988mm" shape="rect" />
<smtpad portHints={["pin5"]} pcbX="1.3498576mm" pcbY="-0.9800971mm" width="0.5999988mm" height="0.2500122mm" shape="rect" />
<smtpad portHints={["pin6"]} pcbX="0.8499856mm" pcbY="0.3201289mm" width="1.7999964mm" height="0.2500122mm" shape="rect" />
<smtpad portHints={["pin7"]} pcbX="1.3498576mm" pcbY="0.8200009mm" width="0.5999988mm" height="0.2500122mm" shape="rect" />
<smtpad portHints={["pin9"]} pcbX="-0.6999224mm" pcbY="-0.2600071mm" width="2.0999958mm" height="0.3999992mm" shape="rect" />
<smtpad portHints={["pin10"]} pcbX="-1.4499844mm" pcbY="-0.9800971mm" width="0.5999988mm" height="0.2500122mm" shape="rect" />
<smtpad portHints={["pin8"]} points={[{x: "0.3304794mm", y: "1.7499965mm"}, {x: "0.3304794mm", y: "0.7000113mm"}, {x: "-1.7495012mm", y: "0.7000113mm"}, {x: "-1.7495012mm", y: "1.1000105mm"}, {x: "-0.929513mm", y: "1.1000105mm"}, {x: "-0.929513mm", y: "1.7499965mm"}, {x: "-0.6695186mm", y: "1.7499965mm"}, {x: "-0.6695186mm", y: "1.1000105mm"}, {x: "-0.429514mm", y: "1.1000105mm"}, {x: "-0.429514mm", y: "1.7499965mm"}, {x: "-0.1695196mm", y: "1.7499965mm"}, {x: "-0.1695196mm", y: "1.1000105mm"}, {x: "0.070485mm", y: "1.1000105mm"}, {x: "0.070485mm", y: "1.7499965mm"}]} shape="polygon" />
<silkscreenpath route={[{"x":-1.6500094000000445,"y":-1.2851256999999805},{"x":-1.6500094000000445,"y":-1.6504538999998886}]} />
<silkscreenpath route={[{"x":-1.6500094000000445,"y":-0.640143500000022},{"x":-1.6500094000000445,"y":-0.674814500000025}]} />
<silkscreenpath route={[{"x":-1.6500094000000445,"y":0.5198999000000413},{"x":-1.6500094000000445,"y":0.1201039000000037}]} />
<silkscreenpath route={[{"x":-1.1096498000000565,"y":1.5495397000000821},{"x":-1.6500094000000445,"y":1.5495397000000821},{"x":-1.6500094000000445,"y":1.28017269999998}]} />
<silkscreenpath route={[{"x":1.5499841999999262,"y":1.1252072999999427},{"x":1.5499841999999262,"y":1.5495397000000821},{"x":0.5105908000000454,"y":1.5495397000000821}]} />
<silkscreenpath route={[{"x":1.5499841999999262,"y":-0.674814500000025},{"x":1.5499841999999262,"y":0.014871699999957855}]} />
<silkscreenpath route={[{"x":1.004595399999971,"y":-1.6504538999998886},{"x":1.5499841999999262,"y":-1.6504538999998886},{"x":1.5499841999999262,"y":-1.2851256999999805}]} />
<silkscreenpath route={[{"x":-1.6500094000000445,"y":-1.6504538999998886},{"x":-1.1056111999999985,"y":-1.6504538999998886}]} />
<silkscreencircle pcbX="-1.3501624mm" pcbY="-1.9503771mm" radius="0.100076mm" />
<silkscreentext text="{NAME}" pcbX="0.0133096mm" pcbY="2.7585309mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-1.9999838000001091,"y":1.999996499999952},{"x":1.9999837999999954,"y":1.999996499999952},{"x":1.9999837999999954,"y":-1.9999965000000657},{"x":-1.9999838000001091,"y":-1.9999965000000657},{"x":-1.9999838000001091,"y":1.999996499999952}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C22428366.obj?uuid=a89f1c9dac4f4f1d849f77edfbbd9516",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C22428366.step?uuid=a89f1c9dac4f4f1d849f77edfbbd9516",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0.05006339999999909, y: 0.05243829999994887, z: -0.01 },
      }}
      {...props}
    />
  )
}