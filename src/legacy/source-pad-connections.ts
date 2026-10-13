import type {CircuitJson,PcbPort} from "circuit-json"
import type {SimpleRouteJson,ConnectionPoint} from "@tscircuit/capacity-autorouter"
import {getFullConnectivityMapFromCircuitJson} from "circuit-json-to-connectivity-map"
import type {SourceBusConnection} from "./source-bus-connections"
import {logicSupplyConnectionPlans} from "./logic-supply-links"
import {debugConnectionPlans} from "./blocks/debug"
import {controlLocalConnectionPlans} from "./control-local-routes"
import {pdLocalConnectionPlans} from "./blocks/pd-input"
import {converterLocalConnectionPlans} from "./blocks/tec-power"
import {supplyCompleteRailPlans} from "./supply-source-routes"
import {source16ConnectionPlans} from "./source16-routes"
import {source18ConnectionPlans,source18ReplacedGroupNames} from "./source18-routes"
import {source20ConnectionPlans,source20ReplacedGroupNames} from "./source20-routes"
import {source21ConnectionPlans,source21ReplacedGroupNames} from "./source21-routes"
import {source22ConnectionPlans,source22ReplacedGroupNames} from "./source22-routes"

export type SourcePadConnection=Omit<SourceBusConnection,"sourceBusId">&{traceName:string;sourceTraceId:string;
  requiredPortIds?:string[];memberLayers?:Record<string,string[]>;representativeLayers?:string[]}
const close=(a:number,b:number)=>Math.abs(a-b)<1e-6
const bridgePath=[[-42,-22.7],[-42,-21.8],[-40.2,-21.8],[-40,-22],[-36,-22],[-35.8,-21.8],[-34,-21.8],[-34,-22.7]]

export type SourcePadConnectionPlan={name:string;net:string;from:string;to:string;traces:readonly string[];
  requiredSelectors?:readonly string[];branchEndpoints?:Readonly<Record<string,readonly[string,string]>>;traceWidths?:Readonly<Record<string,number>>;
  smallVia?:{readonly name:"TEC_CLEAR_LATCH_SMALL_ENTRY";readonly pcbX:5.55;readonly pcbY:-18.385}
    |{readonly name:"SAFE_EN_LATCH_SMALL_ENTRY";readonly pcbX:6.1;readonly pcbY:-17.9}}
