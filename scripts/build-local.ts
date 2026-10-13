import path from "node:path"
import { mkdirSync, readFileSync,writeFileSync,renameSync } from "node:fs"
import { createHash,randomUUID } from "node:crypto"
import { Children,cloneElement,isValidElement,type ReactNode } from "react"
import { Circuit, type AutoroutingStartEvent, type AutoroutingEndEvent, type AutoroutingErrorEvent, type AutoroutingProgressEvent } from "@tscircuit/core"
import { convertCircuitJsonToPcbSvg, convertCircuitJsonToStackedSchematicSheetsSvg } from "circuit-to-svg"
import type { PlatformConfig } from "@tscircuit/props"
import Board from "../regenerate"
import { supplierOrientationCache } from "../src/parts/supplier-parts-engine"
import { setSupplyRoutingAuditHook, type SupplyRoutingEvidence } from "../src/legacy/supply-router"
import { setGuardedRoutingAuditHook,setGuardedRoutingInputAuditHook,setGuardedRoutingLifecycleAuditHook,createGuardedNativeRegionalRouter,createGuardedNativePolyRegionalRouter,guardedSolverNames,guardedSolverPreprocessing,guardedNativeSolverOptions,setGuardedCurrentBarrelProof,setGuardedSourceCopperProof,type GuardedRoutingEvidence,type GuardedRoutingInputEvidence,type GuardedRoutingLifecycleEvent } from "../src/legacy/guarded-router"
import {installSupplierPortAnchors,verifySupplierPortAnchors}from"../src/legacy/component-port-anchors"
import {GroundPlaneFanout} from "../src/legacy/bus-routing"
import {RegeneratedBusRouting as BusRouting,PhasedSignalRouting} from "../src/legacy/regeneration-routing"
import {sourceTerminalEscapePlans} from "../src/legacy/source-terminal-escapes"
import {sourcePadConnectionPlans} from "../src/legacy/source-pad-connections"
import {loadPhaseCheckpoint,verifyLivePhaseReplay,selectPrefixPhases,verifyPrefixRoutingEvent,declaredRoutingPlan} from "./phase-checkpoints"
import {captureInitialCopper,verifyManualPreloads,verifyPreservedManualCopper,type InitialCopper} from "./preserved-manual-copper"
import {inspectSourcePreflight} from "./source-preflight"
import {parsePhaseTimeoutMs} from "./build-with-watchdog"
import {loadSourceGroundMaterialization} from "./source-ground-materialization-proof"
import {bindPhase6RoutingRegion,phase6RoutingRegion} from "./phase6-region-override"
import {restrictRoutingBounds} from "../src/legacy/regional-routing"

const option=(name:string,fallback:string)=>{
  const index=process.argv.indexOf(name)
  return index<0?fallback:process.argv[index+1]??fallback
}
const outputDir=path.resolve(option("--output-dir","dist/index"))
const debugDir=path.resolve(option("--debug-dir","dist/autorouter-debug-local"))
const phaseTimeoutMs=parsePhaseTimeoutMs(process.argv.includes("--phase-timeout-seconds")?option("--phase-timeout-seconds",""):undefined)
const sourceGroundProofPath=option("--source-ground-proof","")
const placementOnly=process.argv.includes("--placement-only")
const pcbOnly=process.argv.includes("--pcb-only")
const sourcePreflightOnly=process.argv.includes("--source-preflight-only")
if(sourcePreflightOnly&&placementOnly)throw new Error("Source preflight and settled placement are separate build modes")
const groundPhase=GroundPlaneFanout()
const sourcePrecomputedOnly=(sourcePreflightOnly||placementOnly)&&Array.isArray(groundPhase.props.pcbTracePaths)
if(sourcePrecomputedOnly&&!groundPhase.props.pcbTracePaths.length)throw new Error("Source Ground0 paths must not be empty")
const throughPhaseArgument=option("--through-phase","")
const resumeCheckpoint=option("--resume-phase-checkpoint","")
const throughPhase=throughPhaseArgument===""?undefined:Number(throughPhaseArgument)
const phase6RegionRequested=process.argv.includes("--phase-6-region")
const phase6PolyRequested=process.argv.includes("--phase-6-poly")
if(phase6PolyRequested&&!phase6RegionRequested)throw new Error("--phase-6-poly requires the reviewed --phase-6-region whole-phase binding")
if(phase6RegionRequested&&(placementOnly||sourcePreflightOnly||sourcePrecomputedOnly||throughPhase!==undefined&&throughPhase<6))
  throw new Error("--phase-6-region requires a native build including original phase6")
if(throughPhase!==undefined&&(!Number.isInteger(throughPhase)||throughPhase<2))
  throw new Error("--through-phase requires an integer phase index of at least2")
const cacheDir=path.resolve(".tscircuit/local-core-cache")
for(const dir of [outputDir,debugDir,cacheDir])mkdirSync(dir,{recursive:true})
const runId=process.env.TEC_BUILD_RUN_ID??randomUUID()
const writeHeartbeat=(state:string,event?:AutoroutingStartEvent)=>{
  const file=path.join(outputDir,"routing-heartbeat.json"),temp=`${file}.${runId}.tmp`
  writeFileSync(temp,JSON.stringify({runId,state,startedAt:Date.now(),routingPhaseIndex:event?.routingPhaseIndex,phaseStageIndex:event?.phaseStageIndex}))
  renameSync(temp,file)
}
writeHeartbeat("INITIAL_RENDER")
const sha256=(text:string|Uint8Array)=>createHash("sha256").update(text).digest("hex")
const captureSource=async()=>{
  const files=["index.tsx","regenerate.tsx","regenerate.config.ts","archive/captured-pcb/circuit.json","tscircuit.config.ts","tsconfig.json","package.json","bun.lock","scripts/build-local.ts","scripts/build-with-watchdog.ts","scripts/phase-checkpoints.ts","scripts/preserved-manual-copper.ts","scripts/resolve-source-trace-endpoints.ts","scripts/source-ground-pad-copper.ts","scripts/source-trace-widths.ts","scripts/source-preflight.ts","scripts/source-ground-materialization-proof.ts","scripts/phase6-region-override.ts",...await Array.fromAsync(new Bun.Glob("src/**/*.{ts,tsx,json}").scan("."))].sort()
  return Promise.all(files.map(async file=>({file,sha256:sha256(await Bun.file(file).bytes())})))
}
const sourceManifest=await captureSource()
const sourceSha256=sha256(JSON.stringify(sourceManifest))
await Bun.write(path.join(outputDir,"source-identity.json"),JSON.stringify({runId,sourceSha256,sourceManifest},null,2))
const localCache:NonNullable<PlatformConfig["localCacheEngine"]>={
  getItem:async key=>{
    const known=await supplierOrientationCache.getItem(key)
    if(known!==null)return known
    const file=Bun.file(path.join(cacheDir,`${sha256(key)}.json`))
    if(!await file.exists())return null
    const item:{key:string;value:string}=await file.json()
    if(item.key!==key)throw new Error("Local routing cache key mismatch")
    return item.value
  },
  setItem:async(key,value)=>{
    await supplierOrientationCache.setItem(key,value)
    await Bun.write(path.join(cacheDir,`${sha256(key)}.json`),JSON.stringify({key,value}))
  },
}
const circuit=new Circuit({platform:{localCacheEngine:localCache}})
if(pcbOnly||sourcePreflightOnly||sourcePrecomputedOnly)circuit.schematicDisabled=true
const pcbPortCorrections=installSupplierPortAnchors(circuit)
const expectedCoreVersion="0.0.2124",expectedRouterVersion="0.0.967"
const routerPackage:{version:string}=await Bun.file("node_modules/@tscircuit/capacity-autorouter/package.json").json()
if(circuit.getCoreVersion()!==expectedCoreVersion)throw new Error(`Unexpected core ${circuit.getCoreVersion()}`)
if(routerPackage.version!==expectedRouterVersion)throw new Error(`Unexpected router ${routerPackage.version}`)
const runtimeFiles=["@tscircuit/core","@tscircuit/capacity-autorouter","circuit-json-to-connectivity-map"].flatMap(name=>
  [`node_modules/${name}/package.json`,`node_modules/${name}/dist/index.js`])
