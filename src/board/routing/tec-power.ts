import type { RoutingEdge, RoutingLayer, RoutingPlan } from "./types"

// Revision B routing intent only. Widths are corridor targets: the shared router
// must neck into small pads and validate actual copper clearance and ampacity.
const edges: RoutingEdge[] = []
function edge(net: string, from: string, to: string, width: number, priority: number,
  note: string, preferredLayers: RoutingLayer[] = ["top", "bottom"]): void {
  edges.push({ net, from, to, width, priority, preferredLayers, note })
}

// USB input power: unite both receptacle VBUS contacts before the protected load.
edge("VBUS_RAW", "J_USB_PD.pin15", "J_USB_PD.pin16", 1.5, 2, "Parallel receptacle VBUS contacts; short broad local connection with pad-sized necks.")
edge("VBUS_RAW", "J_USB_PD.pin16", "U_INPUT.pin5", 2, 2, "Main input current corridor. U_INPUT pin5 is only 0.30 mm wide: use a short 0.30 mm pad-width neck, widen immediately outside its pad clearance.")
edge("VBUS_RAW", "J_USB_PD.pin16", "C_USB_IN.pin1", 0.6, 3, "Local input bypass branch.")
edge("VBUS_RAW", "C_USB_IN.pin1", "R_CH_VDD.pin1", 0.4, 9, "PD controller bias feed from raw input.")
edge("VBUS_RAW", "J_USB_PD.pin15", "R_CH_VBUS.pin1", 0.3, 9, "Independent PD voltage-sense branch.")
edge("VBUS_RAW", "R_CH_VBUS.pin1", "R_WINDOW_TOP.pin1", 0.3, 10, "Voltage-window divider feed.")
edge("VBUS_RAW", "J_USB_PD.pin15", "D_LOGIC_PD.pin2", 0.8, 5, "Logic supply source branch; keep off TEC switched-current path.")
edge("VBUS_RAW", "U_INPUT.pin5", "R_INPUT_OV_TOP.pin1", 0.2, 9, "Fine-pad overvoltage-divider tap, separate from high-current pad exit.")
edge("VBUS_RAW", "C_USB_IN.pin1", "R501.pin1", 0.3, 12, "Indicator branch.")
edge("VBUS_RAW", "D_LOGIC_PD.pin2", "TP01.pin1", 0.3, 12, "Raw-input test branch.", ["bottom", "top"])
edge("VBUS_RAW", "TP01.pin1", "R222.pin1", 0.25, 13, "ADC divider supply tap, route away from switch node.", ["bottom", "top"])

// Protected current enters the local ceramic bank before the high-side drain.
edge("VBUS_TEC", "U_INPUT.pin6", "C40.pin1", 2, 2, "Protected input trunk; use minimum-length 0.30 mm pad-width neck at 0.30 mm-wide eFuse pad, then broaden. Layer changes need an ampacity-qualified via array.")
edge("VBUS_TEC", "C40.pin1", "C39.pin1", 1.5, 2, "Input ceramic-bank current corridor.")
edge("VBUS_TEC", "C39.pin1", "C26.pin1", 1.5, 2, "Input ceramic-bank current corridor.")
edge("VBUS_TEC", "C26.pin1", "Q20.pin5", 1.5, 0, "Critical commutation supply: ceramic directly to high-side drain, shortest top-layer path.", ["top"])
edge("VBUS_TEC", "Q20.pin5", "C25.pin1", 1.2, 0, "Second close ceramic joins directly at drain; minimize high di/dt loop with capacitor ground and Q21 source.", ["top"])
edge("VBUS_TEC", "C26.pin1", "C38.pin1", 1.2, 3, "Upper ceramic-bank feed.")
edge("VBUS_TEC", "C39.pin1", "C27.pin1", 1.2, 3, "Lower ceramic-bank feed.")
edge("VBUS_TEC", "U_INPUT.pin6", "C_INPUT_OUT.pin1", 0.6, 4, "Use explicit .6mm protected-array feed; eFuse .3mm actual-pad-width stem is local, not a long thin capacitor feed.")
edge("VBUS_TEC", "C_INPUT_OUT.pin1", "C28.pin1", 1.2, 5, "Use independent 1.2mm protected-array bulk feed, C28 three-via array and 1mm top spokes. Small C_INPUT_OUT land is not a current bottleneck.", ["bottom", "top"])
edge("VBUS_TEC", "C40.pin1", "Q22.pin2", 0.4, 9, "Enable network supply tap.")
edge("VBUS_TEC", "Q22.pin2", "R35.pin1", 0.3, 10, "Enable bias resistor supply.")
edge("VBUS_TEC", "Q22.pin2", "R502.pin1", 0.3, 12, "Protected-input indicator supply.")
edge("VBUS_TEC", "Q20.pin5", "C24.pin1", 0.6, 4, "Controller VIN bypass branch; keep outside gate traces.")
edge("VBUS_TEC", "C24.pin1", "U2.pin3", 0.2, 4, "Fine-pad controller VIN feed from its local capacitor.")
edge("VBUS_TEC", "C27.pin1", "C44.pin1", 0.4, 6, "Local protected supply bypass branch.")
edge("VBUS_TEC", "C28.pin1", "TP02.pin1", 0.3, 12, "Protected-rail test branch.", ["bottom", "top"])
edge("VBUS_TEC", "C40.pin1", "C213.pin1", 1, 7, "Fan input feed independently from protected rail; avoid TEC_SW and sense-pair corridor.", ["bottom", "top"])
edge("VBUS_TEC", "C213.pin1", "U_FAN.pin3", 0.4, 7, "Short fan regulator VIN feed with local pad neck.")
edge("VBUS_TEC", "C213.pin1", "C219.pin1", 1, 7, "Fan input ceramic-bank branch.")
edge("VBUS_TEC", "C219.pin1", "C220.pin1", 1, 7, "Fan input ceramic-bank branch.")

