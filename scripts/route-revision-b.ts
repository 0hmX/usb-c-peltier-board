import { createHash } from "node:crypto"
import { mkdir } from "node:fs/promises"
import { routingPlans } from "../src/board/routing/plans"
import inventory from "../src/board/routing/ports.json"
import type { RoutingEdge, RoutingLayer } from "../src/board/routing/types"
import { CopperGeometry, distance, type Point, type Obstacle } from "./routing-geometry"

const baselineText=await Bun.file("dist/index/circuit.json").text()
const circuit:any[]=JSON.parse(baselineText)
const ports=new Map(inventory.map(p=>[p.selector,p]))
const sourcePorts=new Map(circuit.filter(p=>p.type==="source_port").map(p=>[p.source_port_id,p]))
const components=new Map(circuit.filter(p=>p.type==="source_component").map(p=>[p.source_component_id,p]))
const nets=new Map(circuit.filter(p=>p.type==="source_net").map(p=>[p.subcircuit_connectivity_map_key,p.name]))
const portNets=new Map(circuit.filter(p=>p.type==="pcb_port").map(p=>[p.pcb_port_id,nets.get(sourcePorts.get(p.source_port_id)?.subcircuit_connectivity_map_key)]))
const rotations=new Map(circuit.filter(p=>p.type==="pcb_component").map(p=>[components.get(p.source_component_id)?.name,p.rotation??0]))
// Imported connector geometry can have an off-center bounding box. Core applies
// the authored component anchor, recorded as display offsets, to pcbPath points.
const origins=new Map(circuit.filter(p=>p.type==="pcb_component").map(p=>[components.get(p.source_component_id)?.name,
  {x:p.display_offset_x??p.center.x,y:p.display_offset_y??p.center.y} as Point]))
const padSignature=(pads:any[])=>JSON.stringify(pads.map(p=>Object.fromEntries([
  "type","shape","x","y","width","height","radius","points","outer_diameter","hole_diameter",
  "outer_width","outer_height","hole_width","hole_height","ccw_rotation","layer","layers"
].map(k=>[k,p[k]]))))
const currentSelectors=new Set<string>()
// Reject stale captured routing coordinates before emitting any new copper.
for (const p of circuit.filter(p=>p.type==="pcb_port")) {
  const s=sourcePorts.get(p.source_port_id), c=components.get(s?.source_component_id)
  const selector=`${c?.name}.pin${s?.pin_number}`, old=ports.get(selector)
  if (!portNets.get(p.pcb_port_id))continue
  currentSelectors.add(selector)
  const pads=circuit.filter(q=>["pcb_smtpad","pcb_plated_hole"].includes(q.type)&&q.pcb_port_id===p.pcb_port_id)
  if (!old || distance(p,old)>1e-4 || portNets.get(p.pcb_port_id)!==old.net ||
      JSON.stringify(p.layers)!==JSON.stringify(old.layers) || padSignature(pads)!==padSignature(old.pads))
    throw new Error(`Stale routing inventory: ${selector}; regenerate ports.json from current placement`)
}
for(const selector of ports.keys())if(!currentSelectors.has(selector))throw new Error(`Deleted routing port: ${selector}`)
if (circuit.some(p=>["pcb_trace","pcb_via","pcb_copper_pour"].includes(p.type)))
  throw new Error("Routing baseline must be the clean Revision B placement build")
