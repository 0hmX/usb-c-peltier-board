import { createHash } from "node:crypto"
import { runAllPlacementChecks, runAllRoutingChecks, runAllNetlistChecks } from "@tscircuit/checks"
import generated from "../src/board/routing/generated.json"
import inventory from "../src/board/routing/ports.json"
import type { AnyCircuitElement } from "circuit-json"
import { tracePortCopperContact } from "./source-ground-pad-copper"
import { pointSegmentDistance } from "./routing-geometry"
import type { GeneratedCopper } from "../src/board/routing/generated-types"
import { auditRoutingConnectivity } from "./audit-routing-connectivity"
import { auditBypassLengths } from "./audit-bypass-lengths"
import { auditKelvinRouting } from "./audit-kelvin-routing"
import powerPacket from "../src/board/routing/power-completion.json"
import usbPacket from "../src/board/routing/usb-completion.json"
import { auditUsbRouting } from "./audit-usb-routing"
const copper:GeneratedCopper=generated

const text=await Bun.file("dist/routed/circuit.json").text()
const circuit:AnyCircuitElement[]=JSON.parse(text)
const problems:string[]=[]
const sourceTraces=circuit.filter(p=>p.type==="source_trace")
const pcbTraces=circuit.filter(p=>p.type==="pcb_trace")
const vias=circuit.filter(p=>p.type==="pcb_via")
const baseline:any[]=await Bun.file("dist/routing-placement/circuit.json").json()
const sourceComponents=circuit.filter(p=>p.type==="source_component")
const poses=circuit.filter(p=>p.type==="pcb_component")
const sourcePorts=circuit.filter(p=>p.type==="source_port")
const nets=circuit.filter(p=>p.type==="source_net")
for(const old of baseline.filter(p=>p.type==="pcb_component")) {
  const original=baseline.find(p=>p.type==="source_component"&&p.source_component_id===old.source_component_id)
  const fresh=sourceComponents.find(p=>p.name===original?.name)
  const pose=poses.find(p=>p.source_component_id===fresh?.source_component_id)
  if(!pose || Math.hypot(pose.center.x-old.center.x,pose.center.y-old.center.y)>1e-5 || pose.rotation!==old.rotation)
    problems.push(`Placement changed: ${original?.name}`)
}
for(const p of inventory) {
  const component=sourceComponents.find(c=>c.name===p.component)
  const port=sourcePorts.find(s=>s.source_component_id===component?.source_component_id&&s.pin_number===p.pin)
  if(!port || !nets.some(n=>n.name===p.net&&n.subcircuit_connectivity_map_key===port.subcircuit_connectivity_map_key))
    problems.push(`Net assignment changed: ${p.selector}`)
}
for(const t of copper.traces) {
  const source=sourceTraces.find(s=>s.name===t.name)
  const trace=pcbTraces.find(p=>p.source_trace_id===source?.source_trace_id)
  if(!trace){problems.push(`Missing physical trace: ${t.name}`);continue}
  // Native manual traces include repeated selector coordinates. Remove adjacent duplicates.
  const points=trace.route.filter(p=>p.route_type==="wire").map(p=>({x:p.x,y:p.y,layer:p.layer,width:p.width}))
    .filter((p,i,a)=>!i||Math.hypot(p.x-a[i-1].x,p.y-a[i-1].y)>1e-6)
  const expected=t.path.filter((p,i,a)=>!i||Math.hypot(p.x-a[i-1].x,p.y-a[i-1].y)>1e-6)
  if(t.pcbStraightLine) {
    if(points.length!==2||points.some(p=>pointSegmentDistance(p,expected[0],expected[expected.length-1])>1e-4||
      p.layer!==t.layer||Math.abs(p.width-t.width)>1e-7))problems.push(`Straight bypass differs from declared corridor: ${t.name}`)
    continue
  }
  if(points.length!==expected.length || points.some((p,i)=>!expected[i]||Math.hypot(p.x-expected[i].x,p.y-expected[i].y)>1e-4||p.layer!==t.layer||Math.abs(p.width-t.width)>1e-7))
    problems.push(`Physical path differs from clearance-checked geometry: ${t.name}`)
}
if(pcbTraces.length!==copper.traces.length)problems.push("Unexpected implicit trace count")
if(vias.length!==copper.vias.length)problems.push("Unexpected implicit via count")
for(const v of vias)if(v.hole_diameter!==.3||v.outer_diameter!==.7||
  v.layers.length!==4||!["top","inner1","inner2","bottom"].every(l=>v.layers.includes(l as any)))
  problems.push(`Nonstandard or partial-layer barrel: ${v.pcb_via_id}`)
