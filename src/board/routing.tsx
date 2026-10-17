import type { TraceProps } from "@tscircuit/props"

// Initial top-layer copper; the remaining board is deliberately unrouted.
// Waypoints use the from-pin component's origin and rotation, in millimeters.
export const INITIAL_ROUTES: { from: string; to: string; width: number; path?: TraceProps["pcbPath"] }[] = [
  // Converter enable filter
  { from: ".R_DRIVER_EN_TOP > .pin2", to: ".R_DRIVER_EN_BOTTOM > .pin1", width: 0.25 },
  { from: ".R_DRIVER_EN_BOTTOM > .pin1", to: ".C_DRIVER_EN > .pin1", width: 0.25 },
  { from: ".R_DRIVER_EN_BOTTOM > .pin2", to: ".C_DRIVER_EN > .pin2", width: 0.25 },
  // Fan regulator
  { from: ".U_FAN > .pin4", to: ".U_FAN > .pin5", width: 0.4 },
  { from: ".U_FAN > .pin1", to: ".C_FAN_BOOT > .pin1", width: 0.25 },
  { from: ".C_FAN_OUT1 > .pin1", to: ".C_FAN_OUT2 > .pin1", width: 0.8 },
  { from: ".C_FAN_OUT1 > .pin2", to: ".C_FAN_OUT2 > .pin2", width: 0.8 },
  { from: ".R_FAN_FB_TOP > .pin2", to: ".R_FAN_FB_BOTTOM > .pin1", width: 0.2 },
  { from: ".C_FAN_IN > .pin2", to: ".C_FAN_IN_HF > .pin2", width: 0.4 },
  // ADC filters
  { from: ".R_I_ADC > .pin2", to: ".C_I_ADC > .pin1", width: 0.25 },
  { from: ".R_V_ADC_TOP > .pin2", to: ".R_V_ADC_BOTTOM > .pin1", width: 0.25, path: [{ x: 0.753364, y: -1 }, { x: -0.753364, y: -2.506728 }] },
  { from: ".R_V_ADC_TOP > .pin2", to: ".C_V_ADC > .pin1", width: 0.25, path: [{ x: 0.753364, y: -1.453364 }] },
  { from: ".R_PD_ADC_TOP > .pin2", to: ".R_PD_ADC_BOTTOM > .pin1", width: 0.25 },
  { from: ".R_PD_ADC_BOTTOM > .pin1", to: ".C_PD_ADC > .pin1", width: 0.25, path: [{ x: -0.753364, y: 0.4 }, { x: 0.046636, y: 1.2 }, { x: 2.1, y: 1.2 }] },
  { from: ".R_PROGRAM_SENSE_TOP > .pin2", to: ".R_PROGRAM_SENSE_BOTTOM > .pin1", width: 0.25 },
  { from: ".R_PROGRAM_SENSE_BOTTOM > .pin1", to: ".C_PROGRAM_SENSE > .pin1", width: 0.25, path: [{ x: -0.753364, y: 0.4 }, { x: 0.046636, y: 1.2 }, { x: 2.1, y: 1.2 }] },
  // Logic supplies
  { from: ".U_AUX > .pin5", to: ".U_AUX > .pin4", width: 0.3 },
  { from: ".U_AUX > .pin1", to: ".C_AUX_BOOT > .pin1", width: 0.25 },
  { from: ".C_AUX_IN > .pin1", to: ".C_AUX_HF > .pin1", width: 0.4 },
  { from: ".C_AUX_IN > .pin2", to: ".C_AUX_HF > .pin2", width: 0.4 },
  { from: ".L_AUX > .pin2", to: ".C_AUX_OUT > .pin1", width: 0.5 },
  { from: ".U_AUX > .pin3", to: ".C_AUX_OUT > .pin1", width: 0.2 },
  { from: ".U_LOGIC_MUX > .pin2", to: ".U_LOGIC_MUX > .pin7", width: 0.18 },
  { from: ".U_LOGIC_MUX > .pin4", to: ".U_LOGIC_MUX > .pin5", width: 0.18 },
  { from: ".U_LOGIC_MUX > .pin2", to: ".C_LOGIC_MUX_OUT > .pin1", width: 0.2, path: [{ x: -0.249936, y: -1.5 }, { x: 1.250064, y: -3 }] },
  { from: ".U_CTRL_LDO > .pin1", to: ".U_CTRL_LDO > .pin3", width: 0.25, path: [{ x: 2.4, y: -0.94996 }, { x: 2.4, y: 0.94996 }] },
  // Temperature ports
  { from: ".U_SENSOR_ESD > .pin1", to: ".U_SENSOR_ESD > .pin6", width: 0.2 },
  { from: ".R_HOT_PULLUP > .pin2", to: ".R_HOT_SERIES > .pin2", width: 0.2 },
  { from: ".R_HOT_SERIES > .pin2", to: ".U_SENSOR_ESD > .pin6", width: 0.2 },
  { from: ".R_HOT_SERIES > .pin2", to: ".J_HOT_SENSOR > .pin2", width: 0.2, path: [{ x: 0.753364, y: 2 }] },
  { from: ".R_HOT_PULLUP > .pin1", to: ".C_HOT_SENSOR > .pin1", width: 0.2 },
  { from: ".C_HOT_SENSOR > .pin2", to: ".J_HOT_SENSOR > .pin3", width: 0.2, path: [{ x: 0.7, y: 2 }, { x: -11, y: 2 }] },
  { from: ".U_SENSOR_ESD > .pin3", to: ".U_SENSOR_ESD > .pin4", width: 0.2 },
  { from: ".R_COLD_PULLUP > .pin2", to: ".R_COLD_SERIES > .pin2", width: 0.2 },
  { from: ".R_COLD_PULLUP > .pin2", to: ".U_SENSOR_ESD > .pin3", width: 0.2, path: [{ x: 2.2, y: 1.446636 }, { x: 2.2, y: 7.600864 }] },
  { from: ".R_COLD_SERIES > .pin2", to: ".J_COLD_SENSOR > .pin2", width: 0.2, path: [{ x: 0.753364, y: 2 }] },
  { from: ".R_COLD_PULLUP > .pin1", to: ".C_COLD_SENSOR > .pin1", width: 0.2 },
  { from: ".C_COLD_SENSOR > .pin2", to: ".J_COLD_SENSOR > .pin3", width: 0.2, path: [{ x: 0.7, y: 2 }, { x: -11, y: 2 }] },
  { from: ".C_COLD_SENSOR > .pin2", to: ".U_SENSOR_ESD > .pin2", width: 0.2, path: [{ x: 0.7, y: 2 }, { x: 0, y: 2 }] },
  // Hardware permission
  { from: ".Q_MCU_KILL > .pin1", to: ".R_KILL_RESET > .pin2", width: 0.2, path: [{ x: 0.753364, y: -1.206636 }] },
  { from: ".Q_MCU_KILL > .pin1", to: ".Q_MCU_RELEASE > .pin3", width: 0.2, path: [{ x: 1.31, y: -1.25 }, { x: 6.750002, y: -1.25 }] },
  { from: ".R_KILL_DRIVE > .pin2", to: ".R_RELEASE_OFF > .pin1", width: 0.2, path: [{ x: 2.1, y: -1.346636 }, { x: 8.593272, y: -1.346636 }] },
  { from: ".R_RELEASE_OFF > .pin1", to: ".Q_MCU_RELEASE > .pin1", width: 0.2, path: [{ x: 3, y: 3.753364 }, { x: 3, y: 9.050038 }] },
  // Crystal and reset
  { from: ".U_MCU > .pin20", to: ".Y_MCU > .pin1", width: 0.15, path: [
    { x: -0.599948, y: -4.2 }, { x: -1.6, y: -5.200052 }, { x: -1.6, y: -6 },
    { x: -2.1, y: -6.5 }, { x: -2.1, y: -8.5 }, { x: -1.749989, y: -8.850011 },
  ] },
  { from: ".Y_MCU > .pin1", to: ".C_XIN > .pin1", width: 0.15 },
  { from: ".U_MCU > .pin21", to: ".R_XOUT > .pin1", width: 0.15, path: [{ x: -0.200152, y: -4.5 }, { x: 0, y: -4.700152 }, { x: 0, y: -6.25 }, { x: 3.1, y: -6.25 }, { x: 4.253364, y: -7.403364 }] },
  { from: ".Y_MCU > .pin3", to: ".R_XOUT > .pin2", width: 0.15 },
  { from: ".R_XOUT > .pin2", to: ".C_XOUT > .pin1", width: 0.15 },
  { from: ".U_MCU > .pin26", to: ".C_MCU_RUN > .pin1", width: 0.15, path: [{ x: 1.799844, y: -4.2 }, { x: 2.599844, y: -5 }, { x: 5.3, y: -5 }, { x: 6.3, y: -6 }, { x: 6.3, y: -10 }] },
  { from: ".C_MCU_RUN > .pin1", to: ".R_RUN > .pin2", width: 0.2, path: [{ x: -0.7, y: -0.9 }, { x: 4.753364, y: -0.9 }] },
  // PD negotiation and input gate control
  { from: ".U_PD > .pin14", to: ".J_USB > .pin14", width: 0.2, path: [
    { x: 1.970024, y: -0.750062 }, { x: 2.1, y: -0.8 }, { x: 2.6, y: -0.8 },
    { x: 2.6, y: -1.7 }, { x: 1.2, y: -3.1 }, { x: 1.2, y: -3.6 },
    { x: -0.6, y: -5.4 }, { x: -2.4, y: -5.4 }, { x: -2.4, y: -8.6 },
    { x: -2.5, y: -8.7 }, { x: -2.5, y: -10.1 }, { x: -2.8, y: -10.1 },
    { x: -2.9, y: -10.2 }, { x: -3.1, y: -10.2 }, { x: -3.169928, y: -10.279906 },
  ] },
  { from: ".U_PD > .pin15", to: ".J_USB > .pin1", width: 0.2, path: [
    { x: 1.970024, y: -0.249936 }, { x: 2.1, y: -0.2 }, { x: 3.1, y: -0.2 },
    { x: 3.3, y: -0.4 }, { x: 3.6, y: -0.4 }, { x: 3.6, y: -1.2 },
    { x: 3, y: -1.8 }, { x: 3, y: -1.9 }, { x: 1.6, y: -3.3 },
    { x: 1.6, y: -3.8 }, { x: -1.2, y: -6.6 }, { x: -1.2, y: -7.5 },
    { x: -1.4, y: -7.5 }, { x: -1.5, y: -7.6 }, { x: -1.7, y: -7.6 },
    { x: -1.819918, y: -7.72492 },
  ] },
  { from: ".U_PD > .pin3", to: ".R_GATE > .pin1", width: 0.2, path: [
    { x: -1.970024, y: 0.249936 }, { x: -2.1, y: 0.2 }, { x: -2.9, y: 0.2 },
    { x: -3.5, y: -0.4 }, { x: -3.6, y: -0.4 }, { x: -3.7, y: -0.5 },
    { x: -3.7, y: -1.7 }, { x: -4.3, y: -2.3 }, { x: -4.3, y: -14 },
    { x: -4.5, y: -14.2 }, { x: -4.5, y: -23.4 }, { x: -4.6, y: -23.5 },
    { x: -4.6, y: -23.6 }, { x: -4.7, y: -23.7 }, { x: -4.7, y: -23.9 },
    { x: -4.753364, y: -24 },
  ] },
  { from: ".U_PD > .pin1", to: ".U_PD > .pin2", width: 0.2, path: [{ x: -1.970024, y: 1.249934 }, { x: -1.970024, y: 0.750062 }] },
  { from: ".U_PD > .pin1", to: ".U_PD > .pin23", width: 0.2, path: [
    { x: -1.970024, y: 1.249934 }, { x: -2, y: 1.4 }, { x: -2, y: 2.4 },
    { x: -2.4, y: 2.8 }, { x: -2.4, y: 4 }, { x: -1.2, y: 4 },
    { x: -0.8, y: 3.6 }, { x: -0.8, y: 2.1 }, { x: -0.750062, y: 1.970024 },
  ] },
  { from: ".R_GATE > .pin2", to: ".Q_INPUT > .pin4", width: 0.2, path: [
    { x: 0.753364, y: 0 }, { x: 0.9, y: 0.1 }, { x: 3, y: 2.2 },
    { x: 3.2, y: 2.2 }, { x: 3.7, y: 2.7 }, { x: 3.7, y: 3 },
    { x: 3.8, y: 3.1 }, { x: 3.8, y: 3.3 }, { x: 3.905, y: 3.400056 },
  ] },
  { from: ".Q_INPUT > .pin4", to: ".Q_REVERSE > .pin4", width: 0.2, path: [
    { x: 1.905, y: -2.599944 }, { x: 2.1, y: -2.6 }, { x: 3, y: -2.6 },
    { x: 3.6, y: -3.2 }, { x: 5.4, y: -3.2 }, { x: 5.6, y: -3.4 },
    { x: 7.1, y: -3.4 }, { x: 7.5, y: -3.8 }, { x: 11.2, y: -3.8 },
    { x: 11.5, y: -3.5 }, { x: 11.5, y: -3.4 }, { x: 11.6, y: -3.3 },
    { x: 11.6, y: -3.2 }, { x: 11.7, y: -3.1 }, { x: 11.7, y: -3 },
    { x: 11.8, y: -2.9 }, { x: 11.8, y: -2.7 }, { x: 11.905, y: -2.599944 },
  ] },
  { from: ".R_GATE > .pin2", to: ".R_GATE_OFF > .pin2", width: 0.2, path: [
    { x: 0.753364, y: 0 }, { x: 1.9, y: 0 }, { x: 2.5, y: -0.6 },
    { x: 3.4, y: -0.6 }, { x: 3.5, y: -0.7 }, { x: 4.9, y: -0.7 },
    { x: 5.5, y: -0.1 }, { x: 5.7, y: -0.1 }, { x: 5.753364, y: 0 },
  ] },
  { from: ".R_FAULT_BASE > .pin2", to: ".R_FAULT_OFF > .pin1", width: 0.2, path: [
    { x: 0.753364, y: 0 }, { x: 0.7, y: -0.1 }, { x: 0.5, y: -0.3 },
    { x: 0.3, y: -0.3 }, { x: -0.1, y: -0.7 }, { x: -3.9, y: -0.7 },
    { x: -4.5, y: -0.1 }, { x: -4.7, y: -0.1 }, { x: -4.753364, y: 0 },
  ] },
  { from: ".R_FAULT_BASE > .pin2", to: ".Q_PD_FAULT > .pin1", width: 0.2, path: [
    { x: 0.753364, y: 0 }, { x: 1.9, y: 0 }, { x: 2.5, y: -0.6 },
    { x: 4.3, y: -0.6 }, { x: 4.5, y: -0.8 }, { x: 7.6, y: -0.8 },
    { x: 7.7, y: -0.9 }, { x: 7.9, y: -0.9 }, { x: 8.01, y: -0.95 },
  ] },
  // Status LEDs
  { from: ".R_LED_POWER > .pin2", to: ".LED_POWER > .pin1", width: 0.25 },
  { from: ".R_LED_RUN > .pin2", to: ".LED_RUN > .pin2", width: 0.25 },
  { from: ".R_LED_FAULT > .pin2", to: ".LED_FAULT > .pin1", width: 0.25 },
  // Programming connector contact tie
  { from: ".J_PROGRAM > .pin4", to: ".J_PROGRAM > .pin13", width: 0.15 },
]

export function InitialRouting() {
  return <>{INITIAL_ROUTES.map(({ from, to, width, path }, index) =>
    <trace key={String(index)} name={`INITIAL_ROUTE_${index}`} from={from} to={to}
      width={width} pcbPath={path ?? [] } />)}</>
}
