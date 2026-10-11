import path from "node:path"
import { readFileSync } from "node:fs"
import { createHash } from "node:crypto"
import { fanoutTracePath, type FanoutTracePath } from "@tscircuit/props"
import type { AutoroutingStartEvent } from "@tscircuit/core"
import { Children, cloneElement, isValidElement, type ReactNode } from "react"

type CompletedPhase = {
  name: string; phase: number | null; phaseStageIndex?: number;
  inputFile: string; inputSha256: string; outputFile: string; outputSha256: string;
  pcbTracePathsFile?: string; pcbTracePathsSha256?: string
}
type PhaseCheckpoint = {
  sourceSha256: string; sourceManifest: {file: string; sha256: string}[];
  coreVersion: string; routerVersion: string; runtimeSha256: string; evidenceDirectory: string;
  sourceUnchangedAtCheckpoint: boolean; runtimeUnchangedAtCheckpoint: boolean;
  phaseResults: CompletedPhase[]
}
export type PhaseReplay = CompletedPhase & {pcbTracePaths: FanoutTracePath[]; checkpointSha256: string}
const sha256 = (text: string) => createHash("sha256").update(text).digest("hex")

// Replay only unguarded completed phases. Later cohorts still exercise the live
// guarded solver and produce fresh original/adapted/native/restored receipts.
export function loadPhaseCheckpoint({checkpointPath, sourceSha256, coreVersion, routerVersion, runtimeSha256}: {
  checkpointPath: string; sourceSha256: string; coreVersion: string; routerVersion: string; runtimeSha256: string
}): PhaseReplay[] {
  const checkpointText = readFileSync(checkpointPath, "utf8")
  const checkpoint: PhaseCheckpoint = JSON.parse(checkpointText)
  if (checkpoint.sourceUnchangedAtCheckpoint !== true || checkpoint.runtimeUnchangedAtCheckpoint !== true)
    throw new Error("Saved phase was captured while source/runtime bytes were changing")
  if (checkpoint.sourceSha256 !== sourceSha256 || sha256(JSON.stringify(checkpoint.sourceManifest)) !== sourceSha256)
    throw new Error("Saved phase source identity differs from the current complete build inputs")
  if (checkpoint.coreVersion !== coreVersion || checkpoint.routerVersion !== routerVersion || checkpoint.runtimeSha256 !== runtimeSha256)
    throw new Error("Saved phase runtime differs from the pinned current runtime")
  if (!checkpoint.evidenceDirectory) throw new Error("Saved phase checkpoint lacks its evidence directory")
  const evidenceDirectory = path.resolve(path.dirname(checkpointPath), checkpoint.evidenceDirectory)
  const replays: PhaseReplay[] = []
  for (const phase of checkpoint.phaseResults) {
    if (phase.phase === null || phase.phase >= 2) continue
    if (replays.some(replay => replay.phase === phase.phase)) throw new Error("Saved phase has multiple stages; replay is unsupported")
    if (!phase.pcbTracePathsFile || !phase.pcbTracePathsSha256) break
    for (const [file, expectedSha256] of [[phase.inputFile, phase.inputSha256], [phase.outputFile, phase.outputSha256],
      [phase.pcbTracePathsFile, phase.pcbTracePathsSha256]]) {
      if (sha256(readFileSync(path.join(evidenceDirectory, file), "utf8")) !== expectedSha256)
        throw new Error(`Saved phase evidence hash mismatch: ${file}`)
    }
    const savedPaths: FanoutTracePath[] = JSON.parse(readFileSync(path.join(evidenceDirectory, phase.pcbTracePathsFile), "utf8"))
    const pcbTracePaths = savedPaths.map(savedPath => fanoutTracePath.parse(savedPath))
    if (!pcbTracePaths.length) throw new Error("Saved completed phase has no full paths")
    replays.push({...phase, pcbTracePaths, checkpointSha256: sha256(checkpointText)})
  }
  if (!replays.length) throw new Error("Checkpoint has no replayable completed unguarded phases")
  return replays
}

