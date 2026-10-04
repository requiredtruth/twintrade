// Runs application event handlers with DOM/transport doubles; not a rendering test.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const valid={id:'keep-me',pair:0,isOpen:true,long:true,entry:84000,amount:20,lev:100};
for(const session of [{at:Date.now(),view:{span:1440,off:3,yOff:0},trades:[null,42,{},valid]},[],true,'invalid',{}]){
const nodes={},stored={chartSession:JSON.stringify(session)},timers=[];
const context2d=new Proxy({measureText:s=>({width:s.length*6})},{get:(o,k)=>o[k]||(()=>{})});
const node=id=>nodes[id]??=( {id,value:({amount:'10',lev:'200'})[id]||'',checked:true,hidden:true,textContent:'',innerHTML:'',className:'',dataset:{},getBoundingClientRect:()=>({width:393,height:400}),getContext:()=>context2d,showModal(){this.open=true},close(){this.open=false}});
const markets=[{dataset:{pair:'0'}},{dataset:{pair:'1'}}];const env={console,document:{getElementById:node,querySelector:()=>node('dismiss'),querySelectorAll:()=>markets,addEventListener(){}},localStorage:{getItem:k=>stored[k]||null,setItem:(k,v)=>stored[k]=v},setTimeout:()=>0,clearTimeout(){},setInterval:f=>timers.push(f),devicePixelRatio:1,confirm:()=>true,addEventListener(){},WebSocket:class {constructor(url){if(url.includes("backend-pricing"))env.ws=this;this.readyState=1}close(){}},ethers:{providers:{JsonRpcProvider:class{async getNetwork(){throw Error('fixture offline')}}},Contract:class{}},AbortController:class{abort(){}},fetch:async()=>{throw Error("fixture offline")},GABI:[]};env.window=env;vm.createContext(env);
const assets=path.join(__dirname,'../app/src/main/assets');for(const f of ['config.js','engine.js','trade-state.js','app.js'])vm.runInContext(fs.readFileSync(path.join(assets,f),'utf8'),env);
if(session.trades){assert.equal(vm.runInContext('publicTrades.length',env),1);assert.equal(vm.runInContext('publicTrades[0].id',env),'keep-me');assert.equal(vm.runInContext('view.span',env),1440);assert.equal(vm.runInContext('view.off',env),3);}
assert.equal(typeof node('long').onclick,'function');vm.runInContext('onAppResume()',env);
}
console.log('PASS: malformed saved-session startup, valid trade/zoom preservation and resume handlers');
