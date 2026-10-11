import type { SourcePadConnectionPlan } from "./source-pad-connections"
import { attachLogicSupplyInner2Port } from "./logic-supply-links"

// Exact approved SOURCE16 paths. Existing parts, copper and positive bounds stay in their owning blocks.
export const source16TraceProps = [
  {"name":"INPUT_ILIM_SWITCH_LOCAL","from":"R_INPUT_ILIM_HIGH.pin2","to":"Q_INPUT_HIGH.pin3","thickness":0.2,"maxLength":2.1,"pcbPathRelativeTo":"R_INPUT_ILIM_HIGH.pin2","pcbPath":["R_INPUT_ILIM_HIGH.pin2",{"x":0.75,"y":-0.94},"Q_INPUT_HIGH.pin3"]},
  {"name":"INPUT_CURRENT_MON_LOCAL","from":"U_INPUT.pin9","to":"R_INPUT_ILIM.pin1","thickness":0.2,"maxLength":3.2,"pcbPathRelativeTo":"U_INPUT.pin9","pcbPath":["U_INPUT.pin9",{"x":1.4,"y":0.225},{"x":1.725,"y":0.55},{"x":2.65,"y":0.55},"R_INPUT_ILIM.pin1"]},
  {"name":"INPUT_OVLO_DIVIDER_LOCAL","from":"R_INPUT_OV_BOTTOM.pin1","to":"R_INPUT_OV_TOP.pin2","thickness":0.2,"maxLength":2,"pcbPathRelativeTo":"R_INPUT_OV_BOTTOM.pin1","pcbPath":["R_INPUT_OV_BOTTOM.pin1",{"x":0.25,"y":1.05},"R_INPUT_OV_TOP.pin2"]},
  {"name":"INPUT_ENABLE_OFF_LOCAL","from":"R_INPUT_OFF.pin1","to":"INPUT_ENABLE_ESCAPE_VIA.top","thickness":0.2,"maxLength":2.2,"pcbPathRelativeTo":"R_INPUT_OFF.pin1","pcbPath":["R_INPUT_OFF.pin1",{"x":-0.75,"y":-0.15},"INPUT_ENABLE_ESCAPE_VIA.top"]},
  {"name":"TEC_VCC_D20_DIRECT","from":"U2.pin1","to":"D20.pin2","thickness":0.2,"maxLength":14.2,"pcbPathRelativeTo":"U2.pin1","pcbPath":["U2.pin1",{"x":-3.5,"y":-2.775},{"x":-5,"y":-1.275},{"x":-5,"y":2.2},{"x":-6.7,"y":3.9},{"x":-6.7,"y":7.764944},"D20.pin2"]},
  {"name":"TEC_HARD_LIMIT_DIVIDER_LOCAL","from":"R31.pin2","to":"R32.pin1","thickness":0.2,"maxLength":1.6,"pcbPath":["R31.pin2","R32.pin1"]},
  {"name":"TEC_CURRENT_COMMAND_DIVIDER_LOCAL_WEST","from":"R33.pin2","to":"R34.pin1","thickness":0.2,"maxLength":3.2,"pcbPathRelativeTo":"R33.pin2","pcbPath":["R33.pin2",{"x":-0.8,"y":-1.55},"R34.pin1"]},
  {"name":"TEC_FB_U2_ESCAPE","from":"U2.pin10","to":"TEC_FB_U2_TRANSFER.top","thickness":0.2,"maxLength":2.4,"pcbPathRelativeTo":"U2.pin10","pcbPath":["U2.pin10",{"x":3.8,"y":-3.65},{"x":3.8,"y":-3.92},"TEC_FB_U2_TRANSFER.top"]},
  {"name":"TEC_FB_LOCAL","from":"TEC_FB_U2_TRANSFER.bottom","to":"TEC_FB_R29_TRANSFER.bottom","thickness":0.2,"maxLength":6.4,"pcbPathRelativeTo":"TEC_FB_U2_TRANSFER.bottom","pcbPath":["TEC_FB_U2_TRANSFER.bottom",{"x":-0.4,"y":-0.4},{"x":-0.4,"y":-3.63},"TEC_FB_R29_TRANSFER.bottom"]},
  {"name":"TEC_FB_R29_ESCAPE","from":"TEC_FB_R29_TRANSFER.top","to":"R29.pin2","thickness":0.2,"maxLength":1.2,"pcbPath":["TEC_FB_R29_TRANSFER.top","R29.pin2"]},
  {"name":"TEC_FB_DIVIDER_LOCAL","from":"R29.pin2","to":"R30.pin1","thickness":0.2,"maxLength":1.6,"pcbPath":["R29.pin2","R30.pin1"]},
  {"name":"TEC_VC_U2_ESCAPE","from":"U2.pin13","to":"TEC_VC_U2_TRANSFER.top","thickness":0.2,"maxLength":2,"pcbPathRelativeTo":"U2.pin13","pcbPath":["U2.pin13",{"x":1.625,"y":3.425},{"x":2.3,"y":4.1},"TEC_VC_U2_TRANSFER.top"]},
  {"name":"TEC_VC_LOCAL","from":"TEC_VC_U2_TRANSFER.inner2","to":"TEC_VC_R27_TRANSFER.inner2","thickness":0.2,"maxLength":10.2,"pcbPathRelativeTo":"TEC_VC_U2_TRANSFER.inner2","pcbPath":["TEC_VC_U2_TRANSFER.inner2",{"x":0.115,"y":0.115},{"x":0.115,"y":3.25},{"x":-0.5,"y":3.865},{"x":-0.5,"y":4.6},{"x":-0.75,"y":4.85},"TEC_VC_R27_TRANSFER.inner2"]},
  {"name":"TEC_VC_R27_ESCAPE","from":"TEC_VC_R27_TRANSFER.top","to":"R27.pin1","thickness":0.2,"maxLength":3.3,"pcbPathRelativeTo":"TEC_VC_R27_TRANSFER.top","pcbPath":["TEC_VC_R27_TRANSFER.top",{"x":-0.85,"y":0.85},{"x":-1.55,"y":0.85},"R27.pin1"]},
  {"name":"INPUT_CLEAR_PULLUP_COLLECTOR_LOCAL","from":"Q_INPUT_CLEAR.pin3","to":"R237.pin2","thickness":0.2,"maxLength":5.8,"pcbPathRelativeTo":"Q_INPUT_CLEAR.pin3","pcbPath":["Q_INPUT_CLEAR.pin3",{"x":-3.2,"y":0},"R237.pin2"]},
  {"name":"ARM_CLOCK_PULLDOWN_LOCAL","from":"U_CLOCK_BUFFER.pin6","to":"R242.pin1","thickness":0.2,"maxLength":9,"pcbPathRelativeTo":"U_CLOCK_BUFFER.pin6","pcbPath":["U_CLOCK_BUFFER.pin6",{"x":-3.4,"y":-1.15},{"x":-3.4,"y":-3.65},{"x":-1.5,"y":-3.65},"R242.pin1"]},
  {"name":"RUN_CLOCK_INPUT_LATCH_LOCAL","from":"U_CLOCK_BUFFER.pin4","to":"U_INPUT_LATCH.pin1","thickness":0.2,"maxLength":13.2,"pcbPathRelativeTo":"U_CLOCK_BUFFER.pin4","pcbPath":["U_CLOCK_BUFFER.pin4",{"x":4.05,"y":-1.8},{"x":4.05,"y":-3},{"x":4.25,"y":-3.2},{"x":6.75,"y":-3.2},{"x":9.55,"y":-0.4},"U_INPUT_LATCH.pin1"]},
  {"name":"RUN_CLOCK_PULLDOWN_REMAINDER","from":"R243.pin1","to":"U_CLOCK_BUFFER.pin4","thickness":0.2,"maxLength":14.6,"pcbPathRelativeTo":"R243.pin1","pcbPath":["R243.pin1",{"x":-0.75,"y":-0.5},{"x":-0.05,"y":-1.2},{"x":5.65,"y":-1.2},{"x":7.3,"y":0.45},{"x":7.3,"y":1.35},"U_CLOCK_BUFFER.pin4"]},
  {"name":"HOT_HALF_DIVIDER_LINK","from":"R212.pin2","to":"R213.pin1","thickness":0.2,"maxLength":1.6,"pcbPathRelativeTo":"R212.pin2","pcbPath":["R212.pin2","R213.pin1"]},
  {"name":"HOT_HALF_IN1_LINK","from":"R212.pin2","to":"U_THERMAL.pin3","thickness":0.2,"maxLength":2.55,"pcbPathRelativeTo":"R212.pin2","pcbPath":["R212.pin2",{"x":1.135,"y":0.385},"U_THERMAL.pin3"]},
  {"name":"HOT_HALF_INPUT_PAIR_LINK","from":"U_THERMAL.pin3","to":"U_THERMAL.pin6","thickness":0.2,"maxLength":5.6,"pcbPathRelativeTo":"U_THERMAL.pin3","pcbPath":["U_THERMAL.pin3","U_THERMAL.pin6"]},
  {"name":"DBG_PERMIT_FEED_FROM","from":"U_DBG1.pin4","to":"DBG_PERMIT_FROM_VIA.top","thickness":0.2,"maxLength":0.8842640687119272,"pcbPathRelativeTo":"U_DBG1.pin4","pcbPath":["U_DBG1.pin4",{"x":1.4,"y":1.3},"DBG_PERMIT_FROM_VIA.top"]},
  {"name":"DBG_PERMIT_FEED_TRUNK","from":"DBG_PERMIT_FROM_VIA.inner2","to":"DBG_PERMIT_TO_VIA.inner2","thickness":0.2,"maxLength":2.934873734152913,"pcbPathRelativeTo":"DBG_PERMIT_FROM_VIA.inner2","pcbPath":["DBG_PERMIT_FROM_VIA.inner2",{"x":0.45,"y":0},"DBG_PERMIT_TO_VIA.inner2"]},
  {"name":"DBG_PERMIT_FEED_TO","from":"DBG_PERMIT_TO_VIA.top","to":"R507.pin1","thickness":0.2,"maxLength":0.91,"pcbPath":["DBG_PERMIT_TO_VIA.top","R507.pin1"]},
  {"name":"TP15_PERMIT_TAP","from":"TP15.pin1","to":"DBG_PERMIT_FROM_VIA.top","thickness":0.2,"maxLength":2.5171067811865475,"pcbPathRelativeTo":"TP15.pin1","pcbPath":["TP15.pin1",{"x":-1.8,"y":0},"DBG_PERMIT_FROM_VIA.top"]},
  {"name":"TP12_DAC_FROM","from":"U_DAC.pin1","to":"TP12_DAC_FROM_VIA.top","thickness":0.2,"maxLength":0.6161269837220827,"pcbPathRelativeTo":"U_DAC.pin1","pcbPath":["U_DAC.pin1",{"x":-1.17,"y":-1.62},"TP12_DAC_FROM_VIA.top"]},
  {"name":"TP12_DAC_TRUNK","from":"TP12_DAC_FROM_VIA.inner2","to":"TP12_DAC_TO_VIA.inner2","thickness":0.2,"maxLength":2.0358683245815348,"pcbPathRelativeTo":"TP12_DAC_FROM_VIA.inner2","pcbPath":["TP12_DAC_FROM_VIA.inner2",{"x":-0.835,"y":-0.835},"TP12_DAC_TO_VIA.inner2"]},
  {"name":"TP12_DAC_TO","from":"TP12_DAC_TO_VIA.top","to":"TP12.pin1","thickness":0.2,"maxLength":0.9999494936611661,"pcbPath":["TP12_DAC_TO_VIA.top","TP12.pin1"]},
  {"name":"TP17_BUFFERED_RUN_TAP","from":"U_DBG2.pin4","to":"TP17.pin1","thickness":0.2,"maxLength":6.2,"pcbPathRelativeTo":"U_DBG2.pin4","pcbPath":["U_DBG2.pin4",{"x":3,"y":-0.75},"TP17.pin1"]},
] as const
export const source16ViaProps = [
  {"name":"TEC_FB_U2_TRANSFER","pcbX":-0.65,"pcbY":7.53,"holeDiameter":0.3,"outerDiameter":0.7,"fromLayer":"top","toLayer":"bottom","connectsTo":"net.TEC_FB","tented":true,"inner2":false},
  {"name":"TEC_FB_R29_TRANSFER","pcbX":0.75,"pcbY":2.1,"holeDiameter":0.3,"outerDiameter":0.7,"fromLayer":"top","toLayer":"bottom","connectsTo":"net.TEC_FB","tented":true,"inner2":false},
  {"name":"TEC_VC_U2_TRANSFER","pcbX":-2.7,"pcbY":16.4,"holeDiameter":0.3,"outerDiameter":0.7,"fromLayer":"top","toLayer":"bottom","connectsTo":"net.TEC_VC","tented":true,"inner2":true},
  {"name":"TEC_VC_R27_TRANSFER","pcbX":-8.3,"pcbY":21.25,"holeDiameter":0.3,"outerDiameter":0.7,"fromLayer":"top","toLayer":"bottom","connectsTo":"net.TEC_VC","tented":true,"inner2":true},
  {"name":"DBG_PERMIT_FROM_VIA","pcbX":-40.3,"pcbY":-23,"holeDiameter":0.3,"outerDiameter":0.7,"fromLayer":"top","toLayer":"bottom","connectsTo":"net.DBG_TEC_PERMIT","tented":true,"inner2":true},
  {"name":"DBG_PERMIT_TO_VIA","pcbX":-38.1,"pcbY":-21.25,"holeDiameter":0.3,"outerDiameter":0.7,"fromLayer":"top","toLayer":"bottom","connectsTo":"net.DBG_TEC_PERMIT","tented":true,"inner2":true},
  {"name":"TP12_DAC_FROM_VIA","pcbX":-1.465,"pcbY":-21.62,"holeDiameter":0.3,"outerDiameter":0.7,"fromLayer":"top","toLayer":"bottom","connectsTo":"net.TEC_DAC","tented":true,"inner2":true},
  {"name":"TP12_DAC_TO_VIA","pcbX":-2.3,"pcbY":-23.3,"holeDiameter":0.3,"outerDiameter":0.7,"fromLayer":"top","toLayer":"bottom","connectsTo":"net.TEC_DAC","tented":true,"inner2":true},
] as const
export const source16ConnectionPlans = [
  {"name":"INPUT_ILIM_SWITCH_LOCAL","net":"INPUT_ILIM_SWITCH","from":"R_INPUT_ILIM_HIGH.pin2","to":"Q_INPUT_HIGH.pin3","traces":["INPUT_ILIM_SWITCH_LOCAL"]},
  {"name":"INPUT_CURRENT_MON_LOCAL","net":"INPUT_CURRENT_MON","from":"U_INPUT.pin9","to":"R_INPUT_ILIM.pin1","traces":["INPUT_CURRENT_MON_LOCAL"]},
  {"name":"INPUT_OVLO_DIVIDER_LOCAL","net":"INPUT_OVLO","from":"R_INPUT_OV_BOTTOM.pin1","to":"R_INPUT_OV_TOP.pin2","traces":["INPUT_OVLO_DIVIDER_LOCAL"]},
  {"name":"INPUT_ENABLE_OFF_LOCAL","net":"INPUT_ENABLE","from":"R_INPUT_OFF.pin1","to":"INPUT_ENABLE_ESCAPE_VIA.top","requiredSelectors":["U_INPUT.pin1"],"traces":["INPUT_ENABLE_ESCAPE","INPUT_ENABLE_OFF_LOCAL"],"branchEndpoints":{"INPUT_ENABLE_ESCAPE":["U_INPUT.pin1","INPUT_ENABLE_ESCAPE_VIA.top"],"INPUT_ENABLE_OFF_LOCAL":["R_INPUT_OFF.pin1","INPUT_ENABLE_ESCAPE_VIA.top"]}},
  {"name":"TEC_VCC_LOCAL_GROUP","net":"TEC_VCC_INT","from":"U2.pin1","to":"C21.pin1","traces":["TEC_VCC_U2_DECOUPLER","TEC_VCC_LOCAL_HF","TEC_VCC_LOCAL_BULK","TEC_VCC_D20_DIRECT"],"requiredSelectors":["U2.pin1","C21.pin1","C22.pin1","C41.pin1","D20.pin2"],"branchEndpoints":{"TEC_VCC_U2_DECOUPLER":["U2.pin1","C21.pin1"],"TEC_VCC_LOCAL_HF":["C21.pin1","C22.pin1"],"TEC_VCC_LOCAL_BULK":["C21.pin1","C41.pin1"],"TEC_VCC_D20_DIRECT":["U2.pin1","D20.pin2"]}},
  {"name":"TEC_HARD_LIMIT_DIVIDER_LOCAL","net":"TEC_HARD_LIMIT","from":"R31.pin2","to":"R32.pin1","traces":["TEC_HARD_LIMIT_DIVIDER_LOCAL"]},
  {"name":"TEC_CURRENT_COMMAND_DIVIDER_LOCAL_WEST","net":"TEC_CURRENT_COMMAND","from":"R33.pin2","to":"R34.pin1","traces":["TEC_CURRENT_COMMAND_DIVIDER_LOCAL_WEST"]},
  {"name":"TEC_FB_LOCAL_GROUP","net":"TEC_FB","from":"U2.pin10","to":"R29.pin2","traces":["TEC_FB_U2_ESCAPE","TEC_FB_LOCAL","TEC_FB_R29_ESCAPE","TEC_FB_DIVIDER_LOCAL"],"requiredSelectors":["U2.pin10","R29.pin2","R30.pin1"],"branchEndpoints":{"TEC_FB_U2_ESCAPE":["U2.pin10","TEC_FB_U2_TRANSFER.top"],"TEC_FB_LOCAL":["TEC_FB_U2_TRANSFER.bottom","TEC_FB_R29_TRANSFER.bottom"],"TEC_FB_R29_ESCAPE":["TEC_FB_R29_TRANSFER.top","R29.pin2"],"TEC_FB_DIVIDER_LOCAL":["R29.pin2","R30.pin1"]}},
  {"name":"TEC_VC_LOCAL_GROUP","net":"TEC_VC","from":"U2.pin13","to":"R27.pin1","traces":["TEC_VC_U2_ESCAPE","TEC_VC_LOCAL","TEC_VC_R27_ESCAPE"],"requiredSelectors":["U2.pin13","R27.pin1"],"branchEndpoints":{"TEC_VC_U2_ESCAPE":["U2.pin13","TEC_VC_U2_TRANSFER.top"],"TEC_VC_LOCAL":["TEC_VC_U2_TRANSFER.inner2","TEC_VC_R27_TRANSFER.inner2"],"TEC_VC_R27_ESCAPE":["TEC_VC_R27_TRANSFER.top","R27.pin1"]}},
  {"name":"TP12_DAC_OUTPUT_TAP","net":"TEC_DAC","from":"U_DAC.pin1","to":"TP12.pin1","traces":["TP12_DAC_FROM","TP12_DAC_TRUNK","TP12_DAC_TO"]},
  {"name":"INPUT_CLEAR_PULLUP_COLLECTOR_LOCAL","net":"INPUT_CLEAR_RAW","from":"Q_INPUT_CLEAR.pin3","to":"R237.pin2","traces":["INPUT_CLEAR_PULLUP_COLLECTOR_LOCAL"]},
  {"name":"ARM_CLOCK_PULLDOWN_LOCAL","net":"ARM_CLK","from":"U_CLOCK_BUFFER.pin6","to":"R242.pin1","traces":["ARM_CLOCK_PULLDOWN_LOCAL"]},
  {"name":"RUN_CLOCK_COMPLETE_LOCAL","net":"RUN_CLK","from":"R243.pin1","to":"U_INPUT_LATCH.pin1","traces":["RUN_CLOCK_PULLDOWN_REMAINDER","RUN_CLOCK_INPUT_LATCH_LOCAL"],"requiredSelectors":["U_CLOCK_BUFFER.pin4"],"branchEndpoints":{"RUN_CLOCK_PULLDOWN_REMAINDER":["R243.pin1","U_CLOCK_BUFFER.pin4"],"RUN_CLOCK_INPUT_LATCH_LOCAL":["U_CLOCK_BUFFER.pin4","U_INPUT_LATCH.pin1"]}},
  {"name":"HOT_HALF_LOCAL_GROUP","net":"HOT_HALF","from":"R212.pin2","to":"R213.pin1","traces":["HOT_HALF_DIVIDER_LINK","HOT_HALF_IN1_LINK","HOT_HALF_INPUT_PAIR_LINK"],"requiredSelectors":["U_THERMAL.pin3","U_THERMAL.pin6"],"branchEndpoints":{"HOT_HALF_DIVIDER_LINK":["R212.pin2","R213.pin1"],"HOT_HALF_IN1_LINK":["R212.pin2","U_THERMAL.pin3"],"HOT_HALF_INPUT_PAIR_LINK":["U_THERMAL.pin3","U_THERMAL.pin6"]}},
  {"name":"DBG_TEC_PERMIT_LOCAL_GROUP","net":"DBG_TEC_PERMIT","from":"U_DBG1.pin4","to":"R507.pin1","traces":["DBG_PERMIT_FEED_FROM","DBG_PERMIT_FEED_TRUNK","DBG_PERMIT_FEED_TO","TP15_PERMIT_TAP"],"requiredSelectors":["TP15.pin1"],"branchEndpoints":{"DBG_PERMIT_FEED_FROM":["U_DBG1.pin4","DBG_PERMIT_FROM_VIA.top"],"DBG_PERMIT_FEED_TRUNK":["DBG_PERMIT_FROM_VIA.inner2","DBG_PERMIT_TO_VIA.inner2"],"DBG_PERMIT_FEED_TO":["DBG_PERMIT_TO_VIA.top","R507.pin1"],"TP15_PERMIT_TAP":["TP15.pin1","DBG_PERMIT_FROM_VIA.top"]}},
  {"name":"TP17_BUFFERED_RUN_TAP","net":"DBG_MCU_RUN","from":"U_DBG2.pin4","to":"TP17.pin1","traces":["TP17_BUFFERED_RUN_TAP"]},
] as const satisfies readonly SourcePadConnectionPlan[]
export const source16ReviewedWholePaths = [
  { name: "TEC_FB_LOCAL", traces: ["TEC_FB_U2_ESCAPE", "TEC_FB_LOCAL", "TEC_FB_R29_ESCAPE"], barrels: 2, maxMm: 13.4 },
  { name: "TEC_VC_LOCAL", traces: ["TEC_VC_U2_ESCAPE", "TEC_VC_LOCAL", "TEC_VC_R27_ESCAPE"], barrels: 2, maxMm: 22.3 },
  { name: "TP12_DAC_OUTPUT_TAP", traces: ["TP12_DAC_FROM", "TP12_DAC_TRUNK", "TP12_DAC_TO"], barrels: 2, planarMaxMm: 3.7, maxMm: 7.2 },
] as const

export function Source16Routes() {
  return <>
    {source16ViaProps.map(({ inner2, ...props }) => <via {...props}
      {...{ key: props.name, ...(inner2 ? { ref: attachLogicSupplyInner2Port } : {}) }} />)}
    {source16TraceProps.map(props => <trace key={props.name} {...props} pcbPath={[...props.pcbPath]} />)}
  </>
}
