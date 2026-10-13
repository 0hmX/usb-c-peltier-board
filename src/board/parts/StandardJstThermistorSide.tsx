import { cloneElement } from "react"
import type { ChipProps } from "@tscircuit/props"
import { StandardJstPowerSide } from "./standard-jst-programmer.js"

export function StandardJstThermistorSide(props: Omit<ChipProps, "pinLabels" | "footprint" | "cadModel">) {
  const standard = StandardJstPowerSide({ name: props.name })
  const imported = standard.type(standard.props)
  return <connector {...imported.props} {...props}
    pinLabels={{ pin1: ["NTC"], pin2: ["GND"] }}
    footprint={cloneElement(imported.props.footprint, { insertionDirection: "from_bottom" })} />
}
