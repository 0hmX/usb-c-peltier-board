import * as modeling from "@jscad/modeling"
import { executeJscadOperations, type JscadOperation, type JscadImplementation } from "jscad-planner"
import { connectorPlacements, connectorPoint, sensorPinLocal, tecPinLocal, usbFaceLocal, type Point3 } from "./connector-placement"

// Circuit coordinates: X/Y follow the PCB, Z is height. Accessory geometry is
// a documented dimensional envelope, not manufacturer CAD or a cable fit test.
const add = (a: Point3, b: Point3): Point3 => a.map((v, i) => v + b[i]!) as Point3
const subtract = (a: Point3, b: Point3): Point3 => a.map((v, i) => v - b[i]!) as Point3
const scaled = (a: Point3, scale: number): Point3 => a.map(v => v * scale) as Point3
const union = (shapes: JscadOperation[]): JscadOperation => ({ type: "union", shapes })
const colored = (color: Point3, shape: JscadOperation): JscadOperation => ({ type: "colorize", color, shape })
const cuboid = (size: Point3, center: Point3): JscadOperation => ({ type: "translate", vector: center, shape: { type: "cuboid", size } })

function wire(points: Point3[], radius: number, color: Point3, segments?: number): JscadOperation {
  const shapes: JscadOperation[] = points.map(center => ({ type: "sphere", radius, center, resolution: 12, ...(segments ? { segments } : {}) }))
  for (let i = 1; i < points.length; i++) {
    const delta = subtract(points[i]!, points[i - 1]!), length = Math.hypot(...delta)
    const center = scaled(add(points[i]!, points[i - 1]!), 0.5)
    shapes.push({ type: "translate", vector: center, shape: { type: "rotateZ", angle: Math.atan2(delta[1], delta[0]),
      shape: { type: "rotateY", angle: Math.acos(delta[2] / length),
        shape: { type: "cylinder", radius, height: length, resolution: 12, ...(segments ? { segments } : {}) } } } })
  }
  return colored(color, union(shapes))
}

export const moduleCenter: Point3 = [112, 24, 1.8]
export const moduleModel = colored([0.965, 0.969, 0.965], union([
  cuboid([38.5, 38.5, 2.2], [0, 0, 0]),
  ...[-1.45, 1.45].map(z => cuboid([40, 40, 0.7], [0, 0, z])),
]))

function usbCable(boardConnector: "J_USB" | "J_PROGRAM", partName: string, branch: number, color: Point3) {
  const placement = connectorPlacements[boardConnector]
  const boardPoint = connectorPoint(placement, usbFaceLocal)
  const outward = subtract(connectorPoint(placement, [0, -1, 0]), connectorPoint(placement, [0, 0, 0]))
  const side: Point3 = [outward[1], -outward[0], 0]
  const plug = add(boardPoint, scaled(outward, 0.5))
  const path = [[24, 0], [45, 0], [60, 13], [66, 38]].map(([distance, bend]) =>
    add(add(plug, scaled(outward, distance!)), scaled(side, branch * bend!)))
  const rotation = (placement.pcbRotation + 90) * Math.PI / 180
  const plugShape = (size: Point3, center: Point3): JscadOperation => ({ type: "translate", vector: subtract(center, boardPoint),
    shape: { type: "rotateZ", angle: rotation, shape: cuboid(size, [0, 0, 0]) } })
  return { partName, boardConnector, boardPoint, path, position: boardPoint,
    displayName: boardConnector === "J_USB" ? "Cable Matters 201440 · PD power · envelope" : "Cable Matters 201440 · USB programming · envelope",
    model: colored(color, union([plugShape([7, 8.3, 3], plug),
      plugShape([20, 11, 5.4], add(plug, scaled(outward, 14))),
      wire(path.map(point => subtract(point, boardPoint)), 2.1, color)])) }
}

function tecLead(pin: "pin1" | "pin2", partName: string, offset: number, color: Point3) {
  const boardPoint = connectorPoint(connectorPlacements.J_TEC, tecPinLocal[pin])
  const modulePoint: Point3 = [moduleCenter[0] - 20, moduleCenter[1] + offset, moduleCenter[2]]
  const path: Point3[] = [boardPoint, [connectorPlacements.J_TEC.pcbX + 15, boardPoint[1], 6],
    [connectorPlacements.J_TEC.pcbX + 34, moduleCenter[1] + offset, 4], modulePoint]
  return { partName, boardConnector: "J_TEC", pin, boardPoint, modulePoint, path, position: boardPoint,
    displayName: pin === "pin1" ? "TEC positive lead · red · path illustration" : "TEC negative lead · black · path illustration",
    model: wire(path.map(point => subtract(point, boardPoint)), 0.75, color) }
}