const debugGroups:SourcePadConnectionPlan[]=[]
for(const plan of debugConnectionPlans){
  const group=debugGroups.find(candidate=>candidate.net===plan.net&&candidate.from===plan.from)
  if(group){
    group.traces=[...new Set([...group.traces,...plan.traces])]
    group.requiredSelectors=[...new Set([...(group.requiredSelectors??[group.from,group.to]),plan.from,plan.to])]
  }else debugGroups.push({...plan,requiredSelectors:[plan.from,plan.to]})
}
const localSourcePadConnectionPlans:readonly SourcePadConnectionPlan[]=[
  {name:"DBG_BUFFER_VCC_BRIDGE",net:"V3V3",from:"U_DBG1.pin5",to:"U_DBG2.pin5",
    traces:["DBG_BUFFER_VCC_BRIDGE","DBG1_BYPASS","DBG2_BYPASS"]},
  ...logicSupplyConnectionPlans,
  ...pdLocalConnectionPlans,
  ...converterLocalConnectionPlans,
  {name:"LATCH_STATIC_V3_GROUP",net:"V3V3",from:"U_LATCH.pin2",to:"U_LATCH.pin8",
    traces:["LATCH_STATIC_V3_78","LATCH_STATIC_V3_27"],requiredSelectors:["U_LATCH.pin7"],
    branchEndpoints:{LATCH_STATIC_V3_78:["U_LATCH.pin7","U_LATCH.pin8"],LATCH_STATIC_V3_27:["U_LATCH.pin2","U_LATCH.pin7"]}},
  {name:"INPUT_CLOCK_STATIC_V3_GROUP",net:"V3V3",from:"C223.pin1",to:"CLOCK_VCC_ESCAPE.top",
    traces:["INPUT_LATCH_V3_TRUNK","CLOCK_BUFFER_BYPASS","CLOCK_VCC_OFF_PAD","INPUT_STATIC_V3_78","INPUT_STATIC_V3_27","INPUT_C217_V3_BYPASS"],
    requiredSelectors:["U_INPUT_LATCH.pin2","U_INPUT_LATCH.pin7","U_INPUT_LATCH.pin8","U_CLOCK_BUFFER.pin5","C217.pin1"],
    branchEndpoints:{INPUT_LATCH_V3_TRUNK:["C223.pin1","U_INPUT_LATCH.pin7"],CLOCK_BUFFER_BYPASS:["C223.pin1","U_CLOCK_BUFFER.pin5"],
      CLOCK_VCC_OFF_PAD:["U_CLOCK_BUFFER.pin5","CLOCK_VCC_ESCAPE.top"],INPUT_STATIC_V3_78:["U_INPUT_LATCH.pin7","U_INPUT_LATCH.pin8"],
      INPUT_STATIC_V3_27:["U_INPUT_LATCH.pin2","U_INPUT_LATCH.pin7"],INPUT_C217_V3_BYPASS:["U_INPUT_LATCH.pin8","C217.pin1"]}},
  {name:"MCU_V3_DECOUPLING_GROUP",net:"V3V3",from:"U_MCU.pin4",to:"C204.pin1",traces:["MCU_C203_V3_BYPASS","MCU_C204_V3_BANK"],
    requiredSelectors:["C203.pin1"],branchEndpoints:{MCU_C203_V3_BYPASS:["U_MCU.pin4","C203.pin1"],MCU_C204_V3_BANK:["C203.pin1","C204.pin1"]}},
  {name:"SUPERVISOR_V3_BYPASS_GROUP",net:"V3V3",from:"U_SUPERVISOR.pin3",to:"C216.pin1",traces:["SUPERVISOR_C216_V3_BYPASS"],
    branchEndpoints:{SUPERVISOR_C216_V3_BYPASS:["U_SUPERVISOR.pin3","C216.pin1"]}},
  {name:"CLEAR_BUFFER_V3_TRUNK",net:"V3V3",from:"TP03.pin1",to:"U_CLEAR_BUFFER.pin5",
    traces:["CLEAR_BUFFER_V3_TRUNK","CLEAR_BUFFER_BYPASS"],requiredSelectors:["C222.pin1"],
    branchEndpoints:{CLEAR_BUFFER_V3_TRUNK:["TP03.pin1","U_CLEAR_BUFFER.pin5"],CLEAR_BUFFER_BYPASS:["C222.pin1","U_CLEAR_BUFFER.pin5"]}},
  {name:"D503_RAIL_FEED",net:"V3V3",from:"R503.pin1",to:"C202.pin1",traces:["D503_RAIL_FEED"],
    branchEndpoints:{D503_RAIL_FEED:["R503.pin1","C202.pin1"]}},
  {name:"PD_SCL_VALID_V3_LINK",net:"V3V3",from:"R_PD_SCL.pin1",to:"R_PD_VALID.pin1",
    traces:["R_PD_SCL_A","PD_SCL_VALID_V3_TRUNK","R_PD_VALID_A"]},
  {"name":"TEC_PERMISSION_DIRECT_PROTECTED_PICKUP","net":"VBUS_TEC","from":"R35.pin1","to":"C_INPUT_OUT.pin1","traces":["TEC_PERMISSION_DIRECT_PROTECTED_PICKUP","TEC_PERMISSION_PICKUP_BOTTOM","TEC_PERMISSION_PICKUP_CAP"],"requiredSelectors":["PERMISSION_PICKUP_REMOTE.top","PERMISSION_PICKUP_LOCAL.top"],"branchEndpoints":{"TEC_PERMISSION_DIRECT_PROTECTED_PICKUP":["R35.pin1","PERMISSION_PICKUP_REMOTE.top"],"TEC_PERMISSION_PICKUP_BOTTOM":["PERMISSION_PICKUP_REMOTE.bottom","PERMISSION_PICKUP_LOCAL.bottom"],"TEC_PERMISSION_PICKUP_CAP":["PERMISSION_PICKUP_LOCAL.top","C_INPUT_OUT.pin1"]}},
  ...debugGroups,
  ...controlLocalConnectionPlans,
]
const source18PadConnectionPlans:readonly SourcePadConnectionPlan[]=[
  ...[
    ...localSourcePadConnectionPlans.filter(plan=>plan.net!=="V3V3"&&plan.name!=="TEC_VCC_LOCAL_GROUP"),
    ...supplyCompleteRailPlans,
    ...source16ConnectionPlans,
  ].filter(plan=>!source18ReplacedGroupNames.includes(plan.name)),
  ...source18ConnectionPlans,
]
const source20PadConnectionPlans:readonly SourcePadConnectionPlan[]=[
  ...source18PadConnectionPlans.filter(plan=>!source20ReplacedGroupNames.includes(plan.name)),
  ...source20ConnectionPlans,
]
const source21PadConnectionPlans:readonly SourcePadConnectionPlan[]=[
  ...source20PadConnectionPlans.filter(plan=>!source21ReplacedGroupNames.includes(plan.name)),
  ...source21ConnectionPlans,
]
export const sourcePadConnectionPlans:readonly SourcePadConnectionPlan[]=[
  ...source21PadConnectionPlans.filter(plan=>!source22ReplacedGroupNames.includes(plan.name)),
  ...source22ConnectionPlans,
]
const reviewedBranchEnds:Record<string,readonly[string,string]>={
  DBG1_BYPASS:["C_DBG1.pin1","U_DBG1.pin5"],DBG2_BYPASS:["C_DBG2.pin1","U_DBG2.pin5"],
  MON_C43_BYPASS:["C43.pin1","U_TEC_MON.pin5"],
}

