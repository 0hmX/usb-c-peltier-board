import { PdInput } from "./src/blocks/pd-input"
import { TecPower } from "./src/blocks/tec-power"
import { ControlBlock } from "./src/blocks/control"
import { DebugBlock } from "./src/blocks/debug"
import { LogicSupplyLinks } from "./src/logic-supply-links"
import { ControlLocalRoutes } from "./src/control-local-routes"
import { ControlV3Routes } from "./src/control-v3-routes"
import { SupplySourceRoutes } from "./src/supply-source-routes"
import { Source16Routes } from "./src/source16-routes"
import { Source18Routes } from "./src/source18-routes"
import { Source20Routes } from "./src/source20-routes"
import { Source21Routes } from "./src/source21-routes"
import { Source22Routes } from "./src/source22-routes"
import { I2cBranchRoutes } from "./src/i2c-branch-routes"
import { BusRouting, GroundPlaneFanout, PhasedSignalRouting } from "./src/bus-routing"
import { boardLayoutProps, GroundCopper, MainPowerFeatures, MechanicalFeatures } from "./src/layout"
import { supplierPartsEngine } from "./src/parts/supplier-parts-engine"

export default function TecUsbCBoard() {
  return (
    <board {...boardLayoutProps} minViaHoleDiameter={.2} minViaPadDiameter={.5} routeRemaining={false} partsEngine={supplierPartsEngine} schLayout={{ layoutMode: "none" }} autorouter="auto_local" autorouterVersion="latest">
      <net name="GND" isGroundNet />
      <PhasedSignalRouting />
      <MechanicalFeatures />
      <schematicsheet name="PD_INPUT" displayName="USB-C PD and protected power" sheetSize="ANSI_B">
        <PdInput />
      </schematicsheet>
      <schematicsheet name="TEC_POWER" displayName="Current-controlled TEC converter" sheetSize="ANSI_B">
        <TecPower />
      </schematicsheet>
      <schematicsheet name="CONTROL" displayName="Control, sensors and fail-off protection" sheetSize="ANSI_B">
        <group name="CONTROL_LAYOUT" schLayout={{ layoutMode: "none" }}>
          <ControlBlock />
        </group>
      </schematicsheet>
      <GroundPlaneFanout />
      <schematicsheet name="DEBUG" displayName="Power indicators and probe access" sheetSize="ANSI_B">
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
      <BusRouting />
      <GroundCopper />
      <MainPowerFeatures />
      <silkscreentext text="TEC USB-C" pcbX={0} pcbY={35.5} fontSize={1.7} />
      <silkscreentext text="HEATSINK REQUIRED" pcbX={26} pcbY={35.5} fontSize={1.7} />
    </board>
  )
}