export const usbPdCable = usbCable("J_USB", "USB_PD_CABLE", 1, [0.19, 0.21, 0.25])
export const usbProgramCable = usbCable("J_PROGRAM", "USB_PROGRAM_CABLE", -1, [0.68, 0.73, 0.79])
export const tecPositiveLead = tecLead("pin1", "TEC_POS_LEAD", -3, [0.78, 0.17, 0.21])
export const tecNegativeLead = tecLead("pin2", "TEC_NEG_LEAD", 3, [0.125, 0.14, 0.17])

// Selected HiLetgo B00M1PM55K housing dimensions are not published/verified.
// These cylinders are explicitly illustrative, not seller-specified dimensions.
const probeBodyLengthMm = 50, probeBodyDiameterMm = 6
const probeModel: JscadOperation = { type: "rotateY", angle: Math.PI / 2,
  shape: { type: "cylinder", height: probeBodyLengthMm, radius: probeBodyDiameterMm / 2 },
  material: { color: [0.72, 0.75, 0.77], metalness: 0.8, roughness: 0.3 } }
export const hotProbe = { partName: "HOT_PROBE", position: [112, 50, 9.6] as Point3, model: probeModel,
  cableEndPoint: [87, 50, 9.6] as Point3, bodyLengthMm: probeBodyLengthMm, bodyDiameterMm: probeBodyDiameterMm }
export const coldProbe = { partName: "COLD_PROBE", position: [112, -8, -6] as Point3, model: probeModel,
  cableEndPoint: [87, -8, -6] as Point3, bodyLengthMm: probeBodyLengthMm, bodyDiameterMm: probeBodyDiameterMm }

function probeCable(boardConnector: "J_HOT_SENSOR" | "J_COLD_SENSOR", partName: string, probePoint: Point3) {
  const placement = connectorPlacements[boardConnector]
  const boardPoint = connectorPoint(placement, sensorPinLocal.pin2)
  const join: Point3 = [66, placement.pcbY, 8]
  const path: Point3[] = [join, [77, boardConnector === "J_HOT_SENSOR" ? 42 : -24, boardConnector === "J_HOT_SENSOR" ? 12 : 2], probePoint]
  const conductors = [
    { pin: "pin1", signal: "CTRL_3V3", colorName: "red", color: [0.82, 0.06, 0.04] as Point3 },
    { pin: "pin2", signal: boardConnector === "J_HOT_SENSOR" ? "HOT_SENSOR_DATA" : "COLD_SENSOR_DATA", colorName: "yellow", color: [0.95, 0.76, 0.05] as Point3 },
    { pin: "pin3", signal: "GND", colorName: "black", color: [0.03, 0.03, 0.035] as Point3 },
  ].map(conductor => {
    const point = connectorPoint(placement, sensorPinLocal[conductor.pin as keyof typeof sensorPinLocal])
    return { ...conductor, boardPoint: point, path: [point, [52, point[1], 3], [58, point[1], 8], join] as Point3[] }
  })
  // Union discards child shape colors. Colored native polygons keep all three
  // vendor wire colors in one cable part, with no invented electrical anchors.
  const jacketColor: Point3 = [0.05, 0.055, 0.06]
  const pieces = [{ path, radius: 1.5, color: jacketColor }, ...conductors.map(c => ({ path: c.path, radius: 0.35, color: c.color }))]
  const polygons = pieces.flatMap(piece => {
    const shape = executeJscadOperations(modeling as unknown as JscadImplementation, wire(piece.path.map(point => subtract(point, boardPoint)), piece.radius, piece.color, 12))
    return modeling.geometries.geom3.toPolygons(shape).map(polygon => ({ ...polygon, color: piece.color }))
  })
  return { partName, boardConnector, boardPoint, path, probePoint, conductors, model: { type: "createGeom3", polygons } as JscadOperation }
}

export const hotProbeCable = probeCable("J_HOT_SENSOR", "HOT_PROBE_CABLE", hotProbe.cableEndPoint)
export const coldProbeCable = probeCable("J_COLD_SENSOR", "COLD_PROBE_CABLE", coldProbe.cableEndPoint)
export const assemblyConnections = [usbPdCable, usbProgramCable, tecPositiveLead, tecNegativeLead, hotProbeCable, coldProbeCable]
