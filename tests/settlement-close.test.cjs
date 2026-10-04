// Execute the real application handlers against deterministic transport/DOM doubles.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const eth=require('../app/src/main/assets/ethers.js');
const nodes={},stored={},intervals=[],timeouts=new Map();let nextTimer=0;
const ctx2d=new Proxy({measureText:s=>({width:s.length*6})},{get:(o,k)=>o[k]||(()=>{})});
const node=id=>nodes[id]??={id,value:({amount:'10',lev:'10'})[id]||'',options:[],checked:true,hidden:true,textContent:'',innerHTML:'',className:'',dataset:{},getBoundingClientRect:()=>({width:393,height:400}),getContext:()=>ctx2d,addEventListener(){},showModal(){this.open=true},close(){this.open=false}};
const env={console,document:{getElementById:node,querySelector:()=>node('dismiss'),querySelectorAll:()=>[],addEventListener(){}},localStorage:{getItem:k=>stored[k]||null,setItem:(k,v)=>stored[k]=v},setTimeout:(f,ms)=>{timeouts.set(++nextTimer,{f,ms});return nextTimer},clearTimeout(id){timeouts.delete(id)},setInterval:(f,ms)=>{intervals.push({f,ms});return intervals.length},devicePixelRatio:1,confirm:()=>false,addEventListener(){},WebSocket:class{constructor(url){this.url=url;this.readyState=1;}close(){this.readyState=3}},ethers:{utils:eth.utils,providers:{JsonRpcProvider:class{constructor(){this.connection={url:'fixture'}}async getNetwork(){throw Error('offline fixture')}}},Contract:class{}},AbortController,fetch:async()=>{throw Error('offline fixture')},GABI:[]};
env.window=env;vm.createContext(env);const run=code=>vm.runInContext(code,env);
const assets=path.join(__dirname,'../app/src/main/assets');for(const f of ['config.js','engine.js','trade-state.js','app.js'])run(fs.readFileSync(path.join(assets,f),'utf8'));
(async()=>{
 await new Promise(resolve=>setImmediate(resolve));
 const E=env.Engine,now=Date.now(),cost={fee:.035,slip:0,borrow:.07,funding:0,liq:90};
 const p=E.open(0,true,100,200,100,cost,now-3600000),r=E.settle(p,100.2698,now);
 assert(Math.abs(r.hold-14)<1e-9);assert(Math.abs(r.openFee-7)<1e-9);assert(Math.abs(r.closeFee-7)<1e-9);assert(Math.abs(r.net-25.96)<1e-8);assert(Math.abs(r.payout-125.96)<1e-8);
 env.fixture=p;run('book={cash:0,positions:[fixture],history:[]};setPrice(0,100.2698,Date.now());closePaper(fixture)');
 assert(Math.abs(run('book.cash')-125.96)<.001);assert(node('settlementDialog').open);assert(node('settlementRows').innerHTML.includes('Holding cost deducted'));assert(node('settlementRows').innerHTML.includes('$14.00'));assert(node('settlementRows').innerHTML.includes('Opening fee deducted'));assert(node('settlementTotal').textContent.includes('$125.96'));assert.throws(()=>run('closePaper(fixture)'),/already closed/);
 node('dismissSettlement').onclick();assert(!node('settlementDialog').open);
 // Native close uses its saved receipt, even when the browser quote differs.
 const settled={...p,net:r.net,settlement:r,exit:100.2698,closed:now,status:'Closed'};env.nativeBook={cash:0,positions:[p],history:[]};env.Feed={paper:()=>JSON.stringify(env.nativeBook),close:()=>{env.nativeBook={cash:r.payout,positions:[],history:[settled]};return 'OK'}};
 run('book=JSON.parse(Feed.paper());prices[0]=999;closePaper(book.positions[0])');assert(node('settlementRows').innerHTML.includes('+$25.96'));assert(!node('settlementRows').innerHTML.includes('179'));node('dismissSettlement').onclick();delete env.Feed;
 // Signed holding credits and capped liquidation losses reconcile.
 const credit=E.settle({...p,cost:{...cost,borrow:0,fundingSide:-.07}},100,now);assert(Math.abs(credit.net)<1e-9);assert(Math.abs(credit.hold+14)<1e-9);
 const loss=E.settle(p,90,now);assert.equal(loss.net,-100);assert.equal(loss.payout,0);assert(loss.lossLimitAdjustment>0);
 // All six scopes close exactly their matching positions across multiple coins.
 for(const scope of ['current','all'])for(const side of [null,true,false]){
  const ps=[0,1].flatMap(pair=>[true,false].map(long=>E.open(pair,long,10,10,100,{...cost,fee:0,borrow:0},Date.now())));
  env.fixture=ps;run('pair=0;mode="paper";book={cash:60,positions:fixture,history:[]};setPrice(0,100,Date.now());setPrice(1,100,Date.now());');
  await run('closeMany('+side+','+JSON.stringify(scope)+')');
  const count=ps.filter(p=>(side===null||p.long===side)&&(scope!=='current'||p.pair===0)).length;
  assert.equal(run('book.history.length'),count);assert.equal(run('book.positions.length'),4-count);assert.equal(run('closeReceipts.length'),count);assert(node('settlementDialog').open);node('dismissSettlement').onclick();
 }
 // A stale quote leaves that coin open and reports partial closure honestly.
 env.fixture=[E.open(0,true,10,10,100,{...cost,fee:0,borrow:0}),E.open(1,true,10,10,100,{...cost,fee:0,borrow:0})];run('book={cash:80,positions:fixture,history:[]};last[0]=Date.now();last[1]=0');await run('closeMany()');assert.equal(run('book.history.length'),1);assert.equal(run('book.positions[0].pair'),1);assert(node('settlementStatus').textContent.includes('not closed'));
 // Live batches stop on rejection and wait for each confirmed removal before the next request.
 node('dismissSettlement').onclick();env.confirm=()=>true;env.fixture=[{id:'l1',index:1,pair:0,long:true,kind:'live'},{id:'l2',index:2,pair:1,long:false,kind:'live'}];run('mode="live";wallet={address:"fixture"};livePositions=fixture;liveHistory=[];pending=[]');let sent=0;env.closeLive=async()=>{sent++;return false};await run('closeMany()');assert.equal(sent,1);assert(node('settlementStatus').textContent.includes('not submitted'));
 env.closeLive=async p=>{sent++;run('livePositions=livePositions.filter(p=>p.id!=='+JSON.stringify(p.id)+')');return true};env.refreshWallet=async()=>{};sent=0;await run('closeMany()');assert.equal(sent,2);assert.equal(run('livePositions.length'),0);assert(node('settlementTotal').textContent.includes('confirmed'));
 console.log('PASS: $14 holding + $7/$7 fees deducted once, $125.96 cash return, native ledger receipt, holding credits, capped losses, all six close scopes and partial failure.');
})().catch(e=>{console.error(e);process.exit(1)});
