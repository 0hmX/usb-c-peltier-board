import { mkdir } from "node:fs/promises"
import { retainedComponents } from "../src/board/retained"
import { processorConnections } from "../src/board/processor"
import { runAllNetlistChecks, runAllSchematicChecks, runAllPlacementChecks } from "@tscircuit/checks"

const circuit: any[] = await Bun.file(process.argv[2] ?? "dist/index/circuit.json").json()
const allSourceComponents = circuit.filter(item => item.type === "source_component")
const pcbSourceIds = new Set(circuit.filter(item => item.type === "pcb_component").map(item => item.source_component_id))
const sourceComponents = allSourceComponents.filter(item => pcbSourceIds.has(item.source_component_id))
const mechanicalComponents = allSourceComponents.filter(item => !pcbSourceIds.has(item.source_component_id))
const sourcePorts = circuit.filter(item => item.type === "source_port")
const sourceNets = circuit.filter(item => item.type === "source_net")
const problems: string[] = []
let checkedPins = 0

function requireCondition(condition: boolean, message: string) {
  if (!condition) problems.push(message)
}

function checkPin(name: string, pin: string, expectedNet: string) {
  const component = sourceComponents.find(item => item.name === name)
  const port = sourcePorts.find(item => item.source_component_id === component?.source_component_id &&
    (item.port_hints?.includes(pin) || item.name === pin || "pin" + item.pin_number === pin))
  const matchingNets = sourceNets.filter(item => item.subcircuit_connectivity_map_key === port?.subcircuit_connectivity_map_key).map(item => item.name)
  requireCondition(Boolean(port) && matchingNets.includes(expectedNet.replace(/^net\./, "")), `${name}.${pin} must connect to ${expectedNet}; found ${matchingNets.join(", ")}`)
  checkedPins++
}

for (const part of retainedComponents) {
  for (const [pin, expected] of Object.entries(part.connections)) {
    checkPin(part.name, pin, part.name === "U_INPUT" && pin === "pin3" ? "net.INPUT_AUXOFF" : expected)
  }
}
for (const [pin, expected] of Object.entries(processorConnections)) checkPin("U_MCU", pin, expected)
const criticalConnections: Record<string, Record<string, string>> = {
  U_PD: { pin1: "PD_VDD", pin2: "PD_CFG2", pin3: "PD_CFG3", pin4: "PD_DATA_SHORT", pin5: "PD_DATA_SHORT", pin6: "USB_CC2", pin7: "USB_CC1", pin8: "PD_VBUS_SENSE", pin9: "PD_CFG1", pin10: "PD_PG_N", pin11: "GND" },
  Q_PD_CFG3: { pin1: "PD_CFG3_LOW", pin2: "GND", pin3: "PD_CFG3" },
  J_USB_PD: { VBUS1: "VBUS_RAW", VBUS2: "VBUS_RAW", CC1: "USB_CC1", CC2: "USB_CC2", GND1: "GND", GND2: "GND" },
  J_USB_PROG: { VBUS1: "USB_PROG_5V", VBUS2: "USB_PROG_5V", CC1: "USB_PROG_CC1", CC2: "USB_PROG_CC2", DP1: "USB_DP_PORT", DP2: "USB_DP_PORT", DM1: "USB_DM_PORT", DM2: "USB_DM_PORT", GND1: "GND", GND2: "GND" },
  U_USB_SWITCH: { pin1: "USB_DP_SWITCH", pin2: "USB_DM_SWITCH", pin5: "GND", pin6: "USB_DATA_DISABLE", pin7: "USB_DM_PORT", pin8: "USB_DP_PORT", pin9: "GND", pin10: "V3V3" },
  U_FLASH: { pin1: "FLASH_CS", pin2: "FLASH_SD1", pin3: "FLASH_SD2", pin4: "GND", pin5: "FLASH_SD0", pin6: "FLASH_SCLK", pin7: "FLASH_SD3", pin8: "V3V3", pin9: "GND" },
  R_USB_DP: { pin1: "USB_DP_SWITCH", pin2: "USB_DP_MCU" },
  R_USB_DM: { pin1: "USB_DM_SWITCH", pin2: "USB_DM_MCU" },
  SW_BOOT: { pin1: "BOOT_BUTTON", pin2: "BOOT_BUTTON", pin3: "GND", pin4: "GND" },
  SW_RESET: { pin1: "MCU_NRST", pin2: "MCU_NRST", pin3: "GND", pin4: "GND" },
  Q_USB_SERVICE: { pin1: "USB_PRESENT_BASE", pin2: "GND", pin3: "INPUT_FAULT_N" },
  D_LOGIC_PD: { pin1: "LOGIC_VIN", pin2: "VBUS_RAW" },
  D_LOGIC_USB: { pin1: "LOGIC_VIN", pin2: "USB_PROG_5V" },
  R_USB_BLEED: { pin1: "USB_PROG_5V", pin2: "GND" },
  D_RESET_SAFE: { pin1: "MCU_NRST", pin2: "INPUT_FAULT_N" },
  U_INPUT: { pin3: "INPUT_AUXOFF" },
  U_AUX_BUFFER: { pin1: "INPUT_AUXOFF", pin2: "GND", pin3: "AUX_LOSS_RAW", pin4: "AUX_LOSS_CLK", pin5: "V3V3", pin6: "AUX_VALID" },
  Q_AUX_INVERT: { pin1: "AUX_VALID", pin2: "GND", pin3: "AUX_LOSS_RAW" },
  R_AUX_LOSS_PU: { pin1: "V3V3", pin2: "AUX_LOSS_RAW" },
  U_AUX_LOSS_LATCH: { pin1: "AUX_LOSS_CLK", pin2: "V3V3", pin4: "GND", pin5: "INPUT_LOSS_LATCHED", pin6: "RUN_CLK", pin7: "V3V3", pin8: "V3V3" },
  Q_AUX_FAULT: { pin1: "INPUT_LOSS_LATCHED", pin2: "GND", pin3: "INPUT_FAULT_N" },
  C_AUX1: { pin1: "V3V3", pin2: "GND" },
  C_AUX2: { pin1: "V3V3", pin2: "GND" },
}
for (const [name, connections] of Object.entries(criticalConnections)) {
  for (const [pin, expected] of Object.entries(connections)) checkPin(name, pin, expected)
}
requireCondition(new Set(allSourceComponents.map(item => item.name)).size === allSourceComponents.length, "Reference designators must be unique")
requireCondition(sourceComponents.length === 276, "Revision B with input-loss interlock must contain 276 electrical PCB components")
for (const name of ["J_SWD", "J_UART", "J_SERVICE", "R_SWCLK", "R_SWDIO", "R_UART_TX", "R231"]) {
  requireCondition(!allSourceComponents.some(item => item.name === name), `${name} must not remain in the USB-C-only programming revision`)
}
requireCondition(!sourceNets.some(item => /^(UART_|SWCLK|SWDIO)/.test(item.name)), "UART/SWD nets must not remain")
const mcu = sourceComponents.find(item => item.name === "U_MCU")
for (const pin of [2, 3, 24, 25]) {
  const port = sourcePorts.find(item => item.source_component_id === mcu?.source_component_id && item.pin_number === pin)
  requireCondition(port?.do_not_connect === true && !port.subcircuit_connectivity_map_key, `U_MCU.pin${pin} must be explicitly unconnected`)
}
for (const component of mechanicalComponents) {
  requireCondition(!sourcePorts.some(port => port.source_component_id === component.source_component_id), "Mechanical concepts must not create electrical ports")
  requireCondition(!circuit.some(item => item.type === "schematic_component" && item.source_component_id === component.source_component_id), "Mechanical concepts must not create schematic symbols")
}
requireCondition(!sourceComponents.some(item => /STUSB4500|STM32G030/.test(item.manufacturer_part_number ?? "")), "Legacy CPU/PD parts must not remain in the revision")
requireCondition(sourceComponents.filter(item => item.standard === "usb_c").length === 2, "Use exactly two standard USB-C connectors")
for (const [name, pinCount, supplierId] of [
  ["J_HOT", 2, "C160402"], ["J_COLD", 2, "C160402"], ["J_FAN", 4, "C160404"],
] as const) {
  const component = sourceComponents.find(item => item.name === name)
  requireCondition(component?.standard === "jst_sh" && component.pin_count === pinCount &&
    component.supplier_part_numbers?.jlcpcb?.includes(supplierId), `${name} must use the qualified side-entry JST SH package`)
}
requireCondition(sourceComponents.find(item => item.name === "J_TEC")?.supplier_part_numbers?.jlcpcb?.includes("C474881"),
  "TEC must retain its high-current terminal, not the 1 A JST SH connector")