console.log(`Compared ${pcbTraces.length} native traces, ${vias.length} barrels and all retained placements/net assignments`)
const placement=await runAllPlacementChecks(circuit)
const netlist=await runAllNetlistChecks(circuit)
const routing=await runAllRoutingChecks(circuit)
const connectivityTypes=new Set(["pcb_port_not_connected_error","pcb_trace_missing_error"])
const connectivity=routing.filter(p=>connectivityTypes.has(p.type))
const lengthConstraints=routing.filter(p=>p.type==="pcb_trace_too_long_error")
const geometryExceptions:{diagnostic:AnyCircuitElement;evidence:unknown}[]=[]
const geometric=routing.filter(p=>{
  if(connectivityTypes.has(p.type)||p.type==="pcb_trace_too_long_error"||!p.type.endsWith("_error"))return false
  if(p.type!=="pcb_trace_error")return true
  const trace=pcbTraces.find(t=>t.pcb_trace_id===p.pcb_trace_id)
  if(!trace)return true
  if(p.pcb_trace_error_id?.startsWith("missing_connection_")&&p.pcb_port_ids?.length===1) {
    const layer=trace.route.find(q=>q.route_type==="wire")
    if(layer?.route_type==="wire") {
      const contact=tracePortCopperContact(circuit,p.pcb_port_ids[0],trace,layer.layer)
      if(contact.valid){geometryExceptions.push({diagnostic:p,evidence:contact});return false}
    }
  }
  const keepout=circuit.find(k=>k.type==="pcb_keepout"&&k.shape==="circle"&&
    p.pcb_trace_error_id?.endsWith(`_${k.pcb_keepout_id}`))
  if(keepout?.type==="pcb_keepout"&&keepout.shape==="circle") {
    const gaps=trace.route.slice(1).flatMap((b,i)=>{
      const a=trace.route[i]
      return a.route_type==="wire"&&b.route_type==="wire"&&a.layer===b.layer&&keepout.layers.includes(a.layer)
        ? [pointSegmentDistance(keepout.center,a,b)-keepout.radius-Math.max(a.width,b.width)/2] : []
    })
    const minimumCopperGapMm=Math.min(...gaps)
    if(gaps.length&&minimumCopperGapMm>=.2){geometryExceptions.push({diagnostic:p,evidence:{
      method:"Exact distance between each finite-width trace segment and actual circular keepout",
      minimumCopperGapMm,requiredGapMm:.2,keepoutId:keepout.pcb_keepout_id}});return false}
  }
  return true
})
const placementErrors=placement.filter(p=>p.type.endsWith("_error"))
const netlistErrors=netlist.filter(p=>p.type.endsWith("_error"))
console.log("Checking physical copper components, USB reference coverage, exposed bypass lengths and independent Kelvin paths")
const physical=auditRoutingConnectivity(circuit)
const bypass=auditBypassLengths(circuit,copper)
const kelvin=auditKelvinRouting(circuit,copper,powerPacket)
const usb=auditUsbRouting(circuit,copper,usbPacket)
const circuitSha256=createHash("sha256").update(text).digest("hex")
await Bun.write("review/routing/physical-connectivity.json",JSON.stringify({circuitSha256,...physical},null,2)+"\n")
await Bun.write("review/routing/bypass-length-validation.json",JSON.stringify({circuitSha256,...bypass},null,2)+"\n")
await Bun.write("review/routing/kelvin-routing-audit.json",JSON.stringify({circuitSha256,...kelvin},null,2)+"\n")
await Bun.write("review/routing/usb-routing-audit.json",JSON.stringify({circuitSha256,...usb},null,2)+"\n")
const passed=!(problems.length||placementErrors.length||netlistErrors.length||geometric.length||lengthConstraints.length||connectivity.length)
  &&physical.passed&&bypass.passed&&kelvin.passed&&usb.ok
const report={scope:"Revision B CAD routing validation; fabrication stackup and bench qualification are separate",
  passed,circuitSha256,parityProblems:problems,
  placementErrors,netlistErrors,routingGeometricErrors:geometric,pendingConnectivity:connectivity,
  unmetLengthConstraints:lengthConstraints,geometryExceptions,nativeRoutingChecksPassed:routing.every(p=>!p.type.endsWith("_error")),
  placementDiagnostics:placement,netlistDiagnostics:netlist,routingDiagnostics:routing,
  physicalConnectivityPassed:physical.passed,exposedBypassLengthsPassed:bypass.passed,kelvinRoutingPassed:kelvin.passed,usbRoutingPassed:usb.ok,
  groundPlaneConnectivityVerified:physical.nets.find(n=>n.net==="GND")?.passed??false,
  usbBottomReferencePassed:physical.usbBottomReference.passed,manufacturingAccepted:false}
await Bun.write("review/routing/validation.json",JSON.stringify(report,null,2)+"\n")
console.log(JSON.stringify({parityProblems:problems.length,placementErrors:placementErrors.length,netlistErrors:netlistErrors.length,
  routingGeometricErrors:geometric.length,pendingConnectivity:connectivity.length,
  unmetLengthConstraints:lengthConstraints.length,evidenceBackedGeometryExceptions:geometryExceptions.length,
  physicalConnectivityPassed:physical.passed,failedPhysicalNets:physical.nets.filter(n=>!n.passed).map(n=>n.net),
  bypassViolations:bypass.violationCount,kelvinViolations:kelvin.independenceViolations.length,usbSkewMm:usb.primarySkewMm,usbProblems:usb.problems,passed}))
if(!passed)process.exit(1)
