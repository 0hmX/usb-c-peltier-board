import React from "react"
import type { BoardProps } from "@tscircuit/props"

// Fabrication order: 4-layer FR-4, 1.6 mm, 1 oz outer copper.
// The exact fine-pitch imported pads rule out assuming 2 oz outer copper.
export const boardLayoutProps = {
  width: 100,
  height: 75,
  layers: 4,
  thickness: 1.6,
  material: "fr4",
  minTraceWidth: 0.2,
  minTraceToPadEdgeClearance: 0.2,
  minPadEdgeToPadEdgeClearance: 0.15,
  minBoardEdgeClearance: 0.5,
  minTraceToHoleEdgeClearance: 0.5,
  minViaHoleDiameter: 0.3,
  minViaPadDiameter: 0.7,
  pcbStyle: { viaPadDiameter: 0.7, viaHoleDiameter: 0.3 },
  minViaEdgeToPadEdgeClearance: 0.2,
  minViaHoleEdgeToViaHoleEdgeClearance: 0.3,
  allowBlindAndBuriedVias: false,
  isViaInPadAllowed: false,
  defaultViaTenting: "both_sides",
  solderMaskColor: "green",
  silkscreenColor: "white",
} satisfies BoardProps

export const mountingHoles = [
  { name: "H1", x: -45, y: 32.5 },
  { name: "H2", x: 45, y: 32.5 },
  { name: "H3", x: -45, y: -32.5 },
  { name: "H4", x: 45, y: -32.5 },
]

export const fiducials = [
  { name: "FID1", x: -38, y: 32.5 },
  { name: "FID2", x: 38, y: 32.5 },
  { name: "FID3", x: -38, y: -32.5 },
]

// Reviewed against the actual manufacturer courtyards in the debug revision.
// Reserve this region for debug components rather than a routing keepout:
// the indicator rails and buffer signals still need ordinary copper access.
export const debugPanelBounds = {
  left: -48, right: -29, bottom: -28, top: -2,
} as const

const allLayers = ["top", "inner1", "inner2", "bottom"] as const
const kelvinPourKeepouts = [
  { name: "KELVIN_BOTTOM_POUR_CLEAR", x: 26.595, y: 11.1, width: 0.29, height: 4 },
  { name: "KELVIN_BOTTOM_POUR_LOWER", x: 26.63, y: 10.425, width: 0.36, height: 2.65 },
  { name: "KELVIN_BOTTOM_POUR_MIDDLE", x: 26.675, y: 12.5, width: 0.45, height: 0.4 },
]

export function MechanicalFeatures() {
  return React.createElement(React.Fragment, null,
    // Remove two isolated GND slivers between the shunt pour and Kelvin pickup.
    // Native checks still forbid vias even with allowPlacements. These three
    // rectangles remove the slivers while staying outside both pickup annuli.
    ...kelvinPourKeepouts.map(({ name, x, y, width, height }) => React.createElement("keepout", {
      key: name, name, shape: "rect", width, height,
      pcbX: x, pcbY: y, layers: ["bottom"],
      allowTraces: true, allowPlacements: true,
    })),
    ...mountingHoles.flatMap(({ name, x, y }) => [
      React.createElement("hole", {
        key: name, name, shape: "circle", diameter: 3.2, pcbX: x, pcbY: y,
      }),
      React.createElement("keepout", {
        key: `${name}_WASHER`, shape: "circle", radius: 4,
        pcbX: x, pcbY: y, layers: [...allLayers],
      }),
    ]),
    ...fiducials.flatMap(({ name, x, y }) => [
      React.createElement("smtpad", {
        key: name, name, shape: "circle", radius: 0.5,
        coveredWithSolderMask: false, solderMaskMargin: 0.5, solderPasteMargin: -0.5,
        pcbX: x, pcbY: y,
      }),
      React.createElement("keepout", {
        key: `${name}_CLEAR`, shape: "circle", radius: 1.5,
        pcbX: x, pcbY: y, layers: ["top"],
        // Standalone mechanical pads have no PCB component selector to exclude.
        // Keep routing/pours out; their only intended placement is this fiducial.
        allowPlacements: true,
      }),
    ]),
  )
}