const owners=new Map<string,string>()
for (const plan of routingPlans) for (const net of plan.nets) {
  if (owners.has(net)) throw new Error(`Duplicate routing ownership for ${net}`)
  owners.set(net,plan.owner)
}
for (const net of new Set(inventory.map(p=>p.net))) if (!owners.has(net)) throw new Error(`Unowned net ${net}`)
const edges=routingPlans.flatMap(plan=>plan.edges.map(e=>({...e,owner:plan.owner})))
for (const e of edges) {
  if (e.waypoints?.length) throw new Error(`Explicit waypoints require a constrained-path realization: ${e.from}`)
  if (ports.get(e.from)?.net!==e.net || ports.get(e.to)?.net!==e.net || e.width<.2)
    throw new Error(`Invalid edge ${e.net}: ${e.from} -> ${e.to}`)
}
for (const [net,owner] of owners) {
  if(net==="GND")continue
  const members=inventory.filter(p=>p.net===net).map(p=>p.selector),ownEdges=edges.filter(e=>e.net===net)
  const reached=new Set([members[0]])
  let previous=0
  while(reached.size!==previous){previous=reached.size;for(const e of ownEdges)
    if(reached.has(e.from)||reached.has(e.to)){reached.add(e.from);reached.add(e.to)}}
  if(ownEdges.length!==members.length-1 || members.some(p=>!reached.has(p)))
    throw new Error(`Incomplete routing tree for ${net} owned by ${owner}`)
}
if(process.argv.includes("--validate-only")) {
  console.log(`Validated ${routingPlans.length} plans, ${owners.size} nets, ${edges.length} edges and fresh pad geometry`)
  process.exit(0)
}
const geometry=new CopperGeometry()
const allLayers=["top","inner1","inner2","bottom"]
for (const p of circuit) {
  if (!["pcb_smtpad","pcb_plated_hole","pcb_hole","pcb_keepout"].includes(p.type)) continue
  const net=portNets.get(p.pcb_port_id), layers=p.layers ?? [p.layer??"top"]
  if (p.type==="pcb_hole") {
    geometry.add({kind:"circle",layers:allLayers,x:p.x,y:p.y,radius:(p.hole_diameter??p.diameter??0)/2,hole:true});continue
  }
  if (p.type==="pcb_keepout") {
    const center=p.center??p
    geometry.add({kind:p.shape==="circle"?"circle":"rect",layers,x:center.x,y:center.y,
      radius:p.radius??p.diameter/2,width:p.width,height:p.height});continue
  }
  let obstacle:Obstacle
  const points=p.points??p.polygon
  if (Array.isArray(points) && points.length) {
    const xs=points.map((q:any)=>q.x),ys=points.map((q:any)=>q.y)
    obstacle={kind:"rect",net,layers,x:(Math.min(...xs)+Math.max(...xs))/2,y:(Math.min(...ys)+Math.max(...ys))/2,
      width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys),pad:true}
  } else if (p.shape==="circle") {
    obstacle={kind:"circle",net,layers,x:p.x,y:p.y,radius:p.radius??p.outer_diameter/2,pad:true}
  } else {
    const w=p.width??p.outer_width??p.outer_diameter??0,h=p.height??p.outer_height??p.outer_diameter??0
    const theta=(p.ccw_rotation??0)*Math.PI/180
    obstacle={kind:"rect",net,layers,x:p.x,y:p.y,width:Math.abs(w*Math.cos(theta))+Math.abs(h*Math.sin(theta)),
      height:Math.abs(w*Math.sin(theta))+Math.abs(h*Math.cos(theta)),pad:true}
  }
  if (![obstacle.x,obstacle.y,obstacle.width??obstacle.radius,obstacle.height??obstacle.radius].every(Number.isFinite))
    throw new Error(`Unsupported pad geometry ${p.pcb_smtpad_id??p.pcb_plated_hole_id}`)
  geometry.add(obstacle)
  if (p.type==="pcb_plated_hole") geometry.add({kind:"circle",net,layers:allLayers,x:p.x,y:p.y,
    radius:(p.hole_diameter??Math.max(p.hole_width??0,p.hole_height??0))/2,hole:true})
}

