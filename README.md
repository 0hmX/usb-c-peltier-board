# Dual-USB-C Peltier controller

A tscircuit project with an RP2040 controller, CH224K USB-C PD input, a separate USB-C programming port, an LT3741 TEC stage, thermistor inputs and fan control.

The 110 × 85 mm, four-layer board is an **unrouted placement design**. Its schematic and device assembly are available in the normal tscircuit preview. Mechanical parts marked `CONCEPT` use approximate dimensions.

```sh
bun install
bun run dev
```

Open the URL printed by the development server to view the PCB, schematic and 3D assembly.

```sh
bun run build
bun run typecheck
bun test
```

The project uses the scripts and configuration from `tsci init`. `index.circuit.tsx` is the entry point, `src/board/` contains the board and assembly, and `src/parts/` contains component definitions. Build output goes to `dist/` and is ignored by Git. Supplier CAD models load through tscircuit's standard model URLs.

The programming port powers logic and inhibits TEC/fan operation. BOOT and RESET provide USB bootloader access. The input-loss interlock requires RUN to go low before recovery.

See the [design notes](docs/revision-b-design.md) and [input-loss interlock](docs/revision-b-interlock.md) for circuit behavior and remaining hardware qualifications. Firmware and PCB routing are not included.