// The switching copper is confined to Q20/Q21/L2 and the local bootstrap return.
edge("TEC_SW", "Q20.pin2", "Q20.pin1", 0.65, 0, "Unite adjacent high-side source pads locally.", ["top"])
edge("TEC_SW", "Q20.pin2", "Q20.pin3", 0.65, 0, "Unite adjacent high-side source pads locally; do not encroach on gate pad4.", ["top"])
edge("TEC_SW", "Q20.pin2", "Q21.pin5", 1.5, 0, "Shortest high-side source to low-side drain commutation path; broaden beyond source pad neck.", ["top"])
edge("TEC_SW", "Q21.pin5", "L2.pin1", 2, 0, "Broad compact switch-node-to-inductor corridor. No distant switch-node plane or internal GND-layer route.", ["top"])
edge("TEC_SW", "Q21.pin5", "C20.pin2", 0.4, 1, "Local bootstrap return from bridge, not from far inductor end.", ["top"])
edge("TEC_SW", "C20.pin2", "U2.pin18", 0.2, 1, "Fine-pad switch reference adjacent to bootstrap/gate-drive loop.", ["top"])
edge("TEC_SW", "Q20.pin3", "R23.pin2", 0.25, 3, "High-side gate pull-down source return; keep local to Q20 and away from Kelvin sense.", ["top", "bottom"])

edge("TEC_INDUCTOR_OUT", "L2.pin2", "R20.pin1", 2, 0, "Full output current to shunt; taper into 1.65 mm shunt terminal.")
edge("TEC_INDUCTOR_OUT", "R20.pin1", "R25.pin1", 0.2, 1, "Dedicated Kelvin positive branch directly from shunt land, no power or capacitor taps. Avoid TEC_SW/gate copper and use the same quiet layer/corridor as R20.pin2 to R26.pin1.", ["bottom", "top"])
edge("TEC_INDUCTOR_OUT", "R20.pin1", "R41.pin1", 0.2, 1, "Independent monitor Kelvin positive takeoff inward from shunt pad to its own barrel; matched inner2 corridor paired with R42. Use concrete shuntKelvin packet and prohibit load-current sharing outside the solder land.", ["inner2", "top"])

edge("TEC_POS", "R20.pin2", "J_TEC.pin1", 2, 0, "Main shunt-to-TEC terminal current corridor; 1.65 mm pad neck widens immediately.")
edge("TEC_POS", "R20.pin2", "C30.pin1", 1.2, 2, "Output capacitor supply from shunt output.")
edge("TEC_POS", "C30.pin1", "C31.pin1", 1.2, 2, "Output ceramic-bank connection.")
edge("TEC_POS", "C30.pin1", "C29.pin1", 1, 2, "Output bulk capacitor branch.")
edge("TEC_POS", "R20.pin2", "R26.pin1", 0.2, 1, "Dedicated Kelvin negative branch directly from shunt land; pair with positive R25 branch, avoid all switching power and gate copper, carry no load current.", ["bottom", "top"])
edge("TEC_POS", "R20.pin2", "R42.pin1", 0.2, 1, "Independent monitor Kelvin negative takeoff inward from shunt pad to its own barrel; matched inner2 corridor paired with R41. Use concrete shuntKelvin packet and prohibit load-current sharing outside the solder land.", ["inner2", "top"])
edge("TEC_POS", "C30.pin1", "R29.pin1", 0.25, 8, "Quiet output-voltage feedback tap; never join on a Kelvin trace.", ["bottom", "top"])
edge("TEC_POS", "C31.pin1", "TP05.pin1", 0.35, 11, "Output test branch clear of sense routing.", ["bottom", "top"])
edge("TEC_POS", "TP05.pin1", "R45.pin1", 0.35, 11, "Output bleeder branch, not a Kelvin branch.", ["bottom", "top"])
edge("TEC_POS", "TP05.pin1", "R224.pin1", 0.25, 12, "ADC divider feed from quiet output branch.", ["bottom", "top"])
edge("TEC_POS", "C30.pin1", "R505.pin1", 0.25, 12, "Output indicator feed; avoid routing alongside gate/switch traces.", ["bottom", "top"])

