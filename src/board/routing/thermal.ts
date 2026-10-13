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
  maxLength?: number,
): RoutingEdge {
  return { net, from, to, width: 0.2, priority, preferredLayers, note, maxLength }
}

export const plan: RoutingPlan = {
  owner: "thermal_sensor_routing",
  nets: [
    "HOT_LOW", "HOT_HALF", "HOT_HIGH", "HOT_RAW", "COLD_RAW",
    "HOT_ADC", "COLD_ADC", "VBUS_ADC", "VOUT_ADC", "POWER_BUDGET_HIGH",
  ],
  edges: [
    // Close the threshold dividers locally before reaching comparator inputs.
    edge("HOT_LOW", "R214.pin2", "R215.pin1", 12,
      "Local lower-temperature threshold divider junction."),
    edge("HOT_LOW", "R215.pin1", "U_THERMAL.pin2", 13,
      "Reference input; keep clear of the power stage and thermistor ADC trunks."),
    edge("HOT_HALF", "R212.pin2", "R213.pin1", 12,
      "Local half-temperature divider junction."),
    edge("HOT_HALF", "R212.pin2", "U_THERMAL.pin3", 13,
      "Short divider-to-comparator input branch."),
    edge("HOT_HALF", "U_THERMAL.pin3", "U_THERMAL.pin6", 13,
      "Shared half-temperature signal between both comparator inputs; route around pads."),
    edge("HOT_HIGH", "R216.pin2", "R217.pin1", 12,
      "Local upper-temperature threshold divider junction."),
    edge("HOT_HIGH", "R216.pin2", "U_THERMAL.pin5", 13,
      "Upper-threshold reference; avoid parallel routing beside switching conductors."),

    // Connect each thermistor's pull-up locally, then run its raw signal west.
    edge("HOT_RAW", "J_HOT.pin1", "R208.pin2", 14,
      "Thermistor connector to its local pull-up; preserve paired sensor ground return."),
    edge("HOT_RAW", "R208.pin2", "R212.pin1", 14,
      "Local branch to the hardware temperature protection divider."),
    edge("HOT_RAW", "R208.pin2", "R210.pin1", 45,
      "Raw thermistor trunk to the MCU-side series filter; route away from switch nodes.", remoteLayers),
    edge("COLD_RAW", "J_COLD.pin1", "R209.pin2", 14,
      "Thermistor connector to its local pull-up; preserve paired sensor ground return."),
    edge("COLD_RAW", "R209.pin2", "R211.pin1", 45,
      "Raw thermistor trunk to the MCU-side series filter; route away from switch nodes.", remoteLayers),

    // Use each filter capacitor as the branching point for its MCU ADC input.
    edge("HOT_ADC", "R210.pin2", "C209.pin1", 8,
      "Local 1 kΩ/100 nF input filter: realize before the remote testpoint trunk.", localLayers, 3),
    edge("HOT_ADC", "C209.pin1", "U_MCU.pin38", 9,
      "Terminate at the pin38 fanout; preserve the local reservoir capacitor-to-ADC branch.", remoteLayers, 12),
    edge("HOT_ADC", "C209.pin1", "TP06.pin1", 60,
      "Long debug branch; preserve the local filter-to-MCU path and avoid switch-node copper.", remoteLayers),
    edge("COLD_ADC", "R211.pin2", "C210.pin1", 8,
      "Local 1 kΩ/100 nF input filter: realize before the remote testpoint trunk.", localLayers, 3),
    edge("COLD_ADC", "C210.pin1", "U_MCU.pin39", 9,
      "Terminate at the pin39 fanout; preserve the local reservoir capacitor-to-ADC branch.", remoteLayers, 12),
    edge("COLD_ADC", "C210.pin1", "TP07.pin1", 60,
      "Long debug branch; preserve the local filter-to-MCU path and avoid switch-node copper.", remoteLayers),
    edge("VBUS_ADC", "R222.pin2", "R223.pin1", 10,
      "Local VBUS measurement divider junction."),
    edge("VBUS_ADC", "R222.pin2", "C211.pin1", 8,
      "Join the measurement divider to its capacitor at the upper-resistor output.", localLayers, 3),
    edge("VBUS_ADC", "C211.pin1", "U_MCU.pin41", 9,
      "Terminate at the pin41 fanout; keep the capacitor-to-ADC branch ahead of testpoint routing.", remoteLayers, 18),
    edge("VBUS_ADC", "C211.pin1", "TP08.pin1", 60,
      "Long VBUS measurement debug branch; keep separated from VBUS power copper.", remoteLayers),
    edge("VOUT_ADC", "R224.pin2", "R225.pin1", 10,
      "Local output-voltage measurement divider junction."),
    edge("VOUT_ADC", "R224.pin2", "C212.pin1", 8,
      "Join the measurement divider to its capacitor at the upper-resistor output.", localLayers, 3),
    edge("VOUT_ADC", "C212.pin1", "U_MCU.pin40", 9,
      "Terminate at the pin40 fanout; keep the capacitor-to-ADC branch ahead of testpoint routing.", remoteLayers, 15),
    edge("VOUT_ADC", "C212.pin1", "TP09.pin1", 60,
      "Long output-voltage measurement debug branch; avoid coupling to TEC power copper.", remoteLayers),
  ],
  notes: [
    "Exact inventory selectors cover 36 pads using 26 edges across nine connected nets and one singleton.",
    "POWER_BUDGET_HIGH contains only R227.pin1 in the inventory, so it intentionally has no routing edge.",
    "All traces are 0.2 mm wide. Local divider and ADC branches prefer top; long raw and testpoint branches prefer inner2 then bottom.",
    "Ground is owned separately. J_HOT.pin2/J_COLD.pin2, lower divider returns, and C209-C212 ground pads need local low-impedance returns to the shared reference plane.",
    "Smaller priority values route first. Local RC connections use priority 8, ADC fanout branches 9, and long testpoint trunks 60; testpoints must not consume the local filter escapes first.",
    "The 3 mm local RC and capacitor-to-ADC bounds (12 mm HOT/COLD, 15 mm VOUT, 18 mm VBUS) require the reviewed placements in thermal-completion.json and the MCU agent's fine-pitch escapes. ADC bounds include their MCU escape lengths.",
    "Filter-cluster placements use actual native courtyard outlines, rectangles and circles. The reviewed R210/R211/R222/R224/R225 corrections clear all board courtyards; local RC routes remain 1.55-1.91 mm rather than forcing courtyard overlap for minimum pad distance.",
    "C209-C212 are 100 nF signal-to-ground ADC filters, not supply bypasses. Their native source components have no automatic max_decoupling_trace_length; do not add or waive a supply-bypass constraint for these nets.",
    "C208 is a true V3V3-to-ground bypass. Preserve its 1 mm maximum and feed the supply tree at U_THERMAL.pin8 rather than making C208 a remote supply-tree endpoint.",
  ],
}
