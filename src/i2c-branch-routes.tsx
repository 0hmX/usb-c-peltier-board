// Source-owned paired I2C trees. Ordinary full vias share the PD/bypass/monitor branches.
// Core numeric waypoints are relative to a real named via, including pad launches.
import { attachLogicSupplyInner2Port } from "./logic-supply-links"

export const i2cBranchBarrels = [
  {"name":"I2C_SCL_DAC_LAUNCH","net":"I2C_SCL","x":0,"y":-14.4},
  {"name":"I2C_SDA_DAC_LAUNCH","net":"I2C_SDA","x":0.95,"y":-14.4},
  {"name":"I2C_SCL_PD_LAUNCH","net":"I2C_SCL","x":-22.8,"y":4.95},
  {"name":"I2C_SDA_PD_LAUNCH","net":"I2C_SDA","x":-22.1,"y":6.25},
  {"name":"I2C_SCL_MON_LAUNCH","net":"I2C_SCL","x":27.095,"y":23.2},
  {"name":"I2C_SDA_MON_LAUNCH","net":"I2C_SDA","x":28.365,"y":23.2},
] as const

export const i2cBranchPaths = [
  {"name":"I2C_SCL_DAC_PAD_TO_VIA","net":"I2C_SCL","layer":"top","start":"I2C_SCL_DAC_LAUNCH.top","end":"U_DAC.pin5","anchor":"I2C_SCL_DAC_LAUNCH.top","absoluteVertices":[{"x":0,"y":-14.4},{"x":0,"y":-18.6}],"relativeWaypoints":[]},
  {"name":"I2C_SDA_DAC_PAD_TO_VIA","net":"I2C_SDA","layer":"top","start":"I2C_SDA_DAC_LAUNCH.top","end":"U_DAC.pin4","anchor":"I2C_SDA_DAC_LAUNCH.top","absoluteVertices":[{"x":0.95,"y":-14.4},{"x":0.95,"y":-18.6}],"relativeWaypoints":[]},
  {"name":"I2C_SCL_PD_PAD_TO_VIA","net":"I2C_SCL","layer":"top","start":"I2C_SCL_PD_LAUNCH.top","end":"U_PD.pin7","anchor":"I2C_SCL_PD_LAUNCH.top","absoluteVertices":[{"x":-22.8,"y":4.95},{"x":-23.6,"y":5.75},{"x":-24.1,"y":5.75}],"relativeWaypoints":[{"x":-0.8,"y":0.8}]},
  {"name":"I2C_SCL_PULLUP_TO_PD_VIA","net":"I2C_SCL","layer":"top","start":"I2C_SCL_PD_LAUNCH.top","end":"R_PD_SCL.pin2","anchor":"I2C_SCL_PD_LAUNCH.top","absoluteVertices":[{"x":-22.8,"y":4.95},{"x":-22.6,"y":4.75},{"x":-22,"y":4.75}],"relativeWaypoints":[{"x":0.2,"y":-0.2}]},
  {"name":"I2C_SDA_PD_PAD_TO_VIA","net":"I2C_SDA","layer":"top","start":"I2C_SDA_PD_LAUNCH.top","end":"U_PD.pin8","anchor":"I2C_SDA_PD_LAUNCH.top","absoluteVertices":[{"x":-22.1,"y":6.25},{"x":-24.1,"y":6.25}],"relativeWaypoints":[]},
  {"name":"I2C_SDA_PULLUP_TO_PD_VIA","net":"I2C_SDA","layer":"top","start":"I2C_SDA_PD_LAUNCH.top","end":"R_PD_SDA.pin2","anchor":"I2C_SDA_PD_LAUNCH.top","absoluteVertices":[{"x":-22.1,"y":6.25},{"x":-21,"y":5.15},{"x":-21,"y":2.25},{"x":-22,"y":1.25}],"relativeWaypoints":[{"x":1.1,"y":-1.1},{"x":1.1,"y":-4}]},
  {"name":"I2C_SCL_MON_PAD_TO_VIA","net":"I2C_SCL","layer":"top","start":"I2C_SCL_MON_LAUNCH.top","end":"U_TEC_MON.pin4","anchor":"I2C_SCL_MON_LAUNCH.top","absoluteVertices":[{"x":27.095,"y":23.2},{"x":27.095,"y":24.7}],"relativeWaypoints":[]},
  {"name":"I2C_SDA_MON_PAD_TO_VIA","net":"I2C_SDA","layer":"top","start":"I2C_SDA_MON_LAUNCH.top","end":"U_TEC_MON.pin3","anchor":"I2C_SDA_MON_LAUNCH.top","absoluteVertices":[{"x":28.365,"y":23.2},{"x":28.365,"y":24.7}],"relativeWaypoints":[]},
  {"name":"I2C_SCL_PD_BOTTOM_TRUNK","net":"I2C_SCL","layer":"bottom","start":"I2C_SCL_DAC_LAUNCH.bottom","end":"I2C_SCL_PD_LAUNCH.bottom","anchor":"I2C_SCL_DAC_LAUNCH.bottom","absoluteVertices":[{"x":0,"y":-14.4},{"x":0,"y":-5.5},{"x":-10.45,"y":4.95},{"x":-22.8,"y":4.95}],"relativeWaypoints":[{"x":0,"y":8.9},{"x":-10.45,"y":19.35}]},
  {"name":"I2C_SCL_MON_INNER2_TRUNK","net":"I2C_SCL","layer":"inner2","start":"I2C_SCL_DAC_LAUNCH.inner2","end":"I2C_SCL_MON_LAUNCH.inner2","anchor":"I2C_SCL_DAC_LAUNCH.inner2","absoluteVertices":[{"x":0,"y":-14.4},{"x":0,"y":-3.895},{"x":23,"y":19.105},{"x":23.655,"y":19.105},{"x":27.095,"y":22.545},{"x":27.095,"y":23.2}],"relativeWaypoints":[{"x":0,"y":10.505},{"x":23,"y":33.505},{"x":23.655,"y":33.505},{"x":27.095,"y":36.945}]},
  {"name":"I2C_SDA_PD_BOTTOM_TRUNK","net":"I2C_SDA","layer":"bottom","start":"I2C_SDA_DAC_LAUNCH.bottom","end":"I2C_SDA_PD_LAUNCH.bottom","anchor":"I2C_SDA_DAC_LAUNCH.bottom","absoluteVertices":[{"x":0.95,"y":-14.4},{"x":0.95,"y":-3.25},{"x":-8.55,"y":6.25},{"x":-22.1,"y":6.25}],"relativeWaypoints":[{"x":0.0,"y":11.15},{"x":-9.5,"y":20.65}]},
  {"name":"I2C_SDA_MON_INNER2_TRUNK","net":"I2C_SDA","layer":"inner2","start":"I2C_SDA_DAC_LAUNCH.inner2","end":"I2C_SDA_MON_LAUNCH.inner2","anchor":"I2C_SDA_DAC_LAUNCH.inner2","absoluteVertices":[{"x":0.95,"y":-14.4},{"x":0.95,"y":-3.6},{"x":22,"y":17.45},{"x":22.7,"y":17.45},{"x":28.365,"y":23.115},{"x":28.365,"y":23.2}],"relativeWaypoints":[{"x":0.0,"y":10.8},{"x":21.05,"y":31.85},{"x":21.75,"y":31.85},{"x":27.415,"y":37.515}]},
] as const

