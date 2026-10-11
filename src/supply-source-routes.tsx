import { attachLogicSupplyInner2Port } from "./logic-supply-links"
import type { SourcePadConnectionPlan } from "./source-pad-connections"

// Genuine fitted-pad distribution paths, reviewed against the completed native4
// proposal. These declarations own fresh SOURCE identities and finite bounds.
export const supplySourceSpans = [
  {
    "name": "SUPPLY_FAN_MST0_0_SPAN_0",
    "net": "V12_FAN",
    "from": "R504.pin1",
    "to": "TP04.pin1",
    "thickness": 0.5,
    "maxLength": 3.6449999999999996,
    "pcbPathRelativeTo": "R504.pin1",
    "pcbPath": [
      "R504.pin1",
      {
        "x": 0.3000000000000009,
        "y": -1.0499999999999972
      },
      "TP04.pin1"
    ]
  },
  {
    "name": "SUPPLY_FAN_MST1_0_SPAN_0",
    "net": "V12_FAN",
    "from": "C221.pin1",
    "to": "TP04.pin1",
    "thickness": 0.5,
    "maxLength": 6.749,
    "pcbPathRelativeTo": "C221.pin1",
    "pcbPath": [
      "C221.pin1",
      {
        "x": -0.7199999999999989,
        "y": 0.5700000000000003
      },
      {
        "x": -0.35999999999999943,
        "y": 0.9299999999999997
      },
      {
        "x": 2.5700000000000003,
        "y": 0.9299999999999997
      },
      "TP04.pin1"
    ]
  },
  {
    "name": "SUPPLY_V3_MST0_0_SPAN_0",
    "net": "V3V3",
    "from": "R214.pin1",
    "to": "R216.pin1",
    "thickness": 0.2,
    "maxLength": 2.5309999999999997,
    "pcbPathRelativeTo": "R214.pin1",
    "pcbPath": [
      "R214.pin1",
      {
        "x": -0.8000000000000007,
        "y": 0.05000000000000071
      },
      "R216.pin1"
    ]
  },
  {
    "name": "SUPPLY_V3_MST1_0_SPAN_0",
    "net": "V3V3",
    "from": "Q_FAULT_SOURCE.pin2",
    "to": "R233.pin1",
    "thickness": 0.2,
    "maxLength": 2.6849999999999996,
    "pcbPathRelativeTo": "Q_FAULT_SOURCE.pin2",
    "pcbPath": [
      "Q_FAULT_SOURCE.pin2",
      {
        "x": 1.0,
        "y": 0.75
      },
      "R233.pin1"
    ]
  },
  {
    "name": "SUPPLY_V3_MST2_0_SPAN_0",
    "net": "V3V3",
    "from": "L_LOGIC.pin2",
    "to": "C202.pin1",
    "thickness": 0.2,
    "maxLength": 2.892,
    "pcbPathRelativeTo": "L_LOGIC.pin2",
    "pcbPath": [
      "L_LOGIC.pin2",
      {
        "x": 2.42,
        "y": -0.9199999999999999
      },
      "C202.pin1"
    ]
  },
  {
    "name": "SUPPLY_V3_MST3_0_SPAN_0",
    "net": "V3V3",
    "from": "R508.pin1",
    "to": "U_DBG2.pin5",
    "thickness": 0.2,
    "maxLength": 3.831,
    "pcbPathRelativeTo": "R508.pin1",
    "pcbPath": [
      "R508.pin1",
      {
        "x": -0.7500000000000001,
        "y": 1.9249999999999972
      },
      {
        "x": -1.8249999999999995,
        "y": 3.0
      },
      "U_DBG2.pin5"
    ]
  },
  {
    "name": "SUPPLY_V3_MST4_0_SPAN_0",
    "net": "V3V3",
    "from": "R214.pin1",
    "to": "R220.pin1",
    "thickness": 0.2,
    "maxLength": 4.818,
    "pcbPathRelativeTo": "R214.pin1",
    "pcbPath": [
      "R214.pin1",
      {
        "x": 0.0,
        "y": -0.75
      },
      {
        "x": 0.0,
        "y": -2.8000000000000007
      },
      "R220.pin1"
    ]
  },
  {
    "name": "SUPPLY_V3_MST5_0_SPAN_0",
    "net": "V3V3",
    "from": "U_LATCH.pin8",
    "to": "C207.pin1",
    "thickness": 0.2,
    "maxLength": 6.6,
    "pcbPathRelativeTo": "U_LATCH.pin8",
    "pcbPath": [
      "U_LATCH.pin8",
      {
        "x": -1.0499999999999998,
        "y": -1.25
      },
      {
        "x": 2.0,
        "y": -1.25
      },
      {
        "x": 2.0,
        "y": -3.8000000000000007
      },
      "C207.pin1"
    ]
  },
  {
    "name": "SUPPLY_V3_MST6_0_SPAN_0",
    "net": "V3V3",
    "from": "R208.pin1",
    "to": "C207.pin1",
    "thickness": 0.2,
    "maxLength": 7.092,
    "pcbPathRelativeTo": "R208.pin1",
    "pcbPath": [
      "R208.pin1",
      {
        "x": -0.05000000000000071,
        "y": 0.75
      },
      {
        "x": -0.05000000000000071,
        "y": 2.5
      },
      {
        "x": -0.75,
        "y": 3.1999999999999993
      },
      {
        "x": -2.9000000000000004,
        "y": 3.1999999999999993
      },
      "C207.pin1"
    ]
  },
  {
    "name": "SUPPLY_V3_MST7_0_SPAN_0",
    "net": "V3V3",
    "from": "C207.pin1",
    "to": "C216.pin1",
    "thickness": 0.2,
    "maxLength": 5.971,
    "pcbPathRelativeTo": "C207.pin1",
    "pcbPath": [
      "C207.pin1",
      {
        "x": -0.9749999999999996,
        "y": -0.2749999999999986
      },
      {
        "x": -2.7,
        "y": -0.2749999999999986
      },
      {
        "x": -4.2,
        "y": -1.7749999999999986
      },
      "C216.pin1"
    ]
  },
  {
    "name": "SUPPLY_V3_MST8_0_SPAN_0",
    "net": "V3V3",
    "from": "U_THERMAL.pin8",
    "to": "R233.pin1",
    "thickness": 0.2,
    "maxLength": 6.191,
    "pcbPathRelativeTo": "U_THERMAL.pin8",
    "pcbPath": [
      "U_THERMAL.pin8",
      {
        "x": -1.9050000000000011,
        "y": 0.4750000000000014
      },
      {
        "x": -2.16,
        "y": 0.21999999999999886
      },
      {
        "x": -4.030000000000001,
        "y": 0.21999999999999886
      },
      "R233.pin1"
    ]
  },
  {
    "name": "SUPPLY_V3_MST9_0_SPAN_0",
    "net": "V3V3",
    "from": "R209.pin1",
    "to": "R220.pin1",
    "thickness": 0.2,
    "maxLength": 5.657,
    "pcbPathRelativeTo": "R209.pin1",
    "pcbPath": [
      "R209.pin1",
      {
        "x": -0.019999999999999574,
        "y": -0.7800000000000011
      },
      {
        "x": 3.4200000000000017,
        "y": -0.7800000000000011
      },
      "R220.pin1"
    ]
  },
  {
    "name": "SUPPLY_V3_MST10_0_SPAN_0",
    "net": "V3V3",
    "from": "U_DAC.pin3",
    "to": "C206.pin1",
    "thickness": 0.2,
    "maxLength": 6.064,
    "pcbPathRelativeTo": "U_DAC.pin3",
    "pcbPath": [
      "U_DAC.pin3",
      {
        "x": 0.95,
        "y": -1.7749999999999986
      },
      {
        "x": 0.45,
        "y": -2.2749999999999986
      },
      {
        "x": -3.425,
        "y": -2.2749999999999986
      },
      "C206.pin1"
    ]
  },
  {
    "name": "SUPPLY_V3_MST11_0_SPAN_0",
    "net": "V3V3",
    "from": "U_THERMAL.pin8",
    "to": "C208.pin1",
    "thickness": 0.2,
    "maxLength": 6.162999999999999,
    "pcbPathRelativeTo": "U_THERMAL.pin8",
    "pcbPath": [
      "U_THERMAL.pin8",
      {
        "x": -1.9050000000000011,
        "y": 3.5450000000000017
      },
      {
        "x": -1.6550000000000011,
        "y": 3.7950000000000017
      },
      {
        "x": 1.5949999999999989,
        "y": 3.7950000000000017
      },
      "C208.pin1"
    ]
  },
  {
    "name": "SUPPLY_V3_MST12_0_SPAN_0",
    "net": "V3V3",
    "from": "U_CLEAR_BUFFER.pin5",
    "to": "CLOCK_VCC_ESCAPE.top",
    "thickness": 0.2,
    "maxLength": 8.931,
    "pcbPathRelativeTo": "U_CLEAR_BUFFER.pin5",
    "pcbPath": [
      "U_CLEAR_BUFFER.pin5",
      {
        "x": -0.14999999999999858,
        "y": 1.1500000000000004
      },
      {
        "x": -0.14999999999999858,
        "y": 0.8000000000000007
      },
      {
        "x": -3.3999999999999986,
        "y": -2.4499999999999993
      },
      {
        "x": -3.3999999999999986,
        "y": -4.25
      },
      {
        "x": -1.6499999999999986,
        "y": -4.25
      },
      "CLOCK_VCC_ESCAPE.top"
    ]
  },
  {
    "name": "SUPPLY_V3_MST13_0_SPAN_0",
    "net": "V3V3",
    "from": "U_LATCH.pin8",
    "to": "U_DAC.pin3",
    "thickness": 0.2,
    "maxLength": 6.721,
    "pcbPathRelativeTo": "U_LATCH.pin8",
    "pcbPath": [
      "U_LATCH.pin8",
      {
        "x": -3.7,
        "y": -0.75
      },
      {
        "x": -4.0,
        "y": -1.0500000000000007
      },
      {
        "x": -4.0,
        "y": -1.9499999999999993
      },
      {
        "x": -4.45,
        "y": -2.3999999999999986
      },
      "U_DAC.pin3"
    ]
  },
  {
    "name": "SUPPLY_V3_MST14_0_SPAN_0",
    "net": "V3V3",
    "from": "Q_FAULT_SOURCE.pin2",
    "to": "C207.pin1",
    "thickness": 0.2,
    "maxLength": 6.008,
    "pcbPathRelativeTo": "Q_FAULT_SOURCE.pin2",
    "pcbPath": [
      "Q_FAULT_SOURCE.pin2",
      {
        "x": 1.0,
        "y": 0.6750000000000007
      },
      {
        "x": -0.4250000000000007,
        "y": -0.75
      },
      {
        "x": -0.9499999999999993,
        "y": -0.75
      },
      "C207.pin1"
    ]
  },
  {
    "name": "SUPPLY_V3_MST15_0_SPAN_0",
    "net": "V3V3",
    "from": "R216.pin1",
    "to": "C208.pin1",
    "thickness": 0.2,
    "maxLength": 6.505,
    "pcbPathRelativeTo": "R216.pin1",
    "pcbPath": [
      "R216.pin1",
      {
        "x": -3.1999999999999993,
        "y": 2.3999999999999986
      },
      "C208.pin1"
    ]
  },
  {
    "name": "SUPPLY_V3_MST16_0_SPAN_0",
    "net": "V3V3",
    "from": "U_LATCH.pin8",
    "to": "C204.pin1",
    "thickness": 0.2,
    "maxLength": 7.35,
    "pcbPathRelativeTo": "U_LATCH.pin8",
    "pcbPath": [
      "U_LATCH.pin8",
      {
        "x": -1.4000000000000004,
        "y": -0.75
      },
      {
        "x": -0.7999999999999998,
        "y": -0.14999999999999858
      },
      {
        "x": -0.7999999999999998,
        "y": 1.1000000000000014
      },
      {
        "x": -3.0,
        "y": 3.3000000000000007
      },
      "C204.pin1"
    ]
  },
  {
    "name": "SUPPLY_V3_MST17_0_SPAN_0",
    "net": "V3V3",
    "from": "U_LOGIC.pin1",
    "to": "L_LOGIC.pin2",
    "thickness": 0.2,
    "maxLength": 7.705,
    "pcbPathRelativeTo": "U_LOGIC.pin1",
    "pcbPath": [
      "U_LOGIC.pin1",
      {
        "x": -1.6500000000000004,
        "y": -0.40000000000000036
      },
      {
        "x": -1.6500000000000004,
        "y": 1.75
      },
      {
        "x": 1.5,
        "y": 4.9
      },
      "L_LOGIC.pin2"
    ]
  },
  {
    "name": "SUPPLY_V3_MST18_0_SPAN_0",
    "net": "V3V3",
    "from": "U_CLEAR_BUFFER.pin5",
    "to": "INPUT_CLEAR_PULLUP_VCC_ESCAPE.top",
    "thickness": 0.2,
    "maxLength": 8.336,
    "pcbPathRelativeTo": "U_CLEAR_BUFFER.pin5",
    "pcbPath": [
      "U_CLEAR_BUFFER.pin5",
      {
        "x": 0.0,
        "y": 1.8499999999999996
      },
      {
        "x": -0.8000000000000007,
        "y": 2.6500000000000004
      },
      {
        "x": -3.1000000000000014,
        "y": 2.6500000000000004
      },
      {
        "x": -3.5500000000000007,
        "y": 3.0999999999999996
      },
      {
        "x": -3.5500000000000007,
        "y": 4.050000000000001
      },
      "INPUT_CLEAR_PULLUP_VCC_ESCAPE.top"
    ]
  },
  {
    "name": "SUPPLY_V3_MST19_0_SPAN_0",
    "net": "V3V3",
    "from": "C216.pin1",
    "to": "J_SWD.pin1",
    "thickness": 0.2,
    "maxLength": 7.402,
    "pcbPathRelativeTo": "C216.pin1",
    "pcbPath": [
      "C216.pin1",
      {
        "x": -0.9499999999999993,
        "y": 0.0
      },
      "J_SWD.pin1"
    ]
  },
  {
    "name": "SUPPLY_V3_MST20_0_SPAN_0",
    "net": "V3V3",
    "from": "R200.pin1",
    "to": "C204.pin1",
    "thickness": 0.2,
    "maxLength": 11.712,
    "pcbPathRelativeTo": "R200.pin1",
    "pcbPath": [
      "R200.pin1",
      {
        "x": -0.7999999999999998,
        "y": -1.2999999999999998
      },
      {
        "x": 1.0,
        "y": -3.0999999999999996
      },
      {
        "x": 1.5999999999999996,
        "y": -3.0999999999999996
      },
      {
        "x": 2.4000000000000004,
        "y": -3.9000000000000004
      },
      {
        "x": 2.4000000000000004,
        "y": -5.850000000000001
      },
      {
        "x": 0.8699999999999992,
        "y": -5.850000000000001
      },
      "C204.pin1"
    ]
  },
  {
    "name": "SUPPLY_V3_MST21_0_SPAN_0",
    "net": "V3V3",
    "from": "CLOCK_VCC_ESCAPE.top",
    "to": "R508.pin1",
    "thickness": 0.2,
    "maxLength": 8.401,
    "pcbPathRelativeTo": "CLOCK_VCC_ESCAPE.top",
    "pcbPath": [
      "CLOCK_VCC_ESCAPE.top",
      {
        "x": -2.1499999999999986,
        "y": -2.1499999999999986
      },
      "R508.pin1"
    ]
  },
  {
    "name": "SUPPLY_V3_MST22_0_SPAN_0",
    "net": "V3V3",
    "from": "U_LOGIC.pin1",
    "to": "U_CLEAR_BUFFER.pin5",
    "thickness": 0.2,
    "maxLength": 9.927999999999999,
    "pcbPathRelativeTo": "U_LOGIC.pin1",
    "pcbPath": [
      "U_LOGIC.pin1",
      {
        "x": -8.75,
        "y": -1.0999999999999996
      },
      {
        "x": -10.0,
        "y": -2.3499999999999996
      },
      "U_CLEAR_BUFFER.pin5"
    ]
  },
  {
    "name": "SUPPLY_V3_MST23_0_SPAN_0",
    "net": "V3V3",
    "from": "R_PD_SDA.pin1",
    "to": "INPUT_CLEAR_PULLUP_VCC_ESCAPE.top",
    "thickness": 0.2,
    "maxLength": 11.039,
    "pcbPathRelativeTo": "R_PD_SDA.pin1",
    "pcbPath": [
      "R_PD_SDA.pin1",
      {
        "x": -6.25,
        "y": 5.5
      },
      "INPUT_CLEAR_PULLUP_VCC_ESCAPE.top"
    ]
  },
  {
    "name": "SUPPLY_V3_MST24_0_SPAN_0",
    "net": "V3V3",
    "from": "R506.pin1",
    "to": "U_DBG2.pin5",
    "thickness": 0.2,
    "maxLength": 12.304,
    "pcbPathRelativeTo": "R506.pin1",
    "pcbPath": [
      "R506.pin1",
      {
        "x": -0.7499999999999999,
        "y": -0.9500000000000028
      },
      {
        "x": -1.3000000000000007,
        "y": -1.5
      },
      {
        "x": -1.3000000000000005,
        "y": -4.799999999999997
      },
      {
        "x": -1.4999999999999998,
        "y": -5.0
      },
      {
        "x": -1.4999999999999996,
        "y": -9.0
      },
      {
        "x": -1.3,
        "y": -9.200000000000003
      },
      {
        "x": -1.3,
        "y": -11.0
      },
      "U_DBG2.pin5"
    ]
  },
  {
    "name": "SUPPLY_V3_MST25_0_SPAN_0",
    "net": "V3V3",
    "from": "R_PD_SDA.pin1",
    "to": "R_PD_VALID.pin1",
    "thickness": 0.2,
    "maxLength": 15.899,
    "pcbPathRelativeTo": "R_PD_SDA.pin1",
    "pcbPath": [
      "R_PD_SDA.pin1",
      {
        "x": 0.7500000000000001,
        "y": -1.5
      },
      {
        "x": 6.25,
        "y": -1.4999999999999996
      },
      {
        "x": 9.5,
        "y": 1.7500000000000007
      },
      {
        "x": 9.5,
        "y": 3.300000000000001
      },
      "R_PD_VALID.pin1"
    ]
  },
  {
    "name": "SUPPLY_V3_MST26_0_SPAN_0",
    "net": "V3V3",
    "from": "U_LOGIC.pin1",
    "to": "C206.pin1",
    "thickness": 0.2,
    "maxLength": 14.265,
    "pcbPathRelativeTo": "U_LOGIC.pin1",
    "pcbPath": [
      "U_LOGIC.pin1",
      {
        "x": -0.9499999999999993,
        "y": -1.5500000000000007
      },
      {
        "x": 2.25,
        "y": -4.75
      },
      {
        "x": 3.75,
        "y": -4.75
      },
      {
        "x": 5.5,
        "y": -6.5
      },
      {
        "x": 5.5,
        "y": -7.75
      },
      {
        "x": 6.099999999999997,
        "y": -7.75
      },
      {
        "x": 7.8,
        "y": -9.450000000000003
      },
      "C206.pin1"
    ]
  },
  {
    "name": "SUPPLY_V3_MST27_0_SPAN_0",
    "net": "V3V3",
    "from": "C208.pin1",
    "to": "SUPPLY_V3_MST27_0_VIA_0.top",
    "thickness": 0.2,
    "maxLength": 2.6839999999999997,
    "pcbPathRelativeTo": "C208.pin1",
    "pcbPath": [
      "C208.pin1",
      {
        "x": -0.6999999999999993,
        "y": 1.0340000000000007
      },
      "SUPPLY_V3_MST27_0_VIA_0.top"
    ]
  },
  {
    "name": "SUPPLY_V3_MST27_0_SPAN_1",
    "net": "V3V3",
    "from": "SUPPLY_V3_MST27_0_VIA_0.inner2",
    "to": "FAN_ENABLE_VCC_ESCAPE.inner2",
    "thickness": 0.2,
    "maxLength": 14.461,
    "pcbPathRelativeTo": "SUPPLY_V3_MST27_0_VIA_0.inner2",
    "pcbPath": [
      "SUPPLY_V3_MST27_0_VIA_0.inner2",
      {
        "x": 0.0,
        "y": 0.9659999999999958
      },
      {
        "x": 4.091000000000005,
        "y": 5.057
      },
      {
        "x": 8.890999999999995,
        "y": 5.057
      },
      "FAN_ENABLE_VCC_ESCAPE.inner2"
    ]
  },
  {
    "name": "SUPPLY_V3_MST28_0_SPAN_0",
    "net": "V3V3",
    "from": "CLOCK_VCC_ESCAPE.inner2",
    "to": "J_UART.pin4",
    "thickness": 0.2,
    "maxLength": 14.325,
    "pcbPathRelativeTo": "CLOCK_VCC_ESCAPE.inner2",
    "pcbPath": [
      "CLOCK_VCC_ESCAPE.inner2",
      {
        "x": 2.8500000000000014,
        "y": -2.849999999999998
      },
      {
        "x": 2.8500000000000014,
        "y": -10.800030999999997
      },
      "J_UART.pin4"
    ]
  },
  {
    "name": "SUPPLY_V3_MST29_0_SPAN_0",
    "net": "V3V3",
    "from": "R_PD_VALID.pin1",
    "to": "SUPPLY_V3_MST29_0_VIA_0.top",
    "thickness": 0.2,
    "maxLength": 3.4349999999999996,
    "pcbPathRelativeTo": "R_PD_VALID.pin1",
    "pcbPath": [
      "R_PD_VALID.pin1",
      {
        "x": -0.8000000000000007,
        "y": 0.7419999999999973
      },
      "SUPPLY_V3_MST29_0_VIA_0.top"
    ]
  },
  {
    "name": "SUPPLY_V3_MST29_0_SPAN_1",
    "net": "V3V3",
    "from": "SUPPLY_V3_MST29_0_VIA_0.inner2",
    "to": "LOGIC_ALERT_INPUT_VIA.inner2",
    "thickness": 0.2,
    "maxLength": 14.426466663,
    "pcbPathRelativeTo": "SUPPLY_V3_MST29_0_VIA_0.inner2",
    "pcbPath": [
      "SUPPLY_V3_MST29_0_VIA_0.inner2",
      {
        "x": -0.735000000000003,
        "y": 0.735000000000003
      },
      {
        "x": -0.735,
        "y": 12.498
      },
      "LOGIC_ALERT_INPUT_VIA.inner2"
    ]
  }
]

