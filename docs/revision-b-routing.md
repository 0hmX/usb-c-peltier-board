# Revision B routing

`routed.tsx` adds explicitly saved copper to the 110 × 85 mm, four-layer Revision B
board. `routing-placement.tsx` contains the clean routing placement. Small routing
placement changes are isolated in `src/board/routing/layout-overrides.json`;
`index.tsx` and `assembly.tsx` retain their original unrouted placement. Component
models and schematic net assignments are preserved.

Ten routing-only agents worked on USB, TEC power, ground/supply, MCU/flash/crystal,
PD/eFuse, TEC analog, interlocks, thermal sensors, fan, and I2C/debug. Three Astra
agents owned USB, TEC power, and ground. Their plans cover all 135 nets, 733
connected pads, 408 non-ground tree edges, and 191 ground pads. Actual results and
counts are recorded in [routing-report.json](../review/routing/routing-report.json)
and [validation.json](../review/routing/validation.json), rather than inferred from
endpoint labels or plan membership.

## Review snapshot

The current snapshot is deliberately incomplete, as requested for sharing and
review. See [unfinished connections](../review/routing/pending-connections.md) for
planned gaps and physical copper islands. `check:routed` exits nonzero until all
connectivity, bypass and Kelvin obligations pass; this draft does not hide those
failures. The placement CLI also retains five orientation suggestions while
native placement DRC reports zero errors. Full CAD qualification is a later gate.

## Copper and local routing

Inner1 carries the ground reference; pad connectivity is audited separately. Inner2 carries a 3.3 V plane and signal
routes; top has supplemental ground fill. A stitched bottom GND region follows
the inner2 USB pair. The matched USB routes use identical numbers of layer
transitions. Actual lengths and reference coverage are checked separately from
fabricator-specific differential impedance.

Main TEC and fan supply paths use wide copper and explicit parallel through-via
arrays. The controller exposed pad has four independent 1.2 mm ground returns.
The shunt has separate controller and monitor pickups. Kelvin branches may meet
load copper only on their exact shunt solder lands; same net names do not permit
sharing auxiliary or load-current copper elsewhere.

Ordinary through vias have 0.30 mm drills and 0.70 mm pads and span all four layers.
No via-in-pad exception is used. Local chip bypasses have explicit exposed-copper
bounds; the two constrained MCU bypasses at pins 43/44 use justified 2 mm limits
with geometric lower-bound evidence. Bulk-capacitor distribution is budgeted as
power routing. Authoring bounds include solder-pad interiors where the pinned
core retains them; the independent auditor subtracts the actual attached pad
metal and drill voids before enforcing exposed lengths.

## Reproduction and validation

```sh
bun run route:revision-b
bun run build:routed
bun run check:routed
bun run node_modules/tscircuit/cli.mjs check shorts dist/routed/circuit.json --mode gerber --layer all
bun run export:routed
bun run typecheck
bun test
```

The router builds and captures the clean routing placement and rejects stale
coordinates, pads, layers, net assignments, missing ports, or duplicate net
ownership. Critical power, ground returns, USB and MCU fanouts precede control
routing. A bounded search tries declared layers and legal ordinary through-via
transitions against actual polygon pads, finite-width copper, mounting keepouts,
and drills. All accepted geometry is saved in `generated.json`. Failed candidates
remain diagnostics; they are not silently rendered as unchecked copper.

`check:routed` compares every native trace and barrel against accepted geometry
and all placements/net assignments against the clean routing baseline. It runs
native placement, netlist, length and routing checks plus independent audits:

- [Physical connectivity](../review/routing/physical-connectivity.json) measures
  actual finite copper overlap and plated barrels, subtracts physical drills,
  splits disconnected BREP pour pieces, and requires one connected component per
  net. It also checks the full USB inner2 trace projection against actual bottom
  GND copper, allowing only the pair's real endpoint antipads.
- [Bypass lengths](../review/routing/bypass-length-validation.json) cuts each route
  against its attached rectangular, rotated, concave, circular or annular lands.
  Cached route lengths and endpoint names cannot establish compliance.
- [Kelvin routing](../review/routing/kelvin-routing-audit.json) checks physical
  branch continuity, finite-width contacts, independent shunt exits, and real
  top/bottom connection of every current-transfer array member.

The optional `clean:routed-pours` command removes physically floating fill pieces
after actual drill subtraction. Only components containing exclusively pour copper are eligible;
any piece attached to a pad, trace or barrel is retained, including disconnected
pad islands. Exact removed polygons and independent before/after connectivity
partitions are recorded in `pour-cleanup.json`.

[USB route lengths](../review/routing/usb-routing-audit.json) are derived from
actual native copper for both connector orientations, with equal layer transition
counts and a 0.05 mm skew limit.

All reports identify the exact native circuit hash. Regression fixtures include
misleading endpoint labels, drill-split copper, isolated same-net pours, split USB
references, concave pad clipping, cached-length errors, and auxiliary copper
sharing a Kelvin branch. Narrow native geometry exceptions retain exact contact
or clearance evidence; shorts and disconnected pads are never waived.

The four-layer [review page](../review/routing/index.html) is generated from the
same native Circuit JSON used for validation. The Gerber-derived all-layer shorts
check is recorded separately in `shorts-check.txt`.

## Hardware qualification

CAD routing completion does not establish the manufacturing stackup, USB
impedance, via ampacity, thermal performance, or bench behavior. The proposed
1.6 mm FR4 stackup places thin dielectrics next to both USB reference surfaces;
the fabricator must confirm the actual copper and dielectric construction and
impedance. Fan connector limits, power startup/current/temperature behavior, and
external heatsink/harness qualification remain hardware responsibilities. This
work does not place fabrication orders or publish a manufacturing release.
