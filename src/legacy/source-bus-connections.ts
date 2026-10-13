import type {CircuitJson} from "circuit-json"
import type {SimpleRouteJson} from "@tscircuit/capacity-autorouter"
import {getFullConnectivityMapFromCircuitJson} from "circuit-json-to-connectivity-map"
import {captureSourcePadConnections,type SourcePadConnectionPlan} from "./source-pad-connections"

export type SourceBusConnection={sourceNetId:string;sourceBusId:string;traceIds:string[];
  memberPorts:{id:string;x:number;y:number}[];representativePortId:string;memberLayers?:Record<string,string[]>;requiredPortIds?:string[]}
const close=(a:number,b:number)=>Math.abs(a-b)<1e-6

// This proof uses exact source-owned centerlines, not conservative obstacle
// boxes. A numeric tap must end on the same-layer paired trunk centerline.
export function captureSourceBusConnections({circuitJson,branchPlans=[]}:{circuitJson:CircuitJson;branchPlans?:readonly SourcePadConnectionPlan[]}){
  const groups:SourceBusConnection[]=[]
  const sourceGraph=getFullConnectivityMapFromCircuitJson(circuitJson.filter(element=>element.type.startsWith("source_")))
  for(const [netName,trunkName,tapName] of [
    ["I2C_SCL","I2C_MCU_DAC_SCL","TP10_I2C_TAP"],
    ["I2C_SDA","I2C_MCU_DAC_SDA","TP11_I2C_TAP"],
  ]){
    const sourceTrunk=circuitJson.find(element=>element.type==="source_trace"&&element.name===trunkName)
    const sourceTap=circuitJson.find(element=>element.type==="source_trace"&&element.name===tapName)
    if(!sourceTap)continue
    const net=circuitJson.find(element=>element.type==="source_net"&&element.name===netName)
    const bus=circuitJson.find(element=>element.type==="source_bus"&&element.name==="CONTROL_I2C")
    if(!sourceTrunk||sourceTrunk.type!=="source_trace"||sourceTap.type!=="source_trace"
      ||!net||net.type!=="source_net"||!bus||bus.type!=="source_bus"
      ||!bus.source_trace_ids?.includes(sourceTrunk.source_trace_id)
      ||sourceGraph.getNetConnectedToId(sourceTrunk.source_trace_id)!==sourceGraph.getNetConnectedToId(net.source_net_id)
      ||sourceGraph.getNetConnectedToId(sourceTap.source_trace_id)!==sourceGraph.getNetConnectedToId(net.source_net_id))
      throw new Error(`Bus tap ${tapName} lacks authentic paired-bus/source-net membership`)
    const trunks=circuitJson.filter(element=>element.type==="pcb_trace"&&element.source_trace_id===sourceTrunk.source_trace_id)
    const taps=circuitJson.filter(element=>element.type==="pcb_trace"&&element.source_trace_id===sourceTap.source_trace_id)
    if(trunks.length!==1||taps.length!==1)throw new Error(`Bus tap ${tapName} requires one exact source path per branch`)
    const trunk=trunks[0],tap=taps[0]
    if(trunk.type!=="pcb_trace"||tap.type!=="pcb_trace")throw new Error("Invalid source bus copper")
    const first=trunk.route[0],last=trunk.route.at(-1),tapFirst=tap.route[0],tapEnd=tap.route.at(-1)
    if(!first||!last||!tapFirst||!tapEnd||first.route_type!=="wire"||last.route_type!=="wire"
      ||tapFirst.route_type!=="wire"||tapEnd.route_type!=="wire"||!first.start_pcb_port_id
      ||!last.end_pcb_port_id||!tapFirst.start_pcb_port_id
      ||[...trunk.route,...tap.route].some(point=>point.route_type!=="wire"||point.layer!=="top"
        ||!close(point.width,0.2)||!Number.isFinite(point.x)||!Number.isFinite(point.y)))
      throw new Error(`Bus tap ${tapName} changed its exact 0.20 mm top copper or physical port ends`)
    const tapLength=tap.route.slice(1).reduce((length,b,index)=>{
      const a=tap.route[index]
      return length+(a.route_type==="wire"&&b.route_type==="wire"?Math.hypot(b.x-a.x,b.y-a.y):Infinity)
    },0)
    if(!close(tapLength,1.5))throw new Error(`Bus tap ${tapName} changed its reviewed 1.50 mm physical length`)
    const touches=trunk.route.some((a,index)=>{
      const b=trunk.route[index+1]
      if(a.route_type!=="wire"||b?.route_type!=="wire")return false
      const dx=b.x-a.x,dy=b.y-a.y,lengthSquared=dx*dx+dy*dy
      if(lengthSquared<1e-12)return false
      const fraction=((tapEnd.x-a.x)*dx+(tapEnd.y-a.y)*dy)/lengthSquared
      return fraction>=0&&fraction<=1&&Math.hypot(tapEnd.x-a.x-fraction*dx,tapEnd.y-a.y-fraction*dy)<1e-6
    })
    if(!touches)throw new Error(`Bus tap ${tapName} is not physically joined to its exact trunk`)
    const ends=[first,last,tapFirst]
    const portIds=[first.start_pcb_port_id,last.end_pcb_port_id,tapFirst.start_pcb_port_id]
    const memberPorts=portIds.map((id,index)=>{
      const port=circuitJson.find(element=>element.type==="pcb_port"&&element.pcb_port_id===id)
      const sourceTrace=index===2?sourceTap:sourceTrunk
      if(!port||port.type!=="pcb_port"||!close(port.x,ends[index].x)||!close(port.y,ends[index].y)
        ||!port.layers.includes("top")
        ||!sourceTrace.connected_source_port_ids.includes(port.source_port_id))
        throw new Error(`Bus tap ${tapName} changed its actual pad/source-port identity`)
      return{id:port.pcb_port_id,x:port.x,y:port.y}
    })
    groups.push({sourceNetId:net.source_net_id,sourceBusId:bus.source_bus_id,
      traceIds:[trunk.pcb_trace_id,tap.pcb_trace_id],memberPorts,representativePortId:last.end_pcb_port_id,
      memberLayers:Object.fromEntries(memberPorts.map(port=>[port.id,["top"]]))})
  }
  for(const branch of captureSourcePadConnections({circuitJson,plans:branchPlans})){
    const group=groups.find(candidate=>candidate.sourceNetId===branch.sourceNetId)
    if(!group||!branch.requiredPortIds?.includes(group.representativePortId))
      throw new Error(`Source bus branch ${branch.traceName} lacks its real paired-trunk endpoint`)
    const members=new Map(group.memberPorts.map(port=>[port.id,port]))
    for(const member of branch.memberPorts){
      const previous=members.get(member.id)
      if(previous&&(!close(previous.x,member.x)||!close(previous.y,member.y)))
        throw new Error(`Source bus branch ${branch.traceName} changed its shared real endpoint`)
      members.set(member.id,member)
    }
    group.requiredPortIds=[...new Set([...(group.requiredPortIds??group.memberPorts.map(port=>port.id)),...branch.requiredPortIds])]
    group.memberPorts=[...members.values()]
    group.memberLayers={...group.memberLayers,...branch.memberLayers}
    group.traceIds=[...new Set([...group.traceIds,...branch.traceIds])]
  }
  return groups
}

