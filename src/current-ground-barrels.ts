import type {CircuitJson,PcbTrace,PcbVia} from "circuit-json"
import type {SimpleRouteJson,Obstacle} from "@tscircuit/capacity-autorouter"
import type {AutoroutingStartEvent} from "@tscircuit/core"
import {getFullConnectivityMapFromCircuitJson} from "circuit-json-to-connectivity-map"
import {captureInitialCopper,verifyPreservedManualCopper} from "../scripts/preserved-manual-copper"

export type GuardedCurrentBarrelProof={circuitJson:CircuitJson;initialCircuitJson:CircuitJson;
  materializedGroundCircuitJson:CircuitJson;materializedInitialCircuitJson:CircuitJson;
  completedGroundOutput:AutoroutingStartEvent["simpleRouteJson"];originalInput:AutoroutingStartEvent["simpleRouteJson"];sourceSha256:string;runtimeSha256:string;runId:string}
export type CurrentBarrelCover={barrelId:string;traceId:string;sourceTraceId:string;originPortId:string;sourceNetId:string;
  x:number;y:number;holeDiameter:number;outerDiameter:number;layers:PcbVia["layers"];
  originalObstacleIndex:number;originalObstacleLayers:Obstacle["layers"];obstacleId:string;connectedTo:string[];runId:string}
let currentProof:GuardedCurrentBarrelProof|undefined
export const setGuardedCurrentBarrelProof=(proof:GuardedCurrentBarrelProof)=>{currentProof=structuredClone(proof)}
const requireProof=(condition:unknown,message:string)=>{if(!condition)throw new Error(message)}
const physicalRoute=(trace:{route:PcbTrace["route"]|NonNullable<AutoroutingStartEvent["simpleRouteJson"]["traces"]>[number]["route"]})=>trace.route.map(point=>{
  if(point.route_type==="wire")return {route_type:point.route_type,x:point.x,y:point.y,width:point.width,layer:point.layer}
  if(point.route_type==="via")return {route_type:point.route_type,x:point.x,y:point.y,from_layer:point.from_layer,to_layer:point.to_layer,
    via_diameter:"via_diameter" in point?point.via_diameter:undefined,via_hole_diameter:"via_hole_diameter" in point?point.via_hole_diameter:undefined}
  throw new Error("Current adopted Ground paths require explicit constant-width wire/via points")
})