function clearPath(path:Point[],layer:string,width:number,net:string) {
  return path.slice(1).every((p,i)=>geometry.clear(path[i],p,layer,width,net))
}
function simplePath(a:Point,b:Point,layer:string,width:number,net:string):Point[]|undefined {
  const dx=b.x-a.x,dy=b.y-a.y, d=Math.min(Math.abs(dx),Math.abs(dy))
  const candidates=[ [a,b], [a,{x:a.x+Math.sign(dx)*d,y:a.y+Math.sign(dy)*d},b],
    [a,{x:b.x-Math.sign(dx)*d,y:b.y-Math.sign(dy)*d},b],
    [a,{x:a.x,y:b.y},b], [a,{x:b.x,y:a.y},b] ]
  return candidates.find(path=>clearPath(path,layer,width,net))
}
class Heap {
  private items:{key:string,x:number,y:number,g:number,f:number}[]=[]
  push(item:{key:string,x:number,y:number,g:number,f:number}) {
    let i=this.items.length;this.items.push(item)
    while(i>0){const p=(i-1)>>1;if(this.items[p].f<=item.f)break;this.items[i]=this.items[p];i=p}this.items[i]=item
  }
  pop(){const top=this.items[0],last=this.items.pop();if(!last)return undefined
    if(this.items.length){let i=0;while(i*2+1<this.items.length){let j=i*2+1;if(j+1<this.items.length&&this.items[j+1].f<this.items[j].f)j++
      if(this.items[j].f>=last.f)break;this.items[i]=this.items[j];i=j}this.items[i]=last}return top}
}
function pathfind(a:Point,b:Point,layer:string,width:number,net:string,step=.2,limit=10000):Point[]|undefined {
  const simple=simplePath(a,b,layer,width,net);if(simple)return simple
  const margin=4, left=Math.max(-54,a.x<b.x?a.x-margin:b.x-margin),right=Math.min(54,Math.max(a.x,b.x)+margin)
  const bottom=Math.max(-41.5,Math.min(a.y,b.y)-margin),top=Math.min(41.5,Math.max(a.y,b.y)+margin)
  const heap=new Heap(),score=new Map<string,number>([["0,0",0]]),parents=new Map<string,string>()
  const point=(x:number,y:number)=>({x:a.x+x*step,y:a.y+y*step})
  heap.push({key:"0,0",x:0,y:0,g:0,f:distance(a,b)})
  let visited=0
  const moves=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]
  while(visited++<limit){const node=heap.pop();if(!node)return undefined
    if(node.g>(score.get(node.key)??Infinity)+1e-8)continue
    const p=point(node.x,node.y)
    if(distance(p,b)<step*1.6 && geometry.clear(p,b,layer,width,net)) {
      const result:Point[]=[b,p];let key=node.key
      while(parents.has(key)){key=parents.get(key)!;const [x,y]=key.split(",").map(Number);result.push(point(x,y))}
      result.reverse();return simplify(result,layer,width,net)
    }
    for(const [dx,dy] of moves){const x=node.x+dx,y=node.y+dy,q=point(x,y)
      if(q.x<left||q.x>right||q.y<bottom||q.y>top)continue
      const key=`${x},${y}`,g=node.g+step*Math.hypot(dx,dy)
      if(g>=(score.get(key)??Infinity)-1e-8||!geometry.clear(p,q,layer,width,net))continue
      score.set(key,g);parents.set(key,node.key);heap.push({key,x,y,g,f:g+distance(q,b)*1.02})
    }
  }
}
function simplify(path:Point[],layer:string,width:number,net:string) {
  const result:Point[]=[path[0]];let i=0
  while(i<path.length-1){let j=path.length-1;while(j>i+1&&!geometry.clear(path[i],path[j],layer,width,net))j--
    result.push(path[j]);i=j}return result
}
interface Escape {point:Point;path:Point[];via?:string}
const viaCache=new Map<string,{name:string,net:string,x:number,y:number}>()
const traces:{name:string,net:string,from:string,to:string,layer:string,width:number,path:Point[],rotation:number,origin:Point}[]=[]
function escape(selector:string,width:number):Escape|undefined {
  const p=ports.get(selector)!,net=p.net
  // Prefer an existing legal same-net barrel reachable by a short escape.
  for(const v of viaCache.values()) if(v.net===net&&distance(p,v)<3) {
    const path=simplePath(p,v,"top",width,net);if(path)return {point:v,path,via:v.name}
  }
  const candidates:Point[]=[]
  const comp=circuit.find(c=>c.type==="pcb_component"&&components.get(c.source_component_id)?.name===p.component)
  const outward=Math.atan2(p.y-(comp?.center.y??p.y),p.x-(comp?.center.x??p.x))
  for(let r=.7;r<=4;r+=.2) for(let j=0;j<16;j++) {
    const angle=outward+Math.PI*2*j/16,q={x:p.x+Math.cos(angle)*r,y:p.y+Math.sin(angle)*r}
    if(geometry.clear(q,q,"top",.7,net,true))candidates.push(q)
  }
  for(const q of candidates){const path=simplePath(p,q,"top",width,net);if(path)return {point:q,path}}
  for(const q of candidates.slice(0,12)){const path=pathfind(p,q,"top",width,net,.1,2500);if(path)return {point:q,path}}
}
function addVia(p:Point,net:string) {
  const key=`${net}:${p.x.toFixed(5)}:${p.y.toFixed(5)}`
  let via=viaCache.get(key)
  if(!via){via={name:`RB_VIA_${viaCache.size+1}`,net,...p};viaCache.set(key,via);geometry.addVia(p,net)}
  return via.name
}
function addTrace(net:string,from:string,to:string,path:Point[],layer:string,width:number) {
  traces.push({name:`RB_TRACE_${traces.length+1}`,net,from,to,path:path.map(p=>({x:p.x,y:p.y})),layer,width,
    rotation:rotations.get(from.split(".")[0])??0,origin:origins.get(from.split(".")[0])??path[0]})
  geometry.addPath(path,layer,width,net)
}
function realize(e:RoutingEdge,search:boolean) {
  const a=ports.get(e.from)!,b=ports.get(e.to)!
  const len=(p:Point[])=>p.slice(1).reduce((sum,q,i)=>sum+distance(p[i],q),0)
  const acceptable=(p:Point[])=>!e.maxLength||len(p)<=e.maxLength+1e-6
  let start:Escape|undefined,end:Escape|undefined
  for(const layer of e.preferredLayers) {
    if(layer==="top") {
      const p=search?pathfind(a,b,"top",e.width,e.net):simplePath(a,b,"top",e.width,e.net)
      if(p&&acceptable(p)){addTrace(e.net,e.from,e.to,p,"top",e.width);return {length:len(p),vias:0}}
      continue
    }
    if(!search||layer==="inner1")continue
    start??=escape(e.from,e.width);end??=escape(e.to,e.width)
    if(!start||!end)continue
    // Avoid colliding two newly proposed ordinary full-through barrels.
    if(!start.via&&!end.via&&distance(start.point,end.point)<1)continue
    const trunk=pathfind(start.point,end.point,layer,e.width,e.net,.25,16000)
    if(!trunk)continue
    const length=len(start.path)+len(trunk)+len(end.path)
    if(e.maxLength&&length>e.maxLength+1e-6)continue
    const v1=start.via??addVia(start.point,e.net),v2=end.via??addVia(end.point,e.net)
    addTrace(e.net,e.from,`${v1}.top`,start.path,"top",e.width)
    addTrace(e.net,`${v1}.${layer}`,`${v2}.${layer}`,trunk,layer,e.width)
    addTrace(e.net,`${v2}.top`,e.to,[...end.path].reverse(),"top",e.width)
    return {length,vias:2}
  }
}
const routed:any[]=[],pending:any[]=[],groundRouted:string[]=[],groundPending:string[]=[]
const ordered=[...edges].sort((a,b)=>a.priority-b.priority||distance(ports.get(a.from)!,ports.get(a.to)!)-distance(ports.get(b.from)!,ports.get(b.to)!))
// Critical paths precede ground escapes; ground precedes slow control fanouts.
const first=ordered.filter(e=>e.priority<=10),last=ordered.filter(e=>e.priority>10)
let done=0
for(const batch of [first,last]) {
  for(const e of batch){const result=realize(e,true)
    if(result)routed.push({...e,...result});else pending.push({...e,reason:"No legal path within width, layer and length constraints in bounded first-pass search"})
    if(++done%10===0)console.log(`Routed ${routed.length}/${done} attempted edges; ${viaCache.size} full-through vias`)
  }
  if(batch===first) for(const p of inventory.filter(p=>p.net==="GND")) {
    if(p.layers.includes("inner1")){groundRouted.push(p.selector);continue}
    const out=escape(p.selector,.2)
    if(out){const name=out.via??addVia(out.point,"GND");addTrace("GND",p.selector,`${name}.top`,out.path,"top",.2);groundRouted.push(p.selector)}
    else groundPending.push(p.selector)
  }
}
const report={status:pending.length||groundPending.length?"routing-in-progress":"prototype-routed",
  baselineSha256:createHash("sha256").update(baselineText).digest("hex"),agents:10,astraAgents:3,
  planCount:routingPlans.length,netCount:owners.size,plannedEdges:edges.length,routedEdges:routed.length,pendingEdges:pending.length,
  physicalTraceCount:traces.length,throughViaCount:viaCache.size,groundPorts:inventory.filter(p=>p.net==="GND").length,
  groundPortsReachingInner1:groundRouted.length,groundEscapedSelectors:groundRouted,groundPlaneConnectivityVerified:false,
  groundPendingPorts:groundPending,routeLengthMm:routed.reduce((n,e)=>n+e.length,0),
  manufacturingAccepted:false,usbImpedanceQualified:false,kelvinSeparationQualified:false,
  routed,pending,notes:routingPlans.map(p=>({owner:p.owner,nets:p.nets,notes:p.notes}))}
await mkdir("review/routing",{recursive:true})
await Bun.write("src/board/routing/generated.json",JSON.stringify({vias:[...viaCache.values()],traces},null,2)+"\n")
await Bun.write("review/routing/routing-report.json",JSON.stringify(report,null,2)+"\n")
console.log(JSON.stringify({routedEdges:report.routedEdges,pendingEdges:report.pendingEdges,traces:traces.length,vias:viaCache.size,groundEscaped:groundRouted.length,groundPending:groundPending.length}))
