import path from "node:path"
import {readFileSync} from "node:fs"
import {createHash} from "node:crypto"
import type {CircuitJson} from "circuit-json"

export function loadSourceGroundMaterialization({receiptPath,sourceSha256,runtimeSha256,pathsSha256,inputSha256,outputSha256}:{
  receiptPath:string;sourceSha256:string;runtimeSha256:string;pathsSha256:string;inputSha256:string;outputSha256:string
}){
  const receiptFile=path.resolve(receiptPath),directory=path.dirname(receiptFile)
  const receiptBytes=readFileSync(receiptFile),receipt=JSON.parse(receiptBytes.toString())
  const hash=(bytes:string|Uint8Array)=>createHash("sha256").update(bytes).digest("hex")
  const ground=receipt.sourcePrecomputedRouting
  if(receipt.preflightReady!==true||receipt.sourcePreflightOnly!==true||receipt.sourceUnchanged!==true||receipt.runtimeUnchanged!==true
    ||receipt.sourceSha256!==sourceSha256||receipt.runtimeSha256!==runtimeSha256
    ||hash(JSON.stringify(receipt.sourceManifest))!==sourceSha256||hash(JSON.stringify(receipt.runtimeManifest))!==runtimeSha256
    ||receipt.sourceSolverStartCount!==0||receipt.sourcePourSolverStartCount!==0||receipt.autoroutingStartCount!==1
    ||receipt.preservedManualCopper?.pass!==true||receipt.sourcePreflight?.violationCount!==0
    ||!Array.isArray(receipt.errors)||receipt.errors.length||receipt.pourCount!==0
    ||ground?.completed!==true||ground.pathCount!==90||ground.plannedStageCount!==2||ground.phaseStageCount!==2
    ||ground.pathsSha256!==pathsSha256||ground.inputSha256!==inputSha256||ground.outputSha256!==outputSha256
    ||ground.inputFile!=="phase-0-stage-0.input.simple-route.json"||ground.outputFile!=="phase-0-stage-0.output.simple-route.json"
    ||receipt.sourcePreflight.circuitFile!=="source-preflight.circuit.json"||receipt.sourceCopperProof?.circuitFile!=="initial-source-copper.circuit.json"
    ||receipt.sourceCopperProof.sourceSha256!==sourceSha256||receipt.sourceCopperProof.runtimeSha256!==runtimeSha256)
    throw new Error("Ground materialization proof is incomplete or differs from the live source/runtime/public paths")
  const readBound=(file:string,expected:string)=>{
    const bytes=readFileSync(path.join(directory,file))
    if(hash(bytes)!==expected)throw new Error(`Ground materialization proof bytes changed: ${file}`)
    return JSON.parse(bytes.toString())
  }
  const circuitJson:CircuitJson=readBound(receipt.sourcePreflight.circuitFile,receipt.sourcePreflight.circuitSha256)
  const initialCircuitJson:CircuitJson=readBound(receipt.sourceCopperProof.circuitFile,receipt.sourceCopperProof.circuitSha256)
  readBound(ground.inputFile,inputSha256);readBound(ground.outputFile,outputSha256)
  const count=(circuit:CircuitJson,type:string)=>circuit.filter(element=>element.type===type).length
  if(count(circuitJson,"pcb_trace")!==receipt.traceCount||count(circuitJson,"pcb_via")!==receipt.viaCount
    ||count(circuitJson,"pcb_trace")!==count(initialCircuitJson,"pcb_trace")+90
    ||count(circuitJson,"pcb_via")!==count(initialCircuitJson,"pcb_via")+90||count(circuitJson,"pcb_copper_pour"))
    throw new Error("Ground materialization proof does not contain its genuine complete public copper delta")
  return {circuitJson,initialCircuitJson,provenance:{receiptFile,receiptSha256:hash(receiptBytes),runId:receipt.runId,
    sourceSha256,runtimeSha256,pathsSha256,inputSha256,outputSha256,
    circuitSha256:receipt.sourcePreflight.circuitSha256,initialCircuitSha256:receipt.sourceCopperProof.circuitSha256,
    scope:"Separate successful public same-source Ground materialization; never merged into the live routing DB"}}
}
