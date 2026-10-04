const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const nodes={},labels=[];const canvas=new Proxy({fillText:(s,x,y)=>labels.push({s,y}),measureText:s=>({width:s.length*5})},{get:(o,k)=>o[k]||(()=>{})});
const node=id=>nodes[id]??={value:({amount:'10',lev:'500'})[id]||'',checked:true,hidden:true,options:[],textContent:'',innerHTML:'',getBoundingClientRect:()=>({width:393,height:400}),getContext:()=>canvas,addEventListener(){},setAttribute(){},showModal(){this.open=true},close(){this.open=false}};
const env={console,document:{getElementById:node,querySelector:()=>node('dismiss'),querySelectorAll:()=>[],addEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},setTimeout:()=>0,clearTimeout(){},setInterval(){},devicePixelRatio:1,confirm:()=>false,addEventListener(){},WebSocket:class{constructor(){this.readyState=1}close(){this.readyState=3}},ethers:{providers:{JsonRpcProvider:class{async getNetwork(){throw Error('offline')}}},Contract:class{}},AbortController,fetch:async()=>{throw Error('offline')},GABI:[]};env.window=env;vm.createContext(env);const run=c=>vm.runInContext(c,env);
for(const f of ['config.js','engine.js','trade-state.js','app.js'])run(fs.readFileSync(path.join(__dirname,'../app/src/main/assets',f),'utf8'));
(async()=>{
 await new Promise(r=>setImmediate(r));
 node('lev').value='500';node('lev').options=[{value:'200'},{value:'500'},{value:'1000'}];
 run("pair=0;syncLeverage();cfg={...cfg,fee:0,slip:0,borrow:0,funding:0};marketFees[300]={feePct:0,spreadPct:0,borrowHourly:0,fundLongHourly:0,fundShortHourly:0,at:Date.now()};prices[0]=100;prices[300]=101;last[0]=last[300]=Date.now();book={cash:100,positions:[],history:[]};const t=Math.floor(Date.now()/60000)*60000;candles[0]=[{t,o:100,h:100.05,l:99.95,c:100}];");
 assert.equal(node('lev').options[1].disabled,false);assert.equal(node('lev').options[2].disabled,true);assert.equal(node('lev').value,'500');
 assert.equal(run('TradeConfig.orderMarket(0,200).pairIndex'),0);assert.equal(run('TradeConfig.orderMarket(0,500).pairIndex'),300);assert.equal(run('TradeConfig.market(0).maxLeverage'),200);
 await run('sendOrder(true)');assert.equal(run('book.positions.length'),1);assert.equal(run('book.positions[0].pair'),300);assert.equal(run('book.positions[0].entry'),101);assert.equal(run('book.positions[0].lev'),500);assert.equal(run('myPositions().length'),1);assert(node('positions').innerHTML.includes('BTCDEGEN'));assert(node('quote').textContent.includes('Order BTCDEGEN'));assert(node('fees').textContent.includes('BTCDEGEN/USD'));
 assert(labels.some(({s,y})=>s.startsWith('L LIQ D')&&y>=0&&y<=400),'own DEGEN liquidation label visible on narrow BTC candles');assert(labels.some(({s})=>s.startsWith('L 500×')&&s.includes('D NET')));
 // Cached live positions share the combined chart and use their own LIQ, even
 // with public overlays disabled and the level outside the candle range.
 run("mode='live';livePositions=[{id:'liveD',kind:'live',pair:300,long:false,lev:500,amount:10,entry:101,liq:102}];$('overlay').checked=false;draw();");assert(labels.some(({s,y})=>s.startsWith('S LIQ D')&&s.includes('$102.00')&&y>=0&&y<=400));
 run("mode='paper';$('overlay').checked=true;last[300]=Date.now();");await run("closeMany(true,'current')");assert.equal(run('book.positions.length'),0);assert.equal(run('book.history[0].pair'),300);
 // Native order bridge receives real execution pair 300 and per-market caps.
 let opened,capRows;env.Feed={updateCaps:raw=>capRows=JSON.parse(raw),open:(pi,long,percent,lev)=>{opened={pi,long,percent,lev};return 'fixture stop'},paper:()=>JSON.stringify({cash:100,positions:[],history:[]}),snapshot:()=>JSON.stringify({prices:[],candles:[]})};
 run('last[300]=Date.now()');await run('sendOrder(false)');assert.equal(opened.pi,300);assert.equal(opened.lev,500);assert.equal(capRows.find(m=>m.pairIndex===0).maxLeverage,200);assert.equal(capRows.find(m=>m.pairIndex===300).maxLeverage,500);
 opened=null;run('last[300]=Date.now()-6000;last[0]=Date.now()');await run('sendOrder(false)');assert.equal(opened,null,'fresh BTC cannot substitute stale BTCDEGEN execution quote');delete env.Feed;
 run("TradeConfig.discover([{pairIndex:300,symbol:'BTCDEGEN/USD',maxLeverage:400}]);syncLeverage()");assert.equal(node('lev').options[1].disabled,true);assert.throws(()=>run('TradeConfig.orderMarket(0,500)'));
 console.log('PASS: combined BTC 500× option, actual DEGEN paper/native routing, independent fresh quotes/fees/caps, own paper/live LIQ labels and current-coin close.');
})().catch(e=>{console.error(e);process.exit(1)});
