// Sensor supplies join on the bottom layer; each ground via reaches the inner ground plane.
export function TemperatureRouting() {
  return <>
    <via name="V_SENSOR_HOT_3V3" pcbX={45.2} pcbY={14} holeDiameter={0.3} outerDiameter={0.6} connectsTo="net.CTRL_3V3" />
    <via name="V_SENSOR_COLD_3V3" pcbX={45.2} pcbY={-6} holeDiameter={0.3} outerDiameter={0.6} connectsTo="net.CTRL_3V3" />
    <via name="V_SENSOR_ESD_3V3" pcbX={47.4} pcbY={6.4} holeDiameter={0.3} outerDiameter={0.6} connectsTo="net.CTRL_3V3" />
    <via name="V_SENSOR_HOT_GND" pcbX={48.5} pcbY={18} holeDiameter={0.3} outerDiameter={0.6} connectsTo="net.GND" />
    <via name="V_SENSOR_COLD_GND" pcbX={48.4} pcbY={-2} holeDiameter={0.3} outerDiameter={0.6} connectsTo="net.GND" />
    <via name="V_SENSOR_ESD_GND" pcbX={47} pcbY={1.8} holeDiameter={0.3} outerDiameter={0.6} connectsTo="net.GND" />
    <trace from=".R_HOT_PULLUP > .pin2" to=".R_HOT_SERIES > .pin2" width={0.2} pcbPath={[]} />
    <trace from=".R_HOT_SERIES > .pin2" to=".U_SENSOR_ESD > .pin6" width={0.2} pcbPath={[{ x: -0.94996, y: -1.703324 }]} />
    <trace from=".U_SENSOR_ESD > .pin1" to=".J_HOT_SENSOR > .pin2" width={0.2} pcbPath={[{ x: -3.7, y: 1.600944 }, { x: -3.7, y: 4.4 }, { x: -0.1, y: 8 }]} />
    <trace from=".R_COLD_PULLUP > .pin2" to=".R_COLD_SERIES > .pin2" width={0.2} pcbPath={[]} />
    <trace from=".R_COLD_PULLUP > .pin2" to=".U_SENSOR_ESD > .pin4" width={0.2} pcbPath={[{ x: 2.2, y: 1.446636 }, { x: 2.2, y: 9.899056 }]} />
    <trace from=".U_SENSOR_ESD > .pin3" to=".J_COLD_SENSOR > .pin2" width={0.2} pcbPath={[{ x: 0.94996, y: -3.94996 }]} />
    <trace from=".R_HOT_PULLUP > .pin1" to=".C_HOT_SENSOR > .pin1" width={0.4} pcbPath={[]} />
    <trace from=".R_COLD_PULLUP > .pin1" to=".C_COLD_SENSOR > .pin1" width={0.4} pcbPath={[]} />
    <trace from=".R_HOT_PULLUP > .pin1" to=".V_SENSOR_HOT_3V3 > .top" width={0.4} pcbPath={[]} />
    <trace from=".R_COLD_PULLUP > .pin1" to=".V_SENSOR_COLD_3V3 > .top" width={0.4} pcbPath={[]} />
    <trace from=".U_SENSOR_ESD > .pin5" to=".V_SENSOR_ESD_3V3 > .top" width={0.4} pcbPath={[{ x: 0, y: 2 }]} />
    <trace from=".V_SENSOR_HOT_3V3 > .bottom" to=".V_SENSOR_COLD_3V3 > .bottom" width={0.4} pcbPath={[]} />
    <trace from=".V_SENSOR_ESD_3V3 > .bottom" to=".V_SENSOR_HOT_3V3 > .bottom" width={0.4} pcbPath={[{ x: -2.2, y: 0 }]} />
    <trace from=".V_SENSOR_HOT_3V3 > .bottom" to=".J_HOT_SENSOR > .pin1" width={0.4} pcbPath={[{ x: 0, y: -5.499993 }]} />
    <trace from=".V_SENSOR_COLD_3V3 > .bottom" to=".J_COLD_SENSOR > .pin1" width={0.4} pcbPath={[{ x: 0, y: -5.499993 }]} />
    <trace from=".C_HOT_SENSOR > .pin2" to=".V_SENSOR_HOT_GND > .top" width={0.3} pcbPath={[]} />
    <trace from=".C_COLD_SENSOR > .pin2" to=".V_SENSOR_COLD_GND > .top" width={0.3} pcbPath={[]} />
    <trace from=".U_SENSOR_ESD > .pin2" to=".V_SENSOR_ESD_GND > .top" width={0.3} pcbPath={[]} />
  </>
}
