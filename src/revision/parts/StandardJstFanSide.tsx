import type { ChipProps } from "@tscircuit/props"
import { cloneElement } from "react"
import { SM04B_SRSS_TB_LF__SN_ } from "../../../imports/SM04B_SRSS_TB_LF__SN_"

const pinLabels = {
  pin1: ["GND"],
  pin2: ["V12"],
  pin3: ["TACH"],
  pin4: ["PWM"],
} as const

export type StandardJstFanSideProps = Omit<ChipProps,
  "footprint" | "pinLabels" | "cadModel" | "manufacturerPartNumber" | "supplierPartNumbers">

export function StandardJstFanSide(props: StandardJstFanSideProps) {
  const imported = SM04B_SRSS_TB_LF__SN_({ name: props.name })
  return <connector {...props} standard="jst_sh" pinCount={4} pinLabels={pinLabels}
    manufacturerPartNumber={imported.props.manufacturerPartNumber}
    supplierPartNumbers={imported.props.supplierPartNumbers}
    footprint={cloneElement(imported.props.footprint, { insertionDirection: "from_bottom" })} cadModel={imported.props.cadModel} />
}
