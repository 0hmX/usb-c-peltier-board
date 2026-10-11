import React from "react"
import { SchmittBuffer, R, C } from "../parts"
import { LTST_C190KGKT as GreenLed } from "../parts/C125094"
import { LTST_C190KRKT as RedLed } from "../parts/C94869"
import { debugRailIndicators, debugStatusIndicators, debugTestPoints, debugGroundTestPoints } from "./debug-data"
import { attachLogicSupplyInner2Port } from "../logic-supply-links"

type Point = { x: number; y: number }
type Pair = [number, number]
// The current core interprets numeric waypoints relative to the component origin,
// even when pcbPathRelativeTo names a pin. Invert the component's real rotation.
const relativePoint = (point: Point, origin: Point, rotation = 0): Point => {
  const angle = rotation * Math.PI / 180, dx = point.x - origin.x, dy = point.y - origin.y
  return { x: dx * Math.cos(angle) + dy * Math.sin(angle), y: -dx * Math.sin(angle) + dy * Math.cos(angle) }
}

// Reviewed limited-current lanes. Each end is a real through barrel; the
// resistor input pickups and high-current supply copper remain independent.
const railSeriesPaths: Record<string, { layer: "inner2" | "bottom"; points: Pair[]; maxLength?: number }> = {
  D501: { layer: "bottom", points: [[-44.15, 19], [-45.7, 17.45], [-45.7, -3.277207794], [-43.613603897, -5.363603897]], maxLength: 33.96563491874618 },
  D502: { layer: "inner2", points: [[-10, 25.5], [-10, 25.028750000000002], [-22, 13.028750000000002], [-25.5, 13.028750000000002], [-29.5, 9.028750000000002], [-29.5, 4.7287500000000025], [-32, 2.2287500000000025], [-32.8, 2.2287500000000025], [-37.613603897, -2.584853896999995], [-37.613603897, -5.363603897]] },
  D503: { layer: "bottom", points: [[-6.110660171779821, -7.639339828220178], [-7.113603897, -6.636396103], [-31.613603897, -6.636396103]] },
  D504: { layer: "inner2", points: [[44.260660171779826, -20.889339828220177], [39.871320343559645, -16.5], [-39.75, -16.5], [-43.613603897, -12.636396103]] },
  D505: { layer: "inner2", points: [[28.4, -10.05], [28.4, -11.6], [29.25, -12.45], [29.25, -15.25], [28.45, -16.05], [-36.613603897, -16.05], [-37.613603897, -15.05], [-37.613603897, -12.636396103]] },
}

// Filter-cap pickups remain downstream of the existing analogue filters.
// Real full-through barrels cross the protected-rail and feedback corridors.
const filteredProbePaths = [
  { probe: "TP06", cap: "C209", net: "HOT_ADC", capOrigin: [5.5, -3.5], points: [
    [[4.8, -3.5], [4.05, -3.5]], [[4.05, -3.5], [4.8, -2.75], [4.8, -1.85]], [[4.8, -1.85], [4.8, -0.7]],
  ] },
  { probe: "TP07", cap: "C210", net: "COLD_ADC", capOrigin: [8.5, -3.5], points: [
    [[7.8, -3.5], [7.7, -3.6], [7.7, -4.9], [7.45, -5.15], [7.45, -6.05], [8, -6.6]],
    [[8, -6.6], [7.7, -6.3], [7.7, -3.7], [6.21, -2.21], [6.21, -0.7]], [[6.21, -0.7], [7.8, -0.7]],
  ] },
  { probe: "TP08", cap: "C211", net: "VBUS_ADC", capOrigin: [11.5, -3.5], points: [
    [[10.8, -3.5], [12.3, -5], [12.3, -6.25]], [[12.3, -6.25], [12.3, -3.79], [9.21, -0.7]], [[9.21, -0.7], [10.8, -0.7]],
  ] },
  { probe: "TP09", cap: "C212", net: "VOUT_ADC", capOrigin: [14.5, -3.5], points: [
    [[13.8, -3.5], [13.8, -4.05], [14.45, -4.7], [16.5, -4.7], [16.5, -5.5]],
    [[16.5, -5.5], [12.21, -1.21], [12.21, -0.7]], [[12.21, -0.7], [13.8, -0.7]],
  ] },
] as const

