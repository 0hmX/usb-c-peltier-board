import { Port, type Via } from "@tscircuit/core"

// Core 2124 initializes only outer-layer ports before a via is parented.
// Register a real interior terminal against the same through-via primitive.
export function attachLogicSupplyInner2Port(via: Via | null) {
  if (!via || via.children.some(child => child instanceof Port && child.getNameAndAliases().includes("inner2"))) return
  const port = new Port({ name: "inner2", layer: "inner2" })
  port.registerMatch(via)
  via.add(port)
}

export const logicSupplyConnectionPlans = [
  { name: "ALERT_VCC_LINK", net: "V3V3", from: "R_PD_ALERT.pin1", to: "R_INPUT_FAULT.pin1",
    traces: ["ALERT_PD_VCC_LAUNCH", "ALERT_INNER2_TRUNK", "ALERT_INPUT_VCC_LAUNCH"] },
  { name: "MON_FAN_VCC_LINK", net: "V3V3", from: "U_TEC_MON.pin5", to: "FAN_ENABLE_VCC_ESCAPE.top",
    traces: ["MON_C43_BYPASS", "MON_VCC_LAUNCH", "MON_FAN_INNER2_TRUNK"] },
] as const

export function LogicSupplyLinks() {
  return <>
    <via name="LOGIC_ALERT_PD_VIA" pcbX={-29.167} pcbY={16.267} holeDiameter={0.3} outerDiameter={0.7}
      fromLayer="top" toLayer="bottom" connectsTo="net.V3V3" tented {...{ ref: attachLogicSupplyInner2Port }} />
    <via name="LOGIC_ALERT_INPUT_VIA" pcbX={-24.525} pcbY={27.75} holeDiameter={0.3} outerDiameter={0.7}
      fromLayer="top" toLayer="bottom" connectsTo="net.V3V3" tented {...{ ref: attachLogicSupplyInner2Port }} />
    <via name="LOGIC_MON_VIA" pcbX={27.146} pcbY={20.426} holeDiameter={0.3} outerDiameter={0.7}
      fromLayer="top" toLayer="bottom" connectsTo="net.V3V3" tented {...{ ref: attachLogicSupplyInner2Port }} />
    <trace name="ALERT_PD_VCC_LAUNCH" from="LOGIC_ALERT_PD_VIA.top" to="R_PD_ALERT.pin1" thickness={0.2}
      pcbPathRelativeTo="LOGIC_ALERT_PD_VIA.top"
      pcbPath={["LOGIC_ALERT_PD_VIA.top", { x: -0.633, y: -0.633 }, "R_PD_ALERT.pin1"]} />
    <trace name="ALERT_INNER2_TRUNK" from="LOGIC_ALERT_PD_VIA.inner2" to="LOGIC_ALERT_INPUT_VIA.inner2" thickness={0.2}
      pcbPathRelativeTo="LOGIC_ALERT_PD_VIA.inner2"
      pcbPath={["LOGIC_ALERT_PD_VIA.inner2", { x: 0, y: 6.841 }, "LOGIC_ALERT_INPUT_VIA.inner2"]} />
    <trace name="ALERT_INPUT_VCC_LAUNCH" from="LOGIC_ALERT_INPUT_VIA.top" to="R_INPUT_FAULT.pin1" thickness={0.2}
      pcbPathRelativeTo="LOGIC_ALERT_INPUT_VIA.top"
      pcbPath={["LOGIC_ALERT_INPUT_VIA.top", { x: 0.025, y: 0 }, "R_INPUT_FAULT.pin1"]} />
    <trace name="MON_C43_BYPASS" from="C43.pin1" to="U_TEC_MON.VS" thickness={0.2} maxLength={2.3}
      pcbPathRelativeTo="C43.pin1"
      pcbPath={["C43.pin1", { x: -0.5, y: -0.2 }, { x: -0.5, y: -1.895 }, "U_TEC_MON.VS"]} />
    <trace name="MON_VCC_LAUNCH" from="LOGIC_MON_VIA.top" to="U_TEC_MON.pin5" thickness={0.2}
      pcbPathRelativeTo="LOGIC_MON_VIA.top"
      pcbPath={["LOGIC_MON_VIA.top", { x: -0.051, y: -0.051 }, "U_TEC_MON.pin5"]} />
    <trace name="MON_FAN_INNER2_TRUNK" from="LOGIC_MON_VIA.inner2" to="FAN_ENABLE_VCC_ESCAPE.inner2" thickness={0.2}
      pcbPathRelativeTo="LOGIC_MON_VIA.inner2"
      pcbPath={["LOGIC_MON_VIA.inner2", { x: 0, y: -3.426 }, { x: 5.854, y: -9.28 },
        { x: 5.854, y: -15.426 }, { x: 8.754, y: -18.326 }, "FAN_ENABLE_VCC_ESCAPE.inner2"]} />
  </>
}
