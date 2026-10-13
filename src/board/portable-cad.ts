import type { CadModelProp } from "@tscircuit/props"
import { cloneElement, isValidElement, type ReactElement } from "react"
import bundledAssets from "./bundled-cad-assets.json"

const models: Record<string, string> = bundledAssets.models
const sources: Record<string, { model: string }> = bundledAssets.sources
const packages: Record<string, string> = bundledAssets.packages
const bundledUrls = new Set(Object.values(models))

export function canonicalCadUrl(url: string): string {
  try {
    const canonical = new URL(url)
    canonical.searchParams.delete("cachebust_origin")
    canonical.searchParams.sort()
    canonical.hash = ""
    return canonical.toString()
  } catch {
    return url
  }
}

function bundledModelUrl(url: unknown): { url: string; format: "obj" | "glb" } | undefined {
  if (typeof url !== "string") return undefined
  const withoutExtension = url.replace(/#ext=\w+$/, "")
  const source = sources[canonicalCadUrl(url)]
  const bundledUrl = bundledUrls.has(withoutExtension) ? withoutExtension : source ? models[source.model] : undefined
  if (!bundledUrl) return undefined
  return { url: bundledUrl, format: bundledUrl.startsWith("data:text/plain;") ? "obj" : "glb" }
}

export function portablePackageCadModel(model: string): { glbUrl: string } | undefined {
  const glbUrl = models[packages[model]]
  return glbUrl ? { glbUrl } : undefined
}

export function portableCadModel(cadModel: ReactElement): ReactElement
export function portableCadModel(cadModel: CadModelProp | undefined): CadModelProp | undefined
export function portableCadModel(cadModel: CadModelProp | undefined): CadModelProp | undefined {
  if (cadModel === null || cadModel === undefined) return cadModel
  if (typeof cadModel === "string") return portablePackageCadModel(cadModel) ?? cadModel
  if (isValidElement<Record<string, unknown>>(cadModel)) {
    if (cadModel.type !== "cadmodel") return cadModel
    const props = cadModel.props
    const packageModel = typeof props.model === "string" ? portablePackageCadModel(props.model) : undefined
    const bundled = packageModel ? { url: packageModel.glbUrl, format: "glb" } : bundledModelUrl(props.modelUrl ?? props.model)
    if (!bundled) return cadModel
    return cloneElement(cadModel, {
      model: undefined,
      modelUrl: bundled.url + "#ext=" + bundled.format,
      stepUrl: undefined,
    })
  }
  const original = cadModel as unknown as Record<string, unknown>
  const obj = bundledModelUrl(original.objUrl)
  const glb = bundledModelUrl(original.glbUrl)
  if (!obj && !glb) return cadModel
  const portable: Record<string, unknown> = { ...original }
  if (obj) {
    portable.objUrl = obj.url
    delete portable.mtlUrl
  }
  if (glb) portable.glbUrl = glb.url
  delete portable.stepUrl
  return portable as unknown as CadModelProp
}
