import { mkdir, copyFile } from "node:fs/promises"
import { convertCircuitJsonToPcbSvg, convertCircuitJsonToSchematicSvg } from "circuit-to-svg"
import { Resvg } from "@resvg/resvg-js"
import type { AnyCircuitElement } from "circuit-json"
import { schematicSheets } from "../src/revision/schematic"

const circuit: AnyCircuitElement[] = await Bun.file("dist/index/circuit.json").json()
await mkdir("review/schematics", { recursive: true })
const pcbSvg = convertCircuitJsonToPcbSvg(circuit, {
  width: 1600, height: 1250, showCourtyards: true, shouldDrawRatsNest: false,
  shouldDrawErrors: true, shouldDrawWarnings: false, backgroundColor: "#0f172a", includeVersion: false,
  colorOverrides: { copper: { top: "#f3bc68" }, drill: "#f8fafc", boardOutline: "#94a3b8", silkscreen: { top: "#e2e8f0" }, courtyard: { top: "#59757a" }, keepout: "#b66d88" },
})
await Bun.write("review/placement.svg", pcbSvg)
await Bun.write("review/placement.png", new Resvg(pcbSvg).render().asPng())
const pages: { name: string; title: string; filename: string }[] = []
for (const sheet of circuit.filter(item => item.type === "schematic_sheet")) {
  const name = sheet.name ?? "sheet"
  const filename = String(sheet.sheet_index).padStart(2, "0") + "-" + name.toLowerCase()
  const svg = convertCircuitJsonToSchematicSvg(circuit, { schematicSheetId: sheet.schematic_sheet_id, width: 2400, height: 1700,
    shouldDrawErrors: true, shouldDrawWarnings: false, includeVersion: false })
  await Bun.write("review/schematics/" + filename + ".svg", svg)
  await Bun.write("review/schematics/" + filename + ".png", new Resvg(svg).render().asPng())
  pages.push({ name, title: schematicSheets.find(([sheetName]) => sheetName === name)?.[1] ?? name, filename })
}
await copyFile("dist/index/circuit.json", "review/circuit.json")
const components = circuit.filter(item => item.type === "source_component")
const poses = circuit.filter(item => item.type === "pcb_component")
const csv = ["Reference,X_mm,Y_mm,Rotation_deg,Layer,Manufacturer_part_number"]
for (const pose of poses) {
  const part = components.find(item => item.source_component_id === pose.source_component_id)
  csv.push([part?.name, pose.display_offset_x ?? pose.center.x, pose.display_offset_y ?? pose.center.y, pose.rotation, pose.layer, part?.manufacturer_part_number ?? "UNQUALIFIED"].map(value => JSON.stringify(String(value))).join(","))
}
await Bun.write("review/placement.csv", csv.join("\n") + "\n")
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dual USB-C Peltier — placement review</title><style>
*{box-sizing:border-box}body{margin:0;background:#0b1220;color:#e2e8f0;font:16px/1.6 system-ui,sans-serif}main{max-width:1260px;margin:auto;padding:48px 28px}h1{font-size:42px;line-height:1.15;margin:12px 0}h2{font-size:26px}small,.muted{color:#9caec4}a{color:#80d8e8}img{width:100%;border:1px solid #334155;border-radius:12px}section{margin-top:40px}.pill{display:inline-block;border:1px solid #3b5966;border-radius:99px;padding:5px 14px;margin:0 6px 8px 0;color:#a7e7dd}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px}.card{background:#131f31;border:1px solid #2a3c52;border-radius:12px;padding:18px}.warn{border-left:4px solid #f3bc68;padding:12px 20px;background:#28261f}summary{cursor:pointer;font-size:20px;padding:16px 0}code{color:#a7e7dd}p{max-width:920px}.sheet{background:#f4f0ea;border-radius:12px;margin:16px 0}.sheet img{border-radius:12px}footer{margin-top:48px;border-top:1px solid #334155;padding-top:16px}</style><main>
<small>HARDWARE CONCEPT · REVISION B · UNROUTED CAD REVIEW</small><h1>Two USB-C ports.<br>One programmable Peltier controller.</h1><p class="muted">RP2040 control with CH224K power negotiation. Separate USB-C power and programming ports, BOOT/RESET access, and the retained current-controlled TEC power stage.</p><span class="pill">110 × 85 mm</span><span class="pill">4-layer target</span><span class="pill">${poses.length} PCB components including test points</span><span class="pill">No copper routing</span>
<section><h2>Placement / top view</h2><a href="placement.svg"><img src="placement.png" alt="Actual unrouted PCB footprint placement with mounting keepouts"></a><p><a href="placement.svg">Vector layout</a> · <a href="placement.csv">Component coordinates</a> · <a href="circuit.json">Editable Circuit JSON</a> · <a href="checks.json">Validation report</a></p><div class="grid"><div class="card"><b>Left edge · two independent USB ports</b><p>PD power above; RP2040 programming below. CH224K is next to the power connector. USB data protection and isolation stay beside the programming port.</p></div><div class="card"><b>Upper right · Peltier power</b><p>Input capacitor bank, MOSFET pair, LT3741 controller, inductor and Kelvin shunt cluster toward the TEC terminal.</p></div><div class="card"><b>Lower left · processor / service</b><p>RP2040, external flash, crystal and local decoupling. USB-C-only programming with physical BOOT/RESET access.</p></div><div class="card"><b>Lower right · sensing / cooling</b><p>Thermistors and safety comparators separate from the switching stage. Fan converter and connector remain at the right edge.</p></div></div></section>
<section class="warn"><b>Review prototype — not fabrication-ready.</b><p>Programming USB inhibits both TEC and fan power. No firmware is included. CH224K does not report the adapter’s current capability: qualify a ≥3 A adapter before enabling a load. Routing, thermal analysis, USB current/ESD qualification, component ratings and bench tests remain required. See the repository design notes for all limits.</p></section>
<section><h2>Eight-sheet schematic</h2><p class="muted">Named nets are shared between sheets. Symbols, connections and footprints come from the actual circuit build; these are not illustrative renderings.</p>${pages.map(page => `<details ${page.name === "MCU" ? "open" : ""}><summary>${page.title}</summary><p><a href="schematics/${page.filename}.svg">Vector schematic</a> · <a href="schematics/${page.filename}.png">PNG</a></p><div class="sheet"><a href="schematics/${page.filename}.svg"><img loading="lazy" src="schematics/${page.filename}.png" alt="${page.title}"></a></div></details>`).join("")}</section><footer>Actual tscircuit CAD · No routing, purchasing or publication performed.</footer></main></html>`
const assemblySection = await Bun.file("review/assembly/index.html").exists()
  ? '<section><h2>Populated 3D assembly</h2><a href="assembly/index.html"><img src="assembly/isometric.png" alt="Actual populated PCB CAD assembly"></a><p><a href="assembly/index.html">Rotate and inspect the assembly</a> · <a href="assembly/peltier-assembly.glb">Download GLB</a> · <a href="assembly/assembly.svg">Native assembly drawing</a></p></section>' : ""
await Bun.write("review/index.html", html.replace("<section><h2>Placement / top view</h2>", assemblySection + "<section><h2>Placement / top view</h2>"))
console.log("Exported placement, eight schematic sheets, source circuit and review page to review/")
