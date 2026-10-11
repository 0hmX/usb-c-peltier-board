import type { RootCircuit } from "@tscircuit/core"
import type { AnyCircuitElement } from "circuit-json"
import { auditSourceTraceWidths } from "./source-trace-widths"

type Warning = Extract<AnyCircuitElement, { type: "pcb_trace_warning" }>
type SourceTrace = Extract<AnyCircuitElement, { type: "source_trace" }>
type PcbTrace = Extract<AnyCircuitElement, { type: "pcb_trace" }>
type Metric = ReturnType<typeof auditSourceTraceWidths>["metrics"][number]
type DrcEnd = { effectName?: string; phase?: string; asyncEffectId?: string; error?: string }
export type TraceWidthDiagnosticChange = {
  before: Warning | null; after: Warning | null
  cause: "native-net-wide-attribution" | "owned-route-below-source-width" | "owned-route-width-restored" | "native-width-diagnostic-retained"
  sourceTraceId: string; requiredWidthMm: number | null; ownedPcbTraceIds: string[]
  minimumOwnedWidthMm: number | null
}
export type TraceWidthDiagnosticsReceipt = {
  asyncEffectId?: string; beforeWarningCount: number; afterWarningCount: number
  sourceConstrainedRouteCount: number; routeViolationCount: number
  changes: TraceWidthDiagnosticChange[]; nonTraceWarningElementsUnchanged: boolean
}
const installed = new WeakMap<RootCircuit, TraceWidthDiagnosticsReceipt[]>()
const copy = <T>(value: T): T => JSON.parse(JSON.stringify(value))
const message = (source: SourceTrace, width: number) =>
  `Trace [${source.display_name ?? source.name ?? source.source_trace_id}] is routed thinner than requested (requested: ${source.min_trace_thickness}mm, actual: ${width}mm).`

// Authenticate the installed checker's specific diagnostic, including its
// actual segment and source endpoints. Other trace warnings stay untouched.
function isNativeWidthWarning(warning: Warning, source: SourceTrace, trace: PcbTrace,
  pcbPorts: Extract<AnyCircuitElement, { type: "pcb_port" }>[]) {
  const match = warning.message.match(/^Trace \[.*\] is routed thinner than requested \(requested: ([\d.eE+-]+)mm, actual: ([\d.eE+-]+)mm\)\.$/)
  if (!source.display_name || !match || warning.warning_type !== "pcb_trace_warning"
    || Number(match[1]) !== source.min_trace_thickness || warning.message !== message(source, Number(match[2]))
    || !Number.isFinite(Number(match[2])) || Number(match[2]) >= source.min_trace_thickness!
    || !warning.center || trace.route_thickness_mode === "interpolated") return false
  const expectedPorts = pcbPorts.filter(port => source.connected_source_port_ids.includes(port.source_port_id))
    .map(port => port.pcb_port_id).sort()
  if (expectedPorts.length < 2 || JSON.stringify(expectedPorts) !== JSON.stringify([...warning.pcb_port_ids].sort())) return false
  return trace.route.some((point, index) => {
    const next = trace.route[index + 1]
    if (point.route_type !== "wire" || next?.route_type !== "wire" || point.layer !== next.layer
      || point.width !== Number(match[2])) return false
    const dx = next.x - point.x, dy = next.y - point.y, length2 = dx * dx + dy * dy
    if (!length2) return false
    const center = warning.center!
    const t = ((center.x - point.x) * dx + (center.y - point.y) * dy) / length2
    return t >= -1e-6 && t <= 1 + 1e-6
      && Math.hypot(center.x - point.x - t * dx, center.y - point.y - t * dy) < 1e-6
  })
}

