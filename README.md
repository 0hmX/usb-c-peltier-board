# Programmable dual-USB-C Peltier board

**Revision B is an unrouted placement-review design, not a fabrication release.**

The default `index.tsx` builds a **110 × 85 mm, four-layer** board with:

- **RP2040** controller, W25Q16 QSPI flash, 12 MHz crystal, BOOT/RESET buttons and local decoupling.
- **CH224K** PD controller and three open-collector selection buffers, following the referenced motor-controller architecture.
- Two independent standard USB-C receptacles: **PD POWER** and **USB PROGRAM**.
- Actual `StandardJstSwdSide` and target-role `StandardJstUartSide` exports from the standard JST programmer package; HOT/COLD and fan use the same side-entry JST SH family.

The three standard connector exports are included as a connector-only snapshot of v0.8.0 in `src/revision/parts/standard-jst-programmer.js`. This avoids the upstream full-programmer module's unrelated `fanoutTracePath` initialization, which fails in the browser evaluator's bundled props version. Geometry, pin labels and supplier CAD are unchanged and compared with the installed module in tests; hashes and provenance accompany the snapshot. Both source entry points are also tested with registry/CDN loading unavailable.
- Retained LT3741 current-controlled TEC stage, protected input, thermal interlocks, fail-off latches, fan circuit and test access.

## Review the result

Open [the local review page](review/index.html), [placement image](review/placement.png), or [vector placement](review/placement.svg). Eight schematic sheets live in [review/schematics](review/schematics). [Component coordinates](review/placement.csv), [Circuit JSON](review/circuit.json) and [checks](review/checks.json) accompany the previews.

### Device concept assembly

The [published native tscircuit build](https://0hmx--dual-usb-peltier-assembly-v0-1-4.tscircuit.app/#file=assembly.tsx) provides PCB, Schematic and 3D tabs. Select 3D and zoom out to see the complete device.

![Device concept assembly](review/assembly/isometric.png)

Open the [rotatable 3D assembly](review/assembly/index.html), [isometric preview](review/assembly/isometric.png), [native assembly drawing](review/assembly/assembly.svg), or [GLB model](review/assembly/peltier-assembly.glb). The standalone viewer embeds its renderer and model; it does not require a server or CDN. WebGL is needed for interaction, with saved images available as a fallback.

`index.tsx` and `assembly.tsx` now open the complete device concept in tscircuit's documented [`assembly.device`](https://docs.tscircuit.com/elements/assembly-device), not just the PCB. The native PCB and eight schematic sheets remain available. The 3D view additionally includes a conceptual TEC, hot/cold thermal hardware, fan, mounting supports and visual harnesses beside the unchanged controller board. Supplier component models and their transforms are preserved; test pads remain flat copper. See [assembly scope and regeneration](docs/revision-b-assembly.md) and the [model/parity audit](review/assembly/assembly-report.json).

```sh
bun run preview:assembly
bun run dev:assembly
```

External mechanical parts are explicitly named `CONCEPT`; their approximate dimensions illustrate arrangement, not supplier identity, thermal performance, harness qualification or fabrication-ready fit. No enclosure or airflow performance is certified. The fan and its harness still need qualification within the JST SH connector's 1 A limit, including startup and stall. The high-current TEC retains its separate power terminal. Visual wires do not add electrical nets or establish a validated wiring harness. Routing and all previous release gates still apply.

![Unrouted placement](review/placement.png)

The board deliberately contains **no PCB traces, vias or copper pours**. Component pads and courtyards are real CAD geometry, not an illustrative mockup. Four 3.2 mm mounting holes have 4 mm-radius washer/copper keepouts. Copper routing, thermal spreading, controlled USB impedance and manufacturing qualification come later.

## Reproduce

```sh
bun install --frozen-lockfile
bun run typecheck
bun run build:review
bun run check:revision
bun run export:review
bun run dev
```

`build:review` does not route the board. The revision-specific checker verifies retained and critical new pin/net assignments, two standard USB connectors, schematic-sheet coverage, placement errors, courtyards and absence of routed copper. Native tscircuit netlist and placement checks supplement this; none constitutes analogue simulation or bench validation.

Geometric DRC passes and schematic placement analysis is clear. The separate [PCB placement analysis](review/placement-check.txt) retains 25 routing-oriented component-flip suggestions for the later routing phase; its advisory exit status is not a geometric DRC failure. Generic-passive sourcing and schematic-sheet-format warnings remain in the validation report.

PCB coordinates are explicitly editable in `src/revision/clearance-placements.ts`; schematic refinements are in `src/revision/schematic-refinements.ts`. Changing a footprint or coordinate requires fresh checks and preview exports.

## Power and service behavior

- PD-only: the logic runs at the initial 5 V supply; firmware may request qualified 15/20 V operation. Load permission remains hardware gated.
- Programming-only: USB supplies logic through a separate OR diode. It does **not** feed the TEC/fan power rail.
- Programming cable connected: a hardware transistor inhibits **both TEC and fan power**, regardless of MCU/boot-ROM behavior. A USB data switch isolates D+/D− when programming VBUS is absent.
- SWD servicing: **short the SERVICE header before debugging**. Halting the CPU alone does not guarantee that GPIO permissions are withdrawn.
- CH224K does not expose negotiated current/capabilities. Do not infer a 3/5 A contract from voltage or PG. Use a qualified ≥3 A adapter and a conservative firmware budget; the former selectable high-current eFuse mode is removed.

See [design notes and open qualifications](docs/revision-b-design.md) and [expert-review findings](docs/revision-b-reviews.md). Firmware is not included.

## Sources and history

- [Original Peltier project](https://github.com/0hmX/usb-c-peltier-board), base commit `64439f138ed1e1dc0822179b549ba1345b93a390`.
- [RP2040 motor-controller reference](https://tscircuit.com/imrishabh18/rp2040-motor-controller), v1.0.42.
- [Standard JST programmer](https://tscircuit.com/tscircuit/standard-jst-programmer), v0.8.0, installed via the tscircuit registry.

The earlier routed single-USB/STM32/STUSB4500 source is preserved in `legacy.tsx` and `regenerate.tsx`; its saved capture remains in `captured-pcb/`. [Historical documentation](docs/legacy-readme.md) describes that revision only. Its routing measurements, electrical checks and assembly exports do **not** apply to Revision B. No fabrication files or orders are generated for this unrouted design.
