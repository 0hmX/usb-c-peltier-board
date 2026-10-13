import { supplierOrientationCache } from "./src/parts/supplier-parts-engine"
import projectConfig from "./tscircuit.config.json"

export default {
  ...projectConfig,
  platformConfig: { localCacheEngine: supplierOrientationCache },
}
