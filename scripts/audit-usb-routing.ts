import type { AnyCircuitElement } from "circuit-json"
import type { GeneratedCopper } from "../src/board/routing/generated-types"

type Point = { x: number; y: number }
export interface UsbRoutingPacket {
  paths: { net: string; from: string; to: string; width: number; layer: string; points: number[][] }[]
  vias: { name: string; net: string; x: number; y: number }[]
}
export interface UsbMemberAudit {
  lengthMm: number
  alternateOrientationLengthMm: number
  duplicateBridgeLengthMm: number
  transitionCount: number
  layerSequence: string[]
  nativeTraceIds: string[]
  nativeViaIds: string[]
}
export interface UsbRoutingAudit {
  ok: boolean
  problems: string[]
  skewLimitMm: number
  primarySkewMm: number
  alternateOrientationSkewMm: number
  matchedNativeTraceCount: number
  matchedNativeBarrelCount: number
  members: { DP: UsbMemberAudit; DM: UsbMemberAudit }
  method: string
}
const tolerance = 1e-4, skewLimitMm = .05
const near = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y) <= tolerance
const point = (p: number[]): Point => ({ x: p[0], y: p[1] })
const usbNet = (net: string | undefined) => /^USB_D[PM]_(PORT|SWITCH|MCU)$/.test(net ?? "")
type Edge = { a: string; b: string; net: string; length: number; layer?: string; traceId?: string; viaId?: string }

