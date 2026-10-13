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
      width: 0.4, priority: 5, preferredLayers: ["top"],
      note: "Short local switch path; escape the 0.6 mm regulator land before passing adjacent VBUS_TEC pin3.",
    },
    {
      net: "FAN_SW", from: "U_FAN.pin2", to: "C214.pin2",
      width: 0.4, priority: 5, preferredLayers: ["top"],
      note: "Bootstrap return branches at regulator switch pin; keep this branch local to the buck.",
    },
    {
      net: "FAN_BST", from: "U_FAN.pin6", to: "C214.pin1",
      width: 0.4, priority: 5, preferredLayers: ["top"],
      note: "Bootstrap path must escape around U_FAN.pin1 GND below pin6; do not pass through that land.",
    },
    {
      net: "V12_FAN", from: "L_FAN.pin2", to: "C218.pin1",
      width: 0.8, priority: 5, preferredLayers: ["top", "bottom"],
      note: "Wide output path from inductor to its nearest output reservoir; avoid C218.pin2 GND above pin1.",
    },
    {
      net: "V12_FAN", from: "C218.pin1", to: "C215.pin1",
      width: 0.8, priority: 5, preferredLayers: ["top", "bottom"],
      note: "Join the two output reservoir positive lands on the same local rail.",
    },
    {
      net: "V12_FAN", from: "C215.pin1", to: "J_FAN.pin2",
      width: 0.5, priority: 5, preferredLayers: ["top", "bottom", "inner2"],
      note: "Fan load branch; 0.5 mm accommodates the connector's 0.5999988 mm land.",
    },
    {
      net: "V12_FAN", from: "C215.pin1", to: "R228.pin1",
      width: 0.4, priority: 5, preferredLayers: ["top", "bottom"],
      note: "Sense rail from output reservoir rather than switch copper.",
    },
    {
      net: "V12_FAN", from: "C218.pin1", to: "C221.pin1",
      width: 0.4, priority: 5, preferredLayers: ["top", "bottom"],
      note: "Feedforward capacitor positive land remains on reservoir rail.",
    },
    {
      net: "V12_FAN", from: "C215.pin1", to: "TP04.pin1",
      width: 0.4, priority: 5, preferredLayers: ["bottom", "inner2", "top"],
      note: "Remote measurement branch; use a buried or bottom trunk to leave the buck switch region.",
    },
    {
      net: "V12_FAN", from: "TP04.pin1", to: "R504.pin1",
      width: 0.4, priority: 5, preferredLayers: ["bottom", "inner2", "top"],
      note: "Low-current debug indicator shares the measurement trunk, independent of fan load branch.",
    },
    {
      net: "FAN_FB", from: "R228.pin2", to: "R229.pin1",
      width: 0.2, priority: 25, preferredLayers: ["top", "bottom"],
      note: "Local feedback divider junction.",
    },
    {
      net: "FAN_FB", from: "R229.pin1", to: "C221.pin2",
      width: 0.2, priority: 25, preferredLayers: ["top", "bottom"],
      note: "Route around R229.pin2 GND between these lands; keep the feedforward branch on feedback copper.",
    },
    {
      net: "FAN_FB", from: "R228.pin2", to: "U_FAN.pin4",
      width: 0.2, priority: 25, preferredLayers: ["bottom", "top", "inner2"],
      note: "Feedback return is approximately 14.35 mm before obstacle detours; keep it separate from FAN_SW.",
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
    "Only the local FAN_SW and FAN_BST edges require top routing; power reservoirs use 0.8 mm, smaller power lands 0.4-0.5 mm, and controls 0.2 mm.",
    "Current placement puts the bootstrap capacitor about 5.36 mm from U_FAN.pin6 and the feedback divider about 14.35 mm from U_FAN.pin4 before detours. Geometry must honor intervening pads; electrical loop optimization would require a separate placement change.",
    "U_MCU pins13/14 have 0.1999996 mm pad height and 0.40005 mm pitch. Their 0.2 mm escapes must follow the horizontal pad axis; larger traces or vias placed between the pins are unsuitable.",
    "Remote V12_FAN debug branches extend to TP04 (4,2) and R504 (-12,32.75); FAN_PWM_DRIVE and filtered tach traverse over 68 mm to the MCU. The common clearance router must add layer transitions and avoid other net copper.",
  ],
}
