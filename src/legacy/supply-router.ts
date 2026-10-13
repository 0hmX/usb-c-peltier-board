import {EventEmitter} from "eventemitter3"
import {AUTOROUTER_VERSION,AutoroutingPipelineSolver9_PreloadedTraceGraph as Solver,
  type SimpleRouteJson} from "@tscircuit/capacity-autorouter"
import {selectSourceTerminalRepresentatives,type TerminalRepresentative} from "./source-terminal-escapes"
import type {SourcePadConnection} from "./source-pad-connections"
import {assertOrdinaryNativeViaDimensions} from "./guarded-router"

export type SupplyRoutingEvidence={solver:string;version:string;native:SimpleRouteJson;
  corrected:SimpleRouteJson;corrections:{traceId:string;reason:string}[];
  originalInput?:SimpleRouteJson;adaptedInput?:SimpleRouteJson;terminalRepresentatives?:TerminalRepresentative[];
  padRepresentatives?:SourcePadConnection[];
  sourceCopperSha256?:string;runtimeSha256?:string;error?:string}
let auditHook:((evidence:SupplyRoutingEvidence)=>void)|undefined
export const setSupplyRoutingAuditHook=(hook:typeof auditHook)=>{auditHook=hook}

// The legal clock, fan-enable and pullup-supply escapes are source-owned.
// Native trace/port IDs change when debug components are added; do not replay
// geometry from a different source inventory into a new live routing phase.
export function validateSupplyRouteWidths({output,minTraceWidth}:{output:SimpleRouteJson;minTraceWidth:number}){
  for(const trace of output.traces??[])for(const point of trace.route)
    if(point.route_type==="wire"&&(!Number.isFinite(point.width)||point.width<minTraceWidth-1e-6))
      throw new Error(`Supply route ${trace.pcb_trace_id} violates the declared minimum trace width`)
}

// The documented phase algorithmFn accepts this same event contract as the
// built-in local autorouter. Run the pinned latest Solver9 on the live SRJ;
// preserve its complete live result. Actual DRC/style/physical gates still apply.
export async function routeLogicSupplies(input:SimpleRouteJson){
  assertOrdinaryNativeViaDimensions(input)
  const events=new EventEmitter()
  let active=false
  let timer:ReturnType<typeof setTimeout>|undefined
  let output:SimpleRouteJson|undefined
  const selection=selectSourceTerminalRepresentatives({input})
  const solver=new Solver(selection.adaptedInput,{effort:1,cacheProvider:null})
  const finish=()=>{
    if(solver.failed)throw new Error(solver.error??"Native supply solver failed")
    const native=structuredClone(solver.getOutputSimpleRouteJson())
    output=structuredClone(native)
    const corrections:SupplyRoutingEvidence["corrections"]=[]
    const inputEvidence={originalInput:structuredClone(input),adaptedInput:structuredClone(selection.adaptedInput),
      terminalRepresentatives:selection.representatives,padRepresentatives:selection.padRepresentatives,
      sourceCopperSha256:selection.sourceSha256,runtimeSha256:selection.runtimeSha256}
    try{validateSupplyRouteWidths({output,minTraceWidth:input.minTraceWidth})
    }catch(error){
      auditHook?.({solver:"AutoroutingPipelineSolver9_PreloadedTraceGraph",version:AUTOROUTER_VERSION,native,corrected:output,corrections,...inputEvidence,
        error:error instanceof Error?error.message:String(error)})
      throw error
    }
    auditHook?.({solver:"AutoroutingPipelineSolver9_PreloadedTraceGraph",version:AUTOROUTER_VERSION,native,corrected:output,corrections,...inputEvidence})
    events.emit("complete",{traces:output.traces??[]})
  }
  const cycle=()=>{
    if(!active)return
    try{
      const until=performance.now()+20
      do{solver.step()}while(!solver.solved&&!solver.failed&&performance.now()<until)
      if(solver.solved||solver.failed){finish();return}
      events.emit("progress",{progress:solver.computeProgress()})
      timer=setTimeout(cycle,0)
    }catch(error){events.emit("error",{error:error instanceof Error?error:new Error(String(error))})}
  }
  return Object.assign(events,{start:()=>{active=true;timer=setTimeout(cycle,0)},
    stop:()=>{active=false;if(timer)clearTimeout(timer)},getOutputSimpleRouteJson:()=>output})
}
