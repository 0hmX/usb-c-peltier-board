import { mkdir } from "node:fs/promises"
import { deepStrictEqual, ok } from "node:assert"
import { createHash } from "node:crypto"
import type { AnyCircuitElement, CircuitJson } from "circuit-json"
import { convertCircuitJsonToAssemblySvg } from "circuit-to-svg"
import { convertCircuitJsonTo3D, convertSceneToGLTF } from "circuit-json-to-gltf"
import { renderGLTFToPNGFromGLB } from "poppygl"
import { Resvg } from "@resvg/resvg-js"

const directory = "review/assembly"
const cacheDirectory = ".tscircuit/assembly-model-cache"
await mkdir(directory, { recursive: true })
await mkdir(cacheDirectory, { recursive: true })
const circuit: CircuitJson = await Bun.file("dist/assembly/circuit.json").json()
const baseline: CircuitJson = await Bun.file("review/circuit.json").json()

function physicalSignature(records: AnyCircuitElement[]) {
  const sources = records.filter(item => item.type === "source_component")
  const poses = records.filter(item => item.type === "pcb_component")
  return poses.map(pose => ({
    name: sources.find(part => part.source_component_id === pose.source_component_id)?.name,
    x: Number(pose.center.x.toFixed(6)), y: Number(pose.center.y.toFixed(6)),
    width: Number(pose.width.toFixed(6)), height: Number(pose.height.toFixed(6)), rotation: pose.rotation, layer: pose.layer,
  })).sort((first, second) => String(first.name).localeCompare(String(second.name)))
}

function connectivitySignature(records: AnyCircuitElement[]) {
  const sources = records.filter(item => item.type === "source_component")
  const nets = records.filter(item => item.type === "source_net")
  return records.filter(item => item.type === "source_port").map(port => ({
    component: sources.find(part => part.source_component_id === port.source_component_id)?.name,
    pin: port.pin_number, name: port.name,
    nets: nets.filter(net => net.subcircuit_connectivity_map_key === port.subcircuit_connectivity_map_key).map(net => net.name).sort(),
  })).sort((first, second) => (first.component + "." + first.pin + "." + first.name).localeCompare(second.component + "." + second.pin + "." + second.name))
}

deepStrictEqual(physicalSignature(circuit), physicalSignature(baseline), "Assembly must preserve all PCB placements")
deepStrictEqual(connectivitySignature(circuit), connectivitySignature(baseline), "Assembly must preserve every pin/net connection")
ok(!circuit.some(item => item.type === "pcb_trace" || item.type === "pcb_via" || item.type.startsWith("pcb_copper_pour")), "Assembly must remain unrouted")
ok(!circuit.some(item => item.type.endsWith("error")), "Circuit must have no CAD/electrical/placement error records")
const sources = circuit.filter(item => item.type === "source_component")
const cad = circuit.filter(item => item.type === "cad_component")
const pcbSourceIds = new Set(circuit.filter(item => item.type === "pcb_component").map(item => item.source_component_id))
const testPads = sources.filter(item => pcbSourceIds.has(item.source_component_id) && /^TP/.test(item.name ?? ""))
const expectedComponents = sources.filter(item => pcbSourceIds.has(item.source_component_id) && !/^TP/.test(item.name ?? ""))
const mechanicalComponents = sources.filter(item => !pcbSourceIds.has(item.source_component_id) && cad.some(model => model.source_component_id === item.source_component_id))
ok(testPads.every(part => !cad.some(model => model.source_component_id === part.source_component_id)), "Test pads must not have imaginary component bodies")
ok(expectedComponents.every(part => cad.some(model => model.source_component_id === part.source_component_id &&
  (model.model_obj_url || model.model_glb_url || model.footprinter_string || model.model_jscad))), "Every populated component needs a real or explicitly parametric CAD model")

