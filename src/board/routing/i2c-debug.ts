import type { RoutingEdge, RoutingPlan } from "./types"

const connection = (
  net: string,
  from: string,
  to: string,
  note: string,
): RoutingEdge => ({
  net,
  from,
  to,
  width: 0.2,
  priority: net.startsWith("I2C_") ? 40 : 60,
  preferredLayers: ["top", "inner2", "bottom"],
  note,
})

export const plan: RoutingPlan = {
  owner: "i2c-debug",
  nets: [
    "I2C_SCL",
    "I2C_SDA",
    "D501_A",
    "D502_A",
    "D503_A",
    "D504_A",
    "D505_A",
    "D506_A",
    "DBG_PD_GATE",
    "DBG_TEC_PERMIT",
    "D507_A",
    "D508_A",
    "DBG_HW_INHIBIT",
    "DBG_MCU_RUN",
  ],
  edges: [
    // Each MCU pin has one escape; the four branches meet at its pullup.
    connection("I2C_SCL", "R_PD_SCL.pin2", "U_MCU.pin12", "MCU leaf; branch at the pullup, never at the fine-pitch MCU pad."),
    connection("I2C_SCL", "R_PD_SCL.pin2", "U_DAC.pin5", "DAC branch from the SCL pullup."),
    connection("I2C_SCL", "R_PD_SCL.pin2", "TP10.pin1", "Short SCL testpoint branch from the pullup."),
    connection("I2C_SCL", "R_PD_SCL.pin2", "U_TEC_MON.pin4", "Long SCL trunk; use inner2 as needed to clear power and switching copper."),
    connection("I2C_SDA", "R_PD_SDA.pin2", "U_MCU.pin11", "MCU leaf; branch at the pullup, never at the fine-pitch MCU pad."),
    connection("I2C_SDA", "R_PD_SDA.pin2", "U_DAC.pin4", "DAC branch from the SDA pullup."),
    connection("I2C_SDA", "R_PD_SDA.pin2", "TP11.pin1", "Short SDA testpoint branch from the pullup."),
    connection("I2C_SDA", "R_PD_SDA.pin2", "U_TEC_MON.pin3", "Long SDA trunk; follow the SCL corridor when clearance permits."),

    // Series resistor-to-anode connections stay in the local LED row.
    connection("D501_A", "R501.pin2", "D501.pin2", "Local LED series link; prefer a short top-layer route."),
    connection("D502_A", "R502.pin2", "D502.pin2", "Local LED series link; prefer a short top-layer route."),
    connection("D503_A", "R503.pin2", "D503.pin2", "Local LED series link; prefer a short top-layer route."),
    connection("D504_A", "R504.pin2", "D504.pin2", "Local LED series link across the 4.75 mm row offset."),
    connection("D505_A", "R505.pin2", "D505.pin2", "Local LED series link; prefer a short top-layer route."),
    connection("D506_A", "R506.pin2", "D506.pin2", "Local LED series link; prefer a short top-layer route."),
    connection("D507_A", "R507.pin2", "D507.pin2", "Local LED series link; prefer a short top-layer route."),
    connection("D508_A", "R508.pin2", "D508.pin2", "Local LED series link; retain the existing 4.25 mm horizontal offset."),

    connection("DBG_PD_GATE", "U_DBG1.pin6", "D506.pin1", "Buffer output to LED cathode along the upper LED row."),
    connection("DBG_PD_GATE", "D506.pin1", "TP14.pin1", "Testpoint branch from the LED-side trunk; inner2 may carry the long vertical run."),
    connection("DBG_TEC_PERMIT", "U_DBG1.pin4", "R507.pin1", "Buffer output to the local LED series resistor."),
    connection("DBG_TEC_PERMIT", "R507.pin1", "TP15.pin1", "Testpoint branch at the series-resistor endpoint; avoid a second buffer-pad escape."),
    connection("DBG_HW_INHIBIT", "U_DBG2.pin6", "D508.pin1", "Buffer output to the LED cathode along the upper row."),
    connection("DBG_HW_INHIBIT", "U_DBG2.pin6", "TP16.pin1", "Buffer-to-testpoint trunk; use inner2 as needed away from switching copper."),
    connection("DBG_MCU_RUN", "U_DBG2.pin4", "TP17.pin1", "Single buffer-to-testpoint connection; prefer inner2 for the long vertical run when top is blocked."),
  ],
  notes: [
    "Owns exactly 14 nets, 37 pads and 23 spanning-tree edges; selectors are copied from ports.json.",
    "All traces are 0.2 mm; I2C priority is 40 and LED/debug priority is 60; layer preference is top, inner2, bottom.",
    "SCL and SDA each use a four-edge pullup-rooted tree, keeping the MCU pad a leaf and the nearby testpoint stub short.",
    "The eight resistor-to-LED anode links stay local on top; do not change LED or resistor placements.",
    "Use the parent clearance-aware solver for pad escapes, layer transitions and final copper geometry; these trees add no component moves or connectivity changes.",
  ],
}