export function coverCurrentGroundBarrels({originalInput,adaptedInput,sourceSha256,runtimeSha256}:{
  originalInput:SimpleRouteJson;adaptedInput:SimpleRouteJson;sourceSha256?:string;runtimeSha256?:string
}){
  const proof=currentProof
  requireProof(proof,"Full-barrel guards require truthful live and public materialized source captures")
  if(!proof)throw new Error("Current full-barrel proof absent")
  requireProof(JSON.stringify(proof.originalInput)===JSON.stringify(originalInput)
    &&proof.sourceSha256===sourceSha256&&proof.runtimeSha256===runtimeSha256,"Current barrel proof does not match the live input/source/runtime")
  requireProof(originalInput.layerCount===4&&!originalInput.allowBlindAndBuriedVias,"Current Ground barrel guards require an ordinary four-layer board")
  const initial=proof.initialCircuitJson,current=proof.materializedGroundCircuitJson
  // Core holds completed phase copper outside circuit.db until all phases end.
  // Bind the truthful live db to the source baseline, then authenticate the
  // separately materialized public Ground0 source. Never splice them together.
  const baseline=captureInitialCopper(initial)
  for(const snapshot of [proof.circuitJson,proof.materializedInitialCircuitJson]){
    requireProof(snapshot.filter(e=>e.type==="pcb_trace").length===baseline.traces.length
      &&snapshot.filter(e=>e.type==="pcb_via").length===baseline.vias.length,"Live/materialized initial source census changed")
    for(const before of initial){
      if(!before.type.startsWith("source_")&&!["pcb_board","pcb_group","pcb_component","pcb_port","pcb_smtpad","pcb_plated_hole","pcb_hole","pcb_trace","pcb_via"].includes(before.type))continue
      const key=`${before.type}_id`,id=(before as unknown as Record<string,unknown>)[key]
      const matches=snapshot.filter(e=>e.type===before.type&&(e as unknown as Record<string,unknown>)[key]===id)
      const compared=matches.map(actual=>{
        if(before.type==="pcb_component"&&before.supplier_pin1_location_map===undefined&&actual.type==="pcb_component"){
          const {supplier_pin1_location_map,...unchanged}=actual
          return unchanged
        }
        return actual
      })
      requireProof(JSON.stringify(compared)===JSON.stringify([before]),"Live/materialized initial SOURCE/copper/owner differs")
    }
  }
  const retention=verifyPreservedManualCopper({initialCopper:baseline,circuitJson:current,publicSourceMaterialization:true})
  requireProof(retention.pass,`Public materialized original source copper differs: ${retention.errors[0]}`)
  const traces=current.filter((e):e is PcbTrace=>e.type==="pcb_trace")
  const vias=current.filter((e):e is PcbVia=>e.type==="pcb_via")
  requireProof(new Set(traces.map(t=>t.pcb_trace_id)).size===traces.length
    &&new Set(vias.map(v=>v.pcb_via_id)).size===vias.length,"Current trace/barrel identities are not unique")
  const initialIds=new Set(initial.filter(e=>e.type==="pcb_trace").map(e=>e.pcb_trace_id))
  const groundPaths=(proof.completedGroundOutput.traces??[]).filter(t=>!initialIds.has(t.pcb_trace_id))
  requireProof(groundPaths.length===90&&proof.completedGroundOutput.connections.length===0,"Completed public adopted Ground delta differs")
  requireProof(traces.length===baseline.traces.length+groundPaths.length&&vias.length===baseline.vias.length+groundPaths.length,
    "Public materialized Ground source has missing or extra copper")
  const ground=initial.find(e=>e.type==="source_net"&&e.name==="GND")
  if(ground?.type!=="source_net")throw new Error("Actual source GND declaration missing")
  const sourceGraph=getFullConnectivityMapFromCircuitJson(initial.filter(e=>e.type.startsWith("source_")))
  const actualSource=(type:string,id:string)=>current.filter(e=>e.type===type&&(e as unknown as Record<string,unknown>)[`${type}_id`]===id)
  for(const before of initial.filter(e=>e.type.startsWith("source_"))){
    const id=(before as unknown as Record<string,string>)[`${before.type}_id`]
    requireProof(JSON.stringify(actualSource(before.type,id))===JSON.stringify([before]),"Current original SOURCE definition/owner changed")
  }
  requireProof(actualSource("source_net",ground.source_net_id).length===1
    &&JSON.stringify(actualSource("source_net",ground.source_net_id)[0])===JSON.stringify(ground),"Current SOURCE GND owner changed")
  const allLayers=["top","inner1","inner2","bottom"] as const
  const obstacles:Obstacle[]=[],covers:CurrentBarrelCover[]=[]
  for(const completed of groundPaths){
    const path=traces.find(t=>t.pcb_trace_id===completed.pcb_trace_id)
    const declaration=initial.find(e=>e.type==="source_trace"&&e.source_trace_id===completed.connection_name)
    if(!path||declaration?.type!=="source_trace")throw new Error("Current Ground path lacks its real original SOURCE trace")
    requireProof(path.source_trace_id===declaration.source_trace_id
      &&declaration.connected_source_net_ids.includes(ground.source_net_id)
      &&JSON.stringify(actualSource("source_trace",declaration.source_trace_id))===JSON.stringify([declaration])
      &&JSON.stringify(physicalRoute(path))===JSON.stringify(physicalRoute(completed)),"Current Ground geometry or SOURCE ownership changed")
    const originalPorts=initial.filter(e=>e.type==="pcb_port"&&completed.connectsTo?.includes(e.pcb_port_id))
    requireProof(originalPorts.length===1,"Adopted Ground origin is not one genuine real port")
    const originalPort=originalPorts[0]
    if(originalPort?.type!=="pcb_port")throw new Error("Actual Ground origin absent")
    const actualPorts=actualSource("pcb_port",originalPort.pcb_port_id)
    const head=path.route[0]
    const connectsTo="connectsTo" in path&&Array.isArray(path.connectsTo)?path.connectsTo:[]
    requireProof(actualPorts.length===1&&JSON.stringify(actualPorts[0])===JSON.stringify(originalPort)
      &&declaration.connected_source_port_ids.includes(originalPort.source_port_id)
      &&connectsTo.includes(originalPort.pcb_port_id)&&head?.route_type==="wire"
      &&head.x===originalPort.x&&head.y===originalPort.y&&originalPort.layers.includes(head.layer),"Current Ground origin/layer/source port changed")
    for(const land of initial.filter(e=>(e.type==="pcb_smtpad"||e.type==="pcb_plated_hole")&&e.pcb_port_id===originalPort.pcb_port_id)){
      const id=(land as unknown as Record<string,string>)[`${land.type}_id`]
      requireProof(JSON.stringify(actualSource(land.type,id))===JSON.stringify([land]),"Current actual owning Ground copper land changed")
    }
    for(const point of path.route)if(point.route_type==="wire")
      requireProof(Number.isFinite(point.width)&&point.width>=Math.max(originalInput.minTraceWidth,declaration.min_trace_thickness??0),"Current Ground wire violates its true source minimum")
    const transitions=completed.route.filter(point=>point.route_type==="via")
    requireProof(transitions.length===1,"Adopted Ground path no longer has one ordinary barrel")
    const transition=transitions[0]!
    const barrels=vias.filter(v=>v.pcb_trace_id===path.pcb_trace_id&&v.x===transition.x&&v.y===transition.y)
    requireProof(barrels.length===1,"Current Ground barrel lacks unique actual path ownership")
    const barrel=barrels[0]!
    requireProof((barrel.source_net_id===undefined||barrel.source_net_id===ground.source_net_id)
      &&barrel.hole_diameter===transition.via_hole_diameter&&barrel.outer_diameter===transition.via_diameter
      &&barrel.hole_diameter===.30&&barrel.outer_diameter===.70&&barrel.layers.length===4
      &&new Set(barrel.layers).size===4&&allLayers.every(layer=>barrel.layers.includes(layer))
      &&barrel.subcircuit_connectivity_map_key===declaration.subcircuit_connectivity_map_key
      &&barrel.subcircuit_connectivity_map_key===ground.subcircuit_connectivity_map_key,"Current Ground barrel diameter/span/SOURCE net changed")
    const aliases=originalInput.obstacles.filter(o=>o.center.x===barrel.x&&o.center.y===barrel.y
      &&o.width>=barrel.outer_diameter&&o.height>=barrel.outer_diameter
      &&o.connectedTo.includes(declaration.source_trace_id)&&o.connectedTo.includes(originalPort.pcb_port_id))
    requireProof(aliases.length===1,"Current fixed Ground obstacle is absent or ambiguous")
    const existing=aliases[0]!
    for(const alias of existing.connectedTo){
      const source=initial.find(e=>(e.type==="source_trace"&&e.source_trace_id===alias)
        ||(e.type==="source_net"&&e.source_net_id===alias)||(e.type==="source_port"&&e.source_port_id===alias))
      const port=initial.find(e=>e.type==="pcb_port"&&e.pcb_port_id===alias)
      const logicalId=source?alias:port?.type==="pcb_port"?port.source_port_id:alias===path.pcb_trace_id?declaration.source_trace_id:undefined
      requireProof(logicalId&&sourceGraph.areIdsConnected(logicalId,ground.source_net_id),"Current barrel obstacle contains an unknown or foreign SOURCE alias")
    }
    const obstacleId=`guard:current-full-barrel:${barrel.pcb_via_id}`
    requireProof(!adaptedInput.obstacles.some(o=>o.obstacleId===obstacleId),"Current full-barrel guard identity already exists")
    obstacles.push({obstacleId,type:"rect",shape:"circle",center:{x:barrel.x,y:barrel.y},width:barrel.outer_diameter,
      height:barrel.outer_diameter,layers:[...barrel.layers],connectedTo:[...existing.connectedTo]})
    covers.push({barrelId:barrel.pcb_via_id,traceId:path.pcb_trace_id,sourceTraceId:declaration.source_trace_id,
      originPortId:originalPort.pcb_port_id,sourceNetId:ground.source_net_id,x:barrel.x,y:barrel.y,
      holeDiameter:barrel.hole_diameter,outerDiameter:barrel.outer_diameter,layers:[...barrel.layers],
      originalObstacleIndex:originalInput.obstacles.indexOf(existing),originalObstacleLayers:[...existing.layers],
      obstacleId,connectedTo:[...existing.connectedTo],runId:proof.runId})
  }
  return {adaptedInput:{...adaptedInput,obstacles:[...adaptedInput.obstacles,...obstacles]},currentBarrelCovers:covers}
}