const supplySourceBarrels = [
  {
    "name": "SUPPLY_V3_MST27_0_VIA_0",
    "x": 24.959,
    "y": -12.807,
    "holeDiameter": 0.3,
    "outerDiameter": 0.7,
    "net": "V3V3"
  },
  {
    "name": "SUPPLY_V3_MST29_0_VIA_0",
    "x": -24.903,
    "y": 14.139,
    "holeDiameter": 0.3,
    "outerDiameter": 0.7,
    "net": "V3V3"
  }
]

export const supplyCompleteRailPlans: readonly SourcePadConnectionPlan[] = [
  {
    "name": "V3_COMPLETE_SOURCE_RAIL",
    "net": "V3V3",
    "from": "R_PD_SCL.pin1",
    "to": "CLOCK_VCC_ESCAPE.top",
    "traces": [
      "PD_SCL_VALID_V3_TRUNK",
      "R_PD_SCL_A",
      "R_PD_VALID_A",
      "CLEAR_BUFFER_BYPASS",
      "CLOCK_BUFFER_BYPASS",
      "INPUT_LATCH_V3_TRUNK",
      "CLEAR_BUFFER_V3_TRUNK",
      "CLOCK_VCC_OFF_PAD",
      "INPUT_CLEAR_PULLUP_VCC_OFF_PAD",
      "FAN_ENABLE_VCC_OFF_PAD",
      "D503_RAIL_FEED",
      "DBG_BUFFER_VCC_BRIDGE",
      "DBG1_BYPASS",
      "DBG2_BYPASS",
      "ALERT_PD_VCC_LAUNCH",
      "ALERT_INNER2_TRUNK",
      "ALERT_INPUT_VCC_LAUNCH",
      "MON_C43_BYPASS",
      "MON_VCC_LAUNCH",
      "MON_FAN_INNER2_TRUNK",
      "LATCH_STATIC_V3_78",
      "LATCH_STATIC_V3_27",
      "INPUT_STATIC_V3_78",
      "INPUT_STATIC_V3_27",
      "MCU_C203_V3_BYPASS",
      "MCU_C204_V3_BANK",
      "INPUT_C217_V3_BYPASS",
      "SUPERVISOR_C216_V3_BYPASS",
      "SUPPLY_V3_MST0_0_SPAN_0",
      "SUPPLY_V3_MST1_0_SPAN_0",
      "SUPPLY_V3_MST2_0_SPAN_0",
      "SUPPLY_V3_MST3_0_SPAN_0",
      "SUPPLY_V3_MST4_0_SPAN_0",
      "SUPPLY_V3_MST5_0_SPAN_0",
      "SUPPLY_V3_MST6_0_SPAN_0",
      "SUPPLY_V3_MST7_0_SPAN_0",
      "SUPPLY_V3_MST8_0_SPAN_0",
      "SUPPLY_V3_MST9_0_SPAN_0",
      "SUPPLY_V3_MST10_0_SPAN_0",
      "SUPPLY_V3_MST11_0_SPAN_0",
      "SUPPLY_V3_MST12_0_SPAN_0",
      "SUPPLY_V3_MST13_0_SPAN_0",
      "SUPPLY_V3_MST14_0_SPAN_0",
      "SUPPLY_V3_MST15_0_SPAN_0",
      "SUPPLY_V3_MST16_0_SPAN_0",
      "SUPPLY_V3_MST17_0_SPAN_0",
      "SUPPLY_V3_MST18_0_SPAN_0",
      "SUPPLY_V3_MST19_0_SPAN_0",
      "SUPPLY_V3_MST20_0_SPAN_0",
      "SUPPLY_V3_MST21_0_SPAN_0",
      "SUPPLY_V3_MST22_0_SPAN_0",
      "SUPPLY_V3_MST23_0_SPAN_0",
      "SUPPLY_V3_MST24_0_SPAN_0",
      "SUPPLY_V3_MST25_0_SPAN_0",
      "SUPPLY_V3_MST26_0_SPAN_0",
      "SUPPLY_V3_MST27_0_SPAN_0",
      "SUPPLY_V3_MST27_0_SPAN_1",
      "SUPPLY_V3_MST28_0_SPAN_0",
      "SUPPLY_V3_MST29_0_SPAN_0",
      "SUPPLY_V3_MST29_0_SPAN_1"
    ],
    "requiredSelectors": [
      "R_PD_SCL.pin1",
      "R_PD_SDA.pin1",
      "R_PD_ALERT.pin1",
      "R_PD_VALID.pin1",
      "R_INPUT_FAULT.pin1",
      "U_TEC_MON.pin5",
      "C43.pin1",
      "U_LOGIC.pin1",
      "L_LOGIC.pin2",
      "U_MCU.pin4",
      "U_LATCH.pin2",
      "U_LATCH.pin7",
      "U_LATCH.pin8",
      "U_SUPERVISOR.pin3",
      "U_INPUT_LATCH.pin2",
      "U_INPUT_LATCH.pin7",
      "U_INPUT_LATCH.pin8",
      "Q_FAULT_SOURCE.pin2",
      "U_CLEAR_BUFFER.pin5",
      "U_CLOCK_BUFFER.pin5",
      "U_DAC.pin3",
      "U_THERMAL.pin8",
      "U_FAN.pin5",
      "J_SWD.pin1",
      "J_UART.pin4",
      "R200.pin1",
      "R208.pin1",
      "R209.pin1",
      "R214.pin1",
      "R216.pin1",
      "R220.pin1",
      "R233.pin1",
      "R237.pin1",
      "C202.pin1",
      "C203.pin1",
      "C204.pin1",
      "C206.pin1",
      "C207.pin1",
      "C208.pin1",
      "C216.pin1",
      "C217.pin1",
      "C222.pin1",
      "C223.pin1",
      "R503.pin1",
      "R506.pin1",
      "R508.pin1",
      "U_DBG1.pin5",
      "U_DBG2.pin5",
      "C_DBG1.pin1",
      "C_DBG2.pin1",
      "TP03.pin1"
    ],
    "branchEndpoints": {
      "PD_SCL_VALID_V3_TRUNK": [
        "PD_SCL_V3_VIA.inner2",
        "PD_VALID_V3_VIA.inner2"
      ],
      "R_PD_SCL_A": [
        "R_PD_SCL.pin1",
        "PD_SCL_V3_VIA.top"
      ],
      "R_PD_VALID_A": [
        "R_PD_VALID.pin1",
        "PD_VALID_V3_VIA.top"
      ],
      "CLEAR_BUFFER_BYPASS": [
        "C222.pin1",
        "U_CLEAR_BUFFER.pin5"
      ],
      "CLOCK_BUFFER_BYPASS": [
        "C223.pin1",
        "U_CLOCK_BUFFER.pin5"
      ],
      "INPUT_LATCH_V3_TRUNK": [
        "C223.pin1",
        "U_INPUT_LATCH.pin7"
      ],
      "CLEAR_BUFFER_V3_TRUNK": [
        "TP03.pin1",
        "U_CLEAR_BUFFER.pin5"
      ],
      "CLOCK_VCC_OFF_PAD": [
        "U_CLOCK_BUFFER.pin5",
        "CLOCK_VCC_ESCAPE.top"
      ],
      "INPUT_CLEAR_PULLUP_VCC_OFF_PAD": [
        "R237.pin1",
        "INPUT_CLEAR_PULLUP_VCC_ESCAPE.top"
      ],
      "FAN_ENABLE_VCC_OFF_PAD": [
        "U_FAN.pin5",
        "FAN_ENABLE_VCC_ESCAPE.top"
      ],
      "D503_RAIL_FEED": [
        "R503.pin1",
        "C202.pin1"
      ],
      "DBG_BUFFER_VCC_BRIDGE": [
        "U_DBG1.pin5",
        "U_DBG2.pin5"
      ],
      "DBG1_BYPASS": [
        "C_DBG1.pin1",
        "U_DBG1.pin5"
      ],
      "DBG2_BYPASS": [
        "C_DBG2.pin1",
        "U_DBG2.pin5"
      ],
      "ALERT_PD_VCC_LAUNCH": [
        "LOGIC_ALERT_PD_VIA.top",
        "R_PD_ALERT.pin1"
      ],
      "ALERT_INNER2_TRUNK": [
        "LOGIC_ALERT_PD_VIA.inner2",
        "LOGIC_ALERT_INPUT_VIA.inner2"
      ],
      "ALERT_INPUT_VCC_LAUNCH": [
        "LOGIC_ALERT_INPUT_VIA.top",
        "R_INPUT_FAULT.pin1"
      ],
      "MON_C43_BYPASS": [
        "C43.pin1",
        "U_TEC_MON.VS"
      ],
      "MON_VCC_LAUNCH": [
        "LOGIC_MON_VIA.top",
        "U_TEC_MON.pin5"
      ],
      "MON_FAN_INNER2_TRUNK": [
        "LOGIC_MON_VIA.inner2",
        "FAN_ENABLE_VCC_ESCAPE.inner2"
      ],
      "LATCH_STATIC_V3_78": [
        "U_LATCH.pin7",
        "U_LATCH.pin8"
      ],
      "LATCH_STATIC_V3_27": [
        "U_LATCH.pin2",
        "U_LATCH.pin7"
      ],
      "INPUT_STATIC_V3_78": [
        "U_INPUT_LATCH.pin7",
        "U_INPUT_LATCH.pin8"
      ],
      "INPUT_STATIC_V3_27": [
        "U_INPUT_LATCH.pin2",
        "U_INPUT_LATCH.pin7"
      ],
      "MCU_C203_V3_BYPASS": [
        "U_MCU.pin4",
        "C203.pin1"
      ],
      "MCU_C204_V3_BANK": [
        "C203.pin1",
        "C204.pin1"
      ],
      "INPUT_C217_V3_BYPASS": [
        "U_INPUT_LATCH.pin8",
        "C217.pin1"
      ],
      "SUPERVISOR_C216_V3_BYPASS": [
        "U_SUPERVISOR.pin3",
        "C216.pin1"
      ],
      "SUPPLY_V3_MST0_0_SPAN_0": [
        "R214.pin1",
        "R216.pin1"
      ],
      "SUPPLY_V3_MST1_0_SPAN_0": [
        "Q_FAULT_SOURCE.pin2",
        "R233.pin1"
      ],
      "SUPPLY_V3_MST2_0_SPAN_0": [
        "L_LOGIC.pin2",
        "C202.pin1"
      ],
      "SUPPLY_V3_MST3_0_SPAN_0": [
        "R508.pin1",
        "U_DBG2.pin5"
      ],
      "SUPPLY_V3_MST4_0_SPAN_0": [
        "R214.pin1",
        "R220.pin1"
      ],
      "SUPPLY_V3_MST5_0_SPAN_0": [
        "U_LATCH.pin8",
        "C207.pin1"
      ],
      "SUPPLY_V3_MST6_0_SPAN_0": [
        "R208.pin1",
        "C207.pin1"
      ],
      "SUPPLY_V3_MST7_0_SPAN_0": [
        "C207.pin1",
        "C216.pin1"
      ],
      "SUPPLY_V3_MST8_0_SPAN_0": [
        "U_THERMAL.pin8",
        "R233.pin1"
      ],
      "SUPPLY_V3_MST9_0_SPAN_0": [
        "R209.pin1",
        "R220.pin1"
      ],
      "SUPPLY_V3_MST10_0_SPAN_0": [
        "U_DAC.pin3",
        "C206.pin1"
      ],
      "SUPPLY_V3_MST11_0_SPAN_0": [
        "U_THERMAL.pin8",
        "C208.pin1"
      ],
      "SUPPLY_V3_MST12_0_SPAN_0": [
        "U_CLEAR_BUFFER.pin5",
        "CLOCK_VCC_ESCAPE.top"
      ],
      "SUPPLY_V3_MST13_0_SPAN_0": [
        "U_LATCH.pin8",
        "U_DAC.pin3"
      ],
      "SUPPLY_V3_MST14_0_SPAN_0": [
        "Q_FAULT_SOURCE.pin2",
        "C207.pin1"
      ],
      "SUPPLY_V3_MST15_0_SPAN_0": [
        "R216.pin1",
        "C208.pin1"
      ],
      "SUPPLY_V3_MST16_0_SPAN_0": [
        "U_LATCH.pin8",
        "C204.pin1"
      ],
      "SUPPLY_V3_MST17_0_SPAN_0": [
        "U_LOGIC.pin1",
        "L_LOGIC.pin2"
      ],
      "SUPPLY_V3_MST18_0_SPAN_0": [
        "U_CLEAR_BUFFER.pin5",
        "INPUT_CLEAR_PULLUP_VCC_ESCAPE.top"
      ],
      "SUPPLY_V3_MST19_0_SPAN_0": [
        "C216.pin1",
        "J_SWD.pin1"
      ],
      "SUPPLY_V3_MST20_0_SPAN_0": [
        "R200.pin1",
        "C204.pin1"
      ],
      "SUPPLY_V3_MST21_0_SPAN_0": [
        "CLOCK_VCC_ESCAPE.top",
        "R508.pin1"
      ],
      "SUPPLY_V3_MST22_0_SPAN_0": [
        "U_LOGIC.pin1",
        "U_CLEAR_BUFFER.pin5"
      ],
      "SUPPLY_V3_MST23_0_SPAN_0": [
        "R_PD_SDA.pin1",
        "INPUT_CLEAR_PULLUP_VCC_ESCAPE.top"
      ],
      "SUPPLY_V3_MST24_0_SPAN_0": [
        "R506.pin1",
        "U_DBG2.pin5"
      ],
      "SUPPLY_V3_MST25_0_SPAN_0": [
        "R_PD_SDA.pin1",
        "R_PD_VALID.pin1"
      ],
      "SUPPLY_V3_MST26_0_SPAN_0": [
        "U_LOGIC.pin1",
        "C206.pin1"
      ],
      "SUPPLY_V3_MST27_0_SPAN_0": [
        "C208.pin1",
        "SUPPLY_V3_MST27_0_VIA_0.top"
      ],
      "SUPPLY_V3_MST27_0_SPAN_1": [
        "SUPPLY_V3_MST27_0_VIA_0.inner2",
        "FAN_ENABLE_VCC_ESCAPE.inner2"
      ],
      "SUPPLY_V3_MST28_0_SPAN_0": [
        "CLOCK_VCC_ESCAPE.inner2",
        "J_UART.pin4"
      ],
      "SUPPLY_V3_MST29_0_SPAN_0": [
        "R_PD_VALID.pin1",
        "SUPPLY_V3_MST29_0_VIA_0.top"
      ],
      "SUPPLY_V3_MST29_0_SPAN_1": [
        "SUPPLY_V3_MST29_0_VIA_0.inner2",
        "LOGIC_ALERT_INPUT_VIA.inner2"
      ]
    },
    "traceWidths": {
      "PD_SCL_VALID_V3_TRUNK": 0.2,
      "R_PD_SCL_A": 0.2,
      "R_PD_VALID_A": 0.2,
      "CLEAR_BUFFER_BYPASS": 0.2,
      "CLOCK_BUFFER_BYPASS": 0.2,
      "INPUT_LATCH_V3_TRUNK": 0.2,
      "CLEAR_BUFFER_V3_TRUNK": 0.2,
      "CLOCK_VCC_OFF_PAD": 0.2,
      "INPUT_CLEAR_PULLUP_VCC_OFF_PAD": 0.2,
      "FAN_ENABLE_VCC_OFF_PAD": 0.2,
      "D503_RAIL_FEED": 0.2,
      "DBG_BUFFER_VCC_BRIDGE": 0.2,
      "DBG1_BYPASS": 0.2,
      "DBG2_BYPASS": 0.2,
      "ALERT_PD_VCC_LAUNCH": 0.2,
      "ALERT_INNER2_TRUNK": 0.2,
      "ALERT_INPUT_VCC_LAUNCH": 0.2,
      "MON_C43_BYPASS": 0.2,
      "MON_VCC_LAUNCH": 0.2,
      "MON_FAN_INNER2_TRUNK": 0.2,
      "LATCH_STATIC_V3_78": 0.2,
      "LATCH_STATIC_V3_27": 0.2,
      "INPUT_STATIC_V3_78": 0.2,
      "INPUT_STATIC_V3_27": 0.2,
      "MCU_C203_V3_BYPASS": 0.2,
      "MCU_C204_V3_BANK": 0.2,
      "INPUT_C217_V3_BYPASS": 0.2,
      "SUPERVISOR_C216_V3_BYPASS": 0.2,
      "SUPPLY_V3_MST0_0_SPAN_0": 0.2,
      "SUPPLY_V3_MST1_0_SPAN_0": 0.2,
      "SUPPLY_V3_MST2_0_SPAN_0": 0.2,
      "SUPPLY_V3_MST3_0_SPAN_0": 0.2,
      "SUPPLY_V3_MST4_0_SPAN_0": 0.2,
      "SUPPLY_V3_MST5_0_SPAN_0": 0.2,
      "SUPPLY_V3_MST6_0_SPAN_0": 0.2,
      "SUPPLY_V3_MST7_0_SPAN_0": 0.2,
      "SUPPLY_V3_MST8_0_SPAN_0": 0.2,
      "SUPPLY_V3_MST9_0_SPAN_0": 0.2,
      "SUPPLY_V3_MST10_0_SPAN_0": 0.2,
      "SUPPLY_V3_MST11_0_SPAN_0": 0.2,
      "SUPPLY_V3_MST12_0_SPAN_0": 0.2,
      "SUPPLY_V3_MST13_0_SPAN_0": 0.2,
      "SUPPLY_V3_MST14_0_SPAN_0": 0.2,
      "SUPPLY_V3_MST15_0_SPAN_0": 0.2,
      "SUPPLY_V3_MST16_0_SPAN_0": 0.2,
      "SUPPLY_V3_MST17_0_SPAN_0": 0.2,
      "SUPPLY_V3_MST18_0_SPAN_0": 0.2,
      "SUPPLY_V3_MST19_0_SPAN_0": 0.2,
      "SUPPLY_V3_MST20_0_SPAN_0": 0.2,
      "SUPPLY_V3_MST21_0_SPAN_0": 0.2,
      "SUPPLY_V3_MST22_0_SPAN_0": 0.2,
      "SUPPLY_V3_MST23_0_SPAN_0": 0.2,
      "SUPPLY_V3_MST24_0_SPAN_0": 0.2,
      "SUPPLY_V3_MST25_0_SPAN_0": 0.2,
      "SUPPLY_V3_MST26_0_SPAN_0": 0.2,
      "SUPPLY_V3_MST27_0_SPAN_0": 0.2,
      "SUPPLY_V3_MST27_0_SPAN_1": 0.2,
      "SUPPLY_V3_MST28_0_SPAN_0": 0.2,
      "SUPPLY_V3_MST29_0_SPAN_0": 0.2,
      "SUPPLY_V3_MST29_0_SPAN_1": 0.2
    }
  },
  {
    "name": "FAN_COMPLETE_SOURCE_RAIL",
    "net": "V12_FAN",
    "from": "L_FAN.pin2",
    "to": "TP04.pin1",
    "traces": [
      "FAN_FEEDBACK_SUPPLY_TAP",
      "FAN_OUTPUT_TO_CAP_BANK",
      "FAN_OUTPUT_CAP_BANK",
      "FAN_OUTPUT_LOAD_FEED",
      "D504_RAIL_FEED",
      "SUPPLY_FAN_MST0_0_SPAN_0",
      "SUPPLY_FAN_MST1_0_SPAN_0"
    ],
    "requiredSelectors": [
      "L_FAN.pin2",
      "J_FAN.pin2",
      "R228.pin1",
      "C215.pin1",
      "C218.pin1",
      "C221.pin1",
      "R504.pin1",
      "TP04.pin1"
    ],
    "branchEndpoints": {
      "FAN_FEEDBACK_SUPPLY_TAP": [
        "R228.pin1",
        "C221.pin1"
      ],
      "FAN_OUTPUT_TO_CAP_BANK": [
        "L_FAN.pin2",
        "C218.pin1"
      ],
      "FAN_OUTPUT_CAP_BANK": [
        "C218.pin1",
        "C215.pin1"
      ],
      "FAN_OUTPUT_LOAD_FEED": [
        "C215.pin1",
        "J_FAN.pin2"
      ],
      "D504_RAIL_FEED": [
        "R504.pin1",
        "C215.pin1"
      ],
      "SUPPLY_FAN_MST0_0_SPAN_0": [
        "R504.pin1",
        "TP04.pin1"
      ],
      "SUPPLY_FAN_MST1_0_SPAN_0": [
        "C221.pin1",
        "TP04.pin1"
      ]
    },
    "traceWidths": {
      "FAN_FEEDBACK_SUPPLY_TAP": 0.2,
      "FAN_OUTPUT_TO_CAP_BANK": 0.5,
      "FAN_OUTPUT_CAP_BANK": 0.5,
      "FAN_OUTPUT_LOAD_FEED": 0.5,
      "D504_RAIL_FEED": 0.2,
      "SUPPLY_FAN_MST0_0_SPAN_0": 0.5,
      "SUPPLY_FAN_MST1_0_SPAN_0": 0.5
    }
  }
]

export function SupplySourceRoutes() {
  return <>
    {supplySourceBarrels.map(barrel => <via name={barrel.name}
      pcbX={barrel.x} pcbY={barrel.y} holeDiameter={barrel.holeDiameter} outerDiameter={barrel.outerDiameter}
      fromLayer="top" toLayer="bottom" connectsTo={`net.${barrel.net}`} tented
      {...{ key: barrel.name, ref: attachLogicSupplyInner2Port }} />)}
    {supplySourceSpans.map(span => <trace key={span.name} name={span.name}
      from={span.from} to={span.to} thickness={span.thickness} maxLength={span.maxLength}
      pcbPathRelativeTo={span.pcbPathRelativeTo} pcbPath={span.pcbPath} />)}
  </>
}
