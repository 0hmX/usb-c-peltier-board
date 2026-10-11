const routes = [
  { name: "PERMISSION_PNP_BASE_LOCAL", net: "TEC_PERMISSION_PNP_BASE", from: "Q22.pin1", to: "R35.pin2", points: [{ x: -2.3, y: -0.95 }] },
  { name: "PERMISSION_NPN_BASE_LOCAL", net: "TEC_PERMISSION_NPN_BASE", from: "R37.pin2", to: "R38.pin1", points: [{ x: 1.8, y: 1 }] },
  { name: "PERMISSION_SUPPLY_LOCAL", net: "TEC_PERMISSION_SUPPLY", from: "Q22.pin3", to: "R39.pin1", points: [{ x: 2.25, y: 0 }] },
  { name: "PERMISSION_PNP_DRIVE_LOCAL", net: "TEC_PERMISSION_PNP_DRIVE", from: "Q23.pin3", to: "R36.pin2", points: [{ x: -2.01, y: -1 }] },
  { name: "PD_LATCH_PULLDOWN_LOCAL", net: "PD_LATCH_INHIBIT", from: "R206.pin2", to: "R207.pin1", points: [] },
  { name: "TEC_CLEAR_PULLDOWN_LOCAL", net: "TEC_CLEAR_RAW", from: "R202.pin2", to: "R203.pin1", points: [{ x: -0.75, y: -1.5 }] },
  { name: "PD_LATCH_BASE_LOCAL", net: "PD_LATCH_INHIBIT", from: "Q_PD_LATCH.pin1", to: "R207.pin1",
    points: [{ x: 3.7, y: -0.95 }, { x: 4, y: -0.65 }, { x: 4, y: 1.75 }] },
] as const

// The two latch branches share R207; contract their genuine pad island once.
export const controlLocalConnectionPlans = [
  ...routes.filter(route => route.net !== "PD_LATCH_INHIBIT").map(route => ({
    name: route.name, net: route.net, from: route.from, to: route.to, traces: [route.name],
  })),
  { name: "PD_LATCH_LOCAL_GROUP", net: "PD_LATCH_INHIBIT", from: "R206.pin2", to: "R207.pin1",
    traces: ["PD_LATCH_PULLDOWN_LOCAL", "PD_LATCH_BASE_LOCAL"], requiredSelectors: ["Q_PD_LATCH.pin1"],
    branchEndpoints: {
      PD_LATCH_PULLDOWN_LOCAL: ["R206.pin2", "R207.pin1"],
      PD_LATCH_BASE_LOCAL: ["Q_PD_LATCH.pin1", "R207.pin1"],
    } },
] as const

export function ControlLocalRoutes() {
  return <>{routes.map(({ name, from, to, points }) => <trace key={name} name={name}
    from={from} to={to} thickness={0.2} pcbPathRelativeTo={from} pcbPath={[from, ...points, to]} />)}</>
}