export const i2cBranchConnectionPlans = [
  {"name":"I2C_SCL_SOURCE_BRANCHES","net":"I2C_SCL","traces":["I2C_SCL_DAC_PAD_TO_VIA","I2C_SCL_PD_PAD_TO_VIA","I2C_SCL_PULLUP_TO_PD_VIA","I2C_SCL_MON_PAD_TO_VIA","I2C_SCL_PD_BOTTOM_TRUNK","I2C_SCL_MON_INNER2_TRUNK"],"requiredSelectors":["U_DAC.pin5","U_TEC_MON.pin4","U_PD.pin7","R_PD_SCL.pin2"],"branchEndpoints":{"I2C_SCL_DAC_PAD_TO_VIA":["I2C_SCL_DAC_LAUNCH.top","U_DAC.pin5"],"I2C_SCL_PD_PAD_TO_VIA":["I2C_SCL_PD_LAUNCH.top","U_PD.pin7"],"I2C_SCL_PULLUP_TO_PD_VIA":["I2C_SCL_PD_LAUNCH.top","R_PD_SCL.pin2"],"I2C_SCL_MON_PAD_TO_VIA":["I2C_SCL_MON_LAUNCH.top","U_TEC_MON.pin4"],"I2C_SCL_PD_BOTTOM_TRUNK":["I2C_SCL_DAC_LAUNCH.bottom","I2C_SCL_PD_LAUNCH.bottom"],"I2C_SCL_MON_INNER2_TRUNK":["I2C_SCL_DAC_LAUNCH.inner2","I2C_SCL_MON_LAUNCH.inner2"]},"from":"U_DAC.pin5","to":"U_TEC_MON.pin4"},
  {"name":"I2C_SDA_SOURCE_BRANCHES","net":"I2C_SDA","traces":["I2C_SDA_DAC_PAD_TO_VIA","I2C_SDA_PD_PAD_TO_VIA","I2C_SDA_PULLUP_TO_PD_VIA","I2C_SDA_MON_PAD_TO_VIA","I2C_SDA_PD_BOTTOM_TRUNK","I2C_SDA_MON_INNER2_TRUNK"],"requiredSelectors":["U_DAC.pin4","U_TEC_MON.pin3","U_PD.pin8","R_PD_SDA.pin2"],"branchEndpoints":{"I2C_SDA_DAC_PAD_TO_VIA":["I2C_SDA_DAC_LAUNCH.top","U_DAC.pin4"],"I2C_SDA_PD_PAD_TO_VIA":["I2C_SDA_PD_LAUNCH.top","U_PD.pin8"],"I2C_SDA_PULLUP_TO_PD_VIA":["I2C_SDA_PD_LAUNCH.top","R_PD_SDA.pin2"],"I2C_SDA_MON_PAD_TO_VIA":["I2C_SDA_MON_LAUNCH.top","U_TEC_MON.pin3"],"I2C_SDA_PD_BOTTOM_TRUNK":["I2C_SDA_DAC_LAUNCH.bottom","I2C_SDA_PD_LAUNCH.bottom"],"I2C_SDA_MON_INNER2_TRUNK":["I2C_SDA_DAC_LAUNCH.inner2","I2C_SDA_MON_LAUNCH.inner2"]},"from":"U_DAC.pin4","to":"U_TEC_MON.pin3"},
] as const

export function I2cBranchRoutes() {
  return <>
    {i2cBranchBarrels.map(v => <via name={v.name} pcbX={v.x} pcbY={v.y}
      holeDiameter={0.3} outerDiameter={0.7} fromLayer="top" toLayer="bottom"
      connectsTo={`net.${v.net}`} tented {...{ ref: attachLogicSupplyInner2Port }} />)}
    {i2cBranchPaths.map(p => <trace name={p.name} from={p.start} to={p.end} thickness={0.2}
      pcbPathRelativeTo={p.anchor} pcbPath={[p.start, ...p.relativeWaypoints, p.end]} />)}
  </>
}
