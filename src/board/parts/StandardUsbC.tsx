import type { ConnectorProps } from "@tscircuit/props"
import { TYPE_C_31_M_12 } from "../../parts/C165948"

const pinLabels = {
  pin1: ["SHELL2", "EH2"], pin2: ["SHELL1", "EH1"], pin3: ["SHELL4", "EH4"], pin4: ["SHELL3", "EH3"],
  pin5: ["SBU2"], pin6: ["CC1"], pin7: ["DM2", "DN2"], pin8: ["DP1"], pin9: ["DM1", "DN1"],
  pin10: ["DP2"], pin11: ["SBU1"], pin12: ["CC2"], pin13: ["GND1"], pin14: ["GND2"],
  pin15: ["VBUS1"], pin16: ["VBUS2"],
} as const

export function StandardUsbC(props: ConnectorProps) {
  const imported = TYPE_C_31_M_12({ name: props.name })
  return <connector standard="usb_c" manufacturerPartNumber="TYPE-C-31-M-12"
    supplierPartNumbers={{ jlcpcb: ["C165948"] }} footprint={imported.props.footprint}
    cadModel={imported.props.cadModel} pinLabels={pinLabels} {...props} />
}