const captureRuntime=()=>Promise.all(runtimeFiles.map(async file=>({file,sha256:sha256(await Bun.file(file).bytes())})))
const runtimeManifest=await captureRuntime(),runtimeSha256=sha256(JSON.stringify(runtimeManifest))
const phaseReplays=resumeCheckpoint?loadPhaseCheckpoint({checkpointPath:path.resolve(resumeCheckpoint),sourceSha256,
  coreVersion:expectedCoreVersion,routerVersion:expectedRouterVersion,runtimeSha256}):[]
const replayedPhases:{phase:number|null;phaseStageIndex:number|undefined;checkpointSha256:string;inputSha256:string;pcbTracePathsSha256:string|undefined}[]=[]
// Persist each completed phase before the next synchronous native step starts.
// A watchdog termination must not leave buffered evidence from earlier phases.
const save=(name:string,value:unknown)=>{
  const file=path.join(debugDir,name),temp=`${file}.${runId}.tmp`
  writeFileSync(temp,JSON.stringify(value,null,2))
  renameSync(temp,file)
}
let sourceSolverStartCount=0,sourcePourSolverStartCount=0
const sourcePrecomputedRouting: {pathCount:number;pathsSha256:string;inputFile?:string;inputSha256?:string;
  plannedStageCount?:number;phaseStageCount?:number;outputFile?:string;outputSha256?:string;completed:boolean}|undefined=sourcePrecomputedOnly?{
  pathCount:groundPhase.props.pcbTracePaths.length,
  pathsSha256:sha256(JSON.stringify(groundPhase.props.pcbTracePaths,null,2)),completed:false}:undefined
if(sourcePreflightOnly||sourcePrecomputedOnly)circuit.on("solver:started",event=>{
  if(placementOnly&&sourcePrecomputedRouting?.completed&&event.solverName==="CopperPourPipelineSolver"){
    sourcePourSolverStartCount++
    return
  }
  sourceSolverStartCount++
  save("source-mode-unexpected-solver.json",{runId,sourceSha256,runtimeSha256,...event})
  throw new Error("Native solvers are prohibited in source-only capture")
})
let sourcePreflight:(ReturnType<typeof inspectSourcePreflight>&{circuitFile:string;circuitSha256:string;reportFile:string})|undefined
const sourcePreflightStop=new Error("Public source preflight capture completed before PCB routing or pours")
const captureSourcePreflight=()=>{
  if(sourcePreflight)return
  const snapshot=circuit.db.toArray()
  if(!snapshot.some(element=>element.type==="pcb_trace"))return
  const circuitFile="source-preflight.circuit.json",reportFile="source-preflight.json"
  sourcePreflight={...inspectSourcePreflight(snapshot),circuitFile,circuitSha256:sha256(JSON.stringify(snapshot,null,2)),reportFile}
  save(circuitFile,snapshot)
  save(reportFile,{runId,sourceSha256,runtimeSha256,...sourcePreflight,
    scope:sourcePrecomputedOnly?`Actual public source CJS before pours; qualified precomputed Ground0 ${sourcePrecomputedRouting?.completed?"inserted":"did not complete"}; no settled acceptance`
      :sourcePreflightOnly?"Actual public source CJS after manual PCB trace rendering and before pours; routing disabled, no settled or native acceptance"
      :"Actual public source CJS before PCB routing and pours; endpoint constraints only, no settled or native acceptance"})
  if(sourcePreflightOnly||sourcePreflight.violationCount)throw sourcePreflightStop
}
if(sourcePreflightOnly)circuit.on("renderable:renderLifecycle:PcbCopperPourRender:start",captureSourcePreflight)
else if(!placementOnly)circuit.on("renderable:renderLifecycle:PcbTraceRender:start",captureSourcePreflight)
let placementInitialCopper:{circuitFile:string;circuitSha256:string;receiptFile:string}|undefined
if(placementOnly)circuit.on("renderable:renderLifecycle:PcbCopperPourRender:start",()=>{
  if(placementInitialCopper)return
  const snapshot=circuit.db.toArray()
  if(!snapshot.some(element=>element.type==="pcb_trace"))return
  if(sourcePrecomputedRouting&&!sourcePrecomputedRouting.completed){
    save("source-mode-incomplete-ground.circuit.json",snapshot)
    throw new Error("Ground0 was not inserted; placement stopped before pours")
  }
  const circuitFile="placement-initial-source-copper.circuit.json",receiptFile="placement-initial-source-copper.json"
  placementInitialCopper={circuitFile,circuitSha256:sha256(JSON.stringify(snapshot,null,2)),receiptFile}
  save(circuitFile,snapshot)
  save(receiptFile,{runId,...placementInitialCopper,sourceSha256,runtimeSha256,
    sourcePrecomputedRouting,sourceSolverStartCount,sourcePourSolverStartCount,
    scope:"Public DB snapshot before copper-pour rendering, including any qualified precomputed Ground0; no settled plane or native routing acceptance",
    sourceUnchangedAtCapture:sourceManifest.every(({file,sha256:expected})=>sha256(readFileSync(file))===expected),
    runtimeUnchangedAtCapture:runtimeManifest.every(({file,sha256:expected})=>sha256(readFileSync(file))===expected)})
})
const supplyAudits:{solver:string;version:string;nativeSha256:string;correctedSha256:string;
  nativeFile:string;correctedFile:string;reportFile:string;corrections:SupplyRoutingEvidence["corrections"];
  originalFile?:string;originalSha256?:string;adaptedFile?:string;adaptedSha256?:string;
  terminalRepresentatives?:SupplyRoutingEvidence["terminalRepresentatives"];padRepresentatives?:SupplyRoutingEvidence["padRepresentatives"];sourceCopperSha256?:string;runtimeSha256?:string;error?:string}[]=[]