export function GroundCopper() {
  const props = {
    // Native circular cutouts are polygonal. The added margin preserves at
    // least 0.20 mm against the true round via annulus after clipping.
    connectsTo: "net.GND", clearance: 0.21, boardEdgeMargin: 0.5,
    cutoutMargin: 0.5, useThermalReliefs: false, coveredWithSolderMask: true,
  }
  return React.createElement(React.Fragment, null,
    React.createElement("copperpour", {
      ...props, name: "GROUND_REFERENCE", layer: "inner1",
    }),
    React.createElement("copperpour", {
      ...props, name: "GROUND_HEAT_SPREAD", layer: "bottom",
    }),
  )
}

export type ViaPoint = { x: number; y: number }

// Supply points reviewed against the real imported pads. These are ordinary
// 0.3 mm drilled, 0.7 mm pad, tented through vias outside solder pads, not open via-in-pad.
export function GroundThermalVias({ name, points }: {
  name: string
  points: ViaPoint[]
}) {
  return React.createElement(React.Fragment, null,
    ...points.map(({ x, y }, i) => React.createElement("via", {
      key: `${name}_${i + 1}`, name: `${name}_${i + 1}`,
      pcbX: x, pcbY: y, holeDiameter: 0.3, outerDiameter: 0.7,
      fromLayer: "top", toLayer: "bottom", connectsTo: "net.GND", tented: true,
    })),
  )
}

export function PowerCopper({ name, net, outline, layers = ["top", "bottom"] }: {
  name: string
  net: string
  outline: ViaPoint[]
  layers?: ("top" | "bottom" | "inner1" | "inner2")[]
}) {
  return React.createElement(React.Fragment, null,
    ...layers.map(layer => React.createElement("copperpour", {
      key: `${name}_${layer}`, name: `${name}_${layer}`, layer,
      connectsTo: `net.${net}`, outline, clearance: 0.25,
      // The native solver treats a custom outline as its local board boundary.
      // Applying the physical board margin here would erode every current neck.
      boardEdgeMargin: 0, useThermalReliefs: false, coveredWithSolderMask: true,
      // Prevent later signal routing from carving a reviewed power corridor.
      unbroken: true,
    })),
  )
}

export function PowerTransferVias({ name, net, points }: {
  name: string
  net: string
  points: ViaPoint[]
}) {
  return React.createElement(React.Fragment, null,
    ...points.map(({ x, y }, i) => React.createElement("via", {
      key: `${name}_${i + 1}`, name: `${name}_${i + 1}`,
      pcbX: x, pcbY: y, holeDiameter: 0.3, outerDiameter: 0.7,
      fromLayer: "top", toLayer: "bottom", connectsTo: `net.${net}`, tented: true,
    })),
  )
}

const rectangle = (left: number, bottom: number, right: number, top: number): ViaPoint[] => [
  { x: left, y: bottom }, { x: right, y: bottom },
  { x: right, y: top }, { x: left, y: top },
]

