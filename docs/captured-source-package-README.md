# USB-C Peltier controller PCB

Open `index.tsx` to edit the tscircuit board. The 150 captured source files are preserved byte for byte. Corrected supplier part imports and their JLCPCB mappings are preserved in `src/`. The captured board includes 8 debug LEDs and 26 test points.

```sh
bun install --frozen-lockfile
python3 restore-captured-runtime.py
bun run typecheck
bun run dev
```

Restore the six captured runtime files after dependency installation. They contain the approved routing and via fixes used by this PCB capture. The helper verifies every file and the installed package versions before copying them.

`captured-pcb/circuit.json` and the PNG views show the checked board: 450 of 450 minimum required pad connections joined, 0 missing. The build manifest and scoped checks are included beside them. This is a prototype source package; manufacturing release and physical hardware validation remain separate.

The input soft-start routing and remote input-protection output capacitor still need bench checks for startup, discharge transients and noise. Their preserved prototype review is included in the scoped evidence.

Saved supplier observations map 194 fitted components to 66 distinct JLCPCB part identifiers, observed from 2026-10-10T03:33:50.236011+00:00 through 2026-10-10T14:01:37.782802+00:00. The 99 original import snapshots and 66 official supplier snapshots are included under `captured-pcb/supplier-evidence/`. These dated observations do not establish current stock or order availability.


`bun run build -- --placement-only --source-precomputed-only --pcb-only --phase-timeout-seconds 900` regenerates the source routes and copper pours using the reviewed source routing path. A new build produces a new capture and needs its own geometry checks.

The original package scripts are preserved. These archived aliases refer to tooling outside this compact package: `check:guarded`, `check:physical`, `check:routed`, `export:jlcpcb`, `export:kicad`, `export:previews`, `prepare:assembly`. Use the available edit, typecheck and build commands above.
