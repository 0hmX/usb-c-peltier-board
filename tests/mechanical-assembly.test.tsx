import { describe, expect, spyOn, test } from "bun:test"
import { assembly, Circuit } from "@tscircuit/core"
import { CircuitRunner } from "@tscircuit/eval"
import { Children, isValidElement } from "react"
import { convertCircuitJsonTo3D, loadJscadPlan } from "circuit-json-to-gltf"
import PeltierAssembly from "../assembly"
import { DualUsbPeltierBoard } from "../src/revision/board"
import {
  conceptWires, MechanicalAssembly, mechanicalCadCount, mechanicalConcept,
  mechanicalPartNames, mechanicalParts,
} from "../src/revision/mechanical-assembly"

function nativeBounds(name: string) {
  const component = mechanicalParts.find(part => part.name === name)!
  const { boundingBox } = loadJscadPlan(component.cadModel.jscad)
  const offset = component.cadModel.positionOffset!
  return {
    min: [boundingBox.min.x + Number(offset.x), boundingBox.min.z + Number(offset.y), boundingBox.min.y + Number(offset.z)],
    max: [boundingBox.max.x + Number(offset.x), boundingBox.max.z + Number(offset.y), boundingBox.max.y + Number(offset.z)],
  }
}

let rendered: Promise<{ baseline: InstanceType<typeof Circuit>; assembled: InstanceType<typeof Circuit> }> | undefined
function renderFixture() {
  rendered ??= (async () => {
    const baseline = new Circuit()
    baseline.add(<assembly.device name="DUAL_USB_PELTIER_CONCEPT"><DualUsbPeltierBoard /></assembly.device>)
    await baseline.renderUntilSettled()
    const assembled = new Circuit()
    assembled.add(<PeltierAssembly />)
    await assembled.renderUntilSettled()
    return { baseline, assembled }
  })()
  return rendered
}

