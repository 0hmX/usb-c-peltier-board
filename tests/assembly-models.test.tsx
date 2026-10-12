import { describe, expect, test } from "bun:test"
import { Children, isValidElement } from "react"
import { loadJscadPlan } from "circuit-json-to-gltf"
import { StandardUsbC } from "../src/revision/parts/StandardUsbC"
import { passiveCadModel, tecInductorCadModel } from "../src/revision/cad-models"
import { RetainedPart, retainedComponents } from "../src/revision/retained"
import { positionSchematic } from "../src/revision/schematic"

describe("assembly CAD models", () => {
  test("standard USB-C forwards the supplier model and its orientation", () => {
    const connector = StandardUsbC({ name: "J_TEST" })
    expect(connector.props.standard).toBe("usb_c")
    expect(connector.props.cadModel.objUrl).toContain("C165948.obj")
    expect(connector.props.cadModel.pcbRotationOffset).toBe(180)
  })

  test("new passives have correctly sized models without replacing their pads", () => {
    expect(passiveCadModel("resistor", "1206")?.props.model).toBe("res1206")
    expect(passiveCadModel("capacitor", "0402")?.props.model).toBe("cap0402")
    expect(passiveCadModel("resistor", "unknown")).toBeUndefined()
    const [capacitor] = Children.toArray(positionSchematic(<capacitor name="C_TEST" capacitance="100nF" footprint="0402" />))
    expect(isValidElement(capacitor)).toBe(true)
    if (!isValidElement<Record<string, unknown>>(capacitor)) throw new Error("Missing capacitor")
    expect((capacitor.props.cadModel as { glbUrl: string }).glbUrl).toBeTruthy()
    expect(isValidElement(capacitor.props.footprint)).toBe(true)
  })

  test("TEC inductor envelope follows the APS1360 package dimensions", () => {
    if (!tecInductorCadModel || typeof tecInductorCadModel !== "object" || !("jscad" in tecInductorCadModel)) throw new Error("Missing inductor model")
    const mesh = loadJscadPlan(tecInductorCadModel.jscad)
    expect(mesh.triangles.length).toBeGreaterThan(0)
    expect(mesh.boundingBox.max.x - mesh.boundingBox.min.x).toBeCloseTo(14)
    expect(mesh.boundingBox.max.z - mesh.boundingBox.min.z).toBeCloseTo(12.6)
    expect(mesh.boundingBox.max.y - mesh.boundingBox.min.y).toBeCloseTo(6)
  })

  test("test pads do not turn into imaginary components", () => {
    const item = retainedComponents.find(component => component.part === "testpoint")!
    expect(RetainedPart({ item }).props.cadModel).toBeNull()
  })
})
