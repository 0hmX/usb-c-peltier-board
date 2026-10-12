# Revision B design notes

## Scope

Placement and electrically connected schematic only. Not fabricated, simulated or bench tested. This review makes no USB-IF, thermal, EMC or manufacturing-compliance claim. The 110 × 85 mm outline is a proposed review form factor, not an enclosure constraint supplied by the user.

Geometric placement DRC reports zero errors and warnings. Schematic and PCB placement checks report no issues. Twenty-four passive components were rotated 180° to resolve the PCB analyzer's orientation suggestions; their centres and electrical connections are preserved. The resulting analysis is recorded in `review/placement-check.txt`.

## PD / MCU architecture

CH224K pin mapping: VDD=1, CFG2=2, CFG3=3, DP=4, DM=5, CC2=6, CC1=7, VBUS=8, CFG1=9, active-low PG=10, exposed ground=11. Its local D+/D− pins are shorted; the PD receptacle's data contacts are intentionally unconnected. VDD has a 1 kΩ, 0.75 W series resistor and local bypass; VBUS sensing uses a separate 10 kΩ resistor.

RP2040 GPIO4/5/6 drive DTC114EETL open collectors. Their collectors pull CFG1/2/3 low, with 47 kΩ pullups to CH224K VDD. No CH224K-domain pullup connects directly to an RP2040 GPIO.

| GPIO4, GPIO5, GPIO6 | Actual CFG1, CFG2, CFG3 | Requested voltage |
|---|---|---|
| 0, 0, 0 / high impedance | 1, 1, 1 | 5 V / reset default |
| 1, 0, 0 | 0, 1, 1 | 15 V |
| 1, 0, 1 | 0, 1, 0 | 20 V |

These are voltage requests, not proof of a source contract or available current. Firmware must qualify the adapter separately. The hardware has no negotiated-current telemetry. Raw VBUS is measured before the protected power rail, so firmware can verify the input without first enabling the load.

The LMV393 window uses a 150 kΩ/10 kΩ raw-VBUS divider. Nominal lower threshold is 13.47 V (29.2 kΩ/10 kΩ reference), nominal upper threshold 22.66 V (13.3 kΩ/10 kΩ reference). The inherited eFuse has its own approximately 22 V overvoltage shutdown. Resistor tolerance, 3.3 V accuracy, comparator offset, ripple and hysteresis need bench characterization. The wider upper window avoids rejecting an otherwise valid 20 V source solely because of tolerance.

The TPS259470A pin 3 is AUXOFF, not a power-good indication. It is named `INPUT_AUXOFF`; firmware must not treat it as a negotiated-contract confirmation. The eFuse's 1.27 kΩ current limit remains fixed. The previous parallel high-current limit branch is removed.

## MCU support

All RP2040 IOVDD/USB/VREG inputs receive 3.3 V; its internal regulator feeds both DVDD pins from the 1.1 V rail. ADC_AVDD uses the recommended filtered supply topology. TESTEN and exposed ground are grounded. External W25Q16 flash uses all six QSPI lines with an independent CS pullup and bypass.

The crystal is the motor reference's **ABM8-272-T3**, not a lookalike 20 pF-load crystal. It has 15 pF load capacitors and a 1 kΩ XOUT series resistor. Final load/stray capacitance, start-up margin and frequency tolerance must be verified on the routed board. Local decouplers, flash and clock remain next to the RP2040. The 27 Ω USB series resistors are on the MCU side of the data switch.

RP2040 RUN/reset (`MCU_NRST`) is distinct from the GPIO load permission (`MCU_RUN`). Reset also asserts the input-fault line through an isolating diode. BOOT/RESET use the standard programmer's verified SKRPACE010 footprint and correct internal contact pairs.

## Programming and supply isolation

The programming receptacle has separate 5.1 kΩ Rd resistors on CC1 and CC2, paired D+/D− contacts and USBLC6 data-line protection. A TS3USB221A data switch selects channel 1 and is hardware disabled whenever programming VBUS is absent; unused channel 2 is unconnected. The divider on the RP2040 VBUS-detect GPIO is 10 kΩ/10 kΩ so the boot-ROM/internal pulldown does not defeat detection.

PD VBUS and programming 5 V feed `LOGIC_VIN` through separate Schottky diodes; neither feeds the other's connector directly. A **100 Ω, ≥0.5 W programming-VBUS bleeder** plus the 47 kΩ base pulldown prevents detached-port Schottky leakage from falsely enabling USB or inhibiting the load. The design envelope requires a qualified SMA SS14 with reverse leakage ≤6 mA through 100 °C: the detached USB node is then ≤0.6 V and the transistor base divider ≤0.3 V. The [Vishay SS14 datasheet](https://www.vishay.com/docs/88746/ss12.pdf) supplies that screening limit; the inherited generic supplier mapping must be checked against the actual selected manufacturer's specification before assembly. This is a deliberate robust review-stage tradeoff, not a low-power solution.

The bleeder draws 50 mA at 5 V (52.5 mA and 0.276 W at 5.25 V), in addition to logic current. Qualify **total USB consumption before enumeration**, cable-drop startup, suspend behavior and regulator losses. If USB suspend compliance or lower quiescent current is required, replace this network with a qualified low-leakage/reverse-blocking power path and threshold-qualified presence detector before fabrication. USB-only logic operation must be tested over the actual allowed device-port voltage range.

