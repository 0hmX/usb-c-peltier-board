# USB-C Peltier development board

A tscircuit prototype targeting **15/20 V USB-C PD input and an 11.2 V TEC output**, with cooling-only control, 8 debug LEDs and 26 test points. All 194 fitted components retain their reviewed JLCPCB mappings, pads, drills, courtyards and placement.

The default entry displays the checked `archive/captured-pcb/circuit.json` directly. `index.tsx` imports and exports that JSON; the preview uses the native static Circuit JSON viewer. Viewing or building the publication runs no routing algorithms. The saved capture preserves all 636 traces, 434 through vias and 31 actual pours.

The editable board is retained in `regenerate.tsx`. Its algorithms, source paths and original configuration remain available for explicit regeneration. Both router helpers use the declared `eventemitter3@5.0.4` runtime dependency.

The current silkscreen has 22 text elements, down from 234. Connector names, TEC and capacitor polarity, eight LED functions, board identity and a short heatsink reminder remain. Component names, probe labels and nonpolar capacitor/inductor outlines were removed; all 7,799 non-silkscreen records are identical to the checked Source24 capture. Labels use 1.7 mm font size, and both alphabet and Gerber geometry checks pass with at least 0.15 mm clearance. [Verification](../archive/publication-checks/silkscreen-cleanup.json) records the current hashes and checks.

![Reduced top silkscreen](../archive/captured-pcb/silkscreen-top.png)

Bottom headers, viewed left to right in the top view:

| Header | Pin order |
|---|---|
| FAN | PWM, TACH, +12V, GND |
| SWD | GND, SWCLK, SWDIO, 3V3 |
| UART | 3V3, RX, TX, GND |

The small circle marks pin 1, the rightmost header pin. HOT and COLD take two-wire thermistors; TEC+ is the lower output pin. Probe names, nets and coordinates remain in [debug-data.ts](../src/legacy/blocks/debug-data.ts), with an annotated [probe map](../archive/captured-pcb/probe-map.png) for bench work.

Source24 connects **450/450 required pad joins, 0 missing**. Fresh all-layer Gerber shorts, independent native copper checks and routing lint pass. Twenty agent reviewers, including five Astra/high agents, give the whole board **7.7/10** on average (range 7.1–8.4); Source23 averaged 7.2/10.

| Measured routing | Source23 | Source24 |
|---|---:|---:|
| eFuse output-cap feed |23.026 mm|3.174 mm|
| CdVdt signal path |11.013 mm|5.568 mm|
| VC compensation path |15.185 mm|12.688 mm|
| Complete LOW gate path |28.335 mm|26.402 mm|
| Protected fan feed |90.592 mm|81.922 mm|
| Signal routing on inner1 |327.930 mm|289.687 mm|
| Total planar trace |4078.583 mm|4044.303 mm|
| Through vias |433|434|

The output-cap move lengthens its permission pickup by 10.586 mm; this cost is included in the total savings. The shared 3.3 V branch replaces one redundant trace and via. A moved ground probe makes ADC measurements easier; its label clears the actual mask openings and nearby legend. Both moved capacitors retain authentic supplier courtyards.

This remains a static CAD prototype. Hardware bench validation and manufacturing exports/tolerances are pending. Long gate/fan/UART paths, a remote raw-input bypass and remaining inner1 corridors are documented in the reviews. The closest foreign via pair is 0.175 mm against the established 0.15 mm rule; several other routes retain tight nominal margins.

- [Saved JSON export](../index.tsx), [checked circuit JSON](../archive/captured-pcb/circuit.json), [regeneration board](../regenerate.tsx) and [ground-plane view](../archive/captured-pcb/19-source-routing-improved-ground-inner1.png)
- [All 20 exact-capture routing reviews](../archive/routing-review/source24/README.md), [qualification](../archive/routing-review/source24/qualification.json) and [checks](../archive/routing-review/source24/checks)
- [Source23 review](../archive/routing-review/rating-report.txt) and [original crossing annotation](../archive/routing-review/suspected-short-net-review.png); the crossing is intentional shared V3V3 copper
- [Published tscircuit package](https://tscircuit.com/0hmX/tec-usbc-board)

Clone and preview the saved board:

```sh
git clone https://github.com/0hmX/usb-c-peltier-board.git
cd usb-c-peltier-board
bun install --frozen-lockfile
bun run typecheck
bun run dev
```

The saved preview needs no captured runtime patches. For explicit regeneration, restore the six captured runtime files after installation; the helper verifies package versions and every file hash before copying.

`bun run build` also reads and copies the saved JSON. To explicitly regenerate the source routes and pours:

```sh
python3 scripts/restore-captured-runtime.py
bun run build:regenerate -- --placement-only --pcb-only --phase-timeout-seconds 900
```

A new capture needs fresh geometry checks.

The routing algorithms and configuration remain available in `regenerate.tsx` and `regenerate.config.ts`. Regeneration source and imported parts carry the same silkscreen cleanup as the saved preview; all copper geometry and six captured runtime payloads remain unchanged. The default entry retains its two-file browser import graph and builds the current saved JSON unchanged. [Original publication verification](../archive/publication-checks/static-preview.json) and historical routing snapshots describe the capture before silkscreen cleanup. [Current provenance](../archive/publication/PACKAGE-PROVENANCE.json), [Source24 routing provenance](../docs/source24-routing-provenance.json), [Source23 provenance](../docs/source23-package-provenance.json) and [original package README](../docs/captured-source-package-README.md) distinguish the publication wrapper from the checked CAD capture. Supplier snapshots record stock observed on their stated dates.

The project retains its declared MIT license. Captured runtime packages retain their [upstream license notices](../docs/third-party-licenses).
