import type { RoutingEdge, RoutingPlan } from "./types"

const edge = (
  net: string,
  from: string,
  to: string,
  maxLength: number,
  priority: number,
  note: string,
): RoutingEdge => ({
  net,
  from,
  to,
  width: 0.2,
  priority,
  preferredLayers: ["top", "inner2", "bottom"],
  maxLength,
  note,
})

export const plan: RoutingPlan = {
  owner: "mcu",
  nets: [
    "XIN", "XOUT", "XOUT_CRYSTAL", "V1V1", "ADC_AVDD",
    "FLASH_SD3", "FLASH_SCLK", "FLASH_SD0", "FLASH_SD2", "FLASH_SD1", "FLASH_CS",
    "BOOT_BUTTON", "MCU_NRST",
  ],
  edges: [
    // Keep the crystal and its load capacitors local to the two oscillator pins.
    edge("XIN", "U_MCU.pin20", "Y_MCU.pin1", 9, 0,
      "6.456 mm direct distance; use top with a short outward escape from pin20."),
    edge("XIN", "Y_MCU.pin1", "C_XIN.pin1", 5, 0,
      "Load capacitor branches at crystal pin1; 3.398 mm direct distance."),
    edge("XOUT", "U_MCU.pin21", "R_XOUT.pin1", 6, 0,
      "Preserve the existing 1k series resistor; 3.611 mm direct distance."),
    edge("XOUT_CRYSTAL", "R_XOUT.pin2", "Y_MCU.pin3", 4, 0,
      "Resistor-to-crystal segment; 2.246 mm direct distance."),
    edge("XOUT_CRYSTAL", "Y_MCU.pin3", "C_XOUT.pin1", 4, 0,
      "Load capacitor branches at crystal pin3; 2.127 mm direct distance."),

    // MCU-to-flash paths are the main QSPI branches. Leave copper detours to
    // the clearance solver because the ordering at the two packages differs.
    edge("FLASH_SCLK", "U_MCU.pin52", "U_FLASH.pin6", 16, 0,
      "QSPI clock; 9.250 mm direct distance. Keep near the data paths and avoid stubs."),
    edge("FLASH_SD3", "U_MCU.pin51", "U_FLASH.pin7", 16, 0,
      "QSPI SD3/HOLD; 9.461 mm direct distance."),
    edge("FLASH_SD0", "U_MCU.pin53", "U_FLASH.pin5", 16, 0,
      "QSPI SD0/DI; 9.122 mm direct distance."),
    edge("FLASH_SD2", "U_MCU.pin54", "U_FLASH.pin3", 13, 0,
      "QSPI SD2/WP; 6.141 mm direct distance."),
    edge("FLASH_SD1", "U_MCU.pin55", "U_FLASH.pin2", 13, 0,
      "QSPI SD1/DO; 6.158 mm direct distance."),
    edge("FLASH_CS", "U_MCU.pin56", "U_FLASH.pin1", 13, 0,
      "Main QSPI select path; 6.175 mm direct distance. Pullup and boot resistor branch at flash end."),
    edge("FLASH_CS", "U_FLASH.pin1", "R_FLASH_CS.pin2", 6, 0,
      "Existing 10k select pullup branch; 3.298 mm direct distance."),
    edge("FLASH_CS", "R_FLASH_CS.pin2", "R_BOOT.pin1", 4, 0,
      "Existing 1k boot resistor branch; 1.953 mm direct distance."),

    // These are actual RP2040 regulator/core pins, not IOVDD pins. Connect
    // each local bypass directly, then join the core rail on a signal layer.
    edge("V1V1", "U_MCU.pin45", "C_VREG_OUT.pin1", 4, 10,
      "VREG_VOUT to its 1uF output capacitor; 1.882 mm direct distance."),
    edge("V1V1", "U_MCU.pin50", "C_DVDD1.pin1", 5, 10,
      "DVDD1 to its nearest 100nF bypass; 3.226 mm direct distance."),
    edge("V1V1", "U_MCU.pin23", "C_DVDD2.pin1", 5, 10,
      "DVDD2 to its nearest 100nF bypass; 2.595 mm direct distance."),
    edge("V1V1", "U_MCU.pin45", "U_MCU.pin50", 5, 10,
      "VREG_VOUT feeds DVDD1; 2.000 mm direct distance along the north edge."),
    edge("V1V1", "U_MCU.pin50", "U_MCU.pin23", 13, 10,
      "Core rail backbone; 6.897 mm direct distance. Use inner2 or bottom around the exposed GND pad."),
    edge("ADC_AVDD", "U_MCU.pin43", "C_ADC_AVDD.pin1", 9, 10,
      "ADC supply pin directly to its bypass; 5.513 mm direct distance."),
    edge("ADC_AVDD", "C_ADC_AVDD.pin1", "R_ADC_SUPPLY.pin2", 4, 10,
      "Filtered side of the existing 200-ohm resistor; 1.476 mm direct distance."),

    // Switches expose two terminals on each electrical side; route both
    // named terminals rather than assuming the footprint shorts them.
    edge("BOOT_BUTTON", "R_BOOT.pin2", "SW_BOOT.pin2", 27, 20,
      "Nearest boot-switch terminal; 17.945 mm direct distance."),
    edge("BOOT_BUTTON", "SW_BOOT.pin2", "SW_BOOT.pin1", 8, 20,
      "Bridge same-side switch terminals; 4.200 mm direct distance."),
    edge("MCU_NRST", "U_MCU.pin26", "R_RESET_PU.pin2", 6, 20,
      "RP2040 RUN/reset to local pullup; 3.058 mm direct distance."),
    edge("MCU_NRST", "R_RESET_PU.pin2", "SW_RESET.pin2", 18, 20,
      "Nearest reset-switch terminal; 10.640 mm direct distance."),
    edge("MCU_NRST", "SW_RESET.pin2", "SW_RESET.pin1", 8, 20,
      "Bridge same-side reset-switch terminals; 4.200 mm direct distance."),
    edge("MCU_NRST", "R_RESET_PU.pin2", "TP_RESET.pin1", 36, 20,
      "Reset backbone to safety/test cluster; 23.098 mm direct distance."),
    edge("MCU_NRST", "TP_RESET.pin1", "D_RESET_SAFE.pin1", 9, 20,
      "Existing safe-reset diode connection; 5.133 mm direct distance."),
    edge("MCU_NRST", "TP_RESET.pin1", "TP13.pin1", 45, 20,
      "Include remote reset testpoint TP13; 29.428 mm direct distance. No oscillator-region detour."),
  ],
  notes: [
    "All selectors and pin functions are taken from ports.json and processor.tsx; no pin assignments or placements are changed.",
    "13 complete spanning trees, 28 edges, 0.2 mm width. Crystal/QSPI priority 0; local supply priority 10; boot/reset priority 20.",
    "Prefer top for oscillator and bypass branches. Reserve inner1 for GND; permit inner2/bottom for crossing QSPI signals and the V1V1 backbone.",
    "Length budgets are routing targets in mm, allowing pad escape and obstacle clearance; they are not verified routed lengths or a timing/impedance signoff.",
    "Keep oscillator copper clear of QSPI clock, USB, and switching power routes. Avoid extra oscillator vias and leave bypass return routing to the GND owner.",
  ],
}
