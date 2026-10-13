import type { RoutingEdge, RoutingPlan } from "./types"

const connection = (
  net: string,
  from: string,
  to: string,
  note: string,
  maxLength: number,
): RoutingEdge => ({
  net,
  from,
  to,
  width: 0.2,
  priority: net.startsWith("I2C_") ? 40 : 60,
  preferredLayers: to.startsWith("U_MCU.") || to.startsWith("U_TEC_MON.")
    ? ["inner2", "bottom", "top"]
    : ["top", "inner2", "bottom"],
  maxLength,
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
    // The large testpoint pad hosts the trunk; every IC and pullup is a leaf.
    connection("I2C_SCL", "TP10.pin1", "R_PD_SCL.pin2", "Local pullup leaf; the tiny pullup pad carries no transit trunk.", 6),
    connection("I2C_SCL", "TP10.pin1", "U_MCU.pin12", "Keep the locked westward MCU escape. Allow the documented low-speed bus detour and ordinary through-via transitions around the continuous USB bottom reference and critical power copper; the completed path is 43.914 mm.", 52),
    connection("I2C_SCL", "TP10.pin1", "U_DAC.pin5", "DAC leaf reached from the testpoint trunk; escape DAC pin5 north before a layer change.", 42),
    connection("I2C_SCL", "TP10.pin1", "U_TEC_MON.pin4", "Long trunk on inner2/bottom; approach monitor pin4 from the north or side without entering its analog input row.", 110),
    connection("I2C_SDA", "TP11.pin1", "R_PD_SDA.pin2", "Local pullup leaf; the tiny pullup pad carries no transit trunk.", 10),
    connection("I2C_SDA", "TP11.pin1", "U_MCU.pin11", "Single approved under-QFN ring barrel at (-29.275,-22.3); reserve with the MCU fanout owner. MCU remains a leaf.", 48),
    connection("I2C_SDA", "TP11.pin1", "U_DAC.pin4", "DAC leaf reached from the testpoint trunk; escape pin4 north. Allow the documented digital-bus detour around the fixed MCU core and interlock copper.", 60),
    connection("I2C_SDA", "TP11.pin1", "U_TEC_MON.pin3", "Long trunk on inner2/bottom; use a separate monitor escape barrel beside SCL, with .2 mm copper gap.", 105),

    // Series resistor-to-anode connections stay in the local LED row.
    connection("D501_A", "R501.pin2", "D501.pin2", "Local LED series link; prefer a short top-layer route.", 4),
    connection("D502_A", "R502.pin2", "D502.pin2", "Local LED series link; prefer a short top-layer route.", 3),
    connection("D503_A", "R503.pin2", "D503.pin2", "Local LED series link; prefer a short top-layer route.", 4),
    connection("D504_A", "R504.pin2", "D504.pin2", "Local LED series link across the 4.75 mm row offset; permit a small bottom bridge if top is blocked.", 11),
    connection("D505_A", "R505.pin2", "D505.pin2", "Local LED series link; prefer a short top-layer route.", 4),
    connection("D506_A", "R506.pin2", "D506.pin2", "Local LED series link; prefer a short top-layer route.", 4),
    connection("D507_A", "R507.pin2", "D507.pin2", "Local LED series link; share no buffer or supply pad as a routing root.", 10),
    connection("D508_A", "R508.pin2", "D508.pin2", "Local LED series link; retain the existing 4.25 mm horizontal offset.", 7),

    connection("DBG_PD_GATE", "TP14.pin1", "U_DBG1.pin6", "Buffer has one output escape; join the LED branch at the common trunk barrel, not at the buffer pad.", 72),
    connection("DBG_PD_GATE", "TP14.pin1", "D506.pin1", "LED cathode is a leaf of the testpoint-rooted debug trunk.", 62),
    connection("DBG_TEC_PERMIT", "TP15.pin1", "U_DBG1.pin4", "One eastward buffer escape; reserve north space for the adjacent local supply capacitor.", 70),
    connection("DBG_TEC_PERMIT", "TP15.pin1", "R507.pin1", "LED resistor is a leaf; branch at common copper outside either small pad.", 68),
    connection("DBG_HW_INHIBIT", "TP16.pin1", "U_DBG2.pin6", "One westward buffer escape; join the LED branch on the remote trunk.", 72),
    connection("DBG_HW_INHIBIT", "TP16.pin1", "D508.pin1", "LED cathode leaf; keep the long trunk out of the monitor input and decoupler pad rows.", 68),
    connection("DBG_MCU_RUN", "TP17.pin1", "U_DBG2.pin4", "One eastward buffer escape and a quiet inner2/bottom testpoint trunk.", 72),
  ],
  notes: [
    "Owns exactly 14 nets, 37 pads and 23 spanning-tree edges; selectors are copied from ports.json.",
    "All traces are 0.2 mm; I2C priority is 40 and LED/debug priority is 60. MCU escapes and long monitor trunks prefer inner2, bottom, top; local links prefer top.",
    "SCL and SDA each use a four-edge testpoint-rooted tree. MCU, DAC, monitor and small pullup pads are leaves; remote branches meet on trunk copper.",
    "The eight resistor-to-LED anode links stay local on top; do not change LED or resistor placements.",
    "Concrete completion copper, escape reservations, lengths and optional debug-capacitor placement suggestions are in i2c-debug-completion.json; use that artifact to constrain the parent realization.",
    "Ordinary through vias require .7 mm copper and .3 mm drill; inner1 remains a GND plane. Every signal uses >=.2 mm width and >=.2 mm foreign copper clearance.",
    "Debug capacitors use native courtyard-aware centers (32,39.55)/(41,39.55), rotation90. Native straight-line pad-tail clipping gives .60 mm exposed supply bypass at .4 mm width; center distance is 1.55 mm.",
    "The packet also supplies the C43 monitor-bypass supplement: center (37.8,26.3), rotation180, .895 mm exposed V3V3 bypass, short GND return and dedicated positive-plane barrel. This leaves all 23 I2C/debug edges and Kelvin paths unchanged.",
  ],
}
