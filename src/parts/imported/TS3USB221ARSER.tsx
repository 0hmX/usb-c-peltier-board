import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["1D_POS"],
  pin2: ["1D_NEG"],
  pin3: ["2D_POS"],
  pin4: ["2D_NEG"],
  pin5: ["GND"],
  pin6: ["OE"],
  pin7: ["D_NEG"],
  pin8: ["D_POS"],
  pin9: ["S"],
  pin10: ["VCC"]
} as const

export const TS3USB221ARSER = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={{ pin5: { requiresGround: true }, pin10: { requiresPower: true } }}
      supplierPartNumbers={{
  "jlcpcb": [
    "C128396"
  ]
}}
      manufacturerPartNumber="TS3USB221ARSER"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-0.750062mm" pcbY="-0.675132mm" width="0.2500122mm" height="0.5249926mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="-0.249936mm" pcbY="-0.675132mm" width="0.2500122mm" height="0.5249926mm" shape="rect" />
<smtpad portHints={["pin3"]} pcbX="0.249936mm" pcbY="-0.675132mm" width="0.2500122mm" height="0.5249926mm" shape="rect" />
<smtpad portHints={["pin4"]} pcbX="0.750062mm" pcbY="-0.675132mm" width="0.2500122mm" height="0.5249926mm" shape="rect" />
<smtpad portHints={["pin5"]} pcbX="0.8599932mm" pcbY="0mm" width="0.580009mm" height="0.2999994mm" shape="rect" />
<smtpad portHints={["pin6"]} pcbX="0.750062mm" pcbY="0.675132mm" width="0.2500122mm" height="0.5249926mm" shape="rect" />
<smtpad portHints={["pin7"]} pcbX="0.249936mm" pcbY="0.675132mm" width="0.2500122mm" height="0.5249926mm" shape="rect" />
<smtpad portHints={["pin8"]} pcbX="-0.249936mm" pcbY="0.675132mm" width="0.2500122mm" height="0.5249926mm" shape="rect" />
<smtpad portHints={["pin9"]} pcbX="-0.750062mm" pcbY="0.675132mm" width="0.2500122mm" height="0.5249926mm" shape="rect" />
<smtpad portHints={["pin10"]} pcbX="-0.8599932mm" pcbY="0mm" width="0.580009mm" height="0.2999994mm" shape="rect" />
<silkscreenpath route={[{"x":1.0702036000000135,"y":0.8499855999999681},{"x":1.0999977999998691,"y":0.8499855999999681}]} />
<silkscreenpath route={[{"x":-1.0999977999999828,"y":0.8499855999999681},{"x":-1.0702036000001272,"y":0.8499855999999681}]} />
<silkscreenpath route={[{"x":-1.0999977999999828,"y":0.3301491999999371},{"x":-1.0999977999999828,"y":0.8499855999999681}]} />
<silkscreenpath route={[{"x":-1.0702036000001272,"y":-0.850010999999995},{"x":-1.0999977999999828,"y":-0.850010999999995},{"x":-1.0999977999999828,"y":-0.3301491999998234}]} />
<silkscreenpath route={[{"x":1.0999977999998691,"y":-0.3301491999998234},{"x":1.0999977999998691,"y":-0.850010999999995},{"x":1.0702036000000135,"y":-0.850010999999995}]} />
<silkscreenpath route={[{"x":1.0999977999998691,"y":0.8499855999999681},{"x":1.0999977999998691,"y":0.3301491999999371}]} />
<silkscreenpath route={[{"x":-0.6751319999999623,"y":-1.199895999999967},{"x":-0.6776851778361106,"y":-1.2192893110494651},{"x":-0.6851707164944401,"y":-1.237361000000078},{"x":-0.6970784888857224,"y":-1.2528795111143154},{"x":-0.7125970000000734,"y":-1.264787283505484},{"x":-0.7306686889505727,"y":-1.2722728221638135},{"x":-0.7500620000000708,"y":-1.2748259999999618},{"x":-0.769455311049569,"y":-1.2722728221638135},{"x":-0.7875269999999546,"y":-1.264787283505484},{"x":-0.8030455111143056,"y":-1.2528795111143154},{"x":-0.8149532835055879,"y":-1.237361000000078},{"x":-0.8224388221639174,"y":-1.2192893110494651},{"x":-0.8249920000000657,"y":-1.199895999999967},{"x":-0.8224388221639174,"y":-1.1805026889504688},{"x":-0.8149532835055879,"y":-1.1624309999999696},{"x":-0.8030455111143056,"y":-1.146912488885846},{"x":-0.7875269999999546,"y":-1.13500471649445},{"x":-0.769455311049569,"y":-1.1275191778361204},{"x":-0.7500620000000708,"y":-1.1249660000000858},{"x":-0.7306686889505727,"y":-1.1275191778361204},{"x":-0.7125970000000734,"y":-1.13500471649445},{"x":-0.6970784888857224,"y":-1.146912488885846},{"x":-0.6851707164944401,"y":-1.1624309999999696},{"x":-0.6776851778361106,"y":-1.1805026889504688},{"x":-0.6751319999999623,"y":-1.199895999999967}]} />
<silkscreentext text="{NAME}" pcbX="0.0127mm" pcbY="1.9398mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-1.393000000000029,"y":1.189799999999991},{"x":1.418399999999906,"y":1.189799999999991},{"x":1.418399999999906,"y":-1.5199999999999818},{"x":-1.393000000000029,"y":-1.5199999999999818},{"x":-1.393000000000029,"y":1.189799999999991}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C128396.obj?uuid=0d4863c7ce0547a4bbb320a855cfdb87",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C128396.step?uuid=0d4863c7ce0547a4bbb320a855cfdb87",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: 0, z: -0.02 },
      }}
      {...props}
    />
  )
}
