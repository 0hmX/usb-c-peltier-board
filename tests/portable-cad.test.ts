import { describe, expect, spyOn, test } from "bun:test"
import { createHash } from "node:crypto"
import { existsSync } from "node:fs"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { createElement, type ReactElement } from "react"
import { CircuitRunner } from "@tscircuit/eval"
import { COORDINATE_TRANSFORMS, loadOBJ } from "circuit-json-to-gltf"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { bundleCadAssets, validateEmbeddedGlb, validateSupplierObj, type BundledCadAssets } from "../scripts/bundle-cad-assets"
import { canonicalCadUrl, portableCadModel, portablePackageCadModel } from "../src/board/portable-cad"
import bundledJson from "../src/board/bundled-cad-assets.json"

const bundle = bundledJson as BundledCadAssets
const supplierUrl = Object.keys(bundle.sources).find(url => url.includes("C160403.obj"))!
const source = bundle.sources[supplierUrl]
const originalBytes = Buffer.from(bundle.models[source.model].split(",")[1], "base64")
const hash = (bytes: Uint8Array | string) => createHash("sha256").update(bytes).digest("hex")
const cachedSupplierPath = ".tscircuit/assembly-model-cache/" + hash(supplierUrl + "&cachebust_origin=") + ".obj"
const poses = {
  modelOriginPosition: { x: 1.0000761999999668, y: 0.3445008999999346, z: -0.01 },
  modelUnitToMmScale: 0.5,
  modelBoardNormalDirection: "z+" as const,
  rotationOffset: { x: 15, y: 30, z: 75 },
  pcbRotationOffset: 90,
  positionOffset: { x: 0.25, y: -0.75, z: 0.1 },
  zOffsetFromSurface: 0.2,
}

