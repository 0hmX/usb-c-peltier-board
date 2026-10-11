// JLC silk audit: explicit graphic strokes >=0.15 mm; USB/cap outline ends trimmed for >=0.15 mm own-mask clearance. Copper/drills/courtyards preserved.
// Exact EasyEDA/JLCPCB C131334; observed 2026-10-10T03:20:59.295651+00:00. Source: https://jlcsearch.tscircuit.com/api/easyeda_components/C131334
// In-place fit adaptation: 0.95 mm nominal finished holes; JLC -0.08 mm yields 0.87 mm minimum.
// JST FAQ recommends 0.85-0.90 mm FINISHED plated holes for 3-16-pole PH on glass epoxy.
// Copper/pitch/pin1/body retained. Full +0.13/-0.08 mm fab range exceeds JST preferred range; prototype fit/solder qualification required.
// Sources: https://www.jst.com/resources/faq/ ; https://jlcpcb.com/capabilities/pcb-capabilities/
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["pin1"],
  pin2: ["pin2"],
  pin3: ["pin3"],
  pin4: ["pin4"]
} as const

export const B4B_PH_K_S_LF__SN_ = (props: ChipProps<typeof pinLabels>) => {
  return (
    <connector
      standard="jst_ph"
      pinCount={4}
      pinLabels={pinLabels}
      supplierPartNumbers={{
  "jlcpcb": [
    "C131334"
  ]
}}
      manufacturerPartNumber="B4B-PH-K-S(LF)(SN)"
      footprint={<footprint insertionDirection="from_above">
        <platedhole  portHints={["pin2"]} pcbX="0.999998mm" pcbY="-0.550037mm" outerDiameter="1.5999968mm" holeDiameter="0.95mm" shape="circle" />
<platedhole  portHints={["pin1"]} pcbX="2.999994mm" pcbY="-0.550037mm" outerDiameter="1.5999968mm" holeDiameter="0.95mm" shape="circle" />
<platedhole  portHints={["pin3"]} pcbX="-0.999998mm" pcbY="-0.550037mm" outerDiameter="1.5999968mm" holeDiameter="0.95mm" shape="circle" />
<platedhole  portHints={["pin4"]} pcbX="-2.999994mm" pcbY="-0.550037mm" outerDiameter="1.5999968mm" holeDiameter="0.95mm" shape="circle" />
<silkscreencircle strokeWidth="0.15mm" pcbX="4.285996mm" pcbY="-1.566037mm" radius="0.359156mm" />
<silkscreenrect pcbX="0mm" pcbY="0mm" width="9.99998mm" height="4.500118mm" strokeWidth="0.254mm" />
<courtyardoutline outline={[{"x":-5.200002799999993,"y":2.6999569999999267},{"x":5.199977399999966,"y":2.6999569999999267},{"x":5.199977399999966,"y":-2.500033599999938},{"x":-5.200002799999993,"y":-2.500033599999938},{"x":-5.200002799999993,"y":2.6999569999999267}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C131334.obj?uuid=3b95b8b4d5d24ff4a871a43c952e432a",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C131334.step?uuid=3b95b8b4d5d24ff4a871a43c952e432a",
        pcbRotationOffset: 180,
        modelOriginPosition: { x: 2.9999872999999297, y: -0.5500383000000056, z: -0.000005999999999950489 },
      }}
      {...props}
    />
  )
}
