# Simple USB-C PD Peltier driver

An adjustable **voltage and current limited power driver** for two-wire DC Peltier modules. The default design target is one **HiLetgo TEC1-12706 from Amazon**, at **12 V / 5.5 A**, with output **OFF** at startup. Other modules can be used within the specified range after checking their ratings and qualifying the thermal installation.

The nominal settings cover **2.1–15 V**, **0.50–6.00 A**, and **72 W maximum V × I**. A **100 W, 20 V / 5 A USB-C PD source** and **5 A electronically marked cable** are required. Current limiting is performed by the converter's hardware feedback loop. The firmware sets the limits and refuses combinations exceeding the power budget.

## Simple controls

1. Connect the Peltier's two leads to `J_TEC`, with the intended cooling polarity. Fit its hot-side heatsink before powering it.
2. Connect the small Waveshare OLED using the specified keyed cable. Apply USB-C power; the output starts OFF with the TEC1-12706 defaults.
3. While OFF, tap **SET** to select voltage or current and use **− / +** to adjust its limit.
4. Hold **SET** for 0.8 seconds to RUN. While running, press **SET** to stop. Stop before editing limits.

The screen shows the selected limits, approximate measured V/A, OFF/RUN, and CV/CC regulation state. Settings reset to the default on every power cycle. The board supplies a fixed polarity; temperature regulation and automatic heating/cooling reversal are outside this revision.

## Board and build

The **80 × 60 mm, four-layer board is deliberately unrouted**. Source/netlist checks, placement checks, and an ARM firmware cross-build pass; electrical operation has not been bench-tested. The range and power figures are prototype design targets, with analog tolerances and thermal qualification still required. This source is not a manufacturing release.

```sh
bun install --frozen-lockfile
bun run typecheck
bun test
bun run build
bun run assembly
bun run dev
```

`index.circuit.tsx` builds the single board. `dist/assembly/index.html` is a self-contained interactive assembly view with the actual PCB/component placement, the selected Peltier, OLED and cable connections. `dist/assembly/assembly.glb` and `assembly.png` are generated alongside it.

All placed PCB components carry concrete JLCPCB catalog identifiers. See [design and sources](docs/general-pd-driver.md), [component inventory](docs/component-sourcing.csv), and [firmware build/flash instructions](firmware/README.md). The OLED, Peltier and cables are separately purchased accessories. Supplier CAD and manufacturer drawing-derived envelopes are distinguished in [assembly model provenance](assets/assembly/provenance.json).