export const debugConnectionPlans = [
  ...debugRailIndicators.map(item => ({ name: `${item.led}_SERIES`, net: `${item.led}_A`,
    from: `${item.resistor}.pin2`, to: `${item.led}.pin2`,
    traces: [`${item.led}_SERIES_FROM`, `${item.led}_SERIES_TRUNK`, `${item.led}_SERIES_TO`] })),
  { name: "D506_BUFFERED_CATHODE", net: "DBG_PD_GATE", from: "U_DBG1.pin6", to: "D506.pin1", traces: ["D506_BUFFERED_CATHODE"] },
  { name: "TP14_BUFFERED_BRANCH", net: "DBG_PD_GATE", from: "U_DBG1.pin6", to: "TP14.pin1", traces: ["TP14_BUFFERED_BRANCH"] },
  { name: "D508_BUFFERED_CATHODE", net: "DBG_HW_INHIBIT", from: "U_DBG2.pin6", to: "D508.pin1", traces: ["D508_BUFFERED_FROM", "D508_BUFFERED_TRUNK", "D508_BUFFERED_TO"] },
  { name: "TP16_BUFFERED_BRANCH", net: "DBG_HW_INHIBIT", from: "U_DBG2.pin6", to: "TP16.pin1", traces: ["D508_BUFFERED_FROM", "TP16_BUFFERED_BRANCH"] },
  ...filteredProbePaths.map(item => ({ name: `${item.probe}_FILTERED_TAP`, net: item.net,
    from: `${item.cap}.pin1`, to: `${item.probe}.pin1`,
    traces: [`${item.probe}_FILTERED_FROM`, `${item.probe}_FILTERED_TRUNK`, `${item.probe}_FILTERED_TO`] })),
] as const

function RoutedTrace({ name, from, to, origin, points, rotation = 0, maxLength }: {
  name: string; from: string; to: string; origin: Point; points: Pair[]; rotation?: number; maxLength?: number
}) {
  const length = points.reduce((sum, p, i) => i ? sum + Math.hypot(p[0] - points[i - 1]![0], p[1] - points[i - 1]![1]) : 0, 0)
  return <trace name={name} from={from} to={to} thickness={0.2} maxLength={maxLength ?? length + 0.01}
    pcbPathRelativeTo={from} pcbPath={[from, ...points.slice(1, -1).map(([x, y]) => relativePoint({ x, y }, origin, rotation)), to]} />
}

function RailSeries({ item }: { item: typeof debugRailIndicators[number] }) {
  const plan = railSeriesPaths[item.led]!, start = plan.points[0]!, end = plan.points.at(-1)!
  const fromVia = `${item.led}_SERIES_FROM_VIA`, toVia = `${item.led}_SERIES_TO_VIA`
  const a = item.resistorPosition.rotation * Math.PI / 180
  const resistorPad: Pair = [item.resistorPosition.x + 0.75 * Math.cos(a), item.resistorPosition.y + 0.75 * Math.sin(a)]
  return <>
    {[{ name: fromVia, point: start }, { name: toVia, point: end }].map(({ name, point }) => <React.Fragment key={name}>
      <via name={name} pcbX={point[0]} pcbY={point[1]} holeDiameter={0.3} outerDiameter={0.7}
        fromLayer="top" toLayer="bottom" connectsTo={`net.${item.led}_A`} tented
        {...(plan.layer === "inner2" || item.led === "D501" ? { ref: attachLogicSupplyInner2Port } : {})} />
    </React.Fragment>)}
    <RoutedTrace name={`${item.led}_SERIES_FROM`} from={`${item.resistor}.pin2`} to={`${fromVia}.top`}
      origin={item.resistorPosition} rotation={item.resistorPosition.rotation} points={[resistorPad, start]} />
    <RoutedTrace name={`${item.led}_SERIES_TRUNK`} from={`${fromVia}.${plan.layer}`} to={`${toVia}.${plan.layer}`}
      origin={{ x: start[0], y: start[1] }} points={plan.points} maxLength={plan.maxLength} />
    <RoutedTrace name={`${item.led}_SERIES_TO`} from={`${toVia}.top`} to={`${item.led}.pin2`}
      origin={{ x: end[0], y: end[1] }} points={[end, [item.x + 0.75, item.y]]} />
  </>
}

