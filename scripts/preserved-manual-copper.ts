import type { CircuitJson } from "circuit-json"
import type { AutoroutingStartEvent } from "@tscircuit/core"
import {getFullConnectivityMapFromCircuitJson} from "circuit-json-to-connectivity-map"
import {tracePortCopperContact} from "./source-ground-pad-copper"
import {auditSourceTraceWidths} from "./source-trace-widths"
import {resolveSourceTraceEndpoints} from "./resolve-source-trace-endpoints"

export function captureInitialCopper(circuitJson: CircuitJson) {
  const snapshot=structuredClone(circuitJson)
  return {circuitJson:snapshot,traces:snapshot.filter(element=>element.type==="pcb_trace"),
    vias:snapshot.filter(element=>element.type==="pcb_via")}
}
export type InitialCopper = ReturnType<typeof captureInitialCopper>

export function verifyManualPreloads({initialCopper,input}: {initialCopper: InitialCopper; input: AutoroutingStartEvent["simpleRouteJson"]}) {
  const manualTraceIds=new Set(initialCopper.traces.map(trace=>trace.pcb_trace_id))
  const mutableManualTraces=(input.traces??[]).filter(trace=>manualTraceIds.has(trace.pcb_trace_id))
  return mutableManualTraces.map(trace=>`Source-owned trace remains mutable in supply input: ${trace.pcb_trace_id}`)
}