setSupplyRoutingAuditHook(evidence=>{
  const index=supplyAudits.length
  const nativeFile=`logic-supplies-${index}.native.simple-route.json`
  const correctedFile=`logic-supplies-${index}.corrected.simple-route.json`
  const reportFile=`logic-supplies-${index}.corrections.json`
  const originalFile=evidence.originalInput?`logic-supplies-${index}.original-input.simple-route.json`:undefined
  const adaptedFile=evidence.adaptedInput?`logic-supplies-${index}.adapted-input.simple-route.json`:undefined
  const report={solver:evidence.solver,version:evidence.version,
    nativeSha256:sha256(JSON.stringify(evidence.native,null,2)),
    correctedSha256:sha256(JSON.stringify(evidence.corrected,null,2)),
    nativeFile,correctedFile,reportFile,originalFile,adaptedFile,
    originalSha256:evidence.originalInput?sha256(JSON.stringify(evidence.originalInput,null,2)):undefined,
    adaptedSha256:evidence.adaptedInput?sha256(JSON.stringify(evidence.adaptedInput,null,2)):undefined,
    terminalRepresentatives:evidence.terminalRepresentatives,padRepresentatives:evidence.padRepresentatives,sourceCopperSha256:evidence.sourceCopperSha256,runtimeSha256:evidence.runtimeSha256,
    corrections:evidence.corrections,error:evidence.error}
  if(originalFile)save(originalFile,evidence.originalInput)
  if(adaptedFile)save(adaptedFile,evidence.adaptedInput)
  save(nativeFile,evidence.native)
  save(correctedFile,evidence.corrected)
  save(reportFile,report)
  supplyAudits.push(report)
})
let activePhase:{name:string;index:number|null|undefined;stage:number|undefined}|undefined
const guardedRoutingInputAudits:(Omit<GuardedRoutingInputEvidence,"originalInput"|"adaptedInput"|"fullBarrelInput"|"nativeInput">&{
  runId:string;phaseName:string;routingPhaseIndex:number;phaseStageIndex:number|undefined;
  originalFile:string;originalSha256:string;adaptedFile:string;adaptedSha256:string;fullBarrelFile:string;fullBarrelSha256:string;
  nativeInputFile?:string;nativeInputSha256?:string;
  reportFile:string;reportSha256:string;buildSourceSha256:string;buildRuntimeSha256:string
})[]=[]
setGuardedRoutingInputAuditHook(evidence=>{
  if(!activePhase||typeof activePhase.index!=="number"||activePhase.index<2||!activeInput)
    throw new Error("Guarded routing input lacks its active native phase identity")
  const phase=activePhase
  const hashJson=(value:unknown)=>sha256(JSON.stringify(value,null,2))
  const originalSha256=hashJson(evidence.originalInput)
  if(originalSha256!==activeInput.sha256||evidence.sourceCopperSha256!==sourceSha256||evidence.runtimeSha256!==runtimeSha256)
    throw new Error("Guarded routing input does not match the active phase/source/runtime")
  if(guardedRoutingInputAudits.some(audit=>audit.routingPhaseIndex===phase.index&&audit.phaseStageIndex===phase.stage))
    throw new Error("Guarded native phase emitted duplicate input evidence")
  const stem=`guarded-input-phase-${activePhase.index}-stage-${activePhase.stage??0}`
  const originalFile=`${stem}.original.simple-route.json`,adaptedFile=`${stem}.adapted.simple-route.json`,reportFile=`${stem}.guards.json`
  const fullBarrelFile=`${stem}.full-barrel.simple-route.json`
  const {originalInput,adaptedInput,fullBarrelInput,nativeInput,...declarations}=evidence
  if(evidence.sourceCompleted&&(nativeInput||evidence.routingRegion))throw new Error("Source-completed skip must not expose a regional/native input")
  if(!evidence.sourceCompleted&&!nativeInput)throw new Error("Native constructor input was not captured")
  const expectedSolver=phase6PolyRequested&&phase.index===6?guardedSolverNames.poly:guardedSolverNames.preloaded
  if(evidence.sourceCompleted?(evidence.solverConstructorName||evidence.solverPreprocessing):
    evidence.solverConstructorName!==expectedSolver||evidence.solverPreprocessing!==guardedSolverPreprocessing[expectedSolver]
      ||JSON.stringify(evidence.solverOptions)!==JSON.stringify(guardedNativeSolverOptions))
    throw new Error("Actual native constructor/options do not match the explicit whole-phase solver binding")
  if(phase6RegionRequested&&phase.index===6&&!evidence.sourceCompleted&&!evidence.routingRegion)
    throw new Error("Requested phase6 region was not exposed to its native constructor")
  if(evidence.routingRegion){
    const restriction=restrictRoutingBounds(adaptedInput,phase6RoutingRegion.bounds)
    const expectedRegion={...structuredClone(phase6RoutingRegion),
      internallyDiscardedObstacleIndices:expectedSolver===guardedSolverNames.poly?[]:restriction.internallyDiscarded.map(obstacle=>adaptedInput.obstacles.indexOf(obstacle)),
      minimumDiscardedObstacleGapMm:expectedSolver===guardedSolverNames.poly?null:restriction.minimumDiscardedObstacleGapMm,
      clearanceReach:restriction.clearanceReach,
      ...(expectedSolver===guardedSolverNames.poly?{retainedOutsideObstacleIndices:restriction.internallyDiscarded.map(obstacle=>adaptedInput.obstacles.indexOf(obstacle))}:{})}
    if(!phase6RegionRequested||phase.index!==phase6RoutingRegion.phaseIndex||phase.name!==phase6RoutingRegion.phaseName
      ||evidence.routingRegion.phaseIndex!==phase.index||evidence.routingRegion.phaseName!==phase.name
      ||JSON.stringify(evidence.routingRegion)!==JSON.stringify(expectedRegion)
      ||JSON.stringify(nativeInput)!==JSON.stringify(restriction.input))
      throw new Error("Actual regional native input lacks its exact phase6/full-input lineage")
  }else if(nativeInput&&JSON.stringify(nativeInput)!==JSON.stringify(adaptedInput))throw new Error("Unconfigured phase changed the native constructor input")
  const nativeInputFile=nativeInput?`${stem}.native-input.simple-route.json`:undefined
  if(!fullBarrelInput)throw new Error("Guarded native input lacks its authenticated full-barrel representation")
  const report={...declarations,runId,phaseName:activePhase.name,routingPhaseIndex:activePhase.index,phaseStageIndex:activePhase.stage,
    originalFile,originalSha256,adaptedFile,adaptedSha256:hashJson(adaptedInput),fullBarrelFile,fullBarrelSha256:hashJson(fullBarrelInput),reportFile,
    nativeInputFile,nativeInputSha256:nativeInput?hashJson(nativeInput):undefined,
    buildSourceSha256:sourceSha256,buildRuntimeSha256:runtimeSha256,
    scope:evidence.sourceCompleted?"Authenticated source-completed input; no native solver or new traces":"Native input captured before solver construction; no completed-route acceptance"}
  save(originalFile,originalInput);save(fullBarrelFile,fullBarrelInput);save(adaptedFile,adaptedInput)
  if(nativeInputFile)save(nativeInputFile,nativeInput)
  save(reportFile,report)
  guardedRoutingInputAudits.push({...report,reportSha256:hashJson(report)})
  writeCheckpoint()
})
const guardedLifecycleEvents:(GuardedRoutingLifecycleEvent&{routingPhaseIndex:number;phaseStageIndex:number|undefined;at:number})[]=[]
setGuardedRoutingLifecycleAuditHook(event=>{
  if(!activePhase||typeof activePhase.index!=="number"||!activeInput
    ||event.sourceCopperSha256!==sourceSha256||event.runtimeSha256!==runtimeSha256)
    throw new Error("Guarded lifecycle marker lacks its active phase/source/runtime")
  const previous=guardedLifecycleEvents.at(-1)
  guardedLifecycleEvents.push({...event,routingPhaseIndex:activePhase.index,phaseStageIndex:activePhase.stage,at:Date.now()})
  const stem=`guarded-lifecycle-phase-${activePhase.index}-stage-${activePhase.stage??0}`
  save(`${stem}.${event.kind}.json`,{runId,sourceSha256,runtimeSha256,inputSha256:activeInput.sha256,...guardedLifecycleEvents.at(-1)})
  save(`${stem}.events.json`,{runId,sourceSha256,runtimeSha256,accepted:false,scope:"Public solver lifecycle diagnostics only; no route acceptance",events:guardedLifecycleEvents})
  if(event.kind.endsWith("constructor")||event.solverPhase!==previous?.solverPhase)
    console.log(`  ${activePhase.name} ${event.kind}${event.solverPhase?` (${event.solverPhase})`:""}: ${(event.elapsedMs/1000).toFixed(1)}s`)
})
const guardedRoutingAudits:{phaseName:string;routingPhaseIndex:number|null|undefined;phaseStageIndex:number|undefined;
  solver:string;version:string;originalFile:string;originalSha256:string;adaptedFile:string;adaptedSha256:string;fullBarrelFile:string;fullBarrelSha256:string;
  nativeFile?:string;nativeSha256?:string;restoredFile?:string;restoredSha256?:string;
  nativeInputFile?:string;nativeInputSha256?:string;routingRegion?:GuardedRoutingEvidence["routingRegion"];
  reportFile:string;reportSha256:string;guards:GuardedRoutingEvidence["guards"];
  refinements:GuardedRoutingEvidence["refinements"];
  terminalRepresentatives?:GuardedRoutingEvidence["terminalRepresentatives"];busRepresentatives?:GuardedRoutingEvidence["busRepresentatives"];padRepresentatives?:GuardedRoutingEvidence["padRepresentatives"];sourceCopperSha256?:string;runtimeSha256?:string;
  currentBarrelCovers?:GuardedRoutingEvidence["currentBarrelCovers"];
  solverOptions:GuardedRoutingEvidence["solverOptions"];solverConstructorName?:GuardedRoutingEvidence["solverConstructorName"];solverPreprocessing?:GuardedRoutingEvidence["solverPreprocessing"];
  sourceCompleted?:GuardedRoutingEvidence["sourceCompleted"];
  obstacleCompaction?:GuardedRoutingEvidence["obstacleCompaction"];
  barrelObstacleContacts:GuardedRoutingEvidence["barrelObstacleContacts"];error?:string}[]=[]
