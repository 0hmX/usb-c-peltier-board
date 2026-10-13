import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["pin1"],
  pin2: ["pin2"],
  pin3: ["pin3"],
  pin4: ["pin4"],
  pin5: ["pin5"],
  pin6: ["pin6"]
} as const

export const USBLC6_2SC6 = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={{ pin2: { requiresGround: true }, pin5: { requiresPower: true } }}
      symbol={
        <symbol>
          <schematicrect schX={0} schY={0} width={22.86} height={25.4} strokeWidth={0.254} color="#880000" isFilled fillColor="#FFFFFF" />
          <port name="pin1" pinNumber={1} aliases={["1"]} direction="left" schX={-16.51} schY={7.62} schStemLength={5.08} />
          <port name="pin2" pinNumber={2} aliases={["2"]} direction="left" schX={-16.51} schY={0} schStemLength={5.08} />
          <port name="pin3" pinNumber={3} aliases={["3"]} direction="left" schX={-16.51} schY={-7.62} schStemLength={5.08} />
          <port name="pin4" pinNumber={4} aliases={["4"]} direction="right" schX={16.51} schY={-7.62} schStemLength={5.08} />
          <port name="pin5" pinNumber={5} aliases={["5"]} direction="right" schX={16.51} schY={0} schStemLength={5.08} />
          <port name="pin6" pinNumber={6} aliases={["6"]} direction="right" schX={16.51} schY={7.62} schStemLength={5.08} />
          <schematicpath points={[{"x":-11.43,"y":7.62},{"x":11.43,"y":7.62}]} strokeWidth={0.254} strokeColor="#880000" />
          <schematicpath points={[{"x":-11.43,"y":-7.62},{"x":11.43,"y":-7.62}]} strokeWidth={0.254} strokeColor="#880000" />
          <schematicpath points={[{"x":-11.43,"y":0},{"x":11.43,"y":0}]} strokeWidth={0.254} strokeColor="#880000" />
          <schematicpath svgPath="M -1.778 -1.524 L 0.762 0 L -1.778 1.778 Z" strokeWidth={0.254} strokeColor="#880000" isFilled fillColor="#880000" />
          <schematicpath points={[{"x":1.27,"y":2.032},{"x":0.762,"y":2.032},{"x":0.762,"y":-1.778},{"x":0,"y":-1.778}]} strokeWidth={0.254} strokeColor="#880000" />
          <schematicpath points={[{"x":-8.636,"y":0},{"x":-8.636,"y":5.08},{"x":8.382,"y":5.08},{"x":8.382,"y":-5.08},{"x":-8.636,"y":-5.08},{"x":-8.636,"y":0}]} strokeWidth={0.254} strokeColor="#880000" />
          <schematicpath points={[{"x":0,"y":7.62},{"x":0,"y":5.08}]} strokeWidth={0.254} strokeColor="#880000" />
          <schematicpath points={[{"x":0,"y":-7.62},{"x":0,"y":-5.08}]} strokeWidth={0.254} strokeColor="#880000" />
          <schematicpath svgPath="M -5.842 3.556 L -3.302 5.08 L -5.842 6.858 Z" strokeWidth={0.254} strokeColor="#880000" isFilled fillColor="#880000" />
          <schematicpath points={[{"x":-3.302,"y":7.112},{"x":-3.302,"y":7.112},{"x":-3.302,"y":3.302},{"x":-3.302,"y":3.302}]} strokeWidth={0.254} strokeColor="#880000" />
          <schematicpath svgPath="M 2.794 3.556 L 5.334 5.08 L 2.794 6.858 Z" strokeWidth={0.254} strokeColor="#880000" isFilled fillColor="#880000" />
          <schematicpath points={[{"x":5.334,"y":7.112},{"x":5.334,"y":7.112},{"x":5.334,"y":3.302},{"x":5.334,"y":3.302}]} strokeWidth={0.254} strokeColor="#880000" />
          <schematicpath svgPath="M -6.096 -6.604 L -3.556 -5.08 L -6.096 -3.302 Z" strokeWidth={0.254} strokeColor="#880000" isFilled fillColor="#880000" />
          <schematicpath points={[{"x":-3.556,"y":-3.048},{"x":-3.556,"y":-3.048},{"x":-3.556,"y":-6.858},{"x":-3.556,"y":-6.858}]} strokeWidth={0.254} strokeColor="#880000" />
          <schematicpath svgPath="M 2.794 -6.604 L 5.334 -5.08 L 2.794 -3.302 Z" strokeWidth={0.254} strokeColor="#880000" isFilled fillColor="#880000" />
          <schematicpath points={[{"x":5.334,"y":-3.048},{"x":5.334,"y":-3.048},{"x":5.334,"y":-6.858},{"x":5.334,"y":-6.858}]} strokeWidth={0.254} strokeColor="#880000" />
          <schematiccircle center={{ x: 0, y: 7.62 }} radius={0.254} strokeWidth={0.254} color="#880000" />
          <schematiccircle center={{ x: 0, y: 5.08 }} radius={0.254} strokeWidth={0.254} color="#880000" />
          <schematiccircle center={{ x: -8.636, y: 0 }} radius={0.254} strokeWidth={0.254} color="#880000" />
          <schematiccircle center={{ x: 8.382, y: 0 }} radius={0.254} strokeWidth={0.254} color="#880000" />
          <schematiccircle center={{ x: 0, y: -5.08 }} radius={0.254} strokeWidth={0.254} color="#880000" />
          <schematiccircle center={{ x: 0, y: -7.62 }} radius={0.254} strokeWidth={0.254} color="#880000" />
        </symbol>
      }
      supplierPartNumbers={{
  "jlcpcb": [
    "C7519"
  ]
}}
      manufacturerPartNumber="USBLC6_2SC6"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-0.94996mm" pcbY="-1.149096mm" width="0.532003mm" height="1.072007mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="0mm" pcbY="-1.149096mm" width="0.532003mm" height="1.072007mm" shape="rect" />
