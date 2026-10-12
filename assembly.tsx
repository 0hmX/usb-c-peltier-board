import { assembly } from "@tscircuit/core"
import { DualUsbPeltierBoard } from "./src/revision/board"
import { MechanicalAssembly } from "./src/revision/mechanical-assembly"

export default function PeltierAssembly() {
  return <assembly.device name="DUAL_USB_PELTIER_CONCEPT">
    <DualUsbPeltierBoard />
    <MechanicalAssembly />
  </assembly.device>
}
