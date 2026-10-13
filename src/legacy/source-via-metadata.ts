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
  circuit.on("renderable:renderLifecycle:PcbManualTraceRender:start", () => {
    const ports = circuit.db.pcb_port.list()
    const portById = new Map(ports.map(port => [port.pcb_port_id, port]))
    const manualIds = new Set(circuit.db.source_manually_placed_via.list().map(via => via.source_manually_placed_via_id))
    const components = new Map(circuit.db.pcb_component.list().map(component => [component.pcb_component_id, component]))
    const portsByComponent = new Map<string, typeof ports>()
    for (const port of ports) {
      if (!port.pcb_component_id) continue
      const owned = portsByComponent.get(port.pcb_component_id) ?? []
      owned.push(port)
      portsByComponent.set(port.pcb_component_id, owned)
    }
    for (const via of circuit.db.pcb_via.list()) {
      const firstPort = portById.get(via.pcb_port_ids?.[0] ?? "")
      const component = components.get(firstPort?.pcb_component_id ?? "")
      if (!component || !manualIds.has(component.source_component_id ?? "")) continue
      const ownedPorts = portsByComponent.get(component.pcb_component_id) ?? []
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
  circuit.on("renderable:renderLifecycle:PcbManualTraceRender:end", () => {
    const viasByTrace = new Map<string, ReturnType<typeof circuit.db.pcb_via.list>>()
    for (const via of circuit.db.pcb_via.list()) {
      if (!via.pcb_trace_id) continue
      const vias = viasByTrace.get(via.pcb_trace_id) ?? []
      vias.push(via)
      viasByTrace.set(via.pcb_trace_id, vias)
    }
    for (const trace of circuit.db.pcb_trace.list()) {
      let changed = false
      const route = trace.route.map(point => {
        if (point.route_type !== "via") return point
        const diameter = "via_diameter" in point ? point.via_diameter : undefined
        const drill = "via_hole_diameter" in point ? point.via_hole_diameter : undefined
        if (diameter !== undefined && drill !== undefined) return point
        const matches = (viasByTrace.get(trace.pcb_trace_id) ?? []).filter(via =>
          Math.abs(via.x - point.x) < 1e-9 && Math.abs(via.y - point.y) < 1e-9
          && via.layers.includes(point.from_layer) && via.layers.includes(point.to_layer))
        if (matches.length !== 1) throw new Error(`Expected one source via for ${trace.pcb_trace_id}; found ${matches.length}`)
        const via = matches[0]!
        if ((diameter !== undefined && diameter !== via.outer_diameter)
          || (drill !== undefined && drill !== via.hole_diameter))
          throw new Error(`Conflicting source via sizes for ${trace.pcb_trace_id}`)
        changed = true
        return { ...point, via_diameter: via.outer_diameter, via_hole_diameter: via.hole_diameter }
      })
      if (changed) circuit.db.pcb_trace.update(trace.pcb_trace_id, { route })
    }
  })
}
