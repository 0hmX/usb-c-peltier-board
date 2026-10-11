import path from "node:path"
import {randomUUID,createHash} from "node:crypto"
import {mkdirSync} from "node:fs"

type Heartbeat={runId:string;state:string;startedAt:number;routingPhaseIndex?:number|null;phaseStageIndex?:number}
export function parsePhaseTimeoutMs(value:string|undefined){
  const seconds=value===undefined?360:Number(value)
  if(!Number.isInteger(seconds)||seconds<=0||seconds*1000>2147483647)
    throw new Error("--phase-timeout-seconds requires a positive finite integer within the timer range")
  return seconds*1000
}

// The supervisor is a separate OS process: synchronous native solver work in
// the child cannot prevent this deadline from firing.
export async function superviseBuild({command,outputDir,debugDir,timeoutMs=360000}:{
  command:string[];outputDir:string;debugDir:string;timeoutMs?:number
}){
  const runId=randomUUID(),startedAt=Date.now()
  const child=Bun.spawn(command,{env:{...process.env,TEC_BUILD_RUN_ID:runId},stdout:"inherit",stderr:"inherit"})
  let finished=false,timeout:Heartbeat|undefined
  const completion=child.exited.then(code=>{finished=true;return code})
  const terminate=async()=>{
    child.kill("SIGTERM")
    let deadline:ReturnType<typeof setTimeout>|undefined
    try{
      if(await Promise.race([completion,new Promise<null>(resolve=>{
        deadline=setTimeout(()=>resolve(null),5000)
      })])===null)child.kill("SIGKILL")
    }finally{if(deadline)clearTimeout(deadline)}
  }
  const readHeartbeat=async()=>{
    const file=Bun.file(path.join(outputDir,"routing-heartbeat.json"))
    if(!await file.exists())return null
    const value:Heartbeat=await file.json()
    if(value.runId!==runId)return null
    if(typeof value.state!=="string"||!Number.isFinite(value.startedAt)||value.startedAt> Date.now()+1000)
      throw new Error("Invalid native build heartbeat")
    return value
  }
  try{
    while(!finished){
      const heartbeat=await readHeartbeat()??{runId,state:"INITIAL_RENDER",startedAt}
      if(Date.now()-heartbeat.startedAt>=timeoutMs){
        const latest=await readHeartbeat()
        if(latest&&(latest.state!==heartbeat.state||latest.startedAt!==heartbeat.startedAt))continue
        if(finished)break
        timeout=heartbeat
        console.error(`External watchdog exceeded ${timeoutMs/1000}s: ${heartbeat.state}`)
        await terminate()
        break
      }
      await Bun.sleep(250)
    }
  }catch(error){
    if(!finished)await terminate()
    await completion
    throw error
  }
  const exitCode=await completion
  mkdirSync(outputDir,{recursive:true})
  await Bun.write(path.join(outputDir,"supervision-receipt.json"),JSON.stringify({runId,
    childPid:child.pid,childExitCode:exitCode,elapsedMs:Date.now()-startedAt,timeoutMs,
    independentWatchdog:true,timedOut:timeout!==undefined,accepted:false,
    scope:"Process termination receipt only; circuit/native/physical gates determine acceptance"},null,2))
  if(timeout){
    mkdirSync(debugDir,{recursive:true})
    const sourceFile=Bun.file(path.join(outputDir,"source-identity.json"))
    const sourceIdentitySha256=await sourceFile.exists()
      ?createHash("sha256").update(await sourceFile.bytes()).digest("hex"):undefined
    await Bun.write(path.join(debugDir,`phase-${timeout.routingPhaseIndex??"initial"}-stage-${timeout.phaseStageIndex??0}.external-timeout.json`),
      JSON.stringify({status:"failed_performance_timeout",accepted:false,runId,heartbeat:timeout,
        timeoutMs,elapsedMs:Date.now()-timeout.startedAt,childPid:child.pid,childExitCode:exitCode,
        termination:"SIGTERM_with_SIGKILL_fallback",sourceIdentitySha256},null,2))
    return 1
  }
  return exitCode
}

if(import.meta.main){
  const option=(name:string,fallback:string)=>{
    const index=process.argv.indexOf(name)
    return index<0?fallback:process.argv[index+1]??fallback
  }
  process.exitCode=await superviseBuild({command:[process.execPath,"run","scripts/build-local.ts",...process.argv.slice(2)],
    outputDir:path.resolve(option("--output-dir","dist/index")),debugDir:path.resolve(option("--debug-dir","dist/autorouter-debug-local")),
    timeoutMs:parsePhaseTimeoutMs(process.argv.includes("--phase-timeout-seconds")?option("--phase-timeout-seconds",""):undefined)})
}
