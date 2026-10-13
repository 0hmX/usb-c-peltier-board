# USB-C power for one TEC1-12706

Power the common **40 × 40 mm TEC1-12706 Peltier module** from a **100 W USB-C PD charger or power bank** and a **5 A electronically marked USB-C cable**. One USB-C input and one fixed-polarity, nominal 12 V screw-terminal output. Plugging in power starts the module once the input qualifies.

The design target is a 6 A output. A standalone CYPD3177 PD sink requests 20 V / 5 A and feeds a TPS56837 buck converter. A PFET pair gates the power path; PD fault and input undervoltage inhibit the converter. No firmware or programming connector is needed.

The old processor, flash, crystal, programming USB port, DAC, current monitor, thermistor interfaces, fan controller and assembly model have been removed. The supplied TEC leads go into the two-pin output terminal; use a heatsink and suitable airflow.

**Prototype status:** the 60 × 40 mm, four-layer board is an unrouted schematic and placement design. The 6 A target, source rejection, startup, output ripple, copper, connector temperature and thermal performance require routed-board and bench validation before manufacture. Converter short-circuit protection is not a precise 6 A TEC current limiter. An inadequate charger is rejected; there is no reduced-power mode.

```sh
bun install --frozen-lockfile
bun run typecheck
bun test
bun run build
bun run dev
```

See [design and sourcing notes](docs/tec1-12706-pd.md) for component references, wiring and qualifications. `index.circuit.tsx` is the entry point. Build output goes to `dist/` and is ignored by Git.
