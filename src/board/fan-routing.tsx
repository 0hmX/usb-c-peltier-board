import type { TraceProps } from "@tscircuit/props"
import { Fragment } from "react"

// Global waypoints are converted to the source component's pcbPath frame.
const origins: Record<string, [number, number, number]> = {
  U_FAN: [-13, -37, 180], C_FAN_IN: [-18.1, -37, 90],
  C_FAN_IN_HF: [-15.5, -37, 90], C_FAN_BOOT: [-10.2, -36.9, 270],
  L_FAN: [-5, -38, 0], C_FAN_OUT1: [2.8, -35.3, 0],
  C_FAN_OUT2: [2.8, -40.4, 0], R_FAN_FB_TOP: [-17, -33.4, 0],
  R_FAN_FB_BOTTOM: [-14, -33.4, 0],
}
type Waypoint = { x: number; y: number; via?: boolean; toLayer?: "bottom" | "top" }
const routes: { from: string; to: string; width: number; maxLength?: number; points?: Waypoint[] }[] = [
  { from: ".U_FAN > .pin4", to: ".U_FAN > .pin5", width: 0.4 },
  // Pad-center limits account for the SOT-23 and 1210 package geometry.
  { from: ".C_FAN_IN > .pin1", to: ".C_FAN_IN_HF > .pin1", width: 0.6, maxLength: 3 },
  { from: ".C_FAN_IN_HF > .pin1", to: ".U_FAN > .pin5", width: 0.4, maxLength: 3 },
  { from: ".C_FAN_IN > .pin2", to: ".C_FAN_IN_HF > .pin2", width: 0.6, maxLength: 3 },
  { from: ".C_FAN_IN_HF > .pin2", to: ".U_FAN > .pin2", width: 0.4, maxLength: 4,
    points: [{ x: -14.8, y: -36.9 }, { x: -13, y: -36.9 }] },
  { from: ".U_FAN > .pin1", to: ".C_FAN_BOOT > .pin1", width: 0.25 },
  { from: ".U_FAN > .pin6", to: ".C_FAN_BOOT > .pin2", width: 0.5 },
  { from: ".U_FAN > .pin6", to: ".L_FAN > .pin1", width: 0.5 },
  { from: ".L_FAN > .pin2", to: ".C_FAN_OUT1 > .pin1", width: 0.9 },
  { from: ".L_FAN > .pin2", to: ".C_FAN_OUT2 > .pin1", width: 0.9 },
  { from: ".C_FAN_OUT1 > .pin2", to: ".C_FAN_OUT2 > .pin2", width: 0.9 },
  { from: ".U_FAN > .pin3", to: ".R_FAN_FB_BOTTOM > .pin1", width: 0.2 },
  { from: ".R_FAN_FB_TOP > .pin2", to: ".R_FAN_FB_BOTTOM > .pin1", width: 0.2 },
  { from: ".R_FAN_FB_BOTTOM > .pin2", to: ".U_FAN > .pin2", width: 0.3 },
  // Output sensing runs below the ground shield, away from SW copper.
  { from: ".R_FAN_FB_TOP > .pin1", to: ".C_FAN_OUT1 > .pin1", width: 0.2,
    points: [{ x: -18.51, y: -33.4 },
      { x: -18.51, y: -33.4, via: true, toLayer: "bottom" },
      { x: -18.51, y: -33.4 },
      { x: -18.4, y: -31.6 }, { x: 1.282604, y: -31.6 },
      { x: 1.282604, y: -33.3 },
      { x: 1.282604, y: -33.3, via: true, toLayer: "top" },
      { x: 1.282604, y: -33.3 }] },
  { from: ".C_FAN_OUT2 > .pin1", to: ".J_FAN > .pin2", width: 1,
    points: [{ x: 1.282604, y: -43 }, { x: 2.782604, y: -44.5 },
      { x: 38.5, y: -44.5 }, { x: 40, y: -43 }, { x: 40, y: -29.25 },
      { x: 41.52, y: -27.73 }] },
]

export function FanRouting() {
  return <>
    {routes.map(({ from, to, width, maxLength, points = [] }, index) => {
      const [x, y, degrees] = origins[from.split(" ")[0].slice(1)]
      const angle = degrees * Math.PI / 180
      const pcbPath: TraceProps["pcbPath"] = points.map(point => ({ ...point,
        x: (point.x - x) * Math.cos(angle) + (point.y - y) * Math.sin(angle),
        y: -(point.x - x) * Math.sin(angle) + (point.y - y) * Math.cos(angle),
      }))
      return <trace key={String(index)} name={`FAN_ROUTE_${index}`} from={from} to={to}
        width={width} maxLength={maxLength} pcbPath={pcbPath} />
    })}
    <copperpour name="FAN_GROUND" layer="top" connectsTo="net.GND" clearance={0.2} unbroken
      useThermalReliefs={false} outline={[
        { x: -21.5, y: -32 }, { x: 6, y: -32 },
        { x: 6, y: -43 }, { x: -21.5, y: -43 },
      ]} />
    {[
      [-18.7, -34.3], [-15.5, -35.3], [-13, -34.8], [-13, -34.2],
      [5.5, -35.3], [5.5, -36.3], [5.5, -40.4], [5.5, -41.4],
    ].map(([x, y], index) => <Fragment key={index}><via name={`FAN_GND_${index}`}
      pcbX={x} pcbY={y} connectsTo="net.GND" fromLayer="top" toLayer="bottom"
      holeDiameter={0.3} outerDiameter={0.6} /></Fragment>)}
  </>
}
