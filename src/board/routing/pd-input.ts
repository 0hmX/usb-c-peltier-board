import ports from "./ports.json"
import type { RoutingEdge, RoutingLayer, RoutingPlan } from "./types"

const top: RoutingLayer[] = ["top", "bottom", "inner2"]
const bottom: RoutingLayer[] = ["bottom", "top", "inner2"]
const control: RoutingLayer[] = ["inner2", "bottom", "top"]
const portBySelector = new Map(ports.map(port => [port.selector, port]))

function edge(
  net: string,
  from: string,
  to: string,
  width = 0.2,
  priority = 25,
  preferredLayers = top,
  note?: string,
): RoutingEdge {
  const start = portBySelector.get(from)
  const finish = portBySelector.get(to)
  if (!start || !finish || start.net !== net || finish.net !== net) {
    throw new Error(`PD/input route does not match connected pad geometry: ${net}: ${from} -> ${to}`)
  }
  return { net, from, to, width, priority, preferredLayers, ...(note ? { note } : {}) }
}

/** Connected-pad trees for the USB PD controller and input protection. */
export const plan: RoutingPlan = {
  owner: "pd-input",
  nets: [
    "USB_CC1", "USB_CC2", "PD_VDD", "PD_CFG2", "PD_CFG3", "PD_DATA_SHORT",
    "PD_VBUS_SENSE", "PD_CFG1", "PD_PG_N", "PD_CFG1_LOW", "PD_CFG2_LOW",
    "PD_CFG3_LOW", "PD_WINDOW_SENSE", "PD_UV_REF", "PD_OV_REF", "PD_PG_BASE",
    "PD_VALID_N", "USB_PROG_5V", "INPUT_ENABLE", "INPUT_OVLO", "INPUT_DVDT",
    "INPUT_CURRENT_MON", "INPUT_AUXOFF",
  ],
  edges: [
    edge("USB_CC1", "J_USB_PD.pin6", "U_PD.pin7", 0.2, 5, top,
      "Escape the 0.30 mm USB CC pad toward the board interior before turning."),
    edge("USB_CC2", "J_USB_PD.pin12", "U_PD.pin6", 0.2, 5, bottom,
      "Use a separate layer when crossing the CC1 corridor."),
    edge("PD_DATA_SHORT", "U_PD.pin4", "U_PD.pin5", 0.2, 5, top,
      "Adjacent controller pads; join locally without a remote branch."),
    edge("PD_VBUS_SENSE", "R_CH_VBUS.pin2", "U_PD.pin8", 0.2, 5, bottom),

    // Feed the controller through its nearby decoupling pad, then branch to pullups.
    edge("PD_VDD", "U_PD.pin1", "C_CH_VDD.pin1", 0.4, 5, top),
    edge("PD_VDD", "C_CH_VDD.pin1", "R_CH_VDD.pin2", 0.4, 5, top),
    edge("PD_VDD", "C_CH_VDD.pin1", "R_PG_PU.pin1", 0.4, 25, top),
    edge("PD_VDD", "R_CH_VDD.pin2", "R_PD_CFG1.pin1", 0.4, 25, top),
    edge("PD_VDD", "R_PD_CFG1.pin1", "R_PD_CFG2.pin1", 0.4, 25, top),
    edge("PD_VDD", "R_PD_CFG2.pin1", "R_PD_CFG3.pin1", 0.4, 25, top),

    edge("PD_CFG1", "U_PD.pin9", "R_PD_CFG1.pin2"),
    edge("PD_CFG1", "R_PD_CFG1.pin2", "Q_PD_CFG1.pin3"),
    edge("PD_CFG2", "U_PD.pin2", "Q_PD_CFG2.pin3"),
    edge("PD_CFG2", "Q_PD_CFG2.pin3", "R_PD_CFG2.pin2", 0.2, 25, bottom),
    edge("PD_CFG3", "U_PD.pin3", "R_PD_CFG3.pin2", 0.2, 25, bottom),
    edge("PD_CFG3", "R_PD_CFG3.pin2", "Q_PD_CFG3.pin3"),
    edge("PD_CFG1_LOW", "Q_PD_CFG1.pin1", "U_MCU.pin6", 0.2, 25, control),
    edge("PD_CFG2_LOW", "Q_PD_CFG2.pin1", "U_MCU.pin7", 0.2, 25, control),
    edge("PD_CFG3_LOW", "Q_PD_CFG3.pin1", "U_MCU.pin8", 0.2, 25, control),
    edge("PD_PG_N", "U_PD.pin10", "R_PG_PU.pin2", 0.2, 25, bottom),
    edge("PD_PG_N", "R_PG_PU.pin2", "R_PG_BASE.pin1", 0.2, 25, bottom),

    // Join each divider midpoint locally before its comparator input branch.
    edge("PD_WINDOW_SENSE", "R_WINDOW_TOP.pin2", "R_WINDOW_BOTTOM.pin1", 0.2, 5, top),
    edge("PD_WINDOW_SENSE", "R_WINDOW_TOP.pin2", "U_PD_WINDOW.pin6", 0.2, 5, top),
    edge("PD_WINDOW_SENSE", "U_PD_WINDOW.pin6", "U_PD_WINDOW.pin2", 0.2, 5, bottom,
      "Both comparator channels share this sense signal; avoid the adjacent reference pads."),
    edge("PD_UV_REF", "R_UV_TOP.pin2", "R_UV_BOTTOM.pin1", 0.2, 5, top),
    edge("PD_UV_REF", "R_UV_BOTTOM.pin1", "U_PD_WINDOW.pin3", 0.2, 5, top),
    edge("PD_OV_REF", "R_OV_TOP.pin2", "R_OV_BOTTOM.pin1", 0.2, 5, top),
    edge("PD_OV_REF", "R_OV_TOP.pin2", "U_PD_WINDOW.pin5", 0.2, 5, bottom,
      "Existing placement separates the OV reference from its comparator input by 12.3 mm."),
    edge("PD_PG_BASE", "R_PG_BASE.pin2", "Q_PG_INHIBIT.pin1"),
    edge("PD_PG_BASE", "Q_PG_INHIBIT.pin1", "R_PG_OFF.pin1"),
    edge("PD_VALID_N", "U_PD_WINDOW.pin1", "R_PD_VALID_PU.pin2", 0.2, 5, top),
    edge("PD_VALID_N", "R_PD_VALID_PU.pin2", "R206.pin1", 0.2, 25, control),
    edge("PD_VALID_N", "R206.pin1", "U_MCU.pin27", 0.2, 25, control),
    edge("PD_VALID_N", "R206.pin1", "U_DBG1.pin1", 0.2, 25, control,
      "Debug-buffer branch spans about 62 mm; share the R206 tree junction instead of extending the analog input routes."),

    // USB supply trunk uses both physical VBUS pads and taps the local loads.
    edge("USB_PROG_5V", "J_USB_PROG.pin15", "J_USB_PROG.pin16", 0.4, 25, bottom,
      "Escape each VBUS pad toward the interior and cross the USB data/CC row on another layer."),
    edge("USB_PROG_5V", "J_USB_PROG.pin15", "C_USB_PROG.pin1", 0.4, 25, top),
    edge("USB_PROG_5V", "J_USB_PROG.pin15", "U_USB_ESD.pin5", 0.4, 25, top),
    edge("USB_PROG_5V", "U_USB_ESD.pin5", "R_USB_DETECT_TOP.pin1", 0.4, 25, top),
    edge("USB_PROG_5V", "J_USB_PROG.pin16", "R_USB_PRESENT.pin1", 0.4, 25, top),
    edge("USB_PROG_5V", "R_USB_PRESENT.pin1", "R_USB_BLEED.pin1", 0.4, 25, top),
    edge("USB_PROG_5V", "R_USB_BLEED.pin1", "D_LOGIC_USB.pin2", 0.4, 25, top),

    edge("INPUT_ENABLE", "U_INPUT.pin1", "R_INPUT_RUN.pin2", 0.2, 5, top),
    edge("INPUT_ENABLE", "R_INPUT_RUN.pin2", "R_INPUT_OFF.pin1", 0.2, 5, top),
    edge("INPUT_ENABLE", "R_INPUT_OFF.pin1", "D_INPUT_PERMISSION.pin3", 0.2, 25, control),
    edge("INPUT_OVLO", "R_INPUT_OV_TOP.pin2", "R_INPUT_OV_BOTTOM.pin1", 0.2, 5, top),
    edge("INPUT_OVLO", "R_INPUT_OV_TOP.pin2", "U_INPUT.pin2", 0.2, 5, top,
      "The 0.25 mm eFuse pad requires a horizontal escape before changing direction."),
    edge("INPUT_DVDT", "U_INPUT.pin7", "C_INPUT_DVDT.pin1", 0.2, 5, top),
    edge("INPUT_CURRENT_MON", "U_INPUT.pin9", "R_INPUT_ILIM.pin1", 0.2, 5, top,
      "Keep this current-limit resistor connection local to the eFuse."),
    edge("INPUT_AUXOFF", "U_INPUT.pin3", "R_INPUT_PG.pin2", 0.2, 5, top),
    edge("INPUT_AUXOFF", "R_INPUT_PG.pin2", "U_AUX_BUFFER.pin1", 0.2, 5, top),
    edge("INPUT_AUXOFF", "R_INPUT_PG.pin2", "U_MCU.pin29", 0.2, 25, control),
  ],
  notes: [
    "23 nets, 74 connected pad selectors, 51 tree edges; every endpoint is checked against ports.json.",
    "Control traces are 0.20 mm; PD_VDD and USB_PROG_5V traces are 0.40 mm, within the corresponding pad widths.",
    "U_INPUT signal pads are 0.25 mm tall on 0.45 mm pitch; escape outward before turns or vias. MCU control pads are nominally 0.20 mm.",
    "Priority 5 reserves local PD sensing, decoupling, reference, and eFuse control routes. Configuration, status distribution, and USB supply taps use priority 25.",
    "All terminals are on top. Preferred inner/bottom layers require clearance-checked top-pad escapes and vias in the route realization.",
    "Inherited placement requires long MCU configuration/status runs and an approximately 62 mm PD_VALID_N debug branch; no connectivity or placement is changed.",
  ],
}
