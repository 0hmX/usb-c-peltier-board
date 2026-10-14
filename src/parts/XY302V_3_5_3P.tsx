import type { ConnectorProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["pin1"],
  pin2: ["pin2"],
  pin3: ["pin3"]
} as const

export const XY302V_3_5_3P = (props: ConnectorProps) => {
  return (
    <connector
      pinLabels={pinLabels}
      symbol={<symbol>
        <schematicpath points={[{ x: -2, y: 1.8 }, { x: 2, y: 1.8 }, { x: 2, y: -1.8 }, { x: -2, y: -1.8 }, { x: -2, y: 1.8 }]}
          strokeWidth={0.04} strokeColor="#880000" />
        <port name="pin1" pinNumber={1} direction="left" schX={-2.5} schY={1.2} schStemLength={0.5} />
        <port name="pin2" pinNumber={2} direction="left" schX={-2.5} schY={0} schStemLength={0.5} />
        <port name="pin3" pinNumber={3} direction="left" schX={-2.5} schY={-1.2} schStemLength={0.5} />
        <schematictext text="1  3V3 / RED" schX={-1.65} schY={1.2} anchor="center_left" fontSize={0.28} />
        <schematictext text="2  DATA / YELLOW" schX={-1.65} schY={0} anchor="center_left" fontSize={0.28} />
        <schematictext text="3  GND / BLACK" schX={-1.65} schY={-1.2} anchor="center_left" fontSize={0.28} />
        <schematictext text="{NAME}" schX={0} schY={2.1} anchor="bottom_center" fontSize={0.3} />
      </symbol>}
      supplierPartNumbers={{
  "jlcpcb": [
    "C784941"
  ]
}}
      manufacturerPartNumber="XY302V-3.5-3P"
      footprint={<footprint>
        <platedhole  portHints={["pin1"]} pcbX="-3.499993mm" pcbY="0mm" outerDiameter="1.6999966mm" holeDiameter="1.1000232mm" shape="circle" />
<platedhole  portHints={["pin2"]} pcbX="0mm" pcbY="0mm" outerDiameter="1.6999966mm" holeDiameter="1.1000232mm" shape="circle" />
<platedhole  portHints={["pin3"]} pcbX="3.499993mm" pcbY="0mm" outerDiameter="1.6999966mm" holeDiameter="1.1000232mm" shape="circle" />
<silkscreenpath route={[{"x":-5.25000220000004,"y":-2.410637799999904},{"x":5.250002199999926,"y":-2.410637799999904}]} />
<silkscreenpath route={[{"x":-5.25000220000004,"y":-2.809798799999953},{"x":5.250002199999926,"y":-2.809798799999953}]} />
<silkscreenpath route={[{"x":5.250002199999926,"y":-1.872411800000009},{"x":5.800013799999988,"y":-1.872411800000009},{"x":5.800013799999988,"y":-2.3546054000000822},{"x":5.250002199999926,"y":-2.3546054000000822}]} />
<silkscreenpath route={[{"x":5.250002199999926,"y":3.1821881999999277},{"x":5.800013799999988,"y":3.1821881999999277},{"x":5.800013799999988,"y":2.699994600000082},{"x":5.250002199999926,"y":2.699994600000082}]} />
<silkscreenpath route={[{"x":2.1493225999998913,"y":3.8999922000000424},{"x":2.1493225999998913,"y":3.4999930000000177},{"x":2.8704031999999415,"y":3.4999930000000177},{"x":2.8704031999999415,"y":3.8999922000000424}]} />
<silkscreenpath route={[{"x":-0.37797740000007707,"y":3.8999922000000424},{"x":-0.37797740000007707,"y":3.4999930000000177},{"x":0.3431031999999732,"y":3.4999930000000177},{"x":0.3431031999999732,"y":3.8999922000000424}]} />
<silkscreenpath route={[{"x":-2.9687774000000218,"y":3.8999922000000424},{"x":-2.9687774000000218,"y":3.4999930000000177},{"x":-2.2476967999999715,"y":3.4999930000000177},{"x":-2.2476967999999715,"y":3.8999922000000424}]} />
<silkscreenpath route={[{"x":-3.5366452000000663,"y":2.975432200000114},{"x":3.4999930000000177,"y":2.975432200000114}]} />
<silkscreenpath route={[{"x":-3.5366452000000663,"y":3.8999922000000424},{"x":-3.5366452000000663,"y":2.4999950000001263},{"x":3.4999930000000177,"y":2.4999950000001263},{"x":3.4999930000000177,"y":3.8999922000000424}]} />
<silkscreenpath route={[{"x":-5.25000220000004,"y":-3.4000186000000667},{"x":5.250002199999926,"y":-3.4000186000000667}]} />
<silkscreenpath route={[{"x":5.250002199999926,"y":3.8999922000000424},{"x":5.250002199999926,"y":-3.4000186000000667}]} />
<silkscreenpath route={[{"x":-5.25000220000004,"y":3.8999922000000424},{"x":-5.25000220000004,"y":-3.4000186000000667}]} />
<silkscreenpath route={[{"x":-5.25000220000004,"y":3.8999922000000424},{"x":5.250002199999926,"y":3.8999922000000424}]} />
<silkscreentext text="{NAME}" pcbX="0.2667mm" pcbY="4.9116mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-5.474983199999997,"y":4.149992200000042},{"x":6.024994799999945,"y":4.149992200000042},{"x":6.024994799999945,"y":-3.649993199999926},{"x":-5.474983199999997,"y":-3.649993199999926},{"x":-5.474983199999997,"y":4.149992200000042}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C784941.obj?uuid=ce97c0b00e884dd99d85dccd2888bd94",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C784941.step?uuid=ce97c0b00e884dd99d85dccd2888bd94",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: -0.025005799999917144, y: -0.2499995000000581, z: -0.000006999999999646178 },
      }}
      {...props}
    />
  )
}