// Pose-specific physical copper, reviewed against the manufacturer-corrected pads.
// Update these together with any movement of the referenced components.
export const powerCopperRegions = [
  {
    name: "BUCK_EXPOSED_GROUND", net: "GND", layers: ["top"] as const,
    outline: rectangle(-9.1, 10.5, -1.1, 13.5),
  },
  {
    name: "BUCK_LOW_SOURCE_GROUND", net: "GND", layers: ["top"] as const,
    outline: rectangle(-0.9, 7.85, 1.75, 11.45),
  },
  {
    name: "BUCK_INPUT_CAP_GROUND", net: "GND", layers: ["top"] as const,
    outline: rectangle(-6.4, 25.8, 14, 29),
  },
  {
    name: "TEC_INPUT_RETURN_LOCAL", net: "GND", layers: ["top"] as const,
    // C28's return reaches three external barrels beside its can courtyard.
    outline: rectangle(20.8, 22.4, 24.65, 24.95),
  },
  {
    name: "BUCK_SWITCH_ISLAND", net: "TEC_SW", layers: ["top"] as const,
    outline: [
      { x: 6.25, y: 19 }, { x: 9.25, y: 19 },
      { x: 9.25, y: 15.1 }, { x: 11, y: 13.35 },
      { x: 12.5, y: 13.35 }, { x: 12.5, y: 9.5 },
      { x: 7.25, y: 9.5 }, { x: 7.25, y: 6.2 },
      { x: 2.72, y: 6.2 }, { x: 2.72, y: 11.8 },
      { x: 6.25, y: 11.8 },
    ],
  },
  {
    name: "BUCK_INPUT_LOCAL", net: "VBUS_TEC", layers: ["top"] as const,
    outline: [
      { x: -6.4, y: 20.9 }, { x: 0.7, y: 20.9 },
      { x: 0.7, y: 15.2 }, { x: 5.3, y: 15.2 },
      { x: 5.3, y: 20.9 }, { x: 18.1, y: 20.9 },
      { x: 18.1, y: 24.3 }, { x: -6.4, y: 24.3 },
    ],
  },
  {
    name: "PROTECTED_INPUT_BACKBONE", net: "VBUS_TEC", layers: ["bottom"] as const,
    // The lower opening reserves quiet Kelvin/HF-ground exits and the short
    // bottom switch-reference branch. Main input current retains a 7.8 mm
    // upper span at y16.5..24.3; transfer barrels remain in that broad span.
    outline: [
      { x: -17.5, y: 11.6 }, { x: 2.8, y: 11.6 },
      { x: 2.8, y: 14.5 }, { x: -7.25, y: 14.5 },
      { x: -7.25, y: 16.5 }, { x: 8.3, y: 16.5 },
      { x: 8.3, y: 14.5 }, { x: 5.85, y: 14.5 },
      { x: 5.85, y: 11.6 }, { x: 18.1, y: 11.6 },
      { x: 18.1, y: 24.3 }, { x: -17.5, y: 24.3 },
    ],
  },
  {
    // OUT uses a 0.30 mm-wide bar; widen only beyond the opposite IN/corner pads.
    name: "EFUSE_OUT_FANOUT", net: "VBUS_TEC", layers: ["top"] as const,
    outline: [
      { x: -17.9, y: 15 }, { x: -17.6, y: 15 },
      { x: -17.6, y: 13.2 }, { x: -16.4, y: 13.2 },
      { x: -16.4, y: 11.5 }, { x: -18.2, y: 11.5 },
      { x: -18.2, y: 13.2 }, { x: -17.9, y: 13.2 },
    ],
  },
  {
    name: "INDUCTOR_TO_SHUNT", net: "TEC_INDUCTOR_OUT", layers: ["top", "bottom"] as const,
    outline: rectangle(20.5, 9.5, 26.3, 15.65),
  },
  {
    name: "TEC_OUTPUT_BACKBONE", net: "TEC_POS", layers: ["top", "bottom"] as const,
    outline: [
      { x: 30.53, y: 13.84 }, { x: 37, y: 13.84 },
      { x: 37, y: -0.8 }, { x: 46, y: -0.8 },
      { x: 46, y: -7 }, { x: 25, y: -7 },
      { x: 25, y: -0.8 }, { x: 33, y: -0.8 },
      { x: 33, y: 4.7 }, { x: 25, y: 4.7 },
      { x: 25, y: 6.3 }, { x: 33, y: 6.3 },
      { x: 33, y: 10 }, { x: 30.53, y: 10 },
    ],
  },
  {
    name: "TEC_OUTPUT_RETURN_LOCAL", net: "GND", layers: ["top"] as const,
    // C30/C31 share a broad collector; its center tongue avoids shunt lands.
    outline: [
      { x: 24.7, y: 7.9 }, { x: 32.4, y: 7.9 },
      { x: 32.4, y: 9.65 }, { x: 28.45, y: 9.65 },
      { x: 28.45, y: 9.95 }, { x: 27.55, y: 9.95 },
      { x: 27.55, y: 9.2 }, { x: 24.7, y: 9.2 },
    ],
  },
  {
    name: "TEC_BULK_GROUND", net: "GND", layers: ["top"] as const,
    outline: rectangle(26.9, -0.5, 31.2, 3),
  },
  {
    name: "TEC_TERMINAL_RETURN", net: "GND", layers: ["top"] as const,
    outline: rectangle(40, 1, 48, 5),
  },
]

