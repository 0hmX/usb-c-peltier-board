import TecUsbCBoard from "./index"
import { PhasedSignalRouting, RegeneratedBusRouting } from "./src/regeneration-routing"

export default function RegenerateTecUsbCBoard() {
  return TecUsbCBoard({
    signalRouting: <PhasedSignalRouting />,
    busRouting: <RegeneratedBusRouting />,
    schematicDisabled: false,
  })
}
