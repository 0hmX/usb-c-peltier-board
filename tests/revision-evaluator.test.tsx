import { describe, expect, spyOn, test } from "bun:test"
import { CircuitRunner } from "@tscircuit/eval"
import type { ReactElement } from "react"
import * as installed from "@tsci/tscircuit.standard-jst-programmer"
import * as portable from "../src/revision/parts/standard-jst-programmer.js"
import { mechanicalCadCount, mechanicalPartNames } from "../src/revision/mechanical-assembly"

function connectorProps(element: ReactElement<any>): unknown {
  let resolved = element
  while (typeof resolved.type === "function") resolved = (resolved.type as Function)(resolved.props)
  expect(resolved.type).toBe("connector")
  return JSON.parse(JSON.stringify(resolved.props))
}

describe("portable standard connector exports", () => {
  test("connector-only snapshot preserves the installed standard's complete geometry, CAD and labels", () => {
    for (const name of ["StandardJstPowerSide", "StandardJstSwdSide", "StandardJstUartSide"] as const) {
      for (const role of ["target", "host"] as const) {
        const props = { name: "J_STANDARD", pcbX: 4, pcbY: -2, pcbRotation: 90, role }
        expect(connectorProps(portable[name](props))).toEqual(connectorProps(installed[name](props)))
      }
    }
  })

  for (const entrypoint of ["index.tsx", "assembly.tsx"]) {
    test(`${entrypoint} evaluates from published source without registry/CDN imports`, async () => {
      const files = ["index.tsx", "assembly.tsx", "package.json", "tscircuit.config.json", "tscircuit.config.ts",
        ...new Bun.Glob("{src,imports}/**/*.{ts,tsx,js,json}").scanSync(".")]
      const fsMap = Object.fromEntries(await Promise.all(files.map(async file => [file, await Bun.file(file).text()])))
      const fetchMock = spyOn(globalThis, "fetch").mockImplementation(async () => {
        throw new Error("Source evaluation must not fetch remote code or supplier footprints")
      })
      const runner = new CircuitRunner()
      try {
        await runner.setDisableCdnLoading(true)
        await runner.executeWithFsMap({ mainComponentPath: entrypoint, fsMap })
        await runner.renderUntilSettled()
        const circuit = await runner.getCircuitJson()
        const pcbIds = new Set(circuit.filter(item => item.type === "pcb_component").map(item => item.source_component_id))
        expect(circuit.filter(item => item.type === "source_component" && pcbIds.has(item.source_component_id))).toHaveLength(276)
        expect(circuit.filter(item => item.type === "source_component" && mechanicalPartNames.includes(item.name ?? ""))).toHaveLength(mechanicalCadCount)
        expect(circuit.filter(item => item.type === "cad_component" && item.pcb_component_id)).toHaveLength(249)
        expect(circuit.filter(item => item.type === "cad_component" && !item.pcb_component_id)).toHaveLength(mechanicalCadCount)
        expect(circuit.filter(item => item.type === "cad_component" && item.model_step_url)).toEqual([])
        expect(circuit.filter(item => item.type === "cad_component").every(item => ![item.model_obj_url, item.model_glb_url].some(url => url?.includes("modelcdn.tscircuit.com")))).toBe(true)
        expect(circuit.filter(item => item.type === "schematic_sheet")).toHaveLength(8)
        expect(circuit.filter(item => item.type.endsWith("error"))).toEqual([])
        expect(circuit.filter(item => ["pcb_trace", "pcb_via"].includes(item.type))).toEqual([])
        expect(fetchMock).not.toHaveBeenCalled()
      } finally {
        fetchMock.mockRestore()
        runner.kill()
      }
    }, 120000)
  }
})
