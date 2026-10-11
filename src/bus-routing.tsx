import React from "react"
import {GroundEscapes} from "./ground-escapes"
import {groundFanoutPorts} from "./ground-fanout-ports"
import {routeGuardedNative} from "./guarded-router"
import {sourceGroundPaths} from "./ground-trace-paths"
import {debugBufferNets,debugGroundPorts,debugRailIndicators,debugStatusIndicators} from "./blocks/debug-data"

export const i2cBusTraceNames = ["I2C_MCU_DAC_SCL", "I2C_MCU_DAC_SDA"] as const
// Every fitted ground port remains required. Source-owned debug, bulk-cap and
// USB returns retain their physical coverage outside native pad fanout.
export const requiredGroundPorts=[...groundFanoutPorts,...debugGroundPorts] as const
export const selectedGroundFanoutPorts=groundFanoutPorts.filter(port=>
  port!=="C_INPUT_DVDT.pin2"&&port!=="C28.pin2"&&port!=="C30.pin2"&&port!=="C31.pin2"
  &&port!=="J_USB.EH2"&&port!=="J_USB.EH1"&&port!=="J_USB.GND2"&&port!=="C43.pin2"&&port!=="U_CLEAR_BUFFER.pin2")

// Route small, electrically meaningful net cohorts through the native latest
// solver. All named non-GND nets are assigned explicitly; the bus still owns
// its two physical trunk traces in phase 1.
export const signalRoutingGroups = [
  {name:"LOGIC_SUPPLIES",nets:["V3V3","V12_FAN"]},
  {name:"MAIN_POWER",nets:["VBUS_RAW","VBUS_TEC","TEC_POS","TEC_SW","TEC_INDUCTOR_OUT"]},
  {name:"PD_LOCAL_SUPPLIES",nets:["PD_RESET","PD_VS","PD_1V2","PD_2V7"]},
  {name:"USB_CC",nets:["USB_CC1","USB_CC2"]},
  {name:"INPUT_PROTECTION",nets:["INPUT_ENABLE","INPUT_OVLO","INPUT_CURRENT_MON","INPUT_ILIM_SWITCH","INPUT_DVDT"]},
  {name:"PD_LATCH_STATUS",nets:["PD_DISCH","PD_VALID_N","PD_ALERT","PD_INHIBIT_BASE"]},
  {name:"INPUT_SHARED_FAULT",nets:["INPUT_FAULT_N","POWER_BUDGET_HIGH"]},
  {name:"CONVERTER_BIAS",nets:["TEC_VCC_INT","TEC_EN_UVLO","TEC_VREF","TEC_HARD_LIMIT","TEC_CURRENT_COMMAND","TEC_SS"]},
  {name:"CONVERTER_REGULATION",nets:["TEC_FB","TEC_SENSE_P_FILTERED","TEC_SENSE_N_FILTERED","TEC_VC","TEC_RT","TEC_COMP_RC"]},
  {name:"CONVERTER_GATE_COMMAND",nets:["TEC_HG","TEC_LG","TEC_BOOT","TEC_HIGH_GATE","TEC_LOW_GATE","TEC_DAC"]},
  {name:"SAFE_POWER_PERMISSION",nets:["TEC_PERMISSION_PNP_BASE","TEC_PERMISSION_NPN_BASE","TEC_PERMISSION_SUPPLY",
    "TEC_PERMISSION_PNP_DRIVE","TEC_SAFE_EN","TEC_REQUEST"]},
  {name:"SAFE_LATCH_STATE",nets:["TEC_CLEAR_N","MCU_ARM","MCU_RUN","INPUT_ARMED","PD_LATCH_INHIBIT"]},
  {name:"SAFE_CONDITIONING",nets:["TEC_CLEAR_RAW","INPUT_CLEAR_RAW","INPUT_CLEAR_N","ARM_CLK","RUN_CLK"]},
  {name:"QUIET_BUS_SENSE",nets:["I2C_SCL","I2C_SDA","TEC_MON_SENSE_N","TEC_MON_SENSE_P"]},
  {name:"QUIET_ADC",nets:["VOUT_ADC","VBUS_ADC","HOT_RAW","COLD_RAW","HOT_ADC","COLD_ADC"]},
  {name:"FAULT_DRIVE",nets:["FAULT_SOURCE","FAULT_PNP_BASE","FAULT_NPN_BASE"]},
  {name:"THERMAL_THRESHOLDS",nets:["HOT_LOW","HOT_HALF","HOT_HIGH","INPUT_FAULT_NPN_BASE"]},
  {name:"AUXILIARY_POWER",nets:["LOGIC_SW","LOGIC_BST","FAN_SW","FAN_BST","FAN_FB"]},
  {name:"AUXILIARY_FAN_IO",nets:["FAN_PWM_BASE","FAN_PWM","FAN_PWM_DRIVE","FAN_TACH","FAN_TACH_MCU"]},
  {name:"DEBUG_PORTS",nets:["MCU_NRST","UART_TX","UART_RX","UART_RX_MCU","SWDIO","SWCLK"]},
  {name:"DEBUG_RAIL_INDICATORS",nets:debugRailIndicators.map(item=>`${item.led}_A`)},
  {name:"DEBUG_STATUS_INDICATORS",nets:debugStatusIndicators.map(item=>`${item.led}_A`)},
  {name:"DEBUG_STATUS_BUFFERS",nets:debugBufferNets},
] as const
const powerNetNames=new Set(["VBUS_RAW","VBUS_TEC","V3V3","V12_FAN","TEC_POS"])
export function PhasedSignalRouting(){
  return <>{signalRoutingGroups.map((group,index)=><React.Fragment key={group.name}>
    {/* Reviewed source copper and regenerated pours join every MAIN_POWER terminal. */}
    {group.nets.map(name=><React.Fragment key={name}><net name={name} routingPhaseIndex={group.name==="MAIN_POWER"?undefined:index+2}
      isPowerNet={powerNetNames.has(name)||undefined}/></React.Fragment>)}
    {group.name!=="MAIN_POWER"&&<autoroutingphase name={group.name} phaseIndex={index+2} autorouter="auto_local" minViaHoleDiameter={.30} minViaPadDiameter={.70}
      algorithmFn={routeGuardedNative}/>}
  </React.Fragment>)}</>
}