<smtpad portHints={["pin3"]} pcbX="0.94996mm" pcbY="-1.149096mm" width="0.532003mm" height="1.072007mm" shape="rect" />
<smtpad portHints={["pin4"]} pcbX="0.94996mm" pcbY="1.149096mm" width="0.532003mm" height="1.072007mm" shape="rect" />
<smtpad portHints={["pin5"]} pcbX="0mm" pcbY="1.149096mm" width="0.532003mm" height="1.072007mm" shape="rect" />
<smtpad portHints={["pin6"]} pcbX="-0.94996mm" pcbY="1.149096mm" width="0.532003mm" height="1.072007mm" shape="rect" />
<silkscreenpath route={[{"x":1.5391891999998961,"y":-0.8892031999998835},{"x":1.5391891999998961,"y":0.8892031999999972}]} />
<silkscreenpath route={[{"x":-1.5391892000000098,"y":-0.8892031999998835},{"x":-1.5391892000000098,"y":0.8892031999999972}]} />
<silkscreenpath route={[{"x":-1.518158000000085,"y":-1.3014960000000428},{"x":-1.5232730105126393,"y":-1.3403483621364103},{"x":-1.538269462536391,"y":-1.3765529999999444},{"x":-1.5621253726490067,"y":-1.4076426273509242},{"x":-1.5932150000001002,"y":-1.4314985374635398},{"x":-1.6294196378635206,"y":-1.4464949894874053},{"x":-1.6682720000001154,"y":-1.451609999999846},{"x":-1.7071243621367103,"y":-1.4464949894874053},{"x":-1.7433290000001307,"y":-1.4314985374635398},{"x":-1.7744186273511104,"y":-1.4076426273509242},{"x":-1.7982745374637261,"y":-1.3765529999999444},{"x":-1.8132709894875916,"y":-1.3403483621364103},{"x":-1.818386000000146,"y":-1.3014960000000428},{"x":-1.8132709894875916,"y":-1.2626436378633343},{"x":-1.7982745374637261,"y":-1.226438999999914},{"x":-1.7744186273511104,"y":-1.1953493726489341},{"x":-1.7433290000001307,"y":-1.1714934625363185},{"x":-1.7071243621367103,"y":-1.156497010512453},{"x":-1.6682720000001154,"y":-1.1513819999998987},{"x":-1.6294196378635206,"y":-1.156497010512453},{"x":-1.5932150000001002,"y":-1.1714934625363185},{"x":-1.5621253726490067,"y":-1.1953493726489341},{"x":-1.538269462536391,"y":-1.226438999999914},{"x":-1.5232730105126393,"y":-1.2626436378633343},{"x":-1.518158000000085,"y":-1.3014960000000428}]} />
<silkscreentext text="{NAME}" pcbX="-0.1524mm" pcbY="2.6764mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-2.078800000000001,"y":1.9264000000000578},{"x":1.7739999999998872,"y":1.9264000000000578},{"x":1.7739999999998872,"y":-2.0279999999999063},{"x":-2.078800000000001,"y":-2.0279999999999063},{"x":-2.078800000000001,"y":1.9264000000000578}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C7519.obj?uuid=229b69761e2c45dba6a83d8866dec72d",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C7519.step?uuid=229b69761e2c45dba6a83d8866dec72d",
        pcbRotationOffset: 90,
        modelOriginPosition: { x: -0.000012700000070253736, y: 0.000012700000070253736, z: -0.048939 },
      }}
      {...props}
    />
  )
}
