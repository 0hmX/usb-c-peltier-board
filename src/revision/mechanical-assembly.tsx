import { assembly } from "@tscircuit/core"
import type { CadModelJscad } from "@tscircuit/props"
import { boardLayoutProps } from "../layout"
import { boardDimensions, revisedPlacements } from "./layout"

type Point = [number, number, number]
type Color = [number, number, number]
type Plan = CadModelJscad["jscad"]
type ConnectorName = "J_TEC" | "J_FAN" | "J_HOT" | "J_COLD"

export interface MechanicalConceptPart {
  name: string
  displayName: string
  dimensionsMm: Point
  cadModel: CadModelJscad
}

export interface ConceptWire {
  partName: string
  signal: string
  connectorName: ConnectorName
  diameterMm: number
  color: Color
  path: Point[]
}

export const mechanicalConcept = {
  label: "CONCEPT ONLY — nominal mechanical envelopes, not verified fabrication fit",
  documentation: [
    "CONCEPT: dimensions, fastening, cable entry, probe attachment and wire routes are approximate; no fabrication fit or thermal performance claim.",
    "CONCEPT: PCB remains 110 × 85 × 1.6 mm at its original pose; mid-plane Z=0, top Z=0.8 mm. All mechanical model poses are explicit world coordinates.",
    "CONCEPT: assumed TEC polarity places the hot face at +Z and cold face at −Z; verify the selected module polarity and actual faces before assembly.",
    "CONCEPT: 60 × 60 × 15 mm, 12 V four-wire fan must draw at most 1 A INCLUDING startup/stall; select a qualified adapter/harness, not an assumed PC plug or AWG28 lead.",
    "CONCEPT: red/black TEC bodies are illustrative insulated leads, not an ampacity or pin-fit specification; confirm wire sizing, connector rating and polarity independently.",
    "CONCEPT: hot probe contacts the hot heatsink base side; cold probe contacts the cold plate side. Thermal coupling, isolation, condensation control and clamping require engineering.",
    "Native assembly.part identities are mechanical source metadata only; no new electrical ports, nets, PCB components, pads, holes or schematic symbols.",
  ],
  references: [
    "https://docs.tscircuit.com/elements/assembly-device",
    "https://docs.tscircuit.com/elements/assembly-subassembly",
    "https://docs.tscircuit.com/elements/assembly-part",
    "https://docs.tscircuit.com/elements/cadmodel",
  ],
  boardSizeMm: [boardDimensions.width, boardDimensions.height, boardLayoutProps.thickness] as Point,
  coolerCenter: [100, 0] as [number, number],
  fanMaxCurrentAIncludingStartupAndStall: 1,
  hotFaceZ: 3,
  coldFaceZ: -0.8,
  hotProbeCenter: [90, -30, 5] as Point,
  coldProbeCenter: [100, -22, -2.8] as Point,
  boardMounts: [[-49, 36], [49, 36], [-49, -36], [49, -36]] as [number, number][],
}

const colors = {
  aluminum: [0.62, 0.66, 0.7] as Color,
  coldAluminum: [0.48, 0.66, 0.79] as Color,
  ceramic: [0.92, 0.92, 0.87] as Color,
  dark: [0.06, 0.07, 0.08] as Color,
  red: [0.85, 0.06, 0.04] as Color,
  yellow: [0.95, 0.73, 0.04] as Color,
  blue: [0.08, 0.3, 0.82] as Color,
  orange: [0.95, 0.38, 0.07] as Color,
}

const cuboid = (size: Point, center: Point = [0, 0, 0]): Plan => ({ type: "cuboid", size, center })
const cylinder = (radius: number, height: number, center: Point = [0, 0, 0]): Plan => ({ type: "cylinder", radius, height, center, segments: 32 })
const union = (...shapes: Plan[]): Plan => ({ type: "union", shapes })
const colorize = (color: Color, shape: Plan): Plan => ({ type: "colorize", color, shape })
const subtract = (shape: Plan, ...cutters: Plan[]): Plan => ({ type: "subtract", shapes: [shape, ...cutters] })

function part(name: string, description: string, dimensionsMm: Point, position: Point, jscad: Plan): MechanicalConceptPart {
  return {
    name,
    displayName: "CONCEPT — " + description + " — approximate, not fabrication fit",
    dimensionsMm,
    cadModel: {
      jscad,
      positionOffset: { x: position[0], y: position[1], z: position[2] },
      modelOriginPosition: { x: 0, y: 0, z: 0 },
      modelUnitToMmScale: 1,
    },
  }
}

function connectorOrigin(name: ConnectorName): Point {
  const [horizontal, vertical] = revisedPlacements[name]
  return [horizontal, vertical, boardLayoutProps.thickness / 2]
}