export function verifyPreservedManualCopper({initialCopper,circuitJson,publicSourceMaterialization=false}: {
  initialCopper: InitialCopper; circuitJson: CircuitJson; publicSourceMaterialization?:boolean
}) {
  const traces=circuitJson.filter(element=>element.type==="pcb_trace")
  const vias=circuitJson.filter(element=>element.type==="pcb_via")
  const ports=circuitJson.filter(element=>element.type==="pcb_port")
  const pours=circuitJson.filter(element=>element.type==="pcb_copper_pour")
  const sourceGraph=getFullConnectivityMapFromCircuitJson(initialCopper.circuitJson.filter(element=>element.type.startsWith("source_")))
  const originalPorts=initialCopper.circuitJson.filter(element=>element.type==="pcb_port")
  const sourcePorts=initialCopper.circuitJson.filter(element=>element.type==="source_port")
  const board=initialCopper.circuitJson.find(element=>element.type==="pcb_board")
  const fullStackLayers=["top",...Array.from({length:Math.max(0,(board?.num_layers??2)-2)},(_,index)=>`inner${index+1}`),"bottom"]
  const sameLayers=(a:unknown,b:unknown)=>JSON.stringify(Array.isArray(a)?[...a].sort():a)
    ===JSON.stringify(Array.isArray(b)?[...b].sort():b)
  const connectsTo=(trace:typeof traces[number]):string[]=>"connectsTo" in trace&&Array.isArray(trace.connectsTo)
    ?trace.connectsTo.filter((id):id is string=>typeof id==="string"):[]
  // The public source graph omits named-via ownership. Add only original ports
  // backed by the original same-net barrel, never final route annotations.
  for(const sourceVia of initialCopper.circuitJson.filter(element=>element.type==="source_manually_placed_via")){
    if(!sourceVia.source_net_id)continue
    const ownedPorts=sourcePorts.filter(port=>port.source_component_id===sourceVia.source_manually_placed_via_id)
      .filter(sourcePort=>originalPorts.some(port=>port.source_port_id===sourcePort.source_port_id
        &&initialCopper.vias.some(via=>via.source_net_id===sourceVia.source_net_id
          &&via.pcb_port_ids?.includes(port.pcb_port_id)&&via.x===port.x&&via.y===port.y
          &&port.layers.every(layer=>via.layers.includes(layer)))))
    sourceGraph.addConnections([[sourceVia.source_net_id,...ownedPorts.map(port=>port.source_port_id)]])
  }
  const physicalRoute=(route:typeof traces[number]["route"])=>route.map(point=>{
    if(point.route_type==="through_pad")return point
    const {copper_pour_id,is_inside_copper_pour,...physical}=point
    if(physical.route_type==="via"&&"layers" in physical){
      const {layers,...transition}=physical
      return transition
    }
    if(physical.route_type!=="wire")return physical
    const {start_pcb_port_id,end_pcb_port_id,...wire}=physical
    return wire
  })
  const errors:string[]=[]
  const endpointMigrations:{traceId:string;portId:string;contactAreaMm2:number}[]=[]
  const barrelMappings:{originalViaId:string;actualViaId:string}[]=[]
  if(publicSourceMaterialization){
    if(new Set(traces.map(trace=>trace.pcb_trace_id)).size!==traces.length
      ||new Set(vias.map(via=>via.pcb_via_id)).size!==vias.length)
      errors.push("Public source materialization duplicated a physical trace or barrel identity")
    for(const before of initialCopper.circuitJson.filter(element=>element.type.startsWith("source_")
      ||["pcb_component","pcb_port","pcb_smtpad","pcb_plated_hole","pcb_hole","pcb_board"].includes(element.type))){
      const idKey=`${before.type}_id`,id=(before as unknown as Record<string,unknown>)[idKey]
      const matches=circuitJson.filter(element=>element.type===before.type&&(element as unknown as Record<string,unknown>)[idKey]===id)
      const actual=matches[0]?{...matches[0]}:undefined
      if(before.type==="pcb_component"&&before.supplier_pin1_location_map===undefined&&actual?.type==="pcb_component")
        delete actual.supplier_pin1_location_map
      if(matches.length!==1||JSON.stringify(actual)!==JSON.stringify(before))
        errors.push(`Public source materialization changed a source definition or real land/port: ${before.type}/${id}`)
    }
    const widths=auditSourceTraceWidths(circuitJson,traces.filter(trace=>initialCopper.traces.some(before=>before.pcb_trace_id===trace.pcb_trace_id)))
    if(!widths.valid)errors.push("Public source materialization violated an original SOURCE minimum width")
  }
  const endpointAnnotations:{traceId:string;pointIndex:number;field:string;portId:string}[]=[]
  const pourAnnotations:{traceId:string;pointIndex:number;pourId:string}[]=[]
  const viaLayerAnnotations:{traceId:string;pointIndex:number;viaId:string;layers:typeof vias[number]["layers"]}[]=[]
  for(const before of initialCopper.traces){
    const after=traces.find(trace=>trace.pcb_trace_id===before.pcb_trace_id)
    if(!after||after.source_trace_id!==before.source_trace_id||JSON.stringify(physicalRoute(after.route))!==JSON.stringify(physicalRoute(before.route))){
      errors.push(`Source-owned route changed or disappeared: ${before.pcb_trace_id}`)
      continue
    }
    if(publicSourceMaterialization){
      const declaration=initialCopper.circuitJson.find(element=>element.type==="source_trace"&&element.source_trace_id===before.source_trace_id)
      const length=after.route.slice(1).reduce((total,point,index)=>{
        const prior=after.route[index]
        return total+(point.route_type==="wire"&&prior?.route_type==="wire"&&point.layer===prior.layer?Math.hypot(point.x-prior.x,point.y-prior.y):0)
      },0)
      if(declaration?.type!=="source_trace"||declaration.max_length!==undefined
        &&(!Number.isFinite(declaration.max_length)||length>declaration.max_length+1e-6))
        errors.push(`Public source materialization changed or exceeded an original SOURCE bound: ${before.pcb_trace_id}`)
      for(const id of connectsTo(after)){
        const port=ports.find(candidate=>candidate.pcb_port_id===id)
        if(!port||!before.source_trace_id||!sourceGraph.areIdsConnected(before.source_trace_id,port.source_port_id))
          errors.push(`Public source materialization added foreign endpoint ownership: ${before.pcb_trace_id}/${id}`)
      }
    }
    for(const [pointIndex,point] of after.route.entries()){
      const original=before.route[pointIndex]
      if(point.route_type==="via"&&original?.route_type==="via"){
        if("layers" in original&&!sameLayers("layers" in point?point.layers:undefined,original.layers))
          errors.push(`Source-owned via layer annotation changed: ${before.pcb_trace_id}/${pointIndex}`)
        else if("layers" in point&&!("layers" in original)){
          const barrel=initialCopper.vias.find(via=>via.x===point.x&&via.y===point.y
            &&via.from_layer===point.from_layer&&via.to_layer===point.to_layer)
          if(!barrel||JSON.stringify(point.layers)!==JSON.stringify(fullStackLayers)
            ||barrel.layers.length!==fullStackLayers.length||new Set(barrel.layers).size!==fullStackLayers.length
            ||!barrel.layers.every(layer=>fullStackLayers.includes(layer)))
            errors.push(`Source-owned via layer annotation lacks its original full barrel: ${before.pcb_trace_id}/${pointIndex}`)
          else viaLayerAnnotations.push({traceId:before.pcb_trace_id,pointIndex,viaId:barrel.pcb_via_id,layers:barrel.layers})
        }
      }
      if(point.route_type==="wire"&&original?.route_type==="wire")for(const field of ["start_pcb_port_id","end_pcb_port_id"] as const){
        const portId=point[field]
        const originalId=original[field]
        if(publicSourceMaterialization&&originalId!==undefined){
          const port=ports.find(candidate=>candidate.pcb_port_id===originalId)
          const declaration=initialCopper.circuitJson.find(element=>element.type==="source_trace"&&element.source_trace_id===before.source_trace_id)
          const contact=tracePortCopperContact(circuitJson,originalId,after,point.layer)
          if(!port||!connectsTo(after).includes(originalId)||declaration?.type!=="source_trace"
            ||!declaration.connected_source_port_ids.includes(port.source_port_id)||!port.layers.includes(point.layer)
            ||Math.hypot(point.x-port.x,point.y-port.y)>1e-6||!contact.valid||portId!==undefined&&portId!==originalId)
            errors.push(`Public source materialization lost an original finite owning endpoint: ${before.pcb_trace_id}/${originalId}`)
          else if(portId===undefined)endpointMigrations.push({traceId:before.pcb_trace_id,portId:originalId,contactAreaMm2:contact.contactAreaMm2})
        }else if(originalId!==undefined&&portId!==originalId)
          errors.push(`Source-owned endpoint changed: ${before.pcb_trace_id}/${pointIndex}/${field}`)
        if(portId!==undefined&&portId!==original[field]){
          const port=ports.find(candidate=>candidate.pcb_port_id===portId)
          const originalPort=originalPorts.find(candidate=>candidate.pcb_port_id===portId)
          if(!before.source_trace_id||!port||!originalPort||port.source_port_id!==originalPort.source_port_id
            ||port.x!==originalPort.x||port.y!==originalPort.y||JSON.stringify(port.layers)!==JSON.stringify(originalPort.layers)
            ||!port.layers.includes(point.layer)||Math.hypot(point.x-port.x,point.y-port.y)>1e-6
            ||!sourceGraph.areIdsConnected(before.source_trace_id,originalPort.source_port_id))
            errors.push(`Source-owned endpoint annotation has a foreign or unknown source net: ${before.pcb_trace_id}/${pointIndex}/${field}`)
          else endpointAnnotations.push({traceId:before.pcb_trace_id,pointIndex,field,portId})
        }
      }
      if(point.route_type==="through_pad"||original?.route_type==="through_pad")continue
      if(point.is_inside_copper_pour===true&&!point.copper_pour_id)
        errors.push(`Source-owned pour annotation lacks a real pour: ${before.pcb_trace_id}/${pointIndex}`)
      if(point.copper_pour_id){
        const pour=pours.find(candidate=>candidate.pcb_copper_pour_id===point.copper_pour_id)
        if(!before.source_trace_id||!pour?.source_net_id||!sourceGraph.areIdsConnected(before.source_trace_id,pour.source_net_id))
          errors.push(`Source-owned pour annotation has a foreign or unknown source net: ${before.pcb_trace_id}/${pointIndex}`)
        else if(point.copper_pour_id!==original?.copper_pour_id||point.is_inside_copper_pour!==original?.is_inside_copper_pour)
          pourAnnotations.push({traceId:before.pcb_trace_id,pointIndex,pourId:point.copper_pour_id})
      }
    }
  }
  // Inline PCB via IDs are allocated again by the public renderer. Authenticate
  // their genuine SOURCE owner and exact transition, never the allocation ordinal.
  const traceOwnedBarrelIdentities:{sourceTraceId:string;traceId:string;transitionIndex:number;
    originalViaId:string;actualViaId:string;finiteContactLowerBoundsMm2:number[]}[]=[]
  const traceOwnedBarrel=(before:typeof vias[number])=>{
    const originalOwner=initialCopper.traces.find(trace=>trace.pcb_trace_id===before.pcb_trace_id)
    const actualOwner=traces.find(trace=>trace.pcb_trace_id===before.pcb_trace_id)
    const originalSource=initialCopper.circuitJson.find(element=>element.type==="source_trace"
      &&element.source_trace_id===originalOwner?.source_trace_id)
    const actualSource=circuitJson.find(element=>element.type==="source_trace"
      &&element.source_trace_id===originalOwner?.source_trace_id)
    if(!originalOwner||!actualOwner||originalSource?.type!=="source_trace"||actualSource?.type!=="source_trace"
      ||actualOwner.source_trace_id!==originalOwner.source_trace_id
      ||JSON.stringify(originalSource)!==JSON.stringify(actualSource)
      ||before.subcircuit_id!==originalOwner.subcircuit_id||actualOwner.subcircuit_id!==originalOwner.subcircuit_id
      ||before.subcircuit_connectivity_map_key!==originalSource.subcircuit_connectivity_map_key)return undefined
    // Original imported-pin or registered-head identities remain byte-exact.
    for(const id of actualSource.connected_source_port_ids)for(const type of ["source_port","pcb_port"] as const){
      const originals=initialCopper.circuitJson.filter(element=>element.type===type
        &&"source_port_id" in element&&element.source_port_id===id)
      const actuals=circuitJson.filter(element=>element.type===type
        &&"source_port_id" in element&&element.source_port_id===id)
      if(originals.length!==1||actuals.length!==1
        ||JSON.stringify(originals[0])!==JSON.stringify(actuals[0]))return undefined
    }
    const transitions=(trace:typeof traces[number])=>trace.route.flatMap((point,index)=>point.route_type==="via"
      &&point.x===before.x&&point.y===before.y&&point.from_layer===before.from_layer&&point.to_layer===before.to_layer?[index]:[])
    const originalTransitions=transitions(originalOwner),actualTransitions=transitions(actualOwner)
    if(originalTransitions.length!==1||actualTransitions.length!==1
      ||originalTransitions[0]!==actualTransitions[0])return undefined
    const transitionIndex=originalTransitions[0]!
    const matches=vias.filter(via=>via.pcb_trace_id===before.pcb_trace_id&&via.x===before.x&&via.y===before.y
      &&via.hole_diameter===before.hole_diameter&&via.outer_diameter===before.outer_diameter
      &&via.from_layer===before.from_layer&&via.to_layer===before.to_layer
      &&via.subcircuit_id===before.subcircuit_id&&via.source_net_id===before.source_net_id
      &&via.subcircuit_connectivity_map_key===before.subcircuit_connectivity_map_key)
    const actual=matches.length===1?matches[0]:undefined
    if(!actual||actual.layers.length!==fullStackLayers.length||new Set(actual.layers).size!==fullStackLayers.length
      ||!actual.layers.every(layer=>fullStackLayers.includes(layer))
      ||!resolveSourceTraceEndpoints({circuit:circuitJson,trace:actualOwner,source:actualSource}).valid)return undefined
    // On each genuine adjacent wire, an inscribed square provides a conservative
    // positive contact area inside the drilled annulus, without synthetic ports.
    const finiteContactLowerBoundsMm2=([-1,1] as const).map(direction=>{
      const center=actualOwner.route[transitionIndex+direction]
      const other=actualOwner.route[transitionIndex+2*direction]
      const layer=direction===-1?before.from_layer:before.to_layer
      if(center?.route_type!=="wire"||other?.route_type!=="wire"||center.layer!==layer||other.layer!==layer
        ||center.x!==actual.x||center.y!==actual.y)return 0
      const width=Math.min(center.width,center.start_width??center.width,center.end_width??center.width,
        other.width,other.start_width??other.width,other.end_width??other.width)
      const reach=Math.min(actual.outer_diameter/2,Math.hypot(other.x-center.x,other.y-center.y)+width/4)
      const halfSide=Math.min(width/8,(reach-actual.hole_diameter/2)/(4*Math.SQRT2))
      return Number.isFinite(halfSide)&&halfSide>0?4*halfSide*halfSide:0
    })
    if(!finiteContactLowerBoundsMm2.every(area=>area>1e-6))return undefined
    traceOwnedBarrelIdentities.push({sourceTraceId:actualSource.source_trace_id,traceId:actualOwner.pcb_trace_id,
      transitionIndex,originalViaId:before.pcb_via_id,actualViaId:actual.pcb_via_id,finiteContactLowerBoundsMm2})
    return actual
  }
  for(const before of initialCopper.vias){
    const matches=publicSourceMaterialization?vias.filter(via=>via.x===before.x&&via.y===before.y
      &&via.source_net_id===before.source_net_id&&via.subcircuit_connectivity_map_key===before.subcircuit_connectivity_map_key
      &&via.hole_diameter===before.hole_diameter&&via.outer_diameter===before.outer_diameter):[]
    const after=before.pcb_trace_id?traceOwnedBarrel(before)
      :publicSourceMaterialization?(matches.length===1?matches[0]:undefined):vias.find(via=>via.pcb_via_id===before.pcb_via_id)
    if(!after||after.x!==before.x||after.y!==before.y||after.hole_diameter!==before.hole_diameter
      ||after.outer_diameter!==before.outer_diameter||!sameLayers(after.layers,before.layers)
      ||after.tented_on_top!==before.tented_on_top||after.tented_on_bottom!==before.tented_on_bottom
      ||(before.source_net_id!==undefined&&after.source_net_id!==before.source_net_id))
      errors.push(`Source-owned barrel changed or disappeared: ${before.pcb_via_id}`)
    else if(publicSourceMaterialization||before.pcb_trace_id!==undefined){
      if(after.pcb_group_id!==before.pcb_group_id){
        const originalGroup=initialCopper.circuitJson.find(element=>element.type==="pcb_group"&&element.pcb_group_id===before.pcb_group_id)
        const actualGroup=circuitJson.find(element=>element.type==="pcb_group"&&element.pcb_group_id===before.pcb_group_id)
        const originalOwner=initialCopper.traces.find(trace=>trace.pcb_trace_id===before.pcb_trace_id)
        const actualOwner=traces.find(trace=>trace.pcb_trace_id===before.pcb_trace_id)
        if(after.pcb_group_id!==undefined||originalGroup?.type!=="pcb_group"||actualGroup?.type!=="pcb_group"
          ||originalGroup.subcircuit_id!==before.subcircuit_id||actualGroup.subcircuit_id!==originalGroup.subcircuit_id
          ||actualGroup.source_group_id!==originalGroup.source_group_id||!originalOwner||originalOwner.pcb_group_id!==before.pcb_group_id
          ||originalOwner.subcircuit_id!==before.subcircuit_id||!actualOwner
          ||actualOwner.source_trace_id!==originalOwner.source_trace_id||actualOwner.subcircuit_id!==originalOwner.subcircuit_id
          ||actualOwner.pcb_group_id!==undefined)
          errors.push(`Public source materialization reassigned an original barrel group: ${before.pcb_via_id}`)
      }
      const physical=(via:typeof before)=>{const {pcb_via_id,pcb_group_id,layers,...rest}=via;return {...rest,layers:[...layers].sort()}}
      if(JSON.stringify(physical(after))!==JSON.stringify(physical(before)))
        errors.push(`Public source materialization changed an original barrel owner/span/port: ${before.pcb_via_id}`)
      else if(after.pcb_via_id!==before.pcb_via_id||JSON.stringify(after.layers)!==JSON.stringify(before.layers))
        barrelMappings.push({originalViaId:before.pcb_via_id,actualViaId:after.pcb_via_id})
    }
  }
  return {pass:errors.length===0,sourceOwnedTraceCount:initialCopper.traces.length,sourceOwnedViaCount:initialCopper.vias.length,
    publicSourceMaterialization,endpointMigrations,barrelMappings,traceOwnedBarrelIdentities,endpointAnnotations,pourAnnotations,viaLayerAnnotations,errors}
}
