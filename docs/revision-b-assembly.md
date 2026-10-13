# Revision B assembly preview

## What is included

`index.tsx` and `assembly.tsx` both open the device-level concept using tscircuit's documented [`assembly.device`](https://docs.tscircuit.com/elements/assembly-device). The existing `DualUsbPeltierBoard` retains its schematic, PCB coordinates, connector choices and unrouted policy. Mechanical parts are native assembly CAD records, not additional PCB footprints or electrical symbols.

The populated PCB preview includes supplier CAD for imported components and both USB-C shells, generic package models for newly added passives, and a simplified molded-inductor model. Exposed test pads have no raised component body. A conceptual cooler beside the board shows a TEC, hot/cold thermal hardware, hot-side fan, PCB supports and visual harnesses. Unselected mechanical parts have `CONCEPT` names and approximate dimensions; none is a verified supplier part or fit constraint.

Washer/copper keepouts remain in the PCB source and Circuit JSON. Their red CAD hatching is excluded only from the 3D surface texture: keepout markings are review overlays, not physical silkscreen or copper.

The APS1360 model uses a nominal 12.6 mm body, 14 mm terminal span and 6 mm maximum height from the [Coilank APSW-H datasheet, page 1](https://atta.szlcsc.com/upload/public/pdf/source/20250415/98335F58913C6052021A459C2E812D31.pdf). Terminal/corner detail is simplified: this is not a supplier-authored CAD model or a guaranteed worst-case tolerance envelope.

This is a **device-level visual concept**, not a mechanically qualified cooling unit. The TEC, hot/cold thermal hardware, fan, probes, supports and wires are modeled with approximate dimensions. Actual supplier selection, clamping, mounting, cooling capacity and harness qualification remain necessary. No enclosure is modeled. The concept is not permission to run the TEC without qualified cooling.

## Outputs

- `review/assembly/index.html`: standalone rotatable viewer with embedded GLB and Three.js, no external CDN or model downloads at viewing time.
- `review/assembly/peltier-assembly.glb`: native tscircuit 3D export.
- `review/assembly/isometric.png`, `top.png`, `bottom.png`: actual CAD renders generated locally using PoppyGL, not AI illustrations.
- `review/assembly/assembly.svg` and `assembly.png`: native tscircuit assembly drawing with references and footprint outlines.
- `review/assembly/circuit.json`: compiled assembly source data.
- `review/assembly/assembly-report.json`: model provenance and parity audit.

The GLB follows the exporter's numerical millimetre coordinate convention. Apply a 0.001 scale when importing into a tool that interprets those coordinates as metres. The browser viewer frames the native model automatically.

## Regenerate and inspect

```sh
bun install --frozen-lockfile
bun test tests/assembly-models.test.tsx
bun run typecheck
bun run preview:assembly
bun run export:review
bun run dev:assembly
```

Open the standalone HTML directly for viewing or use the tscircuit dev server's 3D view. The HTML viewer needs WebGL; software-rendered PNGs and the downloadable GLB remain usable if browser 3D is unavailable.

The export script compares every PCB component pose and pin/net connection with the existing layout review, rejects routed copper/errors, and requires a rendered mesh for every populated PCB and mechanical part. Original supplier OBJ bytes and package GLBs are embedded in `src/board/bundled-cad-assets.json`. Installed-dependency builds and offline asset regeneration need no model CDN or STEP conversion.

The four targeted tests cover supplier-USB CAD forwarding, passive package models, inductor dimensions and pad-only testpoints. The revision checker still verifies the circuit connectivity. These checks do **not** certify physical clearance between 3D bodies, enclosure fit, solder joints, thermal performance, component tolerances, USB behavior or fabrication readiness.

The earlier headless Firefox check has no available GL driver; its standalone-page fallback results remain in `review/assembly/browser-check.json`. The native tscircuit preview uses Chromium/SwiftShader: PCB opens first, Schematic and 3D remain available, with no iframe or surrounding review-page copy. The current USB-C-only programming build contains 242 populated PCB models and 29 mechanical models. The saved browser-check reports describe the earlier build with UART/SWD/service headers; the regenerated local renders, Circuit JSON and assembly report describe the current board. Content-addressed supplier/package assets, Manifold WASM and Latin glyph fallback are hosted alongside the viewer. Software-rendered previews and GLB parity checks remain separate from browser testing. Neither test certifies enclosure fit, manufacturing clearance or real hardware operation.

`review/assembly/native-browser-check.json` verifies actual geometry and full-device viewport framing in three scenarios: normal browser storage, genuinely full localStorage, and full localStorage with cross-origin model requests blocked. All 278 CAD models from the earlier build render in each scenario, without STEP/OCCT conversion. Five optional native-viewer preference writes are guarded in the pinned hosted bundle; browser storage APIs and project data are untouched. `review/source-browser-check.json` separately verifies both complete source entrypoints in browser evaluator 0.0.1596 with remote imports blocked. `review/assembly/resilience-parity.json` records exact equality of the original electrical, schematic and PCB geometry records.

## Extend the mechanical assembly

Replace conceptual mechanical geometry with measured/vendor models using [`assembly.part`](https://docs.tscircuit.com/elements/assembly-part), [`assembly.subassembly`](https://docs.tscircuit.com/elements/assembly-subassembly) and [`cadmodel`](https://docs.tscircuit.com/elements/cadmodel). Supply the actual datum, millimetre scale and transforms; do not scale a visual guess into a manufacturing constraint. PCB centre plane is Z = 0 and its top surface is Z = 0.8 mm.

The cold-side interface, TEC polarity, hot-side heatsink/fan, clamping pressure, mounting tolerances and airflow require actual part selection and qualification. Visual harness paths indicate intended destinations, not validated wire lengths, mating connector pinouts or electrical connections. The fan's JST SH adapter must stay within a qualified 1 A/AWG28 limit including startup, stall and derating. TEC power uses its separate high-current terminal. Programming USB inhibits both TEC and fan; the concept does not imply a fan-cooldown override.

## Browser model loading

Portable supplier/package assets are bundled with the source rather than fetched from an origin-dependent model CDN during viewing. Model origins, scales and rotations remain unchanged. Populated model alternatives omit STEP fallback, so a stale CORS response cannot trigger heavyweight STEP conversion or fill the converted-model localStorage cache. The hosted native viewer additionally serves content-addressed models from its own origin. Browser resilience checks block the model CDN and fill localStorage while verifying actual rendered geometry, not just Circuit JSON records. No project data or browser cache is cleared by the preview.

No routing, purchase, public upload or fabrication output is performed by the assembly-preview workflow. All release gates in `revision-b-design.md` remain open.