function parallelPath(path: Point[], offset: number): Point[] {
  return path.map(([horizontal, vertical, elevation]) => [horizontal + offset, vertical, elevation])
}

const fanPath: Point[] = [connectorOrigin("J_FAN"), [37, -46, 2.5], [62, -46, 4], [65, -35, 16], [65, -33, 34.5], [76, -30, 34.5]]
const hotProbePath: Point[] = [connectorOrigin("J_HOT"), [16, -50, 2], [62, -50, 4], [65, -34, 5], [76, -32, 5], mechanicalConcept.hotProbeCenter]
const coldProbePath: Point[] = [connectorOrigin("J_COLD"), [25, -42, 2.5], [25, -54, 2.5], [64, -54, -2.8], [75, -30, -2.8], [90, -25, -2.8], mechanicalConcept.coldProbeCenter]

export const conceptWires: ConceptWire[] = [
  {
    partName: "CONCEPT_TEC_POSITIVE_LEAD_D1p8",
    signal: "TEC_POS — assumed positive polarity",
    connectorName: "J_TEC", diameterMm: 1.8, color: colors.red,
    path: [connectorOrigin("J_TEC"), [57, 19, 3.5], [63, 12, 3.5], [68, 5, 1.1], [80, 5, 1.1]],
  },
  {
    partName: "CONCEPT_TEC_NEGATIVE_LEAD_D1p8",
    signal: "GND — assumed negative polarity",
    connectorName: "J_TEC", diameterMm: 1.8, color: colors.dark,
    path: [connectorOrigin("J_TEC"), [57, 14, 3.5], [63, -2, 3.5], [68, -5, 1.1], [80, -5, 1.1]],
  },
  ...[
    ["GND", colors.dark], ["V12_FAN", colors.red], ["FAN_TACH", colors.yellow], ["FAN_PWM", colors.blue],
  ].map(([signal, color], index): ConceptWire => ({
    partName: "CONCEPT_FAN_" + signal + "_LEAD_D0p9_MAX1A_INCLUDING_STARTUP_STALL",
    signal: signal as string, connectorName: "J_FAN", diameterMm: 0.9,
    color: color as Color, path: parallelPath(fanPath, (index - 1.5) * 1.1),
  })),
  ...["HOT", "COLD"].flatMap((face): ConceptWire[] => [
    { signal: face + "_RAW", color: face === "HOT" ? colors.orange : colors.blue, offset: -0.45 },
    { signal: "GND", color: colors.dark, offset: 0.45 },
  ].map(({ signal, color, offset }) => ({
    partName: "CONCEPT_" + face + "_THERMISTOR_" + signal + "_LEAD_D0p65",
    signal, connectorName: face === "HOT" ? "J_HOT" : "J_COLD", diameterMm: 0.65,
    color, path: parallelPath(face === "HOT" ? hotProbePath : coldProbePath, offset),
  }))),
]

const fanMounts: [number, number][] = [[-25, -25], [-25, 25], [25, -25], [25, 25]]
const hotHeatsink = subtract(
  union(
    cuboid([60, 60, 4], [0, 0, -10]),
    ...Array.from({ length: 13 }, (_, index) => cuboid([1.5, 60, 20], [-27 + index * 4.5, 0, 2])),
    ...fanMounts.map(([horizontal, vertical]) => cuboid([6, 6, 20], [horizontal, vertical, 2])),
  ),
  ...fanMounts.map(([horizontal, vertical]) => cylinder(1.6, 26, [horizontal, vertical, 0])),
)
const coldHeatsink = union(
  cuboid([44, 44, 3], [0, 0, 4.5]),
  ...Array.from({ length: 11 }, (_, index) => cuboid([1.4, 44, 9], [-20 + index * 4, 0, -1.5])),
)
const fanFrame = subtract(
  cuboid([60, 60, 15]), cylinder(27, 17),
  ...fanMounts.map(([horizontal, vertical]) => cylinder(1.6, 17, [horizontal, vertical, 0])),
)
const fanBlade: Plan = {
  type: "translate", vector: [0, 0, -1],
  shape: { type: "extrudeLinear", options: { height: 2 }, shape: { type: "polygon", points: [[7, -2], [22, -7], [25, 0], [18, 6], [8, 3]] } },
}
const fan = colorize(colors.dark, union(
  fanFrame, cylinder(9, 8),
  ...Array.from({ length: 7 }, (_, index) => ({ type: "rotateZ", angle: index * Math.PI * 2 / 7, shape: fanBlade })),
  cuboid([54, 2, 2], [0, 0, -5.5]), cuboid([2, 54, 2], [0, 0, -5.5]),
))

function screw(shaftHeight: number): Plan {
  return colorize(colors.aluminum, union(
    subtract(cylinder(2.75, 2, [0, 0, 1]), cuboid([3.5, 0.8, 1], [0, 0, 1.75]), cuboid([0.8, 3.5, 1], [0, 0, 1.75])),
    cylinder(1.4, shaftHeight, [0, 0, -shaftHeight / 2]),
  ))
}

