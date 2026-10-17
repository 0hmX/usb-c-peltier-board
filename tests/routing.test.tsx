import { beforeAll, describe, expect, test } from "bun:test"
import * as checks from "@tscircuit/checks"
import { getSourcePortConnectivityMapFromCircuitJson } from "circuit-json-to-connectivity-map"
import { INITIAL_ROUTES } from "../src/board/routing"
import { boardFixture } from "./fixtures"

let circuit: Awaited<ReturnType<typeof boardFixture>>
beforeAll(async () => { circuit = await boardFixture() }, 60_000)

function sourcePortId(selector: string) {
  const port = circuit.selectOne(selector, { type: "port" })
  if (!port || !("source_port_id" in port) || typeof port.source_port_id !== "string")
    throw new Error(`Missing source port for ${selector}`)
  return port.source_port_id
}

describe("initial manual PCB routing", () => {
  test("each planned connection renders copper between the intended pins at its requested width", () => {
    expect(INITIAL_ROUTES.length).toBeGreaterThan(0)
    const sources = circuit.db.source_trace.list()
    const traces = circuit.db.pcb_trace.list()
    const originalWiring = getSourcePortConnectivityMapFromCircuitJson(circuit.getCircuitJson().filter(
      item => item.type !== "source_trace" || !item.name?.startsWith("INITIAL_ROUTE_")))
    expect(traces.length).toBeGreaterThanOrEqual(INITIAL_ROUTES.length)
    INITIAL_ROUTES.forEach((route, index) => {
      const source = sources.find(trace => trace.name === `INITIAL_ROUTE_${index}`)
      expect(source).toBeDefined()
      const endpoints = [sourcePortId(route.from), sourcePortId(route.to)]
      expect(source!.connected_source_port_ids.slice().sort()).toEqual(endpoints.slice().sort())
      expect(originalWiring.areAllIdsConnected(endpoints)).toBe(true)
      expect(source!.min_trace_thickness).toBe(route.width)
      const copper = traces.filter(trace => trace.source_trace_id === source!.source_trace_id)
      expect(copper.length).toBeGreaterThan(0)
      for (const trace of copper) {
        const wires = trace.route.filter(point => point.route_type === "wire")
        expect(wires.length).toBeGreaterThanOrEqual(2)
        for (const point of wires) {
          expect(Number.isFinite(point.x) && Number.isFinite(point.y)).toBe(true)
          // The library width check applies the widest branch to an entire net;
          // verify each route here so local signal and power branches can differ.
          expect(point.width).toBeGreaterThanOrEqual(route.width - 1e-9)
        }
      }
    })
  })

  test("routed copper is contiguous and clears other copper, holes and the board edge", () => {
    // routingDisabled also disables native routing DRC. Run geometry checks
    // explicitly; whole-board port connectivity remains unfinished.
    const json = circuit.getCircuitJson()
    const geometryChecks = [
      checks.checkEachPcbTraceNonOverlapping, checks.checkCopperPourShorts,
      checks.checkPadTraceClearance, checks.checkHoleTraceClearance,
      checks.checkViaTraceClearance, checks.checkViaPadClearance,
      checks.checkSameNetViaSpacing, checks.checkDifferentNetViaSpacing,
      checks.checkTracesAreContiguous, checks.checkDanglingTraces,
      checks.checkPcbTracesOutOfBoard, checks.checkCopperToBoardEdgeClearance,
      checks.checkViasOffBoard, checks.checkViasInPads,
      checks.checkPcbTraceLengths, checks.checkPcbTraceViaCounts,
      checks.checkPcbRoutingConstraints, checks.checkPcbBusLengthSkew,
    ]
    expect(geometryChecks.map(check => check(structuredClone(json))).flat()).toEqual([])
    expect(checks.checkEachPcbPortConnectedToPcbTraces(structuredClone(json)).length)
      .toBeGreaterThan(0)
  })
})
