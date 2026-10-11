import { Fragment } from "react"

// Local V3 copper connects genuine supply pads before the native distribution route.
const controlV3Routes = [
  {"name":"LATCH_STATIC_V3_78","from":"U_LATCH.pin7","to":"U_LATCH.pin8","maxLength":0.6,"points":[]},
  {"name":"LATCH_STATIC_V3_27","from":"U_LATCH.pin2","to":"U_LATCH.pin7","maxLength":3.2,"points":[]},
  {"name":"INPUT_STATIC_V3_78","from":"U_INPUT_LATCH.pin7","to":"U_INPUT_LATCH.pin8","maxLength":0.6,"points":[]},
  {"name":"INPUT_STATIC_V3_27","from":"U_INPUT_LATCH.pin2","to":"U_INPUT_LATCH.pin7","maxLength":3.2,"points":[]},
  {"name":"MCU_C203_V3_BYPASS","from":"U_MCU.pin4","to":"C203.pin1","maxLength":2.2,"points":[{"x":-0.975,"y":-3.875},{"x":-0.5,"y":-4.35}]},
  {"name":"MCU_C204_V3_BANK","from":"C203.pin1","to":"C204.pin1","maxLength":4.3,"points":[{"x":-1.55,"y":-0.85},{"x":-1.55,"y":-2.5},{"x":-0.83,"y":-3.22}]},
  {"name":"INPUT_C217_V3_BYPASS","from":"U_INPUT_LATCH.pin8","to":"C217.pin1","maxLength":3.5,"points":[{"x":-1.55,"y":-1.85}]},
  {"name":"SUPERVISOR_C216_V3_BYPASS","from":"U_SUPERVISOR.pin3","to":"C216.pin1","maxLength":3.2,"points":[{"x":-0.7,"y":-0.35}]},
] as const

export function ControlV3Routes() {
  return <>{controlV3Routes.map(route => <Fragment key={route.name}><trace name={route.name}
    from={route.from} to={route.to} thickness={0.2} maxLength={route.maxLength} pcbPathRelativeTo={route.from}
    pcbPath={[route.from, ...route.points, route.to]} /></Fragment>)}</>
}
