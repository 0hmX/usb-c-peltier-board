import { equal, ok } from "node:assert/strict"
import { createHash } from "node:crypto"
import { mkdirSync, readFileSync, rmSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { CircuitRunner } from "@tscircuit/eval"

// Validate the active, unrouted Revision B source. Historical copper replay is
// a separate check:saved-routes command with an explicit legacy entrypoint.
const outputDirectory = resolve("checks/source-evaluator")
const reportPath = resolve("checks/source-evaluator.json")
mkdirSync(outputDirectory, { recursive: true })
rmSync(reportPath, { force: true })
const entrypoints = ["index.tsx", "assembly.tsx"] as const
const paths = [...new Set([
  ...entrypoints, "package.json", "tscircuit.config.ts", "tscircuit.config.json",
  ...new Bun.Glob("src/**/*.{ts,tsx,js,json}").scanSync("."),
])].sort()
const fsMap = Object.fromEntries(paths.map(path => [path, readFileSync(path, "utf8")]))
const sourceHash = createHash("sha256").update(JSON.stringify(fsMap)).digest("hex")
const revisionChecker = fileURLToPath(new URL("./check-revision.ts", import.meta.url))

const originalFetch = globalThis.fetch
let fetchCalls = 0
// Block both remote imports and accidental supplier/model network requests.
globalThis.fetch = Object.assign(async () => {
  fetchCalls++
  throw new Error("Offline Revision B source evaluation attempted a fetch")
}, { preconnect: originalFetch.preconnect })

const probes = []
try {
  for (const entrypoint of entrypoints) {
    const runner = new CircuitRunner()
    let routingSolverStarts = 0
    let schematicSolverStarts = 0, schematicLayoutSolverStarts = 0
    runner.on("autorouting:start", () => { routingSolverStarts++ })
    runner.on("solver:started", event => {
      ok(["SchematicTracePipelineSolver", "LayoutPipelineSolver"].includes(event.solverName),
        "Unrouted source must not solve PCB copper: " + event.solverName)
      if (event.solverName === "SchematicTracePipelineSolver") schematicSolverStarts++
      else schematicLayoutSolverStarts++
    })
    try {
      await runner.setDisableCdnLoading(true)
      await runner.executeWithFsMap({ mainComponentPath: entrypoint, fsMap })
      await runner.renderUntilSettled()
      const circuit = await runner.getCircuitJson()
      equal(routingSolverStarts, 0, "Revision B source must not start PCB routing")
      ok(schematicSolverStarts > 0, "Native schematic routing must run")
      const probeDirectory = resolve(outputDirectory, entrypoint.replace(/\.tsx$/, ""))
      mkdirSync(probeDirectory, { recursive: true })
      const circuitPath = resolve(probeDirectory, "circuit.json")
      await Bun.write(circuitPath, JSON.stringify(circuit, null, 2) + "\n")

      // Reuse the same electrical/placement checker as a fresh build. Its
      // review/checks.json output is isolated here, preserving saved reviews.
      const checked = Bun.spawnSync([process.execPath, "run", revisionChecker, circuitPath], {
        cwd: probeDirectory, stdout: "pipe", stderr: "pipe",
      })
      equal(checked.exitCode, 0, `Revision check failed for ${entrypoint}:\n${checked.stdout.toString()}${checked.stderr.toString()}`)
      const revision = JSON.parse(checked.stdout.toString())
      equal(revision.passed, true)
      probes.push({ entrypoint, sourceEvaluationPassed: true, routingSolverStarts,
        schematicSolverStarts, schematicLayoutSolverStarts, revision })
    } finally {
      runner.kill()
    }
  }
  equal(fetchCalls, 0, "Offline source validation must not attempt remote requests")
  const report = { passed: true, revision: "B", scope: "Current source portability, connectivity and placement; no routed-copper or bench qualification",
    sourceHash, fetchCalls, probes }
  await Bun.write(reportPath, JSON.stringify(report, null, 2) + "\n")
  console.log(JSON.stringify(report, null, 2))
} finally {
  globalThis.fetch = originalFetch
}
