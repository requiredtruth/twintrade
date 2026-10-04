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
 const now=Math.floor(Date.now()/60000)*60000,bar=(t,c=100,source='gains-history')=>({t,o:c,h:c,l:c,c,source});
 // A 73-minute gap older than the default five-hour query is still repaired.
 env.fixture=[bar(now-700*60000),bar(now-626*60000)];run('candles[0]=Engine.continuousCandles(fixture);pair=0');
 let calls=[];env.fetchHistoryChain=async(chain,sym,from,to)=>{calls.push({chain,from,to});return {chain,rows:from>now-400*60000?[bar(now)]:Array.from({length:75},(_,i)=>bar(now-(700-i)*60000))};};
 await run('loadHistory(0)');assert(calls.some(c=>c.from<now-600*60000),'targets old missing range');assert.equal(run("candles[0].filter(c=>c.t<"+(now-626*60000)+"&&c.source==='gap-fill').length"),0);
 // Sparse Polygon response falls back per missing range to Arbitrum.
 env.fixture=[bar(now-4*60000),bar(now)];run('candles[0]=Engine.continuousCandles(fixture)');calls=[];
 env.fetchHistoryChain=async(chain,sym,from,to)=>{calls.push(chain);return {chain,rows:chain==='polygon'?env.fixture:Array.from({length:5},(_,i)=>bar(now-(4-i)*60000))};};
 await run('loadHistory(0)');assert(calls.includes('arbitrum'));assert.equal(run("candles[0].filter(c=>c.source==='gap-fill').length"),0);assert.equal(run('historyRetryTimers.has(0)'),false);
 // HTTP success with holes retries, without stacking jobs; delay backs off.
 run('candles[0]=Engine.continuousCandles(fixture)');env.fetchHistoryChain=async chain=>({chain,rows:env.fixture});
 await run('loadHistory(0)');const first=run('historyRetryTimers.get(0)');await run('loadHistory(0)');assert(!timeouts.has(first));assert.equal(run('historyRetryTimers.size'),1);for(let i=0;i<10;i++)await run('loadHistory(0)');assert.equal(timeouts.get(run('historyRetryTimers.get(0)')).ms,300000);
 // One failed page does not throw away the other successful history pages.
 env.fetchHistoryChain=async(chain,sym,from)=>{if(from===0)throw Error('page unavailable');return {chain,rows:[bar(now)]};};const result=await run("fetchHistoryRange('polygon','BTC-USD',0,600*60000)");assert.equal(result.rows.length,1);
 // A retained week fetches only the recent page on routine refresh.
 env.fixture=Array.from({length:10080},(_,i)=>bar(now-(10079-i)*60000));run('candles[0]=fixture;historyLoadedAt[0]=Date.now()');let pageCount=0;env.fetchHistoryChain=async chain=>{pageCount++;return {chain,rows:[bar(now)]}};await run('loadHistory(0,10080)');assert.equal(pageCount,1,'retain completed week history instead of redownloading 34 pages');
 // No growing queue for a week-long outage; repair rotates across pages.
 env.fixture=[bar(now-10000*60000),bar(now)];run('candles[0]=Engine.continuousCandles(fixture)');const plan=run('Engine.gapRepairPlan(candles[0])'),next=run('Engine.gapRepairPlan(candles[0],3)');assert.equal(plan.ranges.length,3);assert(next.ranges[0].from>plan.ranges[2].from);assert(plan.ranges.every(r=>r.to-r.from<=298*60000));
 console.log('PASS: old-gap recovery, partial-history fallback, successful-page retention, one bounded retry, backoff and rotating repair batches.');
})().catch(e=>{console.error(e);process.exit(1)});
