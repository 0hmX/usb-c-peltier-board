import { createHash } from "node:crypto"
import { mkdir } from "node:fs/promises"
import { readdir } from "node:fs/promises"
import { routingPlans } from "../src/board/routing/plans"
import inventory from "../src/board/routing/ports.json"
import type { RoutingEdge, RoutingLayer } from "../src/board/routing/types"
import { CopperGeometry, distance, segmentDistance, pointSegmentDistance, distanceToObstacle, type Point, type Obstacle } from "./routing-geometry"

const baselineText=await Bun.file("dist/routing-placement/circuit.json").text()
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
const padObstacles=new Map<string,Obstacle[]>()
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
    obstacle={kind:"polygon",net,layers,x:p.x??0,y:p.y??0,points,pad:true}
  } else if (p.shape==="circle") {
    obstacle={kind:"circle",net,layers,x:p.x,y:p.y,radius:p.radius??p.outer_diameter/2,pad:true}
  } else {
    const w=p.width??p.outer_width??p.outer_diameter??0,h=p.height??p.outer_height??p.outer_diameter??0
    const theta=(p.ccw_rotation??0)*Math.PI/180
    obstacle={kind:"rect",net,layers,x:p.x,y:p.y,width:Math.abs(w*Math.cos(theta))+Math.abs(h*Math.sin(theta)),
      height:Math.abs(w*Math.sin(theta))+Math.abs(h*Math.cos(theta)),pad:true}
  }
  if (obstacle.kind!=="polygon"&&![obstacle.x,obstacle.y,obstacle.width??obstacle.radius,obstacle.height??obstacle.radius].every(Number.isFinite))
    throw new Error(`Unsupported pad geometry ${p.pcb_smtpad_id??p.pcb_plated_hole_id}`)
  geometry.add(obstacle)
  if(p.pcb_port_id)padObstacles.set(p.pcb_port_id,[...(padObstacles.get(p.pcb_port_id)??[]),obstacle])
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
function pathfind(a:Point,b:Point,layer:string,width:number,net:string,step=.2,limit=40000,margin=8):Point[]|undefined {
  const simple=simplePath(a,b,layer,width,net);if(simple)return simple
  const left=Math.max(-54,a.x<b.x?a.x-margin:b.x-margin),right=Math.min(54,Math.max(a.x,b.x)+margin)
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
interface LayerPoint extends Point {layer:string}
// Search layer changes as real ordinary through barrels, with every drill and
// pad checked on all four layers. Inner1 remains reserved for the ground plane.
function pathfindAcrossLayers(a:Point,b:Point,layers:string[],width:number,net:string):LayerPoint[]|undefined {
  const step=.4,heap=new Heap(),scores=new Map<string,number>(),parents=new Map<string,string>()
  const viaLegal=new Map<string,boolean>(),at=(x:number,y:number)=>({x:a.x+x*step,y:a.y+y*step})
  for(let l=0;l<layers.length;l++){const key=`${l},0,0`;scores.set(key,0);heap.push({key,x:0,y:0,g:0,f:distance(a,b)})}
  const moves=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]
  for(let visited=0;visited<450000;visited++) {
    const node=heap.pop();if(!node)return
    if(node.g>(scores.get(node.key)??Infinity)+1e-8)continue
    const l=Number(node.key.split(",")[0]),layer=layers[l],p=at(node.x,node.y)
    if(distance(p,b)<step*1.6&&geometry.clear(p,b,layer,width,net)) {
      const result:LayerPoint[]=[{...b,layer},{...p,layer}];let key=node.key
      while(parents.has(key)){key=parents.get(key)!;const [li,x,y]=key.split(",").map(Number);result.push({...at(x,y),layer:layers[li]})}
      result.reverse()
      const reduced:LayerPoint[]=[];let section:LayerPoint[]=[]
      for(const q of result) {
        if(section.length&&section[0].layer!==q.layer){reduced.push(...simplify(section,section[0].layer,width,net).map(p=>({...p,layer:section[0].layer})));section=[]}
        if(!section.length||distance(section[section.length-1],q)>1e-8)section.push(q)
      }
      if(section.length)reduced.push(...simplify(section,section[0].layer,width,net).map(p=>({...p,layer:section[0].layer})))
      return reduced
    }
    const push=(x:number,y:number,nextLayer:number,g:number)=>{
      const key=`${nextLayer},${x},${y}`;if(g>=(scores.get(key)??Infinity)-1e-8)return
      scores.set(key,g);parents.set(key,node.key);heap.push({key,x,y,g,f:g+distance(at(x,y),b)*1.02})
    }
    for(const [dx,dy] of moves) {
      const x=node.x+dx,y=node.y+dy,q=at(x,y)
      if(Math.abs(q.x)>54||Math.abs(q.y)>41.5||!geometry.clear(p,q,layer,width,net))continue
      push(x,y,l,node.g+step*Math.hypot(dx,dy))
    }
    const viaKey=`${node.x},${node.y}`
    let clear=viaLegal.get(viaKey)
    if(clear===undefined){clear=geometry.clear(p,p,"top",.7,net,true);viaLegal.set(viaKey,clear)}
    if(clear)for(let next=0;next<layers.length;next++)if(next!==l)push(node.x,node.y,next,node.g+6)
  }
}
function simplify(path:Point[],layer:string,width:number,net:string) {
  const result:Point[]=[path[0]];let i=0
  while(i<path.length-1){let j=path.length-1;while(j>i+1&&!geometry.clear(path[i],path[j],layer,width,net))j--
    result.push(path[j]);i=j}return result
}
interface Escape {point:Point;path:Point[];via?:string}
const viaCache=new Map<string,{name:string,net:string,x:number,y:number}>()
const aliases=new Map<string,string>()
const traces:{name:string,net:string,from:string,to:string,layer:string,width:number,path:Point[],rotation:number,origin:Point,pcbStraightLine?:boolean,maxLength?:number,maxExposedLength?:number,role?:string}[]=[]
const kelvinVias=new Set<string>()
const graphParents=new Map<string,string>()
const graphRoot=(p:string):string=>{const parent=graphParents.get(p);if(!parent){graphParents.set(p,p);return p}
  if(parent===p)return p;const r=graphRoot(parent);graphParents.set(p,r);return r}
