import { Fragment, createElement } from "react"
import { boardLayoutProps, placementFor } from "./layout"
import { RetainedPart, retainedComponents } from "./retained"
import { positionSchematic, schematicFor, schematicSheets, sheetFor } from "./schematic"
import { PowerAndUsb } from "./power-and-usb"
import { Processor } from "./processor"
import { UsbDataPath } from "./usb-data-path"
import { InputLossInterlock } from "./input-loss-interlock"

const namedNets = [...new Set(retainedComponents.flatMap(item => Object.values(item.connections)).map(selector => selector.slice(4)))].filter(name => name !== "GND")

export function DualUsbPeltierBoard({ schematicDisabled = false }: { schematicDisabled?: boolean } = {}) {
  return <board {...boardLayoutProps} title="RP2040 + CH224K dual-USB Peltier controller · placement review"
    routingDisabled routeRemaining={false} schematicDisabled={schematicDisabled} schLayout={{ layoutMode: "none" }}
    schTraceAutoLabelEnabled schMaxTraceDistance={0.25} pcbStyle={{ silkscreenTextVisibility: "hidden" }}>
    <net name="GND" isGroundNet />
    {namedNets.map(name => <Fragment key={name}><net name={name} /></Fragment>)}
    {schematicSheets.map(([name, displayName], index) => <Fragment key={name}><schematicsheet name={name} displayName={displayName} sheetIndex={index + 1} sheetSize="A4" sheetWidth={594} sheetHeight={420}>
      <schematictext text={displayName} schX={0} schY={20.5} fontSize={0.32} />
      {name === "USB" && <>
        <netlabel net="GND" connectsTo=".Q_USB_PRESENT > .pin2" inline anchorSide="top" />
        <netlabel net="GND" connectsTo=".Q_USB_SERVICE > .pin2" inline anchorSide="top" />
        <netlabel net="V3V3" connectsTo=".U_USB_SWITCH > .pin10" inline anchorSide="bottom" />
      </>}
      {name === "PD" && <netlabel net="GND" connectsTo=".Q_PD_CFG3 > .pin2" schX={-6.6} schY={9.1} anchorSide="top" />}
      {name === "FAN" && <>
        <netlabel net="GND" connectsTo=".U_FAN > .pin1" schX={-13.6} schY={6.75} anchorSide="top" />
        <netlabel net="GND" connectsTo=".Q_FAN_PWM > .pin2" schX={-1.3} schY={6.2} anchorSide="top" />
      </>}
      <schematicsection name={name + "_ACTIVE"} />
      <schematicsection name={name + "_PASSIVE"} />
      {name === "SAFE" && <schematicsection name="SAFE_INPUT_LOSS" />}
      {(name === "PD" || name === "USB") && <schematicsection name={name + "_NEW"} />}
      {name === "MCU" && <>
        <schematicsection name="MCU_CORE" />
        <schematicsection name="MCU_SUPPORT" />
        <schematicsection name="MCU_BYPASS" />
      </>}
    </schematicsheet></Fragment>)}
    {retainedComponents.map(item => <RetainedPart key={item.name} item={item}
      {...placementFor(item)} {...schematicFor(item, retainedComponents.filter(peer => sheetFor(peer) === sheetFor(item)))}
      {...(item.name === "U_INPUT" ? { noConnect: ["ITIMER"], connections: { ...item.connections, pin3: "net.INPUT_AUXOFF" } } : {})}
      {...(item.name === "Q_FAN_PWM" ? { connections: Object.fromEntries(Object.entries(item.connections).filter(([pin]) => pin !== "pin2")) } : {})} />)}
    {positionSchematic(PowerAndUsb())}
    {positionSchematic(Processor())}
    {positionSchematic(UsbDataPath())}
    {positionSchematic(InputLossInterlock())}
    {[[-49, 36], [49, 36], [-49, -36], [49, -36]].map(([pcbX, pcbY], index) => <Fragment key={index}><hole name={"H" + (index + 1)} diameter={3.2} pcbX={pcbX} pcbY={pcbY} />{createElement("keepout", { shape: "circle", radius: 4, pcbX, pcbY, layers: ["top", "inner1", "inner2", "bottom"] })}</Fragment>)}
    <group name="LEGEND" pcbStyle={{ silkscreenTextVisibility: "visible" }}>
    <silkscreentext text="PD POWER" pcbX={-48} pcbY={32} fontSize={1.5} />
    <silkscreentext text="USB PROGRAM" pcbX={-47} pcbY={-10} fontSize={1.3} />
    <silkscreentext text="RP2040 / CH224K" pcbX={0} pcbY={-40} fontSize={1.3} />
    <silkscreentext text="TEC +" pcbX={48} pcbY={28} fontSize={1.3} />
    <silkscreentext text="HEATSINK REQUIRED" pcbX={32} pcbY={-6} fontSize={1.2} />
    <silkscreentext text="HOT" pcbX={16} pcbY={-40} fontSize={1.1} />
    <silkscreentext text="COLD" pcbX={25} pcbY={-40} fontSize={1.1} />
    <silkscreentext text="FAN" pcbX={37} pcbY={-40} fontSize={1.1} />
    <silkscreentext text="BOOT" pcbX={-43} pcbY={-26} fontSize={1.1} />
    <silkscreentext text="RESET" pcbX={-33} pcbY={-40} fontSize={1.1} />
    </group>
  </board>
}
