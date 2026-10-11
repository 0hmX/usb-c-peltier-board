import type { AnyCircuitElement, CircuitJson } from "circuit-json"
import { tracePortCopperContact } from "./source-ground-pad-copper"

type Trace = Extract<AnyCircuitElement, { type: "pcb_trace" }>
type SourceTrace = Extract<AnyCircuitElement, { type: "source_trace" }>

/** Resolve original per-wire IDs or the public ordered connectsTo pair.
 * Metadata alone never establishes contact with an actual pad or barrel. */
export function resolveSourceTraceEndpoints({ circuit, trace, source }: {
  circuit: CircuitJson; trace: Trace; source: SourceTrace
}) {
  const ports = source.connected_source_port_ids.map(id => {
    const matches = circuit.filter(element => element.type === "pcb_port" && element.source_port_id === id)
    return matches.length === 1 ? matches[0] : undefined
  })
  const first = trace.route[0], last = trace.route.at(-1)
  const lands = (point: Trace["route"][number] | undefined, port: typeof ports[number]) => point?.route_type === "wire"
    && port?.type === "pcb_port" && port.layers.includes(point.layer)
    && Math.hypot(point.x - port.x, point.y - port.y) < 1e-6
  const forward = ports.length === 2 && lands(first, ports[0]) && lands(last, ports[1])
  const reverse = ports.length === 2 && lands(first, ports[1]) && lands(last, ports[0])
  const ordered = reverse && !forward ? [ports[1], ports[0]] : ports
  const ids = ordered.map(port => port?.type === "pcb_port" ? port.pcb_port_id : undefined)
  const explicit = "connectsTo" in trace ? trace.connectsTo : undefined
  const originalPair = first?.route_type === "wire" && last?.route_type === "wire"
    && first.start_pcb_port_id === ids[0] && last.end_pcb_port_id === ids[1]
  const publicPair = Array.isArray(explicit) && explicit.length === 2
    && explicit[0] === ids[0] && explicit[1] === ids[1]
  const annotationsConsistent = first?.route_type === "wire" && last?.route_type === "wire"
    && [first.start_pcb_port_id, first.end_pcb_port_id].every(id => !id || id === ids[0])
    && [last.start_pcb_port_id, last.end_pcb_port_id].every(id => !id || id === ids[1])
    && (explicit === undefined || publicPair)
  const contacts = ordered.map((port, index) => {
    const point = index === 0 ? first : last
    return port?.type === "pcb_port" && point?.route_type === "wire"
      ? tracePortCopperContact(circuit, port.pcb_port_id, trace, point.layer) : undefined
  })
  const sourceNetKey = source.subcircuit_connectivity_map_key
  const sourceOwnershipValid = !!sourceNetKey && source.connected_source_port_ids.every(id => {
    const port = circuit.find(element => element.type === "source_port" && element.source_port_id === id)
    if (port?.type !== "source_port") return false
    const via = circuit.find(element => element.type === "source_manually_placed_via"
      && element.source_manually_placed_via_id === port.source_component_id)
    const net = via?.type === "source_manually_placed_via" ? circuit.find(element => element.type === "source_net"
      && element.source_net_id === via.source_net_id) : undefined
    return (port.subcircuit_connectivity_map_key ?? (net?.type === "source_net" ? net.subcircuit_connectivity_map_key : undefined)) === sourceNetKey
  }) && source.connected_source_net_ids.every(id => circuit.some(element => element.type === "source_net"
    && element.source_net_id === id && element.subcircuit_connectivity_map_key === sourceNetKey))
  const valid = trace.source_trace_id === source.source_trace_id && source.connected_source_port_ids.length === 2
    && new Set(source.connected_source_port_ids).size === 2 && ports.every(port => port?.type === "pcb_port")
    && (forward !== reverse) && (originalPair || publicPair) && annotationsConsistent
    && sourceOwnershipValid && contacts.length === 2 && contacts.every(contact => contact?.valid)
  return { sourceTraceId: source.source_trace_id, pcbTraceId: trace.pcb_trace_id,
    sourcePortIds: source.connected_source_port_ids, orderedPcbPortIds: ids, representation: publicPair ? "connectsTo" : "per-wire",
    endpointLayers: [first, last].map(point => point?.route_type === "wire" ? point.layer : undefined),
    contacts, sourceOwnershipValid, valid: !!valid }
}
