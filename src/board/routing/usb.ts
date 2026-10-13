import type { RoutingPlan } from "./types"

/** Revision B routing intent. All selectors verified against ports.json. */
export const plan: RoutingPlan = {
  owner: "usb-routing-astra-2",
  nets: [
    "USB_DP_PORT", "USB_DM_PORT", "USB_DP_SWITCH", "USB_DM_SWITCH",
    "USB_DP_MCU", "USB_DM_MCU", "USB_PROG_CC1", "USB_PROG_CC2",
    "USB_VBUS_DETECT", "USB_PRESENT_BASE", "USB_DATA_DISABLE",
  ],
  edges: [
    // Fixed paired candidate geometry and routed-only placement overrides live in
    // usb-completion.json. MCU-facing resistor pin2 points south after rotation.
    { net: "USB_DP_MCU", from: "U_MCU.pin47", to: "R_USB_DP.pin2", width: 0.2, priority: 0, preferredLayers: ["top"], maxLength: 12, note: "Use explicit top-only matched candidate after coordinated north-support placement. R_USB_DP pin2 now faces south." },
    { net: "USB_DM_MCU", from: "U_MCU.pin46", to: "R_USB_DM.pin2", width: 0.2, priority: 0, preferredLayers: ["top"], maxLength: 12, note: "Use explicit top-only matched candidate; keep 0.20 mm clearance from relocated VREG_OUT capacitor." },
    // These are separate electrical nets across the series resistors and switch.
    { net: "USB_DP_SWITCH", from: "U_USB_SWITCH.pin1", to: "R_USB_DP.pin1", width: 0.2, priority: 1, preferredLayers: ["inner2", "top"], maxLength: 35, note: "Use usb-completion.json paired inner2 U-turn with two transitions per member and matched total connector-to-MCU length." },
    { net: "USB_DM_SWITCH", from: "U_USB_SWITCH.pin2", to: "R_USB_DM.pin1", width: 0.2, priority: 1, preferredLayers: ["inner2", "top"], maxLength: 35, note: "Use usb-completion.json paired inner2 U-turn and local length tuning; reserve geometry before low-speed routing." },
    // Interleaved connector pins cannot both be joined by straight top-layer
    // segments: pin8 lies between pin7/pin9, pin9 between pin8/pin10.
    { net: "USB_DP_PORT", from: "J_USB_PROG.pin8", to: "J_USB_PROG.pin10", width: 0.2, priority: 2, preferredLayers: ["top", "bottom"], maxLength: 5, note: "Top bridge WEST of connector pad tails; tuned to match the DM duplicate bridge." },
    { net: "USB_DM_PORT", from: "J_USB_PROG.pin7", to: "J_USB_PROG.pin9", width: 0.2, priority: 2, preferredLayers: ["top"], maxLength: 6, note: "Top bridge EAST of connector pad tips. D+ uses west side, so interleaved contacts do not require a layer crossover." },
    // Explicit ESD-pad flow removes long protector stubs. Both same-net ESD
    // pads must receive actual copper; do not assume the package joins them.
    { net: "USB_DP_PORT", from: "J_USB_PROG.pin10", to: "U_USB_ESD.pin6", width: 0.2, priority: 3, preferredLayers: ["top", "bottom"], maxLength: 14, note: "Primary connector contact to WEST ESD pin6 after 90-degree rotation." },
    { net: "USB_DM_PORT", from: "J_USB_PROG.pin9", to: "U_USB_ESD.pin4", width: 0.2, priority: 3, preferredLayers: ["top", "bottom"], maxLength: 14, note: "Primary connector contact to WEST ESD pin4 after 90-degree rotation." },
    { net: "USB_DP_PORT", from: "U_USB_ESD.pin1", to: "U_USB_ESD.pin6", width: 0.2, priority: 2, preferredLayers: ["top"], maxLength: 4, note: "Horizontal ESD flow at y=-19.94996 or east ESD output to west switch input, using fixed paired geometry." },
    { net: "USB_DM_PORT", from: "U_USB_ESD.pin3", to: "U_USB_ESD.pin4", width: 0.2, priority: 2, preferredLayers: ["top"], maxLength: 4, note: "Horizontal ESD flow at y=-18.05004 or east ESD output to west switch input, using fixed paired geometry." },
    { net: "USB_DP_PORT", from: "U_USB_ESD.pin1", to: "U_USB_SWITCH.pin8", width: 0.2, priority: 3, preferredLayers: ["top", "bottom", "inner2"], maxLength: 18, note: "Horizontal ESD flow at y=-19.94996 or east ESD output to west switch input, using fixed paired geometry." },
    { net: "USB_DM_PORT", from: "U_USB_ESD.pin3", to: "U_USB_SWITCH.pin7", width: 0.2, priority: 3, preferredLayers: ["top", "bottom", "inner2"], maxLength: 18, note: "Horizontal ESD flow at y=-18.05004 or east ESD output to west switch input, using fixed paired geometry." },
    { net: "USB_PROG_CC1", from: "J_USB_PROG.pin6", to: "R_USB_CC1.pin1", width: 0.2, priority: 8, preferredLayers: ["top", "bottom", "inner2"], maxLength: 15, note: "Escape connector east before turning north; VBUS pin16 and shell are obstacles." },
    { net: "USB_PROG_CC2", from: "J_USB_PROG.pin12", to: "R_USB_CC2.pin1", width: 0.2, priority: 8, preferredLayers: ["top", "bottom", "inner2"], maxLength: 16, note: "Escape connector east before turning south; clear VBUS pin15 and shell." },
    { net: "USB_VBUS_DETECT", from: "R_USB_DETECT_TOP.pin2", to: "R_USB_DETECT_BOTTOM.pin1", width: 0.2, priority: 9, preferredLayers: ["top", "inner2", "bottom"] },
    { net: "USB_VBUS_DETECT", from: "R_USB_DETECT_TOP.pin2", to: "U_MCU.pin36", width: 0.2, priority: 10, preferredLayers: ["inner2", "bottom", "top"], note: "Low-speed divider sense; yield top routing corridor to USB data and approach east-facing MCU pin36 from east." },
    { net: "USB_PRESENT_BASE", from: "R_USB_PRESENT.pin2", to: "R_USB_PRESENT_OFF.pin1", width: 0.2, priority: 9, preferredLayers: ["top", "inner2", "bottom"] },
    { net: "USB_PRESENT_BASE", from: "R_USB_PRESENT.pin2", to: "Q_USB_SERVICE.pin1", width: 0.2, priority: 9, preferredLayers: ["top", "inner2", "bottom"] },
    { net: "USB_PRESENT_BASE", from: "R_USB_PRESENT_OFF.pin1", to: "Q_USB_PRESENT.pin1", width: 0.2, priority: 9, preferredLayers: ["top", "inner2", "bottom"] },
    { net: "USB_DATA_DISABLE", from: "Q_USB_PRESENT.pin3", to: "R_USB_DATA_OFF.pin2", width: 0.2, priority: 9, preferredLayers: ["top", "inner2", "bottom"] },
    { net: "USB_DATA_DISABLE", from: "R_USB_DATA_OFF.pin2", to: "U_USB_SWITCH.pin6", width: 0.2, priority: 9, preferredLayers: ["top", "inner2", "bottom"], note: "Approach switch pin6 from north; do not cut across adjacent D-/D+ input pads." },
  ],
  notes: [
    "USB differential impedance is UNQUALIFIED pending the manufacturer's four-layer stackup, dielectric properties, copper thickness and field-solver calculation. The 0.20 mm route width is a routing constraint, not a 90-ohm claim.",
    "Reserve inner1 for an uninterrupted GND reference. Prefer top USB paths over inner1; any bottom/inner2 fallback requires reference-plane review and nearby ground stitching for return paths.",
    "Route paired branches adjacently, with equal transition counts where possible. Review total connector-to-MCU DP and DM lengths across PORT, SWITCH and MCU nets; maxLength values are detour caps, not verified skew limits.",
    "Routed-only placement overrides in usb-completion.json rotate the ESD/switch flow and both USB resistors. Regenerate ports.json before routing; old endpoint coordinates are invalid.",
    "All eleven owned nets have explicit spanning trees. ESD pin1/pin6 and pin3/pin4 are connected through PCB copper so protection can remain in the routed path. Physical ESD/package behavior still requires component validation.",
  ],
}
