import type { CadModelProp } from "@tscircuit/props"
import { createElement } from "react"

export const tecInductorCadModel: CadModelProp = {
  jscad: {
    type: "union",
    shapes: [
      {
        type: "colorize", color: [0.18, 0.2, 0.22, 1],
        shape: { type: "roundedCuboid", size: [12.6, 12.6, 6], center: [0, 0, 3], roundRadius: 0.35, segments: 12 },
      },
      ...[-6.25, 6.25].map(horizontalPosition => ({
        type: "colorize", color: [0.72, 0.75, 0.79, 1],
        shape: { type: "cuboid", size: [1.5, 4.7, 0.15], center: [horizontalPosition, 0, 0.075] },
      })),
    ],
  },
  modelOriginPosition: { x: 0, y: 0, z: 0 },
}

export function passiveCadModel(componentType: string, size: string) {
  if (!["0402", "0603", "1206"].includes(size)) return undefined
  if (componentType === "resistor") return createElement("cadmodel", { model: "res" + size })
  if (componentType === "capacitor") return createElement("cadmodel", { model: "cap" + size })
  return undefined
}
