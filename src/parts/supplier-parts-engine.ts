import type { BoardProps, PlatformConfig } from "@tscircuit/props"
import type { RootCircuit } from "@tscircuit/core"
import type { AnyCircuitElement } from "circuit-json"
import { withReviewedSupplierFootprint } from "./reviewed-supplier-footprints"
import supplierFootprints from "./supplier-footprints.json"

// Supplier snapshots supply orientation and footprint comparisons. Four
// capacitor references use independently reviewed manufacturer land patterns.
// Reviewed TSX footprints remain the actual board copper and stencil source.
// Provenance and original raw-snapshot hashes are saved beside this cache.
const footprints = supplierFootprints as Record<string, AnyCircuitElement[]>
export const supplierPartsEngine: NonNullable<BoardProps["partsEngine"]> = {
  // Every populated component has an explicit supplier ID; do not search for substitutes.
  findPart: () => ({}),
  fetchPartCircuitJson: ({supplierPartNumber}) => {
    if (!supplierPartNumber || !footprints[supplierPartNumber]) throw new Error(`Missing original supplier orientation footprint ${supplierPartNumber}`)
    return withReviewedSupplierFootprint(supplierPartNumber, footprints[supplierPartNumber])
  },
}

// TI TPS25947 RPW0010A, manufacturer drawing p73: pin1 is the upper left
// lead and pin2 continues down that column. The original EasyEDA pin1 polygon
// bbox center (-0.9149969, +0.8999982) differs in X by 0.0100076 mm from pin2
// (-0.9049893, +0.2250440), exceeding the utility's 2 micrometer collinearity
// tolerance. Preserve that raw supplier geometry and cache this one reviewed
// classification through the public platform cache API. No global relaxation.
// Primary: https://www.ti.com/lit/ds/symlink/tps25947.pdf (RPW0010A p73).
const orientationCache = new Map<string, string>([
  ["part-orientation-analysis:v4:jlcpcb:C3662799", JSON.stringify({
    pin1_location: "leftside_top", pin1_polarity: null,
    verification: "TI RPW0010A p73 and original numbered EasyEDA row; independent power footprint review",
  })],
  // LITEON package drawings and actual numeric pads identify pin1 as the left
  // cathode. Tiny opposite Y offsets in each authentic raw cache exceed the
  // analyzer's collinearity tolerance; preserve raw geometry/provenance and
  // use the independently verified classification for these exact two IDs.
  ["part-orientation-analysis:v4:jlcpcb:C94869", JSON.stringify({
    pin1_location: "topside_left", pin1_polarity: "cathode",
    verification: "LITEON DS-22-99-0151 RevF package/land drawings; numeric pin1 K; debug-discrete orientation fixture",
  })],
  ["part-orientation-analysis:v4:jlcpcb:C125094", JSON.stringify({
    pin1_location: "topside_left", pin1_polarity: "cathode",
    verification: "LITEON DS22-2000-074 RevN package/land drawings; numeric pin1 _NEG; debug-discrete orientation fixture",
  })],
])
export const supplierOrientationCache: NonNullable<PlatformConfig["localCacheEngine"]> = {
  getItem: async key => orientationCache.get(key) ?? null,
  setItem: async (key, value) => { orientationCache.set(key, value) },
}

// Generic viewers do not necessarily load the project's TS configuration.
export function installSupplierOrientationCache(circuit: RootCircuit) {
  const existing = circuit.platform?.localCacheEngine
  if (existing === supplierOrientationCache) return
  circuit.setPlatform({ localCacheEngine: {
    getItem: async key => await supplierOrientationCache.getItem(key) ?? await existing?.getItem(key) ?? null,
    setItem: async (key, value) => { await supplierOrientationCache.setItem(key, value); await existing?.setItem(key, value) },
  } })
}
