import { FaultLatch, SchmittBuffer, PartC23162, PartC14663 } from "../parts"
import { DTC114EETL } from "./parts/DTC114EETL"

const safe = { schSheetName: "SAFE", schSectionName: "SAFE_INPUT_LOSS" }

/**
 * TPS259470A FLT does not assert on OVLO, but AUXOFF falls when its input
 * becomes invalid. Capture that falling edge independently of the MCU and
 * keep INPUT_FAULT_N low until MCU_RUN (and therefore RUN_CLK) goes low.
 *
 * AUXOFF starts low during inrush. Releasing clear with a static high clock
 * does not clock the flip-flop, so normal startup is not locked out. Both
 * edges are Schmitt-buffered; the existing AUXOFF pullup only drives inputs.
 * See docs/revision-b-interlock.md for the startup/recovery sequence.
 */
export function InputLossInterlock() {
  return <>
    <netlabel net="GND" connectsTo=".U_AUX_BUFFER > .pin2" inline anchorSide="top" />
    <netlabel net="GND" connectsTo=".U_AUX_LOSS_LATCH > .pin4" inline anchorSide="top" />
    <SchmittBuffer name="U_AUX_BUFFER" pcbX={-10} pcbY={20} schX={0} schY={23} {...safe}
      connections={{ pin1: "net.INPUT_AUXOFF", pin3: "net.AUX_LOSS_RAW",
        pin4: "net.AUX_LOSS_CLK", pin5: "net.V3V3", pin6: "net.AUX_VALID" }} />
    <DTC114EETL name="Q_AUX_INVERT" pcbX={-4} pcbY={20} pcbRotation={180} schX={10} schY={23} {...safe}
      connections={{ pin1: "net.AUX_VALID", pin2: "net.GND", pin3: "net.AUX_LOSS_RAW" }} />
    <PartC23162 name="R_AUX_LOSS_PU" pcbX={-4} pcbY={23} schX={10} schY={29} schRotation={270} {...safe}
      connections={{ pin1: "net.V3V3", pin2: "net.AUX_LOSS_RAW" }} />
    <FaultLatch name="U_AUX_LOSS_LATCH" pcbX={3} pcbY={20} schX={22} schY={23} {...safe}
      noConnect={["N_Q"]}
      connections={{ pin1: "net.AUX_LOSS_CLK", pin2: "net.V3V3",
        pin5: "net.INPUT_LOSS_LATCHED", pin6: "net.RUN_CLK", pin7: "net.V3V3", pin8: "net.V3V3" }} />
    <DTC114EETL name="Q_AUX_FAULT" pcbX={8} pcbY={16} schX={34} schY={23} {...safe}
      connections={{ pin1: "net.INPUT_LOSS_LATCHED", pin2: "net.GND", pin3: "net.INPUT_FAULT_N" }} />
    <PartC14663 name="C_AUX1" pcbX={-10} pcbY={23} schX={0} schY={29} schRotation={270} {...safe}
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
    <PartC14663 name="C_AUX2" pcbX={3} pcbY={23} schX={22} schY={29} schRotation={270} {...safe}
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }} />
  </>
}
