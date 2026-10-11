import {PrimitiveComponent, type Board, type RootCircuit} from "@tscircuit/core"
import type {CircuitJson} from "circuit-json"
import {tps25947CornerPortAnchors} from "./parts/C3662799"

type Point={x:number;y:number}
export type PortAnchorCorrection={reference:string;jlcpcbPartNumber:string;pin:number;
  pcbPortId:string;sourcePortId:string;before:Point;after:Point;landingDiameter:number;
  remainingCopperMargin:number;nonPortElementsUnchanged:boolean}

const installed=new WeakMap<RootCircuit,PortAnchorCorrection[]>()
const attachedBoards=new WeakSet<Board>()

// A React ref runs before the board is attached to its Circuit. Bootstrap the
// public lifecycle hooks from a geometry-free primitive once its root exists.
class SupplierPortAnchorSetup extends PrimitiveComponent {
  constructor(private install?: (circuit:RootCircuit)=>void){super({})}
  get config(){return {...super.config,componentName:"SupplierPortAnchorSetup"}}
  doInitialInitializePortsFromChildren(){
    if(!this.root)throw new Error("Supplier port anchor setup has no Circuit")
    installSupplierPortAnchors(this.root)
    this.install?.(this.root)
  }
}

export function attachSupplierPortAnchors(board:Board|null,install?: (circuit:RootCircuit)=>void){
  if(!board||attachedBoards.has(board))return
  board.add(new SupplierPortAnchorSetup(install))
  attachedBoards.add(board)
}

function copperMargin({point,polygon,radius}:{point:Point;polygon:Point[];radius:number}){
  let inside=false,distance=Infinity
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
    const a=polygon[j]!,b=polygon[i]!
    if((a.y>point.y)!==(b.y>point.y)&&point.x<(b.x-a.x)*(point.y-a.y)/(b.y-a.y)+a.x)inside=!inside
    const dx=b.x-a.x,dy=b.y-a.y,length2=dx*dx+dy*dy
    const t=length2===0?0:Math.max(0,Math.min(1,((point.x-a.x)*dx+(point.y-a.y)*dy)/length2))
    distance=Math.min(distance,Math.hypot(point.x-a.x-t*dx,point.y-a.y-t*dy))
  }
  return inside?distance-radius:-distance-radius
}

// Public lifecycle and typed DB API: correct routing metadata after exact
// footprint ports attach, before manual/automatic routing reads their points.
// attachSupplierPortAnchors installs this from the board's React ref, including
// generic viewers; explicit build scripts can request the same receipt.
export function installSupplierPortAnchors(circuit:RootCircuit){
  const existing=installed.get(circuit)
  if(existing)return existing
  const corrections:PortAnchorCorrection[]=[]
  installed.set(circuit,corrections)
  const applied=new Set<string>()
  circuit.on("renderable:renderLifecycle:PcbPortAttachment:end",()=>{
    const recipe=tps25947CornerPortAnchors
    for(const source of circuit.db.source_component.list().filter(s=>s.supplier_part_numbers?.jlcpcb?.includes(recipe.jlcpcbPartNumber))){
      const part=circuit.db.pcb_component.list().find(p=>p.source_component_id===source.source_component_id)
      if(!part)continue
      if(part.layer!=="top")throw new Error("Reviewed TPS25947 anchor transform requires a top-side component")
      const radians=part.rotation*Math.PI/180
      const updates:{portId:string;correction:PortAnchorCorrection}[]=[]
      for(const anchor of recipe.anchors){
        const sourcePort=circuit.db.source_port.list().find(p=>p.source_component_id===source.source_component_id&&p.pin_number===anchor.pin)
        const port=sourcePort&&circuit.db.pcb_port.list().find(p=>p.source_port_id===sourcePort.source_port_id)
        if(!port||applied.has(port.pcb_port_id))continue
        const pads=circuit.db.pcb_smtpad.list().filter(p=>p.pcb_component_id===part.pcb_component_id&&p.port_hints?.includes(`pin${anchor.pin}`))
        if(pads.length!==1||pads[0]!.shape!=="polygon")throw new Error(`Expected one exact TPS25947 corner land at pin${anchor.pin}`)
        const after={x:part.center.x+anchor.x*Math.cos(radians)-anchor.y*Math.sin(radians),
          y:part.center.y+anchor.x*Math.sin(radians)+anchor.y*Math.cos(radians)}
        const remainingCopperMargin=copperMargin({point:after,polygon:pads[0]!.points,radius:recipe.landingDiameter/2})
        if(remainingCopperMargin+1e-9<recipe.minimumBoundaryClearance)
          throw new Error(`TPS25947 pin${anchor.pin} landing disk escapes its reviewed land`)
        updates.push({portId:port.pcb_port_id,correction:{reference:source.name??"",jlcpcbPartNumber:recipe.jlcpcbPartNumber,
          pin:anchor.pin,pcbPortId:port.pcb_port_id,sourcePortId:sourcePort!.source_port_id,
          before:{x:port.x,y:port.y},after,landingDiameter:recipe.landingDiameter,
          remainingCopperMargin,nonPortElementsUnchanged:true}})
      }
      if(!updates.length)continue
      const physical=()=>JSON.stringify(circuit.db.toArray().filter(e=>e.type!=="pcb_port"))
      const before=physical()
      for(const update of updates)circuit.db.pcb_port.update(update.portId,update.correction.after)
      if(before!==physical())throw new Error("Port anchor correction changed a non-port element")
      for(const update of updates){applied.add(update.portId);corrections.push(update.correction)}
    }
  })
  return corrections
}

