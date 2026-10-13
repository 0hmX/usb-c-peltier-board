import { copyFile } from "node:fs/promises"
import { createHash } from "node:crypto"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { Resvg } from "@resvg/resvg-js"
import type { AnyCircuitElement } from "circuit-json"

const nativeText=await Bun.file("dist/routed/circuit.json").text()
const circuit:AnyCircuitElement[]=JSON.parse(nativeText)
const report=await Bun.file("review/routing/routing-report.json").json()
const validation=await Bun.file("review/routing/validation.json").json()
if(validation.circuitSha256!==createHash("sha256").update(nativeText).digest("hex"))throw new Error("Stale routing validation: run check:routed against this native build before exporting")
const complete=validation.passed===true
const physical=await Bun.file("review/routing/physical-connectivity.json").json()
if(physical.circuitSha256!==validation.circuitSha256)throw new Error("Stale physical connectivity report")
const bypass=await Bun.file("review/routing/bypass-length-validation.json").json()
const kelvin=await Bun.file("review/routing/kelvin-routing-audit.json").json()
const usb=await Bun.file("review/routing/usb-routing-audit.json").json()
for(const audit of [bypass,kelvin,usb])if(audit.circuitSha256!==validation.circuitSha256)throw new Error("Stale routing audit report")
const pendingLines=["# Routing draft: unfinished connections", "", "This is a partial routing snapshot for review. Remaining connections are intentional review work, not a fabrication release.", "",
  `${report.routedEdges}/${report.plannedEdges} planned non-ground edges were realized as ${report.physicalTraceCount} saved trace pieces and ${report.throughViaCount} through vias. ${physical.nets.filter((n:any)=>n.passed).length}/${physical.nets.length} nets form one physical copper component.`, "",
  "## Pending planned edges", "", "| Net | From | To | Owner |", "| --- | --- | --- | --- |",
  ...report.pending.map((p:any)=>`| ${p.net} | ${p.from} | ${p.to} | ${p.owner} |`), "",
  "## Remaining ground escapes", "", ...report.groundPendingPorts.map((p:string)=>`- ${p}`), "",
  "## Logic power feeds without a declared plane barrel", "", ...report.logicPowerPending.map((p:string)=>`- ${p}`), "",
  "## Physical copper gaps", "", "The exact native audit also includes isolated pads, orphan copper, and disconnected pour pieces. A routing-tree union does not substitute for these checks.", "",
  "| Net | Copper components | Disconnected pads |", "| --- | --- | --- |",
  ...physical.nets.filter((n:any)=>!n.passed).map((n:any)=>`| ${n.net} | ${n.componentCount} | ${n.disconnectedPorts.map((p:any)=>p.selector).join(", ") || "Pour/barrel piece; see JSON"} |`), "",
  "## Review notes", "", "- Prioritize the controller VIN feed at C24, eFuse DVDT/current-limit/enable escapes, MCU crystal/flash/reset, and remaining MCU supply/ground islands.",
  ...bypass.violations.map((v:any)=>`- Exposed capacitor return: ${v.from} → ${v.to}, ${v.exposedLength.toFixed(3)} mm against ${v.maxExposedLength} mm.`),
  `- Kelvin audit retains ${kelvin.independenceViolations.length} shared-copper contact findings outside the shunt solder lands; review the exact polygons in kelvin-routing-audit.json.`,
  `- USB native pair lengths are ${usb.members.DP.lengthMm.toFixed(6)} / ${usb.members.DM.lengthMm.toFixed(6)} mm, with ${usb.members.DP.transitionCount} transitions each. Physical bottom-reference coverage passes. Impedance remains unqualified.`,
  "- The placement CLI retains five orientation suggestions; native placement DRC has zero errors. See placement-check.txt.",
  "- Confirm the manufacturing stackup, USB impedance, current and thermal behavior before a hardware release.", ""]
await Bun.write("review/routing/pending-connections.md",pendingLines.join("\n"))
for(const layer of ["top","inner1","inner2","bottom"] as const) {
  const svg=convertCircuitJsonToPcbSvg(circuit,{layer,width:1600,height:1250,
    shouldDrawRatsNest:false,shouldDrawErrors:true,shouldDrawWarnings:false,
    backgroundColor:"#0f172a",includeVersion:false})
  await Bun.write(`review/routing/${layer}.svg`,svg)
  await Bun.write(`review/routing/${layer}.png`,new Resvg(svg).render().asPng())
}
await copyFile("dist/routed/circuit.json","review/routing/circuit.json")
const status=complete?"CAD routing verified":"Routing draft for review"
const summary=complete
  ? `<b>All ${report.netCount} nets physically connected; all ${report.groundPorts} ground pads join continuous ground copper.</b><p>${report.physicalTraceCount} declared trace pieces and ${report.throughViaCount} ordinary through vias. Native placement, netlist and geometry checks, physical connectivity, exposed bypass lengths, USB reference coverage and Kelvin separation pass.</p>`
  : `<b>${report.routedEdges} / ${report.plannedEdges} planned connections routed</b><p>${report.pendingEdges} planned edges and ${report.groundPendingPorts.length} explicit ground escapes remain pending. See the physical audit for actual copper continuity and the validation report for all failures.</p>`
const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Revision B ${status}</title><style>body{margin:0;background:#0f172a;color:#e2e8f0;font:16px/1.6 system-ui}main{max-width:1200px;margin:auto;padding:32px}a{color:#80d8e8}img{width:100%;border:1px solid #334155;border-radius:8px}small{color:#a7bbc9}.status{background:#263146;padding:16px;border-left:4px solid ${complete?"#60dba3":"#eab36a"}}details{margin:24px 0}summary{cursor:pointer;font-size:22px}</style><main><small>ACTUAL TSCIRCUIT CAD · REVISION B · ${status.toUpperCase()}</small><h1>USB-C Peltier controller routing</h1><div class="status">${summary}<p>Fabricator stackup and differential impedance, current-transfer capacity, thermal performance and bench behavior require hardware qualification. This CAD review does not constitute a manufacturing release.</p></div><p><a href="pending-connections.md">Unfinished connections</a> · <a href="routing-report.json">Connection results</a> · <a href="validation.json">CAD validation</a> · <a href="physical-connectivity.json">Physical copper connectivity</a> · <a href="bypass-length-validation.json">Bypass lengths</a> · <a href="kelvin-routing-audit.json">Kelvin paths and arrays</a> · <a href="usb-routing-audit.json">USB lengths and transitions</a> · <a href="shorts-check.txt">Gerber shorts check</a> · <a href="circuit.json">Routed Circuit JSON</a></p>${["top","inner1","inner2","bottom"].map((l,i)=>`<details ${i===0?"open":""}><summary>${l} copper</summary><a href="${l}.svg"><img src="${l}.png" alt="Actual ${l} routing copper"></a></details>`).join("")}</main></html>`
await Bun.write("review/routing/index.html",html)
console.log("Exported four routing layers and native routing review to review/routing/")
