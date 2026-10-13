# Simple USB-C PD Peltier driver

An adjustable **voltage and current limited power driver** for two-wire DC Peltier modules, with two USB-C ports: **PD POWER** for the load and **USB PROGRAM** for firmware and serial configuration. The default module is one **HiLetgo TEC1-12706 from Amazon**, at **12 V / 5.5 A**. There are no display or buttons.

Nominal settings cover **2.1–15 V**, **0.50–6.00 A**, and **72 W maximum V × I**. Use a **100 W, 20 V / 5 A USB-C PD source** and **5 A electronically marked cable**. The converter's hardware feedback loop limits current; firmware sets the limits and rejects combinations exceeding the power budget.

## Configure once, connect PD to run

1. Fit the Peltier's hot-side heatsink and connect its two factory leads to `J_TEC`, with the intended cooling polarity.
2. Connect a computer to **USB PROGRAM**. Install the host tool's requirements, then run `python3 firmware/host/control.py configure 12.0 5.5` from the repository root.
3. Connect **PD POWER**. A valid saved profile starts after approximately one second of qualified PD power. The programming cable can be removed while the output runs.

**POWER**, **RUN**, and **FAULT** LEDs show supply, output and fault state. USB commands change/save limits, stop/start output and enter ST's native USB DFU loader. A blank board defaults to 12 V / 5.5 A with output OFF until configured or explicitly started. Protective faults latch OFF; see [firmware and recovery instructions](firmware/README.md).

For another module, configure limits within its ratings before connecting PD. The board provides fixed output polarity; temperature regulation, fan control and automatic reversal are outside this revision. Programming USB alone powers the control electronics and cannot energize the Peltier.

## Board and build

The **80 × 60 mm, four-layer board is deliberately unrouted**. It has **95 purchased component placements**, all with concrete JLCPCB identifiers, plus **15 labeled copper debug pads** for SWD, boot/reset, rails, enable, current sensing and I²C. The pads are PCB features, excluded from the purchased BOM.

```sh
bun install --frozen-lockfile
bun run typecheck
bun test
bun run build
bun run scripts/build-assembly.ts
bun run dev
```

`index.circuit.tsx` opens the complete native assembly in the dev server's **3D** tab: the board, selected Peltier and two USB cables. The **PCB** and **Schematic** tabs show the driver circuitry. External accessories use `assembly.device` / `assembly.part` CAD geometry and do not add purchased PCB parts or electrical nets. The export also produces `dist/assembly/assembly.html`, `assembly.glb` and `assembly.png`. Supplier component CAD, manufacturer drawing-derived envelopes and illustrative cable geometry are distinguished in [model provenance](assets/assembly/provenance.json).

See [design and sources](docs/general-pd-driver.md), [JLC inventory](docs/component-sourcing.csv), [stock snapshot](docs/jlc-stock-audit.json), and [firmware build/flash instructions](firmware/README.md). The Peltier and cables are separately purchased accessories. Source/netlist checks and an ARM cross-build pass; USB, power regulation and thermal performance have not been bench-tested. This unrouted prototype is not a manufacturing release.
