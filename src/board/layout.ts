import type { BoardProps } from "@tscircuit/props"
import type { RetainedComponent } from "./retained"
import { clearancePlacements } from "./clearance-placements"

export const boardDimensions = { width: 110, height: 85 }
// Fabrication order: 4-layer FR-4, 1.6 mm, 1 oz outer copper.
// The exact fine-pitch imported pads rule out assuming 2 oz outer copper.
export const boardLayoutProps = {
  ...boardDimensions,
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

export const revisedPlacements = clearancePlacements

export function placementFor(item: RetainedComponent) {
  const pose = revisedPlacements[item.name] ?? item.original
  return { pcbX: pose[0], pcbY: pose[1], pcbRotation: pose[2] ?? 0 }
}