export function verifySupplierPortAnchors({circuitJson,corrections}:{
  circuitJson:CircuitJson;corrections:PortAnchorCorrection[]
}){
  const recipe=tps25947CornerPortAnchors
  const components=circuitJson.filter(e=>e.type==="source_component")
    .filter(e=>e.supplier_part_numbers?.jlcpcb?.includes(recipe.jlcpcbPartNumber))
  const expectedCorrectionCount=components.length*recipe.anchors.length
  const errors:string[]=[]
  if(corrections.length!==expectedCorrectionCount)errors.push(`Expected ${expectedCorrectionCount} exact supplier port corrections; found ${corrections.length}`)
  const seen=new Set<string>()
  for(const correction of corrections){
    const key=`${correction.reference}:${correction.pin}`
    if(seen.has(key))errors.push(`Duplicate port correction ${key}`)
    seen.add(key)
    const port=circuitJson.find(e=>e.type==="pcb_port"&&e.pcb_port_id===correction.pcbPortId)
    const sourcePort=circuitJson.find(e=>e.type==="source_port"&&e.source_port_id===correction.sourcePortId)
    const component=sourcePort?.type==="source_port"?components.find(e=>e.source_component_id===sourcePort.source_component_id):undefined
    if(port?.type!=="pcb_port"||sourcePort?.type!=="source_port"||!component){errors.push(`Missing authenticated final port ${key}`);continue}
    if(component.name!==correction.reference||sourcePort.pin_number!==correction.pin||port.source_port_id!==sourcePort.source_port_id)
      errors.push(`Final supplier port identity changed at ${key}`)
    const part=circuitJson.find(e=>e.type==="pcb_component"&&e.source_component_id===component.source_component_id)
    const anchor=recipe.anchors.find(a=>a.pin===correction.pin)
    const pads=circuitJson.filter(e=>e.type==="pcb_smtpad")
      .filter(e=>e.pcb_component_id===port.pcb_component_id&&e.port_hints?.includes(`pin${correction.pin}`))
    if(part?.type!=="pcb_component"||!anchor||pads.length!==1||pads[0]!.shape!=="polygon"){
      errors.push(`Missing final authentic corner land ${key}`)
    }else{
      const radians=part.rotation*Math.PI/180
      const expected={x:part.center.x+anchor.x*Math.cos(radians)-anchor.y*Math.sin(radians),
        y:part.center.y+anchor.x*Math.sin(radians)+anchor.y*Math.cos(radians)}
      if(part.layer!=="top"||Math.hypot(port.x-expected.x,port.y-expected.y)>1e-9)
        errors.push(`Final port does not match same-import anchor ${key}`)
      if(copperMargin({point:port,polygon:pads[0]!.points,radius:recipe.landingDiameter/2})+1e-9<recipe.minimumBoundaryClearance)
        errors.push(`Final routing landing disk escapes authentic copper ${key}`)
    }
    if(Math.hypot(port.x-correction.after.x,port.y-correction.after.y)>1e-9)
      errors.push(`Final supplier port position was overwritten at ${key}`)
    if(!correction.nonPortElementsUnchanged||correction.remainingCopperMargin+1e-9<recipe.minimumBoundaryClearance)
      errors.push(`Supplier port preservation/landing proof failed at ${key}`)
  }
  for(const component of components)for(const anchor of recipe.anchors)
    if(!seen.has(`${component.name}:${anchor.pin}`))errors.push(`Missing final anchor ${component.name}:pin${anchor.pin}`)
  return {pass:errors.length===0,expectedCorrectionCount,corrections,errors}
}
