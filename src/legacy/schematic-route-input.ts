import type { RootCircuit } from "@tscircuit/core"

type Connection = { pinIds: string[]; netId?: string }
type RoutingInput = {
  directConnections: Connection[]
  chips: { pins: { pinId: string; x: number; y: number }[] }[]
}
export type SchematicRouteInputReceipt = {
  connectionCount: number; originalOrder: number[]; repairedOrder: number[]; changed: boolean
}
const installed = new WeakMap<RootCircuit, SchematicRouteInputReceipt[]>()

// Core 0.0.2124's schematic connectivity map aliases arrays when two existing
// groups merge. Growing each group before starting another avoids those aliases.
// Reorder existing edges only: every pin, net, and routing property is preserved.
export function installSchematicRouteInput(circuit: RootCircuit) {
  const existing = installed.get(circuit)
  if (existing) return existing
  const receipts: SchematicRouteInputReceipt[] = []
  installed.set(circuit, receipts)
  // TI TPS259470A pin 3 is AUXOFF; keep legacy source aliases for saved routes.
  circuit.on("renderable:renderLifecycle:SchematicPortRender:end", () => {
    for (const component of circuit.db.source_component.list()) {
      if (component.manufacturer_part_number !== "TPS259470ARPWR"
        || !component.supplier_part_numbers?.jlcpcb?.includes("C3662799")) continue
      const sourcePort = circuit.db.source_port.list().find(port =>
        port.source_component_id === component.source_component_id && port.pin_number === 3)
      if (!sourcePort) continue
      for (const port of circuit.db.schematic_port.list()) {
        if (port.source_port_id !== sourcePort.source_port_id) continue
        if (port.display_pin_label !== "AUXOFF")
          circuit.db.schematic_port.update(port.schematic_port_id, { display_pin_label: "AUXOFF" })
        const schematic = port.schematic_component_id && circuit.db.schematic_component.get(port.schematic_component_id)
        if (schematic && schematic.port_labels?.pin3 !== "AUXOFF")
          circuit.db.schematic_component.update(schematic.schematic_component_id, {
            port_labels: { ...schematic.port_labels, pin3: "AUXOFF" },
          })
      }
    }
  })
  circuit.on("renderable:renderLifecycle:SchematicSheetRender:end", () => {
    const nameOffsets: Record<string, [number, number, "bottom_left" | "bottom_right"]> = {
      Q20: [-.25, .74, "bottom_right"], Q22: [.3, .622, "bottom_left"],
      Q23: [-.4, .64, "bottom_right"], Q_FAULT_CLEAR: [-.4, .64, "bottom_right"],
    }
    for (const text of circuit.db.schematic_text.list()) {
      const component = text.schematic_component_id ? circuit.db.schematic_component.get(text.schematic_component_id) : undefined
      const source = component?.source_component_id && circuit.db.source_component.get(component.source_component_id)
      const offset = source && text.text === source.name && nameOffsets[source.name]
      if (!component || !offset) continue
      const angle = (text.rotation ?? 0) * Math.PI / 180
      circuit.db.schematic_text.update(text.schematic_text_id, { anchor: offset[2], position: {
        x: component.center.x + offset[0] * Math.cos(angle) - offset[1] * Math.sin(angle),
        y: component.center.y + offset[0] * Math.sin(angle) + offset[1] * Math.cos(angle),
      } })
    }
    for (const group of circuit.db.schematic_group.list()) if (group.subcircuit_id === null)
      circuit.db.schematic_group.update(group.schematic_group_id, { subcircuit_id: undefined })
  })
  circuit.on("solver:started", event => {
    if (event.solverName !== "SchematicTracePipelineSolver") return
    const input = event.solverParams as RoutingInput
    const pins = new Map<string, { x: number; y: number }>()
    for (const chip of input.chips) for (const pin of chip.pins) {
      const prior = pins.get(pin.pinId)
      if (prior && (prior.x !== pin.x || prior.y !== pin.y))
        throw new Error(`Conflicting schematic positions for ${pin.pinId}`)
      pins.set(pin.pinId, pin)
    }
    const original = [...input.directConnections]
    const originalOrder = original.map((_, index) => index)
    const remaining = [...originalOrder], repairedOrder: number[] = []
    while (remaining.length) {
      const connected = new Set<string>()
      const append = (index: number) => {
        const edge = original[index]!
        repairedOrder.push(index)
        for (const pin of edge.pinIds) connected.add(pin)
        if (edge.netId) connected.add(edge.netId)
      }
      append(remaining.shift()!)
      let added = true
      while (added) {
        added = false
        for (let i = 0; i < remaining.length; i++) {
          const edge = original[remaining[i]!]!
          if (!edge.pinIds.some(pin => connected.has(pin)) && !(edge.netId && connected.has(edge.netId))) continue
          append(remaining[i]!)
          remaining.splice(i--, 1)
          added = true
        }
      }
    }
    input.directConnections.splice(0, original.length, ...repairedOrder.map(index => original[index]!))
    receipts.push({ connectionCount: original.length, originalOrder, repairedOrder,
      changed: repairedOrder.some((index, position) => index !== position) })
  })
  return receipts
}