export function verifyLivePhaseReplay({event, replay}: {event: AutoroutingStartEvent; replay: PhaseReplay}) {
  if (event.phaseName !== replay.name || event.routingPhaseIndex !== replay.phase
    || (event.phaseStageIndex ?? 0) !== (replay.phaseStageIndex ?? 0)
    || sha256(JSON.stringify(event.simpleRouteJson, null, 2)) !== replay.inputSha256)
    throw new Error(`Live phase input differs from saved checkpoint: ${event.phaseName}`)
}

export function selectPrefixPhases({node, throughPhase, phaseReplays}: {
  node: ReactNode; throughPhase?: number; phaseReplays: PhaseReplay[]
}): ReactNode {
  if (!isValidElement<{children?: ReactNode; phaseIndex?: number; routingPhaseIndex?: number;
    pcbTracePaths?: FanoutTracePath[]}>(node)) return node
  if (node.type === "autoroutingphase") {
    if (throughPhase !== undefined && (node.props.phaseIndex ?? 0) > throughPhase) return null
    const replay = phaseReplays.find(phase => phase.phase === node.props.phaseIndex)
    if (replay) return cloneElement(node, {pcbTracePaths: replay.pcbTracePaths})
  }
  // Core also creates plans directly from net/trace phase assignments. Keep the
  // electrical declarations, but defer their late assignments to routeRemaining=false.
  const element = throughPhase !== undefined && (node.props.routingPhaseIndex ?? 0) > throughPhase
    ? cloneElement(node, {routingPhaseIndex: undefined}) : node
  return element.props.children === undefined ? element : cloneElement(element, {
    children: Children.map(element.props.children, child => selectPrefixPhases({node: child, throughPhase, phaseReplays}))})
}

export function declaredRoutingPlan(nodes:ReactNode[]) {
  const phases:{index:number;name:string;stageCount:number}[]=[],assignments:number[]=[]
  const visit=(node:ReactNode)=>{
    if(!isValidElement<{children?:ReactNode;phaseIndex?:number;routingPhaseIndex?:number;name?:string;
      autorouter?:string|{preset?:string;algorithmFn?:unknown};algorithmFn?:unknown}>(node))return
    const props=node.props
    if(node.type==="autoroutingphase"){
      const index=props.phaseIndex
      if(!Number.isInteger(index)||index===undefined||index<0||!props.name||phases.some(phase=>phase.index===index))
        throw new Error("Routing plan requires unique named original phase indices")
      const config=props.autorouter,preset=typeof config==="string"?config:config?.preset
      const callback=props.algorithmFn??(typeof config==="object"?config.algorithmFn:undefined)
      phases.push({index,name:props.name,stageCount:!callback&&["fanout","single_layer_fanout","dogbone"].includes(preset??"")?2:1})
    }
    if(props.routingPhaseIndex!==undefined)assignments.push(props.routingPhaseIndex)
    Children.forEach(props.children,visit)
  }
  nodes.forEach(visit)
  if(assignments.some(index=>!phases.some(phase=>phase.index===index)))
    throw new Error("Source assignment would synthesize an undeclared routing phase")
  phases.sort((a,b)=>a.index-b.index)
  return {phases,plannedStageCount:phases.reduce((count,phase)=>count+phase.stageCount,0)}
}

export function verifyPrefixRoutingEvent({event, throughPhase,routingPlan}: {
  event: Pick<AutoroutingStartEvent, "routingPhaseIndex" | "phaseCount">; throughPhase?: number;
  routingPlan?:ReturnType<typeof declaredRoutingPlan>
}) {
  if (throughPhase === undefined) return
  if (event.routingPhaseIndex === null || event.routingPhaseIndex === undefined
    || event.routingPhaseIndex > throughPhase || event.routingPhaseIndex < 0)
    throw new Error(`Native phase exceeds the requested prefix: ${event.routingPhaseIndex}`)
  if(!routingPlan||!routingPlan.phases.some(phase=>phase.index===event.routingPhaseIndex))
    throw new Error("Native prefix phase is absent from the actual declared routing plan")
  if (event.phaseCount !== routingPlan.plannedStageCount)
    throw new Error(`Native prefix has unexpected planned stages: ${event.phaseCount}`)
}
