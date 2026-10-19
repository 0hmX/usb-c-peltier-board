const outline = (points: number[][]) => points.map(([x, y]) => ({ x, y }))
type Waypoint = { x: number; y: number; via?: boolean; toLayer?: "top" | "bottom" }
function localPath(points: Waypoint[], x: number, y: number, rotation = 0) {
  const a = -rotation * Math.PI / 180
  return points.flatMap(p => p.via ? [{x:p.x,y:p.y},p,{x:p.x,y:p.y}] : [p]).map(p => ({ ...p,
    x: ((p.x - x) * Math.cos(a) - (p.y - y) * Math.sin(a)),
    y: (p.x - x) * Math.sin(a) + (p.y - y) * Math.cos(a),
  }))
}

// 2 oz outer copper target; these areas supplement the short pin escapes.
// They require thermal/transient verification on the manufactured stackup.
export function PowerStageRouting() {
  const sw1 = [[-0.65,13.4],[-0.43,13.4],[-0.43,14.15],[-3.6,17.4],[-4,19],[-4,25],[-7.1,25],[-7.1,19.8],[-4.6,16.4],[-0.65,13.95]]
  return <>
    <copperpour name="POWER_SW1" layer="top" connectsTo="net.DRIVER_SW1" outline={outline(sw1)} clearance={0.2} useThermalReliefs={false} boardEdgeMargin={0} />
    <copperpour name="POWER_SW2" layer="top" connectsTo="net.DRIVER_SW2" outline={outline(sw1.map(([x,y]) => [-x,y]).reverse())} clearance={0.2} useThermalReliefs={false} boardEdgeMargin={0} />
    <copperpour name="POWER_INPUT" layer="top" connectsTo="net.VBUS_QUALIFIED" clearance={0.2} useThermalReliefs={false} boardEdgeMargin={0}
      outline={outline([[-1.15,10.5],[-.93,10.5],[-.93,9.55],[-2.3,7.8],[-2.3,5],[-5.5,4],[-5.5,1],[-10.8,1],[-10.8,5],[-12.3,5],[-12.3,12.5],[-4,12.5],[-4,9.1],[-1.15,9.8]])} />
    <copperpour name="POWER_OUTPUT" layer="top" connectsTo="net.DRIVER_OUT" clearance={0.2} useThermalReliefs={false} boardEdgeMargin={0}
      outline={outline([[.93,10.5],[1.15,10.5],[1.15,9.95],[2.4,9.2],[4.3,9.2],[7.8,9.2],[7.8,16.8],[19.2,16.8],[19.2,6.8],[17.9,6.8],[17.9,13.3],[16.9,13.3],[16.9,6.8],[4,6.8],[2.5,8.2],[1,8.25],[.93,9.8]])} />
    <copperpour name="POWER_TEC" layer="top" connectsTo="net.TEC_POS" clearance={0.2} useThermalReliefs={false} boardEdgeMargin={0}
      outline={outline([[23,13],[34.8,13],[36,15],[36,19],[57.1,19],[57.1,23],[24.2,23],[24.2,18],[22.3,18],[22.3,14],[23,14]])} />
    <copperpour name="POWER_INPUT_THERMAL" layer="inner2" connectsTo="net.VBUS_QUALIFIED" clearance={0.2} useThermalReliefs={false} boardEdgeMargin={0}
      outline={outline([[-11.8,4.8],[-3,4.8],[-3,12.2],[-11.8,12.2]])} />
    <copperpour name="POWER_OUTPUT_THERMAL" layer="inner2" connectsTo="net.DRIVER_OUT" clearance={0.2} useThermalReliefs={false} boardEdgeMargin={0}
      outline={outline([[7.6,7],[16.9,7],[16.9,13.3],[17.9,13.3],[17.9,7],[19.2,7],[19.2,17.2],[7.6,17.2]])} />
    {/* Power/thermal via banks join the outer copper to the inner power islands. */}
    {[-3.5,-4.3].flatMap((x,j) => [5.2,6,6.8,7.6,8.4].map((y,i) => <via name={`V_DRIVER_IN_${j}_${i}`} pcbX={x} pcbY={y} connectsTo="net.VBUS_QUALIFIED" holeDiameter={0.3} outerDiameter={0.6} layers={["top","inner1","inner2","bottom"]} />))}
    {[18.25,18.8].flatMap((x,j) => [8.5,9.3,10.1,10.9,11.7].map((y,i) => <via name={`V_DRIVER_OUT_${j}_${i}`} pcbX={x} pcbY={y} connectsTo="net.DRIVER_OUT" holeDiameter={0.3} outerDiameter={0.6} layers={["top","inner1","inner2","bottom"]} />))}
    <trace from=".U_DRIVER > .pin8" to=".L_OUT > .pin1" thickness={0.22} pcbPath={[{x:-.539877,y:2.15},{x:-5.55,y:7}]} />
    <trace from=".U_DRIVER > .pin10" to=".L_OUT > .pin2" thickness={0.22} pcbPath={[{x:.540131,y:2.15},{x:5.55,y:7}]} />
    <trace from=".U_DRIVER > .pin7" to=".C_DRIVER_INPUT_HF > .pin1" thickness={0.22} maxLength={4} pcbPath={[{x:-1.040003,y:-2.4}]} />
    <trace from=".U_DRIVER > .pin11" to=".C_DRIVER_OUTPUT_HF > .pin1" thickness={0.22} maxLength={4} pcbPath={[{x:1.040003,y:-2.4}]} />
    <trace from=".C_DRIVER_OUTPUT_HF > .pin1" to=".C_DRIVER_OUT1 > .pin1" thickness={1} maxLength={11}
      pcbPath={localPath([{x:2.5,y:8.4},{x:3.6,y:7.95},{x:5,y:7.95},{x:9.432604,y:7.95}],1.4,8.1,270)} />
    <trace from=".U_DRIVER > .pin20" to=".C_DRIVER_BOOT1 > .pin1" thickness={0.2} pcbPath={[{x:-1.540129,y:1.9},{x:-2.7,y:2.3}]} />
    <trace from=".U_DRIVER > .pin19" to=".C_DRIVER_BOOT2 > .pin1" thickness={0.2} pcbPath={[{x:1.540129,y:1.9},{x:2.7,y:2.3}]} />
    <trace from=".U_DRIVER > .pin8" to=".C_DRIVER_BOOT1 > .pin2" thickness={0.2} pcbPath={[{x:-.539877,y:2.2}]} />
    <trace from=".U_DRIVER > .pin10" to=".C_DRIVER_BOOT2 > .pin2" thickness={0.2} pcbPath={[{x:.540131,y:2.2}]} />
    <trace from=".U_DRIVER > .pin18" to=".C_DRIVER_VCC > .pin1" thickness={0.25} maxLength={3} pcbStraightLine />
    <trace from=".C_DRIVER_VCC > .pin1" to=".C_DRIVER_VCC_HF > .pin1" thickness={0.4} maxLength={3} pcbStraightLine />
    <trace from=".U_DRIVER > .pin12" to=".C_CURRENT_FILTER > .pin1" thickness={0.2}
      pcbPath={localPath([{x:1.65,y:9.8,via:true,toLayer:"bottom"},{x:1.6,y:10.2}],0,12)} />
    <trace from=".U_DRIVER > .pin13" to=".C_CURRENT_FILTER > .pin2" thickness={0.2}
      pcbPath={localPath([{x:3.6,y:9,via:true,toLayer:"bottom"}],0,12)} />
    <trace from=".R_ISP_FILTER > .pin2" to=".C_CURRENT_FILTER > .pin1" thickness={0.2} pcbStraightLine />
    <trace from=".R_ISN_FILTER > .pin2" to=".C_CURRENT_FILTER > .pin2" thickness={0.2} pcbStraightLine />
    {/* Kelvin branches start at the inner edges of the shunt lands. */}
    <trace from=".R_SENSE > .pin1" to=".R_ISP_FILTER > .pin1" thickness={0.2}
      pcbPath={localPath([{x:17.4,y:15},{x:17.4,y:12.4,via:true,toLayer:"bottom"},{x:17.4,y:6.9},{x:7,y:6.9},{x:7,y:10}],20,15)} />
    <trace from=".R_SENSE > .pin2" to=".R_ISN_FILTER > .pin1" thickness={0.2}
      pcbPath={localPath([{x:22.6,y:15},{x:22.6,y:12.4,via:true,toLayer:"bottom"},{x:22.6,y:6.2},{x:6.3,y:6.2},{x:6.3,y:7.3}],20,15)} />
    <trace from=".U_DRIVER > .pin6" to=".R_DRIVER_FSW > .pin1" thickness={0.2}
      pcbPath={localPath([{x:-1.65,y:9.8,via:true,toLayer:"bottom"}],0,12)} />
    <trace from=".U_DRIVER > .pin15" to=".R_COMP > .pin1" thickness={0.2}
      pcbPath={localPath([{x:3.6,y:11.4,via:true,toLayer:"bottom"}],0,12)} />
    <trace from=".R_COMP > .pin2" to=".C_COMP_ZERO > .pin1" thickness={0.2} pcbStraightLine />
    <trace from=".R_COMP > .pin1" to=".C_COMP_POLE > .pin1" thickness={0.2} pcbStraightLine />
    <copperpour name="DRIVER_PGND" layer="top" connectsTo="net.GND" clearance={0.2} boardEdgeMargin={0} useThermalReliefs={false}
      outline={outline([[-.165,10.5],[.165,10.5],[.165,10.25],[.55,9.9],[.55,9.5685],[2.8,8.8],[2.8,4.6],[-1.8,4.6],[-1.8,8.8],[-.55,9.4881],[-.55,9.9],[-.165,10.25]])} />
    <trace from=".U_DRIVER > .pin9" to=".C_DRIVER_INPUT_HF > .pin2" thickness={0.3} maxLength={5.1} pcbPath={[{x:0,y:-2.2},{x:-.63,y:-3.9}]} />
    <trace from=".U_DRIVER > .pin9" to=".C_DRIVER_OUTPUT_HF > .pin2" thickness={0.3} maxLength={5.1} pcbPath={[{x:0,y:-2.2},{x:.63,y:-3.9}]} />
    {[-.4,.4,2.4].flatMap((x,j) => [4.9,5.7,6.5,7.3].map((y,i) => <via name={`V_DRIVER_PGND_${j}_${i}`} pcbX={x} pcbY={y} connectsTo="net.GND" holeDiameter={0.3} outerDiameter={0.6} layers={["top","inner1","inner2","bottom"]} />))}
    {/* Analog ground reaches the plane only at the VCC capacitor star. */}
    <copperpour name="DRIVER_VCC_GND_STAR" layer="top" connectsTo="net.GND" clearance={0.2} boardEdgeMargin={0} useThermalReliefs={false}
      outline={outline([[5.8,11.2],[9,11.2],[9,15.2],[5.8,15.2]])} />
    {[7.8,8.6].flatMap((x,j) => [13.4,14.2].filter(y => x !== 7.8 || y !== 14.2).map((y,i) => <via name={`V_DRIVER_STAR_${j}_${i}`} pcbX={x} pcbY={y} connectsTo="net.GND" holeDiameter={0.3} outerDiameter={0.6} layers={["top","inner1","inner2","bottom"]} />))}
    <trace from=".C_COMP_POLE > .pin2" to=".C_DRIVER_VCC > .pin2" thickness={0.25} maxLength={5}
      pcbPath={localPath([{x:6.6,y:14.8,via:true,toLayer:"top"}],4.5,14.2,180)} />
    <trace from=".C_COMP_ZERO > .pin2" to=".C_COMP_POLE > .pin2" thickness={0.25}
      pcbPath={localPath([{x:8.6,y:12.55},{x:8.6,y:15.5},{x:5.2,y:15.5}],7.4,12.55,180)} />
    <trace from=".R_DRIVER_FSW > .pin2" to=".C_COMP_POLE > .pin2" thickness={0.25}
      pcbPath={localPath([{x:-4.5,y:10},{x:-4.5,y:15.5},{x:5.2,y:15.5}], -3.6,10,0)} />
    <trace from=".U_DRIVER > .pin17" to=".C_DRIVER_VCC > .pin2" thickness={0.2} maxLength={12}
      pcbPath={localPath([{x:4.2,y:12.75},{x:4.2,y:10.8},{x:5.8,y:10.8}],0,12)} />
    <trace from=".U_DRIVER > .pin2" to="net.GND" thickness={0.2}
      pcbPath={localPath([{x:-3.25,y:12.25,via:true,toLayer:"bottom"}],0,12)} />
    <trace from=".U_DRIVER > .pin5" to="net.GND" thickness={0.2}
      pcbPath={localPath([{x:-3.9,y:11,via:true,toLayer:"bottom"}],0,12)} />
    <trace from=".U_DRIVER > .pin21" to="net.GND" thickness={0.2}
      pcbPath={localPath([{x:-3.4,y:13.65,via:true,toLayer:"bottom"}],0,12)} />
  </>
}
