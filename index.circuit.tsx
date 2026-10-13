import { assembly } from "tscircuit"
import { DualUsbPeltierBoard } from "./src/board/board"
import { MechanicalAssembly } from "./src/board/mechanical-assembly"

export default function PeltierAssembly() {
  return <assembly.device name="DUAL_USB_PELTIER_CONCEPT">
    <DualUsbPeltierBoard />
    <MechanicalAssembly />
  </assembly.device>
}
