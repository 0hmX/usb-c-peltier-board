import type {CircuitJson} from "circuit-json"
import type {ConnectionPoint,SimpleRouteJson} from "@tscircuit/capacity-autorouter"
import {captureSourceBusConnections,selectSourceBusRepresentatives,type SourceBusConnection} from "./source-bus-connections"
import {captureSourcePadConnections,selectSourcePadRepresentatives,type SourcePadConnection} from "./source-pad-connections"
import {i2cBranchConnectionPlans} from "./i2c-branch-routes"

export const sourceTerminalEscapePlans=[
  {name:"INPUT_ENABLE_ESCAPE",net:"INPUT_ENABLE",from:"U_INPUT.pin1",to:"INPUT_ENABLE_ESCAPE_VIA.top"},
  {name:"INPUT_FAULT_ESCAPE",net:"INPUT_FAULT_N",from:"U_INPUT.pin4",to:"INPUT_FAULT_ESCAPE_VIA.top"},
  {name:"CLOCK_VCC_OFF_PAD",net:"V3V3",from:"U_CLOCK_BUFFER.pin5",to:"CLOCK_VCC_ESCAPE.top"},
  {name:"INPUT_CLEAR_PULLUP_VCC_OFF_PAD",net:"V3V3",from:"R237.pin1",to:"INPUT_CLEAR_PULLUP_VCC_ESCAPE.top"},
  {name:"FAN_ENABLE_VCC_OFF_PAD",net:"V3V3",from:"U_FAN.pin5",to:"FAN_ENABLE_VCC_ESCAPE.top"},
  {name:"USB_CC2_ESCAPE",net:"USB_CC2",from:"J_USB.pin12",to:"USB_CC2_ESCAPE_VIA.top"},
  {name:"USB_CC1_ESCAPE",net:"USB_CC1",from:"J_USB.pin6",to:"USB_CC1_ESCAPE_VIA.top"},
] as const
const close=(a:number,b:number)=>Math.abs(a-b)<1e-6
export type SourceCopperProof={circuitJson:CircuitJson;sourceSha256:string;runtimeSha256:string}
export type TerminalRepresentative={traceName:string;traceId:string;sourceTraceId:string;viaId:string;
  sourceNetId:string;padPortId:string;viaPortId:string;pad:{x:number;y:number};via:{x:number;y:number};padLayers:string[];layers:string[]}
let proof:{sourceSha256:string;runtimeSha256:string;escapes:TerminalRepresentative[];busGroups:SourceBusConnection[];padGroups:SourcePadConnection[]}|undefined

