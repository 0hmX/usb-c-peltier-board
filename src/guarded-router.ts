import {EventEmitter} from "node:events"
import {AutoroutingPipelineSolver9_PreloadedTraceGraph as Solver,
  AutoroutingPipelineSolver6_PolyHypergraph as PolySolver,
  type SimpleRouteJson,type Obstacle} from "@tscircuit/capacity-autorouter"
import {selectSourceTerminalRepresentatives,type TerminalRepresentative} from "./source-terminal-escapes"
import type {SourceBusConnection} from "./source-bus-connections"
import type {SourcePadConnection} from "./source-pad-connections"
import {coverCurrentGroundBarrels,type CurrentBarrelCover} from "./current-ground-barrels"
import {compactExactAxisAlignedObstacles,type ExactObstacleCompaction} from "./compact-exact-axis-aligned-obstacles"
export {setGuardedSourceCopperProof} from "./source-terminal-escapes"
export {setGuardedCurrentBarrelProof,type GuardedCurrentBarrelProof} from "./current-ground-barrels"
import {restrictRoutingBounds,restorePhysicalBoardBounds} from "./regional-routing"
export type GuardedRoutingRegion={phaseIndex:6;phaseName:"INPUT_PROTECTION";bounds:SimpleRouteJson["bounds"]}
export const guardedNativeSolverOptions=Object.freeze({effort:1,cacheProvider:null,maxNodeDimension:20,maxNodeRatio:8} satisfies NonNullable<ConstructorParameters<typeof Solver>[1]> & NonNullable<ConstructorParameters<typeof PolySolver>[1]>)

export const guardedSolverNames=Object.freeze({preloaded:"AutoroutingPipelineSolver9_PreloadedTraceGraph",poly:"AutoroutingPipelineSolver6_PolyHypergraph"} as const)
export type GuardedSolverName=typeof guardedSolverNames[keyof typeof guardedSolverNames]
export const guardedSolverPreprocessing=Object.freeze({
  [guardedSolverNames.preloaded]:"preloads-to-obstacles-and-filter-outside-board",
  [guardedSolverNames.poly]:"preloads-to-obstacles-without-outside-filter"
} as const)
type GuardedSolver=Solver|PolySolver

// The board floor records the two declared .20/.50 manual hosts. Every native
// solver still receives the ordinary .30/.70 class; missing or mixed aliases fail closed.
export function assertOrdinaryNativeViaDimensions(input:SimpleRouteJson){
  const holes=[input.min_via_hole_diameter,input.minViaHoleDiameter]
  const pads=[input.min_via_pad_diameter,input.minViaPadDiameter,input.minViaDiameter]
  if(holes.some(v=>v!==.30)||pads.some(v=>v!==.70))
    throw new Error("Native routing requires consistent ordinary .30 drill/.70 pad aliases")
}

// Narrow opt-in qualification; the public constructor reads the same dimensions.
export function assertReviewedPolyInput(input:SimpleRouteJson){
  if(input.layerCount!==4||input.allowBlindAndBuriedVias!==false||input.minTraceWidth!==.20
    ||input.nominalTraceWidth!==.20||(input.traces??[]).length
    ||input.connections.some(c=>c.width!==.20||c.nominalTraceWidth!==.20))
    throw new Error("Reviewed Poly phase requires fixed copper, .20 traces and ordinary four-layer barrels")
  assertOrdinaryNativeViaDimensions(input)
}
function constructGuardedSolver(input:SimpleRouteJson,name:GuardedSolverName):GuardedSolver{
  assertOrdinaryNativeViaDimensions(input)
  if(name===guardedSolverNames.poly){
    assertReviewedPolyInput(input)
    return new PolySolver(structuredClone(input),{...guardedNativeSolverOptions})
  }
  if(name!==guardedSolverNames.preloaded)throw new Error("Unreviewed native solver constructor")
  return new Solver(structuredClone(input),{...guardedNativeSolverOptions})
}
// Public progress diagnostics only; no pathing weights or private state changes.
function guardedSolverProgress(solver:GuardedSolver){
  if("computeProgress" in solver)return solver.computeProgress()
  if(solver.solved)return 1
  const count=solver.pipelineDef.length
  const child=solver.activeSubSolver?.progress??0
  const progress=(solver.currentPipelineStepIndex+(Number.isFinite(child)?Math.max(0,Math.min(1,child)):0))/count
  return Number.isFinite(progress)?Math.max(0,Math.min(1,progress)):0
}