setGuardedRoutingAuditHook(evidence=>{
  if(!activePhase)throw new Error("Guarded routing evidence lacks a native phase identity")
  if(evidence.sourceCompleted&&evidence.nativeOutput)throw new Error("Source-completed phase must not claim native output")
  const inputAudit=guardedRoutingInputAudits.find(audit=>audit.routingPhaseIndex===activePhase!.index&&audit.phaseStageIndex===activePhase!.stage)
  if(!inputAudit)throw new Error("Guarded completion lacks its authenticated raw/full-barrel/final input lineage")
  if(evidence.solverConstructorName!==inputAudit.solverConstructorName||evidence.solverPreprocessing!==inputAudit.solverPreprocessing
    ||JSON.stringify(evidence.solverOptions)!==JSON.stringify(inputAudit.solverOptions)
    ||sha256(JSON.stringify(evidence.originalInput,null,2))!==inputAudit.originalSha256
    ||sha256(JSON.stringify(evidence.adaptedInput,null,2))!==inputAudit.adaptedSha256
    ||(evidence.nativeInput?sha256(JSON.stringify(evidence.nativeInput,null,2)):undefined)!==inputAudit.nativeInputSha256)
    throw new Error("Guarded completion changed its audited native constructor input lineage")
  const stem=`guarded-${guardedRoutingAudits.length}-phase-${activePhase.index??"default"}-stage-${activePhase.stage??0}`
  const originalFile=`${stem}.original.simple-route.json`,adaptedFile=`${stem}.adapted.simple-route.json`
  const nativeFile=evidence.nativeOutput?`${stem}.native.simple-route.json`:undefined
  const restoredFile=evidence.restoredOutput?`${stem}.restored.simple-route.json`:undefined
  const reportFile=`${stem}.guards.json`
  const hashJson=(value:unknown)=>sha256(JSON.stringify(value,null,2))
  const report={phaseName:activePhase.name,routingPhaseIndex:activePhase.index,phaseStageIndex:activePhase.stage,
    solver:evidence.sourceCompleted?"AuthenticatedSourceCopper_NoNative":evidence.solverConstructorName!,version:expectedRouterVersion,
    originalFile,originalSha256:hashJson(evidence.originalInput),adaptedFile,adaptedSha256:hashJson(evidence.adaptedInput),
    fullBarrelFile:inputAudit.fullBarrelFile,fullBarrelSha256:inputAudit.fullBarrelSha256,
    nativeInputFile:inputAudit.nativeInputFile,nativeInputSha256:inputAudit.nativeInputSha256,routingRegion:evidence.routingRegion,
    nativeFile,nativeSha256:evidence.nativeOutput?hashJson(evidence.nativeOutput):undefined,
    restoredFile,restoredSha256:evidence.restoredOutput?hashJson(evidence.restoredOutput):undefined,
    reportFile,guards:evidence.guards,refinements:evidence.refinements,terminalRepresentatives:evidence.terminalRepresentatives,busRepresentatives:evidence.busRepresentatives,padRepresentatives:evidence.padRepresentatives,
    sourceCopperSha256:evidence.sourceCopperSha256,runtimeSha256:evidence.runtimeSha256,currentBarrelCovers:evidence.currentBarrelCovers,
    solverOptions:evidence.solverOptions,solverConstructorName:evidence.solverConstructorName,solverPreprocessing:evidence.solverPreprocessing,sourceCompleted:evidence.sourceCompleted,obstacleCompaction:evidence.obstacleCompaction,barrelObstacleContacts:evidence.barrelObstacleContacts,error:evidence.error}
  save(originalFile,evidence.originalInput);save(adaptedFile,evidence.adaptedInput)
  if(nativeFile)save(nativeFile,evidence.nativeOutput)
  if(restoredFile)save(restoredFile,evidence.restoredOutput)
  save(reportFile,report)
  guardedRoutingAudits.push({...report,reportSha256:hashJson(report)})
})
const key=(event:Pick<AutoroutingStartEvent,"routingPhaseIndex"|"phaseStageIndex">)=>`phase-${event.routingPhaseIndex??"default"}-stage-${event.phaseStageIndex??0}`
let timer:ReturnType<typeof setTimeout>|undefined
let activeStart=0,lastProgress=0
let lastSolverPhase:string|undefined
const phaseResults:{name:string;phase:number|null|undefined;phaseStageIndex:number|undefined;traceCount:number;elapsedMs:number;solver:string|undefined;
  inputFile:string;inputSha256:string;outputFile:string;outputSha256:string;
  pcbTracePathsFile?:string;pcbTracePathsSha256?:string;pcbTracePathsUnavailableReason?:string}[]=[]
