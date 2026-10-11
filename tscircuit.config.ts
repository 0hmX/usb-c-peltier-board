import { supplierOrientationCache } from "./src/parts/supplier-parts-engine"

export default {
  mainEntrypoint: "index.tsx",
  platformConfig: { localCacheEngine: supplierOrientationCache },
}
