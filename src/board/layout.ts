import type { RetainedComponent } from "./retained"
import { clearancePlacements } from "./clearance-placements"

export const boardDimensions = { width: 110, height: 85 }
export const revisedPlacements = clearancePlacements

export function placementFor(item: RetainedComponent) {
  const pose = revisedPlacements[item.name] ?? item.original
  return { pcbX: pose[0], pcbY: pose[1], pcbRotation: pose[2] ?? 0 }
}
