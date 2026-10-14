import { assembly } from "tscircuit"
import { GeneralPdDriverBoard } from "../board/general-pd"
import { moduleModel, usbPdCable, usbProgramCable, tecPositiveLead, tecNegativeLead } from "./models"

// CAD-only accessories do not add PCB components, electrical ports or JLC BOM
// entries. Native assembly.cable cannot attach to generic parts/loose TEC leads.
export function GeneralPdDriverAssembly({ schematicDisabled = false }: { schematicDisabled?: boolean } = {}) {
  return <assembly.device name="GENERAL_PD_ASSEMBLY">
    <GeneralPdDriverBoard schematicDisabled={schematicDisabled} />
    <assembly.part name="TEC_DEFAULT" displayName="HiLetgo TEC1-12706 · 40 × 40 × 3.6 mm listing envelope"
      cadModel={{ jscad: moduleModel, positionOffset: { x: 112, y: 24, z: 1.8 },
        modelOriginPosition: { x: 0, y: 0, z: 0 }, modelUnitToMmScale: 1 }} />
    <assembly.part name="USB_PD_CABLE" displayName="Cable Matters 201440 · PD power · envelope"
      cadModel={{ jscad: usbPdCable.model,
        positionOffset: { x: usbPdCable.boardPoint[0], y: usbPdCable.boardPoint[1], z: usbPdCable.boardPoint[2] },
        modelOriginPosition: { x: 0, y: 0, z: 0 }, modelUnitToMmScale: 1 }} />
    <assembly.part name="USB_PROGRAM_CABLE" displayName="Cable Matters 201440 · USB programming · envelope"
      cadModel={{ jscad: usbProgramCable.model,
        positionOffset: { x: usbProgramCable.boardPoint[0], y: usbProgramCable.boardPoint[1], z: usbProgramCable.boardPoint[2] },
        modelOriginPosition: { x: 0, y: 0, z: 0 }, modelUnitToMmScale: 1 }} />
    <assembly.part name="TEC_POS_LEAD" displayName="TEC positive lead · red · path illustration"
      cadModel={{ jscad: tecPositiveLead.model,
        positionOffset: { x: tecPositiveLead.boardPoint[0], y: tecPositiveLead.boardPoint[1], z: tecPositiveLead.boardPoint[2] },
        modelOriginPosition: { x: 0, y: 0, z: 0 }, modelUnitToMmScale: 1 }} />
    <assembly.part name="TEC_NEG_LEAD" displayName="TEC negative lead · black · path illustration"
      cadModel={{ jscad: tecNegativeLead.model,
        positionOffset: { x: tecNegativeLead.boardPoint[0], y: tecNegativeLead.boardPoint[1], z: tecNegativeLead.boardPoint[2] },
        modelOriginPosition: { x: 0, y: 0, z: 0 }, modelUnitToMmScale: 1 }} />
  </assembly.device>
}
