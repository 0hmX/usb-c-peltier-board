import { copyFile } from "node:fs/promises"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { Resvg } from "@resvg/resvg-js"
import type { AnyCircuitElement } from "circuit-json"

const circuit:AnyCircuitElement[]=await Bun.file("dist/routed/circuit.json").json()
const report=await Bun.file("review/routing/routing-report.json").json()
const validation=await Bun.file("review/routing/validation.json").json()
for(const layer of ["top","inner1","inner2","bottom"] as const) {
  const svg=convertCircuitJsonToPcbSvg(circuit,{layer,width:1600,height:1250,
    shouldDrawRatsNest:false,shouldDrawErrors:true,shouldDrawWarnings:false,
    backgroundColor:"#0f172a",includeVersion:false})
  await Bun.write(`review/routing/${layer}.svg`,svg)
  await Bun.write(`review/routing/${layer}.png`,new Resvg(svg).render().asPng())
}
await copyFile("dist/routed/circuit.json","review/routing/circuit.json")
const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Revision B routing in progress</title><style>body{margin:0;background:#0f172a;color:#e2e8f0;font:16px/1.6 system-ui}main{max-width:1200px;margin:auto;padding:32px}a{color:#80d8e8}img{width:100%;border:1px solid #334155;border-radius:8px}small{color:#a7bbc9}.status{background:#263146;padding:16px;border-left:4px solid #eab36a}details{margin:24px 0}summary{cursor:pointer;font-size:22px}</style><main><small>ACTUAL TSCIRCUIT CAD · REVISION B · ROUTING IN PROGRESS</small><h1>USB-C Peltier controller routing</h1><div class="status"><b>${report.routedEdges} / ${report.plannedEdges} planned connections routed</b><p>${report.pendingEdges} planned connections and ${report.groundPendingPorts.length} ground escapes remain pending. ${report.physicalTraceCount} declared trace pieces and ${report.throughViaCount} ordinary through vias. ${report.groundPortsReachingInner1} / ${report.groundPorts} ground ports reach inner1 via a declared escape or plated hole; continuous plane connectivity is unverified.</p><p>The native audit records ${validation.unmetLengthConstraints?.length??0} unmet capacitor trace-length constraints and ${validation.pendingConnectivity.length} connectivity diagnostics. Full routing validation remains incomplete.</p><p>USB impedance and skew, Kelvin separation, power-loop geometry, power-return widths and via ampacity still require qualification. This incomplete prototype is not a fabrication release.</p></div><p><a href="routing-report.json">Routes and pending endpoints</a> · <a href="validation.json">Native geometry and connectivity diagnostics</a> · <a href="shorts-check.txt">Gerber copper shorts check</a> · <a href="circuit.json">Routed Circuit JSON</a></p>${["top","inner1","inner2","bottom"].map((l,i)=>`<details ${i===0?"open":""}><summary>${l} copper</summary><a href="${l}.svg"><img src="${l}.png" alt="Actual ${l} routing copper"></a></details>`).join("")}</main></html>`
await Bun.write("review/routing/index.html",html)
console.log("Exported four routing layers and pending-route review to review/routing/")
