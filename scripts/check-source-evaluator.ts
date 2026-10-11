import { deepStrictEqual, equal, fail } from "node:assert/strict"
import { mkdirSync, readFileSync } from "node:fs"
import { pathToFileURL } from "node:url"
import * as core from "@tscircuit/core"
import { CircuitRunner } from "@tscircuit/eval"
import saved from "../captured-pcb/circuit.json"

mkdirSync("checks", { recursive: true })
const paths = ["index.tsx", "tscircuit.config.ts", "tscircuit.config.json", ...new Bun.Glob("src/**/*.{ts,tsx,json}").scanSync(".")]
const fsMap = Object.fromEntries(paths.map(path => [path, readFileSync(path, "utf8")]))
await Bun.write("checks/duplicate-core.js", readFileSync(new URL(import.meta.resolve("@tscircuit/core")), "utf8"))
const alternate = await import(pathToFileURL(`${process.cwd()}/checks/duplicate-core.js`).href) as typeof core
equal(alternate.Port === core.Port, false, "Probe must exercise distinct core class identities")
const builtinKeys = ["@tscircuit/core", "tscircuit", "@tscircuit/math-utils", "@tscircuit/mm", "react", "react/jsx-runtime", "debug", "tslib", "@tscircuit/props"]
const stop = new Error("Stop before routing and pouring")
const originalFetch = globalThis.fetch
let fetchCalls = 0
globalThis.fetch = Object.assign(async () => { fetchCalls++; throw new Error("Offline evaluator attempted a fetch") }, { preconnect: originalFetch.preconnect })
const reports = []
let builtins: Record<string, unknown> = {}
try {
  for (const duplicate of [false, true]) {
    // Evaluator supports injected imports at runtime; its declaration omits
    // this configuration property. Preserve its other built-ins unchanged.
    const config: ConstructorParameters<typeof CircuitRunner>[0] & { preSuppliedImports: Record<string, unknown> } = {
      preSuppliedImports: { ...builtins, "@tscircuit/core": alternate, tscircuit: alternate },
    }
    const runner = new CircuitRunner(duplicate ? config : undefined)
    await runner.setDisableCdnLoading(true)
    runner.on("autorouting:start", () => fail("Probe must stop before routing"))
    runner.on("solver:started", () => fail("Probe must stop before pouring"))
    runner.on("renderable:renderLifecycle:PcbTraceRender:start", () => { throw stop })
    let first = true, incompleteMemberships = 0
    runner.on("renderable:renderLifecycle:PcbManualTraceRender:start", () => {
      if (!first) return
      first = false
      const db = runner._executionContext!.circuit.db
      const ports = db.pcb_port.list()
      for (const via of db.pcb_via.list()) {
        const seed = ports.find(port => port.pcb_port_id === via.pcb_port_ids?.[0])
        if (seed && ports.filter(port => port.pcb_component_id === seed.pcb_component_id).length > via.pcb_port_ids!.length)
          incompleteMemberships++
      }
    })
    await runner.executeWithFsMap({ mainComponentPath: "index.tsx", fsMap })
    try { await runner.renderUntilSettled(); fail("Expected deliberate pre-routing stop") }
    catch (error) { equal(error, stop) }
    const context = runner._executionContext!
    equal(context.circuit instanceof core.RootCircuit, true)
    equal(context.preSuppliedImports["@tscircuit/core"].Port !== core.Port, duplicate)
    const json = JSON.parse(JSON.stringify(context.circuit.db.toArray())) as typeof saved
    for (const type of ["source_trace", "pcb_smtpad", "pcb_port"])
      deepStrictEqual(json.filter(element => element.type === type), saved.filter(element => element.type === type), type)
    const vias = json.filter(element => element.type === "pcb_via" && element.pcb_port_ids?.length)
    equal(vias.length, 317)
    const savedVias = new Map(saved.filter(element => element.type === "pcb_via").map(via => [via.pcb_via_id, via]))
    for (const via of vias) deepStrictEqual(via, savedVias.get(via.pcb_via_id))
    const traces = context.circuit.db.pcb_trace.list()
    equal(traces.length, 548)
    const inlineVias = traces.flatMap(trace => trace.route.filter(point => point.route_type === "via"))
    equal(inlineVias.length, 29)
    for (const point of inlineVias) {
      equal("via_diameter" in point && point.via_diameter, 0.7)
      equal("via_hole_diameter" in point && point.via_hole_diameter, 0.3)
    }
    if (duplicate) equal(incompleteMemberships, 141)
    reports.push({ duplicateCore: duplicate, repairedMemberships: incompleteMemberships, sourceVias: vias.length, manualTraces: traces.length, inlineVias: inlineVias.length })
    builtins = Object.fromEntries(builtinKeys.map(key => [key, context.preSuppliedImports[key]]))
  }
  equal(fetchCalls, 0)
  const report = { pass: true, fetchCalls, stoppedBeforeRoutingAndPouring: true, probes: reports }
  await Bun.write("checks/source-evaluator.json", JSON.stringify(report, null, 2) + "\n")
  console.log(JSON.stringify(report, null, 2))
} finally { globalThis.fetch = originalFetch }
