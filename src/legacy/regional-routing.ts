import type {SimpleRouteJson,Obstacle} from "@tscircuit/capacity-autorouter"

type Bounds=SimpleRouteJson["bounds"]
const requireProof=(ok:unknown,message:string)=>{if(!ok)throw new Error(message)}
const finiteBounds=(b:Bounds)=>Object.values(b).every(Number.isFinite)&&b.minX<b.maxX&&b.minY<b.maxY
const gap=(o:Obstacle,b:Bounds)=>Math.hypot(
  Math.max(b.minX-o.center.x-o.width/2,o.center.x-o.width/2-b.maxX,0),
  Math.max(b.minY-o.center.y-o.height/2,o.center.y-o.height/2-b.maxY,0))
const contains=(b:Bounds,x:number,y:number,radius=0,edgeClearance=0)=>
  Number.isFinite(x)&&Number.isFinite(y)&&Number.isFinite(radius)&&radius>=0
  &&x-radius>=b.minX+edgeClearance-1e-8&&x+radius<=b.maxX-edgeClearance+1e-8
  &&y-radius>=b.minY+edgeClearance-1e-8&&y+radius<=b.maxY-edgeClearance+1e-8

// Public SRJ adapter. Run existing SOURCE/ownership/full-barrel guards
// first, then pass this unchanged-obstacle input to the public Solver9 constructor.
export function restrictRoutingBounds(input:SimpleRouteJson,region:Bounds){
  requireProof(finiteBounds(input.bounds)&&finiteBounds(region),"Finite nonempty routing bounds required")
  requireProof(region.minX>=input.bounds.minX&&region.maxX<=input.bounds.maxX
    &&region.minY>=input.bounds.minY&&region.maxY<=input.bounds.maxY,"Region exceeds the actual physical board")
  requireProof(!input.outline?.length,"This reviewed restriction requires the actual rectangular board input")
  requireProof((input.traces??[]).length===0,"Unchanged fixed copper must already be represented by the complete guards")
  requireProof(input.connections.every(c=>!c.isOffBoard&&c.pointsToConnect.every(p=>contains(region,p.x,p.y))),
    "Region excludes a genuine routing target or requests off-board routing")
  const clearanceReach=Math.max(input.defaultObstacleMargin??0,input.minTraceToPadEdgeClearance??0,
    input.minTraceToHoleEdgeClearance??0,input.minViaEdgeToPadEdgeClearance??0,input.minViaHoleEdgeToViaHoleEdgeClearance??0,
    input.minPlatedHoleDrillEdgeToDrillEdgeClearance??0,input.minPadEdgeToPadEdgeClearance??0,input.minBoardEdgeClearance??0)
  const internallyDiscarded=input.obstacles.filter(o=>!(o.connectedTo?.length||o.offBoardConnectsTo?.length||o.netIsAssignable)&&gap(o,region)>0)
  for(const o of internallyDiscarded){
    requireProof(Number.isFinite(o.center.x)&&Number.isFinite(o.center.y)&&Number.isFinite(o.width)&&Number.isFinite(o.height)
      &&o.width>0&&o.height>0&&!(o.ccwRotationDegrees??0),"Discarded obstacle has unreviewed finite/rotated geometry")
    requireProof(gap(o,region)>=clearanceReach-1e-8,"Discarded obstacle clearance reaches the allowed physical copper region")
  }
  return {input:{...structuredClone(input),bounds:structuredClone(region)},internallyDiscarded,
    minimumDiscardedObstacleGapMm:internallyDiscarded.length?Math.min(...internallyDiscarded.map(o=>gap(o,region))):null,clearanceReach}
}

// Raw native evidence retains the smaller bounds. Only the public/restored
// result regains the actual board bounds after all returned finite copper fits.
export function restorePhysicalBoardBounds({beforeRestriction,regionalInput,nativeOutput}:{
  beforeRestriction:SimpleRouteJson;regionalInput:SimpleRouteJson;nativeOutput:SimpleRouteJson
}){
  const expected=restrictRoutingBounds(beforeRestriction,regionalInput.bounds).input
  requireProof(JSON.stringify(regionalInput)===JSON.stringify(expected),"Regional input changed original supplied requests, obstacles or rules")
  const {traces:ignoredNative,...nativeMetadata}=nativeOutput
  const {traces:ignoredInput,...inputMetadata}=regionalInput
  requireProof(JSON.stringify(nativeMetadata)===JSON.stringify(inputMetadata),"Native output changed supplied requests, obstacles or rules")
  requireProof((beforeRestriction.traces??[]).length===0&&regionalInput.allowBlindAndBuriedVias===false&&regionalInput.layerCount===4,
    "Reviewed regional output requires source-fixed copper and ordinary full four-layer barrels")
  const edgeClearance=regionalInput.minBoardEdgeClearance??0
  for(const trace of nativeOutput.traces??[]){
    for(const [index,p] of trace.route.entries()){
      if(p.route_type==="wire"){
        const previous=trace.route[index-1],next=trace.route[index+1]
        const radius=Math.max(p.width,previous?.route_type==="wire"&&previous.layer===p.layer?previous.width:0,
          next?.route_type==="wire"&&next.layer===p.layer?next.width:0)/2
        requireProof(Number.isFinite(p.width)&&p.width>=regionalInput.minTraceWidth-1e-8
          &&contains(regionalInput.bounds,p.x,p.y,radius,edgeClearance),"Generated finite wire copper escapes regional bounds/edge clearance")
      }else if(p.route_type==="via"){
        const pad=p.via_diameter??regionalInput.minViaPadDiameter??regionalInput.min_via_pad_diameter??regionalInput.minViaDiameter
        const drill=p.via_hole_diameter??regionalInput.minViaHoleDiameter??regionalInput.min_via_hole_diameter
        requireProof(pad===.70&&drill===.30&&contains(regionalInput.bounds,p.x,p.y,pad/2,edgeClearance)
          &&contains(regionalInput.bounds,p.x,p.y,drill/2,edgeClearance),"Generated ordinary full barrel/drill escapes regional bounds")
      }else throw new Error("Unreviewed regional output copper point kind")
    }
  }
  return {...structuredClone(nativeOutput),bounds:structuredClone(beforeRestriction.bounds)}
}
