import React from "react"
import { BusRouting, powerNetNames, signalRoutingGroups } from "./bus-routing"
import { routeGuardedNative } from "./guarded-router"

export function PhasedSignalRouting(){
  return <>{signalRoutingGroups.map((group,index)=><React.Fragment key={group.name}>
    {/* Reviewed source copper and regenerated pours join every MAIN_POWER terminal. */}
    {group.nets.map(name=><React.Fragment key={name}><net name={name} routingPhaseIndex={group.name==="MAIN_POWER"?undefined:index+2}
      isPowerNet={powerNetNames.has(name)||undefined}/></React.Fragment>)}
    {group.name!=="MAIN_POWER"&&<autoroutingphase name={group.name} phaseIndex={index+2} autorouter="auto_local" minViaHoleDiameter={.30} minViaPadDiameter={.70}
      algorithmFn={routeGuardedNative}/>}
  </React.Fragment>)}</>
}


export function RegeneratedBusRouting(){
  return <>
    {BusRouting({routingPhaseIndex:1})}
    <autoroutingphase name="CONTROL_I2C_LANES" phaseIndex={1} autorouter="bus_lanes" minViaHoleDiameter={.30} minViaPadDiameter={.70}/>
  </>
}
