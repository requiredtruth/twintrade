const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const stored={},nodes={},texts=[],strokes=[],events={};
const ctx=new Proxy({fillText:s=>texts.push(s),moveTo:(x,y)=>strokes.push({x,y}),measureText:s=>({width:s.length*5})},{get:(o,k)=>o[k]||(()=>{})});
const node=id=>nodes[id]??={value:({amount:'10',lev:'100'})[id]||'',checked:true,hidden:true,textContent:'',innerHTML:'',getBoundingClientRect:()=>({width:393,height:400}),getContext:()=>ctx,addEventListener(){},setAttribute(){}};
function boot(){const env={console,document:{hidden:false,getElementById:node,querySelector:()=>node('dismiss'),querySelectorAll:()=>[],addEventListener:(e,f)=>events[e]=f},localStorage:{getItem:k=>stored[k]||null,setItem:(k,v)=>stored[k]=v},setTimeout:()=>0,clearTimeout(){},setInterval(){},devicePixelRatio:1,confirm:()=>false,addEventListener(){},WebSocket:class{constructor(){this.readyState=1}close(){this.readyState=3}},ethers:{providers:{JsonRpcProvider:class{}},Contract:class{}},AbortController,fetch:async()=>{throw Error('offline')},GABI:[]};env.window=env;vm.createContext(env);for(const f of ['config.js','engine.js','trade-state.js','app.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../app/src/main/assets',f),'utf8'),env);return {env,run:c=>vm.runInContext(c,env)}}
(async()=>{const {run,env}=boot();await new Promise(r=>setImmediate(r));
let created=0,resumes=0,started=0,reject=false;
env.AudioContext=class {constructor(){created++;this.state='suspended';this.currentTime=0;this.destination={}}resume(){resumes++;if(reject)return Promise.reject(Error('interrupted'));this.state='running';return Promise.resolve()}createOscillator(){return {frequency:{value:0},connect(){},start(){started++},stop(){}}}createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}}}};
run('ensureAudio()');assert.equal(created,1);assert.equal(run('audioCtx.state'),'running');
run("audioCtx.state='interrupted';onAppResume()");assert.equal(run('audioCtx.state'),'running');assert.equal(resumes,2);
run("audioCtx.state='closed';ensureAudio()");assert.equal(created,2);
reject=true;run("audioCtx.state='suspended';ensureAudio()");await new Promise(r=>setImmediate(r));assert.match(run('audioError'),/retry/,'resume rejection is handled');
reject=false;run('ensureAudio()');await new Promise(r=>setImmediate(r));assert.equal(run('audioError'),'');
run('soundOn=false;tickOn=false;persist()');const before=resumes;run("audioCtx.state='suspended';onAppResume()");assert.equal(resumes,before,'mute preference does not resume audio');
node('enableAudio').onclick();assert.equal(run('soundOn&&tickOn'),true);assert(started>0,'enable plays confirmation tones');assert.equal(stored.soundOn,'true');assert.equal(stored.tickOn,'true');assert.match(node('audioStatus').textContent,/Events on.*running/);
node('mute').onclick();assert.equal(run('soundOn||tickOn'),false);const muted=started;run("eventSound('public-open-long');onTick(100,101)");assert.equal(started,muted,'saved mute silences event and tick tones');node('mute').onclick();assert(started>muted,'unmute produces confirmation');
const native=fs.readFileSync(path.join(__dirname,'../app/src/main/java/com/twintrade/app/MainActivity.java'),'utf8');assert(native.includes('setMediaPlaybackRequiresUserGesture(false)'));assert(native.includes("getElementById('chartInfoDialog').close()"));
console.log('PASS: interrupted/suspended/closed audio recovery, handled resume failure, saved mute, enable/test and audible unmute confirmation.');})();
