import { createHash } from "node:crypto"
import { mkdir } from "node:fs/promises"
import { difference as floatingDifference, intersection as floatingIntersection, type MultiPolygon, type Pair, type Polygon } from "polygon-clipping"
import ClipperLib from "clipper-lib"

type Point = { x: number; y: number }
type Bounds = { left: number; right: number; bottom: number; top: number }
type Copper = { id: string; elementId: string; kind: string; layer: string; net?: string;
  portId?: string; barrel?: string; shape: MultiPolygon; bounds: Bounds; areaMm2: number }
const arcSteps = 128, minimumContactAreaMm2 = 1e-6
const allLayers = ["top", "inner1", "inner2", "bottom"]
let integerFallbackCount = 0
// Floating sweep-line clipping can fail for coincident circular vertices.
// Integer fallback resolves those cases on a 1e-8 mm grid; contact threshold is
// substantially larger than quantization-induced slivers in this board.
function integerBoolean(a: MultiPolygon, b: MultiPolygon, subtract: boolean): MultiPolygon {
  integerFallbackCount++
  const scale = 1e8
  const paths = (shape: MultiPolygon) => shape.flatMap(polygon => polygon.map((ring, i) => {
    const path = ring.map(([x, y]) => ({ X: Math.round(x * scale), Y: Math.round(y * scale) }))
    if (ClipperLib.Clipper.Orientation(path) !== (i === 0)) path.reverse()
    return path
  }))
  const clipper = new ClipperLib.Clipper(), tree = new ClipperLib.PolyTree()
  clipper.AddPaths(paths(a), ClipperLib.PolyType.ptSubject, true)
  clipper.AddPaths(paths(b), ClipperLib.PolyType.ptClip, true)
  clipper.Execute(subtract ? ClipperLib.ClipType.ctDifference : ClipperLib.ClipType.ctIntersection, tree,
    ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero)
  return ClipperLib.JS.PolyTreeToExPolygons(tree).map(p => [p.outer, ...p.holes].map(r => r.map(q => [q.X / scale, q.Y / scale] as Pair)))
}
function difference(a: MultiPolygon, b: Polygon): MultiPolygon {
  try { return floatingDifference(a, b) } catch { return integerBoolean(a, [b], true) }
}
function intersection(a: MultiPolygon, b: MultiPolygon): MultiPolygon {
  try { return floatingIntersection(a, b) } catch { return integerBoolean(a, b, false) }
}
function area(shape: MultiPolygon): number {
  return shape.reduce((sum, polygon) => sum + polygon.reduce((part, ring, i) => part + (i ? -1 : 1)
    * Math.abs(ring.reduce((s, p, j) => { const q = ring[(j + 1) % ring.length]; return s + p[0] * q[1] - q[0] * p[1] }, 0)) / 2, 0), 0)
}
function bounds(shape: MultiPolygon): Bounds {
  const points = shape.flat(2)
  return { left: Math.min(...points.map(p => p[0])), right: Math.max(...points.map(p => p[0])),
    bottom: Math.min(...points.map(p => p[1])), top: Math.max(...points.map(p => p[1])) }
}
function overlaps(a: Bounds, b: Bounds) {
  return a.left < b.right && a.right > b.left && a.bottom < b.top && a.top > b.bottom
}
// Inscribed copper, circumscribed drill: positive contact is conservative.
function capsule(a: Point, b: Point, radius: number, drill = false): Polygon {
  if (drill) radius /= Math.cos(Math.PI / arcSteps)
  const angle = Math.atan2(b.y - a.y, b.x - a.x), ring: Pair[] = []
  for (const [center, offset] of [[b, -Math.PI / 2], [a, Math.PI / 2]] as const)
    for (let i = 0; i <= arcSteps / 2; i++) {
      const theta = angle + offset + i * 2 * Math.PI / arcSteps
      ring.push([center.x + radius * Math.cos(theta), center.y + radius * Math.sin(theta)])
    }
  return [ring]
}
function pill(p: Point, width: number, height: number, rotation = 0, drill = false): Polygon {
  const half = Math.abs(width - height) / 2, theta = (rotation + (height > width ? 90 : 0)) * Math.PI / 180
  const dx = half * Math.cos(theta), dy = half * Math.sin(theta)
  return capsule({ x: p.x - dx, y: p.y - dy }, { x: p.x + dx, y: p.y + dy }, Math.min(width, height) / 2, drill)
}
function roundedRect(p: any): Polygon {
  const r = Math.min(p.corner_radius ?? 0, p.width / 2, p.height / 2), ring: Pair[] = []
  const theta = (p.ccw_rotation ?? p.rotation ?? 0) * Math.PI / 180
  const transform = (x: number, y: number): Pair => [p.x + x * Math.cos(theta) - y * Math.sin(theta), p.y + x * Math.sin(theta) + y * Math.cos(theta)]
  if (r <= 0) return [[transform(-p.width / 2, -p.height / 2), transform(p.width / 2, -p.height / 2),
    transform(p.width / 2, p.height / 2), transform(-p.width / 2, p.height / 2)]]
  for (let corner = 0; corner < 4; corner++) {
    const sx = corner === 0 || corner === 3 ? 1 : -1, sy = corner < 2 ? 1 : -1
    for (let i = 0; i <= arcSteps / 4; i++) {
      const a = corner * Math.PI / 2 + i * 2 * Math.PI / arcSteps
      ring.push(transform(sx * (p.width / 2 - r) + r * Math.cos(a), sy * (p.height / 2 - r) + r * Math.sin(a)))
    }
  }
  return [ring]
}