const thermalParts = [
  part("CONCEPT_TEC_40x40x3p8", "TEC 40 × 40 × 3.8 mm; assumed hot +Z / cold −Z", [40, 40, 3.8], [100, 0, 1.1], colorize(colors.ceramic, union(
    cuboid([40, 40, 0.8], [0, 0, -1.5]), cuboid([38, 38, 2.2]), cuboid([40, 40, 0.8], [0, 0, 1.5]),
  ))),
  part("CONCEPT_HOT_FINNED_HEATSINK_60x60x24", "hot heatsink 60 × 60 × 24 mm, 13 fins and 4 nominal fan bosses", [60, 60, 24], [100, 0, 15], colorize(colors.aluminum, hotHeatsink)),
  part("CONCEPT_FAN_60x60x15_12V_MAX1A_INCLUDING_STARTUP_STALL", "fan 60 × 60 × 15 mm, 12 V, ≤1 A including startup/stall; qualified adapter required", [60, 60, 15], [100, 0, 34.5], fan),
  part("CONCEPT_COLD_PLATE_44x44x4", "cold plate 44 × 44 × 4 mm", [44, 44, 4], [100, 0, -2.8], colorize(colors.coldAluminum, cuboid([44, 44, 4]))),
  part("CONCEPT_COLD_FINNED_HEATSINK_44x44x12", "cold heatsink 44 × 44 × 12 mm, 11 fins", [44, 44, 12], [100, 0, -10.8], colorize(colors.coldAluminum, coldHeatsink)),
  part("CONCEPT_HOT_THERMISTOR_BEAD_D2", "hot thermistor Ø2 mm, coupled to hot base side at Z=5 mm", [2, 2, 2], mechanicalConcept.hotProbeCenter, colorize(colors.orange, { type: "sphere", radius: 1, segments: 16 })),
  part("CONCEPT_COLD_THERMISTOR_BEAD_D2", "cold thermistor Ø2 mm, coupled to cold plate side at Z=−2.8 mm", [2, 2, 2], mechanicalConcept.coldProbeCenter, colorize(colors.blue, { type: "sphere", radius: 1, segments: 16 })),
  ...fanMounts.map(([horizontal, vertical], index) => part(
    "CONCEPT_FAN_SCREW_" + (index + 1) + "_D2p8_L18_HEAD_D5p5",
    "fan screw shaft Ø2.8 × 18 mm, head Ø5.5 × 2 mm", [5.5, 5.5, 20], [100 + horizontal, vertical, 42], screw(18),
  )),
]

const wireParts = [...new Set(conceptWires.map(wire => wire.partName))].map(name => {
  const wires = conceptWires.filter(wire => wire.partName === name)
  const radius = wires[0]!.diameterMm / 2
  const points = wires.flatMap(wire => wire.path)
  const dimensions = [0, 1, 2].map(axis => Math.max(...points.map(point => point[axis]!)) - Math.min(...points.map(point => point[axis]!)) + radius * 2) as Point
  return part(name, wires.map(wire => wire.connectorName + " " + wire.signal).join(" / ") + "; illustrative insulated cable body", dimensions, [0, 0, 0], colorize(wires[0]!.color, {
    type: "hullChain",
    shapes: wires[0]!.path.map(center => ({ type: "sphere", radius, center, segments: 8 })),
  }))
})

const hardwareParts = mechanicalConcept.boardMounts.flatMap(([horizontal, vertical], index) => [
  part("CONCEPT_PCB_STANDOFF_H" + (index + 1) + "_OD6_ID3p2_H12", "PCB standoff Ø6 / Ø3.2 bore × 12 mm; contacts PCB underside", [6, 6, 12], [horizontal, vertical, -6.8],
    colorize([0.76, 0.61, 0.3], subtract(cylinder(3, 12), cylinder(1.6, 14)))),
  part("CONCEPT_PCB_SCREW_H" + (index + 1) + "_D2p8_L5p3_HEAD_D5p5", "PCB screw shaft Ø2.8 × 5.3 mm, head Ø5.5 × 2 mm; seats at top Z=0.8 mm", [5.5, 5.5, 7.3], [horizontal, vertical, boardLayoutProps.thickness / 2], screw(5.3)),
])

export const mechanicalParts: MechanicalConceptPart[] = [...thermalParts, ...wireParts, ...hardwareParts]
export const mechanicalPartNames = mechanicalParts.map(component => component.name)
export const mechanicalCadCount = mechanicalParts.length

export function MechanicalAssembly() {
  return <>{mechanicalParts.map(({ name, displayName, cadModel }) => <assembly.part key={name} name={name} displayName={displayName} cadModel={cadModel} />)}</>
}