const routingErrors:AutoroutingErrorEvent[]=[]
let activeInput:{file:string;sha256:string}|undefined
let autoroutingStartCount=0
let initialCopper:InitialCopper|undefined
let sourceCopperProof:(ReturnType<typeof setGuardedSourceCopperProof>&{circuitFile:string;circuitSha256:string;
  expectedEscapePlans:typeof sourceTerminalEscapePlans;expectedPadConnectionPlans:{name:string;net:string}[]})|undefined
const manualPreloadErrors:string[]=[]
const writeCheckpoint=()=>{
  const file=path.join(outputDir,"phase-checkpoint.json"),temp=`${file}.${runId}.tmp`
  writeFileSync(temp,JSON.stringify({runId,phaseTimeoutMs,accepted:false,routingComplete:false,
    scope:"Completed public phase SRJs only; no final circuit or DRC acceptance",
    sourceSha256,sourceManifest,coreVersion:circuit.getCoreVersion(),routerVersion:expectedRouterVersion,
    sourceUnchangedAtCheckpoint:sourceManifest.every(({file,sha256:expected})=>sha256(readFileSync(file))===expected),
    runtimeUnchangedAtCheckpoint:runtimeManifest.every(({file,sha256:expected})=>sha256(readFileSync(file))===expected),
    runtimeManifest,runtimeSha256,evidenceDirectory:path.relative(outputDir,debugDir),phaseResults,replayedPhases,
    sourceCopperProof,supplyAudits,guardedRoutingInputAudits,guardedRoutingAudits,routingErrors:routingErrors.map(({phaseName,error})=>({phaseName,message:error?.message})),
    resumeRule:"Require unchanged source and byte-identical live phase input before replay; never reuse a failed or incomplete phase"},null,2))
  renameSync(temp,file)
}
circuit.on("autorouting:start",(event:AutoroutingStartEvent)=>{
  autoroutingStartCount++
  if(sourcePrecomputedRouting){
    save(`source-mode-start-${autoroutingStartCount}.json`,{runId,sourceSha256,runtimeSha256,...event,simpleRouteJson:undefined})
    save(`source-mode-start-${autoroutingStartCount}.input.simple-route.json`,event.simpleRouteJson)
    if(sourcePrecomputedRouting.inputFile||event.routingPhaseIndex!==0||(event.phaseStageIndex??0)!==0
      ||event.phaseName!==groundPhase.props.name||event.autorouterName!=="precomputed"||event.phaseCount!==2||event.phaseStageCount!==2)
      throw new Error("Source capture permits exactly one qualified precomputed Ground0 stage")
    sourcePrecomputedRouting.plannedStageCount=event.phaseCount
    sourcePrecomputedRouting.phaseStageCount=event.phaseStageCount
  }else{
    if(sourcePreflightOnly)throw new Error("Source preflight mode unexpectedly attempted native routing")
    verifyPrefixRoutingEvent({event,throughPhase,routingPlan})
  }
  if(!initialCopper){
    initialCopper=captureInitialCopper(circuit.db.toArray())
    const circuitFile="initial-source-copper.circuit.json"
    sourceCopperProof={...setGuardedSourceCopperProof({circuitJson:initialCopper.circuitJson,sourceSha256,runtimeSha256}),
      circuitFile,circuitSha256:sha256(JSON.stringify(initialCopper.circuitJson,null,2)),
      expectedEscapePlans:sourceTerminalEscapePlans,
      expectedPadConnectionPlans:sourcePadConnectionPlans.map(({name,net})=>({name,net}))}
    const expectedEscapes=sourceTerminalEscapePlans.map(plan=>plan.name).sort()
    if(JSON.stringify(sourceCopperProof.escapes.map(escape=>escape.traceName).sort())!==JSON.stringify(expectedEscapes))
      throw new Error("Canonical source lacks its exact plan-derived authenticated off-pad escape handoffs")
    const expectedPadGroups=sourcePadConnectionPlans.map(plan=>plan.name).sort()
    if(JSON.stringify(sourceCopperProof.padGroups.map(group=>group.traceName).sort())!==JSON.stringify(expectedPadGroups))
      throw new Error("Canonical source lacks its exact plan-derived authenticated pad-connection groups")
    save(circuitFile,initialCopper.circuitJson)
    save("source-owned-copper-proof.json",sourceCopperProof)
  }
  if(sourcePrecomputedRouting){
    sourcePrecomputedRouting.inputFile=`${key(event)}.input.simple-route.json`
    sourcePrecomputedRouting.inputSha256=sha256(JSON.stringify(event.simpleRouteJson,null,2))
    save(sourcePrecomputedRouting.inputFile,event.simpleRouteJson)
    save(`${key(event)}.start.json`,{...event,simpleRouteJson:undefined})
    return
  }
  if(event.routingPhaseIndex!==undefined&&event.routingPhaseIndex!==null&&event.routingPhaseIndex>=2){
    manualPreloadErrors.push(...verifyManualPreloads({initialCopper,input:event.simpleRouteJson}))
    if(manualPreloadErrors.length)throw new Error(manualPreloadErrors.join("; "))
    const groundResult=phaseResults.find(result=>result.phase===0&&result.phaseStageIndex===0)
    if(!groundResult)throw new Error("Current full-barrel proof requires its completed public Ground0 stage")
    const snapshot=structuredClone(circuit.db.toArray())
    const circuitFile=`${key(event)}.current-source-copper.circuit.json`
    const circuitSha256=sha256(JSON.stringify(snapshot,null,2))
    save(circuitFile,snapshot)
    const completedGroundOutput:AutoroutingStartEvent["simpleRouteJson"]=JSON.parse(readFileSync(path.join(debugDir,groundResult.outputFile),"utf8"))
    if(sha256(JSON.stringify(completedGroundOutput,null,2))!==groundResult.outputSha256)
      throw new Error("Completed Ground0 bytes changed before current-barrel capture")
    if(!sourceGroundProofPath)throw new Error("--source-ground-proof must identify a fresh successful same-source public Ground capture")
    const materialization=loadSourceGroundMaterialization({receiptPath:sourceGroundProofPath,sourceSha256,runtimeSha256,
      pathsSha256:sha256(JSON.stringify(groundPhase.props.pcbTracePaths,null,2)),inputSha256:groundResult.inputSha256,outputSha256:groundResult.outputSha256})
    setGuardedCurrentBarrelProof({circuitJson:snapshot,initialCircuitJson:initialCopper.circuitJson,
      completedGroundOutput,originalInput:structuredClone(event.simpleRouteJson),sourceSha256,runtimeSha256,runId,
      materializedGroundCircuitJson:materialization.circuitJson,materializedInitialCircuitJson:materialization.initialCircuitJson})
    save(`${key(event)}.current-barrel-capture.json`,{runId,sourceSha256,runtimeSha256,circuitFile,circuitSha256,
      initialCircuitSha256:sourceCopperProof?.circuitSha256,groundOutputFile:groundResult.outputFile,groundOutputSha256:groundResult.outputSha256,
      originalInputSha256:sha256(JSON.stringify(event.simpleRouteJson,null,2)),
      materialization:materialization.provenance,
      sourceUnchangedAtCapture:sourceManifest.every(({file,sha256:expected})=>sha256(readFileSync(file))===expected),
      runtimeUnchangedAtCapture:runtimeManifest.every(({file,sha256:expected})=>sha256(readFileSync(file))===expected),
      scope:"Live public DB before this guarded phase algorithm construction plus a separately authenticated same-source Ground materialization; no merged DB, new native output or pour credit"})
  }
  const replay=phaseReplays.find(phase=>phase.phase===event.routingPhaseIndex)
  if(replay){
    verifyLivePhaseReplay({event,replay})
    replayedPhases.push({phase:replay.phase,phaseStageIndex:replay.phaseStageIndex,checkpointSha256:replay.checkpointSha256,
      inputSha256:replay.inputSha256,pcbTracePathsSha256:replay.pcbTracePathsSha256})
  }
  if(timer)clearTimeout(timer)
  activeStart=Date.now();lastProgress=0;lastSolverPhase=undefined
  writeHeartbeat(event.phaseName??"remaining",event)
  activePhase={name:event.phaseName??"remaining",index:event.routingPhaseIndex,stage:event.phaseStageIndex}
  console.log(`Routing ${event.phaseOrdinal}/${event.phaseCount} ${event.phaseName??"remaining"}: ${event.connectionCount} connections, ${event.previousTraceCount} prior traces; ${event.solverName??event.autorouterName}`)
  activeInput={file:`${key(event)}.input.simple-route.json`,sha256:sha256(JSON.stringify(event.simpleRouteJson,null,2))}
  save(activeInput.file,event.simpleRouteJson)
  save(`${key(event)}.start.json`,{...event,simpleRouteJson:undefined})
  timer=setTimeout(()=>{
    save(`${key(event)}.timeout.json`,{phase:event.phaseName,timeoutMs:phaseTimeoutMs,inputSha256:sha256(JSON.stringify(event.simpleRouteJson))})
    console.error(`Routing phase exceeded ${phaseTimeoutMs/1000}s: ${event.phaseName}`)
    process.exit(1)
  },phaseTimeoutMs)
})
circuit.on("autorouting:progress",(event:AutoroutingProgressEvent)=>{
  if(sourcePrecomputedRouting)return
  const solverPhase="solverPhase" in event&&typeof event.solverPhase==="string"?event.solverPhase:undefined
  if(Date.now()-lastProgress<10000&&solverPhase===lastSolverPhase)return
  lastProgress=Date.now()
  lastSolverPhase=solverPhase
  save(`${key(event)}.progress.json`,{runId,sourceSha256,runtimeSha256,phaseName:event.phaseName,
    routingPhaseIndex:event.routingPhaseIndex,phaseStageIndex:event.phaseStageIndex,solverPhase,
    progress:event.progress,elapsedMs:Date.now()-activeStart})
  console.log(`  ${event.phaseName}${solverPhase?` (${solverPhase})`:""}: ${(event.progress*100).toFixed(0)}%, elapsed ${((Date.now()-activeStart)/1000).toFixed(1)}s`)
})
circuit.on("autorouting:end",(event:AutoroutingEndEvent)=>{
  if(sourcePrecomputedRouting){
    if(!sourcePrecomputedRouting.inputFile||sourcePrecomputedRouting.completed||event.routingPhaseIndex!==0||(event.phaseStageIndex??0)!==0
      ||event.phaseName!==groundPhase.props.name||event.autorouterName!=="precomputed"||event.phaseCount!==2||event.phaseStageCount!==2)
      throw new Error("Source capture completed an unexpected precomputed stage")
    sourcePrecomputedRouting.outputFile=`${key(event)}.output.simple-route.json`
    sourcePrecomputedRouting.outputSha256=sha256(JSON.stringify(event.simpleRouteJson,null,2))
    sourcePrecomputedRouting.completed=true
    save(sourcePrecomputedRouting.outputFile,event.simpleRouteJson)
    save(`${key(event)}.end.json`,{...event,simpleRouteJson:undefined})
    return
  }
  if(timer)clearTimeout(timer)
  writeHeartbeat("BETWEEN_PHASES")
  save(`${key(event)}.output.simple-route.json`,event.simpleRouteJson)
  save(`${key(event)}.end.json`,{...event,simpleRouteJson:undefined})
  if(!activeInput)throw new Error("Completed routing phase lacks its captured live input")
  const pcbTracePathsFile=event.pcbTracePaths?`${key(event)}.pcb-trace-paths.json`:undefined
  if(pcbTracePathsFile)save(pcbTracePathsFile,event.pcbTracePaths)
  phaseResults.push({name:event.phaseName??"remaining",phase:event.routingPhaseIndex,phaseStageIndex:event.phaseStageIndex,
    traceCount:event.simpleRouteJson.traces?.length??0,elapsedMs:Date.now()-activeStart,solver:event.solverName,
    inputFile:activeInput.file,inputSha256:activeInput.sha256,
    outputFile:`${key(event)}.output.simple-route.json`,outputSha256:sha256(JSON.stringify(event.simpleRouteJson,null,2)),
    pcbTracePathsFile,pcbTracePathsSha256:event.pcbTracePaths?sha256(JSON.stringify(event.pcbTracePaths,null,2)):undefined,
    pcbTracePathsUnavailableReason:event.pcbTracePathsUnavailableReason})
  writeCheckpoint()
  console.log(`  Completed ${event.phaseName}: ${event.simpleRouteJson.traces?.length??0} event traces in ${((Date.now()-activeStart)/1000).toFixed(1)}s`)
})
circuit.on("autorouting:error",(event:AutoroutingErrorEvent)=>{
  if(timer)clearTimeout(timer)
  writeHeartbeat("ROUTING_FAILED")
  routingErrors.push(event)
  save(`${key(event)}.error.json`,event)
  writeCheckpoint()
  console.error(`Routing failed ${event.phaseName}: ${event.error?.message}`)
})
const board=Board()
const prefixThrough=sourcePrecomputedOnly?0:throughPhase
const selectedGround=selectPrefixPhases({node:groundPhase,throughPhase:prefixThrough,phaseReplays})
const selectedBus=selectPrefixPhases({node:BusRouting(),throughPhase:prefixThrough,phaseReplays})
const selectedSignals=selectPrefixPhases({node:PhasedSignalRouting(),throughPhase:prefixThrough,phaseReplays})
const regionalBinding=phase6RegionRequested?bindPhase6RoutingRegion({node:selectedSignals,
  algorithmFn:(phase6PolyRequested?createGuardedNativePolyRegionalRouter:createGuardedNativeRegionalRouter)(phase6RoutingRegion)}):undefined
