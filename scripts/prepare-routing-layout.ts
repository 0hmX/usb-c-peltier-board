import { readdir } from "node:fs/promises"
const baseline:any[]=await Bun.file("dist/index/circuit.json").json()
const source=new Map(baseline.filter(p=>p.type==="source_component").map(p=>[p.source_component_id,p.name]))
const rotations=new Map(baseline.filter(p=>p.type==="pcb_component").map(p=>[source.get(p.source_component_id),p.rotation]))
const overrides:Record<string,number[]>={}
for(const filename of (await readdir("src/board/routing")).filter(p=>p.endsWith("-completion.json")).sort()) {
  const packet=await Bun.file(`src/board/routing/${filename}`).json()
  const proposals=packet.placementSuggestions??{}
  const entries=Array.isArray(proposals)?proposals.map(p=>[p.component,[p.newCenter.x,p.newCenter.y,
    typeof p.rotation==="number"?p.rotation:rotations.get(p.component)]]):Object.entries(proposals)
  for(const [name,pose] of entries as [string,number[]][]) {
    if(name==="C208"&&filename==="thermal-completion.json")continue // interlock owns its bypass.
    if(overrides[name]&&JSON.stringify(overrides[name])!==JSON.stringify(pose))
      throw new Error(`Conflicting placement proposals for ${name} in ${filename}`)
    overrides[name]=pose
  }
}
await Bun.write("src/board/routing/layout-overrides.json",JSON.stringify(overrides,null,2)+"\n")
console.log(`Prepared ${Object.keys(overrides).length} routed-only placement changes`)
