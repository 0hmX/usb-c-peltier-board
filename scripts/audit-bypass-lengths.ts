import { createHash } from "node:crypto"
import { mkdir } from "node:fs/promises"
import type { AnyCircuitElement } from "circuit-json"
import type { GeneratedTrace } from "../src/board/routing/generated-types"

type Point = { x: number; y: number }
type Interval = [number, number]
type AuditableTrace = GeneratedTrace & { maxExposedLength?: number }
type NativeTrace = Extract<AnyCircuitElement, { type: "pcb_trace" }>
type NativeSourceTrace = Extract<AnyCircuitElement, { type: "source_trace" }>
interface CopperShape {
  type: string; shape?: string; x: number; y: number
  layer?: string; layers?: string[]; pcb_port_id?: string; pcb_port_ids?: string[]
  width?: number; height?: number; radius?: number; points?: Point[]
  ccw_rotation?: number; outer_diameter?: number; hole_diameter?: number
  outer_width?: number; outer_height?: number; hole_width?: number; hole_height?: number
  pcb_smtpad_id?: string; pcb_plated_hole_id?: string; pcb_via_id?: string
}
const EPS = 1e-9
const LENGTH_TOLERANCE_MM = 1e-6
const pointAt = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
const cross = (a: Point, b: Point) => a.x * b.y - a.y * b.x
const subtract = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y })

/** Disjoint parameter intervals; overlapping lands must never be subtracted twice. */
export function unionIntervals(intervals: Interval[]): Interval[] {
  const sorted = intervals.map(([a, b]): Interval => [Math.max(0, a), Math.min(1, b)])
    .filter(([a, b]) => b - a > EPS).sort((a, b) => a[0] - b[0])
  const result: Interval[] = []
  for (const interval of sorted) {
    const last = result[result.length - 1]
    if (last && interval[0] <= last[1] + EPS) last[1] = Math.max(last[1], interval[1])
    else result.push([...interval])
  }
  return result
}

export function subtractIntervals(outer: Interval[], holes: Interval[]): Interval[] {
  const result: Interval[] = [], removed = unionIntervals(holes)
  for (const [start, end] of unionIntervals(outer)) {
    let cursor = start
    for (const [left, right] of removed) {
      if (right <= cursor + EPS || left >= end - EPS) continue
      if (left > cursor + EPS) result.push([cursor, Math.min(left, end)])
      cursor = Math.max(cursor, Math.min(right, end))
    }
    if (cursor < end - EPS) result.push([cursor, end])
  }
  return result
}

const intervalMeasure = (intervals: Interval[]) => unionIntervals(intervals).reduce((sum, [a, b]) => sum + b - a, 0)

/** Exact quadratic line/circle intersections, including zero-measure tangencies. */
export function circleIntervals(a: Point, b: Point, center: Point, radius: number): Interval[] {
  if (!(radius >= 0) || !Number.isFinite(radius)) throw new Error("Invalid copper circle radius")
  const d = subtract(b, a), p = subtract(a, center)
  const aa = d.x ** 2 + d.y ** 2
  if (aa <= EPS ** 2) return p.x ** 2 + p.y ** 2 <= radius ** 2 + EPS ? [[0, 1]] : []
  const bb = 2 * (p.x * d.x + p.y * d.y), cc = p.x ** 2 + p.y ** 2 - radius ** 2
  const discriminant = bb ** 2 - 4 * aa * cc
  if (discriminant <= 0) return []
  const root = Math.sqrt(discriminant)
  return unionIntervals([[(-bb - root) / (2 * aa), (-bb + root) / (2 * aa)]])
}

/** Slab clipping in the pad's local frame; no axis-aligned bounding-box substitute. */
export function rectangleIntervals(a: Point, b: Point, center: Point, width: number, height: number, rotation = 0): Interval[] {
  if (![width, height].every(n => n >= 0 && Number.isFinite(n))) throw new Error("Invalid copper rectangle")
  const angle = rotation * Math.PI / 180
  const local = (p: Point): Point => ({ x: (p.x - center.x) * Math.cos(angle) + (p.y - center.y) * Math.sin(angle),
    y: -(p.x - center.x) * Math.sin(angle) + (p.y - center.y) * Math.cos(angle) })
  const start = local(a), end = local(b), delta = subtract(end, start)
  let low = 0, high = 1
  for (const [position, direction, halfSize] of [[start.x, delta.x, width / 2], [start.y, delta.y, height / 2]]) {
    if (Math.abs(direction) <= EPS) {
      if (Math.abs(position) > halfSize + EPS) return []
      continue
    }
    const t1 = (-halfSize - position) / direction, t2 = (halfSize - position) / direction
    low = Math.max(low, Math.min(t1, t2)); high = Math.min(high, Math.max(t1, t2))
    if (high <= low + EPS) return []
  }
  return unionIntervals([[low, high]])
}

