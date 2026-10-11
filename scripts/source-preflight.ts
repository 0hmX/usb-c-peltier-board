import {ConnectivityMap} from "circuit-json-to-connectivity-map"
import type {CircuitJson} from "circuit-json"

// Match Core2124's per-subcircuit straight-line source-length preflight.
// Use unpoured public CJS: settled planes must not create endpoint shortcuts.
export function inspectSourcePreflight(circuit:CircuitJson){
  if(circuit.some(element=>["pcb_copper_pour","pcb_ground_plane","source_pcb_ground_plane"].includes(element.type)))
    throw new Error("Use the actual pre-pour snapshot; settled planes change the native preflight")
  const traces=circuit.filter(element=>element.type==="source_trace")
  const ports=new Map(circuit.filter(element=>element.type==="pcb_port").map(port=>[port.source_port_id,port]))
  const label=(sourcePortId:string)=>{
    const port=circuit.find(element=>element.type==="source_port"&&element.source_port_id===sourcePortId)
    const parent=port?.type==="source_port"?circuit.find(element=>element.type==="source_component"&&element.source_component_id===port.source_component_id):undefined
    return parent?.type==="source_component"&&port?.type==="source_port"?`${parent.name}.${port.name}`:sourcePortId
  }
  const violations=[]
  for(const subcircuitId of new Set(traces.map(trace=>trace.subcircuit_id))){
    const groupTraces=traces.filter(trace=>trace.subcircuit_id===subcircuitId),graph=new ConnectivityMap({})
    graph.addConnections(groupTraces.map(trace=>[trace.source_trace_id,...trace.connected_source_port_ids,...trace.connected_source_net_ids]))
    for(const trace of groupTraces){
      if(typeof trace.max_length!=="number")continue
      const endpoints=trace.connected_source_port_ids.flatMap(id=>ports.get(id)?[ports.get(id)!]:[])
      let distance=0,nearestTarget:string|undefined
      if(endpoints.length>=2){
        for(const a of endpoints)for(const b of endpoints)distance=Math.max(distance,Math.hypot(a.x-b.x,a.y-b.y))
      }else if(endpoints.length===1&&trace.connected_source_net_ids.length){
        const network=graph.getNetConnectedToId(trace.source_trace_id)
        if(!network)continue
        const candidates=graph.getIdsConnectedToNet(network).filter(id=>!trace.connected_source_port_ids.includes(id)&&ports.has(id))
        if(!candidates.length)continue
        distance=Infinity
        for(const id of candidates){const target=ports.get(id)!,gap=Math.hypot(target.x-endpoints[0]!.x,target.y-endpoints[0]!.y)
          if(gap<distance){distance=gap;nearestTarget=label(id)}}
      }else continue
      if(distance<=trace.max_length+1e-6)continue
      violations.push({subcircuitId,sourceTraceId:trace.source_trace_id,name:trace.name,displayName:trace.display_name,
        maxLengthMm:trace.max_length,straightLineDistanceMm:distance,sourceEndpoints:trace.connected_source_port_ids.map(label),nearestTarget})
    }
  }
  return {violationCount:violations.length,violations}
}