const graphJoin=(a:string,b:string)=>{graphParents.set(graphRoot(a),graphRoot(b))}
const graphNode=(selector:string)=>selector.match(/\.(top|bottom|inner1|inner2)$/)?selector.replace(/\.(top|bottom|inner1|inner2)$/,".barrel"):selector
const physicalPort=(selector:string):Point|undefined=>ports.get(selector)??[...viaCache.values()].find(v=>selector.startsWith(v.name+"."))
const capacitorNames=new Set(circuit.filter(p=>p.type==="source_component"&&p.ftype==="simple_capacitor").map(p=>p.name))
function escape(selector:string,width:number):Escape|undefined {
  const p=ports.get(selector)!,net=p.net
  // Reuse an already connected barrel through previously checked local copper.
  for(const v of viaCache.values())if(!kelvinVias.has(v.name)&&v.net===net&&graphRoot(selector)===graphRoot(`${v.name}.barrel`))
    return {point:v,path:[],via:v.name}
  // Prefer an existing legal same-net barrel reachable by a short escape.
  for(const v of [...viaCache.values()].sort((a,b)=>distance(p,a)-distance(p,b))) if(!kelvinVias.has(v.name)&&v.net===net&&distance(p,v)<(net==="GND"&&capacitorNames.has(p.component)?1.5:3)) {
    const path=simplePath(p,v,"top",width,net);if(path)return {point:v,path,via:v.name}
  }
  const candidates:Point[]=[]
  const comp=circuit.find(c=>c.type==="pcb_component"&&components.get(c.source_component_id)?.name===p.component)
  const outward=Math.atan2(p.y-(comp?.center.y??p.y),p.x-(comp?.center.x??p.x))
  for(let r=.6;r<=6;r+=.2) for(let j=0;j<24;j++) {
    const angle=outward+Math.PI*2*j/24,q={x:p.x+Math.cos(angle)*r,y:p.y+Math.sin(angle)*r}
    if(geometry.clear(q,q,"top",.7,net,true))candidates.push(q)
  }
  for(const q of candidates){const path=simplePath(p,q,"top",width,net);if(path)return {point:q,path}}
  for(const q of candidates.slice(0,24)){const path=pathfind(p,q,"top",width,net,.1,15000,5);if(path)return {point:q,path}}
}
function addVia(p:Point,net:string) {
  const key=`${net}:${p.x.toFixed(5)}:${p.y.toFixed(5)}`
  let via=viaCache.get(key)
  if(!via){via={name:`RB_VIA_${viaCache.size+1}`,net,...p};viaCache.set(key,via);geometry.addVia(p,net)}
  return via.name
}
function addTrace(net:string,from:string,to:string,path:Point[],layer:string,width:number,pcbStraightLine=false,maxLength?:number,maxExposedLength?:number) {
  if(path.length<2)return
  for(const old of traces)if(old.net===net&&old.layer===layer&&path.slice(1).some((b,i)=>
    old.path.slice(1).some((d,j)=>segmentDistance(path[i],b,old.path[j],d)<(width+old.width)/2-.00001)))
      graphJoin(graphNode(from),graphNode(old.from))
  for(const v of viaCache.values())if(v.net===net&&path.slice(1).some((b,i)=>pointSegmentDistance(v,path[i],b)<.35+width/2-.00001))
    graphJoin(graphNode(from),`${v.name}.barrel`)
  traces.push({name:`RB_TRACE_${traces.length+1}`,net,from,to,path:path.map(p=>({x:p.x,y:p.y})),layer,width,
    rotation:rotations.get(from.split(".")[0])??0,origin:origins.get(from.split(".")[0])??path[0],pcbStraightLine,
    maxExposedLength,
    // Core sometimes retains pad interiors in its trace length. The independent
    // exposed-copper auditor enforces the physical bypass bound below; source
    // maxLength includes authored in-pad segments without relaxing that bound.
    maxLength:maxExposedLength!==undefined?Math.max(maxLength??0,path.slice(1).reduce((n,p,i)=>n+distance(path[i],p),0)+.001):
      maxLength??(capacitorNames.has(from.split(".")[0])||capacitorNames.has(to.split(".")[0])?Math.max(1,path.slice(1).reduce((n,p,i)=>n+distance(path[i],p),0)*1.25+1):undefined)})
  geometry.addPath(path,layer,width,net)
  graphJoin(graphNode(from),graphNode(to))
}
const packets:{file:string;data:any}[]=[]
for(const file of (await readdir("src/board/routing")).filter(f=>f.endsWith("-completion.json")))
  packets.push({file,data:await Bun.file(`src/board/routing/${file}`).json()})
