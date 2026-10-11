import type { AnyCircuitElement } from "circuit-json"

const midpoint = (minimum: number, maximum: number) => (minimum + maximum) / 2

// Independent reference lands from manufacturer recommendations, in mm.
// a is the inner land gap, b the land length, c the land width; centers are
// ±(a+b)/2. These values are derived here, never copied from rendered TSX.
// Samsung MLCC catalog, December 2025, p48:
// https://www.samsungsem.com/resources/file/kr/support/product_catalog/MLCC_2512.pdf
// C28323 / CL21B105KBFNNNE: 2012 ±.10 row, a .79–.89, b .88–.98, c 1.25–1.35.
// Part size: https://weblib.samsungsem.com/mlcc/mlcc-ec-data-sheet.do?partNumber=CL21B105KBFNNN
// C602037 / CL21A226MAYNNNE: 2012 ±.20 row, a .83–.93, b .91–1.01, c 1.35–1.45.
// Part size: https://product.samsungsem.com/mlcc/CL21A226MAYNNN.do
const samsung2012SmallTolerance = {
  a: midpoint(.79, .89), b: midpoint(.88, .98), c: midpoint(1.25, 1.35),
}
const samsung2012LargeTolerance = {
  a: midpoint(.83, .93), b: midpoint(.91, 1.01), c: midpoint(1.35, 1.45),
}

// Fenghua general MLCC A0006, printed p27 / PDF p28, 0603 1.60±.10/.80±.10:
// A .60–.80, B .60–.70, C .60–.80. Use the midpoint of each published range.
// https://www.fhcomp.com/uploads/20260922/110408_%E9%80%9A%E7%94%A8%E5%9E%8B%E7%B3%BB%E5%88%97%E5%A4%9A%E5%B1%82%E7%89%87%E5%BC%8F%E9%99%B6%E7%93%B7%E7%94%B5%E5%AE%B9%E5%99%A8-A0006.pdf
// Exact products: https://fhcomp.com/en/product_info/?prod_code=0603B103K500NT
// and https://fhcomp.com/en/product_info/?prod_code=0603B472K500NT
const fenghua0603 = {
  a: midpoint(.60, .80), b: midpoint(.60, .70), c: midpoint(.60, .80),
}
const reviewedLands: Record<string, { a: number; b: number; c: number }> = {
  C28323: samsung2012SmallTolerance,
  C602037: samsung2012LargeTolerance,
  C57112: fenghua0603,
  C53987: fenghua0603,
}

// The authentic EasyEDA snapshots and their hashes remain in
// supplier-footprints.json / supplier-footprints-provenance.json. Only these
// four reviewed comparison references change; IDs, numeric pins, port aliases,
// and their left/right orientation retain the original supplier identity.
export function withReviewedSupplierFootprint(
  supplierPartNumber: string,
  original: AnyCircuitElement[],
): AnyCircuitElement[] {
  const result = structuredClone(original)
  const land = reviewedLands[supplierPartNumber]
  if (!land) return result
  let padCount = 0
  for (const element of result) {
    if (element.type === "pcb_smtpad" && element.shape === "rect") {
      const pin1 = element.port_hints?.includes("pin1")
      const pin2 = element.port_hints?.includes("pin2")
      if (pin1 === pin2) throw new Error(`Invalid reviewed capacitor pin: ${supplierPartNumber}`)
      Object.assign(element, {
        x: (pin1 ? -1 : 1) * (land.a + land.b) / 2,
        y: 0, width: land.b, height: land.c,
      })
      padCount++
    } else if (element.type === "pcb_component") {
      element.width = land.a + 2 * land.b
      element.height = land.c
    }
  }
  if (padCount !== 2) throw new Error(`Expected two reviewed capacitor lands: ${supplierPartNumber}`)
  return result
}
