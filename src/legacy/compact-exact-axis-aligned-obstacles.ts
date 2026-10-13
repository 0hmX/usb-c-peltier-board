/** Exact union compactor. No solver, clearance/rule changes or input mutation.
 * Arrays (including connectedTo/layers) keep their order and every metadata field
 * participates in grouping. Nonrectangular/rotated obstacles are left untouched.
 * Binary-rational arithmetic rejects unrepresentable merged centers or sizes;
 * there is no coordinate rounding, tolerance, hull or conservative expansion.
 */
import type { Obstacle, SimpleRouteJson } from "@tscircuit/capacity-autorouter"

type Axis = "x" | "y"
type Dyadic = { n: bigint; e: number }
type Entry = { obstacle: Obstacle; originalIndexes: number[] }
export type ExactObstacleCompaction = {
  input: SimpleRouteJson
  provenance: number[][]
  passes: { axis: Axis; before: number; after: number; refusedUnrepresentable: number }[]
}

const normalize = ({ n, e }: Dyadic): Dyadic => {
  if (n === 0n) return { n, e: 0 }
  while (n % 2n === 0n) { n /= 2n; e++ }
  return { n, e }
}
const buffer = new DataView(new ArrayBuffer(8))
const dyadic = (value: number): Dyadic => {
  if (!Number.isFinite(value)) throw new Error("Only finite obstacle coordinates are supported")
  buffer.setFloat64(0, value)
  const bits = buffer.getBigUint64(0), exponent = Number((bits >> 52n) & 2047n)
  let n = bits & ((1n << 52n) - 1n)
  if (exponent) n |= 1n << 52n
  if (bits >> 63n) n = -n
  return normalize({ n, e: exponent ? exponent - 1075 : -1074 })
}
const add = (a: Dyadic, b: Dyadic): Dyadic => {
  const e = Math.min(a.e, b.e)
  return normalize({ n: (a.n << BigInt(a.e - e)) + (b.n << BigInt(b.e - e)), e })
}
const subtract = (a: Dyadic, b: Dyadic) => add(a, { n: -b.n, e: b.e })
const half = (a: Dyadic): Dyadic => normalize({ n: a.n, e: a.e - 1 })
const compare = (a: Dyadic, b: Dyadic) => {
  const n = subtract(a, b).n
  return n < 0n ? -1 : n > 0n ? 1 : 0
}
const exactNumber = (value: Dyadic): number | undefined => {
  const number = Number(value.n) * 2 ** value.e
  return Number.isFinite(number) && compare(dyadic(number), value) === 0 ? number : undefined
}

// A type-tagged key retains numeric values, field presence, all unknown metadata
// and array order. Object property order has no semantic significance in SRJ.
export const exactMetadataKey = (value: unknown): string => {
  if (value === null) return "null"
  if (typeof value === "number") return `n:${Object.is(value, -0) ? "-0" : value}`
  if (Array.isArray(value)) return `[${value.map(exactMetadataKey).join(",")}]`
  if (typeof value === "object") return `{${Object.entries(value)
    .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
    .map(([key, item]) => `${JSON.stringify(key)}:${exactMetadataKey(item)}`).join(",")}}`
  return `${typeof value}:${JSON.stringify(value)}`
}
export const isExactAxisAlignedRect = (obstacle: Obstacle): boolean => {
  const shape: unknown = (obstacle as Obstacle & { shape?: unknown }).shape
  return obstacle.type === "rect" && (shape === undefined || shape === "rect")
    && (obstacle.ccwRotationDegrees === undefined || obstacle.ccwRotationDegrees === 0)
    && [obstacle.center.x, obstacle.center.y, obstacle.width, obstacle.height].every(Number.isFinite)
    && obstacle.width > 0 && obstacle.height > 0
}
const interval = (obstacle: Obstacle, axis: Axis): [Dyadic, Dyadic] => {
  const center = dyadic(obstacle.center[axis])
  const radius = half(dyadic(axis === "x" ? obstacle.width : obstacle.height))
  return [subtract(center, radius), add(center, radius)]
}
const alignedKey = (obstacle: Obstacle, axis: Axis) => {
  const { center, width, height, ...metadata } = obstacle
  const { x, y, ...extraCenterFields } = center
  return exactMetadataKey({ metadata, extraCenterFields,
    fixedCenter: axis === "x" ? y : x, fixedDimension: axis === "x" ? height : width })
}
const mergeExact = (entry: Entry, other: Entry, axis: Axis): Entry | undefined => {
  const [a, b] = interval(entry.obstacle, axis), [c, d] = interval(other.obstacle, axis)
  if (compare(c, b) > 0 || compare(a, d) > 0) return undefined
  const low = compare(a, c) <= 0 ? a : c, high = compare(b, d) >= 0 ? b : d
  const center = exactNumber(half(add(low, high))), dimension = exactNumber(subtract(high, low))
  if (center === undefined || dimension === undefined) return undefined
  return { obstacle: { ...entry.obstacle,
    center: { ...entry.obstacle.center, [axis]: center },
    [axis === "x" ? "width" : "height"]: dimension },
    originalIndexes: [...entry.originalIndexes, ...other.originalIndexes].sort((a, b) => a - b) }
}

export function compactExactAxisAlignedObstacles(input: SimpleRouteJson): ExactObstacleCompaction {
  let entries: Entry[] = input.obstacles.map((obstacle, index) => ({ obstacle, originalIndexes: [index] }))
  const passes: ExactObstacleCompaction["passes"] = []
  for (const axis of ["x", "y"] as const) {
    const before = entries.length, groups = new Map<string, Entry[]>(), passthrough: Entry[] = []
    for (const entry of entries) {
      if (!isExactAxisAlignedRect(entry.obstacle)) { passthrough.push(entry); continue }
      const key = alignedKey(entry.obstacle, axis), group = groups.get(key) ?? []
      group.push(entry); groups.set(key, group)
    }
    const next = [...passthrough]
    let refusedUnrepresentable = 0
    for (const group of groups.values()) {
      group.sort((a, b) => compare(interval(a.obstacle, axis)[0], interval(b.obstacle, axis)[0])
        || a.originalIndexes[0]! - b.originalIndexes[0]!)
      let current = group[0]!
      for (const item of group.slice(1)) {
        const merged = mergeExact(current, item, axis)
        if (merged) { current = merged; continue }
        if (compare(interval(item.obstacle, axis)[0], interval(current.obstacle, axis)[1]) <= 0)
          refusedUnrepresentable++
        next.push(current); current = item
      }
      next.push(current)
    }
    entries = next.sort((a, b) => a.originalIndexes[0]! - b.originalIndexes[0]!)
    passes.push({ axis, before, after: entries.length, refusedUnrepresentable })
  }
  return { input: { ...input, obstacles: entries.map(entry => entry.obstacle) },
    provenance: entries.map(entry => entry.originalIndexes), passes }
}