function BufferedStatusRoutes() {
  return <>
    <via name="LOCAL_HW_BUFFER_EXIT" pcbX={-36.5} pcbY={-23.05} holeDiameter={0.3} outerDiameter={0.7}
      fromLayer="top" toLayer="bottom" connectsTo="net.DBG_HW_INHIBIT" tented {...{ ref: attachLogicSupplyInner2Port }} />
    <via name="LOCAL_HW_LED_ENTRY" pcbX={-32.85} pcbY={-17.25} holeDiameter={0.3} outerDiameter={0.7}
      fromLayer="top" toLayer="bottom" connectsTo="net.DBG_HW_INHIBIT" tented {...{ ref: attachLogicSupplyInner2Port }} />
    <RoutedTrace name="D506_BUFFERED_CATHODE" from="U_DBG1.pin6" to="D506.pin1" origin={{ x: -42, y: -24 }}
      points={[[-42.95, -22.7], [-45.45, -22.7], [-45.75, -22.4], [-45.75, -18]]} />
    <RoutedTrace name="TP14_BUFFERED_BRANCH" from="U_DBG1.pin6" to="TP14.pin1" origin={{ x: -42, y: -24 }}
      points={[[-42.95, -22.7], [-45.2, -22.7], [-46, -23.5]]} />
    <RoutedTrace name="D508_BUFFERED_FROM" from="U_DBG2.pin6" to="LOCAL_HW_BUFFER_EXIT.top" origin={{ x: -34, y: -24 }}
      points={[[-34.95, -22.7], [-35.3, -23.05], [-36.5, -23.05]]} />
    <RoutedTrace name="D508_BUFFERED_TRUNK" from="LOCAL_HW_BUFFER_EXIT.inner2" to="LOCAL_HW_LED_ENTRY.inner2" origin={{ x: -36.5, y: -23.05 }}
      points={[[-36.5, -23.05], [-36.5, -22.19], [-32.85, -18.54], [-32.85, -17.25]]} />
    <RoutedTrace name="D508_BUFFERED_TO" from="D508.pin1" to="LOCAL_HW_LED_ENTRY.top" origin={{ x: -31, y: -18 }}
      points={[[-31.75, -18], [-32.1, -18], [-32.85, -17.25]]} />
    <RoutedTrace name="TP16_BUFFERED_BRANCH" from="LOCAL_HW_BUFFER_EXIT.top" to="TP16.pin1" origin={{ x: -36.5, y: -23.05 }}
      points={[[-36.5, -23.05], [-36.5, -26.5], [-35, -28]]} />
  </>
}

function FilteredProbeRoutes() {
  return <>{filteredProbePaths.map(item => {
    const a = `${item.probe}_ADC_FROM_VIA`, b = `${item.probe}_ADC_TO_VIA`
    const first = item.points[1][0], last = item.points[1].at(-1)!
    return <React.Fragment key={item.probe}>
      {[{ name: a, point: first }, { name: b, point: last }].map(({ name, point }) => <React.Fragment key={name}>
        <via name={name} pcbX={point[0]} pcbY={point[1]} holeDiameter={0.3} outerDiameter={0.7}
          fromLayer="top" toLayer="bottom" connectsTo={`net.${item.net}`} tented {...{ ref: attachLogicSupplyInner2Port }} />
      </React.Fragment>)}
      <RoutedTrace name={`${item.probe}_FILTERED_FROM`} from={`${item.cap}.pin1`} to={`${a}.top`}
        origin={{ x: item.capOrigin[0], y: item.capOrigin[1] }} points={item.points[0].map(p => [p[0], p[1]] as Pair)} />
      <RoutedTrace name={`${item.probe}_FILTERED_TRUNK`} from={`${a}.inner2`} to={`${b}.inner2`}
        origin={{ x: first[0], y: first[1] }} points={item.points[1].map(p => [p[0], p[1]] as Pair)} />
      <RoutedTrace name={`${item.probe}_FILTERED_TO`} from={`${b}.top`} to={`${item.probe}.pin1`}
        origin={{ x: last[0], y: last[1] }} points={item.points[2].map(p => [p[0], p[1]] as Pair)} />
    </React.Fragment>
  })}</>
}

