import type { ReactElement } from "react"
import { Circuit } from "tscircuit"
import { GeneralPdDriverBoard } from "../src/board/general-pd"

// Tests use the committed supplier footprints/pin maps and run local DRC.
// Live catalog enrichment belongs to the build and stock audit, not fixtures.
export async function renderFixture(element: ReactElement) {
  const circuit = new Circuit({ platform: { schematicDisabled: true, partsEngineDisabled: true } })
  circuit.add(element)
  await circuit.renderUntilSettled()
  return circuit
}

let board: ReturnType<typeof renderFixture> | undefined
export const boardFixture = () => board ??= renderFixture(<GeneralPdDriverBoard schematicDisabled />)