edge("TEC_HG", "U2.pin17", "R21.pin1", 0.2, 0, "Shortest fine-pad high-side gate-driver output.", ["top"])
edge("TEC_LG", "U2.pin20", "R22.pin1", 0.2, 0, "Short fine-pad low-side gate-driver output. If R22 moves south to release the 2 mm switch corridor, a short bottom crossing with nearby GND return stitching is permitted; keep resistor at gate end.", ["top", "bottom"])
edge("TEC_HIGH_GATE", "R21.pin2", "Q20.pin4", 0.3, 0, "Short gate-resistor-to-high-side-gate path; no via if possible.", ["top"])
edge("TEC_HIGH_GATE", "Q20.pin4", "R23.pin1", 0.25, 3, "Pull-down attaches at MOSFET gate, not controller side of R21.", ["top", "bottom"])
edge("TEC_LOW_GATE", "R22.pin2", "Q21.pin4", 0.3, 0, "Short gate-resistor-to-low-side-gate path; no via if possible.", ["top"])
edge("TEC_LOW_GATE", "Q21.pin4", "R24.pin1", 0.25, 3, "Pull-down attaches at MOSFET gate, not controller side of R22.", ["top", "bottom"])
edge("TEC_BOOT", "D20.pin1", "C20.pin1", 0.4, 1, "Bootstrap diode to capacitor, shortest local charging path.", ["top"])
edge("TEC_BOOT", "C20.pin1", "U2.pin19", 0.2, 0, "Bootstrap capacitor to fine-pitch BOOT pin; preserve local BOOT/SW loop.", ["top"])
edge("TEC_VCC_INT", "U2.pin1", "C22.pin1", 0.2, 1, "Local internal regulator bypass with fine-pad escape.", ["top"])
edge("TEC_VCC_INT", "C22.pin1", "C21.pin1", 0.5, 2, "Internal regulator reservoir bank.", ["top"])
edge("TEC_VCC_INT", "C21.pin1", "C41.pin1", 0.5, 2, "Parallel reservoir capacitor connection.", ["top"])
edge("TEC_VCC_INT", "C22.pin1", "D20.pin2", 0.4, 1, "Bootstrap charging supply from local bypass bank.", ["top"])

export const plan: RoutingPlan = {
  owner: "tec-power",
  nets: ["VBUS_RAW", "VBUS_TEC", "TEC_SW", "TEC_INDUCTOR_OUT", "TEC_POS", "TEC_HG", "TEC_LG", "TEC_HIGH_GATE", "TEC_LOW_GATE", "TEC_BOOT", "TEC_VCC_INT"],
  edges,
  notes: [
    "Routing intent is not fabrication qualified: clearance, completed copper, thermal rise, stackup, via current capacity and switching behavior need validation.",
    "Reserve inner1 for continuous GND. Prefer top for bridge/driver/bootstrap; bottom is available for quiet Kelvin branches and remote DC feeds.",
    "Nominal 1–2 mm power corridors require short pad necks. U_INPUT pin5/pin6 polygon lands are 0.30 mm wide; use the validated 0.30 mm pad-width escape only locally. Never silently accept signal-width power trunks.",
    "Kelvin pairs originate at R20 lands and carry no power. Keep R25/R26 and R41/R42 branches away from TEC_SW, gates, inductor and high-current corridors; same-net geometric merging must not collapse these into power trunks.",
    "Q20/Q21/L2 and the input capacitors define the commutation loop. Ground routing owner must return the nearby input ceramics to Q21 sources over a short broad path with stitching; avoid making the commutation return depend on distant ground copper.",
    "Keep switch-node area small and on top; do not create a broad TEC_SW pour. Any bottom power transition requires suitably sized parallel vias, not a single signal via.",
  ],
}