function pointOnEdge(p: Point, a: Point, b: Point) {
  const edge = subtract(b, a), relative = subtract(p, a)
  return Math.abs(cross(edge, relative)) <= EPS * Math.max(1, Math.hypot(edge.x, edge.y))
    && p.x >= Math.min(a.x, b.x) - EPS && p.x <= Math.max(a.x, b.x) + EPS
    && p.y >= Math.min(a.y, b.y) - EPS && p.y <= Math.max(a.y, b.y) + EPS
}

function pointInPolygon(p: Point, ring: Point[]) {
  let inside = false
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length]
    if (pointOnEdge(p, a, b)) return true
    if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) inside = !inside
  }
  return inside
}

/** Exact straight-edge polygon cuts; concave lands retain all their actual gaps. */
export function polygonIntervals(a: Point, b: Point, ring: Point[]): Interval[] {
  if (ring.length < 3 || ring.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y))) throw new Error("Invalid copper polygon")
  const d = subtract(b, a), lengthSquared = d.x ** 2 + d.y ** 2
  if (lengthSquared <= EPS ** 2) return pointInPolygon(a, ring) ? [[0, 1]] : []
  const cuts = [0, 1]
  for (let i = 0; i < ring.length; i++) {
    const p = ring[i], q = ring[(i + 1) % ring.length], edge = subtract(q, p), offset = subtract(p, a)
    const denominator = cross(d, edge)
    if (Math.abs(denominator) > EPS) {
      const t = cross(offset, edge) / denominator, u = cross(offset, d) / denominator
      if (t >= -EPS && t <= 1 + EPS && u >= -EPS && u <= 1 + EPS) cuts.push(Math.max(0, Math.min(1, t)))
    } else if (Math.abs(cross(offset, d)) <= EPS) {
      for (const point of [p, q]) {
        const t = ((point.x - a.x) * d.x + (point.y - a.y) * d.y) / lengthSquared
        if (t >= -EPS && t <= 1 + EPS) cuts.push(Math.max(0, Math.min(1, t)))
      }
    }
  }
  const unique = cuts.sort((x, y) => x - y).filter((t, i, all) => !i || Math.abs(t - all[i - 1]) > EPS)
  const intervals: Interval[] = []
  for (let i = 1; i < unique.length; i++) {
    const left = unique[i - 1], right = unique[i]
    if (right - left > EPS && pointInPolygon(pointAt(a, b, (left + right) / 2), ring)) intervals.push([left, right])
  }
  return unionIntervals(intervals)
}

/** Capsules use their exact rectangle and circular end caps, without tessellation. */
export function pillIntervals(a: Point, b: Point, center: Point, width: number, height: number, rotation = 0): Interval[] {
  const radius = Math.min(width, height) / 2, extent = Math.abs(width - height) / 2
  const degrees = rotation + (height > width ? 90 : 0), angle = degrees * Math.PI / 180
  const offset = { x: extent * Math.cos(angle), y: extent * Math.sin(angle) }
  return unionIntervals([...rectangleIntervals(a, b, center, extent * 2, radius * 2, degrees),
    ...circleIntervals(a, b, { x: center.x - offset.x, y: center.y - offset.y }, radius),
    ...circleIntervals(a, b, { x: center.x + offset.x, y: center.y + offset.y }, radius)])
}

function copperIntervals(shape: CopperShape, a: Point, b: Point, layer: string) {
  const empty = { metal: [] as Interval[], drill: [] as Interval[] }
  if (shape.type === "pcb_smtpad" ? shape.layer !== layer : !shape.layers?.includes(layer)) return empty
  if (!Number.isFinite(shape.x) || !Number.isFinite(shape.y)) {
    if (shape.type !== "pcb_smtpad" || shape.shape !== "polygon") throw new Error("Copper primitive lacks finite coordinates")
  }
  let outer: Interval[], drill: Interval[] = []
  if (shape.type === "pcb_via" || shape.type === "pcb_plated_hole" && shape.shape === "circle") {
    outer = circleIntervals(a, b, shape, shape.outer_diameter! / 2)
    drill = circleIntervals(a, b, shape, shape.hole_diameter! / 2)
  } else if (shape.type === "pcb_plated_hole" && shape.shape === "pill") {
    outer = pillIntervals(a, b, shape, shape.outer_width!, shape.outer_height!, shape.ccw_rotation ?? 0)
    drill = pillIntervals(a, b, shape, shape.hole_width!, shape.hole_height!, shape.ccw_rotation ?? 0)
  } else if (shape.type === "pcb_smtpad" && shape.shape === "circle") outer = circleIntervals(a, b, shape, shape.radius!)
  else if (shape.type === "pcb_smtpad" && ["rect", "rotated_rect"].includes(shape.shape ?? ""))
    outer = rectangleIntervals(a, b, shape, shape.width!, shape.height!, shape.ccw_rotation ?? 0)
  else if (shape.type === "pcb_smtpad" && shape.shape === "polygon") outer = polygonIntervals(a, b, shape.points!)
  else if (shape.type === "pcb_smtpad" && shape.shape === "pill") outer = pillIntervals(a, b, shape, shape.width!, shape.height!, shape.ccw_rotation ?? 0)
  else throw new Error(`Unsupported attached copper primitive ${shape.type}/${shape.shape}`)
  return { metal: subtractIntervals(outer, drill), drill }
}

