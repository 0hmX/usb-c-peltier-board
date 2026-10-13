export interface Point { x: number; y: number }
export interface Obstacle {
  kind: "rect" | "circle" | "segment" | "polygon"
  net?: string
  layers: string[]
  x: number; y: number
  width?: number; height?: number; radius?: number
  end?: Point
  hole?: boolean
  pad?: boolean
  points?:Point[]
  traceOnly?:boolean
}
export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y)
export function pointSegmentDistance(p: Point, a: Point, b: Point) {
  const d = (b.x - a.x) ** 2 + (b.y - a.y) ** 2
  const t = d ? Math.max(0, Math.min(1, ((p.x-a.x)*(b.x-a.x)+(p.y-a.y)*(b.y-a.y))/d)) : 0
  return distance(p, { x: a.x+t*(b.x-a.x), y: a.y+t*(b.y-a.y) })
}
function cross(a: Point, b: Point, c: Point) {
  return (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x)
}
export function segmentDistance(a: Point, b: Point, c: Point, d: Point) {
  if (cross(a,b,c)*cross(a,b,d) <= 0 && cross(c,d,a)*cross(c,d,b) <= 0 &&
      Math.max(Math.min(a.x,b.x),Math.min(c.x,d.x)) <= Math.min(Math.max(a.x,b.x),Math.max(c.x,d.x)) &&
      Math.max(Math.min(a.y,b.y),Math.min(c.y,d.y)) <= Math.min(Math.max(a.y,b.y),Math.max(c.y,d.y))) return 0
  return Math.min(pointSegmentDistance(a,c,d),pointSegmentDistance(b,c,d),
    pointSegmentDistance(c,a,b),pointSegmentDistance(d,a,b))
}
export function obstacleBounds(o: Obstacle) {
  if(o.kind==="polygon")return {left:Math.min(...o.points!.map(p=>p.x)),right:Math.max(...o.points!.map(p=>p.x)),
    bottom:Math.min(...o.points!.map(p=>p.y)),top:Math.max(...o.points!.map(p=>p.y))}
  const r = o.radius ?? 0
  return o.kind === "segment" ? { left: Math.min(o.x,o.end!.x)-r, right: Math.max(o.x,o.end!.x)+r,
    bottom: Math.min(o.y,o.end!.y)-r, top: Math.max(o.y,o.end!.y)+r } : {
    left: o.x-(o.width ?? 2*r)/2, right: o.x+(o.width ?? 2*r)/2,
    bottom: o.y-(o.height ?? 2*r)/2, top: o.y+(o.height ?? 2*r)/2 }
}
export function distanceToObstacle(a: Point, b: Point, o: Obstacle) {
  if (o.kind === "circle") return pointSegmentDistance(o,a,b)-(o.radius ?? 0)
  if (o.kind === "segment") return segmentDistance(a,b,o,o.end!)-(o.radius ?? 0)
  if(o.kind==="polygon") {
    const ps=o.points!
    const inside=(p:Point)=>{let yes=false;for(let i=0,j=ps.length-1;i<ps.length;j=i++)
      if((ps[i].y>p.y)!==(ps[j].y>p.y)&&p.x<(ps[j].x-ps[i].x)*(p.y-ps[i].y)/(ps[j].y-ps[i].y)+ps[i].x)yes=!yes
      return yes}
    if(inside(a)||inside(b))return 0
    return Math.min(...ps.map((p,i)=>segmentDistance(a,b,p,ps[(i+1)%ps.length])))
  }
  const q = obstacleBounds(o)
  const inside = (p: Point) => p.x>=q.left && p.x<=q.right && p.y>=q.bottom && p.y<=q.top
  if (inside(a)||inside(b)) return 0
  const ps = [{x:q.left,y:q.bottom},{x:q.right,y:q.bottom},{x:q.right,y:q.top},{x:q.left,y:q.top}]
  return Math.min(...ps.map((p,i)=>segmentDistance(a,b,p,ps[(i+1)%4])))
}

// A conservative spatial index: polygon and rotated-pad bounds are never shrunk.
export class CopperGeometry {
  private obstacles:Obstacle[]=[]
  private cells = new Map<string, Set<Obstacle>>()
  private cellSize = 4
  private keys(left: number, right: number, bottom: number, top: number) {
    const keys: string[] = []
    for (let x=Math.floor(left/this.cellSize);x<=Math.floor(right/this.cellSize);x++)
      for (let y=Math.floor(bottom/this.cellSize);y<=Math.floor(top/this.cellSize);y++) keys.push(`${x},${y}`)
    return keys
  }
  add(o: Obstacle) {
    this.obstacles.push(o)
    const q=obstacleBounds(o)
    for (const key of this.keys(q.left,q.right,q.bottom,q.top)) {
      const set=this.cells.get(key) ?? new Set<Obstacle>(); set.add(o); this.cells.set(key,set)
    }
  }
  checkpoint(){return this.obstacles.length}
  restore(length:number){const kept=this.obstacles.slice(0,length);this.cells.clear();this.obstacles=[];for(const o of kept)this.add(o)}
  clear(a: Point, b: Point, layer: string, width: number, net: string, via = false) {
    const radius=via ? .35 : width/2
    if ([a,b].some(p=>Math.abs(p.x)+radius>54.5 || Math.abs(p.y)+radius>42)) return false
    const margin=radius+.5
    const found=new Set<Obstacle>()
    for (const key of this.keys(Math.min(a.x,b.x)-margin,Math.max(a.x,b.x)+margin,
        Math.min(a.y,b.y)-margin,Math.max(a.y,b.y)+margin))
      for (const o of this.cells.get(key) ?? []) found.add(o)
    for (const o of found) {
      if(via&&o.traceOnly)continue
      if (!via && !o.layers.includes(layer)) continue
      if (o.net===net && (!via || (!o.pad && !o.hole))) continue
      // Through vias occupy every copper layer, including the reserved plane.
      // Vias also stay off same-net solder pads: no via-in-pad exception.
      const gap=o.hole ? .5 : .2
      const minimum=via && !o.hole ? (o.pad ? .55 : .65) : radius+gap
      // Imported nominal 0.4 mm pin pitch varies by less than 0.3 µm after
      // coordinate conversion. This tolerance is below native DRC's 5 µm.
      if (distanceToObstacle(a,b,o) < minimum-.0003) return false
    }
    return true
  }
  addPath(path: Point[], layer: string, width: number, net: string) {
    for (let i=1;i<path.length;i++) this.add({kind:"segment",net,layers:[layer],
      ...path[i-1],end:path[i],radius:width/2})
  }
  addVia(p: Point, net: string) {
    this.add({kind:"circle",net,layers:["top","inner1","inner2","bottom"],...p,radius:.35})
    // The drill remains a physical obstacle to every foreign net.
    this.add({kind:"circle",net,layers:["top","inner1","inner2","bottom"],...p,radius:.15,hole:true})
  }
}
