import { Children, cloneElement, isValidElement, type ReactNode } from "react"
import { portableCadModel, portablePackageCadModel } from "./portable-cad"

export function withPortableCadModels(node: ReactNode): ReactNode {
  return Children.map(node, child => {
    if (!isValidElement<Record<string, any>>(child)) return child
    if (typeof child.type === "function") {
      return withPortableCadModels((child.type as (props: Record<string, any>) => ReactNode)(child.props))
    }
    const props = child.props
    let cadModel = props.cadModel
    if (isValidElement<Record<string, any>>(cadModel) && cadModel.type === "cadmodel" && typeof cadModel.props.model === "string") {
      cadModel = portablePackageCadModel(cadModel.props.model)
    } else if (cadModel && typeof cadModel === "object" && !isValidElement(cadModel)) {
      cadModel = portableCadModel(cadModel)
    }
    return cloneElement(child, {
      ...(cadModel !== props.cadModel ? { cadModel } : {}),
      ...(props.children ? { children: withPortableCadModels(props.children) } : {}),
    })
  })
}