const svg = convertCircuitJsonToAssemblySvg(structuredClone(circuit), { width: 2000, height: 1550, includeVersion: false, showErrorsInTextOverlay: true })
await Bun.write(directory + "/assembly.svg", svg)
await Bun.write(directory + "/assembly.png", new Resvg(svg).render().asPng())
const urls = [...new Set(cad.flatMap(model => model.model_obj_url && !model.model_obj_url.startsWith("data:") ? [model.model_obj_url] : []))]
const assets = new Map<string, string>()
let assetIndex = 0
await Promise.all(Array.from({ length: 6 }, async () => {
  while (assetIndex < urls.length) {
    const url = urls[assetIndex++]!
    const filename = cacheDirectory + "/" + createHash("sha256").update(url).digest("hex") + ".obj"
    const cached = Bun.file(filename)
    let contents: string
    if (await cached.exists()) contents = await cached.text()
    else {
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) })
      if (!response.ok) throw new Error("Failed CAD model: " + url + " (HTTP " + response.status + ")")
      contents = await response.text()
      ok(/^v\s/m.test(contents) && /^f\s/m.test(contents), "CAD asset must contain OBJ vertices and faces: " + url)
      await Bun.write(filename, contents)
    }
    assets.set(url, "data:text/plain;base64," + Buffer.from(contents).toString("base64"))
  }
}))
console.log("Loaded " + urls.length + " supplier CAD assets; exporting populated assembly")
const resolved = structuredClone(circuit)
for (const model of resolved.filter(item => item.type === "cad_component")) {
  if (model.model_obj_url && assets.has(model.model_obj_url)) model.model_obj_url = assets.get(model.model_obj_url)!
}
const scene = await convertCircuitJsonTo3D(resolved.filter(item => item.type !== "pcb_keepout"), {
  pcbColor: "#143a32", textureResolution: 2048, renderBoardTextures: true,
  copperColor: "#cfa85a", silkscreenColor: "#f0f3e8", boardDrillQuality: "high", showBoundingBoxes: false,
})
for (const part of [...expectedComponents, ...mechanicalComponents]) {
  const mesh = scene.boxes.find(box => box.label === part.name)?.mesh
  ok(mesh?.triangles.length, "Missing/empty rendered geometry: " + part.name)
}
const glb = await convertSceneToGLTF(scene, { binary: true, embedImages: true, forceIndices: true })
ok(glb instanceof ArrayBuffer, "Expected a binary GLB export")
await Bun.write(directory + "/peltier-assembly.glb", glb)
const bounds = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] }
for (const box of scene.boxes) {
  const extent = box.mesh?.boundingBox
  const radius = extent ? Math.hypot(...["x", "y", "z"].map(axis => Math.max(Math.abs(extent.min[axis as "x"]), Math.abs(extent.max[axis as "x"]))))
    : Math.hypot(box.size.x, box.size.y, box.size.z) / 2
  const center = [box.center.x, box.center.y, box.center.z]
  for (const axis of [0, 1, 2]) {
    bounds.min[axis] = Math.min(bounds.min[axis]!, center[axis]! - radius)
    bounds.max[axis] = Math.max(bounds.max[axis]!, center[axis]! + radius)
  }
}
const sceneCenter = bounds.min.map((minimum, axis) => (minimum + bounds.max[axis]!) / 2)
const lookAt = [-sceneCenter[0]!, sceneCenter[1]!, sceneCenter[2]!] as [number, number, number]
const radius = Math.hypot(...bounds.min.map((minimum, axis) => bounds.max[axis]! - minimum)) / 2
const distance = radius / Math.sin(38 * Math.PI / 360) * 1.05
for (const [name, direction] of [["isometric", [-0.7, 1.2, -0.8]], ["top", [0, 1, -0.001]], ["bottom", [0, -1, 0.001]]] as const) {
  const length = Math.hypot(...direction)
  const camPos = lookAt.map((coordinate, axis) => coordinate + direction[axis]! / length * distance) as [number, number, number]
  const png = await renderGLTFToPNGFromGLB(glb, { lookAt, camPos, fov: 38, width: 1600, height: 1100, realistic: true,
    up: "y+", backgroundColor: "#101a29", grid: false, supersampling: 1 })
  await Bun.write(directory + "/" + name + ".png", png)
  console.log("Rendered " + name + " assembly preview")
}
const bundle = await Bun.build({ entrypoints: ["scripts/assembly-viewer.ts"], target: "browser", format: "iife", minify: true })
ok(bundle.success, "Interactive viewer bundle failed: " + bundle.logs.join("\n"))
const javascript = (await bundle.outputs[0]!.text()).replaceAll("</script", "<\\/script")
const encodedGlb = Buffer.from(glb).toString("base64")
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dual USB-C Peltier · Populated assembly</title><style>
*{box-sizing:border-box}body{margin:0;background:#0b1220;color:#e2e8f0;font:16px/1.6 system-ui,sans-serif}main{max-width:1280px;margin:auto;padding:32px 24px}h1{font-size:36px;line-height:1.2}small,.muted{color:#a3b5c9}a{color:#91dae2}button{background:#203449;color:#e2e8f0;border:1px solid #496174;border-radius:8px;padding:9px 16px;font:inherit;cursor:pointer;margin:0 6px 8px 0}button:hover{background:#30516a}#viewport{position:relative;height:min(70vh,760px);min-height:380px;border:1px solid #334155;border-radius:14px;overflow:hidden;background:#101a29}#viewport canvas{width:100%;height:100%;display:block;touch-action:none}#poster{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}.warning{padding:16px 20px;background:#2a261b;border-left:4px solid #d6b56a;margin:28px 0}section{margin-top:30px}.views{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px}img{max-width:100%;border-radius:12px}details{border:1px solid #334155;padding:16px;border-radius:12px}summary{cursor:pointer}</style><main>
<small>ACTUAL TSCIRCUIT CAD · DEVICE CONCEPT · UNROUTED</small><h1>Dual USB-C Peltier assembly</h1><p class="muted">RP2040 + CH224K · 110 × 85 × 1.6 mm PCB · ${expectedComponents.length} PCB component bodies + ${mechanicalComponents.length} conceptual mechanical bodies + ${testPads.length} exposed test pads</p>
<div><button data-view="isometric">Isometric</button><button data-view="top">Top</button><button data-view="bottom">Bottom</button><button id="rotate">Auto rotate</button></div>
<div id="viewport"><img id="poster" src="isometric.png" alt="Rendered populated Peltier PCB assembly"></div><p id="status" class="muted">Loading the embedded 3D assembly…</p>
<p><a href="peltier-assembly.glb" download>Download 3D model (GLB)</a> · <a href="assembly.svg">Native assembly drawing</a> · <a href="assembly-report.json">Model / parity audit</a> · <a href="../index.html">Layout and schematics</a></p>
<section class="warning"><b>Visual concept — not a manufacturing release.</b><p>The board remains unrouted. Supplier CAD is used where available; new passives use package models, and the TEC inductor is a simplified datasheet envelope. Test pads are copper, not raised parts. The external TEC, hot/cold thermal hardware, fan, supports and visual harnesses use approximate conceptual dimensions. They are not supplier-qualified, thermally validated or fabrication-ready. No enclosure is qualified.</p></section>
<section><h2>Saved views</h2><div class="views">${["isometric", "top", "bottom"].map(view => `<div><a href="${view}.png"><img src="${view}.png" alt="${view} assembly view"></a><p>${view[0]!.toUpperCase() + view.slice(1)} view</p></div>`).join("")}</div></section>
<section><details><summary>Native tscircuit assembly drawing</summary><p>Reference labels and footprint outlines; zoom the SVG for component-level inspection.</p><a href="assembly.svg"><img src="assembly.png" alt="tscircuit assembly drawing with component references"></a></details></section></main>
<script id="model-data" type="application/octet-stream">${encodedGlb}</script><script>${javascript}</script></html>`
await Bun.write(directory + "/index.html", html)
await Bun.write(directory + "/circuit.json", JSON.stringify(circuit, null, 2) + "\n")
const report = {
  passed: true, pcbPlacementUnchanged: true, connectivityUnchanged: true, routedTraces: 0,
  keepoutsPreservedInCircuit: true, keepoutHatchingExcludedFromPhysicalTextures: true,
  board: { widthMm: 110, heightMm: 85, thicknessMm: 1.6 },
  populatedComponents: expectedComponents.length, mechanicalComponents: mechanicalComponents.length, exposedTestPads: testPads.length, fetchedSupplierAssets: urls.length,
  models: cad.map(model => ({
    reference: sources.find(part => part.source_component_id === model.source_component_id)?.name,
    kind: !model.pcb_component_id ? "approximate mechanical concept" : model.model_obj_url ? "supplier CAD" : model.model_jscad ? "simplified datasheet envelope" : "bundled package or supplier model",
    asset: (model.model_obj_url ?? model.model_glb_url)?.startsWith("data:")
      ? "Embedded CAD sha256:" + createHash("sha256").update(model.model_obj_url ?? model.model_glb_url!).digest("hex")
      : model.model_obj_url ?? model.model_glb_url ?? model.footprinter_string ?? "Inline parametric geometry",
  })),
  scope: "Complete device concept with approximate external TEC, hot/cold thermal hardware, fan, mounting supports and visual harnesses. PCB geometry and electrical connectivity are preserved. No mechanical-fit, collision, thermal, harness or fabrication certification; no qualified enclosure.",
}
await Bun.write(directory + "/assembly-report.json", JSON.stringify(report, null, 2) + "\n")
await Bun.write(directory + "/third-party-licenses.txt", "Bundled viewer: Three.js\n\n" + await Bun.file("node_modules/three/LICENSE").text() + "\n\nCAD exporter: circuit-json-to-gltf\n\n" + await Bun.file("node_modules/circuit-json-to-gltf/LICENSE").text())
console.log("Exported native assembly drawing, standalone rotatable viewer, GLB and three 3D previews to " + directory)
