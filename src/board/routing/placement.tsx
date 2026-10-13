import { Children, cloneElement, isValidElement, type ReactNode } from "react"
import overrides from "./layout-overrides.json"

const poses:Record<string,number[]> = overrides
export function routingPlacement(name:string,original:{pcbX?:number;pcbY?:number;pcbRotation?:number},enabled:boolean) {
  const pose=enabled?poses[name]:undefined
  return pose?{pcbX:pose[0],pcbY:pose[1],pcbRotation:pose[2]??0}:original
}
export function placeForRouting(node:ReactNode,enabled:boolean):ReactNode {
  if(!enabled)return node
  return Children.map(node,child=>{
    if(!isValidElement(child))return child
    const props=child.props as {name?:string;children?:ReactNode;pcbX?:number;pcbY?:number;pcbRotation?:number}
    return cloneElement(child,{...routingPlacement(props.name??"",props,enabled),
      ...(props.children!==undefined?{children:placeForRouting(props.children,enabled)}:{})} as any)
  })
}
