import type { AnyCircuitElement, CircuitJson } from "circuit-json"

type PcbTrace = Extract<AnyCircuitElement, { type: "pcb_trace" }>
// Native SimpleRoute output preserves source attribution in connection_name.
// Final Circuit JSON commonly carries source_trace_id instead.
export type AttributedPcbTrace = PcbTrace & { connection_name?: string }
const minimumWireWidth = (point: Extract<PcbTrace["route"][number], { route_type: "wire" }>) =>
  Math.min(point.width, point.start_width ?? point.width, point.end_width ?? point.width)

export function auditSourceTraceWidths(circuit: CircuitJson, routes: AttributedPcbTrace[] = circuit.filter(element => element.type === "pcb_trace")) {
  const sourceTraces = circuit.filter(element => element.type === "source_trace")
  const sourceById = new Map(sourceTraces.map(trace => [trace.source_trace_id, trace]))
  const pcbPorts = circuit.filter(element => element.type === "pcb_port")
  const invalidDeclarations = sourceTraces.filter(trace => trace.min_trace_thickness !== undefined
    && (!Number.isFinite(trace.min_trace_thickness) || trace.min_trace_thickness <= 0))
    .map(trace => ({ sourceTraceId: trace.source_trace_id, name: trace.name, requiredMinWidthMm: trace.min_trace_thickness }))
  const attributionConflicts = routes.flatMap(trace => {
    const explicit = sourceById.get(trace.source_trace_id ?? "")
    const connection = sourceById.get(trace.connection_name ?? "")
    return explicit && connection && explicit.source_trace_id !== connection.source_trace_id
      ? [{ pcbTraceId: trace.pcb_trace_id, sourceTraceId: explicit.source_trace_id, connectionSourceTraceId: connection.source_trace_id }] : []
  })
  const metrics = routes.flatMap(trace => {
    const source = sourceById.get(trace.source_trace_id ?? "") ?? sourceById.get(trace.connection_name ?? "")
    if (!source || source.min_trace_thickness === undefined) return []
    const requiredMinWidthMm = source.min_trace_thickness
    const wires = trace.route.filter(point => point.route_type === "wire")
    const first = trace.route[0], last = trace.route.at(-1)
    const sourceEndpoints = source.connected_source_port_ids.map(id => {
      const ports = pcbPorts.filter(port => port.source_port_id === id)
      const endpointContacts = ports.filter(port => [first, last].some(point => point?.route_type === "wire"
        && port.layers.includes(point.layer) && Math.hypot(point.x - port.x, point.y - port.y) < 1e-6))
      return { sourcePortId: id, pcbPortIds: ports.map(port => port.pcb_port_id),
        contactedPcbPortIds: endpointContacts.map(port => port.pcb_port_id) }
    })
    const findings = trace.route.flatMap((point, routeIndex) => point.route_type === "wire"
      && (!Number.isFinite(minimumWireWidth(point)) || minimumWireWidth(point) < requiredMinWidthMm - 1e-6)
      ? [{ routeIndex, layer: point.layer, x: point.x, y: point.y, widthMm: minimumWireWidth(point),
        nominalWidthMm: point.width, startWidthMm: point.start_width, endWidthMm: point.end_width, requiredMinWidthMm }] : [])
    // Endpoint context is retained because native net-wide branch attribution
    // can reuse a source ID. An unexplained narrow branch remains a failure;
    // this checker does not waive it by treating the ID as harmless metadata.
    return [{ pcbTraceId: trace.pcb_trace_id, sourceTraceId: source.source_trace_id, name: source.name,
      attribution: trace.source_trace_id ? "source_trace_id" : "connection_name", requiredMinWidthMm,
      sourceEndpoints, contactsDeclaredEndpoint: sourceEndpoints.some(endpoint => endpoint.contactedPcbPortIds.length > 0),
      minimumActualWidthMm: wires.length ? Math.min(...wires.map(minimumWireWidth)) : null, findings }]
  })
  const violations = metrics.filter(trace => trace.findings.length > 0)
  return { valid: invalidDeclarations.length === 0 && attributionConflicts.length === 0 && violations.length === 0,
    routeCount: routes.length, sourceConstrainedRouteCount: metrics.length,
    routeViolationCount: violations.length, pointViolationCount: violations.reduce((total, trace) => total + trace.findings.length, 0),
    invalidDeclarations, attributionConflicts, violations, metrics }
}
