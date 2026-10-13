import { strict as assert } from "node:assert"
import { createHash } from "node:crypto"
import { readFile, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { gzipSync } from "node:zlib"
import { canonicalCadUrl } from "../src/board/portable-cad"

export interface BundledCadAssets {
  format: "cad-data-uri-v1"
  models: Record<string, string>
  sources: Record<string, { model: string; sha256: string; bytes: number; format: "obj" | "glb" }>
  packages: Record<string, string>
}

const projectDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const packageNames = ["res0402", "res0603", "res1206", "cap0402", "cap0603", "cap1206"]
const sha256 = (contents: string | Uint8Array) => createHash("sha256").update(contents).digest("hex")

export function validateSupplierObj(contents: string): void {
  assert.match(contents, /^v\s/m, "Supplier OBJ needs real vertices")
  assert.match(contents, /^f\s/m, "Supplier OBJ needs real faces")
  assert(!/^map_\w+\s/m.test(contents), "External material textures must be bundled explicitly")
  if (/^mtllib\s/m.test(contents)) assert.match(contents, /^newmtl\s/m, "OBJ material library must be embedded")
}

export function validateEmbeddedGlb(contents: Uint8Array): void {
  const buffer = Buffer.from(contents)
  assert.equal(buffer.toString("ascii", 0, 4), "glTF", "CAD asset must be a real binary glTF")
  assert.equal(buffer.readUInt32LE(4), 2)
  assert.equal(buffer.readUInt32LE(8), buffer.length)
  assert.equal(buffer.readUInt32LE(16), 0x4e4f534a)
  const document = JSON.parse(buffer.toString("utf8", 20, 20 + buffer.readUInt32LE(12)))
  assert(document.meshes?.some((mesh: { primitives: unknown[] }) => mesh.primitives.length), "GLB needs populated meshes")
  assert(!document.buffers?.some((item: { uri?: string }) => item.uri && !item.uri.startsWith("data:")), "GLB cannot fetch external buffers")
  assert(!document.images?.some((item: { uri?: string }) => item.uri && !item.uri.startsWith("data:")), "GLB cannot fetch external textures")
}

export async function bundleCadAssets(options: {
  manifestPath?: string
  cacheDirectory?: string
  circuitPath?: string
  outputPath?: string
  allowDownload?: boolean
  check?: boolean
} = {}): Promise<BundledCadAssets> {
  const manifestPath = options.manifestPath ?? resolve(projectDirectory, "../../sites/peltier-build-preview/dist/viewer/model-assets.json")
  const cacheDirectory = options.cacheDirectory ?? resolve(projectDirectory, ".tscircuit/assembly-model-cache")
  const outputPath = options.outputPath ?? resolve(projectDirectory, "src/board/bundled-cad-assets.json")
  const circuitPath = options.circuitPath ?? resolve(projectDirectory, "dist/assembly/circuit.json")
  let previous: BundledCadAssets | undefined
  try {
    previous = JSON.parse(await readFile(outputPath, "utf8"))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error
  }
  let manifest: Record<string, string> = {}
  try {
    const loaded = JSON.parse(await readFile(manifestPath, "utf8"))
    if (loaded && !Array.isArray(loaded) && typeof loaded === "object") manifest = loaded
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error
  }
  let circuit: Array<{ type: string; model_obj_url?: string; model_glb_url?: string }> = []
  try {
    circuit = JSON.parse(await readFile(circuitPath, "utf8"))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error
  }
  const sourcePaths = new Map(Object.entries(manifest).map(([url, assetPath]) => [canonicalCadUrl(url), resolve(dirname(manifestPath), assetPath)]))
  const sourceUrls = new Set([...sourcePaths.keys(), ...Object.keys(previous?.sources ?? {}), ...circuit.filter(item => item.type === "cad_component")
    .flatMap(item => [item.model_obj_url, item.model_glb_url]).filter((url): url is string => Boolean(url && !url.startsWith("data:"))).map(canonicalCadUrl),
    ...packageNames.map(name => `https://modelcdn.tscircuit.com/jscad_models/${name}.glb`)])
  const bundle: BundledCadAssets = { format: "cad-data-uri-v1", models: {}, sources: {}, packages: {} }
  for (const url of [...sourceUrls].sort()) {
    const extension = new URL(url).pathname.endsWith(".obj") ? "obj" : "glb"
    const cachedUrl = new URL(url)
    cachedUrl.searchParams.set("cachebust_origin", "")
    const candidates = extension === "obj" ? [resolve(cacheDirectory, sha256(cachedUrl.toString()) + ".obj"), sourcePaths.get(url)] : [sourcePaths.get(url)]
    let contents: Uint8Array | undefined
    for (const candidate of candidates) {
      if (!candidate) continue
      try {
        contents = await readFile(candidate)
        break
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error
      }
    }
    if (!contents && previous?.format === "cad-data-uri-v1" && previous.sources[url]) {
      contents = Buffer.from(previous.models[previous.sources[url].model].split(",")[1], "base64")
      assert.equal(sha256(contents), previous.sources[url].sha256, `Previous original CAD bytes changed: ${url}`)
    }
    if (!contents && options.allowDownload) {
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) })
      assert(response.ok, `Failed original CAD asset ${url}: HTTP ${response.status}`)
      contents = new Uint8Array(await response.arrayBuffer())
    }
    assert(contents, `Missing real CAD asset ${url}; provide its cache/manifest or explicitly use --allow-download`)
    if (extension === "obj") validateSupplierObj(new TextDecoder().decode(contents))
    else validateEmbeddedGlb(contents)
    const model = sha256(contents)
    bundle.models[model] = (extension === "obj" ? "data:text/plain;base64," : "data:model/gltf-binary;base64,") + Buffer.from(contents).toString("base64")
    bundle.sources[url] = { model, sha256: model, bytes: contents.length, format: extension }
  }
  for (const name of packageNames) bundle.packages[name] = bundle.sources[`https://modelcdn.tscircuit.com/jscad_models/${name}.glb`].model
  const serialized = JSON.stringify(bundle, null, 2) + "\n"
  const portableCircuit = circuit.map(item => {
    if (item.type !== "cad_component") return item
    const portable: Record<string, unknown> = { ...item }
    let replaced = false
    for (const key of ["model_obj_url", "model_glb_url"] as const) {
      if (!item[key]) continue
      const source = bundle.sources[canonicalCadUrl(item[key])]
      if (!source) continue
      portable[key] = bundle.models[source.model]
      replaced = true
    }
    if (replaced) delete portable.model_step_url
    return portable
  })
  const circuitJson = JSON.stringify(portableCircuit, null, 2)
  if (options.check) assert.equal(await readFile(outputPath, "utf8"), serialized, "Bundled CAD assets are stale")
  else await writeFile(outputPath, serialized)
  console.log(JSON.stringify({ sourceUrls: Object.keys(bundle.sources).length, uniqueAssets: Object.keys(bundle.models).length,
    bundleBytes: Buffer.byteLength(serialized), staticCircuitJsonBytes: Buffer.byteLength(circuitJson),
    staticCircuitGzipBytes: gzipSync(circuitJson, { level: 9 }).length, outputPath, checked: options.check ?? false }))
  return bundle
}

if (import.meta.main) {
  const args = process.argv.slice(2)
  assert(args.every(argument => ["--allow-download", "--check"].includes(argument)), "Usage: bun run scripts/bundle-cad-assets.ts [--allow-download] [--check]")
  await bundleCadAssets({ allowDownload: args.includes("--allow-download"), check: args.includes("--check") })
}
