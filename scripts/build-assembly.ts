import { mkdir, readFile, writeFile, rm } from "node:fs/promises"
import { resolve } from "node:path"
import { createHash } from "node:crypto"
import { convertCircuitJsonTo3D, convertSceneToGLTF, type Point3, type Triangle } from "circuit-json-to-gltf"
import { renderGLTFToPNGFromGLB } from "poppygl"

// Consume the actual build; do not duplicate board/component geometry here.
const output = resolve(process.argv[2] ?? "dist/assembly")
await mkdir(output, { recursive: true })
await rm(resolve(output, "display-default.png"), { force: true })
const circuitSource = await readFile("dist/index/circuit.json", "utf8")
const circuit = JSON.parse(circuitSource)
const provenance = JSON.parse(await readFile("assets/assembly/provenance.json", "utf8"))
const board = circuit.find((e: any) => e.type === "pcb_board")
if (!board) throw new Error("Build the PCB first: bun run build")
if (circuit.some((e: any) => e.type === "pcb_trace" || e.type === "pcb_via")) throw new Error("Assembly expects an unrouted PCB")
provenance.pcb.circuitSha256 = createHash("sha256").update(circuitSource).digest("hex")
provenance.pcb.dimensionsMm = [board.width, board.height, board.thickness]
const dnpPads = circuit.filter((e: any) => e.type === "pcb_component" && e.do_not_place)
const dnpPcbIds = new Set(dnpPads.map((e: any) => e.pcb_component_id)), dnpSourceIds = new Set(dnpPads.map((e: any) => e.source_component_id))
provenance.pcb.copperTestPads = dnpPads.map((e: any) => ({ reference: circuit.find((s: any) => s.type === "source_component" && s.source_component_id === e.source_component_id)?.name, center: e.center, geometry: "Actual exposed PCB copper; no component body" }))
provenance.pcb.components = circuit.filter((e: any) => e.type === "source_component" && !dnpSourceIds.has(e.source_component_id)).map((e: any) => {
  const cad = circuit.find((c: any) => c.type === "cad_component" && c.source_component_id === e.source_component_id)
  return { reference: e.name, manufacturerPartNumber: e.manufacturer_part_number, jlcpcb: e.supplier_part_numbers?.jlcpcb, geometry: cad?.model_obj_url ?? cad?.model_glb_url ?? cad?.model_stl_url ?? (cad?.model_jscad ? "Component-wrapper JSCAD geometry; see source for dimensional provenance" : "Generic component envelope"), stepReference: cad?.model_step_url }
})
const source = (name: string) => circuit.find((e: any) => e.type === "source_component" && e.name === name)
const component = (name: string) => circuit.find((e: any) => e.type === "pcb_component" && e.source_component_id === source(name)?.source_component_id)
const usb = component("J_USB"), program = component("J_PROGRAM"), terminal = component("J_TEC")
if (!usb || !program || !terminal) throw new Error("Expected J_USB, J_PROGRAM and J_TEC in the actual circuit")
// DNP copper test pads remain in the PCB texture, with no artificial component bodies.
const renderCircuit = circuit.filter((e: any) => e.type !== "cad_component" || (!dnpPcbIds.has(e.pcb_component_id) && !dnpSourceIds.has(e.source_component_id)))
const scene = await convertCircuitJsonTo3D(renderCircuit, { renderBoardTextures: true, textureResolution: 2048 })

// Scene coordinates are PCB X, height above PCB, PCB Y, all in mm.
const box = (label: string, center: Point3, size: Point3, color: string) => {
  const vertices = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]].map(([x, y, z]) => ({ x: x * size.x / 2, y: y * size.y / 2, z: z * size.z / 2 }))
  const triangles: Triangle[] = []
  for (const [indices, normal] of [[[0, 3, 2, 1], [0, 0, -1]], [[4, 5, 6, 7], [0, 0, 1]], [[0, 4, 7, 3], [-1, 0, 0]], [[1, 2, 6, 5], [1, 0, 0]], [[0, 1, 5, 4], [0, -1, 0]], [[3, 7, 6, 2], [0, 1, 0]]]) {
    for (const face of [[indices[0], indices[1], indices[2]], [indices[0], indices[2], indices[3]]]) triangles.push({ vertices: face.map(i => vertices[i]) as [Point3, Point3, Point3], normal: { x: normal[0], y: normal[1], z: normal[2] } })
  }
  scene.boxes.push({ label, center, size, color, mesh: { triangles, boundingBox: { min: { x: -size.x / 2, y: -size.y / 2, z: -size.z / 2 }, max: { x: size.x / 2, y: size.y / 2, z: size.z / 2 } } } })
}
const tecX = board.width / 2 + 72, tecZ = terminal.center.y
box("TEC core (illustrative); overall listing envelope 40 x 40 x 3.6 mm", { x: tecX, y: 3.6 / 2, z: tecZ }, { x: 38.5, y: 2.2, z: 38.5 }, "#dadee1")
box("TEC upper ceramic plate (illustrative)", { x: tecX, y: 3.25, z: tecZ }, { x: 40, y: 0.7, z: 40 }, "#f6f7f6")
box("TEC lower ceramic plate (illustrative)", { x: tecX, y: 0.35, z: tecZ }, { x: 40, y: 0.7, z: 40 }, "#f6f7f6")