function Probe({ name, net, label, x, y, labelX, labelY, connectedByManualTap = false }: { name: string; net: string; label: string; x: number; y: number; connectedByManualTap?: boolean; labelX?: number; labelY?: number }) {
  return <>
    <testpoint name={name} footprintVariant="pad" padShape="circle" padDiameter={1.5} doNotPlace
      pcbX={x} pcbY={y} connections={connectedByManualTap ? undefined : { pin1: `net.${net}` }}
      footprint={<footprint>
        <smtpad portHints={["pin1"]} shape="circle" radius={0.75}
          coveredWithSolderMask={false} solderMaskMargin={0.05} solderPasteMargin={-0.75} />
        <courtyardrect width={2} height={2} />
      </footprint>} />
    <silkscreentext text={label} pcbX={labelX ?? x} pcbY={labelY ?? y + 1.65} fontSize={2} />
  </>
}

function GroundStub({ name, from, origin, points, rotation = 0 }: {
  name: string; from: string; origin: Point; points: Point[]; rotation?: number
}) {
  const end = points.at(-1)!
  return <>
    <via name={`${name}_VIA`} pcbX={end.x} pcbY={end.y} holeDiameter={0.3} outerDiameter={0.7}
      fromLayer="top" toLayer="bottom" connectsTo="net.GND" tented />
    <trace name={name} from={from} to={`${name}_VIA.top`} thickness={0.2} maxLength={5}
      pcbPathRelativeTo={from} pcbPath={[from, ...points.map(p => relativePoint(p, origin, rotation)), `${name}_VIA.top`]} />
  </>
}

function Indicator({ led, resistor, sourceNet, returnNet = "GND", resistance, x, y, label, red = false, resistorPosition, manualSeries = true }: {
  led: string; resistor: string; sourceNet: string; returnNet?: string; resistance: string
  x: number; y: number; label: string; red?: boolean; resistorPosition?: { x: number; y: number; rotation: number }; manualSeries?: boolean
}) {
  // Imported LED pin1 is cathode/left; pin2 is anode/right.
  const Led = red ? RedLed : GreenLed
  const resistorOrigin = resistorPosition ?? { x, y: y - 2.5, rotation: 90 }
  return <>
    <R name={resistor} resistance={resistance} pcbX={resistorOrigin.x} pcbY={resistorOrigin.y} pcbRotation={resistorOrigin.rotation}
      connections={{ pin1: `net.${sourceNet}`, pin2: `net.${led}_A` }} />
    <Led name={led} pcbX={x} pcbY={y} pcbSx={{ "& silkscreentext": { visibility: "hidden" } }} connections={returnNet === "GND" ? { pin2: `net.${led}_A` } : { pin1: `net.${returnNet}`, pin2: `net.${led}_A` }} />
    {manualSeries ? <trace name={`${led}_SERIES`} from={`${resistor}.pin2`} to={`${led}.pin2`} thickness={0.2} maxLength={4}
      pcbPathRelativeTo={`${resistor}.pin2`} pcbPath={[
        `${resistor}.pin2`, relativePoint({ x: x + 0.75, y: y - 1 }, resistorOrigin, resistorOrigin.rotation), `${led}.pin2`,
      ]} /> : null}
    {returnNet === "GND" && <GroundStub name={`${led}_GROUND`} from={`${led}.pin1`} origin={{ x, y }}
      points={led === "D503" ? [{ x: x - 2.05, y: y - 1.3 }, { x: x - 2.8, y: y - 1.3 }] : [{ x: x - 1.85, y: y - 1.1 }, { x: x - 1.85, y: y - 1.3 }]} />}
    <silkscreentext text={label} pcbX={x} pcbY={y + 1.65} fontSize={2} />
  </>
}

