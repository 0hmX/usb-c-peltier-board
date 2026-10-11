import {Children,cloneElement,isValidElement,type ReactNode} from "react"
import type {AutoroutingPhaseProps} from "@tscircuit/props"
import type {SimpleRouteJson} from "@tscircuit/capacity-autorouter"

export const phase6RoutingRegion=Object.freeze({phaseIndex:6,phaseName:"INPUT_PROTECTION",
  bounds:Object.freeze({minX:-27.5,maxX:-5.85,minY:-22.5,maxY:25})} as const)

// Bind the supported callback to the actual declaration, never a dynamic net ID.
// Call after selecting the requested prefix; every other React prop is retained.
export function bindPhase6RoutingRegion({node,algorithmFn}:{
  node:ReactNode;algorithmFn:(input:SimpleRouteJson)=>Promise<unknown>
}){
  let boundCount=0
  const visit=(current:ReactNode):ReactNode=>{
    if(!isValidElement<AutoroutingPhaseProps&{children?:ReactNode}>(current))return current
    let selected=current
    if(current.type==="autoroutingphase"&&current.props.phaseIndex===phase6RoutingRegion.phaseIndex){
      if(current.props.name!==phase6RoutingRegion.phaseName||current.props.pcbTracePaths!==undefined)
        throw new Error("Regional override requires the original native INPUT_PROTECTION phase6")
      boundCount++
      selected=cloneElement(current,{algorithmFn})
    }
    return selected.props.children===undefined?selected:cloneElement(selected,{
      children:Children.map(selected.props.children,visit)})
  }
  const selected=visit(node)
  if(boundCount!==1)throw new Error("Regional override requires exactly one included INPUT_PROTECTION phase6")
  return {node:selected,boundCount,scope:phase6RoutingRegion}
}