// Tubes are polygonal swept centerlines: illustrate external connections only.
function tube(label: string, points: Point3[], radius: number, color: string) {
  const triangles: Triangle[] = [], sides = 12
  const sub = (a: Point3, b: Point3) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z })
  const cross = (a: Point3, b: Point3) => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x })
  const normalize = (p: Point3) => { const n = Math.hypot(p.x, p.y, p.z); return { x: p.x / n, y: p.y / n, z: p.z / n } }
  const rings = points.map((p, index) => {
    const direction = normalize(sub(points[Math.min(index + 1, points.length - 1)], points[Math.max(index - 1, 0)]))
    const u = normalize(cross(direction, Math.abs(direction.y) < 0.9 ? { x: 0, y: 1, z: 0 } : { x: 1, y: 0, z: 0 })), v = cross(direction, u)
    return Array.from({ length: sides }, (_, i) => { const theta = 2 * Math.PI * i / sides; return { x: p.x + radius * (Math.cos(theta) * u.x + Math.sin(theta) * v.x), y: p.y + radius * (Math.cos(theta) * u.y + Math.sin(theta) * v.y), z: p.z + radius * (Math.cos(theta) * u.z + Math.sin(theta) * v.z) } })
  })
  for (let segment = 0; segment < points.length - 1; segment++) {
    for (let i = 0; i < sides; i++) {
      const a0 = rings[segment][i], a1 = rings[segment][(i + 1) % sides], b0 = rings[segment + 1][i], b1 = rings[segment + 1][(i + 1) % sides]
      for (const vertices of [[a0, a1, b0], [a1, b1, b0]] as [Point3, Point3, Point3][]) triangles.push({ vertices, normal: normalize(cross(sub(vertices[1], vertices[0]), sub(vertices[2], vertices[0]))) })
    }
  }
  const min = { x: Infinity, y: Infinity, z: Infinity }, max = { x: -Infinity, y: -Infinity, z: -Infinity }
  for (const p of points) for (const axis of ["x", "y", "z"] as const) { min[axis] = Math.min(min[axis], p[axis] - radius); max[axis] = Math.max(max[axis], p[axis] + radius) }
  scene.boxes.push({ label, center: { x: 0, y: 0, z: 0 }, size: { x: max.x - min.x, y: max.y - min.y, z: max.z - min.z }, color, mesh: { triangles, boundingBox: { min, max } } })
}

// Keep the polarity explicit, and bind the illustration to actual terminal ports.
for (const [pin, offset, color, label] of [["pin1", -3, "#c62c35", "+ / red"], ["pin2", 3, "#20242b", "- / black"]] as const) {
  const sourcePort = circuit.find((e: any) => e.type === "source_port" && e.source_component_id === source("J_TEC").source_component_id && e.port_hints?.includes(pin))
  const port = circuit.find((e: any) => e.type === "pcb_port" && e.source_port_id === sourcePort?.source_port_id)
  if (!port) throw new Error(`Missing J_TEC ${pin}`)
  tube(`TEC lead ${label} / routing illustration`, [{ x: port.x, y: 6, z: port.y }, { x: terminal.center.x + 15, y: 6, z: port.y }, { x: terminal.center.x + 34, y: 4, z: tecZ + offset }, { x: tecX - 20, y: 1.8, z: tecZ + offset }], 0.75, color)
}
for (const [port, role, color, direction] of [[usb, "PD power / 100 W charger", "#303640", 1], [program, "Program/debug / PC USB 2.0", "#aebaca", -1]] as const) {
  const plugX = (port.cable_insertion_center?.x ?? port.center.x - 7) - 0.5
  box(`${role}: USB-C plug / indicative envelope`, { x: plugX, y: 2.5, z: port.center.y }, { x: 7, y: 3.0, z: 8.3 }, "#b6bcc5")
  box(`${role}: Cable Matters 201440 overmold / indicative envelope`, { x: plugX - 14, y: 2.5, z: port.center.y }, { x: 20, y: 5.4, z: 11 }, color)
  tube(`${role}: Cable Matters 201440 / short segment illustration`, [{ x: plugX - 24, y: 2.5, z: port.center.y }, { x: plugX - 45, y: 2.5, z: port.center.y }, { x: plugX - 60, y: 2.5, z: port.center.y + direction * 13 }, { x: plugX - 66, y: 2.5, z: port.center.y + direction * 38 }], 2.1, color)
}

const glb = await convertSceneToGLTF(scene, { binary: true, embedImages: true, forceIndices: true }) as ArrayBuffer
await writeFile(resolve(output, "assembly.glb"), new Uint8Array(glb))
await writeFile(resolve(output, "provenance.json"), JSON.stringify(provenance, null, 2) + "\n")
const minX = Math.min(usb.center.x, program.center.x) - 78, maxX = tecX + 20, targetX = -(minX + maxX) / 2
const png = await renderGLTFToPNGFromGLB(new Uint8Array(glb), { width: 1600, height: 900, supersampling: 2, realistic: true, camPos: [targetX - 105, 184, 177], lookAt: [targetX, 0, 5], fov: 43, backgroundColor: "#f3f6fa" })
await writeFile(resolve(output, "assembly.png"), png)
const viewerSource = await Bun.build({ entrypoints: ["scripts/assembly-viewer.js"], target: "browser", minify: true })
if (!viewerSource.success) throw new Error("Could not bundle assembly viewer")
const js = await viewerSource.outputs[0].text()
const html = await readFile("assets/assembly/viewer.html", "utf8")
await writeFile(resolve(output, "assembly.html"), html.replace("__GLB__", Buffer.from(glb).toString("base64")).replace("__PREVIEW__", Buffer.from(png).toString("base64")).replace("__VIEWER__", () => js))
console.log(`Assembly exported to ${output}`)