export function DebugBlock() {
  return <>
    {debugRailIndicators.map(item => <React.Fragment key={item.led}>
      <Indicator led={item.led} resistor={item.resistor}
        sourceNet={item.net} resistance={item.resistance} x={item.x} y={item.y} label={item.label} manualSeries={false}
        resistorPosition={item.resistorPosition} />
      <RailSeries item={item} />
      <trace name={`${item.led}_RAIL_FEED`} from={`${item.resistor}.pin1`} to={item.source} thickness={0.2}
        pcbPathRelativeTo={item.resistor} pcbPath={[`${item.resistor}.pin1`,
          ...item.feedWaypoints.map(point => relativePoint(point, item.resistorPosition, item.resistorPosition.rotation)), item.source]} />
    </React.Fragment>)}
    {debugStatusIndicators.map(item => <Indicator key={item.led} led={item.led} resistor={item.resistor}
      sourceNet={item.active === "high" ? item.net : "V3V3"} returnNet={item.active === "high" ? "GND" : item.net}
      resistance="2.49k" x={item.x} y={item.y} label={item.label} red={item.led === "D508"} />)}
    <BufferedStatusRoutes />
    <FilteredProbeRoutes />
    <SchmittBuffer name="U_DBG1" pcbX={-42} pcbY={-24} connections={{
      pin1: "net.PD_VALID_N", pin3: "net.TEC_SAFE_EN",
      pin4: "net.DBG_TEC_PERMIT", pin5: "net.V3V3", pin6: "net.DBG_PD_GATE",
    }} />
    <SchmittBuffer name="U_DBG2" pcbX={-34} pcbY={-24} connections={{
      pin1: "net.INPUT_CLEAR_N", pin3: "net.MCU_RUN",
      pin4: "net.DBG_MCU_RUN", pin5: "net.V3V3", pin6: "net.DBG_HW_INHIBIT",
    }} />
    <trace name="DBG_BUFFER_VCC_BRIDGE" from="U_DBG1.pin5" to="U_DBG2.pin5" thickness={0.2} maxLength={12}
      pcbPathRelativeTo="U_DBG1.pin5" pcbPath={["U_DBG1.pin5",
        ...[{ x: -42, y: -21.8 }, { x: -40.2, y: -21.8 }, { x: -40, y: -22 },
          { x: -36, y: -22 }, { x: -35.8, y: -21.8 }, { x: -34, y: -21.8 }]
          .map(point => relativePoint(point, { x: -42, y: -24 })), "U_DBG2.pin5"]} />
    {[1, 2].map(index => {
      const x = index === 1 ? -42 : -34
      return <React.Fragment key={index}>
        <C name={`C_DBG${index}`} capacitance="100nF" pcbX={x} pcbY={-20.5} pcbRotation={90} />
        <trace name={`DBG${index}_BYPASS`} from={`C_DBG${index}.pin1`} to={`U_DBG${index}.pin5`}
          thickness={0.2} maxLength={3} pcbPath={[`C_DBG${index}.pin1`, `U_DBG${index}.pin5`]} />
        <GroundStub name={`DBG${index}_BYPASS_GROUND`} from={`C_DBG${index}.pin2`}
          origin={{ x, y: -20.5 }} rotation={90} points={[{ x: x - 1.6, y: -19.8 }]} />
        <GroundStub name={`DBG${index}_GROUND`} from={`U_DBG${index}.pin2`}
          origin={{ x, y: -24 }} points={[{ x, y: -26.9 }]} />
      </React.Fragment>
    })}
    {debugTestPoints.map(item => <React.Fragment key={item.name}>
      <Probe {...item} connectedByManualTap={item.name === "TP10" || item.name === "TP11"} />
      {(item.name === "TP10" || item.name === "TP11") && <trace name={`${item.name}_I2C_TAP`}
        from={`${item.name}.pin1`} to={`net.${item.net}`} thickness={0.2} maxLength={2.6}
        pcbPathRelativeTo={`${item.name}.pin1`} pcbPath={[`${item.name}.pin1`, { x: item.name === "TP10" ? 1.5 : -1.5, y: 0 }]} />}
      {"pickupSource" in item && <trace name={`${item.name}_BULK_PICKUP`} from={`${item.name}.pin1`} to={item.pickupSource}
        thickness={0.2} pcbPathRelativeTo={item.name} pcbPath={[`${item.name}.pin1`,
          ...item.pickupWaypoints.map(point => relativePoint(point, item)), item.pickupSource]} />}
    </React.Fragment>)}
    {debugGroundTestPoints.map(item => <React.Fragment key={item.name}>
      <Probe {...item} net="GND" label="GND" connectedByManualTap />
      <GroundStub name={`${item.name}_GROUND`} from={`${item.name}.pin1`} origin={item}
        points={[{ x: item.x, y: item.y + (item.name === "TPG8" ? -1.6 : 1.6) }]} />
    </React.Fragment>)}
  </>
}