const builtSignals=regionalBinding?.node??selectedSignals
const routingPlan=declaredRoutingPlan([selectedGround,selectedBus,builtSignals])
if(regionalBinding)save("phase6-region-configuration.json",{runId,sourceSha256,runtimeSha256,
  boundCount:regionalBinding.boundCount,scope:regionalBinding.scope,phase6PolyRequested,
  selectedConstructor:phase6PolyRequested?guardedSolverNames.poly:guardedSolverNames.preloaded,productionTrialOnly:true,accepted:false})
save("declared-routing-plan.json",{runId,sourceSha256,runtimeSha256,prefixThrough,...routingPlan})
const buildBoard=(placementOnly||sourcePreflightOnly)&&!sourcePrecomputedOnly?cloneElement(board,{routingDisabled:true})
  :prefixThrough===undefined&&!phaseReplays.length&&!phase6RegionRequested?board:cloneElement(board,{routeRemaining:prefixThrough===undefined?board.props.routeRemaining:false,
    children:Children.toArray(board.props.children).flatMap(child=>
      isValidElement(child)&&child.type===PhasedSignalRouting
        ?[builtSignals]
        :isValidElement(child)&&child.type===GroundPlaneFanout?[selectedGround]
        :isValidElement(child)&&child.type===BusRouting?[selectedBus]:[child])})
