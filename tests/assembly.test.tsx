import { beforeAll, describe, expect, test } from "bun:test"
import { Circuit } from "tscircuit"
import { loadJscadPlan } from "circuit-json-to-gltf"
import Device from "../index.circuit"
import { boardFixture, renderFixture } from "./fixtures"
import { assemblyConnections } from "../src/assembly/models"
import provenance from "../assets/assembly/provenance.json"

type RenderedCircuit = InstanceType<typeof Circuit>
let board: RenderedCircuit, device: RenderedCircuit
const externalNames = ["TEC_DEFAULT", "USB_PD_CABLE", "USB_PROGRAM_CABLE", "TEC_POS_LEAD", "TEC_NEG_LEAD"]
const meshes = new Map<string, ReturnType<typeof loadJscadPlan>>()

beforeAll(async () => {
  board = await boardFixture()
}, 15_000)
beforeAll(async () => {
  device = await renderFixture(<Device schematicDisabled />)
}, 15_000)

function ownerName(c: RenderedCircuit, id: string | undefined) {
  return c.db.source_component.list().find(part => part.source_component_id === id)?.name
}

function externalGeometry(name: string) {
  const source = device.db.source_component.list().find(part => part.name === name)!
  const cad = device.db.cad_component.list().find(model => model.source_component_id === source.source_component_id)!
  let mesh = meshes.get(name)
  if (!mesh) { mesh = loadJscadPlan(cad.model_jscad!); meshes.set(name, mesh) }
  return { source, cad, mesh }
}

function physicalSignature(c: RenderedCircuit) {
  return c.getCircuitJson().filter(item => ["pcb_component", "pcb_smtpad", "pcb_plated_hole", "pcb_port"].includes(item.type))
    .map(item => {
      const value = item as unknown as Record<string, unknown>
      const pcb = c.db.pcb_component.list().find(part => part.pcb_component_id === value.pcb_component_id)
      return JSON.stringify({ name: pcb && ownerName(c, pcb.source_component_id),
        ...Object.fromEntries(Object.entries(value).filter(([key]) => !key.endsWith("_id") && !key.endsWith("_ids"))) })
    }).sort()
}

function electricalSignature(c: RenderedCircuit) {
  const roots = new Map<string, string>()
  function root(id: string): string {
    const parent = roots.get(id)
    return !parent || parent === id ? id : root(parent)
  }
  const join = (ids: string[]) => {
    if (!ids.length) return
    const first = root(ids[0]!)
    for (const id of ids.slice(1)) roots.set(root(id), first)
  }
  for (const trace of c.db.source_trace.list())
    join([...trace.connected_source_port_ids, ...trace.connected_source_net_ids])
  for (const part of c.db.source_component.list())
    for (const ports of part.internally_connected_source_port_ids ?? []) join(ports)
  return c.db.source_port.list().map(port => JSON.stringify({
    name: ownerName(c, port.source_component_id), pin: port.pin_number,
    nets: c.db.source_net.list().filter(net => root(net.source_net_id) === root(port.source_port_id)).map(net => net.name).sort(),
  })).sort()
}

