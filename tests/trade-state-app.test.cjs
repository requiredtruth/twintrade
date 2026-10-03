// Execute the real application handlers against deterministic transport/DOM doubles.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const eth=require('../app/src/main/assets/ethers.js');
const nodes={},stored={},intervals=[],timeouts=[];
const ctx2d=new Proxy({measureText:s=>({width:s.length*6})},{get:(o,k)=>o[k]||(()=>{})});
const node=id=>nodes[id]??={id,value:({amount:'10',lev:'10'})[id]||'',options:[],checked:true,hidden:true,textContent:'',innerHTML:'',className:'',dataset:{},getBoundingClientRect:()=>({width:393,height:400}),getContext:()=>ctx2d,addEventListener(){},showModal(){this.open=true},close(){this.open=false}};
const env={console,document:{getElementById:node,querySelector:()=>node('dismiss'),querySelectorAll:()=>[],addEventListener(){}},localStorage:{getItem:k=>stored[k]||null,setItem:(k,v)=>stored[k]=v},setTimeout:(f,ms)=>{timeouts.push({f,ms});return timeouts.length},clearTimeout(){},setInterval:(f,ms)=>{intervals.push({f,ms});return intervals.length},devicePixelRatio:1,confirm:()=>false,addEventListener(){},WebSocket:class{constructor(url){this.url=url;this.readyState=1;}close(){this.readyState=3}},ethers:{utils:eth.utils,providers:{JsonRpcProvider:class{constructor(){this.connection={url:'fixture'}}async getNetwork(){throw Error('offline fixture')}}},Contract:class{}},AbortController,fetch:async()=>{throw Error('offline fixture')},GABI:[]};
env.window=env;vm.createContext(env);const run=code=>vm.runInContext(code,env);
const assets=path.join(__dirname,'../app/src/main/assets');for(const f of ['config.js','engine.js','trade-state.js','app.js'])run(fs.readFileSync(path.join(assets,f),'utf8'));
(async()=>{
 await Promise.resolve();await Promise.resolve();
 const make=(id,net='POLYGON',entry=100)=>({id:net+':user:'+id,user:'user',index:id,net,pair:0,isOpen:true,long:true,lev:100,amount:10,entry,liq:99,raw:{user:"user",index:id,pairIndex:0,isOpen:true,tradeType:0,long:true,leverage:100000,openPrice:entry*1e10,collateralAmount:10000000,collateralIndex:3}});env.make=make;
 run('publicTrades=[make(1),make(2,"BASE")];publicChanges.clear();missingPublic.clear();');
 assert.equal(run('mergePublicSnapshot([],new Set(["POLYGON"]),publicRevision).length'),2,'One missing snapshot must retain lines; failed chains retain lines');
 assert.equal(run('mergePublicSnapshot([],new Set(["POLYGON"]),publicRevision).length'),1,'Two valid absences reconcile closed position');
 run('publicTrades=[make(1)];publicChanges.clear();missingPublic.clear();const revisionBefore=publicRevision;applyPublicChange({...make(1),isOpen:false});');
 assert.equal(run('mergePublicSnapshot([make(1)],new Set(["POLYGON"]),revisionBefore).length'),0,'In-flight snapshot cannot resurrect confirmed closure');
 run('const revisionUpdate=publicRevision;applyPublicChange(make(3,"POLYGON",105));');
 assert.equal(run('mergePublicSnapshot([],new Set(["POLYGON"]),revisionUpdate)[0].entry'),105,'In-flight snapshot cannot delete newer open event');
 run('applyPublicChange({...make(3,"POLYGON",108),liq:undefined});');assert.equal(run('publicTrades[0].liq'),99,'Entry update preserves last known liq');
 run('applyBackendChange({name:"updateLeverage",value:{user:"user",index:3,leverage:75000}},"POLYGON")');assert.equal(run('publicTrades[0].lev'),75);
 run('applyBackendChange({name:"unregisterTrade",value:{user:"user",index:3}},"POLYGON")');assert.equal(run('publicTrades.length'),0);
 run('publicTrades=[];');assert.equal(run('mergePublicSnapshot([],new Set(["POLYGON"]),publicRevision).length'),0);assert.equal(run('mergePublicSnapshot([make(3)],new Set(["POLYGON"]),publicRevision).length'),0,'Known close survives stale later snapshot');
 env.fetch=async()=>({ok:true,json:async()=>({opens:[100],highs:[101],lows:[99],closes:[100]})});run('setPrice(0,105,Date.now());last[0]-=6000');const oldTime=run('last[0]');const oldClose=run('candles[0].at(-1).c');await run('loadChartsSnapshot()');assert.equal(run('last[0]'),oldTime,'OHLC snapshots cannot hide desync or enable stale orders');assert.equal(run('candles[0].at(-1).c'),oldClose,'OHLC snapshot cannot overwrite live candle');
 // Real snapshot handler must retain old lines while one chain is pending.
 run('snapshotBusy=false;publicTrades=[make(1),make(2,"BASE")];publicChanges.clear();missingPublic.clear();');
 let finishBase;env.getChainJson=async(net,path)=>{if(path!=='/open-trades')throw Error('No vars');if(net.name==='BASE')return new Promise(resolve=>finishBase=resolve);if(net.name==='ARBITRUM')throw Error('offline');return {bad:'schema'};};
 const request=run('loadPublicSnapshot(true)');await Promise.resolve();assert.equal(run('publicTrades.length'),2);finishBase([]);await request;assert.equal(run('publicTrades.length'),2,'Malformed Polygon and first missing Base cannot remove lines');
 run('view={span:280,off:70,yOff:5};selectedPublic="test";');node('resetChart').onclick();assert.equal(run('view.span'),75);assert.equal(run('view.off'),0);assert.equal(run('view.yOff'),0);assert.equal(run('selectedPublic'),null);
 run('book={cash:80,positions:[{...make(1),kind:"paper",pair:1,opened:Date.now(),cost:{fee:0,slip:0,borrow:0,funding:0,liq:90}}],history:[{...make(4),pair:1,net:4,closed:Date.now(),status:"Closed"}]};mode="paper";');
 node('portfolioOpen').onclick();assert.equal(node('accountPanel').hidden,false);assert(node('accountRows').innerHTML.includes('ETH / USD'));node('accountHistory').onclick();assert(node('accountRows').innerHTML.includes('Closed'));
 console.log('PASS: snapshot retention, confirmed closure tombstones, concurrent events, liq persistence, partial websocket updates, malformed/partial snapshots, chart reset, all-market portfolio/history.');
})().catch(e=>{console.error(e);process.exit(1)});
