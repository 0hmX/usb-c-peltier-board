import { deepStrictEqual, equal, match } from "node:assert/strict"
import saved from "../captured-pcb/circuit.json"

type Element = { type: string; [key: string]: unknown }
const transientTypes = new Set(["pcb_silkscreen_path", "pcb_silkscreen_text", "supplier_footprint_mismatch_warning"])
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical)
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value)
    .sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonical(item)]))
  return value
}
function normalized(elements: Element[]) {
  // Only these allocated IDs are unstable; ensure none is a foreign reference.
  const references = new Map<string, number>()
  const count = (value: unknown): void => {
    if (typeof value === "string") references.set(value, (references.get(value) ?? 0) + 1)
    else if (value && typeof value === "object") Object.values(value).forEach(count)
  }
  elements.forEach(count)
  return elements.map(element => {
    const record = { ...element }
    if (transientTypes.has(record.type)) {
      const id = `${record.type}_id`
      equal(typeof record[id], "string", `Invalid allocated ${id}`)
      equal(references.get(record[id] as string), 1, `Referenced or duplicate allocated ${id}`)
      delete record[id]
    }
    if (record.type === "supplier_footprint_mismatch_warning") {
      equal(typeof record.message, "string", "Invalid supplier warning message")
      record.message = (record.message as string).replace(/^<(capacitor|chip)#\d+(?=\()/, "<$1#runtime")
    }
    return JSON.stringify(canonical(record))
  }).sort()
}

export function assertSavedCircuit(actual: Element[], cli = false) {
  const expected: Element[] = structuredClone(saved)
  // Explicit insertion direction follows the cleaned USB footprint. Copper,
  // body position and every other component field remain capture-exact.
  const usb = expected.find(element => element.type === "pcb_component" && element.pcb_component_id === "pcb_component_0")!
  deepStrictEqual(usb.cable_insertion_center, { x: -51.14488744000006, y: 12 })
  equal(usb.insertion_direction, undefined)
  usb.insertion_direction = "from_left"
  usb.cable_insertion_center = { x: -49.28727663999999, y: 12 }
  if (cli) {
    const metadata = actual.filter(element => element.type === "source_project_metadata")
    equal(metadata.length, 1)
    deepStrictEqual(Object.keys(metadata[0]!).sort(), ["source_filesystem_md5_hash", "type"])
    equal(typeof metadata[0]!.source_filesystem_md5_hash, "string", "Invalid CLI filesystem hash")
    match(metadata[0]!.source_filesystem_md5_hash as string, /^[a-f0-9]{32}$/)
    expected[expected.findIndex(element => element.type === "source_project_metadata")] = metadata[0]!
  }
  deepStrictEqual(normalized(actual), normalized(expected), "Changed saved circuit semantics")
  return Object.fromEntries([...new Set(expected.map(element => element.type))].sort()
    .map(type => [type, actual.filter(element => element.type === type).length]))
}

if (import.meta.main) {
  const path = Bun.argv[2]
  if (!path) throw new Error("Usage: bun run scripts/assert-saved-circuit.ts <CLI circuit.json>")
  const counts = assertSavedCircuit(await Bun.file(path).json(), true)
  console.log(JSON.stringify({ pass: true, path, recordTypes: Object.keys(counts).length, records: Object.values(counts).reduce((a, b) => a + b, 0), counts }, null, 2))
}