const point=(p:any):Point=>Array.isArray(p)?{x:p[0],y:p[1]}:{x:p.x,y:p.y}
const fixedRejected:any[]=[]
const reservationStages:{owner:string;traceStart:number;traceEnd:number;viaNames:string[]}[]=[]
function registerVia(name:string,net:string,p:Point) {
  if(!owners.has(net)||![p.x,p.y].every(Number.isFinite))throw new Error(`Invalid fixed barrel ${name}`)
  const same=[...viaCache.values()].find(v=>v.net===net&&distance(v,p)<.01)
  if(same){aliases.set(name,same.name);return same.name}
  if(!geometry.clear(p,p,"top",.7,net,true))throw new Error(`Illegal fixed via ${name} ${net} (${p.x},${p.y})`)
  const actual=addVia(p,net);aliases.set(name,actual);return actual
}
function resolveEndpoint(selector:string|undefined,p:Point,net:string,layer:string) {
  if(selector&&ports.has(selector))return selector
  if(selector){const [base,...rest]=selector.split(".");let key=base
    if(rest.length>1&&/^[0-9]+$/.test(rest[0]))key=`${base}.${rest[0]}`
    if(key===base){const members=[...aliases].filter(([n])=>n.startsWith(base+".")).map(([,n])=>[...viaCache.values()].find(v=>v.name===n)!).filter(Boolean)
      const nearest=members.sort((a,b)=>distance(a,p)-distance(b,p))[0]
      if(nearest&&distance(nearest,p)<.05)return `${nearest.name}.${layer}`}
    const mapped=aliases.get(key)??aliases.get(selector.replace(/\.(top|bottom|inner1|inner2)$/,""))
    if(mapped)return `${mapped}.${layer}`
  }
  const existing=[...viaCache.values()].find(v=>v.net===net&&distance(v,p)<.05)
  if(existing)return `${existing.name}.${layer}`
  const existingPort=inventory.find(v=>v.net===net&&distance(v,p)<.01)
  if(existingPort)return existingPort.selector
  const name=registerVia(selector?.replace(/\.(top|bottom|inner1|inner2)$/ ,"")??`JOINT_${viaCache.size}`,net,p)
  return `${name}.${layer}`
}
function installFixed(p:any,owner:string) {
  const path:Point[]=(p.centerPath??p.points??p.path??p.pcbPath).map(point),net=p.net??"GND",layer=p.layer??"top",width=p.width??.2
  const checkpoint=geometry.checkpoint(),beforeVias=new Set(viaCache.keys()),beforeAliases=new Map(aliases)
  try {
    const from=resolveEndpoint(p.from??p.fromSelector??p.selector,path[0],net,layer)
    const to=resolveEndpoint(p.to??p.toSelector,path[path.length-1],net,layer)
    if(!owners.has(net)||!allLayers.includes(layer)||width<.2||path.length<2||path.some(q=>![q.x,q.y].every(Number.isFinite)))
      throw new Error("Invalid fixed path rules")
    for(const selector of [from,to]) {
      const endpointNet=ports.get(selector)?.net??[...viaCache.values()].find(v=>selector.startsWith(v.name+"."))?.net
      if(endpointNet!==net)throw new Error(`Fixed endpoint net mismatch ${selector}: ${endpointNet} vs ${net}`)
    }
    const insidePad=(selector:string,q:Point)=>padObstacles.get(ports.get(selector)?.pads[0]?.pcb_port_id??"")?.some(o=>distanceToObstacle(q,q,o)<=.0003)
    if(ports.has(from)&&distance(ports.get(from)!,path[0])>.002&&!insidePad(from,path[0]))throw new Error(`Stale fixed start ${from}`)
    if(ports.has(to)&&distance(ports.get(to)!,path[path.length-1])>.002&&!insidePad(to,path[path.length-1]))throw new Error(`Stale fixed end ${to}`)
    // Use the exact resolved barrel coordinates, avoiding submicron supplier
    // rounding mismatches between explicit path endpoints and selector positions.
    path[0]={...physicalPort(from)!};path[path.length-1]={...physicalPort(to)!}
    if(traces.some(t=>t.net===net&&t.layer===layer&&t.width===width&&t.from===from&&t.to===to&&
      t.path.length===path.length&&t.path.every((q,i)=>distance(q,path[i])<1e-6)))return true
    if(!clearPath(path,layer,width,net))throw new Error(`Fixed path collision`)
    const span=path.slice(1).reduce((n,q,i)=>n+distance(path[i],q),0)
    const straight=p.pcbStraightLine??(path.length===2&&span<=4&&[from,to].some(s=>capacitorNames.has(s.split(".")[0])))
    const declared=p.maxLength??p.maxLengthMm
    const localCap=[from,to].some(s=>capacitorNames.has(s.split(".")[0]))
    const exposed=p.maxExposedLength??p.maxExposedCopperLengthMm??(localCap&&declared!==undefined&&declared<=2?declared:undefined)
    addTrace(net,from,to,path,layer,width,straight,declared??(span*1.25+2),exposed)
    if(owner==="kelvin")traces[traces.length-1].role="kelvin"
    return true
  }catch(error){geometry.restore(checkpoint);for(const k of viaCache.keys())if(!beforeVias.has(k))viaCache.delete(k)
    aliases.clear();for(const [k,v] of beforeAliases)aliases.set(k,v)
    fixedRejected.push({owner,from:p.from??p.fromSelector??p.selector,to:p.to??p.toSelector,net,reason:String(error),path});return false}
}
function installPacket(file:string,mode:"all"|"local"="all") {
  const data=packets.find(p=>p.file===file)?.data;if(!data)return
  const traceStart=traces.length
  const straightOverrides=data.nativeStraightLineSuggestions??[]
  const paths=[...(data.physicalTraces??data.traces??data.paths??[]),...(data.localRoutes??[])]
  const localPaths=paths.filter(p=>{const ps=(p.points??p.path??p.centerPath??p.pcbPath)?.map(point)
    return ps&&ps.slice(1).reduce((n:number,q:Point,i:number)=>n+distance(ps[i],q),0)<=4})
  const localSelectors=[...localPaths,...straightOverrides].flatMap(p=>[p.from??p.fromSelector??p.selector,p.to??p.toSelector]).filter(Boolean)
  for(const v of [...(data.vias??[]),...(data.localVias??[])]) {
    if(mode==="local"&&!localSelectors.some(s=>s===v.name||s.startsWith(v.name+".")))continue
    try{registerVia(v.name,v.net,point(v))}catch(error){fixedRejected.push({owner:file,via:v,reason:String(error)})}
  }
  for(const array of data.viaArrays??[]) {
    const id=array.id??array.name
    for(const [i,p] of (array.points??array.vias??[]).entries())try{registerVia(`${id}.${i+1}`,array.net,point(p));
      if(i===0)aliases.set(id,aliases.get(`${id}.1`)!)}catch(error){fixedRejected.push({owner:file,via:p,reason:String(error)})}
    const members=[...aliases].filter(([name])=>name.startsWith(id+".")).map(([,name])=>viaCache.get([...viaCache].find(([,v])=>v.name===name)![0])!)
    for(const layer of ["top","bottom"])for(let i=1;i<members.length;i++) {
      const a=members[0],b=members[i],width=array.net==="GND"? .8: .8
      if(clearPath([a,b],layer,width,array.net))addTrace(array.net,`${a.name}.${layer}`,`${b.name}.${layer}`,[a,b],layer,width,false,20)
    }
  }
  for(const p of straightOverrides)installFixed({...p,maxLength:p.maxLength??p.maxExposedCopperLengthMm},file)
  const overridden=new Set(straightOverrides.map((p:any)=>`${p.from}>${p.to}`))
  for(const p of paths) {
    if(overridden.has(`${p.from??p.fromSelector}>${p.to??p.toSelector}`))continue
    if(!(p.points??p.path??p.centerPath??p.pcbPath))continue
    const ps=(p.points??p.path??p.centerPath??p.pcbPath).map(point)
    if(mode==="local"&&ps.slice(1).reduce((n: number,q:Point,i:number)=>n+distance(ps[i],q),0)>4)continue
    installFixed(p,file)
  }
  for(const p of data.groundEscapes??[])if(p.path&&p.via)try {
    const selector=p.fromSelector??p.selector,net=p.net??"GND"
    const name=registerVia(p.via.name??`GND_${selector}`,net,point(p.via))
    installFixed({...p,from:selector,to:`${name}.top`,net,pcbStraightLine:p.path.length===2},file)
  }catch(error){fixedRejected.push({owner:file,selector:p.fromSelector??p.selector,reason:String(error)})}
  reservationStages.push({owner:file,traceStart,traceEnd:traces.length,viaNames:[...viaCache.values()].map(v=>v.name)})
}
// Critical current corridors and coupled USB geometry are immutable obstacles
// before any control routing. The rest is realized against those reservations.
const groundPacket=packets.find(p=>p.file==="ground-completion.json")?.data
function installPowerReturns(selector?:string) {
  for(const p of groundPacket?.powerReturns??[]) {
    if(selector ? p.selector!==selector : p.selector==="U2.pin21")continue
    for(const [i,b] of (p.branches??[]).entries()) {
      if(distance(ports.get(p.selector)!,point(b.path[0]))>.002)continue
      try{const name=registerVia(`GROUND_${p.selector}_${i}`,"GND",point(b.via));installFixed({...b,net:"GND",from:p.selector,to:`${name}.top`},"ground-power")}
      catch(error){fixedRejected.push({owner:"ground-power",selector:p.selector,reason:String(error)})}
    }
  }
}
// The controller exposed-pad returns reserve thermal and current paths before
// adjacent load and sense routing. They may not disappear under later trunks.
installPowerReturns("U2.pin21")
installPacket("power-completion.json")
installPacket("fan-completion.json")
installPacket("usb-completion.json")
if(groundPacket?.bottomReference)geometry.add({kind:"polygon",net:"GND",layers:["bottom"],x:0,y:0,
  points:groundPacket.bottomReference.outline,traceOnly:true})