export function captureSourcePadConnections({circuitJson,plans=sourcePadConnectionPlans}:{circuitJson:CircuitJson;plans?:readonly SourcePadConnectionPlan[]}){
  const groups:SourcePadConnection[]=[]
  const graph=getFullConnectivityMapFromCircuitJson(circuitJson.filter(element=>element.type.startsWith("source_")))
  const ports=new Map(circuitJson.filter((element):element is PcbPort=>element.type==="pcb_port").map(port=>[port.pcb_port_id,port]))
  for(const plan of plans){
    if(plan.smallVia&&!((plan.name==="TEC_CLEAR_N_COMPLETE_SOURCE"&&plan.net==="TEC_CLEAR_N"
      &&plan.smallVia.name==="TEC_CLEAR_LATCH_SMALL_ENTRY"&&close(plan.smallVia.pcbX,5.55)&&close(plan.smallVia.pcbY,-18.385))
      ||(plan.name==="TEC_SAFE_EN_COMPLETE_SOURCE"&&plan.net==="TEC_SAFE_EN"
      &&plan.smallVia.name==="SAFE_EN_LATCH_SMALL_ENTRY"&&close(plan.smallVia.pcbX,6.1)&&close(plan.smallVia.pcbY,-17.9))))
      throw new Error("Unreviewed small SourceVia policy")
    const declarations=plan.traces.map(name=>circuitJson.filter(element=>element.type==="source_trace"&&element.name===name))
    if(declarations.every(records=>records.length===0))continue
    const net=circuitJson.find(element=>element.type==="source_net"&&element.name===plan.net)
    if(!net||net.type!=="source_net"||declarations.some(records=>records.length!==1))throw new Error(`Incomplete source-owned supply link ${plan.name}`)
    let smallViaSeen=false
    const parents=new Map<string,string>(),members=new Set<string>(),memberLayers:Record<string,string[]>={}
    const root=(id:string):string=>{const parent=parents.get(id);if(!parent){parents.set(id,id);return id}return parent===id?id:root(parent)}
    const join=(ids:string[])=>{for(const id of ids.slice(1))parents.set(root(id),root(ids[0]!))}
    const traceIds:string[]=[],sourceTraceIds:string[]=[],tracePortIds=new Map<string,string[]>()
    for(const records of declarations){
      const declaration=records[0]!
      if(declaration.type!=="source_trace"||declaration.connected_source_port_ids.length!==2
        ||declaration.connected_source_net_ids?.some(id=>id!==net.source_net_id)
        ||graph.getNetConnectedToId(declaration.source_trace_id)!==graph.getNetConnectedToId(net.source_net_id))
        throw new Error(`Supply link ${plan.name} changed its source-net ownership`)
      const width=plan.traceWidths?.[declaration.name??""]??.2
      if(!Number.isFinite(width)||width<.2||declaration.min_trace_thickness!==width)
        throw new Error(`Source link ${plan.name} changed its declared branch width`)
      const paths=circuitJson.filter(element=>element.type==="pcb_trace"&&element.source_trace_id===declaration.source_trace_id)
      const path=paths[0],first=path?.type==="pcb_trace"?path.route[0]:undefined,last=path?.type==="pcb_trace"?path.route.at(-1):undefined
      if(paths.length!==1||path?.type!=="pcb_trace"||first?.route_type!=="wire"||last?.route_type!=="wire"
        ||!first.start_pcb_port_id||!last.end_pcb_port_id||path.route.some(point=>point.route_type!=="wire"
          ||point.layer!==first.layer||!close(point.width,width)||!Number.isFinite(point.x)||!Number.isFinite(point.y)))
        throw new Error(`Supply link ${plan.name} lacks continuous actual ${width} mm same-layer copper`)
      const wires=path.route.filter(point=>point.route_type==="wire")
      const length=wires.slice(1).reduce((sum,point,index)=>sum+Math.hypot(point.x-wires[index]!.x,point.y-wires[index]!.y),0)
      if(declaration.max_length!==undefined&&(!Number.isFinite(declaration.max_length)||length>declaration.max_length+1e-6))
        throw new Error(`Supply link ${plan.name} exceeds its declared source maximum length`)
      const ids=[first.start_pcb_port_id,last.end_pcb_port_id]
      tracePortIds.set(declaration.name??"",ids)
      if(declaration.name==="DBG_BUFFER_VCC_BRIDGE"){
        const vertices=wires.filter((point,index)=>index===0||!close(point.x,wires[index-1]!.x)||!close(point.y,wires[index-1]!.y))
        if(first.layer!=="top"||vertices.length!==bridgePath.length||vertices.some((point,index)=>
          !close(point.x,bridgePath[index]![0]!)||!close(point.y,bridgePath[index]![1]!)))
          throw new Error("Debug-buffer bridge changed its reviewed 0.20 mm top copper")
      }
      if(declaration.name==="DBG1_BYPASS"||declaration.name==="DBG2_BYPASS"){
        if(first.layer!=="top"||!close(length,1.5))throw new Error("Debug-buffer bypass changed its reviewed 1.5 mm top copper")
      }
      for(const [index,id]of ids.entries()){
        const port=ports.get(id),endpoint=index===0?first:last
        if(!port||!port.source_port_id||!declaration.connected_source_port_ids.includes(port.source_port_id)
          ||!port.layers.includes(endpoint.layer)||!close(port.x,endpoint.x)||!close(port.y,endpoint.y))
          throw new Error(`Supply link ${plan.name} changed a real source endpoint`)
        members.add(id);memberLayers[id]=[...port.layers]
        const origin=circuitJson.find(element=>element.type==="source_port"&&element.source_port_id===port.source_port_id)
        const parent=circuitJson.find(element=>element.type==="source_manually_placed_via"&&origin?.type==="source_port"
          &&element.source_manually_placed_via_id===origin.source_component_id)
        const barrels=circuitJson.filter(element=>element.type==="pcb_via"&&element.pcb_port_ids?.includes(id))
        if(parent?.type==="source_manually_placed_via"&&barrels.length!==1)
          throw new Error(`Supply link ${plan.name} lost its actual declared SourceVia barrel`)
        const via=barrels[0]
        if(via?.type==="pcb_via"){
          const sourceIndex=declaration.connected_source_port_ids.indexOf(port.source_port_id)
          const selector=declaration.display_name?.split(" to ")[sourceIndex]
          const small=plan.smallVia&&selector===`${plan.smallVia.name}.${origin?.type==="source_port"?origin.name:""}`
          if(small)smallViaSeen=true
          if(small&&(!close(via.x,plan.smallVia!.pcbX)||!close(via.y,plan.smallVia!.pcbY)))
            throw new Error("Reviewed small SourceVia moved")
          if(via.source_net_id!==net.source_net_id||!close(via.x,port.x)||!close(via.y,port.y)
            ||!close(via.hole_diameter,small?.2:.3)||!close(via.outer_diameter,small?.5:.7)||!via.tented_on_top||!via.tented_on_bottom
            ||JSON.stringify([...via.layers].sort())!==JSON.stringify(["top","inner1","inner2","bottom"].sort()))
            throw new Error(`Supply link ${plan.name} changed its real full-through barrel`)
          const barrelPorts=(via.pcb_port_ids??[]).map(viaPortId=>ports.get(viaPortId))
          if(parent?.type!=="source_manually_placed_via"||parent.source_net_id!==net.source_net_id
            ||barrelPorts.some(p=>!p||!close(p.x,via.x)||!close(p.y,via.y)||!p.layers.length||!p.layers.every(layer=>via.layers.includes(layer))
              ||!circuitJson.some(element=>element.type==="source_port"&&element.source_port_id===p.source_port_id
                &&element.source_component_id===parent.source_manually_placed_via_id&&p.layers.some(layer=>layer===element.name))))
            throw new Error(`Supply link ${plan.name} has an unattached barrel layer port`)
          for(const p of barrelPorts){if(!p)continue;members.add(p.pcb_port_id);memberLayers[p.pcb_port_id]=[...via.layers]}
          join(barrelPorts.flatMap(p=>p?[p.pcb_port_id]:[]))
        }
      }
      join(ids);traceIds.push(path.pcb_trace_id);sourceTraceIds.push(declaration.source_trace_id)
    }
    if(plan.smallVia&&!smallViaSeen)throw new Error("Reviewed small SourceVia is absent from its complete group")
    const resolve=(selector:string)=>{
      const [name,pin]=selector.split(".")
      if(!name||!pin)throw new Error(`Invalid required source endpoint ${selector}`)
      const component=circuitJson.find(element=>element.type==="source_component"&&element.name===name)
      let sourcePorts=circuitJson.filter(element=>element.type==="source_port"&&component?.type==="source_component"
        &&element.source_component_id===component.source_component_id&&(element.name===pin||element.port_hints?.includes(pin)))
      if(!component){
        const ids=new Set(circuitJson.flatMap(element=>{
          if(element.type!=="source_trace")return[]
          const endpoints=element.display_name?.split(" to ")??[]
          return endpoints.flatMap((endpoint,index)=>endpoint===selector&&element.connected_source_port_ids[index]
            ?[element.connected_source_port_ids[index]!]:[])
        }))
        sourcePorts=circuitJson.filter(element=>element.type==="source_port"&&ids.has(element.source_port_id)
          &&element.name===pin&&circuitJson.some(parent=>parent.type==="source_manually_placed_via"
            &&parent.source_manually_placed_via_id===element.source_component_id&&parent.source_net_id===net.source_net_id))
      }
      const ids=sourcePorts.flatMap(element=>element.type==="source_port"?[element.source_port_id]:[])
      const matches=[...ports.values()].filter(port=>port.source_port_id&&ids.includes(port.source_port_id)&&members.has(port.pcb_port_id))
      if(matches.length!==1||!matches[0]?.source_port_id||graph.getNetConnectedToId(matches[0].source_port_id)!==graph.getNetConnectedToId(net.source_net_id))
        throw new Error(`Supply link ${plan.name} changed required design endpoint ${selector}`)
      return matches[0]!
    }
    const requiredPortIds=[plan.from,plan.to,...(plan.requiredSelectors??[])].map(selector=>resolve(selector).pcb_port_id)
    for(const traceName of plan.traces){
      const selectors=plan.branchEndpoints?.[traceName]??reviewedBranchEnds[traceName]
      if(!selectors)continue
      const ends=selectors.map(selector=>resolve(selector).pcb_port_id),actual=tracePortIds.get(traceName)??[]
      if(actual.length!==2||actual.some(id=>!ends.includes(id)))throw new Error(`Supply branch ${traceName} changed a required real source pad`)
      requiredPortIds.push(...ends.filter(id=>!circuitJson.some(element=>element.type==="pcb_via"&&element.pcb_port_ids?.includes(id))))
    }
    const start=resolve(plan.from),representative=resolve(plan.to),startId=start.pcb_port_id
    const targetVia=circuitJson.find(element=>element.type==="pcb_via"&&element.pcb_port_ids?.includes(representative.pcb_port_id))
    if(!representative||root(startId)!==root(representative.pcb_port_id)||[...members].some(id=>root(id)!==root(startId)))
      throw new Error(`Supply link ${plan.name} has no complete physical path between its required terminals`)
    groups.push({traceName:plan.name,sourceTraceId:sourceTraceIds[0]!,sourceNetId:net.source_net_id,traceIds,
      memberPorts:[...members].map(id=>{const p=ports.get(id)!;return{id,x:p.x,y:p.y}}),memberLayers,
      requiredPortIds:[...new Set(requiredPortIds)],representativePortId:representative.pcb_port_id,
      representativeLayers:targetVia?.type==="pcb_via"?[...targetVia.layers]:undefined})
  }
  const memberIds=groups.flatMap(group=>group.memberPorts.map(port=>port.id))
  if(new Set(memberIds).size!==memberIds.length)throw new Error("Source-owned supply groups cannot claim overlapping real ports")
  return groups
}

