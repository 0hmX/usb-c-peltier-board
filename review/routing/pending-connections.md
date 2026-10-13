# Routing draft: unfinished connections

This is a partial routing snapshot for review. Remaining connections are intentional review work, not a fabrication release.

385/408 planned non-ground edges were realized as 1006 saved trace pieces and 523 through vias. 116/135 nets form one physical copper component.

## Pending planned edges

| Net | From | To | Owner |
| --- | --- | --- | --- |
| VBUS_TEC | Q20.pin5 | C24.pin1 | tec-power |
| XOUT | U_MCU.pin21 | R_XOUT.pin1 | mcu |
| FLASH_SD3 | U_MCU.pin51 | U_FLASH.pin7 | mcu |
| INPUT_DVDT | U_INPUT.pin7 | C_INPUT_DVDT.pin1 | pd-input |
| INPUT_CURRENT_MON | U_INPUT.pin9 | R_INPUT_ILIM.pin1 | pd-input |
| INPUT_ENABLE | U_INPUT.pin1 | R_INPUT_RUN.pin2 | pd-input |
| TEC_REQUEST | R202.pin1 | U_MCU.pin15 | interlock |
| TEC_CLEAR_N | R240.pin1 | U_LATCH.pin6 | interlock |
| MCU_NRST | U_MCU.pin26 | R_RESET_PU.pin2 | mcu |
| BOOT_BUTTON | R_BOOT.pin2 | SW_BOOT.pin2 | mcu |
| MCU_NRST | TP_RESET.pin1 | TP13.pin1 | mcu |
| PD_VDD | C_CH_VDD.pin1 | R_PG_PU.pin1 | pd-input |
| USB_PROG_5V | J_USB_PROG.pin15 | U_USB_ESD.pin5 | pd-input |
| USB_PROG_5V | U_USB_ESD.pin5 | R_USB_DETECT_TOP.pin1 | pd-input |
| PD_CFG2 | U_PD.pin2 | Q_PD_CFG2.pin3 | pd-input |
| PD_CFG3 | U_PD.pin3 | R_PD_CFG3.pin2 | pd-input |
| PD_CFG2_LOW | Q_PD_CFG2.pin1 | U_MCU.pin7 | pd-input |
| PD_CFG3_LOW | Q_PD_CFG3.pin1 | U_MCU.pin8 | pd-input |
| V3V3 | C_IO4.pin1 | C_MCU_BULK.pin1 | ground-supply |
| V3V3 | C_IO4.pin1 | C_IO5.pin1 | ground-supply |
| V3V3 | C_IO2.pin1 | C_IO3.pin1 | ground-supply |
| V3V3 | C_IO3.pin1 | R_RESET_PU.pin1 | ground-supply |
| HOT_ADC | C209.pin1 | TP06.pin1 | thermal_sensor_routing |

## Remaining ground escapes

- C210.pin2
- D504.pin1
- C_IO2.pin2
- C_IO3.pin2
- C_VREG_OUT.pin2
- C_DVDD2.pin2
- U_USB_SWITCH.pin9

## Logic power feeds without a declared plane barrel

- C_IO3.pin1
- C_IO4.pin1
- U_MCU.pin22
- U_MCU.pin33

## Physical copper gaps

The exact native audit also includes isolated pads, orphan copper, and disconnected pour pieces. A routing-tree union does not substitute for these checks.

| Net | Copper components | Disconnected pads |
| --- | --- | --- |
| GND | 11 | D504.pin1, C_IO2.pin2, C_IO3.pin2, C_VREG_OUT.pin2, C_DVDD2.pin2 |
| INPUT_ENABLE | 2 | U_INPUT.pin1 |
| VBUS_TEC | 2 | U2.pin3, C24.pin1 |
| INPUT_DVDT | 2 | U_INPUT.pin7 |
| INPUT_CURRENT_MON | 2 | U_INPUT.pin9 |
| V3V3 | 15 | R_PD_SCL.pin1, R_PD_SDA.pin1, U_TEC_MON.pin5, C43.pin1, U_LATCH.pin2, U_LATCH.pin7, U_LATCH.pin8, U_INPUT_LATCH.pin2, U_INPUT_LATCH.pin7, U_INPUT_LATCH.pin8, Q_FAULT_SOURCE.pin2, U_CLEAR_BUFFER.pin5, U_CLOCK_BUFFER.pin5, U_DAC.pin3, U_THERMAL.pin8, R208.pin1, R233.pin1, R237.pin1, C206.pin1, C207.pin1, C208.pin1, C217.pin1, C222.pin1, C223.pin1, TP03.pin1, R_USB_DATA_OFF.pin1, U_MCU.pin49, U_MCU.pin48, U_MCU.pin44, U_MCU.pin42, U_MCU.pin33, U_MCU.pin22, U_MCU.pin10, U_MCU.pin1, U_FLASH.pin8, C_FLASH.pin1, R_FLASH_CS.pin1, C_IO1.pin1, C_IO2.pin1, C_IO3.pin1, C_IO4.pin1, C_IO5.pin1, C_IO6.pin1, C_USB_VDD.pin1, C_VREG_IN.pin1, C_MCU_BULK.pin1, R_ADC_SUPPLY.pin1, R_RESET_PU.pin1, U_USB_SWITCH.pin10, C_USB_SWITCH.pin1 |
| TEC_CLEAR_N | 2 | U_LATCH.pin6 |
| TEC_REQUEST | 2 | U_MCU.pin15 |
| HOT_ADC | 2 | TP06.pin1 |
| MCU_NRST | 3 | TP13.pin1, U_MCU.pin26 |
| PD_VDD | 2 | R_PG_PU.pin1 |
| PD_CFG2 | 2 | U_PD.pin2 |
| PD_CFG3 | 2 | U_PD.pin3 |
| PD_CFG2_LOW | 2 | U_MCU.pin7 |
| PD_CFG3_LOW | 2 | U_MCU.pin8 |
| USB_PROG_5V | 3 | R_USB_DETECT_TOP.pin1, U_USB_ESD.pin5 |
| XOUT | 2 | U_MCU.pin21 |
| FLASH_SD3 | 2 | U_FLASH.pin7 |
| BOOT_BUTTON | 2 | R_BOOT.pin2 |

## Review notes

- Prioritize the controller VIN feed at C24, eFuse DVDT/current-limit/enable escapes, MCU crystal/flash/reset, and remaining MCU supply/ground islands.
- Exposed capacitor return: C209.pin2 → RB_VIA_455.top, 2.786 mm against 1 mm.
- Kelvin audit retains 18 shared-copper contact findings outside the shunt solder lands; review the exact polygons in kelvin-routing-audit.json.
- USB native pair lengths are 48.843949 / 48.843949 mm, with 2 transitions each. Physical bottom-reference coverage passes. Impedance remains unqualified.
- The placement CLI retains five orientation suggestions; native placement DRC has zero errors. See placement-check.txt.
- Confirm the manufacturing stackup, USB impedance, current and thermal behavior before a hardware release.