export type BarrelObstacleContact={traceId:string;viaIndex:number;x:number;y:number;obstacleIndex:number;obstacleId?:string;overlap:number}
export type GuardedRoutingEvidence={originalInput:SimpleRouteJson;adaptedInput:SimpleRouteJson;
  nativeInput?:SimpleRouteJson;
  routingRegion?:(GuardedRoutingRegion&{internallyDiscardedObstacleIndices:number[];
    minimumDiscardedObstacleGapMm:number|null;clearanceReach:number;retainedOutsideObstacleIndices?:number[]});
  nativeOutput?:SimpleRouteJson;restoredOutput?:SimpleRouteJson;
  guards:{traceId:string;connectionName:string;connectedTo:string[];obstacleIds:string[]}[];
  refinements:{traceId:string;reason:string}[];terminalRepresentatives?:TerminalRepresentative[];
  busRepresentatives?:SourceBusConnection[];
  padRepresentatives?:SourcePadConnection[];
  currentBarrelCovers?:CurrentBarrelCover[];
  fullBarrelInput?:SimpleRouteJson;
  obstacleCompaction?:Omit<ExactObstacleCompaction,"input">;
  solverOptions?:typeof guardedNativeSolverOptions;
  solverConstructorName?:GuardedSolverName;
  solverPreprocessing?:typeof guardedSolverPreprocessing[GuardedSolverName];
  sourceCompleted?:{reason:"authenticated-source-copper";nativeSolverConstructed:false;newTraceCount:0};
  sourceCopperSha256?:string;runtimeSha256?:string;barrelObstacleContacts?:BarrelObstacleContact[];error?:string}
let auditHook:((evidence:GuardedRoutingEvidence)=>void)|undefined
export const setGuardedRoutingAuditHook=(hook:typeof auditHook)=>{auditHook=hook}
export type GuardedRoutingInputEvidence=Omit<GuardedRoutingEvidence,
  "nativeOutput"|"restoredOutput"|"barrelObstacleContacts"|"error">
let inputAuditHook:((evidence:GuardedRoutingInputEvidence)=>void)|undefined
export const setGuardedRoutingInputAuditHook=(hook:typeof inputAuditHook)=>{inputAuditHook=hook}
export type GuardedRoutingLifecycleEvent={kind:"before-constructor"|"after-constructor"|"before-step"|"after-step";
  elapsedMs:number;stepCount:number;solverPhase?:string;stepDurationMs?:number;sourceCopperSha256?:string;runtimeSha256?:string;
  childIterations?:number;nodeCount?:number;edgeCount?:number;solverConstructorName?:GuardedSolverName}
let lifecycleAuditHook:((event:GuardedRoutingLifecycleEvent)=>void)|undefined
export const setGuardedRoutingLifecycleAuditHook=(hook:typeof lifecycleAuditHook)=>{lifecycleAuditHook=hook}

export function sourceRoutingIsComplete(selection:ReturnType<typeof selectSourceTerminalRepresentatives>){
  if(!selection.sourceSha256||!selection.runtimeSha256||(selection.adaptedInput.traces??[]).length)return false
  return selection.adaptedInput.connections.every(connection=>connection.pointsToConnect.length<=1
    &&connection.pointsToConnect.every(point=>{
      const group=[...selection.padRepresentatives,...selection.busRepresentatives].find(candidate=>
        candidate.sourceNetId===connection.name&&candidate.representativePortId===point.pcb_port_id)
      const member=group?.memberPorts.find(candidate=>candidate.id===point.pcb_port_id)
      const escape=selection.representatives.find(candidate=>candidate.sourceNetId===connection.name&&candidate.viaPortId===point.pcb_port_id)
      const actual=member??escape?.via
      return actual&&Math.abs(actual.x-point.x)<1e-6&&Math.abs(actual.y-point.y)<1e-6
    }))
}