export function selectSourcePadRepresentatives({input,groups}:{input:SimpleRouteJson;groups:SourcePadConnection[]}){
  const selected:SourcePadConnection[]=[]
  for(const group of groups){
    const connection=input.connections.find(candidate=>candidate.name===group.sourceNetId)
    if(!connection)continue
    const required=new Set(group.requiredPortIds??group.memberPorts.map(port=>port.id))
    for(const member of group.memberPorts){
      const points=connection.pointsToConnect.filter(point=>point.pcb_port_id===member.id)
      if(!points.length&&!required.has(member.id))continue
      const point=points[0],allowed=group.memberLayers?.[member.id]??["top"]
      const layers=point?.layers??(point?.layer?[point.layer]:[])
      if(points.length!==1||!point||point.pointId!==member.id||!close(point.x,member.x)||!close(point.y,member.y)
        ||!layers.length||!layers.every(layer=>allowed.includes(layer)))
        throw new Error(`Physically joined source terminal changed for ${group.traceName}`)
    }
    const removed=new Set(group.memberPorts.filter(port=>port.id!==group.representativePortId).map(port=>port.id))
    connection.pointsToConnect=connection.pointsToConnect.filter(point=>!point.pcb_port_id||!removed.has(point.pcb_port_id)).map(point=>{
      if(point.pcb_port_id!==group.representativePortId||!group.representativeLayers)return point
      const {layer:discardedLayer,layers:discardedLayers,...identity}=point
      const representative:ConnectionPoint={...identity,layers:["inner2","bottom","top","inner1"].filter(layer=>group.representativeLayers!.includes(layer))}
      return representative
    })
    connection.externallyConnectedPointIds=connection.externallyConnectedPointIds?.map(ids=>ids.filter(id=>!removed.has(id))).filter(ids=>ids.length>1)
    selected.push(structuredClone(group))
  }
  return selected
}
