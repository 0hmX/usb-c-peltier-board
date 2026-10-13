import { PdInput } from "./blocks/pd-input"
import { TecPower } from "./blocks/tec-power"
import { ControlBlock } from "./blocks/control"
import { DebugBlock } from "./blocks/debug"
import { LogicSupplyLinks } from "./logic-supply-links"
import { ControlLocalRoutes } from "./control-local-routes"
import { ControlV3Routes } from "./control-v3-routes"
import { SupplySourceRoutes } from "./supply-source-routes"
import { Source16Routes } from "./source16-routes"
import { Source18Routes } from "./source18-routes"
import { Source20Routes } from "./source20-routes"
import { Source21Routes } from "./source21-routes"
import { Source22Routes } from "./source22-routes"
import { I2cBranchRoutes } from "./i2c-branch-routes"
import type { ReactNode } from "react"
import type { Board } from "@tscircuit/core"
import { attachSupplierPortAnchors } from "./component-port-anchors"
import { installSourceViaMetadata } from "./source-via-metadata"
import { installTraceWidthDiagnostics } from "./trace-width-diagnostics"
import { installSchematicRouteInput } from "./schematic-route-input"
import { BusRouting, GroundPlaneFanout, SignalNets } from "./bus-routing"
import { boardLayoutProps, GroundCopper, MainPowerFeatures, MechanicalFeatures } from "./layout"
import { installSupplierOrientationCache, supplierPartsEngine } from "../parts/supplier-parts-engine"

export default function TecUsbCBoard({ signalRouting = <SignalNets />, busRouting = <BusRouting />, schematicDisabled = false }: {
  signalRouting?: ReactNode; busRouting?: ReactNode; schematicDisabled?: boolean
} = {}) {
  return (
    <board {...{ ref: (board: Board | null) => attachSupplierPortAnchors(board, circuit => { installSupplierOrientationCache(circuit); installSourceViaMetadata(circuit); installSchematicRouteInput(circuit); installTraceWidthDiagnostics(circuit) }) }} {...boardLayoutProps} minViaHoleDiameter={.2} minViaPadDiameter={.5} routeRemaining={false} schematicDisabled={schematicDisabled} partsEngine={supplierPartsEngine} schLayout={{ layoutMode: "none" }} autorouter="auto_local" autorouterVersion="latest">
      <net name="GND" isGroundNet />
      {signalRouting}
      <MechanicalFeatures />
      <schematicsheet name="PD_INPUT" displayName="USB-C PD and protected power" sheetSize="A4">
        <PdInput />
      </schematicsheet>
      <schematicsheet name="TEC_POWER" displayName="Current-controlled TEC converter" sheetSize="A4">
        <TecPower />
      </schematicsheet>
      <schematicsheet name="CONTROL" displayName="Control, sensors and fail-off protection" sheetSize="A4">
        <group name="CONTROL_LAYOUT" schLayout={{ layoutMode: "none" }}>
          <ControlBlock />
        </group>
      </schematicsheet>
      <GroundPlaneFanout />
      <schematicsheet name="DEBUG" displayName="Power indicators and probe access" sheetSize="A4">
        <group name="DEBUG_LAYOUT" schLayout={{ layoutMode: "none" }}>
          <DebugBlock />
        </group>
      </schematicsheet>
      <LogicSupplyLinks />
      <ControlLocalRoutes />
      <ControlV3Routes />
      <SupplySourceRoutes />
      <Source16Routes />
      <Source18Routes />
      <Source20Routes />
      <Source21Routes />
      <Source22Routes />
      <I2cBranchRoutes />
      {busRouting}
      <GroundCopper />
      <MainPowerFeatures />
      <silkscreentext text="TEC USB-C" pcbX={0} pcbY={35.5} fontSize={1.7} />
      <silkscreentext text="HEATSINK REQUIRED" pcbX={26} pcbY={35.5} fontSize={1.7} />
    </board>
  )
}