export const thermalViaGroups = [
  { name: "BUCK_HF_GND", points: [{ x: 4.4, y: 12.7 }] },
  {
    name: "BUCK_EP_GND", points: [-8.5, -1.85].flatMap(x =>
      [11, 12, 13].map(y => ({ x, y }))),
  },
  {
    name: "BUCK_LOW_GND", points: [-0.5, 0.3].flatMap(x =>
      [8.4, 9.4, 10.4].map(y => ({ x, y }))),
  },
  {
    name: "BUCK_INPUT_GND", points: [-5, -1.5, 2, 5.5, 9, 12.5].map(x => ({ x, y: 28.1 })),
  },
  {
    name: "TEC_BULK_GND", points: [27.4, 30.6].flatMap(x =>
      [0.5, 2].map(y => ({ x, y }))),
  },
  {
    name: "TEC_RETURN_GND", points: [41, 42, 43, 45, 46, 47].map(x => ({ x, y: 4.5 })),
  },
]

export const powerViaGroups = [
  {
    name: "EFUSE_OUT_TRANSFER", net: "VBUS_TEC",
    points: [-17.7, -16.9].flatMap(x => [12.2, 13.0].map(y => ({ x, y }))),
  },
  {
    name: "BUCK_INPUT_TRANSFER", net: "VBUS_TEC",
    points: [-2, -1, 0, 1, 2, 3, 4, 5].map(x => ({ x, y: 21.7 })),
  },
  {
    name: "INDUCTOR_OUT_TRANSFER", net: "TEC_INDUCTOR_OUT",
    points: [20.9, 21.7, 22.5, 23.3, 24.1, 24.9, 25.7].map(x => ({ x, y: 15.2 })),
  },
  {
    name: "TEC_OUT_TRANSFER", net: "TEC_POS",
    points: [34, 35, 36].flatMap(x => [7.5, 8.5, 9.5].map(y => ({ x, y }))),
  },
]

export function MainPowerFeatures() {
  return React.createElement(React.Fragment, null,
    ...[...powerCopperRegions, ...rawInputCopperRegions].map(region => React.createElement(PowerCopper, {
      key: region.name, ...region, layers: [...region.layers],
    })),
    ...thermalViaGroups.map(group => React.createElement(GroundThermalVias, {
      key: group.name, ...group,
    })),
    ...[...powerViaGroups, ...rawInputViaGroups].map(group => React.createElement(PowerTransferVias, {
      key: group.name, ...group,
    })),
  )
}

// J_USB origin -45.11557,12 at270deg, and U_INPUT origin -18,15.
// Raw input follows the top edge to keep CC/PD/sense circuitry quiet below it.
export const rawInputCopperRegions = [
  {
    name: "USB_RAW_POWER_COLLECTOR", net: "VBUS_RAW", layers: ["top", "bottom"] as const,
    outline: [
      { x: -43.3, y: 9.3 }, { x: -41.8, y: 9.3 },
      { x: -41.8, y: 8.8 }, { x: -38.5, y: 8.8 },
      { x: -38.5, y: 23.8 }, { x: -20.5, y: 23.8 },
      { x: -20.5, y: 19.1 }, { x: -18.4, y: 17 },
      { x: -18.4, y: 15 }, { x: -18.1, y: 15 },
      { x: -18.1, y: 17 }, { x: -17.8, y: 17.3 },
      { x: -17.8, y: 27.1 }, { x: -41.8, y: 27.1 },
      { x: -41.8, y: 14.7 }, { x: -43.3, y: 14.7 },
      { x: -43.3, y: 14.1 }, { x: -41.8, y: 14.1 },
      { x: -41.8, y: 9.9 }, { x: -43.3, y: 9.9 },
    ],
  },
]

export const rawInputViaGroups = [
  {
    name: "USB_RAW_TRANSFER", net: "VBUS_RAW",
    points: [-41.1, -40.2, -39.3].flatMap(x =>
      [9.8, 11.2, 12.6, 14].map(y => ({ x, y }))),
  },
  {
    name: "EFUSE_IN_TRANSFER", net: "VBUS_RAW",
    points: [-19.8, -19, -18.2].flatMap(x =>
      [21, 22, 23].map(y => ({ x, y }))),
  },
]