circuit.add(buildBoard)
let exception:string|undefined,exceptionStack:string|undefined
try{await circuit.renderUntilSettled()}catch(error){
  if(sourcePreflightOnly&&error===sourcePreflightStop&&sourcePreflight){
    const snapshot=circuit.db.toArray(),anchors=verifySupplierPortAnchors({circuitJson:snapshot,corrections:pcbPortCorrections})
    const sourceUnchanged=JSON.stringify(sourceManifest)===JSON.stringify(await captureSource())
    const runtimeUnchanged=JSON.stringify(runtimeManifest)===JSON.stringify(await captureRuntime())
    const storedErrors=snapshot.filter(element=>element.type.endsWith("_error"))
    const strictSourceCopperMetadata=initialCopper?verifyPreservedManualCopper({initialCopper,circuitJson:snapshot}):undefined
    const preservedManualCopper=initialCopper?verifyPreservedManualCopper({initialCopper,circuitJson:snapshot,
      publicSourceMaterialization:sourcePrecomputedRouting?.completed===true}):undefined
    const ready=sourcePreflight.violationCount===0&&sourceUnchanged&&runtimeUnchanged&&anchors.pass&&anchors.expectedCorrectionCount===4&&storedErrors.length===0
      &&sourceSolverStartCount===0&&(!sourcePrecomputedRouting||sourcePrecomputedRouting.completed)&&preservedManualCopper?.pass!==false
    save("source-preflight-receipt.json",{runId,accepted:false,preflightReady:ready,sourcePreflightOnly:true,pcbOnly,schematicDisabled:circuit.schematicDisabled,autoroutingStartCount,
      sourcePrecomputedRouting,sourceSolverStartCount,sourcePourSolverStartCount,sourceCopperProof,preservedManualCopper,strictSourceCopperMetadata,
      scope:sourcePrecomputedOnly?`Source endpoint screening before pours; qualified precomputed Ground0 ${sourcePrecomputedRouting?.completed?"inserted":"did not complete"}; schematic disabled, zero native solvers; settled geometry remains required`
        :"Source endpoint screening only; schematic disabled, routing disabled, stopped before pours; fresh native and settled geometry gates remain required",
      sourceSha256,sourceManifest,runtimeSha256,runtimeManifest,sourceUnchanged,runtimeUnchanged,
      coreVersion:circuit.getCoreVersion(),routerVersion:expectedRouterVersion,sourcePreflight,anchors,errors:storedErrors,
      traceCount:snapshot.filter(element=>element.type==="pcb_trace").length,
      viaCount:snapshot.filter(element=>element.type==="pcb_via").length,
      pourCount:snapshot.filter(element=>element.type==="pcb_copper_pour").length})
    writeHeartbeat("SOURCE_PREFLIGHT_COMPLETE")
    console.log(`Source preflight: ${sourcePreflight.violationCount} endpoint violations; source/runtime unchanged ${sourceUnchanged}/${runtimeUnchanged}; four authentic anchors ${anchors.pass&&anchors.expectedCorrectionCount===4}`)
    process.exit(ready?0:1)
  }
  exception=String(error);exceptionStack=error instanceof Error?error.stack:undefined
}
if(timer)clearTimeout(timer)
writeHeartbeat("SAVING_ARTIFACTS")
// getCircuitJson may start another render after a synchronous lifecycle stop.
// Preserve the failed public snapshot without restarting routing or pours.
const json=exception?circuit.db.toArray():circuit.getCircuitJson(),text=JSON.stringify(json,null,2)
const portAnchorReview=verifySupplierPortAnchors({circuitJson:json,corrections:pcbPortCorrections})
if(portAnchorReview.expectedCorrectionCount!==4)portAnchorReview.errors.push("Canonical board requires exactly four authentic eFuse corner-port anchors")
const errors=json.filter(element=>element.type.endsWith("_error"))
const sourceUnchanged=JSON.stringify(sourceManifest)===JSON.stringify(await captureSource())
const runtimeUnchanged=JSON.stringify(runtimeManifest)===JSON.stringify(await captureRuntime())
const strictSourceCopperMetadata=initialCopper?verifyPreservedManualCopper({initialCopper,circuitJson:json}):undefined
const preservedManualCopper=initialCopper?verifyPreservedManualCopper({initialCopper,circuitJson:json,
  publicSourceMaterialization:Array.isArray(groundPhase.props.pcbTracePaths)
    &&(sourcePrecomputedRouting?.completed===true||phaseResults.some(phase=>phase.phase===0))}):undefined
