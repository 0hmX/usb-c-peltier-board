import type { RoutingPlan } from "./types"

/** Fan buck, four-wire connector, and MCU interface; 30 pads, 21 tree edges. */
export const plan: RoutingPlan = {
  owner: "fan",
  nets: [
    "FAN_SW", "FAN_FB", "FAN_BST", "V12_FAN", "FAN_PWM",
    "FAN_PWM_BASE", "FAN_TACH", "FAN_PWM_DRIVE", "FAN_TACH_MCU",
  ],
  edges: [
    {
      net: "FAN_SW", from: "U_FAN.pin2", to: "L_FAN.pin1",
      width: 0.5, priority: 0, preferredLayers: ["top"], maxLength: 11,
      note: "Compact top-only switch strip after routed placement overrides; pass between SOT23 pin rows on y=-10.1, then rise to L_FAN. Keep switch copper small.",
    },
    {
      net: "FAN_SW", from: "U_FAN.pin2", to: "C214.pin2",
      width: 0.25, priority: 0, preferredLayers: ["top"], maxLength: 6,
      note: "Bootstrap SW return branches at regulator switch strip; C214 moves immediately west of U_FAN. No layer transition.",
    },
    {
      net: "FAN_BST", from: "U_FAN.pin6", to: "C214.pin1",
      width: 0.25, priority: 0, preferredLayers: ["top"], maxLength: 3,
      note: "Direct short BST branch to west-side C214; explicit completion path is approximately 1.81 mm and stays clear of U_FAN GND.",
    },
    {
      net: "V12_FAN", from: "L_FAN.pin2", to: "C218.pin1",
      width: 1.2, priority: 0, preferredLayers: ["top"], maxLength: 4,
      note: "Nearest output reservoir after local placement refinement; 1.2 mm strip reaches C218 positive in approximately 3.45 mm.",
    },
    {
      net: "V12_FAN", from: "C218.pin1", to: "C215.pin1",
      width: 1.2, priority: 0, preferredLayers: ["top"], maxLength: 14,
      note: "Join reservoir positives with 1.2 mm DC copper west of C218 negative and east of C213 negative; preserve separate compact GND arrays.",
    },
    {
      net: "V12_FAN", from: "C215.pin1", to: "J_FAN.pin2",
      width: 1.2, priority: 0, preferredLayers: ["bottom", "top"],
      note: "Fan-current corridor uses 1.2 mm bottom copper and three 0.3 mm drill barrels at EACH transition. Retain only a short 0.5 mm neck at the connector 0.6 mm land; use fan-completion.json constrained paths.",
    },
    {
      net: "V12_FAN", from: "C215.pin1", to: "R228.pin1",
      width: 0.25, priority: 4, preferredLayers: ["bottom", "top", "inner2"], maxLength: 25,
      note: "Low-current sense branch from reservoir to close feedback divider; this branch may use signal vias and carries no fan load current.",
    },
    {
      net: "V12_FAN", from: "R228.pin1", to: "C221.pin1",
      width: 0.25, priority: 4, preferredLayers: ["top"], maxLength: 3,
      note: "Feedforward positive joins the nearby upper-divider sense node, approximately 1.75 mm; remains on the same output net.",
    },
    {
      net: "V12_FAN", from: "C215.pin1", to: "TP04.pin1",
      width: 0.25, priority: 8, preferredLayers: ["bottom", "inner2", "top"],
      note: "Remote measurement branch; use a buried or bottom trunk to leave the buck switch region.",
    },
    {
      net: "V12_FAN", from: "TP04.pin1", to: "R504.pin1",
      width: 0.25, priority: 8, preferredLayers: ["bottom", "inner2", "top"],
      note: "Low-current debug indicator shares the measurement trunk, independent of fan load branch.",
    },
    {
      net: "FAN_FB", from: "R228.pin2", to: "R229.pin1",
      width: 0.2, priority: 1, preferredLayers: ["top"], maxLength: 4,
      note: "Compact divider junction above U_FAN; feedforward feedback terminal sits on the same short strip.",
    },
    {
      net: "FAN_FB", from: "R229.pin1", to: "C221.pin2",
      width: 0.2, priority: 1, preferredLayers: ["top"], maxLength: 2,
      note: "Direct local feedback branch; rotated R229 puts its GND terminal above the FB strip.",
    },
    {
      net: "FAN_FB", from: "R228.pin2", to: "U_FAN.pin4",
      width: 0.2, priority: 1, preferredLayers: ["top"], maxLength: 4,
      note: "Feedback return becomes approximately 2.94 mm on top after routed-only placement refinement; keep it north of SW and west of the inductor.",
    },
    {
      net: "FAN_PWM", from: "Q_FAN_PWM.pin3", to: "J_FAN.pin4",
      width: 0.2, priority: 25, preferredLayers: ["top", "bottom"],
      note: "Open-collector output to four-wire fan PWM pin.",
    },
    {
      net: "FAN_PWM_BASE", from: "Q_FAN_PWM.pin1", to: "R219.pin1",
      width: 0.2, priority: 25, preferredLayers: ["top", "bottom"],
      note: "Short base-to-pulldown branch.",
    },
    {
      net: "FAN_PWM_BASE", from: "R219.pin1", to: "R218.pin2",
      width: 0.2, priority: 25, preferredLayers: ["top", "bottom"],
      note: "Connect drive series resistor to the transistor base junction.",
    },
    {
      net: "FAN_TACH", from: "R220.pin2", to: "R221.pin1",
      width: 0.2, priority: 25, preferredLayers: ["top", "bottom"],
      note: "Join tach pullup and filter input locally.",
    },
    {
      net: "FAN_TACH", from: "R221.pin1", to: "J_FAN.pin3",
      width: 0.2, priority: 25, preferredLayers: ["top", "bottom"],
      note: "Raw fan tach input; remain distinct from filtered FAN_TACH_MCU.",
    },
    {
      net: "FAN_PWM_DRIVE", from: "U_MCU.pin13", to: "R218.pin1",
      width: 0.2, priority: 25, preferredLayers: ["bottom", "inner2", "top"],
      note: "Long MCU drive trunk; launch along the 0.85 mm MCU pad axis with a 0.2 mm trace.",
    },
    {
      net: "FAN_TACH_MCU", from: "R221.pin2", to: "U_MCU.pin14",
      width: 0.2, priority: 25, preferredLayers: ["bottom", "inner2", "top"],
      note: "Filtered tach return; launch along MCU pad axis and maintain clearance from adjacent PWM pin13.",
    },
    {
      net: "FAN_TACH_MCU", from: "R221.pin2", to: "TP18.pin1",
      width: 0.2, priority: 25, preferredLayers: ["bottom", "inner2", "top"],
      note: "Filtered tach measurement branch; avoid the buck switch/feedback area above the filter bank.",
    },
  ],
  notes: [
    "All 30 owned terminal selectors were checked against ports.json; none share a physical pad ID. Each net has exactly N-1 edges and all terminals are included.",
    "Local SW/BST/feedback/output-capacitor copper uses top. Fan output and load trunks use 1.2 mm, bootstrap 0.25 mm, sense/debug 0.25 mm, and controls 0.2 mm. Only the connector land retains a short 0.5 mm neck.",
    "fan-completion.json supplies routed-only local placement refinements and exact compact paths, actual supplier courtyards and the TP18 move. Input C213 VIN branch is about 2.09 mm between ports but 0.962 mm outside pads; BST is about 1.81 mm between ports / 0.988 mm outside pads, feedback return about 2.94 mm and nearest output capacitor about 3.45 mm. Source schematic and logical pin assignments remain unchanged.",
    "All fan-current layer transfers use declared parallel via arrays, with every barrel connected by same-net top/bottom straps. GND owner integrates U_FAN/input/output return arrays and a short 1.2 mm bottom PGND strap into continuous inner1.",
    "C216/C217 are supervisor/input-latch decouplers; fan placement does not move them. Exact fan names are L_FAN, R228 and R229; there are no inventory selectors L21 or R230.",
    "U_MCU pins13/14 have 0.1999996 mm pad height and 0.40005 mm pitch. Their 0.2 mm escapes must follow the horizontal pad axis; larger traces or vias placed between the pins are unsuitable.",
    "Remote V12_FAN debug branches extend to TP04 (4,2) and R504 (-12,32.75); FAN_PWM_DRIVE and filtered tach traverse over 68 mm to the MCU. The common clearance router must add layer transitions and avoid other net copper.",
  ],
}
