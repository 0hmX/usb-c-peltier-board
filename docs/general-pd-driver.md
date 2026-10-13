# General USB-C PD Peltier driver

## Scope and limits

One two-wire output with adjustable constant-voltage and constant-current limits. **PD POWER** supplies the load; **USB PROGRAM** provides native USB configuration, firmware updates and logic power. There are no display, buttons or display headers. Three status LEDs and 15 bare copper debug pads support setup and development.

The default module is [HiLetgo TEC1-12706, Amazon ASIN B00M1PM7H6](https://www.amazon.com/dp/B00M1PM7H6). Its listing specifies 40 × 40 × 3.6 mm and two modules per package; this board drives one. During selection, that listing showed 50+ purchases in the past month, 564 ratings and 4.3/5; [diymore's TEC1-12706 listing](https://www.amazon.com/dp/B01IUVSSHW) showed 100+, 354 ratings and 4.4/5. These changing, potentially pooled listing statistics support choosing a familiar consumer module, without establishing the world's best-selling Peltier.

The [Hebei reference datasheet](https://www.hebeiltd.com.cn/peltier.datasheet/TEC1-12706.pdf) describes a related TEC1-12706 variant with 6.4 A maximum, 14.4 V maximum and 50 W maximum heat pumping at a 25 °C hot side. It does not certify the Amazon batch. Qualify purchased samples and their thermal installation; electrical watts are not watts of cooling.

| Setting | Prototype target |
| --- | --- |
| Factory defaults | 12.0 V / 5.50 A, OFF until saved or explicitly started |
| Saved profile | Starts after approximately 1 s of qualified PD input |
| Voltage ceiling | 2.1–15.0 V, 0.1 V steps |
| Current ceiling | 0.50–6.00 A, 0.05 A steps |
| Power ceiling | 72 W nominal selected V × I |
| Power input | Qualified 20 V / 5 A contract; 100 W source and 5 A e-marked cable |
| Programming input | USB 2.0 data and 5 V logic supply |
| Board | 80 × 60 mm, 1.6 mm, four layers, no traces or vias |

Voltage is regulated **before the 10 mΩ shunt**, which drops approximately 55 mV at 5.5 A plus wiring losses. USB STATUS reports approximate voltage at the TEC terminal. The 2.1 V setting floor provides nominal margin above the converter's 2 V current-sense common-mode accuracy boundary after the shunt. Current regulation under overload can reduce output below that boundary; low-voltage accuracy and short-circuit behavior need bench validation. IC, shunt and divider tolerances remain uncalibrated.

For other modules, set ceilings within their allowed operating limits, allowing for tolerances. A two-wire Peltier provides no identity or ratings to the driver. This revision does not regulate temperature, power a fan or reverse polarity.

## Power and control architecture

`100 W PD source → 5 A cable → qualified PFET path → TPS55289 CC/CV stage → 10 mΩ shunt → Peltier`

- **CYPD3177** requests MIN=MAX=20 V and COARSE=5 A/FINE=0. Two common-source AO4407A PFETs gate raw power into the qualified rail. Specify firmware 3.10D or later/date code after 2047 because [Infineon documents older minimum-voltage behavior](https://community.infineon.com/t5/Knowledge-Base-Articles/CYPD3177-EZ-PD-BCR-Device-Firmware-Updates/ta-p/251759). PD-port D+/D− are unconnected. VDDD has 1 µF and two 100 nF bypasses.
- **TPS55289** integrates its four power MOSFETs and an average-output-current loop using ISP/ISN and the shunt. MODE is grounded for I²C address 0x75. A 130 kΩ / 10 kΩ EN divider gives approximately 17.22 V UVLO; PD FAULT independently clamps EN.
- **Logic power:** LMR50410 supplies auxiliary 5 V from raw PD VBUS. TPS2116 selects the higher of that rail and programming USB 5 V, with reverse blocking between ports. Its output, `LOGIC_5V`, supplies converter VCC and the TLV75533 3.3 V regulator. Programming USB has no path to qualified PD VIN or the TEC. At qualified PD input, the auxiliary supply provides the converter's required external VCC operating voltage. Converter EN remains LOW during programming-only power.
- **USB PROGRAM:** STM32G0B1KBT6 provides native USB CDC and ST ROM USB DFU. Both CC pins have separate 5.1 kΩ sink resistors; orientation pairs connect directly to PA11/PA12 through USBLC6-2SC6 protection. The protection's VBUS bias uses local LOGIC_5V to avoid its steering diodes backfeeding the programming connector. Firmware detects that connector's VBUS separately and disconnects USB when absent. HSI48/CRS supplies the USB clock without a crystal.
- **Attach capacitance:** raw PD has 7.1 µF nominal (4.7 µF USB, 2.2 µF auxiliary input and two 100 nF bypasses), or 8.52 µF with a blanket +20%. Raw PROGRAM has 1 µF. Both are below the [10 µF receptacle limit described by TI](https://www.ti.com/document-viewer/lit/html/SSZTB15/GUID-9C081873-D60C-462A-ABFB-9A4E87F564F0); downstream switched-bank inrush still needs measurement.
- **Reset safety:** an NPN clamps converter EN by default, biased from LOGIC_5V. An NMOS releases it only while MCU PB0 actively grants permission; its gate has a pull-down. PB0 is not a ROM bootloader UART pin. MCU reset, blank firmware, lost control supply and watchdog reset remove permission.
- **Startup:** valid saved settings start after one second of qualified input. Before OE=1, firmware verifies PD, releases EN into reset-OFF state, writes and reads back voltage/current/protection registers, and checks PD again. A CRC/version-checked profile occupies a reserved final 2 KB flash page; saving requires OFF and readback verification. No profile or invalid flash leaves output OFF. Unplugging USB PROGRAM does not stop an operating load.
- **Faults:** SC/OVP, ADC, measured-limit and converter-communication failures latch OFF. STOP cancels automatic start for the current PD session. Source detach stops output; after at least one second without PD, a new qualified connection can use the saved profile unless a protective fault remains latched. Explicit RUN retries all startup checks; CLEAR resets the latch while remaining OFF. [Firmware instructions](../firmware/README.md) explain watchdog/reset behavior.

Internal feedback ratio 0.0752 caps converter DAC full-scale at about 15.96 V. Software selects at most 15 V and enforces V × I ≤72 W. This budget is not an independent input-current limit; the PD controller requests current but does not itself measure/enforce it.

The first-pass switching network uses approximately 395 kHz, a 4.7 µH coil, four 10 µF / 50 V input MLCCs plus 100 µF / 35 V bulk, four 22 µF / 25 V pre-shunt MLCCs, and 100 µF / 25 V post-shunt bulk. Sense filtering is 10 Ω per tap plus 220 nF differential. Compensation starts with TI EVM values of 27.4 kΩ / 4.7 nF / 100 pF. Validate these over the full range and actual capacitor DC bias. At assumed 90% efficiency, 72 W output requires 80 W before auxiliary/connector losses; continuous capability is unmeasured. Lower-power PD contracts are rejected.

## Parts, cables and debug

| Role | Selected source |
| --- | --- |
| Peltier | [HiLetgo TEC1-12706, Amazon B00M1PM7H6](https://www.amazon.com/dp/B00M1PM7H6) |
| PD sink | CYPD3177-24LQXQT, C2952489; [Infineon datasheet](https://www.infineon.com/assets/row/public/documents/24/49/infineon-cypd3177-24lqxq-datasheet-en.pdf) |
| Both USB receptacles | GCT USB4085-GF-A, C7095263; [manufacturer](https://gct.co/connector/usb4085), 5 A rating |
| PD PFET pair | AO4407A, C16072; [AOS datasheet](https://www.aosmd.com/sites/default/files/res/datasheets/AO4407A.pdf) |
| CC/CV converter | TPS55289RYQR, C5942077; [TI datasheet](https://www.ti.com/lit/ds/symlink/tps55289.pdf), [EVM](https://www.ti.com/tool/TPS55289EVM) |
| Main inductor | Bourns SRP1265A-4R7M, C780205; [manufacturer drawing](https://www.bourns.com/docs/product-datasheets/srp1265a.pdf) |
| Current shunt | TA-I RLM25FEER010, C192580; 10 mΩ, 1%, 2 W |
| Native USB MCU | STM32G0B1KBT6, C5270165; [ST datasheet](https://www.st.com/resource/en/datasheet/stm32g0b1kb.pdf) |
| Reverse-blocking logic mux | TPS2116DRLR, C3235557; [TI datasheet](https://www.ti.com/lit/ds/symlink/tps2116.pdf) |
| USB data protection | USBLC6-2SC6, C7519; [ST datasheet](https://www.st.com/resource/en/datasheet/cd00050750.pdf) |
| Auxiliary 5 V / logic 3.3 V | LMR50410Y5FQDBVRQ1, C2871822 / TLV75533PDBVR, C404027; [buck](https://www.ti.com/lit/ds/symlink/lmr50410-q1.pdf), [LDO](https://www.ti.com/lit/ds/symlink/tlv755p.pdf) |
| Output terminal | KEFA KF301-5.0-2P, C474881; catalog 17 A, 14–22 AWG; sustained-current temperature needs qualification |
| POWER / RUN / FAULT | Yellow KT-0603Y C2287 / green KT-0603YG C2289 / red KT-0603R C2286 |
| Both USB cables | [Cable Matters 201440](https://www.cablematters.com/pc-1532-123-usb-c-20-charging-cable-with-240w-power-delivery.aspx), 1 m, 5 A, e-marked, USB 2.0 data |

[Inventory](component-sourcing.csv) records **95 purchased placements across 45 exact JLC SKUs**. The separate [direct JLC stock snapshot](jlc-stock-audit.json) records positive overseas warehouse stock for every SKU at the audit time. Stock and pricing change; the tscircuit parts engine's cached availability warnings are separate from that snapshot and from netlist validation. No fabrication or component order has been placed.

Use factory Peltier leads in the terminal; seller lengths/gauges vary. Cable extensions require their own current/temperature qualification. Both selected USB cables support data, although PD POWER uses only power/CC. The model distinguishes their roles by color and labels; these are illustrative cable shapes.

POWER indicates 3.3 V logic supply, RUN indicates enabled output and FAULT indicates a latched fault. The **15 debug pads** expose SWDIO, SWCLK/BOOT0, NRST, 3V3, GND, raw PD, qualified PD, LOGIC5V, TEC terminal, pre-shunt output, driver EN, ISP, ISN, SCL and SDA. They are 1.5 mm copper pads, with no fitted component or JLC SKU. BOOT0 and reset pads permit recovery without buttons; see the firmware's required factory option-byte settings.

## Assembly and qualification

The assembly is generated from the final circuit JSON and actual placement. Imported supplier meshes are used where available and identified as supplier CAD. Public manufacturer CAD exports were sought for GCT/TI; unavailable bodies use documented drawing-derived envelopes. The Amazon module uses its listed envelope; cable geometry illustrates connectivity. [Provenance](../assets/assembly/provenance.json) records sources and fallbacks, and generated provenance includes the circuit JSON hash. These models are not fit-qualified mechanical CAD.

The preview omits the required hot-side heatsink, cold plate, clamping and thermal interface. Fit these before operation. The board is a power driver rather than a complete refrigeration assembly.

Before manufacture, route/review power and return copper, Kelvin sensing, decoupling, gate drive, USB data, EMI/ESD and heat spreading. Bench-check USB enumeration/DFU/recovery; both orientations and simultaneous supplies; backfeed/inrush; saved-profile startup and corrupt/interrupted saves; PD detach/reset; current/voltage tolerances and compensation; short circuit and output-off discharge; watchdog/control-supply loss; and sustained connector/cable/board temperatures. Native tests and a firmware cross-build do not establish these measurements.