const initialCopperSnapshot=initialCopper
const settledCopperInventory=initialCopperSnapshot?{
  autoroutingStarted:true,
  scope:"Observed physical records after public rendering settles; solver events and record counts do not establish phase or continuity acceptance",
  initialCircuitSha256:sourceCopperProof?.circuitSha256,finalCircuitSha256:sha256(text),
  initialTraceCount:initialCopperSnapshot.traces.length,initialViaCount:initialCopperSnapshot.vias.length,
  finalTraceCount:json.filter(element=>element.type==="pcb_trace").length,
  finalViaCount:json.filter(element=>element.type==="pcb_via").length,
  addedTraceIds:json.filter(element=>element.type==="pcb_trace")
    .filter(trace=>!initialCopperSnapshot.traces.some(prior=>prior.pcb_trace_id===trace.pcb_trace_id)).map(trace=>trace.pcb_trace_id),
  addedViaIds:json.filter(element=>element.type==="pcb_via")
    .filter(via=>!initialCopperSnapshot.vias.some(prior=>prior.pcb_via_id===via.pcb_via_id)).map(via=>via.pcb_via_id),
}:{
  autoroutingStarted:false,
  scope:"No autorouting:start event was emitted; final settled records are not evidence of inserted native routes",
  finalCircuitSha256:sha256(text),
  finalTraceCount:json.filter(element=>element.type==="pcb_trace").length,
  finalViaCount:json.filter(element=>element.type==="pcb_via").length,
}
const guardedAuditErrors=phaseResults.filter(phase=>phase.phase!==null&&phase.phase!==undefined&&phase.phase>=2)
  .flatMap(phase=>{
    const matching=guardedRoutingAudits.filter(audit=>audit.routingPhaseIndex===phase.phase
      &&(audit.phaseStageIndex??0)===(phase.phaseStageIndex??0))
    const audit=matching[0],sourceCompleted=audit?.sourceCompleted
    return matching.length===1&&audit&&!audit.error&&audit.restoredFile&&(sourceCompleted
      ?sourceCompleted.reason==="authenticated-source-copper"&&sourceCompleted.nativeSolverConstructed===false&&sourceCompleted.newTraceCount===0
        &&!audit.nativeFile&&audit.restoredSha256===audit.originalSha256
      :audit.nativeFile&&audit.barrelObstacleContacts?.length===0)
      ?[]:[`Completed phase ${phase.name} lacks exactly one successful guarded-copper audit`]
  })
await Bun.write(path.join(outputDir,"circuit.json"),text)
await Bun.write(path.join(outputDir,"build-manifest.json"),JSON.stringify({runId,coreVersion:circuit.getCoreVersion(),routerVersion:expectedRouterVersion,bunVersion:Bun.version,phaseTimeoutMs,placementOnly,pcbOnly,schematicDisabled:circuit.schematicDisabled,throughPhase,sourceSha256,circuitSha256:sha256(text),sourceUnchanged,sourceManifest,runtimeUnchanged,runtimeSha256,runtimeManifest,pcbPortCorrections,portAnchorErrors:portAnchorReview.errors,placementInitialCopper,sourcePreflight,sourcePrecomputedRouting,sourceSolverStartCount,sourcePourSolverStartCount,phaseResults,replayedPhases,sourceCopperProof,supplyAudits,guardedRoutingInputAudits,guardedRoutingAudits,guardedAuditErrors,manualPreloadErrors,preservedManualCopper,strictSourceCopperMetadata,settledCopperInventory,routingErrors:routingErrors.map(({phaseName,error})=>({phaseName,error,message:error?.message})),errorCount:errors.length,errors,exception,exceptionStack},null,2))
if(errors.length||routingErrors.length||exception||!sourceUnchanged||!runtimeUnchanged||guardedAuditErrors.length||portAnchorReview.errors.length||manualPreloadErrors.length||preservedManualCopper?.errors.length||sourceSolverStartCount||(sourcePrecomputedRouting&&!sourcePrecomputedRouting.completed)){
  console.error(JSON.stringify({errorCount:errors.length,routingErrorCount:routingErrors.length,exception,sourceUnchanged,runtimeUnchanged,guardedAuditErrors,portAnchorErrors:portAnchorReview.errors,manualPreloadErrors,preservedManualCopper},null,2))
  process.exitCode=1
}else{
  if(!placementOnly){
    await Bun.write(path.join(outputDir,"pcb.svg"),convertCircuitJsonToPcbSvg(json))
    await Bun.write(path.join(outputDir,"schematics-all.svg"),convertCircuitJsonToStackedSchematicSheetsSvg(json))
  }
  console.log(`Core ${circuit.getCoreVersion()} generated ${json.filter(e=>e.type==="pcb_trace").length} physical traces and ${json.filter(e=>e.type==="pcb_via").length} vias; ${placementOnly?"placement-only":"native routing"} checks have no stored errors`)
}
