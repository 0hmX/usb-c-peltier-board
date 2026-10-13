# General USB-C PD Peltier driver

## Scope and limits

A single two-wire output with adjustable constant-voltage and constant-current limits. One general driver, one display, three buttons. The default module is **HiLetgo TEC1-12706**, purchased from [Amazon.com, ASIN B00M1PM7H6](https://www.amazon.com/dp/B00M1PM7H6). The listing specifies a 40 × 40 × 3.6 mm module and sells two per package; the board drives one.

Amazon's listing observed during this research displayed 50+ purchases in the past month, 564 ratings and 4.3/5. Another [diymore TEC1-12706 listing](https://www.amazon.com/dp/B01IUVSSHW) displayed 100+ purchases, 354 ratings and 4.4/5. These are listing-level adoption signals, potentially pooled across package variants; they do not prove the world's best-selling module. Counts change. The default selection is a concrete consumer purchase, rather than a claim that every TEC1-12706 from every seller has identical specifications.

The [Hebei reference datasheet](https://www.hebeiltd.com.cn/peltier.datasheet/TEC1-12706.pdf) describes a related TEC1-12706 variant with 6.4 A maximum, 14.4 V maximum and 50 W maximum heat pumping at a 25 °C hot side. That datasheet is not certification of the Amazon batch. Qualify samples from the selected listing. Cooling capacity depends on temperatures and the thermal installation; electrical watts are not watts of cooling.

| Setting | Prototype target |
| --- | --- |
| Default | 12.0 V / 5.50 A, output OFF |
| Voltage ceiling | 2.1–15.0 V, 0.1 V UI steps |
| Current ceiling | 0.50–6.00 A, 0.05 A steps |
| Power ceiling | 72 W nominal selected V × I |
| Input | Qualified 20 V / 5 A PD contract; 100 W source and 5 A e-marked cable |
| Board | 80 × 60 mm, 1.6 mm, four layers, no PCB traces or vias |

The voltage setting is the converter's **pre-shunt** voltage. A 10 mΩ sense resistor drops approximately 55 mV at the default 5.5 A, plus wiring losses. The screen's approximate voltage measurement is taken at the TEC terminal. The 2.1 V setting floor gives nominal margin above the converter's 2 V current-sense common-mode accuracy boundary after shunt drop. Current limiting can still reduce output below that boundary under overload; low-voltage accuracy and short-circuit behavior require validation. Current settings are nominal, with IC/shunt tolerances, rather than exact amperes.

For other modules, enter voltage/current ceilings at or below their allowed operating limits, allowing for tolerances. The board cannot identify a module through its two wires. It does not regulate temperature, supply a fan, or reverse polarity automatically.

## Power and startup architecture

`100 W PD source → 5 A cable → qualified PFET power path → TPS55289 CC/CV stage → 10 mΩ sense resistor → Peltier`

- **CYPD3177** is a standalone PD sink, configured with MIN=MAX=20 V and COARSE=5 A/FINE=0. Its two common-source AO4407A PFETs gate raw USB power into the qualified rail. Specify CYPD3177 firmware 3.10D or later/date code after 2047 because [Infineon documents older minimum-voltage behavior](https://community.infineon.com/t5/Knowledge-Base-Articles/CYPD3177-EZ-PD-BCR-Device-Firmware-Updates/ta-p/251759). D+/D− remain unconnected per the current pin guidance. VDDD has 1 µF and two 100 nF bypasses.
- **TPS55289** integrates all four power MOSFETs and provides a genuine average-output-current feedback loop through ISP/ISN and the external shunt. It replaces the fixed-output buck and avoids an external DAC/current-loop amplifier. MODE is grounded for I²C address 0x75. A 130 kΩ / 10 kΩ EN divider gives approximately 17.22 V input UVLO. PD FAULT independently clamps EN.
- **External bias:** the 36 V-rated LMR50410 fixed-5 V buck runs from raw VBUS. It supplies TPS55289 VCC directly; EXTVCC is grounded to select external bias. A TLV75533 supplies the MCU/display at 3.3 V. This keeps MCU pull-ups within the TPS55289 VCC pin rating when EN is low and reduces internal-LDO dissipation. The auxiliary 5 V rail can droop at the initial USB 5 V input; output operation is gated until qualified 20 V is present.
- **USB startup capacitance:** the raw VBUS bank is 4.7 µF at USB, 2.2 µF X7R at the auxiliary buck and two 100 nF bypasses: 7.1 µF nominal, 8.52 µF under a conservative blanket +20% tolerance. This stays below the [10 µF receptacle limit described by TI](https://www.ti.com/document-viewer/lit/html/SSZTB15/GUID-9C081873-D60C-462A-ABFB-9A4E87F564F0). The auxiliary input follows TI's recommended 2.2 µF / 50 V X7R plus 100 nF. The much larger main power bank is behind the qualified PFET path; its negotiated-voltage inrush still requires measurement.
- **Reset and control-supply loss:** an NPN clamps converter EN by default, with its base biased from AUX_5V. An NMOS releases that clamp only while the MCU actively drives its permission GPIO high; the NMOS gate has a ground pull-down. MCU reset, blank firmware or loss of its 3.3 V rail removes permission. A watchdog resets the MCU if its control loop stalls.
- Firmware leaves OE=0 at startup. On an explicit RUN command it verifies qualified input and settings, releases EN into the converter's reset-OFF state, writes and reads back voltage/current/protection registers, then sets OE last. Source failure, short circuit, overvoltage or communication failure turns the output OFF. Ordinary constant-current operation is permitted. There is no automatic restart after a fault.
- Internal feedback ratio 0.0752 limits the converter's DAC full-scale to about 15.96 V. Software selects at most 15 V and enforces V × I ≤72 W. The hardware loop provides current regulation; the firmware's power budget is not a separate input-current protection circuit. The CYPD3177 requests current but does not itself measure/enforce input current.

The first-pass switching network uses approximately 395 kHz, a 4.7 µH coil, four 10 µF / 50 V input MLCCs plus 100 µF / 35 V input bulk, four 22 µF / 25 V pre-shunt output MLCCs, and 100 µF / 25 V post-shunt bulk. Sense filtering is 10 Ω per tap plus 220 nF differential. Compensation starts with the TI EVM's 27.4 kΩ / 4.7 nF / 100 pF network. These are starting values to validate across the full range and actual capacitor DC bias; copying an EVM network is not stability proof for this board.

72 W output at an assumed 90% efficiency needs 80 W before auxiliary/connector losses. The 100 W contract leaves margin; efficiency, inrush and continuous thermal capability must be measured. This revision intentionally rejects lower-power contracts rather than implementing automatic reduced-power operation.

## Concrete sources

| Role | Selected source |
| --- | --- |
| Reference Peltier | [HiLetgo TEC1-12706, Amazon B00M1PM7H6](https://www.amazon.com/dp/B00M1PM7H6) |
| PD sink | CYPD3177-24LQXQT, C2952489; [Infineon datasheet](https://www.infineon.com/assets/row/public/documents/24/49/infineon-cypd3177-24lqxq-datasheet-en.pdf) |
| USB receptacle | GCT USB4085-GF-A, C7095263; [manufacturer](https://gct.co/connector/usb4085), 5 A rating |
| PD PFET pair | AO4407A, C16072; [AOS datasheet](https://www.aosmd.com/sites/default/files/res/datasheets/AO4407A.pdf) |
| CC/CV converter | TPS55289RYQR, C5942077; [TI datasheet](https://www.ti.com/lit/ds/symlink/tps55289.pdf), [TI EVM](https://www.ti.com/tool/TPS55289EVM) |
| Main inductor | Bourns SRP1265A-4R7M, C780205; [manufacturer drawing/data](https://www.bourns.com/docs/product-datasheets/srp1265a.pdf) |
| Current shunt | TA-I RLM25FEER010, C192580; 10 mΩ, 1%, 2 W |
| MCU | STM32G030F6P6, C724040; [ST datasheet](https://www.st.com/resource/en/datasheet/stm32g030f6.pdf) |
| 5 V auxiliary buck | LMR50410Y5FQDBVRQ1, C2871822; [TI datasheet](https://www.ti.com/lit/ds/symlink/lmr50410-q1.pdf) |
| 3.3 V LDO | TLV75533PDBVR, C404027; [TI datasheet](https://www.ti.com/lit/ds/symlink/tlv755p.pdf) |
| Output terminal | KEFA KF301-5.0-2P, C474881; catalog rating 17 A, 14–22 AWG; qualify sustained-current temperature |
| Display | [Waveshare 0.91-inch OLED module, SKU 14657](https://www.waveshare.com/0.91inch-oled-module.htm), SSD1306, 128 × 32 |
| Display cable | [Adafruit 3568](https://www.adafruit.com/product/3568), JST-PH four-pin female/female, 150 mm, 26 AWG |
| USB-C cable | [Cable Matters 201440](https://www.cablematters.com/pc-1532-123-usb-c-20-charging-cable-with-240w-power-delivery.aspx), 1 m, 5 A, e-marked |

[The inventory](component-sourcing.csv) records every placed PCB part's exact catalog number, MPN and quantity. Live stock can differ between LCSC and JLC assembly warehouses; catalog identifiers and imported footprints are not confirmation of an assembly order. The parts engine's availability warnings remain separate from source/netlist errors. No fabrication or component order has been placed.

The display connector follows the [Waveshare schematic](https://files.waveshare.com/upload/2/2a/0.91inch_OLED_Module_Schematic.pdf): pin 1 SCL, pin 2 SDA, pin 3 GND, pin 4 3.3 V. The harness must connect corresponding numbered pins. Check its continuity before first power; wire colors do not define this custom pinout. The Waveshare included cable is not assumed to mate to the PCB. The chosen Adafruit PH-to-PH cable is separately purchased.

Use the Peltier's factory leads directly in the terminal. Seller lead lengths/gauges can vary; extensions need their own electrical and temperature qualification. The PH OLED cable is for the display only and must not carry Peltier current.

## Assembly model and qualification

The assembly is generated from the final circuit JSON, not a separately drawn imaginary PCB. It uses imported supplier component meshes where available. Manufacturer CAD was sought for the GCT connector and TI converter, but their provider exports were not publicly downloadable without registration. Supplier models are not described as manufacturer-authored.

The TI converter body and any missing bodies use identified manufacturer drawing-derived envelopes. The Amazon Peltier uses its listed dimensional envelope, the OLED uses Waveshare's published outline, and external cable shapes illustrate connections. They are not fit-qualified mechanical CAD. Each source and fallback is recorded in [model provenance](../assets/assembly/provenance.json); generated assembly provenance also records the circuit JSON hash and per-component model URLs.

The preview omits the user's hot-side heatsink, cold plate, clamping and thermal interface. These must be fitted before operation. The product is a power driver, not a complete refrigeration system.

Before manufacture, route and review the power/return copper, Kelvin sense connections, decoupling, gate drive, EMI/ESD and heat spreading. Validate compensation across V/I settings; startup/source detach/PD resets; input inrush; output-off discharge and polarity; regulation/ripple/CC tolerances; short circuit; control-supply loss and watchdog; both USB orientations; connector/cable temperature; and sustained thermal performance. Netlist tests and a firmware cross-build do not establish these measurements.
