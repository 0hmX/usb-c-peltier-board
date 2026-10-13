import type { ConnectorProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["pin1"],
  pin2: ["pin2"],
  pin3: ["pin3"],
  pin4: ["pin4"],
  pin5: ["pin5"]
} as const

export const A_2_54_1_5P___ = (props: ConnectorProps) => {
  return (
    <connector
      pinLabels={pinLabels}
      pinAttributes={{ pin1: { isPassive: true, requiresPower: true }, pin2: { isPassive: true },
        pin3: { isPassive: true }, pin4: { isPassive: true, requiresGround: true }, pin5: { isPassive: true } }}
      supplierPartNumbers={{
  "jlcpcb": [
    "C138801"
  ]
}}
      manufacturerPartNumber="2.54-1*5P反弯针"
      footprint={<footprint insertionDirection="from_bottom">
        <platedhole  portHints={["pin5"]} pcbX="5.08mm" pcbY="0mm" outerDiameter="1.5999968mm" holeDiameter="0.999998mm" shape="circle" />
<platedhole  portHints={["pin1"]} pcbX="-5.08mm" pcbY="0mm" holeWidth="0.999998mm" holeHeight="0.999998mm" outerWidth="1.5999968mm" outerHeight="1.5999968mm" rectPad={true} pcbRotation="0deg" shape="pill" />
<platedhole  portHints={["pin2"]} pcbX="-2.54mm" pcbY="0mm" outerDiameter="1.5999968mm" holeDiameter="0.999998mm" shape="circle" />
<platedhole  portHints={["pin3"]} pcbX="-0mm" pcbY="0mm" outerDiameter="1.5999968mm" holeDiameter="0.999998mm" shape="circle" />
<platedhole  portHints={["pin4"]} pcbX="2.54mm" pcbY="0mm" outerDiameter="1.5999968mm" holeDiameter="0.999998mm" shape="circle" />
<silkscreenpath route={[{"x":2.2224999999998545,"y":-4.408474799999794},{"x":2.234895199999869,"y":-4.408474799999794},{"x":2.234895199999869,"y":-10.348213999999984},{"x":2.854655199999911,"y":-10.348213999999984},{"x":2.854655199999911,"y":-10.35161759999994},{"x":2.8487623999999414,"y":-10.35161759999994},{"x":2.8487623999999414,"y":-4.36483759999976}]} />
<silkscreenpath route={[{"x":-6.350000000000023,"y":-1.7599659999998494},{"x":-6.350000000000023,"y":-4.299965999999927},{"x":6.349999999999909,"y":-4.299965999999927},{"x":6.349999999999909,"y":-1.7599659999998494},{"x":-6.350000000000023,"y":-1.7599659999998494}]} />
<silkscreenpath route={[{"x":4.762499999999932,"y":-4.408474799999794},{"x":4.774895199999946,"y":-4.408474799999794},{"x":4.774895199999946,"y":-10.348213999999984},{"x":5.394655199999988,"y":-10.348213999999984},{"x":5.394655199999988,"y":-10.35161759999994},{"x":5.388762399999905,"y":-10.35161759999994},{"x":5.388762399999905,"y":-4.36483759999976}]} />
<silkscreenpath route={[{"x":-5.40463740000007,"y":-4.408474799999794},{"x":-5.392216800000142,"y":-4.408474799999794},{"x":-5.392216800000142,"y":-10.348213999999984},{"x":-4.772482200000013,"y":-10.348213999999984},{"x":-4.772482200000013,"y":-10.35161759999994},{"x":-4.778375000000096,"y":-10.35161759999994},{"x":-4.778375000000096,"y":-4.36483759999976}]} />
<silkscreenpath route={[{"x":-0.35750500000006014,"y":-4.408550999999875},{"x":-0.3450844000001325,"y":-4.408550999999875},{"x":-0.3450844000001325,"y":-10.348290199999838},{"x":0.2746501999999964,"y":-10.348290199999838},{"x":0.2746501999999964,"y":-10.35161759999994},{"x":0.2687573999999131,"y":-10.35161759999994},{"x":0.2687573999999131,"y":-4.364888399999927}]} />
<silkscreenpath route={[{"x":-2.8334970000000794,"y":-4.408550999999875},{"x":-2.821101800000065,"y":-4.408550999999875},{"x":-2.821101800000065,"y":-10.348290199999838},{"x":-2.2013418000001366,"y":-10.348290199999838},{"x":-2.2013418000001366,"y":-10.35161759999994},{"x":-2.2072345999999925,"y":-10.35161759999994},{"x":-2.2072345999999925,"y":-4.364888399999927}]} />
<silkscreentext text="{NAME}" pcbX="-0mm" pcbY="1.861314mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-6.600000000000023,"y":1.0499984000000495},{"x":6.599974599999996,"y":1.0499984000000495},{"x":6.599974599999996,"y":-10.400043199999914},{"x":-6.600000000000023,"y":-10.400043199999914},{"x":-6.600000000000023,"y":1.0499984000000495}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C138801.obj?uuid=c371b2922e734e96a5b61f08c42e5a8b",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C138801.step?uuid=c371b2922e734e96a5b61f08c42e5a8b",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0.0000627000000705813, y: 2.8800536999999444, z: -0.000005999999999950489 },
      }}
      {...props}
    />
  )
}