// Variable-width wire copper is the convex hull of its endpoint disks.
// Constant width reduces to a round-ended capsule; drill subtraction happens later.
function sweptWire(a:any,b:any):Polygon {
  const ar=(a.end_width??a.width)/2, br=(b.start_width??b.width)/2
  const ps:Pair[]=[]
  for(const [p,r] of [[a,ar],[b,br]] as const)for(let i=0;i<arcSteps;i++)ps.push([p.x+r*Math.cos(i*2*Math.PI/arcSteps),p.y+r*Math.sin(i*2*Math.PI/arcSteps)])
  ps.sort((p,q)=>p[0]-q[0]||p[1]-q[1])
  const cross=(a:Pair,b:Pair,c:Pair)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
  const half=(list:Pair[])=>{const r:Pair[]=[];for(const p of list){while(r.length>1&&cross(r[r.length-2],r[r.length-1],p)<=0)r.pop();r.push(p)}return r}
  const lo=half(ps),hi=half([...ps].reverse());return [[...lo.slice(0,-1),...hi.slice(0,-1)]]
}

/** Dedicated Kelvin independence and parallel-power-array physical audit. */
export function auditKelvinRouting(circuit:any[],generated:any,packet:any) {
  const netsByKey = new Map(circuit.filter(e => e.type === "source_net").map(e => [e.subcircuit_connectivity_map_key, e.name]))
  const netsById = new Map(circuit.filter(e => e.type === "source_net").map(e => [e.source_net_id, e.name]))
  const sourcePorts = new Map(circuit.filter(e => e.type === "source_port").map(e => [e.source_port_id, e]))
  const sourceComponents = new Map(circuit.filter(e => e.type === "source_component").map(e => [e.source_component_id, e]))
  const sourceTraces = new Map(circuit.filter(e => e.type === "source_trace").map(e => [e.source_trace_id, e]))
  const pcbPorts = new Map(circuit.filter(e => e.type === "pcb_port").map(e => [e.pcb_port_id, e]))
  const portNet = (id: string) => netsByKey.get(sourcePorts.get(pcbPorts.get(id)?.source_port_id)?.subcircuit_connectivity_map_key)
  const elementNet = (e: any): string | undefined => netsById.get(e.source_net_id)
    ?? netsByKey.get(e.subcircuit_connectivity_map_key)
    ?? netsByKey.get(sourceTraces.get(e.source_trace_id)?.subcircuit_connectivity_map_key)
    ?? portNet(e.pcb_port_id)
  const selector = (id: string) => { const s = sourcePorts.get(pcbPorts.get(id)?.source_port_id)
    return s ? `${sourceComponents.get(s.source_component_id)?.name}.pin${s.pin_number}` : id }
  const unsupported: any[] = [], nodes: Copper[] = [], edges: string[][] = []
  const drills: { polygon: Polygon; bounds: Bounds }[] = []
  for (const e of circuit) {
    let polygon: Polygon | undefined
    if (e.type === "pcb_via" || ((e.type === "pcb_hole" || e.type === "pcb_plated_hole") && (e.shape ?? e.hole_shape) === "circle"))
      polygon = capsule(e, e, (e.hole_diameter ?? e.diameter) / 2, true)
    else if ((e.type === "pcb_plated_hole" || e.type === "pcb_hole") && (e.shape ?? e.hole_shape) === "pill")
      polygon = pill(e, e.hole_width, e.hole_height, e.ccw_rotation ?? 0, true)
    else if (e.type === "pcb_hole" || e.type === "pcb_plated_hole") unsupported.push({ type: e.type, shape: e.shape ?? e.hole_shape, reason: "Unsupported drill geometry" })
    if (polygon) drills.push({ polygon, bounds: bounds([polygon]) })
  }
  function add(e: any, elementId: string, layer: string, initial: MultiPolygon, suffix: string, barrel?: string) {
    let shape = initial
    const initialBounds = bounds(initial)
    for (const drill of drills) if (overlaps(initialBounds, drill.bounds)) shape = difference(shape, drill.polygon)
    // Difference can split an object: split pieces must never be joined by its ID.
    for (const [piece, polygon] of shape.entries()) {
      const copper: MultiPolygon = [polygon], size = area(copper)
      if (size <= minimumContactAreaMm2) continue
      const id = `${elementId}:${layer}:${suffix}:${piece}`
      nodes.push({ id, elementId, kind: e.type, layer, net: elementNet(e), portId: e.pcb_port_id,
        barrel, shape: copper, bounds: bounds(copper), areaMm2: size })
      edges.push([id])
    }
  }
  for (const e of circuit) {
    if (e.type === "pcb_smtpad") {
      let shape: MultiPolygon | undefined
      if (e.shape === "polygon") shape = [[e.points.map((p: Point): Pair => [p.x, p.y])]]
      else if (e.shape === "rect") shape = [roundedRect(e)]
      else if (e.shape === "circle") shape = [capsule(e, e, e.radius)]
      if (shape) add(e, e.pcb_smtpad_id, e.layer, shape, "pad")
      else unsupported.push({ id: e.pcb_smtpad_id, shape: e.shape })
    } else if (e.type === "pcb_via" || e.type === "pcb_plated_hole") {
      const id = e.pcb_via_id ?? e.pcb_plated_hole_id
      let shape: MultiPolygon | undefined
      if (e.type === "pcb_via" || e.shape === "circle") shape = [capsule(e, e, e.outer_diameter / 2)]
      else if (e.shape === "pill") shape = [pill(e, e.outer_width, e.outer_height, e.ccw_rotation ?? 0)]
      if (shape) for (const layer of e.layers ?? allLayers) add(e, id, layer, shape, "annulus", id)
      else unsupported.push({ id, shape: e.shape })
    } else if (e.type === "pcb_copper_pour") {
      if (e.shape !== "brep") { unsupported.push({ id: e.pcb_copper_pour_id, shape: e.shape }); continue }
      const ring = (r: any): Pair[] => r.vertices.map((p: Point) => [p.x, p.y])
      add(e, e.pcb_copper_pour_id, e.layer, [[ring(e.brep_shape.outer_ring), ...(e.brep_shape.inner_rings ?? []).map(ring)]], "pour")
    } else if (e.type === "pcb_trace") {
      for (let i = 1; i < e.route.length; i++) {
        const a = e.route[i - 1], b = e.route[i]
        if (a.route_type !== "wire" || b.route_type !== "wire") { unsupported.push({ id: e.pcb_trace_id, segment: i, reason: "Non-wire route requires explicit via/arc primitive" }); continue }
        if (a.layer !== b.layer) { unsupported.push({ id: e.pcb_trace_id, segment: i, reason: "Wire changes layer without barrel" }); continue }
        const width = Math.min(a.width, b.width, a.start_width ?? a.width, a.end_width ?? a.width, b.start_width ?? b.width, b.end_width ?? b.width)
        if (!(Number.isFinite(width) && width > 0)) { unsupported.push({ id: e.pcb_trace_id, segment: i, reason: "Invalid copper width" }); continue }
        add(e, e.pcb_trace_id, a.layer, [sweptWire(a, b)], `segment${i}`)
      }
    }
  }
  const planned=packet.shuntKelvin
  const failures:any[]=[],matches:any[]=[],violations:any[]=[],viaMatches:any[]=[]
  if(!planned?.paths?.length)failures.push({reason:"No shuntKelvin packet present"})
  const generatedByName=new Map<string,any>((generated.traces??[]).map((t:any)=>[t.name,t]))
  const nativeTraces=circuit.filter(e=>e.type==="pcb_trace")
  const nativeByName=new Map(nativeTraces.map(t=>[sourceTraces.get(t.source_trace_id)?.name,t]))
  const canonical=(ps:any[])=>ps.filter((p,i)=>!i||Math.hypot(p.x-ps[i-1].x,p.y-ps[i-1].y)>1e-7)
  const samePath=(a:any[],b:any[])=>{a=canonical(a);b=canonical(b);return a.length===b.length&&a.every((p,i)=>Math.hypot(p.x-b[i].x,p.y-b[i].y)<.0003)}
  const nodeBranch=new Map<string,string>(),branchTraceIds=new Map<string,string[]>(),branchViaIds=new Map<string,string[]>()
  const actualBranches:any[]=[]
  for(const b of planned?.branches??[]) {
    const branch=b.to.split(".")[0], traceIds:string[]=[],viaIds:string[]=[]
    let actualLengthMm=0
    for(const id of b.pathIds){const p=planned.paths.find((q:any)=>q.id===id)
      const candidates=nativeTraces.filter(t=>elementNet(t)===p.net&&t.route.every((r:any)=>r.route_type==="wire"&&r.layer===p.layer)
        &&(samePath(t.route,p.points)||samePath([...t.route].reverse(),p.points)))
      if(candidates.length!==1){failures.push({branch,pathId:id,reason:"Expected exactly one actual native path matching packet",matches:candidates.map(t=>t.pcb_trace_id)});continue}
      const t=candidates[0],name=sourceTraces.get(t.source_trace_id)?.name,g=generatedByName.get(name)
      traceIds.push(t.pcb_trace_id);for(const n of nodes.filter(n=>n.elementId===t.pcb_trace_id))nodeBranch.set(n.id,branch)
      const points=canonical(t.route);actualLengthMm+=points.slice(1).reduce((sum:number,q:any,i:number)=>sum+Math.hypot(q.x-points[i].x,q.y-points[i].y),0)
      const widths=t.route.map((r:any)=>r.width)
      if(widths.some((w:number)=>Math.abs(w-p.width)>.0003))failures.push({branch,pathId:id,reason:"Native width differs from Kelvin intent",widths,expected:p.width})
      matches.push({branch,pathId:id,pcbTraceId:t.pcb_trace_id,name,generatedEndpoints:g?{from:g.from,to:g.to}:undefined,layer:p.layer,widths})
    }
    for(const name of b.viaNames){const p=planned.vias.find((v:any)=>v.name===name)
      const vs=circuit.filter(v=>v.type==="pcb_via"&&elementNet(v)===p.net&&Math.hypot(v.x-p.x,v.y-p.y)<.0003)
      if(vs.length!==1){failures.push({branch,viaName:name,reason:"Expected exactly one actual Kelvin barrel",matches:vs.map(v=>v.pcb_via_id)});continue}
      const v=vs[0];viaIds.push(v.pcb_via_id);for(const n of nodes.filter(n=>n.elementId===v.pcb_via_id))nodeBranch.set(n.id,branch)
      viaMatches.push({branch,viaName:name,pcbViaId:v.pcb_via_id,x:v.x,y:v.y,layers:v.layers})
      if(v.outer_diameter+.0003<(planned.viaOuterDiameter??.7)||v.hole_diameter>(planned.viaHoleDiameter??.3)+.0003)failures.push({branch,viaName:name,reason:"Unexpected Kelvin barrel dimensions"})
    }
    branchTraceIds.set(branch,traceIds);branchViaIds.set(branch,viaIds)
    actualBranches.push({branch,from:b.from,to:b.to,nativePathCount:traceIds.length,nativeViaCount:viaIds.length,actualLengthMm,plannedLengthMm:b.totalLengthMm,sourceEscapeLengthMm:b.sourceEscapeLengthMm})
  }
  const shuntPads=nodes.filter(n=>n.kind==="pcb_smtpad"&&n.portId&&["R20.pin1","R20.pin2"].includes(selector(n.portId)))
  const describe=(n:Copper)=>{const t=n.kind==="pcb_trace"?circuit.find(e=>e.pcb_trace_id===n.elementId):undefined
    const name=t?sourceTraces.get(t.source_trace_id)?.name:undefined,g=name?generatedByName.get(name):undefined
    return {nodeId:n.id,elementId:n.elementId,kind:n.kind,net:n.net,layer:n.layer,branch:nodeBranch.get(n.id),traceName:name,
      generatedEndpoints:g?{from:g.from,to:g.to}:undefined,selector:n.portId?selector(n.portId):undefined}}
  const seen=new Set<string>()
  for(const a of nodes.filter(n=>nodeBranch.has(n.id)))for(const b of nodes){
    const branch=nodeBranch.get(a.id)!,otherBranch=nodeBranch.get(b.id)
    if(a.id===b.id||branch===otherBranch||a.layer!==b.layer||!overlaps(a.bounds,b.bounds))continue
    const key=[a.id,b.id].sort().join("|");if(seen.has(key))continue;seen.add(key)
    const branchInfo=planned.branches.find((q:any)=>q.to.split(".")[0]===branch)
    // The assigned filter input solder land is the legitimate end of this branch.
    if(b.kind==="pcb_smtpad"&&b.portId&&selector(b.portId)===branchInfo.to&&a.net===b.net)continue
    let contact=intersection(a.shape,b.shape);const before=area(contact)
    if(before<=minimumContactAreaMm2)continue
    if(a.net===b.net)for(const pad of shuntPads.filter(p=>p.layer===a.layer&&p.net===a.net))for(const poly of pad.shape)contact=difference(contact,poly)
    const outside=area(contact);if(outside<=minimumContactAreaMm2)continue
    violations.push({reason:a.net!==b.net?"Foreign-net copper intersects Kelvin copper":"Load, auxiliary, or other Kelvin branch shares copper outside actual shunt solder land",
      kelvin:describe(a),other:describe(b),contactAreaMm2:before,outsideAllowedShuntLandAreaMm2:outside,intersectionPolygons:contact})
  }
  // Check actual annular copper reaches the assigned head and trunk/tail, not just labels.
  const kelvinBarrelContacts=viaMatches.map(v=>{
    const own=new Set(branchTraceIds.get(v.branch)),annuli=nodes.filter(n=>n.elementId===v.pcbViaId)
    const contacts=annuli.flatMap(a=>nodes.filter(n=>own.has(n.elementId)&&n.layer===a.layer&&overlaps(a.bounds,n.bounds))
      .map(n=>({layer:a.layer,pcbTraceId:n.elementId,areaMm2:area(intersection(a.shape,n.shape))}))).filter(c=>c.areaMm2>minimumContactAreaMm2)
    const layers=[...new Set(contacts.map(c=>c.layer))],passed=layers.includes("top")&&layers.some(l=>l!=="top")
    if(!passed)failures.push({reason:"Kelvin barrel lacks physical contact on top and intended trunk layer",...v,contacts})
    return {...v,passed,contacts}
  })
  const branchContinuity=(planned?.branches??[]).map((b:any)=>{
    const branch=b.to.split(".")[0],members=nodes.filter(n=>nodeBranch.get(n.id)===branch||n.portId&&[b.from,b.to].includes(selector(n.portId)))
    const starts=members.filter(n=>n.portId&&selector(n.portId)===b.from),ends=members.filter(n=>n.portId&&selector(n.portId)===b.to)
    const visited=new Set(starts.map(n=>n.id)),queue=[...starts]
    for(let i=0;i<queue.length;i++)for(const n of members){const a=queue[i]
      if(visited.has(n.id))continue
      const barrel=a.barrel&&a.barrel===n.barrel
      if(barrel||a.layer===n.layer&&overlaps(a.bounds,n.bounds)&&area(intersection(a.shape,n.shape))>minimumContactAreaMm2){visited.add(n.id);queue.push(n)}
    }
    const passed=starts.length>0&&ends.some(n=>visited.has(n.id))&&members.filter(n=>nodeBranch.get(n.id)===branch).every(n=>visited.has(n.id))
    if(!passed)failures.push({reason:"Kelvin branch fails finite copper continuity using only its own copper and endpoint lands",branch,disconnectedNodeIds:members.filter(n=>!visited.has(n.id)).map(n=>n.id)})
    return {branch,passed,startPadPieces:starts.length,endPadPieces:ends.length,connectedOwnCopperPieces:queue.length}
  })
  // Same-layer physical graph: no net labels, endpoint metadata, or barrel links
  // create connectivity. Bottom support must reach an external barrel or pad.
  const adjacent=new Map<string,Copper[]>()
  function neighbors(a:Copper){let r=adjacent.get(a.id);if(r)return r;r=nodes.filter(b=>a.id!==b.id&&a.layer===b.layer&&a.net===b.net&&overlaps(a.bounds,b.bounds)
    &&area(intersection(a.shape,b.shape))>minimumContactAreaMm2);adjacent.set(a.id,r);return r}
  function reachable(starts:Copper[]){const visited=new Set(starts.map(n=>n.id)),queue=[...starts];for(let i=0;i<queue.length;i++)for(const b of neighbors(queue[i]))if(!visited.has(b.id)){visited.add(b.id);queue.push(b)}return queue}
  const arrays=(packet.viaArrays??[]).filter((a:any)=>(a.points??[]).length>1).map((a:any)=>{
    const members=(a.points??[]).map((p:any,index:number)=>{const vs=circuit.filter(v=>v.type==="pcb_via"&&elementNet(v)===a.net&&Math.hypot(v.x-p.x,v.y-p.y)<.0003);return {index:index+1,point:p,native:vs.length===1?vs[0]:undefined,matches:vs.map(v=>v.pcb_via_id)}})
    const ownIds=new Set<string>(members.filter((m:any)=>m.native).map((m:any)=>m.native.pcb_via_id))
    const checks=members.map((m:any)=>{if(!m.native)return {...m,passed:false,reason:"Array member missing or duplicated"}
      const sides=["top","bottom"].map(layer=>{const annuli=nodes.filter(n=>n.elementId===m.native.pcb_via_id&&n.layer===layer),connected=reachable(annuli)
        const realPads=connected.filter(n=>(n.kind==="pcb_smtpad"||n.kind==="pcb_plated_hole")&&n.portId)
        const externalBarrels=connected.filter(n=>n.kind==="pcb_via"&&!ownIds.has(n.elementId))
        const directCopper=annuli.flatMap(neighbors).filter(n=>n.kind==="pcb_trace"||n.kind==="pcb_copper_pour")
        return {layer,passed:directCopper.length>0&&(layer==="top"?realPads.length>0:realPads.length>0||externalBarrels.length>0),
          directContacts:[...new Set(directCopper.map(n=>n.elementId))],reachedPadSelectors:[...new Set(realPads.map(n=>selector(n.portId!)))],reachedExternalBarrels:[...new Set(externalBarrels.map(n=>n.elementId))]}
      });return {index:m.index,point:m.point,pcbViaId:m.native.pcb_via_id,passed:sides.every(s=>s.passed),sides}
    });return {id:a.id??a.name,net:a.net,passed:checks.every((m:any)=>m.passed),members:checks}
  })
  return {passed:!unsupported.length&&!failures.length&&!violations.length&&arrays.every((a:any)=>a.passed),
    method:"Actual native finite swept-width copper and drilled via annuli; all physical drill voids subtracted; shunt-sharing exception clipped to exact native R20 pad outline; no endpoint-label connectivity shortcuts",
    approximation:"128-segment inscribed round copper, circumscribed drills; intersection areas <=1e-6 mm2 ignored as numerical slivers",minimumContactAreaMm2,
    missingOrInvalid:failures,unsupported,matches,kelvinBarrelContacts,branchContinuity,independenceViolations:violations,actualBranches,
    pairMetrics:{planned:planned?.pairMetrics,actualControllerSkewMm:Math.abs((actualBranches.find(b=>b.branch==="R25")?.actualLengthMm??0)-(actualBranches.find(b=>b.branch==="R26")?.actualLengthMm??0)),
      actualMonitorSkewMm:Math.abs((actualBranches.find(b=>b.branch==="R41")?.actualLengthMm??0)-(actualBranches.find(b=>b.branch==="R42")?.actualLengthMm??0))},powerArrays:arrays,
    scope:"Verifies independent physical sense paths and both-side array participation, not current sharing equality, ampacity, thermal rise, EMI, or fabrication qualification"}
}

if(import.meta.main){
  const input=process.argv[2]??"dist/routed/circuit.json",output=process.argv[3]??"review/routing/kelvin-routing-audit.json"
  const circuitText=await Bun.file(input).text(),generated=await Bun.file("src/board/routing/generated.json").json(),packet=await Bun.file("src/board/routing/power-completion.json").json()
  const report=auditKelvinRouting(JSON.parse(circuitText),generated,packet)
  await mkdir(output.slice(0,output.lastIndexOf("/"))||".",{recursive:true})
  await Bun.write(output,JSON.stringify({input,circuitSha256:createHash("sha256").update(circuitText).digest("hex"),...report},null,2)+"\n")
  console.log(JSON.stringify({passed:report.passed,matchedPaths:report.matches.length,invalid:report.missingOrInvalid.length,independenceViolations:report.independenceViolations.length,
    failedArrays:report.powerArrays.filter((a:any)=>!a.passed).map((a:any)=>a.id),output},null,2))
  if(!report.passed)process.exitCode=1
}
