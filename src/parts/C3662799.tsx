// Silkscreen DFM: 0.15 mm strokes; omit tight cosmetic paths, retaining clear pin-1 marks.
// Imported EasyEDA/JLCPCB C3662799; observed 2026-10-10T03:14:10.216742+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C3662799
// Datasheet correction in place: TI TPS25947 Rev C p73 RPW0010A land example.
// Pins 5/6: 0.30 x 2.40 mm at x +/-0.25; corners retain imported polygon type, now aligned to +/-0.725 mm stem centers and +/-0.70 mm branch centers.
import type { ChipProps, FootprintSoupElements } from "@tscircuit/props"

// R0.05 TYP follows TI land/stencil examples; four arc segments per corner
// approximate the radius within 0.001 mm, preserving nominal land extents.
const roundedOutline = (vertices: number[][]) => vertices.flatMap(([x, y], i) => {
  const [px, py] = vertices[(i + vertices.length - 1) % vertices.length]
  const [nx, ny] = vertices[(i + 1) % vertices.length]
  const previousLength = Math.hypot(px - x, py - y)
  const nextLength = Math.hypot(nx - x, ny - y)
  const ux = (px - x) / previousLength, uy = (py - y) / previousLength
  const vx = (nx - x) / nextLength, vy = (ny - y) / nextLength
  const cx = x + 0.05 * (ux + vx), cy = y + 0.05 * (uy + vy)
  const start = Math.atan2(y + 0.05 * uy - cy, x + 0.05 * ux - cx)
  const end = Math.atan2(y + 0.05 * vy - cy, x + 0.05 * vx - cx)
  const sweep = Math.atan2(Math.sin(end - start), Math.cos(end - start))
  return Array.from({ length: 5 }, (_, step) => ({ x: cx + 0.05 * Math.cos(start + sweep * step / 4), y: cy + 0.05 * Math.sin(start + sweep * step / 4) }))
})

// TI RPW0010A p74, 0.10 mm stencil: split pins 5/6 apertures (~82%);
// corner apertures ~93%; four side pads 1:1. TI p73 preferred NSMD relief 0.04 mm preserves 0.12 mm webs.
// Production polygon-mask export must honor this requested relief.
const cornerPads = [
  { pin: 1, sx: -1, sy: 1 }, { pin: 4, sx: -1, sy: -1 },
  { pin: 7, sx: 1, sy: -1 }, { pin: 10, sx: 1, sy: 1 },
]
// Core uses polygon bounds centres for ports; the L-corner bounds centres lie
// outside the authentic land. Apply these metadata-only anchors through the
// public PcbPortAttachment:end lifecycle before routing. Copper remains intact.
export const tps25947CornerPortAnchors = {
  jlcpcbPartNumber: "C3662799",
  landingDiameter: 0.2,
  minimumBoundaryClearance: 0.05,
  anchors: [
    { pin: 1, x: -0.9, y: 0.7 },
    { pin: 4, x: -0.9, y: -0.7 },
    { pin: 7, x: 0.9, y: -0.7 },
    { pin: 10, x: 0.9, y: 0.7 },
  ],
} as const
const tps25947PowerPadsWithPaste = [
  ...cornerPads.flatMap(({ pin, sx, sy }) => {
    const id = `C3662799_imported_pin${pin}`
    return [
      { type: "pcb_smtpad", pcb_smtpad_id: id, x: 0, y: 0, shape: "polygon", layer: "top", port_hints: [`pin${pin}`], soldermask_margin: 0.04, points: roundedOutline([[0.85, 1.2], [0.85, 0.85], [1.2, 0.85], [1.2, 0.55], [0.6, 0.55], [0.6, 1.2]]).map(({ x, y }) => ({ x: sx * x, y: sy * y })) },
      { type: "pcb_solder_paste", x: 0, y: 0, pcb_smtpad_id: id, shape: "polygon", layer: "top", points: roundedOutline([[0.825, 1.2], [0.825, 0.825], [1.2, 0.825], [1.2, 0.55], [0.6, 0.55], [0.6, 1.2]]).map(({ x, y }) => ({ x: sx * x, y: sy * y })) },
    ]
  }),
  ...[{ pin: 5, x: -0.25 }, { pin: 6, x: 0.25 }].flatMap(({ pin, x }) => {
    const id = `C3662799_imported_pin${pin}`
    return [
      { type: "pcb_smtpad", pcb_smtpad_id: id, x, y: 0, shape: "polygon", layer: "top", port_hints: [`pin${pin}`], soldermask_margin: 0.04, points: roundedOutline([[x - 0.15, -1.2], [x + 0.15, -1.2], [x + 0.15, 1.2], [x - 0.15, 1.2]]) },
      ...[-0.63, 0.63].map(y => ({ type: "pcb_solder_paste", x: 0, y: 0, pcb_smtpad_id: id, shape: "polygon", layer: "top", points: roundedOutline([[x - 0.14, y - 0.53], [x + 0.14, y - 0.53], [x + 0.14, y + 0.53], [x - 0.14, y + 0.53]]) })),
    ]
  }),
]

const pinLabels = {
  pin1: ["EN","UVLO"],
  pin2: ["OVLO","OVCSEL"],
  pin3: ["PG","AUXOFF"],
  pin4: ["N_FLT","PGTH"],
  pin5: ["IN"],
  pin6: ["OUT"],
  pin7: ["DVDT"],
  pin8: ["GND"],
  pin9: ["ILM"],
  pin10: ["ITIMER"]
} as const

const pinAttributes = {
  pin8: {requiresGround: true}
} as const

export const TPS259470ARPWR = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C3662799"
  ]
}}
      manufacturerPartNumber="TPS259470ARPWR"
      footprint={tps25947PowerPadsWithPaste as FootprintSoupElements[]}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C3662799.obj?uuid=262834a5342148ebb2da8f3848ec58ce",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C3662799.step?uuid=262834a5342148ebb2da8f3848ec58ce",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0.004987299999929751, y: 0, z: -0.05 },
      }}
      {...props}
    >
      <footprint>
<smtpad solderPasteMargin={0} solderMaskMargin={0.04} portHints={["pin2"]} pcbX="-0.9mm" pcbY="0.225mm" width="0.6mm" height="0.25mm" shape="rect" cornerRadius={0.05} />
<smtpad solderPasteMargin={0} solderMaskMargin={0.04} portHints={["pin3"]} pcbX="-0.9mm" pcbY="-0.225mm" width="0.6mm" height="0.25mm" shape="rect" cornerRadius={0.05} />
<smtpad solderPasteMargin={0} solderMaskMargin={0.04} portHints={["pin9"]} pcbX="0.9mm" pcbY="0.225mm" width="0.6mm" height="0.25mm" shape="rect" cornerRadius={0.05} />
<smtpad solderPasteMargin={0} solderMaskMargin={0.04} portHints={["pin8"]} pcbX="0.9mm" pcbY="-0.225mm" width="0.6mm" height="0.25mm" shape="rect" cornerRadius={0.05} />
<silkscreencircle strokeWidth={0.15} pcbX="-1.7149953mm" pcbY="1.229868mm" radius="0.13462mm" />
<courtyardoutline outline={[{"x":-1.4649963000000525,"y":1.4499976000000743},{"x":1.4649963000000525,"y":1.4499976000000743},{"x":1.4649963000000525,"y":-1.4499975999999606},{"x":-1.4649963000000525,"y":-1.4499975999999606},{"x":-1.4649963000000525,"y":1.4499976000000743}]} />
      </footprint>
    </chip>
  )
}
