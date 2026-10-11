import { supplierOrientationCache } from "./src/parts/supplier-parts-engine"

export default {
  mainEntrypoint: "regenerate.tsx",
  platformConfig: { localCacheEngine: supplierOrientationCache },
}