describe("native Peltier assembly", () => {
  test("the default entry contains visible native models for the module, two USB cables and two TEC leads", () => {
    expect(device.firstChild?.componentName).toBe("AssemblyDevice")
    expect(device.getCircuitJson().filter(item => item.type.endsWith("_error"))).toEqual([])
    const external = device.db.source_component.list().filter(part => part.ftype === "subassembly")
    expect(external.map(part => part.name).sort()).toEqual([...externalNames].sort())
    for (const part of external) {
      expect(device.db.pcb_component.list().filter(pcb => pcb.source_component_id === part.source_component_id)).toHaveLength(0)
      expect(device.db.source_port.list().filter(port => port.source_component_id === part.source_component_id)).toHaveLength(0)
      const cad = device.db.cad_component.list().find(model => model.source_component_id === part.source_component_id)!
      expect(cad).toBeDefined()
      expect(cad.pcb_component_id).toBeUndefined()
      expect(cad.model_jscad).toBeDefined()
      const { mesh } = externalGeometry(part.name)
      expect(mesh.triangles.length).toBeGreaterThan(0)
      expect(mesh.triangles.every(triangle => triangle.vertices.every(vertex =>
        Number.isFinite(vertex.x) && Number.isFinite(vertex.y) && Number.isFinite(vertex.z)))).toBe(true)
      for (const axis of ["x", "y", "z"] as const)
        expect(mesh.boundingBox.max[axis] - mesh.boundingBox.min[axis]).toBeGreaterThan(0)
    }
  })

  test("the mechanical assembly preserves the entire physical PCB and its electrical connections", () => {
    expect(device.db.pcb_board.list()).toHaveLength(1)
    expect(device.db.pcb_component.list().filter(part => !part.do_not_place)).toHaveLength(
      board.db.pcb_component.list().filter(part => !part.do_not_place).length)
    expect(device.db.pcb_component.list().filter(part => part.do_not_place)).toHaveLength(16)
    expect(device.db.pcb_trace.list()).toHaveLength(0)
    expect(device.db.pcb_via.list()).toHaveLength(0)
    expect(physicalSignature(device)).toEqual(physicalSignature(board))
    expect(electricalSignature(device)).toEqual(electricalSignature(board))
  })

  test("accessory solids meet the real connector endpoints with correct TEC polarity and documented dimensions", () => {
    expect(assemblyConnections.map(connection => [connection.partName, connection.boardConnector,
      "pin" in connection ? connection.pin : undefined])).toEqual([
      ["USB_PD_CABLE", "J_USB", undefined], ["USB_PROGRAM_CABLE", "J_PROGRAM", undefined],
      ["TEC_POS_LEAD", "J_TEC", "pin1"], ["TEC_NEG_LEAD", "J_TEC", "pin2"],
    ])
    const { source: tecSource, cad: tecCad, mesh: tecMesh } = externalGeometry("TEC_DEFAULT")
    expect(tecSource.display_name).toContain("TEC1-12706")
    // loadJscadPlan converts circuit XY/Z into scene XZ/Y. Dimensions must
    // match the selected product's recorded envelope, not just its CAD label.
    const spans = (["x", "z", "y"] as const).map(axis => tecMesh.boundingBox.max[axis] - tecMesh.boundingBox.min[axis])
    for (let i = 0; i < 3; i++) expect(spans[i]!).toBeCloseTo(provenance.peltier.bodyDimensionsMm[i]!, 5)
    expect(provenance.peltier.source).toBe("https://www.amazon.com/dp/B00M1PM7H6")
    expect(provenance.peltier.nativePart).toBe(tecSource.name)
    expect(provenance.peltier.leadParts.map(lead => [lead.nativePart, lead.boardConnector, lead.pin])).toEqual(
      assemblyConnections.flatMap(connection => "pin" in connection
        ? [[connection.partName, connection.boardConnector, connection.pin]] : []))
    expect(provenance.usbCables.quantity).toBe(2)
    expect(provenance.usbCables.roles.map(role => role.boardPort).sort()).toEqual(["J_PROGRAM", "J_USB"])
    expect(provenance.usbCables.roles.map(role => [role.nativePart, role.boardPort])).toEqual(
      assemblyConnections.filter(connection => !("pin" in connection)).map(connection => [connection.partName, connection.boardConnector]))
    // Verify the rendered lead colors agree with their electrical polarity.
    for (const [name, positive] of [["TEC_POS_LEAD", true], ["TEC_NEG_LEAD", false]] as const) {
      const triangles = externalGeometry(name).mesh.triangles
      expect(triangles.every(triangle => {
        const color = triangle.material?.color
        return Array.isArray(color) && (positive
          ? color[0] > color[1] + 0.3 && color[0] > color[2] + 0.3
          : Math.max(...color) < 0.25)
      })).toBe(true)
    }

    for (const connection of assemblyConnections) {
      const part = device.db.source_component.list().find(part => part.name === connection.boardConnector)!
      const pcb = device.db.pcb_component.list().find(pcb => pcb.source_component_id === part.source_component_id)!
      if ("pin" in connection) {
        const pin = Number(connection.pin.slice(3))
        const sourcePort = device.db.source_port.list().find(port => port.source_component_id === part.source_component_id && port.pin_number === pin)!
        const pcbPort = device.db.pcb_port.list().find(port => port.source_port_id === sourcePort.source_port_id)!
        expect(connection.boardPoint[0]).toBeCloseTo(pcbPort.x, 5)
        expect(connection.boardPoint[1]).toBeCloseTo(pcbPort.y, 5)
        const trace = device.db.source_trace.list().find(trace => trace.connected_source_port_ids.includes(sourcePort.source_port_id))!
        const net = device.db.source_net.list().find(net => trace.connected_source_net_ids.includes(net.source_net_id))!
        expect(net.name).toBe(pin === 1 ? "TEC_POS" : "GND")
        const point = connection.modulePoint
        expect(point[0]).toBeCloseTo(tecCad.position.x + tecMesh.boundingBox.min.x, 5)
        expect(point[1]).toBeGreaterThan(tecCad.position.y + tecMesh.boundingBox.min.z)
        expect(point[1]).toBeLessThan(tecCad.position.y + tecMesh.boundingBox.max.z)
      } else {
        expect(pcb.cable_insertion_center).toBeDefined()
        expect(connection.boardPoint[0]).toBeCloseTo(pcb.cable_insertion_center!.x, 5)
        expect(connection.boardPoint[1]).toBeCloseTo(pcb.cable_insertion_center!.y, 5)
        expect(externalGeometry(connection.partName).source.display_name).toContain("Cable Matters 201440")
      }
      const { cad, mesh } = externalGeometry(connection.partName)
      expect(cad.rotation).toEqual({ x: 0, y: 0, z: 0 })
      const offset = { x: cad.position.x, y: cad.position.z, z: cad.position.y }
      // Check actual triangulated solids enclose both their board attachment
      // and authored wire path; this catches an offset applied twice or lost.
      for (const [x, circuitY, height] of [connection.boardPoint, ...connection.path]) {
        const point = { x, y: height, z: circuitY }
        for (const axis of ["x", "y", "z"] as const) {
          expect(point[axis]).toBeGreaterThanOrEqual(mesh.boundingBox.min[axis] + offset[axis] - 0.01)
          expect(point[axis]).toBeLessThanOrEqual(mesh.boundingBox.max[axis] + offset[axis] + 0.01)
        }
      }
    }
  })
})
