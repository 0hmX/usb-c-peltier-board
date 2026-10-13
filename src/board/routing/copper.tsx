import { Fragment } from "react"
import generated from "./generated.json"
import { attachLogicSupplyInner2Port } from "../../legacy/logic-supply-links"

/** Saved, explicitly declared routing copper. No implicit autorouting is used. */
export function RevisionBCopper() {
  return <>
    {generated.vias.map(v => <Fragment key={v.name}><via name={v.name} pcbX={v.x} pcbY={v.y}
      holeDiameter={0.3} outerDiameter={0.7} fromLayer="top" toLayer="bottom"
      connectsTo={`net.${v.net}`} tented {...{ ref: attachLogicSupplyInner2Port }} /></Fragment>)}
    {generated.traces.map(t => {
      const origin=t.origin, angle=t.rotation*Math.PI/180
      // This core version applies the component origin and footprint rotation.
      const path=t.path.slice(1,-1).map(p=>({
        x:(p.x-origin.x)*Math.cos(angle)+(p.y-origin.y)*Math.sin(angle),
        y:-(p.x-origin.x)*Math.sin(angle)+(p.y-origin.y)*Math.cos(angle),
      }))
      return <Fragment key={t.name}><trace name={t.name} from={t.from} to={t.to}
        thickness={t.width} pcbPathRelativeTo={t.from} pcbPath={[t.from,...path,t.to]} /></Fragment>
    })}
    <copperpour name="REV_B_GROUND_REFERENCE" connectsTo="net.GND" layer="inner1"
      clearance={0.25} boardEdgeMargin={0.5} useThermalReliefs={false} coveredWithSolderMask />
  </>
}