// The builder supplies a public CircuitJson snapshot before native routing.
// Exact source copper proves physical equivalence; conservative obstacle boxes
// and common logical net labels cannot prove a connected escape.
export function setGuardedSourceCopperProof({circuitJson,sourceSha256,runtimeSha256}:SourceCopperProof){
  const snapshot=structuredClone(circuitJson)
  const escapes:TerminalRepresentative[]=[]
  for(const {name:traceName,net,from,to} of sourceTerminalEscapePlans){
    const sourceTraces=snapshot.filter(element=>element.type==="source_trace"&&element.name===traceName)
    if(!sourceTraces.length)continue
    if(sourceTraces.length!==1)throw new Error(`Duplicate source escape ${traceName}`)
    const sourceTrace=sourceTraces[0]
    if(sourceTrace.type!=="source_trace")throw new Error("Invalid source escape record")
    const traces=snapshot.filter(element=>element.type==="pcb_trace"&&element.source_trace_id===sourceTrace.source_trace_id)
    if(traces.length!==1)throw new Error(`Escape ${traceName} requires exactly one actual route`)
    const trace=traces[0]
    if(trace.type!=="pcb_trace")throw new Error("Invalid escape copper record")
    const first=trace.route[0],last=trace.route.at(-1)
    if(!first||!last||first.route_type!=="wire"||last.route_type!=="wire"
      ||!first.start_pcb_port_id||!last.end_pcb_port_id
      ||trace.route.some(point=>point.route_type!=="wire"||point.layer!=="top"||!close(point.width,0.2)
        ||!Number.isFinite(point.x)||!Number.isFinite(point.y)))
      throw new Error(`Escape ${traceName} must retain its actual 0.20 mm top path and port ends`)
    const pad=snapshot.find(element=>element.type==="pcb_port"&&element.pcb_port_id===first.start_pcb_port_id)
    const viaPort=snapshot.find(element=>element.type==="pcb_port"&&element.pcb_port_id===last.end_pcb_port_id)
    const via=snapshot.find(element=>element.type==="pcb_via"&&element.pcb_port_ids?.includes(last.end_pcb_port_id!))
    const sourceNet=snapshot.find(element=>element.type==="source_net"&&element.name===net)
    const padSource=snapshot.find(element=>element.type==="source_port"&&pad?.type==="pcb_port"&&element.source_port_id===pad.source_port_id)
    const [componentName,pin]=from.split(".")
    const component=snapshot.find(element=>element.type==="source_component"&&element.name===componentName)
    const viaSource=snapshot.find(element=>element.type==="source_port"&&viaPort?.type==="pcb_port"&&element.source_port_id===viaPort.source_port_id)
    const viaParent=snapshot.find(element=>element.type==="source_manually_placed_via"&&viaSource?.type==="source_port"
      &&element.source_manually_placed_via_id===viaSource.source_component_id)
    if(!pad||pad.type!=="pcb_port"||!viaPort||viaPort.type!=="pcb_port"||!via||via.type!=="pcb_via"
      ||component?.type!=="source_component"||padSource?.type!=="source_port"||!pin
      ||padSource.source_component_id!==component.source_component_id
      ||(padSource.name!==pin&&!padSource.port_hints?.includes(pin))
      ||sourceTrace.display_name!==`${from} to ${to}`||viaSource?.type!=="source_port"||viaSource.name!=="top"
      ||viaParent?.type!=="source_manually_placed_via"||viaParent.source_net_id!==via.source_net_id
      ||pad.layers.length!==1||pad.layers[0]!=="top"||!viaPort.layers.includes("top")
      ||!viaPort.layers.every(layer=>via.layers.includes(layer))
      ||!close(first.x,pad.x)||!close(first.y,pad.y)||!close(last.x,viaPort.x)||!close(last.y,viaPort.y)
      ||!close(last.x,via.x)||!close(last.y,via.y)||!close(via.hole_diameter,0.3)||!close(via.outer_diameter,0.7)
      ||!sourceNet||sourceNet.type!=="source_net"||via.source_net_id!==sourceNet.source_net_id
      ||!sourceTrace.connected_source_net_ids?.includes(sourceNet.source_net_id)
      ||via.tented_on_top!==true||via.tented_on_bottom!==true
      ||JSON.stringify([...via.layers].sort())!==JSON.stringify(["top","inner1","inner2","bottom"].sort())
      ||sourceTrace.connected_source_port_ids.length!==2
      ||!sourceTrace.connected_source_port_ids.includes(pad.source_port_id)
      ||!sourceTrace.connected_source_port_ids.includes(viaPort.source_port_id))
      throw new Error(`Escape ${traceName} lacks authentic same-source port ends and a full through barrel`)
    escapes.push({traceName,traceId:trace.pcb_trace_id,sourceTraceId:sourceTrace.source_trace_id,
      viaId:via.pcb_via_id,sourceNetId:sourceNet.source_net_id,padPortId:pad.pcb_port_id,viaPortId:viaPort.pcb_port_id,
      pad:{x:pad.x,y:pad.y},via:{x:via.x,y:via.y},padLayers:[...pad.layers],layers:[...via.layers]})
  }
  const busGroups=captureSourceBusConnections({circuitJson:snapshot,branchPlans:i2cBranchConnectionPlans})
  const padGroups=captureSourcePadConnections({circuitJson:snapshot})
  proof={sourceSha256,runtimeSha256,escapes,busGroups,padGroups}
  return structuredClone(proof)
}

