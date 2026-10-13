export type RoutingLayer = "top" | "inner1" | "inner2" | "bottom"
export interface RoutingEdge {
  net: string
  from: string
  to: string
  width: number
  priority: number
  preferredLayers: RoutingLayer[]
  maxLength?: number
  note?: string
  waypoints?: { x: number; y: number; layer: RoutingLayer }[]
}
export interface RoutingPlan {
  owner: string
  nets: string[]
  edges: RoutingEdge[]
  notes: string[]
}