// Public SRJ obstacles conservatively contain the actual prior copper. Remove
// the guarded routes from Solver9's mutable preload graph, then restore their
// original objects unchanged. This is the same fixed-copper input pattern used
// by core, with max adjacent widths and full-barrel drill clearance added.
export function guardPreviousCopper(input:SimpleRouteJson){
  if(input.allowBlindAndBuriedVias)throw new Error("Reviewed guards require ordinary through barrels")
  const traceIds=(input.traces??[]).map(trace=>trace.pcb_trace_id)
  if(new Set(traceIds).size!==traceIds.length)throw new Error("Guarded prior routes require unique physical identities")
  const layers=["top",...Array.from({length:input.layerCount-2},(_,i)=>`inner${i+1}`),"bottom"]
  const obstacles:Obstacle[]=[]
  const guards:GuardedRoutingEvidence["guards"]=[]
  for(const trace of input.traces??[]){
    if("route_thickness_mode" in trace&&trace.route_thickness_mode!=="constant")
      throw new Error("Reviewed guards require constant-width route semantics")
    for(const point of trace.route)if("start_width" in point||"end_width" in point||"width_interpolation_mode" in point)
      throw new Error("Reviewed SRJ guards cannot silently ignore taper fields")
    const connectedTo=[...new Set([trace.connection_name,trace.pcb_trace_id,...trace.connectsTo??[]])]
    const obstacleIds:string[]=[]
    for(const [index,point] of trace.route.entries()){
      if(point.route_type==="via"){
        const copper=point.via_diameter??input.minViaPadDiameter??input.minViaDiameter??0.7
        const hole=point.via_hole_diameter??input.minViaHoleDiameter??0.3
        const extra=Math.max(0,(input.minTraceToHoleEdgeClearance??0.5)-(input.minTraceToPadEdgeClearance??0.2))
        const diameter=Math.max(copper,hole+2*extra)
        const obstacleId=`guard:${trace.pcb_trace_id}:via:${index}`
        obstacles.push({obstacleId,type:"rect",shape:"circle",center:{x:point.x,y:point.y},
          width:diameter,height:diameter,layers:[...layers],connectedTo:[...connectedTo]})
        obstacleIds.push(obstacleId)
      }
      const next=trace.route[index+1]
      if(!next){
        if(point.route_type==="wire"&&trace.route.length===1){
          const obstacleId=`guard:${trace.pcb_trace_id}:cap:${index}`
          obstacles.push({obstacleId,type:"rect",shape:"circle",center:{x:point.x,y:point.y},
            width:point.width,height:point.width,layers:[point.layer],connectedTo:[...connectedTo]})
          obstacleIds.push(obstacleId)
        }
        continue
      }
      if((point.route_type!=="wire"&&point.route_type!=="via")||(next.route_type!=="wire"&&next.route_type!=="via"))
        throw new Error("Reviewed copper guards require explicit wire and via segments")
      if(point.route_type==="via"&&next.route_type==="via"){
        if(Math.hypot(next.x-point.x,next.y-point.y)>1e-6)throw new Error("Via-to-via segment has no explicit wire layer")
        continue
      }
      if(point.route_type==="wire"&&next.route_type==="wire"&&point.layer!==next.layer)
        throw new Error("Guarded layer transition requires an explicit plated barrel")
      const width=Math.max(point.route_type==="wire"?point.width:0,next.route_type==="wire"?next.width:0)
      const layer=point.route_type==="wire"?point.layer:next.route_type==="wire"?next.layer:undefined
      if(!layer||width<=0)throw new Error("Guarded wire segment has no physical layer or width")
      const length=Math.hypot(next.x-point.x,next.y-point.y)
      const steps=point.x===next.x||point.y===next.y?1:Math.max(1,Math.ceil(length/width))
      for(let step=0;step<steps;step++){
        const x1=point.x+(next.x-point.x)*step/steps,y1=point.y+(next.y-point.y)*step/steps
        const x2=point.x+(next.x-point.x)*(step+1)/steps,y2=point.y+(next.y-point.y)*(step+1)/steps
        const obstacleId=`guard:${trace.pcb_trace_id}:wire:${index}:${step}`
        obstacles.push({obstacleId,type:"rect",center:{x:(x1+x2)/2,y:(y1+y2)/2},
          width:Math.abs(x2-x1)+width,height:Math.abs(y2-y1)+width,layers:[layer],connectedTo:[...connectedTo]})
        obstacleIds.push(obstacleId)
      }
    }
    guards.push({traceId:trace.pcb_trace_id,connectionName:trace.connection_name,connectedTo,obstacleIds})
  }
  return {adaptedInput:{...structuredClone(input),traces:[],obstacles:[...structuredClone(input.obstacles),...obstacles]},guards}
}