describe("native full-device mechanical CONCEPT", () => {
  test("29 flat native parts carry explicit concept identity and no remote models", () => {
    expect(mechanicalCadCount).toBe(29)
    expect(new Set(mechanicalPartNames).size).toBe(mechanicalCadCount)
    expect(Children.count(MechanicalAssembly().props.children)).toBe(mechanicalCadCount)
    for (const element of Children.toArray(MechanicalAssembly().props.children)) {
      expect(isValidElement(element)).toBe(true)
      if (!isValidElement<{ name: string; displayName: string }>(element)) throw new Error("Missing native assembly.part")
      expect(element.type).toBe(assembly.part)
      expect(element.props.name.startsWith("CONCEPT_")).toBe(true)
      expect(element.props.displayName).toContain("not fabrication fit")
    }
    expect(mechanicalConcept.documentation.join(" ")).toContain("assumed TEC polarity")
    expect(mechanicalConcept.documentation.join(" ")).toContain("INCLUDING startup/stall")
    expect(mechanicalConcept.fanMaxCurrentAIncludingStartupAndStall).toBe(1)
    for (const component of mechanicalParts) {
      expect(Object.keys(component.cadModel).some(key => /url/i.test(key))).toBe(false)
      expect(component.cadModel.modelUnitToMmScale).toBe(1)
    }
  })

  test("every JSCAD plan produces finite colored native triangles at its nominal dimensions", () => {
    for (const component of mechanicalParts) {
      const mesh = loadJscadPlan(component.cadModel.jscad)
      expect(mesh.triangles.length).toBeGreaterThan(0)
      const sizes = [
        mesh.boundingBox.max.x - mesh.boundingBox.min.x,
        mesh.boundingBox.max.z - mesh.boundingBox.min.z,
        mesh.boundingBox.max.y - mesh.boundingBox.min.y,
      ]
      for (const [axis, size] of sizes.entries()) expect(size).toBeCloseTo(component.dimensionsMm[axis]!, 4)
      expect(mesh.triangles.some(triangle => triangle.material?.color)).toBe(true)
      for (const triangle of mesh.triangles) for (const vertex of triangle.vertices) {
        expect([vertex.x, vertex.y, vertex.z].every(Number.isFinite)).toBe(true)
      }
    }
  })

  test("the side-mounted thermal stack contacts both TEC faces without exploding or covering the PCB", () => {
    const coldSink = nativeBounds("CONCEPT_COLD_FINNED_HEATSINK_44x44x12")
    const coldPlate = nativeBounds("CONCEPT_COLD_PLATE_44x44x4")
    const tec = nativeBounds("CONCEPT_TEC_40x40x3p8")
    const hotSink = nativeBounds("CONCEPT_HOT_FINNED_HEATSINK_60x60x24")
    const fan = nativeBounds("CONCEPT_FAN_60x60x15_12V_MAX1A_INCLUDING_STARTUP_STALL")
    expect(coldSink.max[2]).toBeCloseTo(coldPlate.min[2]!)
    expect(coldPlate.max[2]).toBeCloseTo(tec.min[2]!)
    expect(tec.max[2]).toBeCloseTo(hotSink.min[2]!)
    expect(hotSink.max[2]).toBeCloseTo(fan.min[2]!)
    expect(tec.min[2]).toBeCloseTo(mechanicalConcept.coldFaceZ)
    expect(tec.max[2]).toBeCloseTo(mechanicalConcept.hotFaceZ)
    expect(hotSink.min[0]! - mechanicalConcept.boardSizeMm[0] / 2).toBeCloseTo(15)
    expect(mechanicalConcept.hotProbeCenter[2]).toBeGreaterThan(mechanicalConcept.hotFaceZ)
    expect(mechanicalConcept.coldProbeCenter[2]).toBeLessThan(mechanicalConcept.coldFaceZ)
    expect(mechanicalConcept.hotProbeCenter[1]).toBe(hotSink.min[1]!)
    expect(mechanicalConcept.coldProbeCenter[1]).toBe(coldPlate.min[1]!)
  })

  test("ten physical conductors include separate red/black TEC leads from J_TEC to the ceramic edge", () => {
    expect(conceptWires).toHaveLength(10)
    const tec = conceptWires.filter(wire => wire.connectorName === "J_TEC")
    expect(tec).toHaveLength(2)
    expect(tec.map(wire => wire.path[0])).toEqual([[50, 17, 0.8], [50, 17, 0.8]])
    expect(tec.map(wire => wire.path.at(-1))).toEqual([[80, 5, 1.1], [80, -5, 1.1]])
    expect(tec[0]!.color).not.toEqual(tec[1]!.color)
    expect(conceptWires.filter(wire => wire.connectorName === "J_FAN").map(wire => wire.signal)).toEqual(["GND", "V12_FAN", "FAN_TACH", "FAN_PWM"])
    for (const wire of conceptWires) {
      expect(wire.diameterMm).toBeGreaterThan(0)
      const leadMesh = loadJscadPlan({ type: "hullChain", shapes: wire.path.map(center => ({ type: "sphere", radius: wire.diameterMm / 2, center, segments: 8 })) })
      expect(leadMesh.triangles.length).toBeGreaterThan(20)
      const component = mechanicalParts.find(part => part.name === wire.partName)!
      const coloredMesh = loadJscadPlan(component.cadModel.jscad)
      expect(coloredMesh.triangles.every(triangle => JSON.stringify(triangle.material?.color) === JSON.stringify(wire.color))).toBe(true)
    }
  })

  test("standoffs align with the four existing holes and seat under the unchanged board", async () => {
    const { baseline } = await renderFixture()
    const holes = baseline.db.pcb_hole.list()
    expect(holes.filter(hole => mechanicalConcept.boardMounts.some(([horizontal, vertical]) => hole.x === horizontal && hole.y === vertical)).map(hole => [hole.x, hole.y])).toEqual(mechanicalConcept.boardMounts)
    for (const [index, [horizontal, vertical]] of mechanicalConcept.boardMounts.entries()) {
      const standoff = nativeBounds("CONCEPT_PCB_STANDOFF_H" + (index + 1) + "_OD6_ID3p2_H12")
      expect((standoff.min[0]! + standoff.max[0]!) / 2).toBe(horizontal)
      expect((standoff.min[1]! + standoff.max[1]!) / 2).toBe(vertical)
      expect(standoff.max[2]).toBeCloseTo(-0.8)
      const screw = mechanicalParts.find(part => part.name.startsWith("CONCEPT_PCB_SCREW_H" + (index + 1)))!
      expect(screw.cadModel.positionOffset).toEqual({ x: horizontal, y: vertical, z: 0.8 })
    }
  }, 120000)

  test("all board/electrical/schematic records and board CAD poses stay identical", async () => {
    const { baseline, assembled } = await renderFixture()
    const original = baseline.getCircuitJson()
    const actual = assembled.getCircuitJson()
    const mechanicalSources = assembled.db.source_component.list().filter(component => mechanicalPartNames.includes(component.name!))
    const mechanicalIds = new Set(mechanicalSources.map(component => component.source_component_id))
    expect(mechanicalSources).toHaveLength(mechanicalCadCount)
    expect(mechanicalSources.every(component => ["part", "subassembly"].includes(component.ftype))).toBe(true)
    const unchanged = actual.filter(item => !((item.type === "source_component" || item.type === "cad_component") && mechanicalIds.has(item.source_component_id)))
    const normalizeWarnings = (records: typeof original) => records.map(item => "message" in item && typeof item.message === "string" ? { ...item, message: item.message.replace(/#\d+/g, "#INSTANCE") } : item)
    expect(normalizeWarnings(unchanged)).toEqual(normalizeWarnings(original))
    expect(assembled.db.pcb_component.list()).toHaveLength(276)
    expect(assembled.db.source_port.list()).toHaveLength(752)
    expect(assembled.db.source_net.list()).toHaveLength(139)
    expect(assembled.db.schematic_sheet.list()).toHaveLength(8)
    const cad = assembled.db.cad_component.list().filter(component => mechanicalIds.has(component.source_component_id))
    expect(cad).toHaveLength(mechanicalCadCount)
    expect(cad.every(component => component.model_jscad && !component.pcb_component_id)).toBe(true)
    expect(actual.filter(item => item.type.endsWith("error"))).toEqual([])
    expect(actual.filter(item => ["pcb_trace", "pcb_via", "cad_cable"].includes(item.type))).toEqual([])
  }, 120000)

  test("installed native 3D conversion includes every mechanical model without fetching assets", async () => {
    const { assembled } = await renderFixture()
    const mechanicalIds = new Set(assembled.db.source_component.list().filter(component => mechanicalPartNames.includes(component.name!)).map(component => component.source_component_id))
    const geometry = assembled.getCircuitJson().filter(item => (item.type === "source_component" || item.type === "cad_component") && mechanicalIds.has(item.source_component_id))
    const fetchMock = spyOn(globalThis, "fetch").mockImplementation(Object.assign(async () => { throw new Error("Mechanical CAD must not fetch remote assets") }, { preconnect: globalThis.fetch.preconnect }))
    try {
      const scene = await convertCircuitJsonTo3D(geometry, { drawFauxBoard: false, renderBoardTextures: false })
      expect(scene.boxes).toHaveLength(mechanicalCadCount)
      expect(scene.boxes.every(box => box.mesh && box.mesh.triangles.length > 0)).toBe(true)
      expect(fetchMock).not.toHaveBeenCalled()
    } finally {
      fetchMock.mockRestore()
    }
  }, 120000)

  test("published source evaluates all local JSCAD parts through CircuitRunner without CDN loading", async () => {
    const files = ["assembly.tsx", "package.json", "tscircuit.config.json", "tscircuit.config.ts", ...new Bun.Glob("{src,imports}/**/*.{ts,tsx,js,json}").scanSync(".")]
    const fsMap = Object.fromEntries(await Promise.all(files.map(async file => [file, await Bun.file(file).text()])))
    const fetchMock = spyOn(globalThis, "fetch").mockImplementation(Object.assign(async () => { throw new Error("Published mechanical assembly must not fetch remote code") }, { preconnect: globalThis.fetch.preconnect }))
    const runner = new CircuitRunner()
    try {
      await runner.setDisableCdnLoading(true)
      await runner.executeWithFsMap({ mainComponentPath: "assembly.tsx", fsMap })
      await runner.renderUntilSettled()
      const circuit = await runner.getCircuitJson()
      const mechanicalIds = new Set(circuit.flatMap(item => item.type === "source_component" && mechanicalPartNames.includes(item.name!) ? [item.source_component_id] : []))
      expect(mechanicalIds.size).toBe(mechanicalCadCount)
      expect(circuit.filter(item => item.type === "cad_component" && mechanicalIds.has(item.source_component_id))).toHaveLength(mechanicalCadCount)
      expect(circuit.filter(item => item.type === "pcb_component")).toHaveLength(276)
      expect(circuit.filter(item => item.type === "source_port")).toHaveLength(752)
      expect(circuit.filter(item => item.type === "source_net")).toHaveLength(139)
      expect(circuit.filter(item => item.type === "schematic_sheet")).toHaveLength(8)
      expect(circuit.filter(item => item.type.endsWith("error"))).toEqual([])
      expect(fetchMock).not.toHaveBeenCalled()
    } finally {
      fetchMock.mockRestore()
      runner.kill()
    }
  }, 120000)
})
