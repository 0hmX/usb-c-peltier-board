import type { RetainedComponent } from "./retained"
import { Children, cloneElement, isValidElement, type ReactNode } from "react"
import { revisedPlacements } from "./layout"
import { passiveFootprint } from "./passive-footprint"
import { schematicRefinements } from "./schematic-refinements"
import { passiveCadModel } from "./cad-models"
import { withPortableCadModels } from "./resolve-cad-models"

export const schematicSheets = [
  ["PD", "01 · USB-C PD power and voltage qualification"],
  ["USB", "02 · Programming USB and isolated logic supply"],
  ["MCU", "03 · RP2040, flash and 12 MHz clock"],
  ["TEC", "04 · Current-controlled Peltier converter"],
  ["SAFE", "05 · Fail-off latches and hardware interlocks"],
  ["SENSE", "06 · Thermistors and analogue measurements"],
  ["FAN", "07 · Fan supply, PWM and tachometer"],
  ["DEBUG", "08 · Indicators and test access"],
] as const

const logicParts = new Set(["U_LOGIC", "L_LOGIC", "C200", "C201", "C202"])
const sensorParts = new Set(["U_THERMAL", "C208", "J_HOT", "J_COLD", "R208", "R209", "R210", "R211", "R212", "R213", "R214", "R215", "R216", "R217", "R222", "R223", "R224", "R225", "C209", "C210", "C211", "C212"])
const fanParts = new Set(["U_FAN", "L_FAN", "J_FAN", "Q_FAN_PWM", "R218", "R219", "R220", "R221", "R228", "R229", "C213", "C214", "C215", "C218", "C219", "C220", "C221"])

export function sheetFor(item: RetainedComponent) {
  if (item.block === "tec") return "TEC"
  if (item.block === "debug") return "DEBUG"
  if (item.block === "input") return "PD"
  if (logicParts.has(item.name)) return "USB"
  if (sensorParts.has(item.name)) return "SENSE"
  if (fanParts.has(item.name)) return "FAN"
  return "SAFE"
}

export function schematicFor(item: RetainedComponent, peers: RetainedComponent[]) {
  const sheet = sheetFor(item)
  const isChip = (part: RetainedComponent) => /^(U|Q|J|L)/.test(part.name)
  const chips = peers.filter(isChip)
  const passives = peers.filter(part => !isChip(part))
  const index = (isChip(item) ? chips : passives).indexOf(item)
  const columns = isChip(item) ? 4 : 7
  const verticalOffset = ["PD", "USB"].includes(sheet) ? -24 : 0
  return {
    schSheetName: sheet,
    schSectionName: sheet + (isChip(item) ? "_ACTIVE" : "_PASSIVE"),
    ...sheetCoordinates(sheet, (index % columns) * 8, (isChip(item) ? 11 : -2) - Math.floor(index / columns) * 5 + verticalOffset),
    ...(item.name === "U_SUPERVISOR" ? { schWidth: 3 } : {}),
    ...({ U_LATCH: { schX: -12.56 }, U_SUPERVISOR: { schX: -6.24 }, U2: { schX: -12.5 }, Q20: { schX: -7.1, schY: 7.05 }, Q22: { schX: -11.4 }, Q23: { schX: -6.45 } }[item.name] ?? {}),
    ...(schematicRefinements[item.name] ?? {}),
    ...(item.name === "J_TEC" ? { schPinArrangement: { topSide: { pins: [1], direction: "left-to-right" as const }, bottomSide: { pins: [2], direction: "left-to-right" as const } } } : {}),
  }
}

function sheetCoordinates(sheet: string, horizontalPosition: number, verticalPosition: number) {
  return { schX: horizontalPosition * 0.65 - 12, schY: verticalPosition * 0.65 }
}

export function positionSchematic(node: ReactNode): ReactNode {
  return Children.map(node, child => {
    if (!isValidElement<Record<string, any>>(child)) return child
    const props = child.props
    const pose = revisedPlacements[props.name]
    return withPortableCadModels(cloneElement(child, {
      ...(props.schSheetName ? sheetCoordinates(props.schSheetName, props.schX ?? 0, props.schY ?? 0) : {}),
      ...(props.name === "U_MCU" ? { ...sheetCoordinates("MCU", -10, 7), schWidth: 11, schHeight: 8 } : {}),
      ...(props.name === "U_PD" ? { schWidth: 2.6, schHeight: 1.8 } : {}),
      ...(schematicRefinements[props.name] ?? {}),
      ...(pose ? { pcbX: pose[0], pcbY: pose[1], pcbRotation: pose[2] ?? props.pcbRotation ?? 0 } : {}),
      ...(typeof props.footprint === "string" && ["resistor", "capacitor"].includes(String(child.type)) && passiveFootprint(props.footprint)
        ? { footprint: passiveFootprint(props.footprint), cadModel: props.cadModel ?? passiveCadModel(String(child.type), props.footprint) } : {}),
      ...(props.children ? { children: positionSchematic(props.children) } : {}),
    }))
  })
}
