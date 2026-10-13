import { DualUsbPeltierBoard } from "./src/board/board"
import { RevisionBCopper } from "./src/board/routing/copper"

/** Revision B routing work in progress; see review/routing/routing-report.json. */
export default function RoutedRevisionB() {
  return <DualUsbPeltierBoard schematicDisabled routingLayout routing={<RevisionBCopper />} />
}
