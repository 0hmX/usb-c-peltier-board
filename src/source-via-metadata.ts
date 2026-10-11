import type { RootCircuit } from "@tscircuit/core"

const installed = new WeakSet<RootCircuit>()

// Core 0.0.2124 omits inline via sizes from pcbPath/pcbPaths route records.
// Ground fanout replay then rebuilds those vias using the smaller board floor.
// Preserve each source via's declared sizes through the public render/DB APIs.
export function installSourceViaMetadata(circuit: RootCircuit) {
  if (installed.has(circuit)) return
  installed.add(circuit)
  // Evaluators can supply a different core module instance. Its instanceof
  // check misses source-owned interior Ports; bind them by their DB ownership.
  let portsAttached = false
  circuit.on("renderable:renderLifecycle:PcbManualTraceRender:start", () => {
    if (portsAttached) return
    portsAttached = true
    const ports = circuit.db.pcb_port.list()
    const manualIds = new Set(circuit.db.source_manually_placed_via.list().map(via => via.source_manually_placed_via_id))
    const components = circuit.db.pcb_component.list()
    for (const via of circuit.db.pcb_via.list()) {
      const firstPort = ports.find(port => port.pcb_port_id === via.pcb_port_ids?.[0])
      const component = components.find(component => component.pcb_component_id === firstPort?.pcb_component_id)
      if (!component || !manualIds.has(component.source_component_id ?? "")) continue
      const ownedPorts = ports.filter(port => port.pcb_component_id === component.pcb_component_id)
      if (ownedPorts.some(port => Math.hypot(port.x - via.x, port.y - via.y) > 1e-9
        || port.layers.some(layer => !via.layers.includes(layer)))) {
        throw new Error(`Invalid source port for ${via.pcb_via_id}`)
      }
      const ids = ownedPorts.map(port => port.pcb_port_id)
      if (JSON.stringify(ids) !== JSON.stringify(via.pcb_port_ids)) {
        circuit.db.pcb_via.update(via.pcb_via_id, { pcb_port_ids: ids })
      }
    }
  })
  const normalized = new Set<string>()
  circuit.on("renderable:renderLifecycle:PcbManualTraceRender:end", () => {
    for (const trace of circuit.db.pcb_trace.list()) {
      if (normalized.has(trace.pcb_trace_id)) continue
      let changed = false
      const route = trace.route.map(point => {
        if (point.route_type !== "via" || ("via_diameter" in point && point.via_diameter !== undefined)) return point
        const via = circuit.db.pcb_via.list().find(via => via.pcb_trace_id === trace.pcb_trace_id
          && Math.abs(via.x - point.x) < 1e-9 && Math.abs(via.y - point.y) < 1e-9)
        if (!via) throw new Error(`Missing source via for ${trace.pcb_trace_id}`)
        changed = true
        return { ...point, via_diameter: via.outer_diameter, via_hole_diameter: via.hole_diameter }
      })
      if (changed) circuit.db.pcb_trace.update(trace.pcb_trace_id, { route })
      normalized.add(trace.pcb_trace_id)
    }
  })
}
