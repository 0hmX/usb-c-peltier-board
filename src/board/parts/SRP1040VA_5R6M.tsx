import type { InductorProps } from "@tscircuit/props"

// Bourns manufacturer land pattern: 12.5 mm total span, 5.4 mm gap,
// 3.5 mm land height. Each land is (12.5 - 5.4) / 2 = 3.55 mm wide.
// LCSC C1857861 has no importable EasyEDA footprint.
// https://www.bourns.com/docs/product-datasheets/srp1040va.pdf (page 1)
export function SRP1040VA_5R6M(props: Omit<InductorProps, "inductance">) {
  return <inductor inductance="5.6uH" manufacturerPartNumber="SRP1040VA-5R6M"
    supplierPartNumbers={{ lcsc: ["C1857861"] }}
    footprint={<footprint>
      <smtpad shape="rect" pcbX={-4.475} width={3.55} height={3.5} portHints={["pin1"]} />
      <smtpad shape="rect" pcbX={4.475} width={3.55} height={3.5} portHints={["pin2"]} />
      <courtyardrect width={13} height={11.8} />
    </footprint>}
    // Datasheet body envelope, not a detailed supplier model.
    cadModel={{ jscad: { type: "colorize", color: [0.3, 0.3, 0.32],
      shape: { type: "cuboid", size: [11, 10, 3.8], center: [0, 0, 1.9] } },
      modelUnitToMmScale: 1, modelOriginPosition: { x: 0, y: 0, z: 0 } }}
    {...props} />
}