// Source-only GND connections end on the reference plane with short escapes.
// allowBlindAndBuriedVias=false makes the generated via barrels span all layers;
// board default tenting covers both outer ends even though the logical route
// terminates at inner1. The GND pour must be ordinary, not unbroken: the current
// fanout solver treats an unbroken plane as a blocking obstacle.
export function GroundPlaneFanout() {
  return <autoroutingphase name="GROUND_ESCAPES" phaseIndex={0} autorouter="fanout" minViaHoleDiameter={.30} minViaPadDiameter={.70}
    connections={[...selectedGroundFanoutPorts]}
    pcbTracePaths={sourceGroundPaths.filter(path=>path.connection!=="U_CLEAR_BUFFER.pin2")}
    fanoutPourNetMap={{inner1: "GND"}} fanoutRoutingLayers={["top", "bottom"]}/>
}

// Declare real current-setpoint DAC connectivity, then reserve a clean corridor for it.
// SDA/SCL net branches (PD controller and pullups) remain in their owning circuit blocks.
// Low-speed I2C needs no serpentine length matching.
export function BusRouting() {
  return (
    <>
      <GroundEscapes/>
      <trace name={i2cBusTraceNames[0]} from="U_MCU.pin20" to="U_DAC.pin5" thickness={0.2}
        pcbPathRelativeTo="U_MCU.pin20"
        pcbPath={["U_MCU.pin20",{x:-5.8,y:0},"U_DAC.pin5"]}/>
      <trace name={i2cBusTraceNames[1]} from="U_MCU.pin1" to="U_DAC.pin4" thickness={0.2}
        pcbPathRelativeTo="U_MCU.pin1"
        pcbPath={["U_MCU.pin1",{x:-4.85,y:-0.95},"U_DAC.pin4"]}/>
      <bus
        name="CONTROL_I2C"
        connections={[...i2cBusTraceNames]}
        routingPhaseIndex={1}
        pcbTraceWidth={0.2}
        pcbAllowedLayers={["top"]}
        pcbTraceSpacing={0.4}
        pcbSpacingToOtherSignals={0.5}
      />
      <autoroutingphase name="CONTROL_I2C_LANES" phaseIndex={1} autorouter="bus_lanes" minViaHoleDiameter={.30} minViaPadDiameter={.70} />
    </>
  )
}
