const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const stored={},nodes={},texts=[],strokes=[],events={};
const ctx=new Proxy({fillText:s=>texts.push(s),moveTo:(x,y)=>strokes.push({x,y}),measureText:s=>({width:s.length*5})},{get:(o,k)=>o[k]||(()=>{})});
const node=id=>nodes[id]??={value:({amount:'10',lev:'100'})[id]||'',checked:true,hidden:true,textContent:'',innerHTML:'',getBoundingClientRect:()=>({width:393,height:400}),getContext:()=>ctx,addEventListener(){},setAttribute(){}};
function boot(){const env={console,document:{hidden:false,getElementById:node,querySelector:()=>node('dismiss'),querySelectorAll:()=>[],addEventListener:(e,f)=>events[e]=f},localStorage:{getItem:k=>stored[k]||null,setItem:(k,v)=>stored[k]=v},setTimeout:()=>0,clearTimeout(){},setInterval(){},devicePixelRatio:1,confirm:()=>false,addEventListener(){},WebSocket:class{constructor(){this.readyState=1}close(){this.readyState=3}},ethers:{providers:{JsonRpcProvider:class{}},Contract:class{}},AbortController,fetch:async()=>{throw Error('offline')},GABI:[]};env.window=env;Object.assign(env,{URL,clearInterval:()=>{}});vm.createContext(env);for(const f of ['config.js','engine.js','trade-state.js','market-data.js','routing.js','app.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../app/src/main/assets',f),'utf8'),env);return {env,run:c=>vm.runInContext(c,env)}}
(async()=>{const {env,run}=boot();await new Promise(r=>setImmediate(r));
run(`pair=0;publicTrades=[{id:'btc',pair:0,isOpen:true,long:true,lev:100.99,amount:10.99,entry:100,kind:'public'},{id:'degenL',pair:300,isOpen:true,long:true,lev:500.8,amount:20.8,entry:100.1,kind:'public'},{id:'degenS',pair:300,isOpen:true,long:false,lev:500.8,amount:30.8,entry:100.1,kind:'public'},{id:'eth',pair:1,isOpen:true,long:true,lev:100,amount:5,entry:100,kind:'public'}];prices[0]=prices[300]=100;const t=Math.floor(Date.now()/60000)*60000;candles[0]=[{t,o:100,h:102,l:98,c:100}];renderPublic();draw();`);
assert(node('publicTrades').innerHTML.includes('BTCDEGEN'));assert(node('publicTrades').innerHTML.includes('100×'));assert(!node('publicTrades').innerHTML.includes('100.99×'));assert(node('publicTrades').innerHTML.includes('$10'));assert.equal(run('marketAverages();averageCache.sides.reduce((s,g)=>s+g.count,0)'),3);
assert(texts.some(s=>s.startsWith('L 500× $20 D')));assert(texts.some(s=>s.startsWith('L LIQ EST 500× $20 D')));assert(texts.some(s=>s.startsWith('S LIQ EST 500× $30 D')));assert(!texts.some(s=>/OTHER|GROSS|LONG|SHORT/.test(s)));
// Every level is submitted, including distant positions, dust and >60 trades.
const originalTrades=run('publicTrades');run("publicTrades=Array.from({length:80},(_,i)=>({id:'far'+i,pair:i%2?300:0,isOpen:true,long:!!(i%2),lev:500,amount:i===79?.005:100+i,entry:110+i*.001,liq:110.01+i*.001,kind:'public'}));clusterOn=false;view.yOff=0;renderPublic()");texts.length=0;strokes.length=0;run('draw()');assert.equal(run('publicTrades.length'),80);assert(strokes.filter(p=>p.x===0&&(p.y<20||p.y>375)).length>=160,'offscreen entries and LIQs are stroked, not pruned');assert(!texts.some(s=>s.startsWith('L LIQ 500× $100')),'offscreen text stays hidden');
// Pan to those same retained levels without another feed update.
run('view.yOff=1.8');texts.length=0;run('draw()');assert(texts.some(s=>s.startsWith('S 500× $100')));assert(texts.some(s=>s.startsWith('S LIQ 500× $100')));assert(texts.some(s=>s.startsWith('L 500× $0 D')),'sub-cent position entry also retained');assert.equal(run('publicTrades.length'),80);
// Same-count updates invalidate the cached level geometry.
run('clusterOn=true;publicTrades[0].entry=110.2;renderPublic()');texts.length=0;run('draw()');assert(texts.some(s=>s.startsWith('S 500× $100')));env.originalTrades=originalTrades;run('publicTrades=originalTrades;view.yOff=0;renderPublic()');
run('pair=1;renderPublic()');assert(!node('publicTrades').innerHTML.includes('BTCDEGEN'));
run('setChartSpan(1)');assert.equal(run('view.span'),10);run('setChartSpan(999999)');assert.equal(run('view.span'),10080);
const T=require('../app/src/main/assets/trade-state.js'),E=require('../app/src/main/assets/engine.js'),t=Date.UTC(2026,9,3);const bars=Array.from({length:1440},(_,i)=>({t:t+i*60000,o:i+1,h:i+3,l:i+.5,c:i+2,source:'gains-history'}));const hour=T.aggregateCandles(bars,60);assert.equal(hour.length,24);assert.equal(hour[0].o,1);assert.equal(hour[0].c,61);assert.equal(hour[0].h,62);assert.equal(hour[0].l,.5);assert.equal(E.mergeCandles([],bars,t+1440*60000).length,1440);
let history=0,publics=0;env.loadHistory=async()=>history++;env.loadPublicSnapshot=async()=>publics++;run('pair=0;historyLoadedAt[0]=publicLoadedAt=Date.now();view={span:1440,off:3,yOff:1};onAppResume()');assert.equal(history,0);assert.equal(publics,0);assert.equal(run('view.off'),3);run('historyLoadedAt[0]=publicLoadedAt=Date.now()-61000;onAppResume()');assert.equal(history,1);assert.equal(publics,1);
// Draw paper and live exits through the actual chart entry point.
run(`pair=0;mode='paper';view={span:75,off:0,yOff:0};
 book.positions=[{id:'p',pair:300,kind:'paper',long:true,entry:100,lev:100,amount:10,
 cost:{liq:90,fee:0,slip:0,borrow:0,funding:0},exits:{tp:130,sl:99,trail:2,best:102,atr:3,chandelier:99}},
 {id:'other',pair:1,kind:'paper',long:true,entry:100,lev:100,amount:10,exits:{tp:777}}];`);
texts.length=0;run('draw()');
for(const label of ['↑ TP L D · $130.00','SL L D · $99.00','TRAIL L D · $99.96','CHAN L D · $99.00'])assert(texts.includes(label),label);
assert(!texts.some(s=>s.includes('$777.00')));
run(`mode='live';livePositions=[{id:'l',index:7,pair:0,kind:'live',long:false,entry:100,liq:102,lev:100,amount:10,raw:{tp:99e10,sl:101e10}}];
 liveExitRules.set('l',{trail:2,best:98,atr:3,chandelier:100});`);
texts.length=0;run('draw()');
for(const label of ['TP S · $99.00','SL S · $101.00','TRAIL S · $99.96','CHAN S · $100.00'])assert(texts.includes(label),label);
texts.length=0;run("book.positions=[];liveExitRules.get('l').best=97;liveExitRules.get('l').chandelier=0;draw();renderLegend()");
assert(texts.includes('TRAIL S · $98.94'));
assert(!texts.some(s=>s.startsWith('CHAN')));
assert.match(node('legendRows').innerHTML,/Chandelier exit/);
run('mode="paper";livePositions=[];view={span:1440,off:3,yOff:1}');
run('checkpointSession()');const restored=boot();assert.equal(restored.run('pair'),0);assert.equal(restored.run('view.span'),1440);assert.equal(restored.run('view.off'),3);assert.equal(restored.run('publicTrades.length'),4);
const native=fs.readFileSync(path.join(__dirname,'../app/src/main/java/com/twintrade/app/MainActivity.java'),'utf8');assert(native.includes('web.onResume()'));assert(native.includes('checkpointSession()'));const resume=native.split('protected void onResume()')[1].split('@Override')[0];assert(!resume.includes('loadUrl')&&!resume.includes('reload'));
console.log('PASS: compact labels, BTCDEGEN L/S and individual estimated LIQs on BTC only, zoom bounds, real hour/day aggregation, short-return refresh gating and saved session restoration.');})();
