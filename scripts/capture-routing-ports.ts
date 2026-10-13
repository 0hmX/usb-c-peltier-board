export {}
const circuit:any[]=await Bun.file("dist/routing-placement/circuit.json").json()
const components=new Map(circuit.filter(p=>p.type==="source_component").map(p=>[p.source_component_id,p]))
const sourcePorts=new Map(circuit.filter(p=>p.type==="source_port").map(p=>[p.source_port_id,p]))
const nets=new Map(circuit.filter(p=>p.type==="source_net").map(p=>[p.subcircuit_connectivity_map_key,p.name]))
const ports=circuit.filter(p=>p.type==="pcb_port").flatMap(p=>{
  const source=sourcePorts.get(p.source_port_id),component=components.get(source.source_component_id)
  const net=nets.get(source.subcircuit_connectivity_map_key)
  return net?[{selector:`${component.name}.pin${source.pin_number}`,component:component.name,pin:source.pin_number,
    net,x:p.x,y:p.y,layers:p.layers,pads:circuit.filter(q=>["pcb_smtpad","pcb_plated_hole"].includes(q.type)&&q.pcb_port_id===p.pcb_port_id)}]:[]
})
await Bun.write("src/board/routing/ports.json",JSON.stringify(ports,null,2)+"\n")
console.log(`Captured ${ports.length} routing ports on ${new Set(ports.map(p=>p.net)).size} nets`)