/** Recompute USB figures from native wire vertices and actual barrels, never packet totals. */
export function auditUsbRouting(circuit: AnyCircuitElement[], generated: GeneratedCopper,
  usbPacket: UsbRoutingPacket): UsbRoutingAudit {
  // Native types vary across tscircuit releases; all used fields are checked below.
  const elements = circuit as any[]
  const problems: string[] = [], edges: Edge[] = []
  const components = new Map(elements.filter(p => p.type === "source_component").map(p => [p.source_component_id, p]))
  const sourcePorts = new Map(elements.filter(p => p.type === "source_port").map(p => [p.source_port_id, p]))
  const nets = elements.filter(p => p.type === "source_net")
  const netById = new Map(nets.map(p => [p.source_net_id, p.name]))
  const netByKey = new Map(nets.map(p => [p.subcircuit_connectivity_map_key, p.name]))
  const nativePorts = new Map<string, any>()
  for (const p of elements.filter(p => p.type === "pcb_port")) {
    const s = sourcePorts.get(p.source_port_id), c = components.get(s?.source_component_id)
    if (s && c) nativePorts.set(`${c.name}.${s.name === "top" || s.name === "bottom" ? s.name : `pin${s.pin_number}`}`, p)
    // Via ports expose their actual layer names instead of numeric pin selectors.
    if (s && c && generated.vias.some(v => v.name === c.name))
      for (const layer of p.layers ?? []) nativePorts.set(`${c.name}.${layer}`, p)
  }
  const sourceTraces = elements.filter(p => p.type === "source_trace")
  const physicalTraces = elements.filter(p => p.type === "pcb_trace")
  const physicalVias = elements.filter(p => p.type === "pcb_via")
  const aliases = new Map<string, string>(), matchedViaIds = new Set<string>()
  const viaEndpoints = new Map<string, { net: string; native: any; layers: Set<string> }>()
  for (const expected of usbPacket.vias.filter(v => usbNet(v.net))) {
    const declared = generated.vias.filter(v => v.net === expected.net && near(v, expected))
    if (declared.length !== 1) { problems.push(`USB barrel declaration mismatch: ${expected.name}`); continue }
    const g = declared[0]
    aliases.set(expected.name, g.name)
    const physical = physicalVias.filter(v => near(v, g) &&
      (netById.get(v.source_net_id) ?? netByKey.get(v.subcircuit_connectivity_map_key)) === g.net)
    if (physical.length !== 1) { problems.push(`USB native barrel missing or ambiguous: ${g.name}`); continue }
    const v = physical[0]
    if (Math.abs(v.outer_diameter - .7) > tolerance || Math.abs(v.hole_diameter - .3) > tolerance ||
      !["top", "inner1", "inner2", "bottom"].every(l => v.layers?.includes(l)))
      problems.push(`USB barrel dimensions/layers mismatch: ${v.pcb_via_id}`)
    matchedViaIds.add(v.pcb_via_id)
    viaEndpoints.set(g.name, { net: g.net, native: v, layers: new Set() })
  }
  if (usbPacket.paths.length !== 16 || usbPacket.vias.filter(v => usbNet(v.net)).length !== 4)
    problems.push("USB packet must contain the unchanged 16 paths and four signal barrels")
  const selector = (s: string) => {
    const at = s.lastIndexOf("."), name = s.slice(0, at)
    return aliases.has(name) ? `${aliases.get(name)}${s.slice(at)}` : s
  }
  const matchedNames = new Set<string>(), matchedTraceIds = new Set<string>()
  for (const expected of usbPacket.paths) {
    const from = selector(expected.from), to = selector(expected.to)
    const candidates = generated.traces.filter(t => t.net === expected.net &&
      ((t.from === from && t.to === to) || (t.from === to && t.to === from)))
    if (candidates.length !== 1) { problems.push(`USB generated edge missing or ambiguous: ${from} -> ${to}`); continue }
    const g = candidates[0], sources = sourceTraces.filter(s => s.name === g.name)
    matchedNames.add(g.name)
    const actual = physicalTraces.filter(t => sources.some(s => s.source_trace_id === t.source_trace_id))
    if (sources.length !== 1 || actual.length !== 1) { problems.push(`USB native trace missing or ambiguous: ${g.name}`); continue }
    const source = sources[0], trace = actual[0]
    matchedTraceIds.add(trace.pcb_trace_id)
    // Point-to-point native traces inherit their net through connected ports.
    // Their connected_source_net_ids may be empty even with a valid net key.
    const declaredNetIds: string[] = source.connected_source_net_ids ?? []
    if (netByKey.get(source.subcircuit_connectivity_map_key) !== expected.net ||
      declaredNetIds.some((id: string) => netById.get(id) !== expected.net))
      problems.push(`USB native trace net mismatch: ${g.name}`)
    const wires = trace.route.filter((p: any) => p.route_type === "wire")
    const points = wires.filter((p: any, i: number) => !i || !near(p, wires[i - 1]))
    const intended = expected.points.map(point)
    if (g.from !== from) intended.reverse()
    const declared = g.path.filter((p, i, a) => !i || !near(p, a[i - 1]))
    if (g.layer !== expected.layer || Math.abs(g.width - expected.width) > tolerance ||
      declared.length !== intended.length || declared.some((p, i) => !intended[i] || !near(p, intended[i])))
      problems.push(`USB generated path differs from reserved pair: ${g.name}`)
    if (trace.route.some((p: any) => p.route_type !== "wire") || points.length !== intended.length ||
      points.some((p: any, i: number) => !intended[i] || !near(p, intended[i])) ||
      wires.some((p: any) => p.layer !== expected.layer || Math.abs(p.width - expected.width) > tolerance))
      problems.push(`USB native path/layer/width differs from reserved pair: ${g.name}`)
    for (const [s, endpoint, portId] of [[g.from, wires[0], wires[0]?.start_pcb_port_id],
      [g.to, wires.at(-1), wires.at(-1)?.end_pcb_port_id]] as const) {
      const at = s.lastIndexOf("."), via = viaEndpoints.get(s.slice(0, at)), layer = s.slice(at + 1)
      if (via) {
        if (!endpoint || !near(endpoint, via.native) || !via.native.layers.includes(layer) || endpoint.layer !== layer)
          problems.push(`USB trace does not land on barrel/layer: ${g.name} ${s}`)
        via.layers.add(layer)
      } else {
        const p = nativePorts.get(s), sp = sourcePorts.get(p?.source_port_id)
        if (!p || !endpoint || !near(endpoint, p) || p.pcb_port_id !== portId ||
          netByKey.get(sp?.subcircuit_connectivity_map_key) !== expected.net)
          problems.push(`USB endpoint/net continuity mismatch: ${g.name} ${s}`)
      }
    }
    let length = 0
    for (let i = 1; i < wires.length; i++) length += Math.hypot(wires[i].x - wires[i - 1].x, wires[i].y - wires[i - 1].y)
    edges.push({ a: g.from, b: g.to, net: expected.net, length, layer: wires[0]?.layer, traceId: trace.pcb_trace_id })
  }
  for (const [name, v] of viaEndpoints) {
    const layers = [...v.layers]
    if (layers.length !== 2) problems.push(`USB barrel must join exactly two routed layers: ${name}`)
    if (layers.length === 2) edges.push({ a: `${name}.${layers[0]}`, b: `${name}.${layers[1]}`,
      net: v.net, length: 0, viaId: v.native.pcb_via_id })
  }
  if (generated.traces.filter(t => usbNet(t.net)).some(t => !matchedNames.has(t.name)))
    problems.push("Unexpected generated USB branch outside the reserved pair")
  if (generated.vias.filter(v => usbNet(v.net)).length !== 4 || physicalVias.filter(v =>
    usbNet(netById.get(v.source_net_id) ?? netByKey.get(v.subcircuit_connectivity_map_key))).length !== 4)
    problems.push("Unexpected/missing USB signal barrel count")
  for (const t of physicalTraces) {
    const s = sourceTraces.find(s => s.source_trace_id === t.source_trace_id)
    if (usbNet(netByKey.get(s?.subcircuit_connectivity_map_key)) && !matchedTraceIds.has(t.pcb_trace_id))
      problems.push(`Unexpected native USB trace: ${t.pcb_trace_id}`)
  }
  function walk(net: string, start: string, finish: string): Edge[] {
    const queue: { node: string; path: Edge[] }[] = [{ node: start, path: [] }], seen = new Set([start])
    while (queue.length) {
      const item = queue.shift()!
      if (item.node === finish) return item.path
      for (const e of edges.filter(e => e.net === net && (e.a === item.node || e.b === item.node))) {
        const node = e.a === item.node ? e.b : e.a
        if (!seen.has(node)) { seen.add(node); queue.push({ node, path: [...item.path, e] }) }
      }
    }
    problems.push(`USB continuity missing: ${net} ${start} -> ${finish}`)
    return []
  }
  function member(tag: "DP" | "DM"): UsbMemberAudit {
    const dp = tag === "DP", net = `USB_${tag}`
    // Package-internal switch/resistor transfer is declared topology, not PCB length.
    const path = [...walk(`${net}_PORT`, `J_USB_PROG.pin${dp ? 10 : 9}`, `U_USB_SWITCH.pin${dp ? 8 : 7}`),
      ...walk(`${net}_SWITCH`, `U_USB_SWITCH.pin${dp ? 1 : 2}`, `R_USB_${tag}.pin1`),
      ...walk(`${net}_MCU`, `R_USB_${tag}.pin2`, `U_MCU.pin${dp ? 47 : 46}`)]
    const duplicate = walk(`${net}_PORT`, `J_USB_PROG.pin${dp ? 8 : 7}`, `J_USB_PROG.pin${dp ? 10 : 9}`)
    const lengthMm = path.reduce((s, e) => s + e.length, 0), duplicateBridgeLengthMm = duplicate.reduce((s, e) => s + e.length, 0)
    const layerSequence: string[] = []
    for (const e of path) if (e.layer && e.layer !== layerSequence.at(-1)) layerSequence.push(e.layer)
    return { lengthMm, duplicateBridgeLengthMm, alternateOrientationLengthMm: lengthMm + duplicateBridgeLengthMm,
      transitionCount: path.filter(e => e.viaId).length, layerSequence,
      nativeTraceIds: path.flatMap(e => e.traceId ? [e.traceId] : []), nativeViaIds: path.flatMap(e => e.viaId ? [e.viaId] : []) }
  }
  const members = { DP: member("DP"), DM: member("DM") }
  const primarySkewMm = Math.abs(members.DP.lengthMm - members.DM.lengthMm)
  const alternateOrientationSkewMm = Math.abs(members.DP.alternateOrientationLengthMm - members.DM.alternateOrientationLengthMm)
  if (primarySkewMm > skewLimitMm) problems.push(`USB primary skew ${primarySkewMm.toFixed(6)} mm exceeds ${skewLimitMm} mm`)
  if (alternateOrientationSkewMm > skewLimitMm) problems.push(`USB alternate-orientation skew ${alternateOrientationSkewMm.toFixed(6)} mm exceeds ${skewLimitMm} mm`)
  if (members.DP.transitionCount !== 2 || members.DM.transitionCount !== 2 ||
    JSON.stringify(members.DP.layerSequence) !== JSON.stringify(members.DM.layerSequence) ||
    JSON.stringify(members.DP.layerSequence) !== JSON.stringify(["top", "inner2", "top"]))
    problems.push("USB pair layer sequence or transition count mismatch")
  return { ok: problems.length === 0, problems, skewLimitMm, primarySkewMm, alternateOrientationSkewMm,
    matchedNativeTraceCount: matchedTraceIds.size, matchedNativeBarrelCount: matchedViaIds.size, members,
    method: "Native wire-vertex centerline sums over connector-to-switch PORT, switch-to-series SWITCH, and series-to-MCU paths; duplicate connector bridge added only for alternate orientation. Actual native barrels establish zero-planar-length layer transitions. Package and vertical barrel lengths excluded equally; no cached length totals used." }
}