Programming VBUS asserts hardware service inhibition even if both power cables are present. This disables the shared protected rail: **neither TEC nor fan operates while a programming cable is connected**. Do not assume an automatic fan cooldown mode. Unplugging USB must require a fresh intentional firmware re-arm.

USB-C is the only programming interface. `J_SWD`, `J_UART`, their series resistors (`R_SWCLK`, `R_SWDIO`, `R_UART_TX`, `R231`) and the SWD-only `J_SERVICE` jumper are absent. RP2040 GPIO0/1 and SWCLK/SWD pins are explicitly unconnected; no UART or SWD nets are created. Enter the USB bootloader by holding BOOT while connecting USB PROGRAM, or holding BOOT while pressing and releasing RESET on a powered board.

The three remaining JST connectors face the bottom board edge with verified supplier pads and CAD. HOT/COLD reuse the standard programmer module's SM02B-SRSS-TB (C160402) power-connector geometry with thermistor signal labels; the module has no four-pin fan export, so the fan uses a supplier-imported SM04B-SRSS-TB (C160404) from the same 1 mm-pitch SH family.

HOT and COLD each use pin 1 = thermistor signal, pin 2 = GND. Fan pins 1–4 remain GND, V12_FAN, tachometer, PWM. This SH fan harness is **not directly compatible with a conventional PC-fan plug**; use a pin-verified adapter/harness.

The [JST SH datasheet](https://www.jst-mfg.com/product/pdf/eng/eSH.pdf) rates this family at **1 A with AWG 28 wire**. Select a fan whose continuous, startup and locked-rotor current all remain within the qualified connector/harness limit, with temperature derating. Do not connect a higher-current fan to this header. Actual fan selection and protection remain release gates. The multi-amp TEC output retains the original KF301-5.0-2P (C474881) screw terminal rather than substituting a 1 A JST SH connector; qualify its wire, screw torque, thermal rise and solder joints for the final TEC current.

The [Kefa KF301-5.0 supplier drawing](https://datasheet.lcsc.com/datasheet/pdf/dbe48a1bef5e997cc12dba31bc0ac67e.pdf?productCode=C474881) specifies AWG 22–14 wire, 16 A UL use group B / 10 A group D, and 17 A IEC. Treat 10 A as the conservative connector screening ceiling, not an approved board operating current. The drawing lists 0.4 N·m maximum torque; final assembly instructions must use a manufacturer-qualified torque and appropriately sized wire/ferrules.

The USB-VBUS-driven hardware inhibit (`Q_USB_SERVICE`) and reset-to-fault diode remain connected independently of the removed service jumper. Connecting USB PROGRAM still disables both TEC and fan, including during boot-ROM programming.

## Firmware requirements, not implemented here

1. Leave GPIO4/5/6 low or high impedance and `TEC_REQUEST`, `MCU_RUN`, `MCU_ARM` low at boot/reset; do not assert the legacy `POWER_BUDGET_HIGH` path.
2. Check raw VBUS, active-low PD qualification/fault signals, thermistors and current-monitor communication before permitting power.
3. Request only a qualified 15/20 V mode, wait for measured-voltage stability and PG, and use a conservative fixed input-current budget below the characterized eFuse limit. Do not reuse the legacy STUSB4500 capability/current-reading logic.
4. Program a zero/limited DAC setpoint before issuing fresh latch-arm edges. The DAC's previous nonvolatile state is not a safe firmware default.
5. Require renewed intentional arming after detach, voltage change, reset, service, overtemperature, sensor fault or programming-cable activity. Fault-handling must not auto-restart the TEC.
6. Define fan/probe/watchdog fault policy and a safe hot-side cooling procedure; shared power shutdown cannot maintain fan cooldown.

## Placement intent

- Left-edge USB receptacles face outward; power and programming are clearly separated.
- Upper power cluster keeps the capacitor bank, FET pair, controller, inductor and shunt near the TEC connector. Gate, Kelvin and compensation routing still need specialist review.
- MCU, flash, crystal and bypass form a separate lower-left island. USB routing must become a short, tightly coupled, impedance-controlled pair.
- Thermal/sensor circuitry stays below the switching stage; the fan converter has a distinct right-hand island.
- Test points remain accessible rather than buried in courtyards. The mounting keepouts reserve screw-head space; actual enclosure/washer compatibility remains unverified.
- Component-to-component envelopes are checked with authentic courtyards and explicit generic-passive courtyards. Reference labels are intentionally mostly omitted from board silkscreen; `placement.csv` and the schematic are the assembly-review reference.

## Remaining release gates

Do not order from this placement review. Complete firmware, routing, thermal copper/heatsink sizing, Kelvin extraction, transient/load stability tests, decoupling loop review and USB signal-integrity review. Add/qualify **PD CC/VBUS and programming CC ESD/surge protection**; the included USBLC6 protects programming data only. High-current traces, copper pours, creepage/clearance, eFuse thermal dissipation, polarity, connector current ratings and cable/enclosure mechanics need routed-board validation.

New generic passives are electrical/footprint specifications, not a qualified purchasing BOM. Assign exact manufacturer/supplier numbers; verify 1% divider tolerances, C0G crystal loads, ceramic DC-bias derating, input/bulk-cap voltage/transient margins and resistor power ratings. Imported footprint provenance does not prove present supplier availability or assembly orientation. The former routed board's measurements and checks are not transferable.