// Core's asynchronous board DRC inserts its results before this public event.
// Its width checker compares every branch of a net against each trace request.
// Recalculate only authenticated attribution mistakes, and enforce the actual
// source-owned widths independently (including short pad/neckdown segments).
export function installTraceWidthDiagnostics(circuit: RootCircuit) {
  const existing = installed.get(circuit)
  if (existing) return existing
  const receipts: TraceWidthDiagnosticsReceipt[] = []
  const generated = new Map<string, Warning>()
  installed.set(circuit, receipts)
  circuit.on("asyncEffect:end", (event: DrcEnd) => {
    if (event.effectName !== "board:drc-checks" || event.phase !== "PcbDesignRuleChecks" || event.error) return
    const before = copy(circuit.db.toArray())
    const audit = auditSourceTraceWidths(before)
    if (audit.invalidDeclarations.length || audit.attributionConflicts.length)
      throw new Error("Source width diagnostics require valid width declarations and unambiguous route ownership")
    const sourceById = new Map(circuit.db.source_trace.list().map(source => [source.source_trace_id, source]))
    const traceById = new Map(circuit.db.pcb_trace.list().map(trace => [trace.pcb_trace_id, trace]))
    const ports = circuit.db.pcb_port.list()
    const metrics = audit.metrics.filter(metric => metric.attribution === "source_trace_id")
    const metricsBySource = new Map<string, Metric[]>()
    for (const metric of metrics) {
      const owned = metricsBySource.get(metric.sourceTraceId) ?? []
      owned.push(metric)
      metricsBySource.set(metric.sourceTraceId, owned)
    }
    const changes: TraceWidthDiagnosticChange[] = []
    const record = (old: Warning | null, next: Warning | null, cause: TraceWidthDiagnosticChange["cause"], owned: Metric[]) => {
      const sourceTraceId = (old ?? next)!.source_trace_id
      changes.push({ before: old && copy(old), after: next && copy(next), cause, sourceTraceId,
        requiredWidthMm: sourceById.get(sourceTraceId)?.min_trace_thickness ?? null,
        ownedPcbTraceIds: owned.map(metric => metric.pcbTraceId),
        minimumOwnedWidthMm: owned.some(metric => metric.minimumActualWidthMm !== null)
          ? Math.min(...owned.flatMap(metric => metric.minimumActualWidthMm === null ? [] : [metric.minimumActualWidthMm])) : null })
    }
    const corrected = (metric: Metric, old?: Warning): Omit<Warning, "type" | "pcb_trace_warning_id"> => {
      const source = sourceById.get(metric.sourceTraceId)!
      const finding = metric.findings[0]!
      const sourcePorts = ports.filter(port => source.connected_source_port_ids.includes(port.source_port_id))
      return { warning_type: "pcb_trace_warning", source_trace_id: source.source_trace_id,
        pcb_trace_id: metric.pcbTraceId, message: message(source, metric.minimumActualWidthMm!),
        center: { x: finding.x, y: finding.y },
        pcb_port_ids: sourcePorts.map(port => port.pcb_port_id),
        pcb_component_ids: [...new Set(sourcePorts.flatMap(port => port.pcb_component_id ? [port.pcb_component_id] : []))],
        subcircuit_id: old?.subcircuit_id ?? traceById.get(metric.pcbTraceId)?.subcircuit_id }
    }
    // Retire only diagnostics created here when their owned route is restored.
    for (const [id, previous] of generated) {
      const current = circuit.db.pcb_trace_warning.get(id)
      const owned = metricsBySource.get(previous.source_trace_id) ?? []
      const violation = owned.find(metric => metric.pcbTraceId === previous.pcb_trace_id && metric.findings.length)
      if (!current || JSON.stringify(current) !== JSON.stringify(previous)) { generated.delete(id); continue }
      const source = sourceById.get(previous.source_trace_id), trace = traceById.get(previous.pcb_trace_id)
      const nativeReplacement = source && trace && circuit.db.pcb_trace_warning.list().find(warning =>
        warning.pcb_trace_warning_id !== id && !generated.has(warning.pcb_trace_warning_id)
        && warning.source_trace_id === previous.source_trace_id && warning.pcb_trace_id === previous.pcb_trace_id
        && isNativeWidthWarning(warning, source, trace, ports))
      if (nativeReplacement) {
        circuit.db.pcb_trace_warning.delete(id)
        record(previous, nativeReplacement, "native-width-diagnostic-retained", owned)
        generated.delete(id)
        continue
      }
      if (!violation) {
        circuit.db.pcb_trace_warning.delete(id)
        record(previous, null, "owned-route-width-restored", owned)
        generated.delete(id)
      } else {
        const next = { ...current, ...corrected(violation, current) }
        if (JSON.stringify(next) !== JSON.stringify(current)) {
          record(current, next, "owned-route-below-source-width", owned)
          circuit.db.pcb_trace_warning.update(id, next)
          generated.set(id, copy(next))
        }
      }
    }
    for (const warning of circuit.db.pcb_trace_warning.list()) {
      if (generated.has(warning.pcb_trace_warning_id)) continue
      const source = sourceById.get(warning.source_trace_id), trace = traceById.get(warning.pcb_trace_id)
      const owned = metricsBySource.get(warning.source_trace_id) ?? []
      if (!source || !trace || trace.source_trace_id === source.source_trace_id || !owned.length
        || !isNativeWidthWarning(warning, source, trace, ports)) continue
      const otherSource = sourceById.get(trace.source_trace_id ?? "")
      if (!source.subcircuit_connectivity_map_key || source.subcircuit_connectivity_map_key !== otherSource?.subcircuit_connectivity_map_key) continue
      // Explicit own routes must cover every requested source endpoint before
      // a warning about another branch can be corrected as an attribution bug.
      if (source.connected_source_port_ids.some(id => !owned.some(metric => metric.sourceEndpoints
        .some(endpoint => endpoint.sourcePortId === id && endpoint.contactedPcbPortIds.length)))) continue
      const violation = owned.find(metric => metric.findings.length)
      if (violation) {
        const retained = circuit.db.pcb_trace_warning.list().find(other => other.source_trace_id === source.source_trace_id
          && other.pcb_trace_id === violation.pcbTraceId && (generated.has(other.pcb_trace_warning_id)
            || isNativeWidthWarning(other, source, traceById.get(violation.pcbTraceId)!, ports)))
        if (retained) {
          record(warning, retained, "native-net-wide-attribution", owned)
          circuit.db.pcb_trace_warning.delete(warning.pcb_trace_warning_id)
          continue
        }
        const next = { ...warning, ...corrected(violation, warning) }
        record(warning, next, "native-net-wide-attribution", owned)
        circuit.db.pcb_trace_warning.update(warning.pcb_trace_warning_id, next)
        generated.set(next.pcb_trace_warning_id, copy(next))
      } else if (owned.every(metric => metric.minimumActualWidthMm !== null)) {
        record(warning, null, "native-net-wide-attribution", owned)
        circuit.db.pcb_trace_warning.delete(warning.pcb_trace_warning_id)
      }
    }
    for (const metric of metrics.filter(metric => metric.findings.length)) {
      const source = sourceById.get(metric.sourceTraceId)!
      const trace = traceById.get(metric.pcbTraceId)!
      const detected = circuit.db.pcb_trace_warning.list().some(warning => warning.source_trace_id === metric.sourceTraceId
        && warning.pcb_trace_id === metric.pcbTraceId && (generated.has(warning.pcb_trace_warning_id)
          || isNativeWidthWarning(warning, source, trace, ports)))
      if (detected) continue
      const warning = circuit.db.pcb_trace_warning.insert(corrected(metric))
      generated.set(warning.pcb_trace_warning_id, copy(warning))
      record(null, warning, "owned-route-below-source-width", metricsBySource.get(metric.sourceTraceId)!)
    }
    const nonWarnings = (elements: AnyCircuitElement[]) => JSON.stringify(elements.filter(element => element.type !== "pcb_trace_warning"))
    const after = circuit.db.toArray()
    if (nonWarnings(before) !== nonWarnings(after)) throw new Error("Width diagnostics changed an unrelated circuit element")
    if (changes.length) receipts.push({ asyncEffectId: event.asyncEffectId,
      beforeWarningCount: before.filter(element => element.type === "pcb_trace_warning").length,
      afterWarningCount: circuit.db.pcb_trace_warning.list().length,
      sourceConstrainedRouteCount: metrics.length, routeViolationCount: metrics.filter(metric => metric.findings.length).length,
      changes, nonTraceWarningElementsUnchanged: true })
  })
  return receipts
}