// Fail before an invalid newly solved barrel becomes immutable prior copper.
// Ordinary pours recarve around foreign barrels and are deliberately excluded.
// The remaining SRJ rectangles/circles are the native fixed pad/trace input.
export function findNewBarrelObstacleContacts({input,output}:{input:SimpleRouteJson;output:SimpleRouteJson}){
  const parents=new Map<string,string>()
  const root=(token:string):string=>{
    const parent=parents.get(token)
    if(!parent){parents.set(token,token);return token}
    if(parent===token)return token
    const result=root(parent);parents.set(token,result);return result
  }
  const join=(tokens:string[])=>{for(const token of tokens.slice(1))parents.set(root(token),root(tokens[0]))}
  for(const obstacle of input.obstacles)if(obstacle.connectedTo.length)join(obstacle.connectedTo)
  for(const connection of input.connections)join([connection.name,...connection.pointsToConnect.flatMap(point=>
    [point.pointId,point.pcb_port_id].filter((token):token is string=>typeof token==="string"))])
  const contacts:BarrelObstacleContact[]=[]
  for(const trace of output.traces??[]){
    const connection=input.connections.find(candidate=>candidate.name===trace.connection_name)
    if(!connection)throw new Error(`Native route ${trace.pcb_trace_id} has no authenticated input connection`)
    const allowedRoot=root(connection.name)
    if(trace.connectsTo?.some(token=>root(token)!==allowedRoot))
      throw new Error(`Native route ${trace.pcb_trace_id} claims a foreign or unauthenticated endpoint`)
    const scope=new Set([allowedRoot])
    for(const [viaIndex,via] of trace.route.entries()){
      if(via.route_type!=="via")continue
      const radius=(via.via_diameter??input.minViaPadDiameter??input.minViaDiameter??0.7)/2
      for(const [obstacleIndex,obstacle] of input.obstacles.entries()){
        if(obstacle.isCopperPour||obstacle.connectedTo.some(token=>scope.has(root(token))))continue
        const dx=via.x-obstacle.center.x,dy=via.y-obstacle.center.y
        const angle=(obstacle.ccwRotationDegrees??0)*Math.PI/180
        const x=dx*Math.cos(angle)+dy*Math.sin(angle),y=-dx*Math.sin(angle)+dy*Math.cos(angle)
        const distance=obstacle.shape==="circle"?Math.hypot(dx,dy)-Math.max(obstacle.width,obstacle.height)/2:
          Math.hypot(Math.max(Math.abs(x)-obstacle.width/2,0),Math.max(Math.abs(y)-obstacle.height/2,0))
        const overlap=radius-distance
        if(overlap>1e-6)contacts.push({traceId:trace.pcb_trace_id,viaIndex,x:via.x,y:via.y,
          obstacleIndex,obstacleId:obstacle.obstacleId,overlap})
      }
    }
  }
  return contacts
}

