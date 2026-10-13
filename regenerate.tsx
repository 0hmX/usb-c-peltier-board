import TecUsbCBoard from "./src/legacy/board"
import { PhasedSignalRouting, RegeneratedBusRouting } from "./src/legacy/regeneration-routing"

export default function RegenerateTecUsbCBoard() {
  return TecUsbCBoard({
    signalRouting: <PhasedSignalRouting />,
    busRouting: <RegeneratedBusRouting />,
    schematicDisabled: false,
  })
}
