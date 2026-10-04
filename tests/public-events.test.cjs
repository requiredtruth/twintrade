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
 await new Promise(r=>setImmediate(r));run("fullyLoaded=true;pair=0;soundOn=true;publicTrades=[];knownPublic.clear();publicNoticeState.clear();");
 const sounds=[],tones=[];const actualSound=env.eventSound;env.eventSound=k=>{sounds.push(k);actualSound(k)};env.tone=(...args)=>tones.push(args);
 const p=(id,long=true,pi=0)=>({id:'POLYGON:other:'+id,user:'other',pair:pi,long,lev:500,amount:100,entry:100,liq:99,net:'POLYGON',isOpen:true});env.p=p;
 // Six distinct sound signatures, with mute respected independently of banner text.
 const signatures=new Set();for(const action of ['open','close','liq'])for(const long of [true,false]){tones.length=0;env.row=p(action+long,long);env.action=action;run('notifyPublicTrade(row,action)');assert.equal(node('tradeEvent').hidden,false);assert(node('tradeEvent').textContent.includes((action==='liq'?'LIQ':action.toUpperCase())+' '+(long?'L':'S')));signatures.add(JSON.stringify(tones));}assert.equal(signatures.size,6);assert.equal(sounds.length,6);
 // Latest message stays visible until a newer execution replaces it; no hide timer.
 env.row=p('replace',false,300);run("notifyPublicTrade(row,'open')");
 assert(node('tradeEvent').textContent.includes('OPEN S'));
 assert(![...timeouts.values()].some(t=>t.ms===4500),'no event expiry is scheduled');
 env.row=p('replace2',true);run("notifyPublicTrade(row,'close')");
 assert(node('tradeEvent').textContent.includes('CLOSE L'));assert(!node('tradeEvent').textContent.includes('OPEN S'));
 run('pair=1;render();pair=0;render()');assert.equal(node('tradeEvent').hidden,false,'market switches retain the last labeled event');
 // Duplicate socket/contract reports and snapshots cannot repeat sounds or infer LIQ from liq price.
 const before=sounds.length;run("notifyPublicTrade(p('replace2'),'close');notePublicDiff([p('snapshot')],false);notePublicDiff([],false)");assert.equal(sounds.length,before);
 const mutedTones=tones.length;run("soundOn=false;notifyPublicTrade(p('mute'),'open')");assert(node('tradeEvent').textContent.includes('OPEN L'));assert.equal(tones.length,mutedTones);run('soundOn=true'); // No new tones while muted.
 let at=sounds.length;run("notifyPublicTrade(p('startup'),'open',true);notifyPublicTrade(p('eth',true,1),'open');wallet={address:'other'};notifyPublicTrade(p('own'),'open');wallet=null;");assert.equal(sounds.length,at);
 // Real websocket register/update/unregister handling, including BTCDEGEN on BTC.
 const raw=(index,long=true)=>({user:'other',index,pairIndex:300,collateralIndex:3,collateralAmount:100000000,leverage:500000,openPrice:100e10,long,isOpen:true,tradeType:0});env.raw=raw;run('publicTrades=[];knownPublic.clear()');at=sounds.length;
 run("applyBackendChange({name:'registerTrade',value:{trade:raw(40,false)}},'POLYGON')");assert.equal(sounds.at(-1),'public-open-short');assert(node('tradeEvent').textContent.includes('BTCDEGEN'));run("applyBackendChange({name:'registerTrade',value:{trade:raw(40,false)}},'POLYGON');applyBackendChange({name:'updateLeverage',value:{user:'other',index:40,leverage:400000}},'POLYGON')");assert.equal(sounds.length,at+1);
 run("publicTrades[0].liq=99;applyBackendChange({name:'unregisterTrade',value:{user:'other',index:40}},'POLYGON')");const pending=run("pendingPublicCloses.get('POLYGON:other:40').timer");timeouts.get(pending).f();assert.equal(sounds.at(-1),'public-close-short','a known LIQ line is not evidence of liquidation');
 // Confirmed execution cancels an unknown-reason close and identifies LIQ_CLOSE=6.
 run("applyBackendChange({name:'registerTrade',value:{trade:raw(41,true)}},'POLYGON');applyBackendChange({name:'unregisterTrade',value:{user:'other',index:41}},'POLYGON')");const delayed=run("pendingPublicCloses.get('POLYGON:other:41').timer");at=sounds.length;
 run("applyBackendChange({name:'liveEvents',value:[{event:'LimitExecuted',args:{t:raw(41,true),orderType:6,marketPrice:99e10}}]},'POLYGON')");assert(!timeouts.has(delayed));assert.equal(sounds.at(-1),'public-liq-long');assert.equal(sounds.length,at+1);assert(node('tradeEvent').textContent.includes('LIQ L'));assert(node('tradeEvent').textContent.includes('$99.00'));
 run("applyBackendChange({name:'unregisterTrade',value:{user:'other',index:41,action:'TradeClosedLIQ'}},'POLYGON')");assert.equal(sounds.length,at+1);
 // Deliver through the actual socket callbacks and assert rendered entry/LIQ lines.
 const labels=[];ctx2d.fillText=text=>labels.push(text);
 run("publicTrades=[];publicNoticeState.clear();knownPublic.clear();publicChanges.clear();missingPublic.clear();pair=0;clusterOn=false;selectedPublic=null;candles[0]=[{t:Date.now()-60000,o:100,h:101,l:99,c:100}];prices[0]=100;book.positions=[];$('overlay').checked=true;$('avgOverlay').checked=false;fullyLoaded=true;quietEvents=false");
 const deliver=(msg,net='POLYGON')=>{env.frame=JSON.stringify(msg);run(net==='POLYGON'?'publicSocket.onmessage({data:frame})':"netSockets['"+net+"'].onmessage({data:frame})");};
 for(const net of ['POLYGON','ARBITRUM','BASE']){
  const index=80+['POLYGON','ARBITRUM','BASE'].indexOf(net),id=net+':other:'+index;
  labels.length=0;at=sounds.length;
  deliver({name:'registerTrade',value:{trade:raw(index,false)}},net);run('draw()');
  assert.equal(run('publicTrades.length'),1);assert.equal(sounds.length,at+1);assert.equal(sounds.at(-1),'public-open-short');
  assert(labels.some(t=>t.startsWith('S 500×')),'entry label added');assert(labels.some(t=>t.startsWith('S LIQ')),'liquidation label added');
  deliver({name:'registerTrade',value:{trade:raw(index,false)}},net);assert.equal(sounds.length,at+1,'duplicate register quiet');
  deliver({name:'unregisterTrade',value:{user:'other',index,action:'TradeClosedLIQ'}},net);
  labels.length=0;run('draw()');assert.equal(run('publicTrades.length'),0);assert.equal(sounds.at(-1),'public-liq-short');
  assert(!labels.some(t=>t.startsWith('S 500×')||t.startsWith('S LIQ')),'entry and LIQ removed');
  env.stale=[{...p(index,false,300),id}];env.revision=run('publicRevision');run("publicTrades=mergePublicSnapshot(stale,new Set(['"+net+"']),revision);draw()");assert.equal(run('publicTrades.length'),0,'stale snapshot cannot resurrect closed lines');
 }
 // Closure metadata may be reused for identity, but never suppresses a genuine reopen.
 at=sounds.length;deliver({name:'registerTrade',value:{trade:raw(82,false)}},'BASE');assert.equal(sounds.length,at+1);assert.equal(sounds.at(-1),'public-open-short');
 deliver({name:'unregisterTrade',value:{user:'other',index:82,action:'TradeClosedLIQ'}},'BASE');
 // Current production liveEvent uses returnValues; history is top-level.
 deliver({name:'liveEvent',value:{event:'MarketExecuted',returnValues:{t:['other','90','300','500000',true,true,'3','0','100000000','1000000000000','0','0',false,'0','0'],open:true,marketPrice:100e10}}});assert.equal(sounds.at(-1),'public-open-long');assert(run("publicTrades.some(p=>p.index===90)"));
 deliver({name:'liveEvent',value:{event:'LimitExecuted',returnValues:{t:raw(90,true),orderType:6,marketPrice:99e10}}});assert.equal(sounds.at(-1),'public-liq-long');assert(!run("publicTrades.some(p=>p.index===90)"));
 env.historyOpen={name:'new-trade-history',action:'TradeOpenedMarket',address:'history-user',tradeIndex:'91',pair:'BTC/USD',long:1,leverage:200,size:10,price:100,tx:'history-open',logIndex:1};
 at=sounds.length;deliver(env.historyOpen);assert.equal(sounds.length,at+1);assert(run("publicTrades.some(p=>p.id==='POLYGON:history-user:91')"));deliver(env.historyOpen);assert.equal(sounds.length,at+1);
 deliver({...env.historyOpen,action:'TradeClosedLIQ',price:99,tx:'history-close'});assert.equal(sounds.at(-1),'public-liq-long');assert(!run("publicTrades.some(p=>p.id==='POLYGON:history-user:91')"));
 // Optional read-only live capture is replayed through these same transport callbacks.
 if(process.env.TWINTRADE_LIVE_CAPTURE){
  let accepted=0,opens=0;run('publicTrades=[];publicNoticeState.clear();knownPublic.clear();fullyLoaded=true;quietEvents=false');
  for(const file of process.env.TWINTRADE_LIVE_CAPTURE.split(','))for(const line of fs.readFileSync(file,'utf8').trim().split('\n').filter(Boolean)){
   const msg=JSON.parse(line),net=path.basename(file).includes('arbitrum')?'ARBITRUM':path.basename(file).includes('base')?'BASE':'POLYGON';
   const t=msg.value?.trade||msg.value;if(t?.user&&t.index!==undefined){run('pair='+Number(t.pairIndex||0));deliver(msg,net);const id=net+':'+t.user.toLowerCase()+':'+Number(t.index);env.liveId=id;
    if(msg.name==='registerTrade'&&Number(t.tradeType)===0&&run('displayablePair('+Number(t.pairIndex)+')')){assert(run('publicTrades.some(p=>p.id===liveId)'),'live register accepted');opens++;}
    if(msg.name==='unregisterTrade')assert(!run('publicTrades.some(p=>p.id===liveId)'),'live unregister removed');accepted++;
   }else if(msg.name==='new-trade-history'){env.historyFrame=msg;const market=run('TradeConfig.allMarkets().find(m=>m.symbol===historyFrame.pair)');if(market&&/^TradeOpened(Market|Limit)$/.test(msg.action)){run('pair='+market.pairIndex);deliver(msg,net);env.liveId=net+':'+msg.address.toLowerCase()+':'+msg.tradeIndex;assert(run('publicTrades.some(p=>p.id===liveId)'),'real history OPEN accepted');assert(node('tradeEvent').textContent.includes('OPEN'));opens++;accepted++;}else deliver(msg,net);}else deliver(msg,net);
  }
  assert(accepted>0,'capture contains actual new trade changes');assert(opens>0,'capture contains actual new trade opens');console.log('PASS: real live websocket capture replay: '+accepted+' trade changes, '+opens+' opens');
  run('pair=0');
 }
 // Exercise actual Polygon event subscriptions, including TP/SL close versus LIQ.
 const handlers={};env.fixtureProvider={getBlockNumber:async()=>100};run('provider=fixtureProvider');env.chain=async()=>({on:(name,fn)=>handlers[name]=fn,removeAllListeners(){},filters:{MarketExecuted:()=>0,LimitExecuted:()=>0},queryFilter:async()=>[]});run("cfg.eventRpc='';wallet=null");await run('setupEvents()');
 let serial=0;const emit=async(event,args)=>handlers[event]({event,args:{orderId:{index:1},liqPrice:99e10,...args},transactionHash:'fixture'+serial++,logIndex:0});
 at=sounds.length;await emit('MarketExecuted',{t:raw(50,true),open:true});assert.equal(sounds.at(-1),'public-open-long');await emit('MarketExecuted',{t:raw(50,true),open:false});assert.equal(sounds.at(-1),'public-close-long');await emit('LimitExecuted',{t:raw(51,false),orderType:6});assert.equal(sounds.at(-1),'public-liq-short');await emit('LimitExecuted',{t:raw(52,true),orderType:4});assert.equal(sounds.at(-1),'public-close-long');assert.equal(sounds.length,at+4);
 at=sounds.length;run('quietEvents=true');await emit('LimitExecuted',{t:raw(53,true),orderType:6});run('quietEvents=false');assert.equal(sounds.length,at,'historical backfill remains silent');
 // Persistent event does not change loading state.
 run("loadingTasks.clear();$('loadingProgress').hidden=true;notifyPublicTrade(p('last'),'open')");assert.equal(node('tradeEvent').hidden,false);assert.equal(node('loadingProgress').hidden,true);
 console.log('PASS: six unique sound patterns, side/action labels, persistent replacing banner, mute, current-chart/own/history filtering, socket/contract dedupe, confirmed LIQ classification and progress independence.');
})().catch(e=>{console.error(e);process.exit(1)});
