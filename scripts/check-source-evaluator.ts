import { deepStrictEqual, equal, fail, ok } from "node:assert/strict"
import { mkdirSync, readFileSync } from "node:fs"
import { pathToFileURL } from "node:url"
import { createHash } from "node:crypto"
import * as core from "@tscircuit/core"
import { CircuitRunner } from "@tscircuit/eval"
import { runAllSchematicChecks } from "@tscircuit/checks"
import saved from "../captured-pcb/circuit.json"
import { assertSavedCircuit, assertSavedPrePourSnapshot, expectedSavedCircuit } from "./assert-saved-circuit"
import { assertSchematicParity, sourceConnectivity } from "./schematic-parity"

mkdirSync("checks", { recursive: true })
const paths = ["index.tsx", "tscircuit.config.ts", "tscircuit.config.json", ...new Bun.Glob("src/**/*.{ts,tsx,json}").scanSync(".")]
const fsMap = Object.fromEntries(paths.map(path => [path, readFileSync(path, "utf8")]))
const sourceHash = createHash("sha256").update(JSON.stringify(fsMap)).digest("hex")
const sourceRecordTypes = [...new Set(expectedSavedCircuit().filter(element => element.type.startsWith("source_")).map(element => element.type))]
await Bun.write("checks/duplicate-core.js", readFileSync(new URL(import.meta.resolve("@tscircuit/core")), "utf8"))
const alternate = await import(pathToFileURL(`${process.cwd()}/checks/duplicate-core.js`).href) as typeof core
equal(alternate.Port === core.Port, false, "Probe must exercise distinct core class identities")
const builtinKeys = ["@tscircuit/core", "tscircuit", "@tscircuit/math-utils", "@tscircuit/mm", "react", "react/jsx-runtime", "debug", "tslib", "@tscircuit/props"]
const stop = new Error("Stop after saved-route replay, before pouring")
const originalFetch = globalThis.fetch
const originalWarn = console.warn, originalError = console.error
const consoleDiagnostics: unknown[][] = []
console.warn = (...args) => { consoleDiagnostics.push(args); originalWarn(...args) }
console.error = (...args) => { consoleDiagnostics.push(args); originalError(...args) }
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
    const replayedPhases: string[] = []
    runner.on("autorouting:start", event => {
      equal(event.autorouterName, "precomputed", "Evaluator must replay saved routes")
      equal(event.phaseName, "GROUND_ESCAPES")
      replayedPhases.push(event.phaseName)
    })
    let schematicSolvers = 0, pourSolvers = 0
    runner.on("solver:started", event => {
      if (duplicate && event.solverName === "CopperPourPipelineSolver") { pourSolvers++; return }
      equal(event.solverName, "SchematicTracePipelineSolver", "Evaluator must not solve PCB routing")
      schematicSolvers++
    })
    let manualTraces: ReturnType<core.RootCircuit["db"]["pcb_trace"]["list"]> | undefined
    runner.on("renderable:renderLifecycle:PcbTraceRender:start", () => {
      manualTraces ??= structuredClone(runner._executionContext!.circuit.db.pcb_trace.list())
    })
    if (!duplicate) runner.on("renderable:renderLifecycle:PcbCopperPourRender:start", () => { throw stop })
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
    if (duplicate) await runner.renderUntilSettled()
    else {
      try { await runner.renderUntilSettled(); fail("Expected deliberate pre-pour stop") }
      catch (error) { equal(error, stop) }
    }
    const context = runner._executionContext!
    equal(context.circuit instanceof core.RootCircuit, true)
    equal(context.preSuppliedImports["@tscircuit/core"].Port !== core.Port, duplicate)
    const json = JSON.parse(JSON.stringify(context.circuit.db.toArray())) as typeof saved
    await Bun.write(`checks/source-evaluator.${duplicate ? "duplicate" : "primary"}.circuit.json`, JSON.stringify(json, null, 2))
    deepStrictEqual(json.filter(element => /_(warning|error)$/.test(element.type)), [], "Evaluator emitted diagnostic records")
    equal(schematicSolvers, 4, "Evaluator must route all four native schematic sheets")
    const schematic = assertSchematicParity(json)
    deepStrictEqual(await runAllSchematicChecks(structuredClone(json)), [], "Evaluator native schematic validation failed")
    deepStrictEqual(replayedPhases, ["GROUND_ESCAPES"])
    equal(json.filter(element => element.type === "pcb_copper_pour").length, duplicate ? 31 : 0)
    equal(pourSolvers, duplicate ? 1 : 0)
    const savedParity = duplicate ? assertSavedCircuit(json) : assertSavedPrePourSnapshot(json)
    const vias = json.filter(element => element.type === "pcb_via" && element.pcb_port_ids?.length)
    equal(vias.length, 317)
    equal(context.circuit.db.pcb_via.list().length, 434)
    const traces = context.circuit.db.pcb_trace.list()
    equal(traces.length, 636)
    // The strict phase/final comparator above authenticates these annotations.
    // Manual route geometry must also survive the saved replay unchanged.
    const derivedFields = ["start_pcb_port_id", "end_pcb_port_id", "is_inside_copper_pour", "copper_pour_id"] as const
    equal(manualTraces?.length, 548)
    const connectivity = sourceConnectivity(json)
    let authenticatedManualEndpoints = 0
    for (const manual of manualTraces!) {
      const candidates = traces.filter(trace => trace.source_trace_id === manual.source_trace_id)
      equal(candidates.length, 1, `Ambiguous saved route ${manual.source_trace_id}`)
      const finalized = candidates[0]!, expectedRoute = structuredClone(manual.route)
      equal(finalized.route.length, expectedRoute.length)
      for (const [index, point] of expectedRoute.entries()) {
        for (const [field, endpoint] of [["start_pcb_port_id", 0], ["end_pcb_port_id", expectedRoute.length - 1]] as const) {
          if (point.route_type !== "wire" || !point[field]) continue
          equal(index, endpoint)
          const port = context.circuit.db.pcb_port.get(point[field]!)!
          ok(port, `Unknown manual endpoint ${point[field]}`)
          ok(Math.abs(point.x - port.x) <= 1e-9 && Math.abs(point.y - port.y) <= 1e-9, `Manual endpoint misses port ${point[field]}`)
          ok(port.layers.includes(point.layer))
          const source = context.circuit.db.source_trace.get(manual.source_trace_id!)!
          const connected = [...source.connected_source_port_ids, ...source.connected_source_net_ids][0]!
          equal(connectivity.graph.find(port.source_port_id!), connectivity.graph.find(connected))
          delete point[field]; authenticatedManualEndpoints++
        }
      }
      const actualRoute = structuredClone(finalized.route)
      for (const point of actualRoute) for (const field of derivedFields) delete (point as unknown as Record<string, unknown>)[field]
      deepStrictEqual(actualRoute, expectedRoute, `Changed manual route ${manual.source_trace_id}`)
    }
    const diode = context.circuit.db.source_component.list().find(component => component.name === "D_INPUT_PERMISSION")!
    const diodePins = context.circuit.db.source_port.list().filter(port => port.source_component_id === diode.source_component_id)
    const diodePorts = context.circuit.db.pcb_port.list().filter(port => diodePins.some(pin => pin.source_port_id === port.source_port_id))
    const diodeEndpoints = traces.flatMap(trace => [0, trace.route.length - 1].flatMap(index => {
      const point = trace.route[index]!
      if (point.route_type !== "wire") return []
      const connections = (trace as typeof trace & { connectsTo?: string[] }).connectsTo
      const port = diodePorts.find(port => port.pcb_port_id === connections?.[index === 0 ? 0 : 1])
      if (!port) return []
      equal(point.x, port.x); equal(point.y, port.y)
      return [{ pcbTraceId: trace.pcb_trace_id, pin: diodePins.find(pin => pin.source_port_id === port.source_port_id)!.pin_number, x: port.x, y: port.y }]
    }))
    equal(diodePorts.length, 3)
    equal(diodeEndpoints.length, 3)
    const inlineVias = manualTraces!.flatMap(trace => trace.route.filter(point => point.route_type === "via"))
    equal(inlineVias.length, 29)
    for (const point of inlineVias) {
      equal("via_diameter" in point && point.via_diameter, 0.7)
      equal("via_hole_diameter" in point && point.via_hole_diameter, 0.3)
    }
    if (duplicate) equal(incompleteMemberships, 141)
    reports.push({ duplicateCore: duplicate, stoppedBeforePouring: !duplicate, fullSavedCircuitParity: duplicate, savedParity, repairedMemberships: incompleteMemberships, sourceVias: vias.length, manualTraces: manualTraces!.length, savedTraces: traces.length, savedVias: 434, inlineVias: inlineVias.length, replayedPhases, schematicSolvers, pourSolvers, schematic, warnings: 0, errors: 0, manualTraceParity: true, authenticatedManualEndpoints, diodeEndpoints })
    builtins = Object.fromEntries(builtinKeys.map(key => [key, context.preSuppliedImports[key]]))
  }
  equal(fetchCalls, 0)
  deepStrictEqual(consoleDiagnostics, [], "Evaluator emitted console warnings or errors")
  const report = { pass: true, sourceHash, sourceRecordTypes, fetchCalls, consoleDiagnostics: 0, nativeSchematicValidatorDiagnostics: 0, routingSolverStarts: 0, pourSolverStarts: 1, probes: reports }
  await Bun.write("checks/source-evaluator.json", JSON.stringify(report, null, 2) + "\n")
  console.log(JSON.stringify(report, null, 2))
} finally { globalThis.fetch = originalFetch; console.warn = originalWarn; console.error = originalError }
