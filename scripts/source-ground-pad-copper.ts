import { difference, intersection, type MultiPolygon, type Pair, type Polygon } from "polygon-clipping"
import type { AnyCircuitElement, CircuitJson } from "circuit-json"

type Pad = Extract<AnyCircuitElement, { type: "pcb_smtpad" | "pcb_plated_hole" }>
type PcbTrace = Extract<AnyCircuitElement, { type: "pcb_trace" }>
type Layer = Extract<AnyCircuitElement, { type: "pcb_port" }>["layers"][number]
type Point = { x: number; y: number }
const steps = 128

// Inscribed outer copper and circumscribed drill boundaries make a positive
// contact-area result conservative at this polygon approximation resolution.
function capsule(start: Point, end: Point, radius: number, drill = false): Polygon {
  if (drill) radius /= Math.cos(Math.PI / steps)
  const angle = Math.atan2(end.y - start.y, end.x - start.x)
  const ring: Pair[] = []
  for (const [center, offset] of [[end, -Math.PI / 2], [start, Math.PI / 2]] as const) {
    for (let index = 0; index <= steps / 2; index++) {
      const radians = angle + offset + index * 2 * Math.PI / steps
      ring.push([center.x + radius * Math.cos(radians), center.y + radius * Math.sin(radians)])
    }
  }
  return [ring]
}

function pill(center: Point, width: number, height: number, rotation: number, drill = false) {
  const radius = Math.min(width, height) / 2
  const extent = Math.abs(width - height) / 2
  const radians = (rotation + (height > width ? 90 : 0)) * Math.PI / 180
  const vector = { x: extent * Math.cos(radians), y: extent * Math.sin(radians) }
  return capsule({ x: center.x - vector.x, y: center.y - vector.y },
    { x: center.x + vector.x, y: center.y + vector.y }, radius, drill)
}

function padCopper(pad: Pad, layer: Layer): MultiPolygon {
  if (pad.type === "pcb_smtpad") {
    if (pad.layer !== layer) return []
    if (pad.shape === "polygon") return [[pad.points.map(point => [point.x, point.y])]]
    if (pad.shape === "circle") return [capsule(pad, pad, pad.radius)]
    if (pad.shape === "rect") {
      const ring: Pair[] = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, y]) => {
        const dx = x * pad.width / 2, dy = y * pad.height / 2
        return [pad.x + dx, pad.y + dy]
      })
      return [[ring]]
    }
  } else if (pad.layers.includes(layer)) {
    if (pad.shape === "circle") return difference(capsule(pad, pad, pad.outer_diameter / 2), capsule(pad, pad, pad.hole_diameter / 2, true))
    if (pad.shape === "pill") return difference(pill(pad, pad.outer_width, pad.outer_height, pad.ccw_rotation ?? 0),
      pill(pad, pad.hole_width, pad.hole_height, pad.ccw_rotation ?? 0, true))
  }
  return []
}

function area(shape: MultiPolygon) {
  return shape.reduce((total, polygon) => total + polygon.reduce((net, ring, index) => {
    const magnitude = Math.abs(ring.reduce((sum, point, pointIndex) => {
      const next = ring[(pointIndex + 1) % ring.length]
      return sum + point[0] * next[1] - next[0] * point[1]
    }, 0)) / 2
    return net + (index === 0 ? magnitude : -magnitude)
  }, 0), 0)
}

/** Finite copper contact on an actual port's layer, with drills subtracted. */
export function tracePortCopperContact(circuit: CircuitJson, pcbPortId: string, trace: PcbTrace, layer: Layer) {
  const pads = circuit.filter((element): element is Pad => (element.type === "pcb_smtpad" || element.type === "pcb_plated_hole")
    && element.pcb_port_id === pcbPortId)
  const shapes = pads.map(pad => padCopper(pad, layer)).filter(shape => shape.length > 0)
  for (const via of circuit.filter((element): element is Extract<AnyCircuitElement, { type: "pcb_via" }> => element.type === "pcb_via" && !!element.pcb_port_ids?.includes(pcbPortId))) {
    if (via.layers.includes(layer)) shapes.push(difference(capsule(via, via, via.outer_diameter / 2), capsule(via, via, via.hole_diameter / 2, true)))
  }
  const segments = trace.route.flatMap((end, index) => {
    const start = trace.route[index - 1]
    if (start?.route_type !== "wire" || end.route_type !== "wire" || start.layer !== layer || end.layer !== layer) return []
    const width = Math.min(start.width, start.start_width ?? start.width, start.end_width ?? start.width,
      end.width, end.start_width ?? end.width, end.end_width ?? end.width)
    return Number.isFinite(width) && width > 0 ? [capsule(start, end, width / 2)] : []
  })
  // Each pair intersection is contained in the complete copper intersection.
  // Its maximum area is a conservative lower bound; overlapping pairs are not summed.
  const contactAreaMm2 = shapes.reduce((maximum, shape) => segments.reduce((pairMaximum, segment) =>
    Math.max(pairMaximum, area(intersection(shape, segment))), maximum), 0)
  return { supportedActualPadCount: shapes.length, contactAreaMm2,
    method: "128-segment conservative copper/drill pair intersection; maximum pair area is a lower bound of complete contact area", valid: contactAreaMm2 > 1e-6 }
}

/** Finite top copper contact to the actual pad, with a PTH drill subtracted. */
export function groundOriginPadContact(circuit: CircuitJson, pcbPortId: string, trace: PcbTrace) {
  return tracePortCopperContact(circuit, pcbPortId, trace, "top")
}

/** Contact to the largest actual same-net plane region; no projected pours. */
export function viaMainPlaneContact(circuit: CircuitJson, pcbViaId: string, layer: Layer) {
  const via = circuit.find(element => element.type === "pcb_via" && element.pcb_via_id === pcbViaId)
  if (via?.type !== "pcb_via" || !via.layers.includes(layer)) return { valid: false, contactAreaMm2: 0 }
  const shapes = circuit.flatMap(element => {
    if (element.type !== "pcb_copper_pour" || element.layer !== layer || element.source_net_id !== via.source_net_id
      || !via.source_net_id || element.shape !== "brep") return []
    const polygon: Polygon = [element.brep_shape.outer_ring.vertices.map(vertex => [vertex.x, vertex.y]),
      ...(element.brep_shape.inner_rings ?? []).map(ring => ring.vertices.map((vertex): Pair => [vertex.x, vertex.y]))]
    return [{ pcbCopperPourId: element.pcb_copper_pour_id, polygon, areaMm2: area([polygon]) }]
  }).sort((a, b) => b.areaMm2 - a.areaMm2)
  const main = shapes[0]
  const annulus = difference(capsule(via, via, via.outer_diameter / 2), capsule(via, via, via.hole_diameter / 2, true))
  const contactAreaMm2 = main ? area(intersection(annulus, main.polygon)) : 0
  return { pcbViaId, layer, mainPourId: main?.pcbCopperPourId, mainPourAreaMm2: main?.areaMm2,
    contactAreaMm2, valid: contactAreaMm2 > 1e-6,
    method: "Actual BREP region and conservative128-segment drilled annulus finite intersection" }
}
