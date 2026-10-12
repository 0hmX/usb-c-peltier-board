# Expert review integration

The reviews below describe the original Revision B with UART/SWD headers. The current USB-C-only programming change removes those headers, their resistors and the SERVICE jumper; its regenerated validation is in `review/checks.json`.

Six domain reviewers were used during the architecture/layout work. The table records their concrete findings and integration, not a numerical certification or fabrication approval.

| Role | Finding integrated |
|---|---|
| USB-C / CH224K PD architect | Correct physical CH224K pin mapping, resistor-fed VDD, isolated CFG controls, conservative adapter-current policy and voltage-window tolerance. |
| RP2040 hardware engineer | Full supply/flash pin audit, distinct RUN/reset and load permission, ADC filtering, proper crystal part/load network and USB VBUS detection. |
| USB / power isolation specialist | Reverse-blocked logic rails, hardware USB data disconnection without programming VBUS, programming load inhibit and leakage screening. |
| Power-converter layout engineer | Authentic supplier footprints/courtyards, MOSFET/controller/inductor/shunt cluster, gate-resistor proximity and clearance correction. Routing/thermal qualification remains open. |
| Fail-safe / Peltier controls engineer | Preserved hardware fault/thermal latches, raw-VBUS sensing, explicit SWD service inhibit and no invented CH224K current readback. |
| Standard programming-interface expert | Actual standard JST target connector exports and pinout, verified BOOT/RESET contact pairs, no debugger-voltage-output connection to the target. |

Final validation is stored in `review/checks.json`. It verifies connectivity and CAD placement, not operation under temperature, transients, USB enumeration, firmware faults or loaded TEC operation. The detailed open release gates are in `revision-b-design.md`.

## Device assembly review

Four additional agents worked on the device assembly: mechanical concept implementation, byte-preserving portable CAD assets, native browser resilience verification, and read-only electrical/mechanical safety review. Their integration adds 29 explicit concept parts without altering PCB geometry, pin/net records or the eight schematic sheets. Actual mesh and viewport checks pass with the model CDN blocked and localStorage full. Approximate geometry, TEC face polarity, thermal sizing, fastening and harness selection remain unqualified; this review does not approve fabrication or powered operation.
