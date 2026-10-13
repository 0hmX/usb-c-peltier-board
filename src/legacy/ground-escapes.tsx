import React from "react"

type Point={x:number;y:number}
// PCB numeric paths are relative to the component origin, including rotation.
const localPoint=(point:Point,origin:Point,rotation=0):Point=>{
  const radians=rotation*Math.PI/180,dx=point.x-origin.x,dy=point.y-origin.y
  return {x:dx*Math.cos(radians)+dy*Math.sin(radians),y:-dx*Math.sin(radians)+dy*Math.cos(radians)}
}
const escapes=[
  {name:"BUCK_GND1",from:"U2.pin2",origin:{x:-5,y:12},points:[{x:-7.275,y:8}],addVia:true},
  {name:"BUCK_GND3",from:"U2.pin16",origin:{x:-5,y:12},points:[{x:-5.325,y:15.9}],addVia:true},
  {name:"BUCK_SYNC",from:"U2.pin15",origin:{x:-5,y:12},points:[{x:-4.675,y:15.25},{x:-5.325,y:15.9}]},
  {name:"BUCK_EP",from:"U2.pin21",origin:{x:-5,y:12},points:[{x:-8.5,y:12}],width:0.6},
  {name:"BUCK_VCC_DECOUPLER",from:"C22.pin2",origin:{x:-8.5,y:5.25},points:[{x:-7.8,y:4.2}],addVia:true},
  {name:"BUCK_RT",from:"R28.pin2",origin:{x:-4,y:20.2},points:[{x:-3.25,y:19}],addVia:true},
  {name:"BUCK_HARD_LIMIT",from:"R32.pin2",origin:{x:-5,y:2},points:[{x:-4.25,y:0.8}],addVia:true},
  {name:"BUCK_LOW_SOURCE",from:"Q21.pin1",origin:{x:4,y:9},rotation:270,
    points:[{x:0.7475,y:10.4},{x:0.3,y:10.4}],width:0.6},
  {name:"TEC_TERMINAL_RETURN",from:"J_TEC.pin2",origin:{x:44,y:0},rotation:90,
    points:[{x:44,y:3.5},{x:43,y:4.5}],width:0.6},
  // Keep the monitor address grounds below the independent fan supply rail.
  {name:"TEC_MON_A0",from:"U_TEC_MON.pin1",origin:{x:29,y:22},rotation:180,
    points:[{x:31.405,y:25.2},{x:32.4,y:25.2}],addVia:true},
  {name:"TEC_MON_A1",from:"U_TEC_MON.pin2",origin:{x:29,y:22},rotation:180,
    points:[{x:30.905,y:24.7}]},
  {name:"ADC_PAIR",from:"C212.pin2",origin:{x:14.5,y:-3.5},
    points:[{x:15.3,y:-3.6},{x:16.5,y:-3.6}],addVia:true},
]

// These pads either sit on the reviewed current collectors or need a deliberate
// escape where the package fanout solver cannot place one. Their original GND
// connection-map entries are removed to avoid a second unrouted declaration.
export function GroundEscapes(){
  return <>{escapes.map(escape=>{
    const end=escape.points.at(-1)!
    return <React.Fragment key={escape.name}><trace name={`${escape.name}_GROUND`} from={escape.from} to="net.GND"
      thickness={escape.width??0.2} pcbPathRelativeTo={escape.from}
      pcbPath={[escape.from,...escape.points.map(p=>localPoint(p,escape.origin,escape.rotation))]}/>
      {escape.addVia&&<via name={`${escape.name}_VIA`}
        pcbX={end.x} pcbY={end.y} holeDiameter={0.3} outerDiameter={0.7}
        fromLayer="top" toLayer="bottom" connectsTo="net.GND" tented/>}</React.Fragment>
  })}
    <via name="ADC_FILTER_GROUND_RELIEF" pcbX={13.4} pcbY={-6.5}
      holeDiameter={0.3} outerDiameter={0.7} fromLayer="top" toLayer="bottom" connectsTo="net.GND" tented />
    <trace name="PROTECTED_ADC_GROUND" from="C211.pin2" to="ADC_FILTER_GROUND_RELIEF.top" thickness={0.2} maxLength={4.3}
      pcbPathRelativeTo="C211.pin2" pcbPath={["C211.pin2",{x:0.7,y:-0.8},{x:1.1,y:-1.2},
        {x:1.9,y:-1.2},"ADC_FILTER_GROUND_RELIEF.top"]}/>
  </>
}