// Retain the real barrel's existing PCB-port identity. Only the redundant pad
// target is removed; the preserved source path still physically includes it.
export function selectSourceTerminalRepresentatives({input}:{input:SimpleRouteJson}){
  const adaptedInput=structuredClone(input)
  const representatives:TerminalRepresentative[]=[]
  for(const escape of proof?.escapes??[]){
    const connection=adaptedInput.connections.find(candidate=>candidate.pointsToConnect.some(point=>point.pcb_port_id===escape.padPortId))
    if(!connection)continue
    const pad=connection.pointsToConnect.find(point=>point.pcb_port_id===escape.padPortId)
    const barrel=connection.pointsToConnect.find(point=>point.pcb_port_id===escape.viaPortId)
    const attested=connection.externallyConnectedPointIds?.some(group=>group.includes(escape.padPortId)&&group.includes(escape.viaPortId))
    const physicalBarrel=adaptedInput.obstacles.find(obstacle=>obstacle.circuitJsonMetadata?.pcb_via_id===escape.viaId)
    const padLayers=pad?.layers??(pad?.layer?[pad.layer]:[])
    const barrelLayers=barrel?.layers??(barrel?.layer?[barrel.layer]:[])
    if(!pad||!barrel||pad.pointId!==escape.padPortId||barrel.pointId!==escape.viaPortId
      ||!padLayers.length||!padLayers.every(layer=>escape.padLayers.includes(layer))
      ||!barrelLayers.length||!barrelLayers.every(layer=>escape.layers.includes(layer))
      ||connection.pointsToConnect.filter(point=>point.pcb_port_id===escape.padPortId).length!==1
      ||connection.pointsToConnect.filter(point=>point.pcb_port_id===escape.viaPortId).length!==1
      ||!attested||connection.name!==escape.sourceNetId||!close(pad.x,escape.pad.x)||!close(pad.y,escape.pad.y)
      ||!close(barrel.x,escape.via.x)||!close(barrel.y,escape.via.y)||!physicalBarrel
      ||!close(physicalBarrel.center.x,escape.via.x)||!close(physicalBarrel.center.y,escape.via.y)
      ||!close(physicalBarrel.width,0.7)||!close(physicalBarrel.height,0.7)
      ||!escape.layers.every(layer=>physicalBarrel.layers.includes(layer))
      ||!physicalBarrel.connectedTo.includes(connection.name)||!physicalBarrel.connectedTo.includes(escape.viaPortId))
      throw new Error(`Escape ${escape.traceName} changed its actual endpoints, barrel or source connectivity`)
    // The composite island validates the mandatory live pad before removing
    // it. Every escape barrel is a proved member of that connected island;
    // the island may retain a different genuine terminal as its representative.
    const owningPadGroup=proof?.padGroups.find(group=>group.sourceNetId===escape.sourceNetId
      &&group.traceIds.includes(escape.traceId)
      &&group.memberPorts.some(port=>port.id===escape.viaPortId)
      &&group.memberPorts.some(port=>port.id===escape.padPortId))
    if(owningPadGroup){representatives.push(structuredClone(escape));continue}
    const {layer:discardedLayer,layers:discardedLayers,...identity}=barrel
    // Prefer the existing barrel interior for the continuation. Top-first
    // native routing can otherwise introduce another adjacent transfer drill.
    const preferredLayers=["inner2","bottom","top","inner1"].filter(layer=>escape.layers.includes(layer))
    const representative:ConnectionPoint={...identity,layers:preferredLayers}
    connection.pointsToConnect=connection.pointsToConnect.filter(point=>point.pcb_port_id!==escape.padPortId)
      .map(point=>point.pcb_port_id===escape.viaPortId?representative:point)
    connection.externallyConnectedPointIds=connection.externallyConnectedPointIds?.map(group=>group.filter(id=>id!==escape.padPortId)).filter(group=>group.length>1)
    representatives.push(structuredClone(escape))
  }
  const busRepresentatives=selectSourceBusRepresentatives({input:adaptedInput,groups:proof?.busGroups??[]})
  const padRepresentatives=selectSourcePadRepresentatives({input:adaptedInput,groups:proof?.padGroups??[]})
  return {adaptedInput,representatives,busRepresentatives,padRepresentatives,sourceSha256:proof?.sourceSha256,runtimeSha256:proof?.runtimeSha256}
}
