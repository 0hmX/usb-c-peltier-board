import type { RoutingEdge, RoutingPlan } from "./types"

// Passive-rooted trees keep fine IC pads as leaves. Routes branch in copper
// outside the package, rather than running another load through a logic pin.
// Concrete pad escapes and routing-only placements are recorded in
// interlock-completion.json. The parent router rechecks shared-board copper.
const signal = (net: string, from: string, to: string, priority: number): RoutingEdge => ({
  net, from, to, width: 0.2, priority,
  preferredLayers: ["top", "inner2", "bottom"],
  note: "Reserve an outward pad-axis escape before turns or off-pad vias; keep inner1 for GND.",
})

export const plan: RoutingPlan = {
  owner: "interlock",
  nets: [
    "MCU_RUN",
    "MCU_ARM",
    "ARM_CLK",
    "TEC_CLEAR_N",
    "RUN_CLK",
    "INPUT_ARMED",
    "INPUT_CLEAR_N",
    "PD_LATCH_INHIBIT",
    "FAULT_SOURCE",
    "FAULT_PNP_BASE",
    "TEC_CLEAR_RAW",
    "FAULT_NPN_BASE",
    "INPUT_CLEAR_RAW",
    "INPUT_FAULT_NPN_BASE",
    "INPUT_FAULT_N",
    "AUX_LOSS_RAW",
    "AUX_LOSS_CLK",
    "AUX_VALID",
    "INPUT_LOSS_LATCHED",
    "TEC_PERMISSION_SUPPLY",
    "TEC_PERMISSION_PNP_BASE",
    "TEC_PERMISSION_PNP_DRIVE",
    "TEC_PERMISSION_NPN_BASE",
    "TEC_SAFE_EN",
    "TEC_REQUEST",
  ],
  edges: [
    // MCU_RUN: 5 physical endpoints, 4 tree edges.
    signal("MCU_RUN", "R226.pin1", "R_INPUT_RUN.pin1", 6),
    signal("MCU_RUN", "R226.pin1", "U_CLOCK_BUFFER.pin3", 6),
    signal("MCU_RUN", "R226.pin1", "U_MCU.pin16", 6),
    signal("MCU_RUN", "R226.pin1", "U_DBG2.pin3", 6),
    // MCU_ARM: 3 physical endpoints, 2 tree edges.
    signal("MCU_ARM", "R204.pin1", "U_CLOCK_BUFFER.pin1", 5),
    signal("MCU_ARM", "R204.pin1", "U_MCU.pin17", 5),
    // ARM_CLK: 3 physical endpoints, 2 tree edges.
    signal("ARM_CLK", "R242.pin1", "U_LATCH.pin1", 10),
    signal("ARM_CLK", "R242.pin1", "U_CLOCK_BUFFER.pin6", 10),
    // TEC_CLEAR_N: 3 physical endpoints, 2 tree edges.
    signal("TEC_CLEAR_N", "R240.pin1", "U_LATCH.pin6", 10),
    signal("TEC_CLEAR_N", "R240.pin1", "U_CLEAR_BUFFER.pin6", 10),
    // RUN_CLK: 4 physical endpoints, 3 tree edges.
    signal("RUN_CLK", "R243.pin1", "U_INPUT_LATCH.pin1", 10),
    signal("RUN_CLK", "R243.pin1", "U_CLOCK_BUFFER.pin4", 10),
    signal("RUN_CLK", "R243.pin1", "U_AUX_LOSS_LATCH.pin6", 10),
    // INPUT_ARMED: 3 physical endpoints, 2 tree edges.
    signal("INPUT_ARMED", "R236.pin1", "U_INPUT_LATCH.pin5", 20),
    signal("INPUT_ARMED", "R236.pin1", "D_INPUT_PERMISSION.pin1", 20),
    // INPUT_CLEAR_N: 4 physical endpoints, 3 tree edges.
    signal("INPUT_CLEAR_N", "R241.pin1", "U_INPUT_LATCH.pin6", 10),
    signal("INPUT_CLEAR_N", "R241.pin1", "U_CLEAR_BUFFER.pin4", 10),
    signal("INPUT_CLEAR_N", "R241.pin1", "U_DBG2.pin1", 10),
    // PD_LATCH_INHIBIT: 3 physical endpoints, 2 tree edges.
    signal("PD_LATCH_INHIBIT", "R206.pin2", "Q_PD_LATCH.pin1", 20),
    signal("PD_LATCH_INHIBIT", "R206.pin2", "R207.pin1", 20),
    // FAULT_SOURCE: 3 physical endpoints, 2 tree edges.
    signal("FAULT_SOURCE", "R234.pin1", "Q_FAULT_SOURCE.pin3", 25),
    signal("FAULT_SOURCE", "R234.pin1", "R238.pin1", 25),
    // FAULT_PNP_BASE: 3 physical endpoints, 2 tree edges.
    signal("FAULT_PNP_BASE", "R233.pin2", "Q_FAULT_SOURCE.pin1", 12),
    signal("FAULT_PNP_BASE", "R233.pin2", "R232.pin2", 12),
    // TEC_CLEAR_RAW: 4 physical endpoints, 3 tree edges.
    signal("TEC_CLEAR_RAW", "R202.pin2", "Q_FAULT_CLEAR.pin3", 15),
    signal("TEC_CLEAR_RAW", "R202.pin2", "R203.pin1", 15),
    signal("TEC_CLEAR_RAW", "R202.pin2", "U_CLEAR_BUFFER.pin1", 15),
    // FAULT_NPN_BASE: 3 physical endpoints, 2 tree edges.
    signal("FAULT_NPN_BASE", "R235.pin1", "Q_FAULT_CLEAR.pin1", 12),
    signal("FAULT_NPN_BASE", "R235.pin1", "R234.pin2", 12),
    // INPUT_CLEAR_RAW: 3 physical endpoints, 2 tree edges.
    signal("INPUT_CLEAR_RAW", "R237.pin2", "Q_INPUT_CLEAR.pin3", 8),
    signal("INPUT_CLEAR_RAW", "R237.pin2", "U_CLEAR_BUFFER.pin3", 8),
    // INPUT_FAULT_NPN_BASE: 3 physical endpoints, 2 tree edges.
    signal("INPUT_FAULT_NPN_BASE", "R239.pin1", "Q_INPUT_CLEAR.pin1", 12),
    signal("INPUT_FAULT_NPN_BASE", "R239.pin1", "R238.pin2", 12),
    // INPUT_FAULT_N: 13 physical endpoints, 12 tree edges.
    signal("INPUT_FAULT_N", "R_INPUT_FAULT.pin2", "U_INPUT.pin4", 9),
    signal("INPUT_FAULT_N", "R_INPUT_FAULT.pin2", "Q_PG_INHIBIT.pin3", 9),
    signal("INPUT_FAULT_N", "R_INPUT_FAULT.pin2", "U_PD_WINDOW.pin7", 9),
    signal("INPUT_FAULT_N", "R_INPUT_FAULT.pin2", "Q_PD_LATCH.pin3", 9),
    signal("INPUT_FAULT_N", "R_INPUT_FAULT.pin2", "Q_USB_SERVICE.pin3", 9),
    signal("INPUT_FAULT_N", "R_INPUT_FAULT.pin2", "U_MCU.pin28", 9),
    signal("INPUT_FAULT_N", "R_INPUT_FAULT.pin2", "R232.pin1", 9),
    signal("INPUT_FAULT_N", "R232.pin1", "U_SUPERVISOR.pin2", 9),
    signal("INPUT_FAULT_N", "R232.pin1", "D_RESET_SAFE.pin2", 9),
    signal("INPUT_FAULT_N", "R232.pin1", "U_THERMAL.pin1", 9),
    signal("INPUT_FAULT_N", "R232.pin1", "U_THERMAL.pin7", 9),
    signal("INPUT_FAULT_N", "R232.pin1", "Q_AUX_FAULT.pin3", 9),
    // AUX_LOSS_RAW: 3 physical endpoints, 2 tree edges.
    signal("AUX_LOSS_RAW", "R_AUX_LOSS_PU.pin2", "U_AUX_BUFFER.pin3", 15),
    signal("AUX_LOSS_RAW", "R_AUX_LOSS_PU.pin2", "Q_AUX_INVERT.pin3", 15),
    // AUX_LOSS_CLK: 2 physical endpoints, 1 tree edges.
    signal("AUX_LOSS_CLK", "U_AUX_BUFFER.pin4", "U_AUX_LOSS_LATCH.pin1", 10),
    // AUX_VALID: 2 physical endpoints, 1 tree edges.
    signal("AUX_VALID", "U_AUX_BUFFER.pin6", "Q_AUX_INVERT.pin1", 15),
    // INPUT_LOSS_LATCHED: 2 physical endpoints, 1 tree edges.
    signal("INPUT_LOSS_LATCHED", "U_AUX_LOSS_LATCH.pin5", "Q_AUX_FAULT.pin1", 10),
    // TEC_PERMISSION_SUPPLY: 2 physical endpoints, 1 tree edges.
    signal("TEC_PERMISSION_SUPPLY", "Q22.pin3", "R39.pin1", 25),
    // TEC_PERMISSION_PNP_BASE: 3 physical endpoints, 2 tree edges.
    signal("TEC_PERMISSION_PNP_BASE", "R35.pin2", "Q22.pin1", 12),
    signal("TEC_PERMISSION_PNP_BASE", "R35.pin2", "R36.pin1", 12),
    // TEC_PERMISSION_PNP_DRIVE: 2 physical endpoints, 1 tree edges.
    signal("TEC_PERMISSION_PNP_DRIVE", "R36.pin2", "Q23.pin3", 25),
    // TEC_PERMISSION_NPN_BASE: 3 physical endpoints, 2 tree edges.
    signal("TEC_PERMISSION_NPN_BASE", "R38.pin1", "Q23.pin1", 12),
    signal("TEC_PERMISSION_NPN_BASE", "R38.pin1", "R37.pin2", 12),
    // TEC_SAFE_EN: 4 physical endpoints, 3 tree edges.
    signal("TEC_SAFE_EN", "R37.pin1", "U_DBG1.pin3", 10),
    signal("TEC_SAFE_EN", "R37.pin1", "R205.pin1", 10),
    signal("TEC_SAFE_EN", "R205.pin1", "U_LATCH.pin5", 10),
    // TEC_REQUEST: 3 physical endpoints, 2 tree edges.
    signal("TEC_REQUEST", "R202.pin1", "R201.pin1", 7),
    signal("TEC_REQUEST", "R202.pin1", "U_MCU.pin15", 7),
  ],
  notes: [
    "25 complete interlock trees preserve every physical pad and every source net; 61 edges use 0.2 mm copper.",
    "IC pads are leaves except two-endpoint nets; branch points use same-net resistor or diode pads and shared external copper.",
    "Schmitt pin1/3 escape south and pin4/6 north. Latch pin1 escapes east and pin5/6 west. MCU pin15/17 escape south; pin16 uses the coordinated inner barrel north of its pad. Honor component rotation and actual pad geometry.",
    "Reserve clock/clear/fault fanouts before unrelated cross-board distribution. The parent must honor every bypass geometry and ground return before completing rail trunks.",
    "interlock-completion.json provides routing-only placements, local bypass lengths, physical paths and escapes. These are inputs to shared clearance/connectivity validation, not fabrication acceptance.",
  ],
}
