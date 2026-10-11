/** Debug branches deliberately carry only indicator/probe current, never load current. */
export const debugRailIndicators = [
  { led: "D501", resistor: "R501", net: "VBUS_RAW", source: "C_USB_IN.pin1", label: "USB", resistance: "22k", x: -45, y: -6,
    resistorPosition: { x: -42.5, y: 19, rotation: 180 }, feedWaypoints: [] },
  { led: "D502", resistor: "R502", net: "VBUS_TEC", source: "C25.pin1", label: "IN", resistance: "22k", x: -39, y: -6,
    resistorPosition: { x: -8.35, y: 25.5, rotation: 180 }, feedWaypoints: [{ x: -7.6, y: 23.435 }] },
  { led: "D503", resistor: "R503", net: "V3V3", source: "C202.pin1", label: "3V3", resistance: "2.49k", x: -33, y: -6,
    resistorPosition: { x: -5.8, y: -8.7, rotation: 0 }, feedWaypoints: [{ x: -8, y: -8.7 }] },
  { led: "D504", resistor: "R504", net: "V12_FAN", source: "C215.pin1", label: "FAN12", resistance: "15k", x: -45, y: -12,
    resistorPosition: { x: 43.2, y: -21.2, rotation: 270 }, feedWaypoints: [{ x: 43.2, y: -19.765 }] },
  { led: "D505", resistor: "R505", net: "TEC_POS", source: "C29.pin1", label: "TEC+", resistance: "15k", x: -39, y: -12,
    resistorPosition: { x: 28.4, y: -8.4, rotation: 270 }, feedWaypoints: [{ x: 28.4, y: -5.269921 }] },
] as const

// Schmitt input loading isolates the actual hardware permission/clear nodes from LED current.
export const debugStatusIndicators = [
  { led: "D506", resistor: "R506", net: "DBG_PD_GATE", label: "PD", active: "low", x: -45, y: -18 },
  { led: "D507", resistor: "R507", net: "DBG_TEC_PERMIT", label: "ALLOW", active: "high", x: -39, y: -18 },
  { led: "D508", resistor: "R508", net: "DBG_HW_INHIBIT", label: "FAULT", active: "low", x: -31, y: -18 },
] as const

// All probes are exposed copper features, not purchased or fitted components.
// ADC probes are strictly downstream of the existing 1 kΩ resistors and RC filters.
export const debugTestPoints = [
  { name: "TP01", net: "VBUS_RAW", label: "USB", x: -39.72, y: 22, pickupSource: "C_USB_IN.pin1", pickupWaypoints: [] },
  { name: "TP02", net: "VBUS_TEC", label: "IN", x: -8, y: 32, labelX: -11.5, labelY: 33.35,
    pickupSource: "C25.pin1", pickupWaypoints: [{ x: -7.6, y: 31.6 }, { x: -7.6, y: 23.435 }] },
  { name: "TP03", net: "V3V3", label: "3V3", x: -28, y: -13, labelY: -14.65 },
  { name: "TP04", net: "V12_FAN", label: "FAN12", x: 40, y: -21.5, labelX: 42.5, labelY: -23.2 },
  { name: "TP05", net: "TEC_POS", label: "TEC+", x: 34, y: -4.669921, pickupSource: "C29.pin1", pickupWaypoints: [] },
  { name: "TP06", net: "HOT_ADC", label: "HT", x: 4.8, y: -0.7, labelY: -2.2, source: "C209.pin1" },
  { name: "TP07", net: "COLD_ADC", label: "CL", x: 7.8, y: -0.7, labelY: -2.2, source: "C210.pin1" },
  { name: "TP08", net: "VBUS_ADC", label: "VI", x: 10.8, y: -0.7, labelY: -2.2, source: "C211.pin1" },
  { name: "TP09", net: "VOUT_ADC", label: "VO", x: 13.8, y: -0.7, labelY: -2.2, source: "C212.pin1" },
  { name: "TP10", net: "I2C_SCL", label: "SCL", x: -1.5, y: -16.5 },
  { name: "TP11", net: "I2C_SDA", label: "SDA", x: 2.45, y: -16.5 },
  { name: "TP12", net: "TEC_DAC", label: "DAC", x: -3, y: -24, labelX: 0, labelY: -24 },
  { name: "TP13", net: "MCU_NRST", label: "RST", x: 21, y: -5 },
  { name: "TP14", net: "DBG_PD_GATE", label: "PD", x: -46, y: -23.5, labelY: -25.15 },
  { name: "TP15", net: "DBG_TEC_PERMIT", label: "EN", x: -38, y: -23.5 },
  { name: "TP16", net: "DBG_HW_INHIBIT", label: "CLR", x: -35, y: -28, labelY: -29.65 },
  { name: "TP17", net: "DBG_MCU_RUN", label: "RUN", x: -31, y: -28, labelY: -29.65 },
  { name: "TP18", net: "FAN_TACH_MCU", label: "TC", x: 32, y: -27 },
] as const

export const debugGroundTestPoints = [
  { name: "TPG1", x: -34, y: 29.5 },
  { name: "TPG2", x: -10, y: 30 },
  { name: "TPG3", x: -29.5, y: -10.5 },
  { name: "TPG4", x: 38, y: -23, labelY: -24.65 },
  { name: "TPG5", x: 38, y: 0 },
  { name: "TPG6", x: 18.5, y: -0.7 },
  { name: "TPG7", x: -5, y: -26.5, labelY: -28.15 },
  { name: "TPG8", x: -40, y: -28, labelX: -39.6, labelY: -29.65 },
] as const

export const debugBufferNets = ["DBG_PD_GATE", "DBG_TEC_PERMIT", "DBG_HW_INHIBIT", "DBG_MCU_RUN"] as const
export const debugLedAnodeNets = [...debugRailIndicators, ...debugStatusIndicators].map(item => `${item.led}_A`)
export const debugGroundPorts = [
  ...debugRailIndicators.map(item => `${item.led}.pin1`), "D507.pin1", "U_DBG1.pin2", "U_DBG2.pin2", "C_DBG1.pin2", "C_DBG2.pin2",
  ...debugGroundTestPoints.map(item => `${item.name}.pin1`),
] as const
