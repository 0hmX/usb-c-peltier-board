import { createHash } from "node:crypto"
import { mkdir, rename } from "node:fs/promises"
import { dirname } from "node:path"
import type { MultiPolygon, Pair } from "polygon-clipping"
import { auditRoutingConnectivity, subtractCopperPolygon } from "./audit-routing-connectivity"

/** Remove only actual drill-subtracted copper components consisting of fill. */
export function cleanupFloatingPours(circuit: any[], before = auditRoutingConnectivity(circuit)) {
  if (before.unsupported.length) throw new Error("Cannot classify floating fill with unsupported copper geometry")
  const removals = new Map<string, MultiPolygon>()
  for (const component of before.floatingPourComponents) for (const piece of component.pieces)
    removals.set(piece.elementId, [...(removals.get(piece.elementId) ?? []), ...piece.polygons])
  const output: any[] = []
  const ids = new Set(circuit.map(e => e.pcb_copper_pour_id).filter(Boolean))
  for (const e of circuit) {
    const remove = e.type === "pcb_copper_pour" ? removals.get(e.pcb_copper_pour_id) : undefined
    if (!remove) { output.push(e); continue }
    const ring = (r: any): Pair[] => r.vertices.map((p: any) => [p.x, p.y])
    let remaining: MultiPolygon = [[ring(e.brep_shape.outer_ring), ...(e.brep_shape.inner_rings ?? []).map(ring)]]
    for (const polygon of remove) remaining = subtractCopperPolygon(remaining, polygon)
    for (const [i, polygon] of remaining.entries()) {
      let id = e.pcb_copper_pour_id
      if (i) {
        let suffix = i
        do { id = `${e.pcb_copper_pour_id}_cleanup_${suffix++}` } while (ids.has(id))
        ids.add(id)
      }
      const nativeRing = (points: Pair[]) => ({ vertices: points.map(([x, y]) => ({ x, y })) })
      output.push({ ...e, pcb_copper_pour_id: id, brep_shape: {
        outer_ring: nativeRing(polygon[0]), inner_rings: polygon.slice(1).map(nativeRing),
      } })
    }
  }
  const after = auditRoutingConnectivity(output)
  // Compare actual attachment partitions, not transient component identifiers.
  const attached = (report: typeof before) => report.nets.map(n => ({ net: n.net,
    groups: n.components.filter(c => c.ports.length).map(c => [...c.ports].sort().join("|")).sort(),
    missing: n.missingPadPorts.map(p => p.pcbPortId).sort(),
  })).sort((a, b) => a.net.localeCompare(b.net))
  if (JSON.stringify(attached(before)) !== JSON.stringify(attached(after)))
    throw new Error("Floating-fill cleanup changed an attached pad connectivity partition")
  const protectedIds = circuit.filter(e => e.type !== "pcb_copper_pour")
  if (JSON.stringify(protectedIds) !== JSON.stringify(output.filter(e => e.type !== "pcb_copper_pour")))
    throw new Error("Floating-fill cleanup changed non-pour geometry")
  if (after.unsupported.length || after.shorts.length > before.shorts.length || after.floatingPourComponents.length)
    throw new Error("Floating-fill cleanup failed its independent geometry recheck")
  return { circuit: output, before, after, removedComponents: before.floatingPourComponents }
}

if (import.meta.main) {
  const input = process.argv[2] ?? "dist/routed/circuit.json"
  const evidencePath = process.argv[3] ?? "review/routing/pour-cleanup.json"
  const original = await Bun.file(input).text()
  const result = cleanupFloatingPours(JSON.parse(original))
  const cleaned = result.removedComponents.length ? JSON.stringify(result.circuit, null, 2) + "\n" : original
  const hash = (s: string) => createHash("sha256").update(s).digest("hex")
  const summary = (r: typeof result.before) => ({ passed: r.passed, shorts: r.shorts.length,
    floatingPourComponents: r.floatingPourComponents.length,
    failedNets: r.nets.filter(n => !n.passed).map(n => ({ net: n.net, components: n.componentCount,
      disconnectedPorts: n.disconnectedPorts.map(p => p.selector), missingPads: n.missingPadPorts.length })),
    usbBottomReferencePassed: r.usbBottomReference.passed })
  const evidence = { input, inputSha256: hash(original), outputSha256: hash(cleaned),
    scope: "Only physically connected components containing exclusively pour pieces after actual drill subtraction",
    protectedCopperUnchanged: true, padConnectivityPartitionsUnchanged: true,
    removedComponents: result.removedComponents, before: summary(result.before), after: summary(result.after),
    completeRoutingProven: result.after.passed }
  await mkdir(dirname(evidencePath), { recursive: true })
  await Bun.write(evidencePath, JSON.stringify(evidence, null, 2) + "\n")
  if (cleaned !== original) {
    const temporary = `${input}.pour-cleanup.tmp`
    await Bun.write(temporary, cleaned)
    await rename(temporary, input)
  }
  console.log(JSON.stringify({ removedComponents: result.removedComponents.length,
    completeRoutingProven: result.after.passed, evidencePath }))
}
