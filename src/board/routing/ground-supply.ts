import type { RoutingPlan } from "./types"

// Exact supplemental GND escape and parallel-return geometry is saved in ground-completion.json.
// The shared router must reserve those branches before routing ordinary signal leaves.
export const plan: RoutingPlan = {
  "owner": "ground-supply",
  "nets": [
    "GND",
    "V3V3",
    "LOGIC_VIN",
    "LOGIC_SW",
    "LOGIC_BST"
  ],
  "edges": [
    {
      "net": "LOGIC_VIN",
      "from": "C200.pin1",
      "to": "U_LOGIC.pin2",
      "width": 0.6,
      "priority": 5,
      "preferredLayers": [
        "top"
      ],
      "note": "Input bypass to VIN; C200 routed-only placement and 0.6 mm direct top copper in ground-completion.json give 0.750 mm exposed length."
    },
    {
      "net": "LOGIC_VIN",
      "from": "U_LOGIC.pin2",
      "to": "U_LOGIC.pin3",
      "width": 0.4,
      "priority": 6,
      "preferredLayers": [
        "top"
      ],
      "note": "Local VIN/enable tie."
    },
    {
      "net": "LOGIC_VIN",
      "from": "D_LOGIC_PD.pin1",
      "to": "D_LOGIC_USB.pin1",
      "width": 0.8,
      "priority": 30,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "ORed input bus; preserve diode isolation through their opposite pads."
    },
    {
      "net": "LOGIC_VIN",
      "from": "D_LOGIC_USB.pin1",
      "to": "C200.pin1",
      "width": 0.8,
      "priority": 31,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "ORed input bus into input bypass."
    },
    {
      "net": "LOGIC_BST",
      "from": "U_LOGIC.pin6",
      "to": "C201.pin1",
      "width": 0.4,
      "priority": 2,
      "preferredLayers": [
        "top"
      ],
      "note": "Bootstrap capacitor lead; top only and minimize loop area."
    },
    {
      "net": "LOGIC_SW",
      "from": "U_LOGIC.pin5",
      "to": "C201.pin2",
      "width": 0.4,
      "priority": 3,
      "preferredLayers": [
        "top"
      ],
      "note": "Bootstrap return to SW; keep compact and away from feedback."
    },
    {
      "net": "LOGIC_SW",
      "from": "U_LOGIC.pin5",
      "to": "L_LOGIC.pin1",
      "width": 0.6,
      "priority": 4,
      "preferredLayers": [
        "top"
      ],
      "note": "Switch node to inductor; top only, minimize area and avoid unrelated signals below."
    },
    {
      "net": "V3V3",
      "from": "L_LOGIC.pin2",
      "to": "C202.pin1",
      "width": 0.8,
      "priority": 7,
      "preferredLayers": [
        "top"
      ],
      "note": "Inductor output to output bypass; main regulated output feed."
    },
    {
      "net": "V3V3",
      "from": "C202.pin1",
      "to": "U_LOGIC.pin1",
      "width": 0.4,
      "priority": 8,
      "preferredLayers": [
        "top",
        "bottom"
      ],
      "note": "Quiet output sense from capacitor side; keep away from LOGIC_SW."
    },
    {
      "net": "V3V3",
      "from": "C_IO6.pin1",
      "to": "U_MCU.pin1",
      "width": 0.2,
      "priority": 10,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Dedicated RP2040 local bypass tap; exit fine pad before widening."
    },
    {
      "net": "V3V3",
      "from": "C_IO5.pin1",
      "to": "U_MCU.pin10",
      "width": 0.2,
      "priority": 10,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Dedicated RP2040 local bypass tap; exit fine pad before widening."
    },
    {
      "net": "V3V3",
      "from": "C_IO4.pin1",
      "to": "U_MCU.pin22",
      "width": 0.2,
      "priority": 10,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Dedicated RP2040 local bypass tap; exit fine pad before widening."
    },
    {
      "net": "V3V3",
      "from": "C_IO3.pin1",
      "to": "U_MCU.pin33",
      "width": 0.2,
      "priority": 10,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Dedicated RP2040 local bypass tap; exit fine pad before widening."
    },
    {
      "net": "V3V3",
      "from": "C_IO2.pin1",
      "to": "U_MCU.pin42",
      "width": 0.2,
      "priority": 10,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Dedicated RP2040 local bypass tap; exit fine pad before widening."
    },
    {
      "net": "V3V3",
      "from": "C_VREG_IN.pin1",
      "to": "U_MCU.pin44",
      "width": 0.2,
      "priority": 10,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Dedicated RP2040 local bypass tap; exit fine pad before widening."
    },
    {
      "net": "V3V3",
      "from": "C_USB_VDD.pin1",
      "to": "U_MCU.pin48",
      "width": 0.2,
      "priority": 10,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Dedicated RP2040 local bypass tap; exit fine pad before widening."
    },
    {
      "net": "V3V3",
      "from": "C_IO1.pin1",
      "to": "U_MCU.pin49",
      "width": 0.2,
      "priority": 10,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Dedicated RP2040 local bypass tap; exit fine pad before widening."
    },
    {
      "net": "V3V3",
      "from": "C43.pin1",
      "to": "U_TEC_MON.pin5",
      "width": 0.4,
      "priority": 11,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Local bypass supply tap; route shortest legal escape before distribution."
    },
    {
      "net": "V3V3",
      "from": "C206.pin1",
      "to": "U_DAC.pin3",
      "width": 0.4,
      "priority": 11,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Local bypass supply tap; route shortest legal escape before distribution."
    },
    {
      "net": "V3V3",
      "from": "C207.pin1",
      "to": "U_LATCH.pin2",
      "width": 0.4,
      "priority": 11,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Supply-held DATA input, not a bypass/VCC pin; connect to local V3V3 distribution."
    },
    {
      "net": "V3V3",
      "from": "C217.pin1",
      "to": "U_INPUT_LATCH.pin2",
      "width": 0.4,
      "priority": 11,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Supply-held DATA input, not a bypass/VCC pin; connect to local V3V3 distribution."
    },
    {
      "net": "V3V3",
      "from": "C208.pin1",
      "to": "U_THERMAL.pin8",
      "width": 0.4,
      "priority": 11,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Local bypass supply tap; route shortest legal escape before distribution."
    },
    {
      "net": "V3V3",
      "from": "C216.pin1",
      "to": "U_SUPERVISOR.pin3",
      "width": 0.4,
      "priority": 11,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Local bypass supply tap; route shortest legal escape before distribution."
    },
    {
      "net": "V3V3",
      "from": "C222.pin1",
      "to": "U_CLEAR_BUFFER.pin5",
      "width": 0.4,
      "priority": 11,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Local bypass supply tap; route shortest legal escape before distribution."
    },
    {
      "net": "V3V3",
      "from": "C223.pin1",
      "to": "U_CLOCK_BUFFER.pin5",
      "width": 0.4,
      "priority": 11,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Local bypass supply tap; route shortest legal escape before distribution."
    },
    {
      "net": "V3V3",
      "from": "C_DBG1.pin1",
      "to": "U_DBG1.pin5",
      "width": 0.4,
      "priority": 11,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Local bypass supply tap; route shortest legal escape before distribution."
    },
    {
      "net": "V3V3",
      "from": "C_DBG2.pin1",
      "to": "U_DBG2.pin5",
      "width": 0.4,
      "priority": 11,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Local bypass supply tap; route shortest legal escape before distribution."
    },
    {
      "net": "V3V3",
      "from": "C_PD_WINDOW.pin1",
      "to": "U_PD_WINDOW.pin8",
      "width": 0.4,
      "priority": 11,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Local bypass supply tap; route shortest legal escape before distribution."
    },
    {
      "net": "V3V3",
      "from": "C_FLASH.pin1",
      "to": "U_FLASH.pin8",
      "width": 0.2,
      "priority": 11,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Local bypass supply tap; route shortest legal escape before distribution."
    },
    {
      "net": "V3V3",
      "from": "C_USB_SWITCH.pin1",
      "to": "U_USB_SWITCH.pin10",
      "width": 0.2,
      "priority": 11,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Local bypass supply tap; route shortest legal escape before distribution."
    },
    {
      "net": "V3V3",
      "from": "C_AUX1.pin1",
      "to": "U_AUX_BUFFER.pin5",
      "width": 0.4,
      "priority": 11,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Local bypass supply tap; route shortest legal escape before distribution."
    },
    {
      "net": "V3V3",
      "from": "C_AUX2.pin1",
      "to": "U_AUX_LOSS_LATCH.pin2",
      "width": 0.4,
      "priority": 11,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Supply-held DATA input, not a bypass/VCC pin; connect to local V3V3 distribution."
    },
    {
      "net": "V3V3",
      "from": "U_LATCH.pin7",
      "to": "U_LATCH.pin8",
      "width": 0.4,
      "priority": 12,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Adjacent tied logic supply/input pads; local strap."
    },
    {
      "net": "V3V3",
      "from": "C207.pin1",
      "to": "U_LATCH.pin8",
      "width": 0.2,
      "priority": 10,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Dedicated true VCC bypass connection to pin8; reserve direct clipped copper before distribution."
    },
    {
      "net": "V3V3",
      "from": "U_INPUT_LATCH.pin7",
      "to": "U_INPUT_LATCH.pin8",
      "width": 0.4,
      "priority": 12,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Adjacent tied logic supply/input pads; local strap."
    },
    {
      "net": "V3V3",
      "from": "C217.pin1",
      "to": "U_INPUT_LATCH.pin8",
      "width": 0.2,
      "priority": 10,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Dedicated true VCC bypass connection to pin8; reserve direct clipped copper before distribution."
    },
    {
      "net": "V3V3",
      "from": "U_AUX_LOSS_LATCH.pin7",
      "to": "U_AUX_LOSS_LATCH.pin8",
      "width": 0.4,
      "priority": 12,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Adjacent tied logic supply/input pads; local strap."
    },
    {
      "net": "V3V3",
      "from": "C_AUX2.pin1",
      "to": "U_AUX_LOSS_LATCH.pin8",
      "width": 0.2,
      "priority": 10,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Dedicated true VCC bypass connection to pin8; reserve direct clipped copper before distribution."
    },
    {
      "net": "V3V3",
      "from": "R233.pin1",
      "to": "Q_FAULT_SOURCE.pin2",
      "width": 0.4,
      "priority": 15,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Local supply leaf; no other load is routed through this IC/transistor pad."
    },
    {
      "net": "V3V3",
      "from": "R214.pin1",
      "to": "U_FAN.pin5",
      "width": 0.4,
      "priority": 15,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Local supply leaf; no other load is routed through this IC/transistor pad."
    },
    {
      "net": "V3V3",
      "from": "R_INPUT_FAULT.pin1",
      "to": "R_INPUT_PG.pin1",
      "width": 0.4,
      "priority": 41.8,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "R_UV_TOP.pin1",
      "to": "C_PD_WINDOW.pin1",
      "width": 0.4,
      "priority": 42.462,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "R_USB_DATA_OFF.pin1",
      "to": "R_FLASH_CS.pin1",
      "width": 0.4,
      "priority": 42.51,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "C_IO5.pin1",
      "to": "C_USB_SWITCH.pin1",
      "width": 0.4,
      "priority": 42.862,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "R_PD_SCL.pin1",
      "to": "R_PD_SDA.pin1",
      "width": 0.4,
      "priority": 43.0,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "C_IO4.pin1",
      "to": "C_MCU_BULK.pin1",
      "width": 0.4,
      "priority": 43.027,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "C_IO4.pin1",
      "to": "C_IO5.pin1",
      "width": 0.4,
      "priority": 43.041,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "C_FLASH.pin1",
      "to": "R_FLASH_CS.pin1",
      "width": 0.4,
      "priority": 43.153,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "C_IO2.pin1",
      "to": "C_VREG_IN.pin1",
      "width": 0.4,
      "priority": 43.288,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "C_IO1.pin1",
      "to": "C_USB_VDD.pin1",
      "width": 0.4,
      "priority": 43.5,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "C_IO1.pin1",
      "to": "C_IO6.pin1",
      "width": 0.4,
      "priority": 43.553,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "R_INPUT_FAULT.pin1",
      "to": "R_PD_VALID_PU.pin1",
      "width": 0.4,
      "priority": 43.606,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "C202.pin1",
      "to": "R_OV_TOP.pin1",
      "width": 0.4,
      "priority": 43.965,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "R237.pin1",
      "to": "C222.pin1",
      "width": 0.4,
      "priority": 43.966,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "C_IO2.pin1",
      "to": "C_IO3.pin1",
      "width": 0.4,
      "priority": 44.0,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "R_PD_SDA.pin1",
      "to": "C222.pin1",
      "width": 0.4,
      "priority": 44.025,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "C_VREG_IN.pin1",
      "to": "R_ADC_SUPPLY.pin1",
      "width": 0.4,
      "priority": 44.484,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "C_USB_VDD.pin1",
      "to": "C_VREG_IN.pin1",
      "width": 0.4,
      "priority": 44.507,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "C_IO3.pin1",
      "to": "R_RESET_PU.pin1",
      "width": 0.4,
      "priority": 44.616,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "R209.pin1",
      "to": "R216.pin1",
      "width": 0.4,
      "priority": 44.665,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "R_USB_DATA_OFF.pin1",
      "to": "C_IO6.pin1",
      "width": 0.4,
      "priority": 44.742,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "R214.pin1",
      "to": "R216.pin1",
      "width": 0.4,
      "priority": 45.0,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "C_IO6.pin1",
      "to": "C_USB_SWITCH.pin1",
      "width": 0.4,
      "priority": 45.077,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "R_PD_SCL.pin1",
      "to": "R_ADC_SUPPLY.pin1",
      "width": 0.4,
      "priority": 45.282,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "R_OV_TOP.pin1",
      "to": "R_PD_VALID_PU.pin1",
      "width": 0.4,
      "priority": 45.397,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "R_AUX_LOSS_PU.pin1",
      "to": "C_AUX1.pin1",
      "width": 0.4,
      "priority": 45.95,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "R237.pin1",
      "to": "C223.pin1",
      "width": 0.4,
      "priority": 46.673,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "L_LOGIC.pin2",
      "to": "R_UV_TOP.pin1",
      "width": 0.4,
      "priority": 46.933,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "R_AUX_LOSS_PU.pin1",
      "to": "C_AUX2.pin1",
      "width": 0.4,
      "priority": 47.05,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "R237.pin1",
      "to": "TP03.pin1",
      "width": 0.4,
      "priority": 47.684,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "R_PD_SDA.pin1",
      "to": "C217.pin1",
      "width": 0.6,
      "priority": 48.412,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "C206.pin1",
      "to": "C216.pin1",
      "width": 0.6,
      "priority": 49.22,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "C206.pin1",
      "to": "C217.pin1",
      "width": 0.6,
      "priority": 50.078,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "R208.pin1",
      "to": "C208.pin1",
      "width": 0.6,
      "priority": 50.096000000000004,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "R214.pin1",
      "to": "C208.pin1",
      "width": 0.6,
      "priority": 50.274,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "C43.pin1",
      "to": "C_DBG2.pin1",
      "width": 0.6,
      "priority": 50.323,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "C207.pin1",
      "to": "C223.pin1",
      "width": 0.6,
      "priority": 50.47,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "R508.pin1",
      "to": "C_DBG1.pin1",
      "width": 0.6,
      "priority": 51.591,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "R233.pin1",
      "to": "C207.pin1",
      "width": 0.6,
      "priority": 51.819,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "R506.pin1",
      "to": "R508.pin1",
      "width": 0.6,
      "priority": 52.502,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "R506.pin1",
      "to": "C_AUX2.pin1",
      "width": 0.6,
      "priority": 52.615,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "C43.pin1",
      "to": "C_DBG1.pin1",
      "width": 0.6,
      "priority": 53.06,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "R233.pin1",
      "to": "C208.pin1",
      "width": 0.6,
      "priority": 54.03,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "C202.pin1",
      "to": "C_FLASH.pin1",
      "width": 0.6,
      "priority": 54.667,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "R216.pin1",
      "to": "R220.pin1",
      "width": 0.6,
      "priority": 55.033,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "R_INPUT_PG.pin1",
      "to": "C_AUX1.pin1",
      "width": 0.6,
      "priority": 55.052,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    },
    {
      "net": "V3V3",
      "from": "R503.pin1",
      "to": "C_AUX1.pin1",
      "width": 0.6,
      "priority": 55.38,
      "preferredLayers": [
        "top",
        "inner2",
        "bottom"
      ],
      "note": "Passive-endpoint rail distribution; neck at pads as required by clearance."
    }
  ],
  "notes": [
    "Inventory is Revision B ports.json: GND 191 pads/ports, V3V3 81, LOGIC_VIN 5, LOGIC_SW 3, LOGIC_BST 2. Supply edges span every listed port exactly within its net.",
    "GND uses the supplemental ground-completion.json finite-geometry plan rather than the point-to-point tree. Reserve its parallel power-return branches, source bridges and missing-pad escapes before ordinary signals; then connect remaining GND ports to the actual inner1 plane and audit all 191 ports through copper intersections and plated barrels.",
    "Ground preferred layers are inner1, top, bottom. Do not place vias directly on fine-pitch pads; find legal escapes against actual pad polygons and all other copper, holes, and board-edge clearances before adding vias. Keep plane antipads clear of unrelated through vias.",
    "The supplemental geometry gives U2.pin21 four 1.2 mm branches, U_MCU.pin57 one 0.4 mm branch plus its shared MCU19/57 ground return, and U_FLASH.pin9 two 0.2 mm branches to legal off-pad vias. The flash exposed pad is only 0.3 mm high. No via-in-pad fabrication exception is needed for these placement-checked candidates; rerun final copper clearance after reservation.",
    "Give each decoupling capacitor ground pad a nearby individual ground via and short return to its IC ground region. Preserve continuous return under USB, QSPI, clock, ADC and control traces; add nearby GND stitching at signal layer transitions without touching signal pads.",
    "Use multiple GND vias and wide local surface copper for Q21 source pads, U2 power grounds, TEC connector J_TEC.pin2, high-current capacitor returns and both USB connector shell/GND groups. A single thin escape is inadequate for power returns; keep switching and TEC return current local rather than through MCU/analog bypass stubs.",
    "Join analog and digital GND to the continuous plane without splitting it. Keep high-current and buck switch loops away from thermal/ADC and crystal returns. Stitch top/bottom GND copper to inner1 at board edges and connectors only where clearance permits; suppress isolated pour islands.",
    "V3V3 has explicit local bypass leaves and a constrained passive-endpoint minimum-distance distribution tree. IC fine-pitch pads are never transit nodes. RP2040, flash and USB-switch taps are 0.2 mm; ordinary supply taps are 0.4 mm and distribution trunks 0.6\u20130.8 mm. Parent must narrow local pad escapes where actual pad clearances require it.",
    "LOGIC_BST and LOGIC_SW request top-only routing. Other V3V3 distribution prefers top, inner2, bottom to preserve inner1 as a GND return plane. Priorities place bootstrap/switch loops and local bypass taps before distribution trunks.",
    "This is a connectivity and layer-preference plan, not a completed route or DRC result. Parent must synthesize legal geometry, ground plane/vias, verify all copper connectivity, enforce manufacturer clearances, and run shorts checks. No placement or source-net edits were made."
  ]
}