describe("portable CAD assets", () => {
  test("all 68 supplier OBJs and six original package GLBs are content-addressed and self-contained", () => {
    expect(Object.values(bundle.sources).filter(item => item.format === "obj")).toHaveLength(68)
    expect(Object.values(bundle.sources).filter(item => item.format === "glb")).toHaveLength(6)
    expect(Object.keys(bundle.models).length).toBeLessThan(Object.keys(bundle.sources).length)
    for (const [url, item] of Object.entries(bundle.sources)) {
      expect(url).toBe(canonicalCadUrl(url))
      expect(url).not.toContain("cachebust_origin")
      const dataUrl = bundle.models[item.model]
      expect(dataUrl.startsWith(item.format === "obj" ? "data:text/plain;base64," : "data:model/gltf-binary;base64,")).toBe(true)
      const contents = Buffer.from(dataUrl.split(",")[1], "base64")
      expect(hash(contents)).toBe(item.sha256)
      expect(hash(contents)).toBe(item.model)
      expect(contents.length).toBe(item.bytes)
      if (item.format === "obj") validateSupplierObj(contents.toString("utf8"))
      else validateEmbeddedGlb(contents)
    }
  })

  test.skipIf(!existsSync(cachedSupplierPath))("decoded supplier geometry/material bytes equal every existing original cache", async () => {
    for (const [url, item] of Object.entries(bundle.sources)) {
      if (item.format !== "obj") continue
      const cachePath = ".tscircuit/assembly-model-cache/" + hash(url + "&cachebust_origin=") + ".obj"
      const cached = await readFile(cachePath)
      const portable = Buffer.from(bundle.models[item.model].split(",")[1], "base64")
      expect(portable.equals(cached)).toBe(true)
    }
  })

  test("URL matching ignores only origin cachebusting, not supplier identity", () => {
    const sameModel = supplierUrl + "&cachebust_origin=https%3A%2F%2Ftscircuit.com&cachebust_origin=wrong#ext=obj"
    expect(canonicalCadUrl(sameModel)).toBe(supplierUrl)
    const reordered = new URL(supplierUrl)
    reordered.search = "cachebust_origin=https%3A%2F%2Fexample.com&" + reordered.search.slice(1)
    const result = portableCadModel({ objUrl: reordered.toString(), ...poses }) as { objUrl: string }
    expect(result.objUrl).toBe(bundle.models[source.model])
    const unknown = { objUrl: supplierUrl.replace(/uuid=[^&]+/, "uuid=another-revision"), stepUrl: "keep.step", ...poses }
    expect(portableCadModel(unknown)).toBe(unknown)
  })

  test("supplier OBJ remapping preserves every CAD pose property without mutating input", () => {
    const original = Object.freeze({ objUrl: supplierUrl, stepUrl: "original.step", ...poses })
    const result = portableCadModel(original)
    expect(result).toEqual({ objUrl: bundle.models[source.model], ...poses })
    expect(original.stepUrl).toBe("original.step")
    expect(portableCadModel(result)).toEqual(result)
    const unknown = { stepUrl: "https://example.com/only.step", ...poses }
    expect(portableCadModel(unknown)).toBe(unknown)
    for (const unchanged of [null, undefined, "unknown-package", { jscad: { type: "cuboid" } }]) {
      expect(portableCadModel(unchanged)).toBe(unchanged)
    }
    const unrelated = createElement("chip", { name: "UNCHANGED" })
    expect(portableCadModel(unrelated)).toBe(unrelated)
  })

  test("package objects and cadmodel React elements preserve native CAD pose", () => {
    for (const name of ["res0402", "res0603", "res1206", "cap0402", "cap0603", "cap1206"]) {
      const packageModel = portablePackageCadModel(name)!
      expect(packageModel).toEqual({ glbUrl: bundle.models[bundle.packages[name]] })
      const original = createElement("cadmodel", { model: name, stepUrl: "unused.step", key: "POSE", ...poses, pcbX: 2, pcbY: -3, pcbZ: 0.1 })
      const element = portableCadModel(original) as ReactElement<Record<string, unknown>>
      expect(element.type).toBe("cadmodel")
      expect(element.key).toBe(original.key)
      expect(element.props).toEqual({ ...original.props, model: undefined, stepUrl: undefined, modelUrl: packageModel.glbUrl + "#ext=glb" })
      const explicit = portableCadModel({ glbUrl: `https://modelcdn.tscircuit.com/jscad_models/${name}.glb?cachebust_origin=wrong`, stepUrl: "unused.step", ...poses })
      expect(explicit).toEqual({ glbUrl: packageModel.glbUrl, ...poses })
    }
    const objElement = portableCadModel(createElement("cadmodel", { modelUrl: supplierUrl, ...poses })) as ReactElement<{ modelUrl: string }>
    expect(objElement.props.modelUrl).toBe(bundle.models[source.model] + "#ext=obj")
    expect(portablePackageCadModel("not-a-real-package")).toBeUndefined()
    const unknown = createElement("cadmodel", { model: "not-a-real-package", stepUrl: "keep.step" })
    expect(portableCadModel(unknown)).toBe(unknown)
  })

  test("native package GLBs parse without fetching external geometry or textures", async () => {
    const fetchMock = spyOn(globalThis, "fetch").mockImplementation(async () => { throw new Error("CAD must be self-contained") })
    try {
      for (const model of Object.values(bundle.packages)) {
        const contents = Buffer.from(bundle.models[model].split(",")[1], "base64")
        const gltf = await new GLTFLoader().parseAsync(contents.buffer.slice(contents.byteOffset, contents.byteOffset + contents.byteLength), "")
        expect(gltf.scene.children.length).toBeGreaterThan(0)
      }
      expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([])
    } finally {
      fetchMock.mockRestore()
    }
  })

  test("OBJ loader bounding boxes and asymmetric vertices retain the original coordinate convention", async () => {
    const baselineUrl = "data:text/plain;base64," + originalBytes.toString("base64")
    const portable = portableCadModel({ objUrl: supplierUrl, ...poses }) as { objUrl: string }
    expect(portable.objUrl.startsWith("data:text/plain;")).toBe(true)
    const nativeFetch = globalThis.fetch
    const fetchMock = spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url
      if (!url.startsWith("data:")) throw new Error("Supplier CAD must not reach modelcdn or STEP conversion")
      return nativeFetch(input, init)
    })
    try {
      for (const transform of [undefined, COORDINATE_TRANSFORMS.OBJ_Z_UP_TO_Y_UP]) {
        const baseline = await loadOBJ({ url: baselineUrl, transform })
        const remapped = await loadOBJ({ url: portable.objUrl, transform })
        expect(remapped.boundingBox).toEqual(baseline.boundingBox)
        expect(remapped.triangles).toEqual(baseline.triangles)
        expect(remapped.triangles.length).toBeGreaterThan(0)
        const vertex = remapped.triangles[0].vertices[0]
        expect(vertex.y).not.toBe(vertex.z)
      }
    } finally {
      fetchMock.mockRestore()
    }
  })

  test("published source evaluates at different browser origins without network imports or STEP", async () => {
    const fsMap = {
      "src/board/portable-cad.ts": await Bun.file("src/board/portable-cad.ts").text(),
      "src/board/bundled-cad-assets.json": await Bun.file("src/board/bundled-cad-assets.json").text(),
      "fixture.tsx": `import { portableCadModel } from './src/board/portable-cad'
        export default () => <board width={60} height={40} routingDisabled partsEngineDisabled>
          <resistor name="R_SUPPLIER" resistance="1k" footprint="0402" pcbX={-15} cadModel={portableCadModel(${JSON.stringify({ objUrl: supplierUrl, stepUrl: "https://modelcdn.tscircuit.com/unused.step", ...poses })})} />
          {${JSON.stringify(Object.keys(bundle.packages))}.map((model, index) => <resistor name={'R_PACKAGE_' + index} key={model} resistance="1k" footprint="0402" pcbX={index * 5 - 10} pcbY={8} layer={index % 2 ? 'bottom' : 'top'} cadModel={portableCadModel(<cadmodel model={model} />)} />)}
        </board>`,
    }
    const fetchMock = spyOn(globalThis, "fetch").mockImplementation(async () => { throw new Error("Source evaluator must remain offline") })
    try {
      for (const origin of ["https://tscircuit.com", "https://0hmx--dual-usb-peltier-assembly-v0-1-2.tscircuit.app"]) {
        const runner = new CircuitRunner()
        try {
          await runner.setDisableCdnLoading(true)
          await runner.setPlatformConfigProperty("partsEngineDisabled", true)
          await runner.setPlatformConfigProperty("clientOrigin", origin)
          await runner.executeWithFsMap({ mainComponentPath: "fixture.tsx", fsMap })
          await runner.renderUntilSettled()
          const circuit = await runner.getCircuitJson()
          const models = circuit.filter(item => item.type === "cad_component")
          expect(models).toHaveLength(7)
          expect(models.filter(item => item.model_obj_url)).toHaveLength(1)
          expect(models.filter(item => item.model_glb_url)).toHaveLength(6)
          for (const item of models) {
            expect(item.model_obj_url ?? item.model_glb_url).toMatch(/^data:/)
            expect(item.model_step_url).toBeUndefined()
            expect(item.model_obj_url ?? item.model_glb_url).not.toContain("cachebust_origin")
          }
          expect(models[0].model_origin_position).toEqual(poses.modelOriginPosition)
          expect(models[0].model_unit_to_mm_scale_factor).toBe(poses.modelUnitToMmScale)
          expect(circuit.filter(item => item.type.endsWith("error"))).toEqual([])
        } finally {
          runner.kill()
        }
      }
      expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([])
    } finally {
      fetchMock.mockRestore()
    }
  }, 120000)

  test("regeneration needs neither a legacy Site URL map nor external caches or network", async () => {
    const directory = await mkdtemp(join(tmpdir(), "portable-cad-"))
    const fetchMock = spyOn(globalThis, "fetch").mockImplementation(async () => { throw new Error("Regeneration must use original bundled bytes") })
    try {
      const outputPath = join(directory, "bundle.json")
      const manifestPath = join(directory, "model-assets.json")
      await Bun.write(outputPath, JSON.stringify(bundle, null, 2) + "\n")
      await Bun.write(manifestPath, JSON.stringify(["models/content-addressed.obj", "models/content-addressed.glb"]))
      const regenerated = await bundleCadAssets({ outputPath, manifestPath, cacheDirectory: join(directory, "absent-cache"), circuitPath: join(directory, "absent-circuit"), check: true })
      expect(regenerated).toEqual(bundle)
      expect(fetchMock).not.toHaveBeenCalled()
    } finally {
      fetchMock.mockRestore()
      await rm(directory, { recursive: true, force: true })
    }
  })
})
