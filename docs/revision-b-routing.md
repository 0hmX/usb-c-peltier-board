# Revision B routing in progress

`routed.tsx` adds explicitly saved copper to the current 110 × 85 mm four-layer
Revision B placement. `index.tsx` and `assembly.tsx` preserve the unrouted baseline.
No schematic assignments or component placements are changed by the routing pass.

Ten routing-only agents contributed endpoint trees for USB, TEC power, ground and
logic supply, MCU/flash/crystal, PD/eFuse, TEC analog, interlocks, thermal sensors,
fan and I2C/debug. Three agents used Astra for USB, TEC power and ground/supply.
The plans in `src/board/routing/` cover every connected pad of all 135 nets.
Their 408 non-ground edges are topology and routing constraints, not a claim that
all endpoints have fabricated copper.

The first pass realizes 322 edges as 694 explicit trace pieces with 313 ordinary
0.30 mm-drill, 0.70 mm-pad through vias. Eighty-six edges remain pending. Of 191
ground ports, 185 have a declared off-pad escape to a through barrel or a plated
land reaching inner1; six escapes remain pending. This does not prove that all
ground pads reach one continuous ground island. The native inner1 pour is included
for inspection, and its continuity remains unqualified.

`review/routing/routing-report.json` records each successful and pending edge,
width, layer preference, length target and reviewer note. The review page displays
all four native copper layers. `validation.json` records source/geometry parity,
placement, netlist, geometric routing checks and remaining connectivity diagnostics.
`shorts-check.txt` records the separate Gerber-derived copper check on all layers.

## Routing method

`route:revision-b` builds the clean current placement before routing. The router
rejects missing/added ports, changed net assignments, pad geometry, coordinates
and layer availability against the captured inventory. It validates exclusive
net ownership and complete endpoint trees. It then performs a bounded sequential
path search against conservative pad bounds, mounting-hole keepouts, physical
drills and previously accepted copper. Literal widths and maximum lengths are
kept; a failed route remains in the pending list. Layer preferences are tried in
their declared order. Unsupported explicit waypoint constraints fail validation.

All generated vias span top, inner1, inner2 and bottom; inner1 is reserved for GND.
Vias stay outside solder pads, including pads of their own net. The renderer
registers real inner2 ports on through vias because the pinned core constructs
outer ports before parenting. Numeric manual-path points use the authored
component anchor and inverse component rotation. USB connector bounding-box
centers differ from those anchors, so their display offsets are used explicitly.
`check:routed` compares every actual native path and barrel with the geometry
accepted by the router and verifies retained placements/net assignments.

The bounded search is conservative and does not prove that pending routes are
impossible. In particular, polygon/rotated-pad bounding boxes can reject otherwise
feasible exits. The generated copper is deterministic routing progress, not an
optimized or qualified layout.

## Remaining routing and release work

- Complete the 86 pending edges and six ground escapes; verify physical net
  connectivity after every routing change. USB D− at the MCU remains pending.
- Add short pad necks and broad current corridors at the eFuse. Several main
  power and bootstrap connections remain missing; this board cannot operate.
- Replace provisional 0.20 mm GND escapes and individual signal-size vias where
  TEC/buck power returns need broad copper and qualified via arrays. Broad power
  traces that change layers also need qualified current-transfer arrays.
- Review dedicated shunt Kelvin paths. Positive/negative branches currently
  have different layer transitions, and the first-pass search unions same-net
  copper. Separate load-current paths and sensitive pickups explicitly.
- Couple and length-match the USB pairs, qualify differential impedance against
  the manufacturing stackup and verify reference-plane returns at transitions.
  Trace width and per-edge detour limits do not establish USB signal integrity.
- Verify a continuous inner1 GND island, adequate stitching, exposed-pad returns,
  local decoupling and compact switching/gate/bootstrap loops.

The routing checker distinguishes expected missing connectivity in this first
pass from physical geometry failures. The current native audit also reports 65
unmet inherited 1 mm capacitor trace-length constraints; `check:routed` exits
nonzero for these and retains every diagnostic. Four native geometry diagnostics
have separate exact-geometry evidence: three circular keepout cases have positive
copper clearance, and the eFuse EN trace has 0.0518 mm² of conservative copper
contact with its concave land despite the port center lying just outside it.
These exceptions do not suppress shorts or length failures.

Pending connectivity and length constraints remain release failures. Power, thermal, USB and hardware
qualification remain false. No fabrication outputs, orders or published board
release are produced by this work.
