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
 // Finish startup requests against the offline fixture before replacing transports.
 for(let i=0;i<30;i++)await Promise.resolve();
 run("setLoadBar(100,'Trades synced')");const first=run('loadHideT');assert.equal(node('syncMessage').hidden,false);
 run("setLoadBar(100,'New trades synced')");assert(!timeouts.has(first));assert.equal(node('syncMessage').textContent,'New trades synced');
 run("setLoadBar(100,'Ready')");assert.equal(node('syncMessage').textContent,'New trades synced');timeouts.get(run('loadHideT')).f();assert.equal(node('syncMessage').hidden,true);
 // Repeated history failures replace the pending retry; switching markets stops it.
 env.fetchHistoryChain=async()=>{throw Error('offline')};await run('loadHistory(0)');const retry=run('historyRetryTimers.get(0)');await run('loadHistory(0)');assert(!timeouts.has(retry));assert.equal(run('historyRetryTimers.size'),1);
 let requested=0;env.fetchHistoryChain=async()=>{requested++;return{rows:[],chain:'polygon'}};const queued=run('historyRetryTimers.get(0)');run('pair=1');timeouts.get(queued).f();assert.equal(requested,0);assert.equal(run('historyRetryTimers.size'),0);
 // Holding rates must preserve contract spread and fee metadata.
 const realFetchJson=env.fetchJson;env.fetchJson=async()=>[{borrowingFeeV2HourlyRate:.00001,fundingFeeLongHourlyRate:.00002,fundingFeeShortHourlyRate:-.00003}];run('marketFees[0]={feePct:.02,spreadPct:.007}');await run('fetchHoldingRates(0)');assert.equal(run('paperCosts(0,true).slip'),.007);assert.equal(run('marketFees[0].feePct'),.02);
 // Two same-market fee refreshes must not duplicate their network work.
 run('marketFeesLoading.clear();pair=0');let finish,holds=0;env.fetchHoldingRates=async()=>{holds++;await new Promise(r=>finish=r)};env.chain=async()=>({pairTotalPositionSizeFeeP:async()=>0,pairs:async()=>({spreadP:0})});const fees=run('fetchMarketFees()');await run('fetchMarketFees()');assert.equal(holds,1);finish();await fees;assert.equal(run('marketFeesLoading.size'),0);
 // Snapshot-time changes schedule a follow-up reload instead of being lost.
 run('snapshotBusy=true;publicReloadPending=false;queuePublicReload()');assert.equal(run('publicReloadPending'),true);await run('loadPublicSnapshot(true)');assert.equal(run('snapshotBusy'),true);run('snapshotBusy=false');
 // Avoid rebuilding identical position DOM; a later change still renders.
 const el=node('positions');let writes=0,html=el.innerHTML;Object.defineProperty(el,'innerHTML',{get:()=>html,set:v=>{writes++;html=v}});run("setHTML('positions','same');setHTML('positions','same');setHTML('positions','changed')");assert.equal(writes,2);
 // Concurrent chart polls share one request; parsing failures release the lock.
 let finishCharts,chartCalls=0;env.fetchJson=async()=>{chartCalls++;return await new Promise(r=>finishCharts=r)};run('chartsSnapshotBusy=false');const charts=run('loadChartsSnapshot()');assert.equal(await run('loadChartsSnapshot()'),false);assert.equal(chartCalls,1);finishCharts({opens:[],highs:[],lows:[],closes:[]});await charts;assert.equal(run('chartsSnapshotBusy'),false);
 // Abort deadline stays live through response JSON, then is always cleared.
 let bodyDone,signal;env.fetch=async(u,opts)=>{signal=opts.signal;return{ok:true,json:async()=>new Promise(r=>bodyDone=r)}};const json=realFetchJson('fixture',1234);for(let i=0;i<5;i++)await Promise.resolve();const timer=[...timeouts.entries()].find(([id,t])=>t.ms===1234);assert(timer);timer[1].f();assert.equal(signal.aborted,true);bodyDone({ok:true});await json;assert(!timeouts.has(timer[0]));
 // Missing native history text preserves the browser's valid chart status.
 env.Feed={snapshot:()=>JSON.stringify({prices:[],candles:[],running:false}),paper:()=>JSON.stringify({cash:100,positions:[],history:[]})};node('historyStatus').textContent='Gains history';run('syncNative()');assert.equal(node('historyStatus').textContent,'Gains history');delete env.Feed;
 console.log('PASS: transient sync timer replacement, history retry cleanup/market switch, holding spread preservation, fee refresh deduplication, deferred snapshot reload and unchanged DOM reuse.');
})().catch(e=>{console.error(e);process.exit(1)});
