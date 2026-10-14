import { assembly } from "tscircuit"
import { GeneralPdDriverBoard } from "../board/general-pd"
import { assemblyModels } from "./models"

// CAD-only accessories do not add PCB components, electrical ports or JLC BOM
// entries. Native assembly.cable cannot attach to generic parts/loose TEC leads.
export function GeneralPdDriverAssembly({ schematicDisabled = false }: { schematicDisabled?: boolean } = {}) {
  return <assembly.device name="GENERAL_PD_ASSEMBLY">
    <GeneralPdDriverBoard schematicDisabled={schematicDisabled} />
    {assemblyModels.map(part => <assembly.part key={part.partName} name={part.partName} displayName={part.displayName}
      cadModel={{ jscad: part.model, positionOffset: { x: part.position[0], y: part.position[1], z: part.position[2] },
        modelOriginPosition: { x: 0, y: 0, z: 0 }, modelUnitToMmScale: 1 }} />)}
  </assembly.device>
}
