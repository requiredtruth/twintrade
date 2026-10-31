// Run the actual connection handlers with deterministic socket/timer doubles.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('app/src/main/assets/app.js','utf8');
function fixture(){
  const timers=[],sockets=[];let fail=false,snapshots=0;
  const env={setTimeout(f,ms){timers.push({f,ms});},WebSocket:class{
    constructor(){if(fail)throw Error('blocked');sockets.push(this);}
    close(){this.onclose?.();}
  },loadPublicSnapshot(){snapshots++;},tradeFeedStatus(){},applyBackendChange(){},pushGlobalLive(){},queuePublicReload(){},discoverAssets(){},$:()=>({}),JSON,Math};
  vm.createContext(env);
  vm.runInContext('let publicBackendGeneration=0,publicSocket=null,publicRetry=0,rxBytes=0,rxWindow=0,publicVars=null,publicRefreshTimer=0;let netSockets={},netSocketGenerations={};',env);
  for(const name of ['setupPublicBackend','connectNetLive'])vm.runInContext(source.split('\n').find(l=>l.startsWith('function '+name+'(')),env);
  return {env,timers,sockets,run:s=>vm.runInContext(s,env),fail:v=>fail=v,snapshots:()=>snapshots};
}
for(const name of ['POLYGON','ARBITRUM','BASE']){
  const f=fixture(),connect=name==='POLYGON'?'setupPublicBackend()':`connectNetLive({name:'${name}',host:'fixture.invalid'})`;
  f.run(connect);const first=f.sockets[0];first.onclose();const retry=f.timers.at(-1).f;
  f.run(connect);const current=f.sockets.at(-1),count=f.sockets.length;
  // Even synchronous close callbacks from replacing a socket must be obsolete.
  retry();assert.equal(f.sockets.length,count,name+' old retry replaced a healthy socket');
  first.onclose();assert.equal(f.sockets.at(-1),current);
  if(name==='POLYGON'){
    const before=f.run('[publicRetry,rxBytes,rxWindow].join()');
    first.onmessage({data:'{"name":"currentBlock","value":1}'});
    assert.equal(f.run('[publicRetry,rxBytes,rxWindow].join()'),before,'obsolete messages changed feed counters');
  }
  current.onclose();const activeRetry=f.timers.at(-1).f;activeRetry();
  assert.equal(f.sockets.length,count+1,name+' active close did not reconnect');
  activeRetry();assert.equal(f.sockets.length,count+1,name+' repeated retry spawned another socket');
  // Constructor failures also own a generation: their retry cannot outlive recovery.
  f.fail(true);f.run(connect);const failedRetry=f.timers.at(-1).f;
  f.fail(false);f.run(connect);const recovered=f.sockets.length;
  failedRetry();assert.equal(f.sockets.length,recovered,name+' failed-constructor retry displaced recovery');
}
// Retry generations are independent across networks.
const f=fixture();f.run("connectNetLive({name:'ARBITRUM',host:'fixture.invalid'})");f.sockets[0].onclose();
const retry=f.timers.at(-1).f;f.run("connectNetLive({name:'BASE',host:'fixture.invalid'})");retry();
assert.equal(f.sockets.length,3);
console.log('Socket reconnect ownership: Polygon/Arbitrum/Base races pass');