export function selectSourceBusRepresentatives<T extends Pick<SourceBusConnection,
  "sourceNetId"|"memberPorts"|"representativePortId"|"memberLayers"|"requiredPortIds">>({input,groups}:{input:SimpleRouteJson;groups:T[]}){
  const selected:T[]=[]
  for(const group of groups){
    const connection=input.connections.find(candidate=>candidate.name===group.sourceNetId)
    if(!connection)continue
    const required=new Set(group.requiredPortIds??group.memberPorts.map(port=>port.id))
    for(const member of group.memberPorts){
      const point=connection.pointsToConnect.find(candidate=>candidate.pcb_port_id===member.id)
      if(!point&&!required.has(member.id))continue
      const layers=point?.layers??(point?.layer?[point.layer]:[])
      if(!point||point.pointId!==member.id
        ||connection.pointsToConnect.filter(candidate=>candidate.pcb_port_id===member.id).length!==1
        ||!close(point.x,member.x)||!close(point.y,member.y)||!layers.length
        ||!layers.every(layer=>(group.memberLayers?.[member.id]??["top"]).includes(layer)))
        throw new Error("A physically proved source bus port changed in the live routing input")
    }
    const removed=new Set(group.memberPorts.filter(member=>member.id!==group.representativePortId).map(member=>member.id))
    connection.pointsToConnect=connection.pointsToConnect.filter(point=>!point.pcb_port_id||!removed.has(point.pcb_port_id))
    connection.externallyConnectedPointIds=connection.externallyConnectedPointIds?.map(ids=>ids.filter(id=>!removed.has(id))).filter(ids=>ids.length>1)
    selected.push(structuredClone(group))
  }
  return selected
}
