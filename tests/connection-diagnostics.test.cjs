// Exercise the actual optional connection-diagnostics state and bounded log.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('app/src/main/assets/app.js','utf8');
const lines=source.split('\n');
const env={Date,Math,Object,connectionRows:{innerHTML:''},connectionLog:{textContent:''}};
env.$=id=>id==='connectionDiagnostics'?{closest:()=>null}:env[id];
vm.createContext(env);
vm.runInContext(lines.find(l=>l.startsWith('const connectionStreams=')),env);
for(const name of ['connectionAge','renderConnectionDiagnostics','noteConnection','touchConnection']){
  vm.runInContext(lines.find(l=>l.startsWith('function '+name+'(')),env);
}
// Generate more state transitions than the retained-history cap.
for(let i=0;i<40;i++)vm.runInContext(`noteConnection('PRICE',${i%2?"'retry'":"'connecting'"},'event ${i}',2500)`,env);
assert.equal(vm.runInContext('connectionEvents.length',env),32,'reconnect history must remain bounded');
assert.match(env.connectionRows.innerHTML,/Price oracle/);
assert.match(env.connectionRows.innerHTML,/retry in/);
vm.runInContext("touchConnection('PRICE')",env);
assert.equal(vm.runInContext("connectionStreams.PRICE.state",env),'live');
assert.equal(vm.runInContext("connectionStreams.PRICE.retries",env),0);
assert.match(env.connectionLog.textContent,/valid data/);
assert.equal(vm.runInContext("connectionAge(Date.now()-65000)",env),'1m ago');
console.log('Connection diagnostics: per-stream state, valid-data recovery and bounded log pass');