const isolatedRailNames = ["VBUS_RAW", "VBUS_TEC", "USB_PROG_5V", "LOGIC_VIN", "V3V3", "V1V1", "GND"]
const isolatedRailKeys = isolatedRailNames.map(name => sourceNets.find(item => item.name === name)?.subcircuit_connectivity_map_key)
requireCondition(isolatedRailKeys.every(Boolean) && new Set(isolatedRailKeys).size === isolatedRailNames.length, "Power-domain rails must not be shorted together in the netlist")
const board = circuit.find(item => item.type === "pcb_board")
requireCondition(board?.width === 110 && board?.height === 85 && board?.num_layers === 4, "Board must be 110 × 85 mm, four layers")
for (const type of ["pcb_trace", "pcb_via", "pcb_copper_pour", "pcb_copper_pour_rect", "pcb_copper_pour_polygon"]) {
  requireCondition(!circuit.some(item => item.type === type), "Placement review must contain no " + type)
}
requireCondition(circuit.filter(item => item.type === "schematic_sheet").length === 8, "Final review must contain eight schematic sheets")
for (const item of circuit.filter(item => item.type.includes("error") || item.type === "schematic_element_outside_sheet_warning" || item.type === "pcb_component_missing_courtyard_warning")) {
  problems.push(item.message ?? item.type)
}
const warnings: Record<string, number> = {}
for (const item of circuit.filter(item => item.type.includes("warning"))) warnings[item.type] = (warnings[item.type] ?? 0) + 1
const nativeChecks = {
  netlist: await runAllNetlistChecks(circuit),
  schematic: await runAllSchematicChecks(circuit),
  placement: await runAllPlacementChecks(circuit),
}
for (const [category, issues] of Object.entries(nativeChecks)) {
  for (const issue of issues) problems.push(category + ": " + issue.message)
}
const result = { passed: problems.length === 0, checkedPins, components: sourceComponents.length, mechanicalComponents: mechanicalComponents.length, retainedComponents: retainedComponents.length,
  schematicSheets: circuit.filter(item => item.type === "schematic_sheet").length, routedTraces: circuit.filter(item => item.type === "pcb_trace").length,
  nativeCheckCounts: Object.fromEntries(Object.entries(nativeChecks).map(([name, issues]) => [name, issues.length])), warnings, problems }
await mkdir("review", { recursive: true })
await Bun.write("review/checks.json", JSON.stringify(result, null, 2) + "\n")
console.log(JSON.stringify(result, null, 2))
if (!result.passed) process.exit(1)