class GuardedNativeRouter extends EventEmitter {
  private active=false
  private timer:ReturnType<typeof setTimeout>|undefined
  private output:SimpleRouteJson|undefined
  private solver:GuardedSolver|undefined
  private evidence:GuardedRoutingEvidence
  private input:SimpleRouteJson
  private lifecycleStart=performance.now()
  private stepCount=0
  private lastMarkedPhase:string|undefined
  private lastStepMarker=0
  constructor(input:SimpleRouteJson,routingRegion?:GuardedRoutingRegion,solverName:GuardedSolverName=guardedSolverNames.preloaded){
    assertOrdinaryNativeViaDimensions(input)
    super()
    this.input=structuredClone(input)
    const selection=selectSourceTerminalRepresentatives({input})
    const guarded=guardPreviousCopper(selection.adaptedInput)
    const {adaptedInput:fullBarrelInput,currentBarrelCovers}=coverCurrentGroundBarrels({originalInput:input,adaptedInput:guarded.adaptedInput,
      sourceSha256:selection.sourceSha256,runtimeSha256:selection.runtimeSha256})
    // Solver9 accepts this public planning reserve. Keep physical obstacles and
    // board rules exact; independently check the emitted copper against them.
    fullBarrelInput.defaultObstacleMargin=Math.max(fullBarrelInput.defaultObstacleMargin??0.15,0.20)
    const {input:adaptedInput,...obstacleCompaction}=compactExactAxisAlignedObstacles(fullBarrelInput)
    this.evidence={originalInput:structuredClone(input),adaptedInput,guards:guarded.guards,currentBarrelCovers,
      fullBarrelInput,obstacleCompaction,
      solverOptions:guardedNativeSolverOptions,refinements:[],
      terminalRepresentatives:selection.representatives,sourceCopperSha256:selection.sourceSha256,
      busRepresentatives:selection.busRepresentatives,
      padRepresentatives:selection.padRepresentatives,
      runtimeSha256:selection.runtimeSha256}
    if(sourceRoutingIsComplete(selection)){
      this.evidence.sourceCompleted={reason:"authenticated-source-copper",nativeSolverConstructed:false,newTraceCount:0}
      this.output=structuredClone(this.input)
      this.evidence.restoredOutput=structuredClone(this.output)
      inputAuditHook?.(structuredClone(this.evidence))
      return
    }
    // Source-completed phases returned above, before any regional exposure.
    this.evidence.solverConstructorName=solverName
    this.evidence.solverPreprocessing=guardedSolverPreprocessing[solverName]
    const restricted=routingRegion?restrictRoutingBounds(adaptedInput,routingRegion.bounds):undefined
    const nativeInput=restricted?.input??adaptedInput
    this.evidence.nativeInput=structuredClone(nativeInput)
    if(routingRegion&&restricted)this.evidence.routingRegion={...structuredClone(routingRegion),
      internallyDiscardedObstacleIndices:solverName===guardedSolverNames.poly?[]:restricted.internallyDiscarded.map(obstacle=>adaptedInput.obstacles.indexOf(obstacle)),
      minimumDiscardedObstacleGapMm:solverName===guardedSolverNames.poly?null:restricted.minimumDiscardedObstacleGapMm,
      clearanceReach:restricted.clearanceReach,
      ...(solverName===guardedSolverNames.poly?{retainedOutsideObstacleIndices:restricted.internallyDiscarded.map(obstacle=>adaptedInput.obstacles.indexOf(obstacle))}:{})}
    inputAuditHook?.(structuredClone(this.evidence))
    this.markLifecycle("before-constructor")
    this.solver=constructGuardedSolver(nativeInput,solverName)
    this.markLifecycle("after-constructor",this.solver.getCurrentPhase())
  }
  private markLifecycle(kind:GuardedRoutingLifecycleEvent["kind"],solverPhase?:string,stepDurationMs?:number){
    const child=this.solver?.activeSubSolver
    const childIterations=child&&"iterations" in child&&typeof child.iterations==="number"?child.iterations:undefined
    const edgeSolver=this.solver&&"edgeSolver" in this.solver?this.solver.edgeSolver:undefined
    const nodeCount=solverPhase==="edgeSolver"?edgeSolver?.nodes.length:undefined
    const edgeCount=solverPhase==="edgeSolver"?edgeSolver?.edges.length:undefined
    lifecycleAuditHook?.({kind,elapsedMs:performance.now()-this.lifecycleStart,stepCount:this.stepCount,
      solverPhase,stepDurationMs,childIterations,nodeCount,edgeCount,solverConstructorName:this.evidence.solverConstructorName,
      sourceCopperSha256:this.evidence.sourceCopperSha256,runtimeSha256:this.evidence.runtimeSha256})
  }
  start(){this.active=true;this.timer=setTimeout(()=>{
    if(this.evidence.sourceCompleted){
      this.active=false
      auditHook?.(this.evidence)
      this.emit("complete",{traces:[]})
      return
    }
    this.cycle()
  },0)}
  stop(){this.active=false;if(this.timer)clearTimeout(this.timer)}
  getOutputSimpleRouteJson(){return this.output}
  private finish(){
    const solver=this.solver
    if(!solver)throw new Error("Native guarded solver was not constructed")
    if(solver.failed)throw new Error(solver.error??"Native guarded solver failed")
    const nativeOutput=structuredClone(solver.getOutputSimpleRouteJson())
    this.evidence.nativeOutput=structuredClone(nativeOutput)
    const guardedIds=new Set(this.evidence.guards.map(guard=>guard.traceId))
    if(nativeOutput.traces?.some(trace=>guardedIds.has(trace.pcb_trace_id)
      ||trace.__replaces_pcb_trace_id&&guardedIds.has(trace.__replaces_pcb_trace_id)))
      throw new Error("Native solver attempted to replace guarded prior copper")
    for(const trace of nativeOutput.traces??[])for(const point of trace.route)
      if(point.route_type==="wire"&&(!Number.isFinite(point.width)||point.width<this.input.minTraceWidth-1e-6))
        throw new Error(`Native route ${trace.pcb_trace_id} violates the declared minimum trace width`)
    this.evidence.barrelObstacleContacts=findNewBarrelObstacleContacts({input:this.evidence.adaptedInput,output:nativeOutput})
    if(this.evidence.barrelObstacleContacts.length){
      const first=this.evidence.barrelObstacleContacts[0]
      throw new Error(`New barrel ${first.traceId}[${first.viaIndex}] contacts foreign fixed obstacle ${first.obstacleId??first.obstacleIndex}`)
    }
    const acceptedOutput=this.evidence.routingRegion?restorePhysicalBoardBounds({
      beforeRestriction:this.evidence.adaptedInput,regionalInput:this.evidence.nativeInput!,nativeOutput}):nativeOutput
    const prior=structuredClone(this.input.traces??[])
    this.output={...acceptedOutput,traces:[...prior,...acceptedOutput.traces??[]]}
    for(const trace of this.input.traces??[]){
      const restored=this.output.traces?.find(candidate=>candidate.pcb_trace_id===trace.pcb_trace_id)
      if(JSON.stringify(restored)!==JSON.stringify(trace))throw new Error("Guarded route identity changed")
    }
    this.evidence.restoredOutput=structuredClone(this.output)
    auditHook?.(this.evidence)
    this.emit("complete",{traces:this.output.traces??[]})
  }
  private cycle(){
    if(!this.active)return
    try{
      const solver=this.solver
      if(!solver)throw new Error("Native guarded solver was not constructed")
      const until=performance.now()+20
      do{
        const phase=solver.getCurrentPhase(),started=performance.now()
        const mark=this.stepCount===0||phase!==this.lastMarkedPhase||started-this.lastStepMarker>=10000
        if(mark){this.markLifecycle("before-step",phase);this.lastMarkedPhase=phase;this.lastStepMarker=started}
        solver.step();this.stepCount++
        const nextPhase=solver.getCurrentPhase()
        if(mark||nextPhase!==phase)this.markLifecycle("after-step",nextPhase,performance.now()-started)
      }while(!solver.solved&&!solver.failed&&performance.now()<until)
      if(solver.solved||solver.failed){this.finish();return}
      this.emit("progress",{progress:guardedSolverProgress(solver),solverPhase:solver.getCurrentPhase()})
      this.timer=setTimeout(()=>this.cycle(),0)
    }catch(error){
      this.evidence.error=error instanceof Error?error.message:String(error)
      auditHook?.(this.evidence)
      this.emit("error",{error:error instanceof Error?error:new Error(String(error))})
    }
  }
}
export async function routeGuardedNative(input:SimpleRouteJson){return new GuardedNativeRouter(input)}

export function createGuardedNativeRegionalRouter(scope:GuardedRoutingRegion){
  if(scope.phaseIndex!==6||scope.phaseName!=="INPUT_PROTECTION")throw new Error("Regional router is scoped to original INPUT_PROTECTION phase6")
  const frozenScope=structuredClone(scope)
  return async(input:SimpleRouteJson)=>new GuardedNativeRouter(input,frozenScope)
}

export function createGuardedNativePolyRegionalRouter(scope:GuardedRoutingRegion){
  if(scope.phaseIndex!==6||scope.phaseName!=="INPUT_PROTECTION")throw new Error("Poly regional router is scoped to original whole INPUT_PROTECTION phase6")
  const frozenScope=structuredClone(scope)
  return async(input:SimpleRouteJson)=>new GuardedNativeRouter(input,frozenScope,guardedSolverNames.poly)
}