const copperId = (shape: CopperShape) => shape.pcb_smtpad_id ?? shape.pcb_plated_hole_id ?? shape.pcb_via_id ?? "unknown-copper"

/** Measure native wire vertices only; cached trace_length and generated center paths are never measurements. */
export function auditBypassLengths(circuit: AnyCircuitElement[], generated: { traces: AuditableTrace[] }) {
  const sourceTraces = new Map(circuit.filter((p): p is NativeSourceTrace => p.type === "source_trace").map(p => [p.name, p]))
  const nativeTraces = circuit.filter((p): p is NativeTrace => p.type === "pcb_trace")
  const pcbPorts = circuit.filter(p => p.type === "pcb_port")
  const sourcePorts = new Map(circuit.filter(p => p.type === "source_port").map(p => [p.source_port_id, p]))
  const shapes = circuit.filter(p => ["pcb_smtpad", "pcb_plated_hole", "pcb_via"].includes(p.type)) as unknown as CopperShape[]
  const inputErrors: string[] = []
  if (nativeTraces.length !== generated.traces.length)
    inputErrors.push(`Stale or incomplete native build: ${nativeTraces.length} native traces versus ${generated.traces.length} generated traces`)
  const measurements = generated.traces.filter(p => p.maxExposedLength !== undefined).map(authored => {
    const errors: string[] = [], source = sourceTraces.get(authored.name)
    if (!Number.isFinite(authored.maxExposedLength) || authored.maxExposedLength! < 0) errors.push("Invalid maxExposedLength")
    if (!source) errors.push("Missing native source trace")
    // Identity metadata detects reused RB_TRACE counters after regeneration. It
    // is never used to compute the measured exposed length.
    if (source?.display_name && source.display_name !== `${authored.from} to ${authored.to}`)
      errors.push(`Stale native endpoint selectors: ${source.display_name}`)
    const traces = nativeTraces.filter(p => source && p.source_trace_id === source.source_trace_id)
    if (!traces.length) errors.push("Missing native PCB trace")
    const attachedPortIds = new Set<string>()
    for (const port of pcbPorts) if (source?.connected_source_port_ids.includes(port.source_port_id)) attachedPortIds.add(port.pcb_port_id)
    for (const trace of traces) for (const p of trace.route) if (p.route_type === "wire") {
      if (p.start_pcb_port_id) attachedPortIds.add(p.start_pcb_port_id)
      if (p.end_pcb_port_id) attachedPortIds.add(p.end_pcb_port_id)
    }
    const attached = shapes.filter(shape => shape.pcb_port_id && attachedPortIds.has(shape.pcb_port_id)
      || shape.pcb_port_ids?.some(id => attachedPortIds.has(id))
      // This core's added inner2 port is geometrically registered to its actual barrel,
      // but pcb_via.pcb_port_ids retains only the two outer ports.
      || shape.type === "pcb_via" && pcbPorts.some(port => attachedPortIds.has(port.pcb_port_id)
        && Math.hypot(port.x - shape.x, port.y - shape.y) < EPS
        && shape.layers?.some(layer => port.layers.includes(layer as never))
        && sourcePorts.get(port.source_port_id)?.subcircuit_connectivity_map_key === (shape as unknown as { subcircuit_connectivity_map_key?: string }).subcircuit_connectivity_map_key))
    if (!attached.length) errors.push("No attached native pad or barrel copper")
    let nativeWireLength = 0, attachedPadMetalLength = 0, attachedDrillVoidLength = 0, exposedLength = 0
    const segments: { pcbTraceId: string; layer: string; start: Point; end: Point; length: number;
      padMetalIntervals: Interval[]; attachedDrillIntervals: Interval[]; exposedIntervals: Interval[] }[] = []
    for (const trace of traces) {
      if (trace.route.some(p => p.route_type !== "wire")) {
        errors.push(`Unsupported non-wire route in ${trace.pcb_trace_id}`)
        continue
      }
      for (let i = 1; i < trace.route.length; i++) {
        const a = trace.route[i - 1], b = trace.route[i]
        if (a.route_type !== "wire" || b.route_type !== "wire") continue
        if (a.layer !== b.layer) { errors.push(`Unsupported direct layer jump in ${trace.pcb_trace_id}`); continue }
        const length = Math.hypot(b.x - a.x, b.y - a.y)
        if (!Number.isFinite(length)) { errors.push(`Non-finite native segment in ${trace.pcb_trace_id}`); continue }
        if (length <= EPS) continue
        const metal: Interval[] = [], drills: Interval[] = []
        for (const shape of attached) try {
          const intervals = copperIntervals(shape, a, b, a.layer)
          metal.push(...intervals.metal); drills.push(...intervals.drill)
        } catch (error) { errors.push(`${copperId(shape)}: ${String(error)}`) }
        const drillUnion = unionIntervals(drills), metalUnion = subtractIntervals(unionIntervals(metal), drillUnion)
        // The drill interior is a void, not exposed surface copper. Its length is
        // reported separately; only attached endpoint drills are excluded.
        const exposed = subtractIntervals([[0, 1]], unionIntervals([...metalUnion, ...drillUnion]))
        nativeWireLength += length; attachedPadMetalLength += intervalMeasure(metalUnion) * length
        attachedDrillVoidLength += intervalMeasure(drillUnion) * length; exposedLength += intervalMeasure(exposed) * length
        segments.push({ pcbTraceId: trace.pcb_trace_id, layer: a.layer, start: { x: a.x, y: a.y }, end: { x: b.x, y: b.y },
          length, padMetalIntervals: metalUnion, attachedDrillIntervals: drillUnion, exposedIntervals: exposed })
      }
    }
    const maximum = authored.maxExposedLength!
    const passed = !errors.length && exposedLength <= maximum + LENGTH_TOLERANCE_MM
    return { name: authored.name, net: authored.net, from: authored.from, to: authored.to, maxExposedLength: maximum,
      nativePcbTraceIds: traces.map(p => p.pcb_trace_id), attachedCopperIds: attached.map(copperId),
      nativeWireLength, attachedPadMetalLength, attachedDrillVoidLength, exposedLength,
      marginMm: maximum - exposedLength, cachedNativeLengthsIgnored: traces.map(p => p.trace_length ?? null), passed, errors, segments }
  })
  const violations = measurements.filter(p => !p.passed)
  const passed = measurements.length > 0 && violations.length === 0 && inputErrors.length === 0
  return { status: !measurements.length ? "missing-exposed-length-constraints" : passed ? "passed" : "failed",
    method: "Exact native centerline interval cuts against attached rectangular/rotated/polygon/circular/pill pad copper and drilled barrel annuli; actual drills reported as voids",
    toleranceMm: LENGTH_TOLERANCE_MM, nativeTraceCount: nativeTraces.length, generatedTraceCount: generated.traces.length,
    constrainedTraceCount: measurements.length, unconstrainedTraceCount: generated.traces.length - measurements.length,
    violationCount: violations.length, inputErrors, passed, violations, measurements }
}

if (import.meta.main) {
  const circuitPath = process.argv[2] ?? "dist/routed/circuit.json"
  const generatedPath = process.argv[3] ?? "src/board/routing/generated.json"
  const reportPath = process.argv[4] ?? "review/routing/bypass-length-validation.json"
  const [circuitText, generatedText] = await Promise.all([Bun.file(circuitPath).text(), Bun.file(generatedPath).text()])
  const report = { circuitPath, generatedPath,
    circuitSha256: createHash("sha256").update(circuitText).digest("hex"),
    generatedSha256: createHash("sha256").update(generatedText).digest("hex"),
    ...auditBypassLengths(JSON.parse(circuitText), JSON.parse(generatedText)) }
  await mkdir(reportPath.substring(0, reportPath.lastIndexOf("/")) || ".", { recursive: true })
  await Bun.write(reportPath, JSON.stringify(report, null, 2) + "\n")
  console.log(JSON.stringify({ status: report.status, constrainedTraces: report.constrainedTraceCount,
    violations: report.violationCount, reportPath }))
  if (!report.passed) process.exitCode = 1
}