const kelvinPacket=packets.find(p=>p.file==="power-completion.json")?.data.shuntKelvin
for(const v of kelvinPacket?.vias??[])try{kelvinVias.add(registerVia(v.name,v.net,point(v)))}
  catch(error){fixedRejected.push({owner:"kelvin",via:v,reason:String(error)})}
for(const p of kelvinPacket?.paths??[])installFixed(p,"kelvin")
for(const p of groundPacket?.localSourceBridges??[])installFixed({...p,net:"GND"},"ground")
installPowerReturns()
installPacket("ground-completion.json")
const mcuPacket=packets.find(p=>p.file==="mcu-completion.json")?.data
for(const p of mcuPacket?.localRoutes??[])installFixed(p,"mcu-local")
for(const p of mcuPacket?.fanout??[])try{const v=p.via??p.viaPoint;if(!v)continue
  const name=registerVia(v.name??`MCU_${p.selector}`,ports.get(p.selector)!.net,point(v))
  installFixed({net:ports.get(p.selector)!.net,from:p.selector,to:`${name}.top`,path:p.path??p.topEscapePath,width:.2,layer:"top"},"mcu-fanout")}
  catch(error){fixedRejected.push({owner:"mcu-fanout",selector:p.selector,reason:String(error)})}
const controlPackets=["analog-completion.json","pd-completion.json","thermal-completion.json","interlock-completion.json","i2c-debug-completion.json"]
for(const file of controlPackets)installPacket(file)
console.log(`Reserved ${traces.length} critical/local traces and ${viaCache.size} full-through barrels; rejected ${fixedRejected.length} candidates`)
function realizeWaypoints(e:RoutingEdge) {
  if(!e.waypoints?.length)return undefined
  const checkpoint=geometry.checkpoint(),beforeVias=new Map(viaCache),beforeAliases=new Map(aliases),beforeParents=new Map(graphParents),beforeTraces=traces.length
  try {
    const a=ports.get(e.from)!,b=ports.get(e.to)!
    const nodes=[{...a,layer:"top"},...e.waypoints,{...b,layer:"top"}]
    let from=e.from,path:Point[]=[nodes[0]],layer=nodes[0].layer,total=0,viaCount=0
    for(let i=1;i<nodes.length;i++) {
      const q=nodes[i],last=nodes[i-1]
      if(q.layer!==layer) {
        if(distance(q,last)>.002)throw new Error("Layer transition requires repeated via coordinate")
        const name=registerVia(`HINT_${e.net}_${viaCache.size}`,e.net,q)
        if(path.length>1)addTrace(e.net,from,`${name}.${layer}`,path,layer,e.width,false,e.maxLength)
        from=`${name}.${q.layer}`;path=[q];layer=q.layer;viaCount++;continue
      }
      if(!geometry.clear(last,q,layer,e.width,e.net))throw new Error("Waypoint corridor collision")
      total+=distance(last,q);path.push(q)
    }
    if(e.maxLength&&total>e.maxLength+.0003)throw new Error("Waypoint route exceeds length budget")
    if(path.length>1)addTrace(e.net,from,e.to,path,layer,e.width,false,e.maxLength)
    return {length:total,vias:viaCount,viaCheckedWaypoints:true}
  }catch {
    geometry.restore(checkpoint);viaCache.clear();for(const [k,v] of beforeVias)viaCache.set(k,v)
    aliases.clear();for(const [k,v] of beforeAliases)aliases.set(k,v)
    graphParents.clear();for(const [k,v] of beforeParents)graphParents.set(k,v);traces.length=beforeTraces
    return undefined
  }
}
function realize(e:RoutingEdge,search:boolean) {
  if(graphRoot(graphNode(e.from))===graphRoot(graphNode(e.to)))return {length:0,vias:0,viaExistingCopper:true}
  if(e.net==="V3V3"&&e.priority>10) {
    const barrelFor=(selector:string)=>[...viaCache.values()].find(v=>v.net==="V3V3"&&graphRoot(selector)===graphRoot(`${v.name}.barrel`))
    if(barrelFor(e.from)&&barrelFor(e.to))return {length:0,vias:0,viaPowerPlane:true,requiresPhysicalAudit:true}
  }
  const hinted=realizeWaypoints(e);if(hinted)return hinted
  const a=ports.get(e.from)!,b=ports.get(e.to)!
  const len=(p:Point[])=>p.slice(1).reduce((sum,q,i)=>sum+distance(p[i],q),0)
  const acceptable=(p:Point[])=>!e.maxLength||len(p)<=e.maxLength+1e-6
  let start:Escape|undefined,end:Escape|undefined
  for(const layer of e.preferredLayers) {
    if(layer==="top") {
      const p=search?pathfind(a,b,"top",e.width,e.net):simplePath(a,b,"top",e.width,e.net)
      if(p&&acceptable(p)){const localBypass=(e.note??"").toLowerCase().includes("bypass")&&
        [e.from,e.to].some(s=>capacitorNames.has(s.split(".")[0]))&&[e.from,e.to].some(s=>/^U(?:_|[0-9])/.test(s))
        addTrace(e.net,e.from,e.to,p,"top",e.width,p.length===2&&localBypass,e.maxLength,localBypass?(e.maxLength??1):undefined);return {length:len(p),vias:0}}
      continue
    }
    if(!search||layer==="inner1")continue
    start??=escape(e.from,Math.min(e.width,.2));end??=escape(e.to,Math.min(e.width,.2))
    if(!start||!end)continue
    // Avoid colliding two newly proposed ordinary full-through barrels.
    if(!start.via&&!end.via&&distance(start.point,end.point)<1)continue
    const trunk=pathfind(start.point,end.point,layer,e.width,e.net,.2,250000,36)
    if(!trunk)continue
    const length=len(start.path)+len(trunk)+len(end.path)
    if(e.maxLength&&length>e.maxLength+1e-6)continue
    const v1=start.via??addVia(start.point,e.net),v2=end.via??addVia(end.point,e.net)
    addTrace(e.net,e.from,`${v1}.top`,start.path,"top",.2,false,e.maxLength)
    addTrace(e.net,`${v1}.${layer}`,`${v2}.${layer}`,trunk,layer,e.width,false,e.maxLength)
    addTrace(e.net,`${v2}.top`,e.to,[...end.path].reverse(),"top",.2,false,e.maxLength)
    return {length,vias:2}
  }
  const layers=e.preferredLayers.filter(l=>l!=="inner1")
  if(search&&start&&end&&layers.length>1&&(!e.net.startsWith("USB_")||!e.net.includes("D"))) {
    const path=pathfindAcrossLayers(start.point,end.point,layers,e.width,e.net)
    if(path) {
      const length=len(start.path)+len(path)+len(end.path)
      if(e.maxLength&&length>e.maxLength+.0003)return
      const checkpoint=geometry.checkpoint(),beforeVias=new Map(viaCache),beforeAliases=new Map(aliases),beforeParents=new Map(graphParents),beforeTraces=traces.length
      try {
        const v1=start.via??registerVia(`MULTI_START_${viaCache.size}`,e.net,start.point)
        const v2=end.via??registerVia(`MULTI_END_${viaCache.size}`,e.net,end.point)
        const transitions=new Map<number,string>()
        for(let i=1;i<path.length;i++)if(path[i].layer!==path[i-1].layer) {
          if(distance(path[i],path[i-1])>1e-7)throw new Error("Unrealizable layer jump")
          transitions.set(i,registerVia(`MULTI_JOIN_${viaCache.size}`,e.net,path[i]))
        }
        for(let i=1;i<path.length;i++)if(path[i].layer===path[i-1].layer&&!geometry.clear(path[i-1],path[i],path[i].layer,e.width,e.net))throw new Error("Layer-hop path collision")
        addTrace(e.net,e.from,`${v1}.top`,start.path,"top",.2,false,e.maxLength)
        let from=`${v1}.${path[0].layer}`,section:Point[]=[path[0]],layer=path[0].layer
        for(let i=1;i<path.length;i++) {
          const q=path[i],v=transitions.get(i)
          if(v){addTrace(e.net,from,`${v}.${layer}`,section,layer,e.width,false,e.maxLength);from=`${v}.${q.layer}`;layer=q.layer;section=[q]}
          else section.push(q)
        }
        addTrace(e.net,from,`${v2}.${layer}`,section,layer,e.width,false,e.maxLength)
        addTrace(e.net,`${v2}.top`,e.to,[...end.path].reverse(),"top",.2,false,e.maxLength)
        return {length,vias:transitions.size+2,layerChanges:transitions.size}
      }catch {
        geometry.restore(checkpoint);viaCache.clear();for(const [k,v] of beforeVias)viaCache.set(k,v)
        aliases.clear();for(const [k,v] of beforeAliases)aliases.set(k,v)
        graphParents.clear();for(const [k,v] of beforeParents)graphParents.set(k,v);traces.length=beforeTraces
      }
    }
  }
}
const routed:any[]=[],pending:any[]=[],groundRouted:string[]=[],groundPending:string[]=[]
const ordered=[...edges].sort((a,b)=>a.priority-b.priority||distance(ports.get(a.from)!,ports.get(a.to)!)-distance(ports.get(b.from)!,ports.get(b.to)!))
// Critical paths precede ground escapes; ground precedes slow control fanouts.
const criticalOwners=new Set(["tec-power","fan","ground-supply","usb-routing-astra-2"])
const first=ordered.filter(e=>e.priority<=10&&criticalOwners.has(e.owner)),last=ordered.filter(e=>!first.includes(e))
// Bring each logic-supply copper component to the inner2 plane before ground
// fanouts consume the remaining local pad escape corridors.
const logicPowerPending:string[]=[]
for(const p of inventory.filter(p=>["V3V3","V1V1"].includes(p.net)).sort((a,b)=>Number(capacitorNames.has(b.component))-Number(capacitorNames.has(a.component)))) {
  if([...viaCache.values()].some(v=>v.net===p.net&&graphRoot(p.selector)===graphRoot(`${v.name}.barrel`)))continue
  const out=escape(p.selector,.2)
  if(!out){logicPowerPending.push(p.selector);continue}
  const name=out.via??addVia(out.point,p.net)
  addTrace(p.net,p.selector,`${name}.top`,out.path,"top",.2)
}
let done=0
function routeBatch(batch:typeof ordered) {
  for(const e of batch){const result=realize(e,true)
    if(result)routed.push({...e,...result});else pending.push({...e,reason:"No legal path within width, layer and length constraints in bounded search"})
    if(++done%10===0)console.log(`Routed ${routed.length}/${done} attempted edges; ${viaCache.size} full-through vias`)
  }
}
routeBatch(first)
// Reserve every ground pad's reference-plane access before control trunks.
for(const p of inventory.filter(p=>p.net==="GND")) {
  if(p.layers.includes("inner1")||[...viaCache.values()].some(v=>v.net==="GND"&&graphRoot(p.selector)===graphRoot(`${v.name}.barrel`))) {
    groundRouted.push(p.selector);continue
  }
  // Existing same-net solder lands can provide a short plane connection even
  // when an extra ordinary via cannot fit beside a fine-pitch IC pad.
  const grounded=inventory.filter(q=>q.net==="GND"&&q.selector!==p.selector&&distance(p,q)<6&&
    (q.layers.includes("inner1")||[...viaCache.values()].some(v=>v.net==="GND"&&graphRoot(q.selector)===graphRoot(`${v.name}.barrel`))))
    .sort((a,b)=>distance(p,a)-distance(p,b))
  let joined=false
  for(const q of grounded) {
    const path=simplePath(p,q,"top",.2,"GND")
    if(!path)continue
    // Keep dedicated capacitor escapes local; the independent native audit
    // measures their exposed length after subtracting the attached lands.
    if(capacitorNames.has(p.component)&&distance(p,q)>1.8)continue
    addTrace("GND",p.selector,q.selector,path,"top",.2,path.length===2,undefined,capacitorNames.has(p.component)?1:undefined)
    groundRouted.push(p.selector);joined=true;break
  }
  if(joined)continue
  let width=capacitorNames.has(p.component)?.5:.2
  let out=escape(p.selector,width)
  if(!out){width=.2;out=escape(p.selector,width)}
  if(out){const name=out.via??addVia(out.point,"GND");const span=out.path.slice(1).reduce((n,q,i)=>n+distance(out.path[i],q),0)
    addTrace("GND",p.selector,`${name}.top`,out.path,"top",width,out.path.length===2,undefined,capacitorNames.has(p.component)?1:undefined);groundRouted.push(p.selector)}
  else groundPending.push(p.selector)
}
routeBatch(last)
// A failed packet can leave a registered barrel with no useful copper. Remove
// orphan barrels and leaf stubs on nets without a plane; keep actual geometric
// contacts even when they are not named by trace endpoint metadata.
const removedStubs:any[]=[]
let pruning=true
while(pruning) {
  pruning=false
  for(const [key,v] of viaCache) {
    if(["GND","V3V3"].includes(v.net))continue
    const contacts=traces.filter(t=>t.net===v.net&&t.path.slice(1).some((b,i)=>
      pointSegmentDistance(v,t.path[i],b)<.35+t.width/2-.00001))
    if(contacts.length>1)continue
    if(contacts.length===1) {
      const t=contacts[0]
      // Only delete an actual terminal stub, never a barrel intersecting the
      // interior of an otherwise useful two-port trace.
      if(![t.from,t.to].some(s=>s.startsWith(v.name+".")))continue
      traces.splice(traces.indexOf(t),1);removedStubs.push({via:v.name,trace:t.name,net:v.net})
    }else removedStubs.push({via:v.name,net:v.net})
    viaCache.delete(key);pruning=true
  }
}
for(const stage of reservationStages) {
  const oldStart=stage.traceStart,oldEnd=stage.traceEnd
  stage.traceStart=traces.filter(t=>Number(t.name.replace("RB_TRACE_",""))<=oldStart).length
  stage.traceEnd=traces.filter(t=>Number(t.name.replace("RB_TRACE_",""))<=oldEnd).length
  stage.viaNames=stage.viaNames.filter(n=>[...viaCache.values()].some(v=>v.name===n))
}
const report={status:pending.length||groundPending.length?"routing-in-progress":"prototype-routed",
  baselineSha256:createHash("sha256").update(baselineText).digest("hex"),agents:10,astraAgents:3,
  planCount:routingPlans.length,netCount:owners.size,plannedEdges:edges.length,routedEdges:routed.length,pendingEdges:pending.length,
  physicalTraceCount:traces.length,throughViaCount:viaCache.size,groundPorts:inventory.filter(p=>p.net==="GND").length,
  groundPortsReachingInner1:groundRouted.length,groundEscapedSelectors:groundRouted,groundPlaneConnectivityVerified:false,
  groundPendingPorts:groundPending,routeLengthMm:routed.reduce((n,e)=>n+e.length,0),
  manufacturingAccepted:false,usbImpedanceQualified:false,kelvinSeparationQualified:false,
  logicPowerPending,removedStubs,reservationStages,fixedRejected,routed,pending,notes:routingPlans.map(p=>({owner:p.owner,nets:p.nets,notes:p.notes}))}
await mkdir("review/routing",{recursive:true})
await Bun.write("src/board/routing/generated.json",JSON.stringify({vias:[...viaCache.values()],traces},null,2)+"\n")
await Bun.write("review/routing/routing-report.json",JSON.stringify(report,null,2)+"\n")
console.log(JSON.stringify({routedEdges:report.routedEdges,pendingEdges:report.pendingEdges,traces:traces.length,vias:viaCache.size,groundEscaped:groundRouted.length,groundPending:groundPending.length}))
