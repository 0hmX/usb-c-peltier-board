import type { RoutingEdge, RoutingPlan } from "./types"

const localLayers: RoutingEdge["preferredLayers"] = ["top", "inner2", "bottom"]
const remoteLayers: RoutingEdge["preferredLayers"] = ["inner2", "bottom", "top"]

function edge(
  net: string,
  from: string,
  to: string,
  priority: number,
  note: string,
  preferredLayers = localLayers,
): RoutingEdge {
  return { net, from, to, width: 0.2, priority, preferredLayers, note }
}

export const plan: RoutingPlan = {
  owner: "thermal_sensor_routing",
  nets: [
    "HOT_LOW", "HOT_HALF", "HOT_HIGH", "HOT_RAW", "COLD_RAW",
    "HOT_ADC", "COLD_ADC", "VBUS_ADC", "VOUT_ADC", "POWER_BUDGET_HIGH",
  ],
  edges: [
    // Close the threshold dividers locally before reaching comparator inputs.
    edge("HOT_LOW", "R214.pin2", "R215.pin1", 24,
      "Local lower-temperature threshold divider junction."),
    edge("HOT_LOW", "R215.pin1", "U_THERMAL.pin2", 23,
      "Reference input; keep clear of the power stage and thermistor ADC trunks."),
    edge("HOT_HALF", "R212.pin2", "R213.pin1", 24,
      "Local half-temperature divider junction."),
    edge("HOT_HALF", "R212.pin2", "U_THERMAL.pin3", 23,
      "Short divider-to-comparator input branch."),
    edge("HOT_HALF", "U_THERMAL.pin3", "U_THERMAL.pin6", 23,
      "Shared half-temperature signal between both comparator inputs; route around pads."),
    edge("HOT_HIGH", "R216.pin2", "R217.pin1", 24,
      "Local upper-temperature threshold divider junction."),
    edge("HOT_HIGH", "R216.pin2", "U_THERMAL.pin5", 23,
      "Upper-threshold reference; avoid parallel routing beside switching conductors."),

    // Connect each thermistor's pull-up locally, then run its raw signal west.
    edge("HOT_RAW", "J_HOT.pin1", "R208.pin2", 22,
      "Thermistor connector to its local pull-up; preserve paired sensor ground return."),
    edge("HOT_RAW", "R208.pin2", "R212.pin1", 22,
      "Local branch to the hardware temperature protection divider."),
    edge("HOT_RAW", "R208.pin2", "R210.pin1", 18,
      "Raw thermistor trunk to the MCU-side series filter; route away from switch nodes.", remoteLayers),
    edge("COLD_RAW", "J_COLD.pin1", "R209.pin2", 22,
      "Thermistor connector to its local pull-up; preserve paired sensor ground return."),
    edge("COLD_RAW", "R209.pin2", "R211.pin1", 18,
      "Raw thermistor trunk to the MCU-side series filter; route away from switch nodes.", remoteLayers),

    // Use each filter capacitor as the branching point for its MCU ADC input.
    edge("HOT_ADC", "R210.pin2", "C209.pin1", 24,
      "Keep the series-resistor output local to its shunt filter capacitor."),
    edge("HOT_ADC", "C209.pin1", "U_MCU.pin38", 25,
      "Prioritize the capacitor-to-ADC connection, approximately 5.7 mm direct distance."),
    edge("HOT_ADC", "C209.pin1", "TP06.pin1", 10,
      "Long debug branch; preserve the local filter-to-MCU path and avoid switch-node copper.", remoteLayers),
    edge("COLD_ADC", "R211.pin2", "C210.pin1", 24,
      "Keep the series-resistor output local to its shunt filter capacitor."),
    edge("COLD_ADC", "C210.pin1", "U_MCU.pin39", 25,
      "Prioritize the capacitor-to-ADC connection, approximately 8.6 mm direct distance."),
    edge("COLD_ADC", "C210.pin1", "TP07.pin1", 10,
      "Long debug branch; preserve the local filter-to-MCU path and avoid switch-node copper.", remoteLayers),
    edge("VBUS_ADC", "R222.pin2", "R223.pin1", 24,
      "Local VBUS measurement divider junction."),
    edge("VBUS_ADC", "R223.pin1", "C211.pin1", 24,
      "Divider output to the local VBUS ADC filter capacitor."),
    edge("VBUS_ADC", "C211.pin1", "U_MCU.pin41", 25,
      "Prioritize the capacitor-to-ADC connection, approximately 10.5 mm direct distance."),
    edge("VBUS_ADC", "C211.pin1", "TP08.pin1", 10,
      "Long VBUS measurement debug branch; keep separated from VBUS power copper.", remoteLayers),
    edge("VOUT_ADC", "R224.pin2", "R225.pin1", 24,
      "Local output-voltage measurement divider junction."),
    edge("VOUT_ADC", "R225.pin1", "C212.pin1", 24,
      "Divider output to the local output-voltage ADC filter capacitor."),
    edge("VOUT_ADC", "C212.pin1", "U_MCU.pin40", 25,
      "Prioritize the capacitor-to-ADC connection, approximately 12.1 mm direct distance."),
    edge("VOUT_ADC", "C212.pin1", "TP09.pin1", 10,
      "Long output-voltage measurement debug branch; avoid coupling to TEC power copper.", remoteLayers),
  ],
  notes: [
    "Exact inventory selectors cover 36 pads using 26 edges across nine connected nets and one singleton.",
    "POWER_BUDGET_HIGH contains only R227.pin1 in the inventory, so it intentionally has no routing edge.",
    "All traces are 0.2 mm wide. Local divider and ADC branches prefer top; long raw and testpoint branches prefer inner2 then bottom.",
    "Ground is owned separately. J_HOT.pin2/J_COLD.pin2, lower divider returns, and C209-C212 ground pads need local low-impedance returns to the shared reference plane.",
    "Remote testpoints lie at x=20 to 42.75 mm, y=0.5 to 2 mm; ADC circuitry is at x=-23.58 to -13.25 mm, y=-14 to -27.7 mm. Their long branches must not displace local capacitor-to-MCU connections.",
    "No hard maximum lengths are imposed: the inventory provides geometry but no timing, settling-time, or manufacturer limits. The common clearance-aware solver determines legal escapes and vias.",
  ],
}
