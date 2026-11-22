'use strict';
/* TwinTrade 0.31.0: minute-floored candle merges (no double bars),
 * every stroked line carries a label, left-stacked tags. */
const $=id=>document.getElementById(id),money=n=>Number.isFinite(n)?'$'+n.toFixed(2):'—',esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* Rough live PnL for others' lines (gross, fees unknown): ~estimate. */
function estPnl(entry,long,lev,amount,px){if(!(entry>0&&px>0&&amount>0&&lev>0))return NaN;return amount*lev*(long?1:-1)*(px/entry-1);}
const cashLabel=n=>Number.isFinite(n)?'$'+Math.trunc(n):'—',levLabel=n=>Number.isFinite(n)?String(n<10?+n.toFixed(3):Math.trunc(n)):'—';
const feeMoney=n=>Number.isFinite(n)?'$'+Math.abs(n).toFixed(Math.abs(n)>0&&Math.abs(n)<.01?6:2):'—';
const fmtPnl=v=>Number.isFinite(v)?(v<0?'-':'+')+money(Math.abs(v)):'—';
const NETWORK=TradeConfig.network,DIAMOND=NETWORK.diamond,ZERO='0x0000000000000000000000000000000000000000';
const defaults={fee:.035,slip:.005,borrow:.0003,funding:0,liq:90,maxSlip:.1,rpc:NETWORK.httpsRpc,eventRpc:NETWORK.wssRpc};
function load(k,f){try{return JSON.parse(localStorage.getItem(k))||f}catch{return f}}
function loadRaw(k,f){try{const v=localStorage.getItem(k);return v===null||v===undefined?f:JSON.parse(v)}catch{return f}}
const PUBLIC_BASE='https://backend-polygon.gains.trade';
let chainConnecting=null,quietEvents=false;
let publicBackendGeneration=0;
let snapshotBusy=false,publicSocket=null,publicRefreshTimer=0,publicVars=null,publicVarsAt=0,publicVarsAttemptAt=0,selectedPublic=null;
let cfg={...defaults,...load('config',{})},book=load('paper',{cash:100,positions:[],history:[]}),pair=0,mode='paper',history=false;
if(!Array.isArray(book.pending))book.pending=[];
let prices={0:0,1:0},last={0:0,1:0},candles={0:[],1:[]},indexPrices={},indexTimes={};
let publicTrades=[],livePositions=[],pending=load('pending',[]),liveHistory=load('liveHistory',[]),wallet=null,provider=null,contract=null,eventProvider=null,eventContract=null,liveBalance=NaN,busy=false,socket,wsGeneration=0,refreshBusy=false,publicGeneration=0;
let syncBeganAt=Date.now(),syncPair=0,nativeRunning=false,nativeStatus='',nativeFeedError='',nativeAcceptedAt=0;
let statsRevision=0,averageCache={pair:null,revision:-1,bands:[]};
let publicRevision=0,publicChanges=new Map(),missingPublic=new Map(),accountPage='portfolio';
let knownPublic=new Map(),marketFees={},marketFeesAt=0;
const rawSession=load('chartSession',{});
const savedSession=rawSession&&typeof rawSession==='object'&&!Array.isArray(rawSession)?rawSession:{};
if(TradeConfig.marketOrNull(savedSession.pair))pair=savedSession.pair;
let view={span:75,off:0,yOff:0,...savedSession.view};let chartInterval=[0,1,5,15,60,240,1440].includes(savedSession.interval)?savedSession.interval:0,historyLoadedAt={},publicLoadedAt=0;
view.span=Math.max(10,Math.min(10080,Number(view.span)||75));
view.off=Number.isFinite(+view.off)?Math.max(0,Math.min(10079,Math.trunc(+view.off))):0;
view.yOff=Number.isFinite(+view.yOff)?+view.yOff:0;
if(savedSession.at>Date.now()-86400000){if(Array.isArray(savedSession.candles))candles[pair]=Engine.mergeCandles([],savedSession.candles);if(Array.isArray(savedSession.trades))publicTrades=savedSession.trades.filter(p=>p&&typeof p==='object'&&p.isOpen&&Number.isInteger(p.pair)&&Number.isFinite(p.entry)&&p.entry>0&&Number.isFinite(p.amount)&&p.amount>0&&Number.isFinite(p.lev)&&p.lev>0);selectedPublic=savedSession.selectedPublic||null;}
function checkpointSession(){syncAudioState();try{const trades=publicTrades.map(({id,user,index,net,pair,isOpen,long,lev,amount,entry,liq,liqError})=>({id,user,index,net,pair,isOpen,long,lev,amount,entry,liq,liqError,kind:'public'}));localStorage.setItem('chartSession',JSON.stringify({at:Date.now(),pair,view,interval:chartInterval,selectedPublic,candles:candlesOf(pair),trades,overlay:$('overlay').checked,avgOverlay:$('avgOverlay').checked,lastTradeEvent,lastTradeEvents:[...tradeEvents.values()]}));persist();}catch{}}
function onAppResume(){refreshDeviceTimeZone();if(soundOn||tickOn)ensureAudio();syncNative();managePriceTransport();if(Date.now()-(historyLoadedAt[pair]||0)>60000)loadHistory();if(Date.now()-publicLoadedAt>60000)loadPublicSnapshot();refreshWallet();refreshOpenHoldingRates();render();}
function chartPair(p){return p.pair===pair||pair===0&&p.pair===300;}
function publicLiq(p){return Number.isFinite(p.liq)&&p.liq>0?p.liq:TradeState.estimateLiq(p);}
let barsCache={};
function chartBars(){const raw=trimFutureCandles(pair,Date.now()),end=Math.max(0,raw.length-Math.max(0,view.off|0)),tail=raw[end-1];if(!tail)return [];const key=[pair,raw.length,tail.t,tail.o,tail.h,tail.l,tail.c,tail.source,view.off,view.span,chartInterval].join(':');if(barsCache.raw===raw&&barsCache.key===key)return barsCache.bars;const floor=tail.t-(view.span-1)*60000;const interval=candleInterval();const bars=TradeState.aggregateCandles(raw.filter((c,i)=>i<end&&c.t>=floor),interval);barsCache={raw,key,bars};return bars;}
function candleInterval(){return chartInterval||(view.span<=300?1:view.span<=1500?5:view.span<=4500?15:60);}
function durationLabel(minutes){return minutes>=1440?+(minutes/1440).toFixed(2)+'d':minutes>=60?+(minutes/60).toFixed(2)+'h':minutes+'m';}
let deviceTimeZone;
function refreshDeviceTimeZone(){
 let zone;
 try{
  const id=window.Feed?.timeZone?.();
  zone=new Intl.DateTimeFormat(undefined,id?{timeZone:id}:{}).resolvedOptions().timeZone;
 }catch{zone=Intl.DateTimeFormat().resolvedOptions().timeZone;}
 if(zone===deviceTimeZone)return;
 deviceTimeZone=zone;
 if(lastTradeEvent)paintTradeEvent(lastTradeEvent);
 draw();
}
function localDate(t,options){return new Date(t).toLocaleString([], {...options,timeZone:deviceTimeZone});}
function chartDate(t){return localDate(t,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});}
function chartPlot(width){const right=width-70,left=Math.min(236,Math.floor(Math.max(0,right)*.52)),gap=Math.min(80,Math.max(40,(right-left)*.15));return {left,right,candleRight:right-gap,candleWidth:Math.max(1,right-gap-left)};}
function chartTimeTicks(bars,left,right){
 if(!bars.length||right<=left)return [];
 const width=right-left,step=width/bars.length,ticks=[];
 const stride=Math.max(1,Math.ceil(82/step));
 for(let i=0;i<bars.length;i+=stride){const t=bars[i].t;ticks.push({t,x:left+(i+.5)*step,time:localDate(t,{hour:'2-digit',minute:'2-digit',hourCycle:'h23'}),date:localDate(t,{month:'short',day:'numeric'})});}
 return ticks;
}
function chartDetails(bars){
 const summary=$('chartDetails'),range=$('chartRange');if(!summary||!range)return;
 const interval=candleInterval();
 summary.textContent=`Range ${durationLabel(view.span)} · Candles ${durationLabel(interval)}${chartInterval?'':' auto'} · Zoom ${+(75/view.span).toFixed(3)}× · ${view.off?'Past '+durationLabel(view.off):'Latest'}`;
 const zone=deviceTimeZone||'local time';
 range.textContent=bars.length?`${chartDate(bars[0].t)} → ${chartDate(bars.at(-1).t+interval*60000)} · ${zone}`:`Waiting for candles · ${zone}`;
}
let chartHistoryTimer=0;
function requestChartHistory(){clearTimeout(chartHistoryTimer);chartHistoryTimer=setTimeout(()=>{const need=Math.min(10080,view.span+view.off);if(candlesOf(pair).length<need)loadHistory(pair,need).then(draw);},250);}
function setChartSpan(span,fetchMore=true){view.span=Math.max(10,Math.min(10080,Math.round(span)));draw();if(fetchMore)requestChartHistory();}
async function chartRange(span){setChartSpan(span,false);view.off=0;view.yOff=0;draw();await loadHistory(pair,view.span,true);draw();}
let othersCache={key:'',list:[],at:0},snapId=0;
let rxBytes=0,rxWindow=0,lastRateAt=Date.now(),lastKbps=0;
let soundOn=loadRaw('soundOn',true),tickOn=loadRaw('tickOn',true),soundProfile=loadRaw('soundProfile','gentle'),soundLevel=loadRaw('soundLevel',1),clusterOn=loadRaw('clusterOn3',true);if(!['gentle','warm','minimal'].includes(soundProfile))soundProfile='gentle';if(![.45,.7,1].includes(soundLevel))soundLevel=1;
let audioError='';let audioCtx=null,lastTickAt=0,lastFlashPrice=0,flashTimer=0;
if(!cfg.eventRpc)cfg.eventRpc=NETWORK.wssRpc;
function persist(){localStorage.setItem('paper',JSON.stringify(book));localStorage.setItem('pending',JSON.stringify(pending));localStorage.setItem('liveHistory',JSON.stringify(liveHistory.slice(0,200)));try{localStorage.setItem('soundOn',JSON.stringify(soundOn));localStorage.setItem('tickOn',JSON.stringify(tickOn));localStorage.setItem('soundProfile',JSON.stringify(soundProfile));localStorage.setItem('soundLevel',JSON.stringify(soundLevel));localStorage.setItem('clusterOn3',JSON.stringify(clusterOn));}catch{}}
function toast(s){try{$('toast').textContent=s;$('toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').hidden=true,7000)}catch{}}
const renderedHTML=new Map();
function setHTML(id,html){const el=$(id);if(el&&renderedHTML.get(id)!==html){el.innerHTML=html;renderedHTML.set(id,html);}}
function priceOf(p){return prices[p]||0}
function lastOf(p){return last[p]||0}
function candlesOf(p){if(!candles[p])candles[p]=[];return candles[p]}
function marketLabel(p){try{const m=TradeConfig.marketOrNull(p);if(m)return m.symbol.replace('/USD','')+' / USD';}catch{}if(Number.isInteger(p)&&p>=0)return 'pair '+p+' / USD';return 'BTC / USD';}
function trimFutureCandles(i,now){
 const bars=candlesOf(i),current=Math.floor(now/60000)*60000;
 if(bars.at(-1)?.t>current)candles[i]=Engine.mergeCandles(bars,[],now);
 return candles[i];
}
function setPrice(i,v,now){const prev=prices[i]||0,a=trimFutureCandles(i,Date.now()),t=Math.floor(now/60000)*60000;let c=a[a.length-1];prices[i]=v;last[i]=now;if(c&&c.t>t)return;const rollover=!!c&&c.t!==t;if(i===pair&&prev>0&&v!==prev){onTick(prev,v,rollover);checkCrossings(prev,v);if(rollover&&Number.isFinite(c.o)&&Number.isFinite(c.c))onCandleClose(c);}if(!c||c.t!==t){if(c)for(let gt=Math.max(c.t+60000,t-10079*60000);gt<t;gt+=60000)a.push({t:gt,o:c.c,h:c.c,l:c.c,c:c.c,source:'gap-fill'});c={t,o:v,h:v,l:v,c:v,source:'gains-live'};a.push(c);if(a.length>10080)a.splice(0,a.length-10080)}else{c.source='gains-live';c.h=Math.max(c.h,v);c.l=Math.min(c.l,v);c.c=v}}
/* ---- sounds: unique per actor + side + outcome; ticks vary by big/small. ---- */
function ensureAudio(){if(window.NativeAudio){NativeAudio.enabled(soundOn||tickOn);audioError='';return;}try{if(!audioCtx||audioCtx.state==='closed')audioCtx=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state!=='running'){const resumed=audioCtx.resume();if(resumed&&resumed.catch)resumed.then(()=>{audioError='';}).catch(()=>{audioError='Tap Enable sounds + test to retry';});}else audioError='';}catch{audioError='Audio unavailable · tap Enable sounds + test to retry';}}
let lastAudioState='';
function syncAudioState(){try{if(!window.Feed?.audioState)return;const positions=mode==='live'?livePositions.map(p=>({pair:p.pair,long:p.long,entry:p.entry,amount:p.amount,lev:p.lev,adjustment:p.feeTime?(p.realizedPnl||0)-p.borrow-p.funding-p.trading-p.closeEstimate:null})):[],raw=JSON.stringify({pair,symbol:TradeConfig.marketOrNull(pair)?.symbol||"",events:soundOn,ticks:tickOn,profile:soundProfile,level:soundLevel,mode,owner:wallet?.address||"",positions});if(raw!==lastAudioState){Feed.audioState(raw);lastAudioState=raw;}}catch{}}
function renderAudioStatus(){syncAudioState();try{if(window.NativeAudio)NativeAudio.enabled(soundOn||tickOn);const enabled=soundOn||tickOn,state=window.NativeAudio?NativeAudio.status():(audioCtx?.state||'not started');$('audioStatus').textContent=`Events ${soundOn?'on':'off'} (${soundProfile}) · Level ${Math.round(soundLevel*100)}% · Price/candles ${tickOn?'on':'off'} · Audio ${enabled?state:'muted'}${audioError?' · '+audioError:''}`;const button=$('mute');button.title=`Events ${soundOn?'on':'off'} · Price/candles ${tickOn?'on':'off'} · Tap to ${enabled?'mute':'enable'} sounds`;button.setAttribute('aria-label',button.title);}catch{}}
/* Mobile browsers lock audio until a user gesture: unlock on any touch/key. */
try{document.addEventListener('pointerdown',()=>{try{ensureAudio();}catch{}},{passive:true});document.addEventListener('keydown',()=>{try{ensureAudio();}catch{}});}catch{}
function click(){if(!soundOn)return;tone(700,0.05,'sine',0.05);}
function tone(freq,dur=0.12,type='sine',gain=0.12,when=0,peak=.095){if(!soundOn&&!tickOn||document.hidden)return;type=type==='square'?'triangle':type==='sawtooth'?'sine':type;gain=Math.min(peak,gain)*soundLevel;try{ensureAudio();if(window.NativeAudio){NativeAudio.tone(freq,dur,type,gain,when);return;}if(!audioCtx)return;const t=audioCtx.currentTime+when,o=audioCtx.createOscillator(),g=audioCtx.createGain();if((type==='warm'||type==='chime')&&audioCtx.createPeriodicWave&&o.setPeriodicWave){const real=new Float32Array(5),imag=new Float32Array(5);imag[1]=1;imag[2]=type==='chime'?.28:.18;imag[3]=type==='chime'?.12:.06;imag[4]=type==='chime'?.04:0;o.setPeriodicWave(audioCtx.createPeriodicWave(real,imag,{disableNormalization:false}));}else o.type=type==='buzzer'?'square':type==='warm'||type==='chime'?'sine':type;o.frequency.value=freq;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(0.001,gain),t+Math.min(.018,dur*.35));if(type==='buzzer'){g.gain.setValueAtTime(Math.max(.001,gain),t+dur-.045);}g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+dur+0.05);}catch{}}
/* Small quote changes use a short tick/tock pulse. A confirmed reversal changes
 * direction; the pulse cadence stays active through tiny back-and-forth moves. */
let tickMotionState=null,tickBeat=false,priceSoundSuppressedUntil=0;
function softTickFrequency(f){return Math.max(220,Math.min(1080,f));}
function onTick(prev,next,silent=false){if(!tickOn||!(prev>0&&next>0)||prev===next)return;const now=Date.now(),motion=Engine.tickMotion(tickMotionState,prev,next,now,pair),pct=(next-prev)/prev*100,abs=Math.abs(pct),micro=abs<.005,cooldown=motion.major?90:micro?130:105;tickMotionState=motion.state;if(now-lastTickAt<cooldown)return;lastTickAt=now;tickBeat=!tickBeat;
 if(silent||now<priceSoundSuppressedUntil)return;
 const big=abs>=.05;
 try{
 const {avg,exposure}=positionSoundContext(),favor=exposure===0?motion.direction>0:(next-prev)*exposure>0;
 const base=Number.isFinite(avg)?avg>0?760:avg<0?420:620:620,g=Math.min(.14,.045+abs*1.1);
 if(micro){tone(softTickFrequency(base*(favor?1.08:.88)*(tickBeat?1.015:.985)),.035,favor?'chime':'warm',g);return;}
 const span=1+Math.min(abs,.5)*.9,f1=favor?Math.min(730,base*span):Math.max(360,base/span),f2=f1*(favor?1.26:.79),dur=big?.13:.07;
 tone(softTickFrequency(f1),dur,'warm',g);tone(softTickFrequency(f2),dur+.02,favor?'chime':'warm',g*.9,.07);
 if(big||avg>5)tone(softTickFrequency(f2*(favor?(big?1.4:1.25):.79)),.09,favor?'chime':'warm',g*(big?.45:.55),.14);
 }catch{}}
let lastCandleSoundAt=0,lastCrossAt=0;
let bigEvT=0,positionCueActive=false;
const positionCueQueue=[];
function showBigEvent(text,cls){try{const b=$('bigEvent');if(!b)return;b.textContent=text;b.className=cls||'';b.hidden=false;clearTimeout(bigEvT);bigEvT=setTimeout(()=>{b.hidden=true;},4000);}catch{}}
/* Price crossing your entry/liq lines: unique sounds + feed cards. */
function checkCrossings(prev,next){if(!soundOn||!fullyLoaded)return;const now=Date.now();if(now-lastCrossAt<600)return;try{const ps=mode==='paper'?book.positions:livePositions;for(const p of ps){if(p.pair!==pair)continue;if((now-(p._xAt||0))<2000)continue;const liq=p.kind==='paper'?safeLiq(p):p.liq;
if(Math.sign(next-p.entry)!==Math.sign(prev-p.entry)){p._xAt=now;lastCrossAt=now;const profitable=(next>p.entry)===p.long;eventSound(profitable?'pnl-profit':'pnl-loss');pushEvent(`${profitable?'Profit':'Loss'} side of your ${p.long?'L':'S'} entry ${money(p.entry)}`,profitable?'long':'short');return;}
if(liq>0&&Math.sign(next-liq)!==Math.sign(prev-liq)){p._xAt=now;lastCrossAt=now;eventSound('liq-touch');pushEvent(`Price touched LIQ ${money(liq)} — danger`,'liq');return;}}}catch{}}
function positionSoundContext(){
 let total=0,count=0,exposure=0;
 for(const p of myPositions()){
  const sensitivity=p.amount*p.lev/p.entry;
  if(Number.isFinite(sensitivity))exposure+=(p.long?1:-1)*sensitivity;
  const price=refPrice(p.pair);
  if(!(price>0))continue;
  const net=p.kind==='paper'?Engine.value(p,price).net:liveValue(p);
  if(Number.isFinite(net)){total+=net;count++;}
 }
 return {avg:count?total/count:NaN,exposure};
}
function myPositions(){try{return (mode==='paper'?book.positions:livePositions).filter(chartPair);}catch{return[];}}
function myAvgEntry(){let w=0,s=0;for(const p of myPositions()){const n=(p.amount||0)*(p.lev||0);w+=n;s+=n*p.entry;}return w>0?s/w:0;}
function myTotalNet(targetPair=null){let s=0,n=0;for(const p of myPositions()){if(targetPair!==null&&!(targetPair===pair?chartPair(p):p.pair===targetPair))continue;if(!refPrice(p.pair))continue;const v=p.kind==='paper'?Engine.value(p,refPrice(p.pair)).net:liveValue(p);if(Number.isFinite(v)){s+=v;n++;}}return n?{total:s,count:n}:null;}
/* Minute-close phrases follow the selected market's net exposure. */
function onCandleClose(c){
 if(!tickOn)return;
 const now=Date.now();
 if(now<priceSoundSuppressedUntil||now-lastCandleSoundAt<1500)return;
 lastCandleSoundAt=now;
 try{
  const {exposure}=positionSoundContext(),move=c.c-c.o;
  const favorable=exposure===0?move>=0:move*exposure>0;
  const notes=exposure!==0&&move===0?[[440,.11,'warm',.04,0]]:favorable?[[466,.09,'warm',.043,0],[554,.11,'chime',.045,.08]]:[[415,.09,'warm',.043,0],[349,.12,'warm',.045,.08]];
  window.NativeAudio?.clearPending?.();
  for(const note of notes)tone(...note);
 }catch{}
}
const EVENT_SOUND_PALETTE={
 'public-open-long':[[523,.07,'warm',.055,0],[659,.1,'chime',.06,.075],[784,.13,'chime',.05,.15]],
 'public-open-short':[[659,.07,'warm',.055,0],[494,.1,'warm',.06,.075],[392,.13,'chime',.05,.15]],
 'public-close-long':[[784,.07,'chime',.05,0],[659,.1,'warm',.055,.075],[523,.14,'warm',.045,.15]],
 'public-close-short':[[392,.07,'chime',.05,0],[494,.1,'warm',.055,.075],[587,.14,'warm',.045,.15]],
 'public-liq-long':[[247,.11,'warm',.06,0],[196,.14,'warm',.055,.1],[147,.18,'sine',.045,.22]],
 'public-liq-short':[[196,.11,'warm',.06,0],[247,.14,'warm',.055,.1],[330,.18,'sine',.045,.22]],
 'my-long':[[523,.08,'warm',.065,0],[659,.11,'chime',.07,.08],[784,.16,'chime',.055,.17]],
 'my-short':[[659,.08,'warm',.065,0],[494,.11,'warm',.07,.08],[392,.16,'chime',.055,.17]],
 'my-close-win':[[784,.055,'chime',.045,0],[988,.055,'chime',.045,.068],[1175,.055,'chime',.045,.136],[1568,.065,'chime',.0475,.204],[1319,.055,'chime',.045,.29],[1568,.055,'chime',.045,.358],[1976,.16,'chime',.0475,.43]],
 'my-close-loss':[[147,.48,'buzzer',.15,0]],
 'my-close':[[587,.09,'warm',.055,0],[659,.14,'chime',.05,.09]],
 'my-liq-long':[[175,3,'buzzer',.115,0]],
 'my-liq-short':[[196,3,'buzzer',.115,0]],
 'close-request-win':[[659,.09,'chime',.08,0],[988,.15,'chime',.09,.10]],
 'close-request-loss':[[196,.22,'buzzer',.12,0]],
 'pnl-profit':[[523,.08,'warm',.052,0],[698,.13,'chime',.055,.09]],
 'pnl-loss':[[494,.08,'warm',.048,0],[370,.13,'warm',.05,.09]],
 'preview-tick-up':[[523,.06,'warm',.045,0],[659,.1,'chime',.05,.07]],
 'preview-tick-down':[[494,.06,'warm',.043,0],[392,.1,'warm',.047,.07]],
 'liq-touch':[[247,.13,'warm',.06,0],[185,.18,'sine',.055,.13]]
};
const SOUND_PREVIEW_SEQUENCE=[['my-long','my L'],['my-short','my S'],['public-open-long','public OPEN L'],['public-open-short','public OPEN S'],['close-request-win','close request · estimated profit'],['close-request-loss','close request · estimated loss'],['my-close-win','my CLOSE profit'],['my-close-loss','my CLOSE loss'],['public-close-long','public CLOSE L'],['public-close-short','public CLOSE S'],['my-liq-long','my LIQ L'],['my-liq-short','my LIQ S'],['public-liq-long','public LIQ L'],['public-liq-short','public LIQ S'],['pnl-profit','entry → profit'],['pnl-loss','entry → loss'],['liq-touch','liq touch'],['danger','danger zone'],['respawn','respawn'],['preview-tick-up','tick up'],['preview-tick-down','tick down']];
const SOUND_PREVIEW_GAP_MS=560;
function profiledEventNotes(notes){const selected=soundProfile==='minimal'&&notes.length>2?[notes[0],notes.at(-1)]:notes;return selected.map(([freq,dur,type,gain,when],i)=>soundProfile==='warm'?[freq*.88,dur,type==='chime'?'warm':type,gain*.9,when]:soundProfile==='minimal'?[freq,dur*.9,type,gain*.85,i?Math.min(when,.11):0]:[freq,dur,type,gain,when]);}
function eventCueDuration(kind){
 return Math.max(...(EVENT_SOUND_PALETTE[kind]||[]).map(([,duration,,,delay])=>duration+delay),0);
}
function playNextPositionCue(){
 const kind=positionCueQueue.shift();
 if(!kind||!soundOn||document.hidden){positionCueActive=false;positionCueQueue.length=0;return;}
 positionCueActive=true;
 const duration=eventCueDuration(kind)*1000+65;
 priceSoundSuppressedUntil=Date.now()+duration;
 window.NativeAudio?.clearPending?.();
 for(const note of EVENT_SOUND_PALETTE[kind])tone(...note,.23);
 setTimeout(playNextPositionCue,duration);
}
function eventSound(kind){
 if(!soundOn||document.hidden)return;
 if(kind.startsWith('my-liq-')||kind.startsWith('my-close')||kind.startsWith('close-request-')){
  positionCueQueue.push(kind);
  if(!positionCueActive)playNextPositionCue();
  return;
 }
 if(positionCueActive)return;
 try{priceSoundSuppressedUntil=Date.now()+520;window.NativeAudio?.clearPending?.();if(EVENT_SOUND_PALETTE[kind]){for(const note of profiledEventNotes(EVENT_SOUND_PALETTE[kind]))tone(...note);return;}
if(kind==='other-long'){tone(660,0.09,'triangle',0.09);}
else if(kind==='other-short'){tone(392,0.09,'triangle',0.09);}
else if(kind==='other-liq'){tone(196,0.25,'sawtooth',0.1);}
else if(kind==='other-close'){tone(500,0.07,'sine',0.06);}
else if(kind==='respawn'){tone(440,0.08,'sine',0.08);tone(660,0.08,'sine',0.08,0.08);}
else if(kind==='danger'){tone(130,0.3,'sawtooth',0.08);}
}catch{}}
/* ---- chart event feed (top-right animation of opens/liqs/closes) ---- */
function pushEvent(text,cls){try{const box=$('events');if(!box)return;const d=document.createElement('div');d.className='ev '+(cls||'');d.textContent=text;box.prepend(d);while(box.children.length>6)box.lastChild.remove();setTimeout(()=>d.classList.add('out'),5200);setTimeout(()=>d.remove(),6000);}catch{}}
/* Snapshots establish a quiet baseline; disappearance alone never proves LIQ. */
function notePublicDiff(next,quiet){knownPublic=new Map(next.map(p=>[p.id,p]));}
let lastTradeEvent=null,publicFeedConnected=false;const tradeEvents=new Map(),publicNoticeState=new Map(),pendingPublicCloses=new Map();
function clearTradeEvent(){tradeEvents.clear();lastTradeEvent=null;try{$('tradeEvent').hidden=true;}catch{}}
function showTradeEvent(text,action,long,at=Date.now(),source='live',id=null,eventPair=pair){if(!Number.isInteger(eventPair)||eventPair<0)return;const event={text,action,long,at,source,id,pair:eventPair},cached=tradeEvents.get(eventPair);if(cached&&cached.at>at)return;tradeEvents.delete(eventPair);tradeEvents.set(eventPair,event);while(tradeEvents.size>512)tradeEvents.delete(tradeEvents.keys().next().value);if(!chartPair(event)||lastTradeEvent&&chartPair(lastTradeEvent)&&lastTradeEvent.at>at)return;lastTradeEvent=event;paintTradeEvent(event);}
function paintTradeEvent(event){
 try{
  const el=$('tradeEvent');
  if(event.source==='history'){
   // Older sessions stored the already formatted time in the event text.
   const details=event.text.replace(/^Last confirmed · [^·]+ · /,'');
   el.textContent='Last confirmed · '+localDate(event.at,{hour:'2-digit',minute:'2-digit'})+' · '+details;
  }else el.textContent=event.text;
  el.className=event.action+' '+(event.long?'long':'short');
  el.hidden=false;
 }catch{}
}
for(const event of [...(Array.isArray(savedSession.lastTradeEvents)?savedSession.lastTradeEvents.slice(-512):[]),savedSession.lastTradeEvent]){if(!event||typeof event.text!=='string'||event.text.length>2000||!['open','close','liq'].includes(event.action)||typeof event.long!=='boolean'||!Number.isInteger(event.pair)||event.pair<0||!Number.isFinite(event.at)||event.at>Date.now()+5000)continue;const previous=tradeEvents.get(event.pair);if(!previous||previous.at<=event.at)tradeEvents.set(event.pair,event);}
function tradeFeedStatus(connected=publicFeedConnected){publicFeedConnected=connected;if(lastTradeEvent&&chartPair(lastTradeEvent))return;try{const el=$('tradeEvent');el.textContent=(connected?'Live trades · ':'Connecting to trades · ')+marketLabel(pair)+(connected?' · waiting for execution':'');el.className='';el.hidden=false;}catch{}}
function restoreSelectedTradeEvent(){lastTradeEvent=null;const latest=[...tradeEvents.values()].reverse().filter(chartPair).sort((a,b)=>b.at-a.at)[0];if(latest)showTradeEvent(latest.text,latest.action,latest.long,latest.at,latest.source,latest.id,latest.pair);else tradeFeedStatus();}
function publicTradeText(p,action){const label=action==='liq'?'LIQ':action.toUpperCase(),price=p.eventPrice>0?p.eventPrice:p.entry;return `${p.symbol||marketLabel(p.pair)} · ${p.net||'POLYGON'} · ${label} ${p.long?'L':'S'} ${levLabel(p.lev)}× ${cashLabel(p.amount)}${price>0?' @ '+money(price):''}`;}
restoreSelectedTradeEvent();
function publicAction(msg){const v=msg.value||msg.args||{},name=String(v.action||v.trade?.action||v.event||v.eventName||msg.action||msg.event||msg.name||'');if(name==='TradeClosedLIQ'||name==='LIQ_CLOSE'||name==='Liquidated'||name==='LimitExecuted'&&N(v.orderType)===6)return 'liq';return 'close';}
function notifyPublicTrade(p,action,quiet=false){if(!p?.id||!Number.isInteger(p.pair)||!['open','close','liq'].includes(action))return;const pendingClose=pendingPublicCloses.get(p.id);if(pendingClose){clearTimeout(pendingClose.timer);pendingPublicCloses.delete(p.id);}const previous=publicNoticeState.get(p.id);if(previous?.notified&&(previous.action===action||previous.action==='liq'&&action==='close')){const cached=tradeEvents.get(p.pair);if(p.symbol&&cached?.id===p.id&&cached.action===action){previous.p={...previous.p,...p,isOpen:action==='open'};showTradeEvent(publicTradeText(p,action),action,p.long,cached.at,cached.source,p.id,p.pair);}return;}publicNoticeState.delete(p.id);publicNoticeState.set(p.id,{action,p:{...p,isOpen:action==='open'},notified:false});while(publicNoticeState.size>3000)publicNoticeState.delete(publicNoticeState.keys().next().value);
 if(quiet)return;
 if(wallet&&String(p.user||p.raw?.user||'').toLowerCase()===wallet.address.toLowerCase()){
  if(mode==='live'&&(action==='liq'||action==='close'&&Number.isFinite(p.settledNet))){publicNoticeState.get(p.id).notified=true;eventSound(action==='liq'?(p.long?'my-liq-long':'my-liq-short'):closeCue(p.settledNet));}
  return;
 }
 publicNoticeState.get(p.id).notified=true;if(chartPair(p))eventSound('public-'+action+'-'+(p.long?'long':'short'));showTradeEvent(publicTradeText(p,action),action,p.long,Date.now(),'live',p.id,p.pair);
}
function deferPublicClose(p,quiet=false){if(!p||pendingPublicCloses.has(p.id))return;const timer=setTimeout(()=>{pendingPublicCloses.delete(p.id);notifyPublicTrade(p,'close',quiet);},700);pendingPublicCloses.set(p.id,{timer});}
/* Confirmed backend execution envelopes can supply a LIQ reason on any net. */
function applyBackendExecution(msg,net){const values=Array.isArray(msg.value)?msg.value:[msg.value];for(const value of values){const v=value?.args||value?.returnValues||value;if(!v||!['MarketExecuted','LimitExecuted'].includes(value?.event||value?.name||value?.eventName))continue;const tuple=v.t||v.trade,t=Array.isArray(tuple)?Object.fromEntries(['user','index','pairIndex','leverage','long','isOpen','collateralIndex','tradeType','collateralAmount','openPrice','tp','sl','isCounterTrade','positionSizeToken','__placeholder'].map((key,i)=>[key,tuple[i]])):tuple;if(!t?.user||t.pairIndex===undefined||t.openPrice===undefined)continue;if(t.tradeType===undefined||t.collateralAmount===undefined||t.leverage===undefined||typeof t.long!=='boolean')continue;const old=publicTrades.find(p=>p.id===net+':'+t.user.toLowerCase()+':'+N(t.index)),p=sdkPublic({trade:{...t,isOpen:true}},old,net);if(!p)continue;p.raw=t;const open=(value.event||value.name||value.eventName)==='LimitExecuted'?[2,3].includes(N(v.orderType)):v.open===true;p.isOpen=open;p.eventPrice=N(v.marketPrice||v.oraclePrice||0)/1e10;applyPublicChange(p);notifyPublicTrade(p,open?'open':publicAction({event:value.event||value.name||value.eventName,args:v}),quietEvents);}}
/* Current Gains backend sends confirmed history rows as top-level messages. */
function historyPublicTrade(g,net){const action=/^TradeOpened(Market|Limit)$/.test(g.action)?'open':g.action==='TradeClosedLIQ'?'liq':/^TradeClosed(Market|TP|SL)$/.test(g.action)?'close':null;if(!action||!g.address||g.tradeIndex===undefined||typeof g.pair!=='string')return null;const market=TradeConfig.allMarkets().find(m=>m.symbol===g.pair),id=net+':'+String(g.address).toLowerCase()+':'+N(g.tradeIndex),old=publicTrades.find(p=>p.id===id)||publicNoticeState.get(id)?.p;const p={...old,id,user:String(g.address),index:N(g.tradeIndex),net,pair:market?.pairIndex??old?.pair??-1,symbol:g.pair,kind:'public',long:g.long===true||g.long===1||g.long==='1',lev:N(g.leverage)>0?N(g.leverage):old?.lev||0,amount:N(g.size)>0?N(g.size):old?.amount||0,entry:old?.entry>0?old.entry:N(g.price),eventPrice:N(g.price),settledNet:g.pnl_net==null||g.pnl_net===''?NaN:Number(g.pnl_net),isOpen:action==='open'};if(action==='open'&&!(p.lev>0&&p.amount>0&&p.entry>0))return null;return {p,action,at:Date.parse(g.date)};}
function applyBackendHistory(msg,net){const row=historyPublicTrade(msg.value||msg,net);if(!row)return;if(row.p.pair>=0)applyPublicChange(row.p);notifyPublicTrade(row.p,row.action,quietEvents);}
function seedLatestPublicTrade(rows){const seen=new Set();for(const g of [...rows].sort((a,b)=>Date.parse(b.date)-Date.parse(a.date))){const row=historyPublicTrade(g,g.net||'POLYGON');if(!row||row.p.pair<0||seen.has(row.p.pair)||!Number.isFinite(row.at)||row.at>Date.now()+5000||wallet&&row.p.user.toLowerCase()===wallet.address.toLowerCase())continue;seen.add(row.p.pair);const cached=tradeEvents.get(row.p.pair);if(cached&&cached.at>=row.at)continue;showTradeEvent(publicTradeText(row.p,row.action),row.action,row.p.long,row.at,'history',row.p.id,row.p.pair);}restoreSelectedTradeEvent();}

function fresh(p){return Engine.freshQuote(priceOf(p),lastOf(p));}
function liveQuote(p){
  if(!Engine.freshQuote(indexPrices[p],indexTimes[p]))throw Error('Waiting for a fresh Gains index quote for '+marketLabel(p)+'.');
  return indexPrices[p];
}
function orderSize(available){
  const raw=$('dollars').value, percent=$('amount').value==='custom'?Number($('sizeSlider').value):Number($('amount').value);
  if(raw!==''||$('dollars').validity?.badInput){
    const amount=Number(raw);
    if(!/^\d*(?:\.\d{1,6})?$/.test(raw)||!(amount>0)||amount>available||!Number.isFinite(available))throw Error('Enter positive dollar collateral within the available balance, up to six decimals.');
    return {amount,percent:amount/available*100,exact:true};
  }
  return {amount:Engine.collateral(available,percent),percent,exact:false};
}
function orderLeverageValid(lev,market){
  return Number.isFinite(lev)&&lev>=market.minLeverage&&lev<=market.maxLeverage&&Math.abs(lev*1000-Math.round(lev*1000))<1e-7;
}
const collateralLabel=amount=>"$"+amount.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:6});
function renderOrderTicket(){
  const available=mode==='paper'?book.cash:liveBalance,lev=Number($('lev').value);
  const levSlider=$('levSlider');
  levSlider.min=$('lev').min;levSlider.max=$('lev').max;levSlider.step='any';levSlider.value=lev;
  let label,ready=false;
  try{
    const market=TradeConfig.orderMarket(pair,lev),pi=market.pairIndex;
    const {amount,percent,exact}=orderSize(available);
    if(exact||$('amount').value!=='custom')$('sizeSlider').value=percent;
    $('sizeReadout').textContent=collateralLabel(amount)+' · '+percent.toFixed(1)+'%';
    if(!(amount>0)||!orderLeverageValid(lev,market))throw Error('Choose valid collateral and leverage.');
    label='Order '+market.symbol+' · '+(mode==='live'?'Live':'Paper')+' · '+levLabel(lev)+'× · '+collateralLabel(amount)+' collateral · '+money(amount*lev)+' notional';
    const price=mode==='live'?liveQuote(pi):(requireFresh(pi),priceOf(pi));
    const fee=mode==='live'?(Date.now()-marketFees[pi]?.feeAt<120000?marketFees[pi].feePct:NaN):paperCosts(pi,true).fee;
    label+=' · '+(mode==='live'?'Oracle reference ':'Mark reference ')+money(price);
    if(Number.isFinite(fee))label+=' · base fee est. '+feeMoney(amount*lev*fee/100)+'/side';
    else label+=' · base fee unavailable';
    if(mode==='live')label+=' · max slippage '+cfg.maxSlip+'% · POL gas extra';
    if(mode==='paper'||holdingRatesFresh(pi))label+=' · '+holdingEstimate(pi,true,amount,lev)+' · '+holdingEstimate(pi,false,amount,lev);
    ready=mode==='paper'||!!wallet;
    if(!ready)label+=' · Save a Polygon key to trade';
  }catch(e){if(!label)$('sizeReadout').textContent='';label=(label?label+' · ':'')+e.message;}
  $('quote').textContent=label;
  for(const id of ['long','short'])$(id).disabled=mode==='live'&&!ready;
}

function requireFresh(p){if(!fresh(p))throw Error('Price feed stale or disconnected. Wait for a fresh oracle price.');}
let priceRetry=0,publicRetry=0,lastPriceConnect=0,lastPriceFrame=0;
const connectionStreams={PRICE:{label:'Price oracle',state:'idle',lastData:0,retries:0,nextRetry:0,detail:''},POLYGON:{label:'Polygon trades',state:'idle',lastData:0,retries:0,nextRetry:0,detail:''},ARBITRUM:{label:'Arbitrum trades',state:'idle',lastData:0,retries:0,nextRetry:0,detail:''},BASE:{label:'Base trades',state:'idle',lastData:0,retries:0,nextRetry:0,detail:''}},connectionEvents=[];
function noteConnection(key,state,detail='',retryDelay=0){const row=connectionStreams[key];if(!row)return;const now=Date.now(),changed=row.state!==state||row.detail!==detail;row.state=state;row.detail=detail;if(state==='retry'){row.retries++;row.nextRetry=now+retryDelay;}else if(state==='connecting'){row.nextRetry=0;}else if(state==='open'||state==='live'){row.nextRetry=0;}if(changed){connectionEvents.unshift({at:now,key,state,detail});if(connectionEvents.length>32)connectionEvents.length=32;}renderConnectionDiagnostics();}
function touchConnection(key){const row=connectionStreams[key];if(!row)return;row.lastData=Date.now();row.retries=0;row.nextRetry=0;if(row.state!=='live')noteConnection(key,'live','valid data');else renderConnectionDiagnostics();}
function connectionAge(at,now=Date.now()){if(!at)return 'no valid data yet';const seconds=Math.max(0,Math.floor((now-at)/1000));return seconds<60?seconds+'s ago':seconds<3600?Math.floor(seconds/60)+'m ago':Math.floor(seconds/3600)+'h ago';}
function renderConnectionDiagnostics(){let panel;try{panel=$('connectionDiagnostics');}catch{return}if(!panel||panel.closest?.('[hidden]'))return;const now=Date.now(),rows=$('connectionRows'),log=$('connectionLog');if(rows)rows.innerHTML=Object.entries(connectionStreams).map(([key,row])=>{const wait=row.nextRetry>now?' · retry in '+Math.max(1,Math.ceil((row.nextRetry-now)/1000))+'s':'';return `<div class="connection-row"><b>${row.label}</b><span class="connection-${row.state}">${row.state}</span><small>last data ${connectionAge(row.lastData,now)}${row.retries?' · retries '+row.retries:''}${wait}</small></div>`;}).join('');if(log)log.textContent=connectionEvents.map(e=>new Date(e.at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'})+' · '+connectionStreams[e.key].label+' · '+e.state+(e.detail?' · '+e.detail:'')).join('\n')||'No connection events recorded yet.';}
function connectPrices(){lastPriceConnect=Date.now();let generation=++wsGeneration;noteConnection('PRICE','connecting','opening socket');try{if(socket)socket.close();}catch{}try{renderSyncStatus();}catch{}let s;try{s=new WebSocket('wss://backend-pricing.eu.gains.trade/v4');}catch(e){try{renderSyncStatus();}catch{}const d=Math.min(30000,2500*Math.pow(2,priceRetry++));noteConnection('PRICE','retry','socket blocked',d);setTimeout(()=>{if(generation===wsGeneration)connectPrices()},d);return;}socket=s;socket.onopen=()=>{if(generation===wsGeneration)noteConnection('PRICE','open','waiting for valid frame');};socket.onmessage=e=>{if(generation!==wsGeneration)return;try{if(window.Feed&&Feed.acceptPriceFrame)Feed.acceptPriceFrame(e.data);rxBytes+=e.data.length;rxWindow+=e.data.length;const v=Engine.parseV4(e.data);let stamp=v.t;if(stamp>=1e9&&stamp<1e12)stamp*=1000;const received=Date.now();if(stamp&&!Engine.freshQuote(1,stamp,received))return;let accepted=false;for(const [i,p]of v.index){if(stamp&&stamp<(indexTimes[i]||0))continue;indexPrices[i]=p;indexTimes[i]=stamp||received;accepted=true;}for(const [i,v2]of v.mark){if(stamp&&stamp<lastOf(i))continue;setPrice(i,v2,stamp||received);checkLiquidations(i);accepted=true}if(accepted){lastPriceFrame=received;priceRetry=0;touchConnection('PRICE')}}catch{}};socket.onerror=()=>{try{renderSyncStatus();}catch{}};socket.onclose=()=>{if(generation===wsGeneration){try{renderSyncStatus();}catch{}const d=Math.min(30000,2500*Math.pow(2,priceRetry++));noteConnection('PRICE','retry','socket closed',d);setTimeout(()=>{if(generation===wsGeneration)connectPrices()},d)}}}
function paperDelayMs(random=Math.random){return random()<.05?30000:3000+Math.floor(random()*7001)}
function paperPendingFor(positionId,action){return (book.pending||[]).find(q=>q.positionId===positionId&&q.action===action)}
function queueBrowserClose(p,reason='Closed',now=Date.now()){if(!Array.isArray(book.pending))book.pending=[];let q=paperPendingFor(p.id,'close');if(q){if(reason==='Liquidated'){q.reason=reason;p.status='Liquidated triggered · pending execution';persist()}return q}q={id:'q'+now+Math.random().toString(16).slice(2),action:'close',positionId:p.id,pair:p.pair,reason,submitted:now,due:now+paperDelayMs()};book.pending.push(q);p.status=reason+' triggered · pending execution';persist();return q}
function processBrowserPaper(now=Date.now()){if(window.Feed||!book.pending?.length)return;const next=[];let changed=false;for(const q of book.pending){if(q.due>now||!fresh(q.pair)){next.push(q);continue}changed=true;const px=priceOf(q.pair);if(q.action==='open'){const p=Engine.open(q.pair,q.long,q.amount,q.lev,px,q.cost,now);p.id=q.positionId;p.status='Paper open · delayed fill';if(Engine.value(p,px,now).net<=-q.amount*q.cost.liq/100)book.cash+=q.amount;else{book.positions.push(p);eventSound(q.long?'my-long':'my-short');pushEvent(`${q.long?'L':'S'} ${levLabel(q.lev)}× ${cashLabel(q.amount)} delayed fill`,q.long?'long':'short')}}else{const p=book.positions.find(x=>x.id===q.positionId);if(p){const settlement=Engine.settle(p,px,now),closed={...p,net:settlement.net,settlement,closed:now,exit:px,status:q.reason||'Closed'};book.cash+=settlement.payout;book.positions=book.positions.filter(x=>x.id!==p.id);book.history.unshift(closed);book.history=book.history.slice(0,200);eventSound(q.reason==='Liquidated'?(p.long?'my-liq-long':'my-liq-short'):closeCue(settlement.net));pushEvent(`${q.reason==='Liquidated'?'LIQ':'CLOSE'} ${p.long?'L':'S'} ${levLabel(p.lev)}× delayed fill`,'liq');showPaperClose(closed,q.reason)}}}if(changed){book.pending=next;persist()}}
function closeCue(net){return net>0?'my-close-win':net<0?'my-close-loss':'my-close';}
function paperCloseCue(p){return p.status==='Liquidated'?(p.long?'my-liq-long':'my-liq-short'):closeCue(p.net);}
function checkLiquidations(i){
 if(window.Feed)return;
 const price=priceOf(i),now=lastOf(i);
 for(const p of book.positions){
  if(p.pair!==i)continue;
  if(Engine.value(p,price).net<=-p.amount*p.cost.liq/100){queueBrowserClose(p,'Liquidated');continue;}
  if(!p.exits||paperPendingFor(p.id,'close'))continue;
  const before=JSON.stringify(p.exits),reason=evaluateExit(p,price,now);
  if(reason)queueBrowserClose(p,reason);
  else if(before!==JSON.stringify(p.exits))persist();
 }
}
function trailingStop(best,percent,direction){return best*(1-direction*percent/100);}
function evaluateExit(p,price,now){
 const e=p.exits,d=p.long?1:-1;
 if(e.tp&&d*(price-e.tp)>=0)return 'Take profit';
 if(e.sl&&d*(price-e.sl)<=0)return 'Stop loss';
 if(e.trail){
  e.best=p.long?Math.max(e.best,price):Math.min(e.best,price);
  if(d*(price-trailingStop(e.best,e.trail,d))<=0)return 'Trailing exit';
 }
 if(e.atr){
  if(e.chandelier&&d*(price-e.chandelier)<=0)return 'Chandelier exit';
  const bars=candlesOf(p.pair).filter(c=>c.t<Math.floor(now/60000)*60000).slice(-15);
  if(bars.length!==15||bars.at(-1).t!==Math.floor(now/60000)*60000-60000||bars.some((c,i)=>c.source==='gap-fill'||i&&c.t-bars[i-1].t!==60000))return null;
  let range=0,extreme=bars[1][p.long?'h':'l'];
  for(let i=1;i<bars.length;i++){const c=bars[i],prev=bars[i-1].c;range+=Math.max(c.h-c.l,Math.abs(c.h-prev),Math.abs(c.l-prev));extreme=p.long?Math.max(extreme,c.h):Math.min(extreme,c.l);}
  const stop=extreme-d*e.atr*range/14;
  if(range>0&&stop>0){e.chandelier=e.chandelier?(p.long?Math.max(e.chandelier,stop):Math.min(e.chandelier,stop)):stop;if(d*(price-e.chandelier)<=0)return 'Chandelier exit';}
 }
 return null;
}
function loadLiveExitRules(){
 try{const entries=JSON.parse(localStorage.getItem('liveExitRules')||'[]');return new Map(entries);}catch{return new Map();}
}
const liveExitRules=loadLiveExitRules();
function saveLiveExitRules(){localStorage.setItem('liveExitRules',JSON.stringify([...liveExitRules]));}
let liveExitPollAt=0;
function checkLiveExits(){
 const now=Date.now();
 if(mode!=='live'||document.hidden||busy||!wallet||!liveExitRules.size||now-liveExitPollAt<500)return;
 liveExitPollAt=now;
 for(const p of livePositions){
  const e=liveExitRules.get(p.id);
  if(!e||e.triggered||p.user.toLowerCase()!==wallet.address.toLowerCase()||!fresh(p.pair))continue;
  let quote;try{quote=liveQuote(p.pair);}catch{continue;}
  const before=JSON.stringify(e),reason=evaluateExit({...p,exits:e},quote,indexTimes[p.pair]);
  if(reason){
   if(pending.some(x=>x.owner===wallet.address&&/Sending|Pending|uncertain|Order resolved/.test(x.status)))continue;
   e.triggered=reason;
   saveLiveExitRules();
   toast(reason+' triggered · submitting live close');
   void closeLive(p,true,false);
   break;
  }
  if(before!==JSON.stringify(e))saveLiveExitRules();
 }
}
function editExits(p){
 const dialog=$('exitRules'),paper=p.kind==='paper',current=(paper?p.exits:liveExitRules.get(p.id))||{};
 $('exitMarket').textContent=marketLabel(p.pair)+' · '+(p.long?'Long':'Short');
 $('exitLocal').hidden=false;
 $('exitTP').value=(paper?current.tp:Number(p.raw?.tp||0)/1e10)||'';
 $('exitSL').value=(paper?current.sl:Number(p.raw?.sl||0)/1e10)||'';
 $('exitTrail').value=current.trail||'';$('exitATR').value=current.atr||'';
 $('savePaperExits').hidden=!paper;$('saveLiveTrail').hidden=paper;$('saveLiveTP').hidden=paper;$('saveLiveSL').hidden=paper;
 $('exitStatus').textContent=paper?'Paper exits use fresh quotes and the existing simulated fill delay.':'Fixed exits are sent to Gains. Trailing and Chandelier exits only run while TwinTrade is visible and connected.'+(current.triggered?' Last trigger: '+current.triggered+'. Save to rearm.':'');
 $('exitForm').onsubmit=event=>event.preventDefault();
 $('savePaperExits').onclick=()=>{
  try{
   const exits={tp:+$('exitTP').value,sl:+$('exitSL').value,trail:+$('exitTrail').value,atr:+$('exitATR').value};
   const px=priceOf(p.pair),d=p.long?1:-1;
   requireFresh(p.pair);
   if(Object.values(exits).some(v=>!Number.isFinite(v)||v<0)||exits.trail>=100||exits.atr>100)throw Error('Check the prices, trailing percentage and ATR multiplier.');
   if(exits.tp&&d*(exits.tp-px)<=0||exits.sl&&d*(exits.sl-px)>=0)throw Error('Take profit and stop loss must be on opposite sides of the current price.');
   if(window.Feed){const result=Feed.setExits(p.id,JSON.stringify(exits));if(result!=='OK')throw Error(result);syncNative();}
   else{const open=book.positions.find(x=>x.id===p.id);if(!open||paperPendingFor(p.id,'close'))throw Error('Position is already closing.');open.exits={...exits,best:current.trail===exits.trail&&current.best||px,chandelier:current.atr===exits.atr&&current.chandelier||0};persist();}
   dialog.close();render();
  }catch(e){$('exitStatus').textContent=e.message;}
 };
 $('saveLiveTrail').onclick=()=>{
  try{
   const trail=+$('exitTrail').value,atr=+$('exitATR').value;
   if(!Number.isFinite(trail)||trail<0||trail>=100||!Number.isFinite(atr)||atr<0||atr>100)throw Error('Check the trailing percentage and ATR multiplier.');
   if(trail||atr){
    const price=liveQuote(p.pair);
    if(!confirm('Enable an automatic LIVE market close for position '+p.index+' while TwinTrade is visible and connected?'))return;
    liveExitRules.set(p.id,{tp:0,sl:0,trail,atr,best:current.trail===trail&&current.best||price,chandelier:current.atr===atr&&current.chandelier||0});
   }else liveExitRules.delete(p.id);
   saveLiveExitRules();
   dialog.close();
   draw();
  }catch(e){$('exitStatus').textContent=e.message;}
 };
 $('saveLiveTP').onclick=()=>saveLiveExit(p,'TP');
 $('saveLiveSL').onclick=()=>saveLiveExit(p,'SL');
 dialog.showModal();
}
async function saveLiveExit(p,kind){
 if(busy)return;
 const value=+$('exit'+kind).value,method=kind==='TP'?'updateTp':'updateSl',owner=wallet?.address;
 if(!Number.isFinite(value)||value<0||!owner||owner.toLowerCase()!==p.user.toLowerCase())return;
 if(!confirm((value?'Set '+kind+' to '+value:'Clear '+kind)+' for LIVE position '+p.index+' on Polygon?'))return;
 busy=true;
 try{
  const c=await chain();
  if(wallet?.address!==owner||!livePositions.some(x=>x.id===p.id))throw Error('Position or wallet changed.');
  const signer=c.connect(wallet.connect(provider));
  const args=[p.index,priceUnit(value)];
  await signer.callStatic[method](...args);
  const tx=await signer[method](...args,await polygonFeeOverrides(provider));
  await waitReceipt(tx);
  $('exitStatus').textContent=kind+' confirmed on Polygon.';
  await refreshWallet();
 }catch(e){$('exitStatus').textContent=e.reason||e.message;}
 finally{busy=false;}
}
function paperReceipt(p){if(p?.settlement)return p.settlement;if(p?.kind==='paper'&&p.closed&&p.exit>0){const r=Engine.settle(p,p.exit,p.closed);return {...r,net:p.net,payout:Math.max(0,p.amount+p.net)};}return null;}
function paperReceiptText(p){const r=paperReceipt(p);if(!r)return '';return `Price P&L ${fmtPnl(r.gross)} · Open fee ${money(r.openFee)} · Close fee ${money(r.closeFee)} · Hold ${r.hold<0?'gain':'loss'} ${money(Math.abs(r.hold))} included in net${r.lossLimitAdjustment>0?' · Loss capped at collateral':''} · Net ${fmtPnl(r.net)} · Returned ${money(r.payout)}`;}
let closeReceipts=[],bulkCloseBusy=false;
function renderSettlementDialog(status=''){const d=$('settlementDialog');$('settlementStatus').textContent=status||'Costs shown below are already included in net P&L. Paper amounts use the position’s saved cost assumptions.';let totalNet=0,totalReturned=0,allKnown=mode==='paper';$('settlementRows').innerHTML=closeReceipts.map(p=>{const r=paperReceipt(p);if(!r){allKnown=false;return `<article><b>${esc(marketLabel(p.pair))} ${p.long?'L':'S'} · ${esc(p.status||'Close submitted')}</b><p>Live cost breakdown is unavailable here. Check confirmed trade history; fee and returned-collateral amounts are not assumed.</p></article>`;}totalNet+=r.net;totalReturned+=r.payout;const row=(k,v,cls='')=>`<dt>${k}</dt><dd class="${cls}">${v}</dd>`;return `<article><b>${esc(marketLabel(p.pair))} ${p.long?'L':'S'} ${levLabel(p.lev)}× · ${esc(p.status||'Closed')}</b><dl>${row('Collateral',money(p.amount))}${row('Entry price',money(p.entry))}${row('Exit price',money(p.exit))}${row('Price P&L (after spread)',fmtPnl(r.gross),r.gross>=0?'positive':'negative')}${row('Opening fee deducted',money(r.openFee),'negative')}${row('Closing fee deducted',money(r.closeFee),'negative')}${row(r.hold<0?'Holding credit added':'Holding cost deducted',feeMoney(r.hold),r.hold<0?'positive':'negative')}${Number.isFinite(r.borrow)?row('Borrowing component (included above)',feeMoney(r.borrow),'negative'):''}${Number.isFinite(r.funding)?row('Funding component (included above)',feeMoney(r.funding)+(r.funding<0?' earned':' paid'),r.funding<0?'positive':'negative'):''}${r.lossLimitAdjustment>0?row('Loss limit adjustment',money(r.lossLimitAdjustment)):''}${row('Net P&L',fmtPnl(r.net),r.net>=0?'positive':'negative')}${row('Cash returned',money(r.payout))}</dl><small>Price P&L − opening fee − closing fee − holding cost = net P&L. A holding credit adds to net. Collateral + net P&L = cash returned; paper losses are capped at collateral.</small></article>`;}).join('');$('settlementTotal').textContent=allKnown?`Total net ${fmtPnl(totalNet)} · Total returned ${money(totalReturned)} · Available ${money(book.cash)}`:'Live cash return and costs will appear when settlement is confirmed.';if(!d.open)d.showModal();}
function showPaperClose(p,reason){if(!p)return;const d=$('settlementDialog');if(!d.open)closeReceipts=[];if(!closeReceipts.some(x=>x.id===p.id))closeReceipts.push(p);renderSettlementDialog();}
async function closeMany(side=null,scope='all'){
 if(bulkCloseBusy||busy)return;
 const batch={mode,wallet,rpc:cfg.rpc,eventRpc:cfg.eventRpc};
 const sameContext=()=>mode===batch.mode&&wallet===batch.wallet&&cfg.rpc===batch.rpc&&cfg.eventRpc===batch.eventRpc;
 const rows=(batch.mode==='paper'?book.positions:livePositions).filter(p=>(side===null||p.long===side)&&(scope!=='current'||chartPair(p))).map(p=>({...p}));
 if(!rows.length){toast('No matching open positions.');return;}
 if(batch.mode==='live'&&!confirm(`Close ${rows.length} LIVE ${side===null?'positions':side?'longs':'shorts'} ${scope==='current'?'in '+marketLabel(pair):'across all coins'}? Orders are sent one at a time and wait for oracle confirmation.`))return;
 bulkCloseBusy=true;closeReceipts=[];const errors=[];
 try{
  for(const p of rows){
   if(!sameContext()){errors.push('Wallet, mode or node changed; remaining orders were not sent');break;}
   if(batch.mode==='paper'){try{closePaper(p,'Closed',true);}catch(e){errors.push(`${marketLabel(p.pair)}: ${e.message}`);}}
   else{
    renderSettlementDialog(`Closing live position ${p.index} · remaining ${rows.length-closeReceipts.length}`);
    if(!await closeLive(p,true)){errors.push(`Position ${p.index}: close was not submitted`);break;}
    const until=Date.now()+120000;let settled=false;
    while(Date.now()<until&&sameContext()){
     const synced=await refreshWallet();
     if(!sameContext())break;
     if(synced===true&&!livePositions.some(x=>x.id===p.id)&&!pending.some(x=>x.owner===batch.wallet.address&&/Sending|Pending|uncertain|Order resolved/.test(x.status))){settled=true;break;}
     await sleep(1000);
    }
    const result=liveHistory.find(x=>x.id===p.id&&x.owner===batch.wallet.address)||{...p,status:'Close pending · confirm in history'};
    closeReceipts.push(result);
    if(!sameContext()){errors.push('Wallet, mode or node changed; remaining orders were not sent');break;}
    if(!settled){errors.push(`Position ${p.index}: still pending; remaining orders were not sent`);break;}
   }
  }
  if(batch.mode==='paper'&&!closeReceipts.length){const queued=rows.length-errors.length;toast((queued?queued+' paper close'+(queued===1?'':'s')+' queued with independent sampled delays. ':'')+(errors.length?'Not queued: '+errors.join(' · '):'Execution-time prices will be used.'));}else renderSettlementDialog(errors.length?'Some positions were not closed: '+errors.join(' · '):batch.mode==='paper'?'Close completed. Costs below are included in net; no further deduction is due.':'Live close requests completed. Check confirmed history for settlement costs.');render();
 }finally{bulkCloseBusy=false;render();}
}
try{$('dismissSettlement').onclick=()=>{$('settlementDialog').close();closeReceipts=[];};$('dismissCloseMenu').onclick=()=>$('closeMenuDialog').close();$('closeMenu').onclick=()=>{const rows=mode==='paper'?book.positions:livePositions;$('closeCurrentLabel').textContent='Current coin · '+marketLabel(pair);for(const [id,side,scope] of [['closeAll',null,'all'],['closeLongs',true,'all'],['closeShorts',false,'all'],['closeCurrentAll',null,'current'],['closeCurrentLongs',true,'current'],['closeCurrentShorts',false,'current']]){$(id).disabled=bulkCloseBusy||!rows.some(p=>(side===null||p.long===side)&&(scope!=='current'||chartPair(p)));}if(!$('closeMenuDialog').open)$('closeMenuDialog').showModal();};for(const [id,side,scope] of [['closeAll',null,'all'],['closeLongs',true,'all'],['closeShorts',false,'all'],['closeCurrentAll',null,'current'],['closeCurrentLongs',true,'current'],['closeCurrentShorts',false,'current']])$(id).onclick=()=>{$('closeMenuDialog').close();return closeMany(side,scope);};}catch{}

function closeRequestCue(net){if(net>0)eventSound('close-request-win');else if(net<0)eventSound('close-request-loss');}
function closePaper(p,reason='Closed',silent){if(!book.positions.some(x=>x.id===p.id))throw Error('Position already closed');requireFresh(p.pair);const net=Engine.settle(p,priceOf(p.pair),Date.now()).net;if(window.Feed){const result=Feed.close(p.id);if(!result.startsWith('PENDING:'))throw Error(result);closeRequestCue(net);book=JSON.parse(Feed.paper());persist();toast('Paper close pending · fills at the market price when its sampled delay expires');return}const q=queueBrowserClose(p,reason);closeRequestCue(net);processBrowserPaper(q.submitted);toast('Paper close pending · fills at the market price when its sampled delay expires')}

let clusterCache={};
function clusteredPublic(list){const key=[pair,selectedPublic,statsRevision,clusterOn,list.length].join(':');if(clusterCache.key===key)return clusterCache.value;if(!clusterOn)return {singles:list,groups:[]};try{const value=Engine.clusterEntries(list.filter(p=>p.isOpen),0.12);clusterCache={key,value};return value;}catch{return {singles:list,groups:[]};}}
let loadingPair=-1;
function pnlPercentText(v){return Number.isFinite(v)?(v>0?'+':'')+v.toFixed(2)+'%':'—';}
function renderProfile(){const dialog=$('profileDialog');if(!dialog?.open)return;const rows=mode==='paper'?book.history:liveHistory.filter(p=>wallet&&p.owner?.toLowerCase()===wallet.address.toLowerCase()),s=TradePerformance.calculate(rows,{days:+$('profileRange').value||0}),num=v=>Number.isFinite(v)?v.toFixed(2):'—';$('profileScope').textContent=mode.toUpperCase()+' · '+s.count+' settled trades · '+s.excluded+' missing settlements excluded · '+s.returnCount+' trades with known collateral for ratios · all markets';const cards=[['Net P&L',money(s.net)],['Trades',s.count],['Wins / losses',s.wins+' / '+s.losses],['Breakeven',s.breakeven],['Win rate',pnlPercentText(s.winRate)],['Profit factor',num(s.profitFactor)],['Sharpe · per trade',num(s.sharpe)],['Sortino · per trade',num(s.sortino)],['Max drawdown',money(s.maxDrawdown)],['Expectancy / trade',money(s.expectancy)],['Average win',money(s.averageWin)],['Average loss',money(s.averageLoss)],['Best trade',money(s.best)],['Worst trade',money(s.worst)],['Average return',pnlPercentText(s.averageReturn)],['Longest win / loss streak',s.maxWins+' / '+s.maxLosses],['Long / short trades',s.longs+' / '+s.shorts],['Average holding time',Number.isFinite(s.averageHold)?(s.averageHold/3600000).toFixed(2)+' h':'—']];setHTML('profileStats',cards.map(([label,value])=>'<div><small>'+label+'</small><b>'+value+'</b></div>').join(''));if(!s.count){setHTML('profileChart','<p class="muted">No settled trades in this range yet. Close a trade to begin your P&L chart.</p>');return;}const values=s.curve.map(p=>p.net),lo=Math.min(0,...values),hi=Math.max(0,...values),span=hi-lo||1,x=i=>46+i/(s.curve.length-1)*340,y=n=>150-(n-lo)/span*120,path=s.curve.map((p,i)=>(i?'L':'M')+x(i).toFixed(2)+','+y(p.net).toFixed(2)).join(' '),color=s.net>=0?'#10d49b':'#ff5979';setHTML('profileChart',`<svg viewBox="0 0 400 180" role="img" aria-label="Cumulative closed-trade net P&L ${s.net.toFixed(2)} dollars"><line x1="46" x2="386" y1="${y(0)}" y2="${y(0)}" stroke="#657489" stroke-dasharray="3 3"/><path d="${path}" fill="none" stroke="${color}" stroke-width="2.5"/><text x="2" y="25" fill="#a9b5c6" font-size="10">${hi.toFixed(2)}</text><text x="2" y="150" fill="#a9b5c6" font-size="10">${lo.toFixed(2)}</text><text x="46" y="173" fill="#a9b5c6" font-size="10">Trade 0</text><text x="386" y="173" text-anchor="end" fill="#a9b5c6" font-size="10">Trade ${s.count}</text></svg>`);}
async function refreshProfile(){renderProfile();if(mode==='live'){await loadAccountHistory();renderProfile();}}
try{$('profileOpen').onclick=()=>{$('profileDialog').showModal();refreshProfile();};$('closeProfile').onclick=()=>$('profileDialog').close();$('profileRange').onchange=renderProfile;$('refreshProfile').onclick=refreshProfile;}catch{}
function renderAccountMetrics(ps,net){const metrics=Engine.accountSummary(mode==='paper'?book.cash:liveBalance,ps,mode==='paper'?book.pending:[],net);for(const [id,v] of [['netBalancePct',metrics.balancePercent],['netMarginPct',metrics.marginPercent]]){const el=$(id);if(el){el.textContent=pnlPercentText(v);el.className=!Number.isFinite(v)?'muted':v>0?'positive':v<0?'negative':'';}}if($('activeMargin'))$('activeMargin').textContent=money(metrics.margin);if($('openTradeCount'))$('openTradeCount').textContent=String(metrics.trades);}
function renderPositionPnl(ps){const groups=Engine.pnlTotals(ps.filter(p=>p.isOpen!==false&&chartPair(p)).map(p=>({long:p.long,amount:p.amount,net:!refPrice(p.pair)?NaN:p.kind==='paper'?Engine.value(p,refPrice(p.pair)).net:liveValue(p)})));const el=$('positionPnlSummary');if(!el)return;el.hidden=history;setHTML('positionPnlSummary',Object.entries(groups).map(([side,g])=>`<span>${side==='both'?'Total':side==='long'?'Long':'Short'} net <b class="${!Number.isFinite(g.percent)?'muted':g.percent>=0?'positive':'negative'}">${pnlPercentText(g.percent)}</b></span>`).join(''));}
function setupRowToggles(){
  if(!document.body?.classList)return;
  const defaults=['Chart','Positions','Ticket'];
  const groups={
    Chart:{ids:['chartRow','feesbar','chartwrap'],body:'chartwrap',label:'chart'},
    Positions:{ids:['positionsRow','positionPnlSummary','positions'],body:'positions',label:'positions'},
    Ticket:{ids:['ticketRow'],body:'ticketBody',label:'order ticket'}
  };
  const saved=load('terminalLayout',{})||{};
  const collapsed={...load('collapsedRows',{}),...saved.collapsed};
  const sizes={...saved.sizes};
  const order=Array.isArray(saved.order)?[...new Set(saved.order.filter(key=>defaults.includes(key)))]:[];
  for(const key of defaults)if(!order.includes(key))order.push(key);
  const wide=()=>matchMedia('(min-width:640px) and (max-height:500px)').matches;
  const save=()=>{try{localStorage.setItem('terminalLayout',JSON.stringify({collapsed,sizes,order}));}catch{}};
  const arrange=()=>{
    order.forEach((key,index)=>groups[key].ids.forEach((id,offset)=>$(id).style.order=10+index*4+offset));
    draw();
  };
  const applySizes=()=>{
    for(const key of ['Chart','Positions','Ticket','TicketWidth']){
      const attr='--terminal-'+key.toLowerCase();
      $('layoutSize'+key).value=Number.isFinite(sizes[key])?sizes[key]:'';
      document.body.classList.toggle(key.toLowerCase()+'-sized',Number.isFinite(sizes[key]));
      if(Number.isFinite(sizes[key]))document.body.style.setProperty(attr,Math.max(0,sizes[key])+'px');
      else document.body.style.removeProperty(attr);
    }
    draw();
  };
  function wireGrip(element,update,start,isMove=false){
    let drag;
    element.onpointerdown=e=>{
      if(e.button!==0||(!isMove&&element.disabled))return;
      drag=start(e);
      element.setPointerCapture(e.pointerId);
      e.preventDefault();
    };
    element.onpointermove=e=>{if(drag&&element.hasPointerCapture(e.pointerId))update(drag,e);};
    element.onlostpointercapture=()=>{if(drag){drag=null;save();}};
    element.onkeydown=e=>{
      if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;
      const step=['ArrowDown','ArrowRight'].includes(e.key)?24:-24;
      update(start({clientX:0,clientY:0}),{clientX:step,clientY:step,step});save();e.preventDefault();
    };
  }
  for(const key of defaults){
    const {ids,body,label}=groups[key],button=$('toggle'+key),resize=$('resize'+key),move=$('move'+key);
    const apply=()=>{
      const hidden=collapsed[key]===true;
      $(body).hidden=hidden;
      button.textContent=hidden?'+':'−';
      button.setAttribute('aria-expanded',String(!hidden));
      button.setAttribute('aria-label',(hidden?'Expand ':'Collapse ')+label);
      resize.disabled=hidden;
      document.body.classList.toggle(key.toLowerCase()+'-collapsed',hidden);
    };
    apply();
    button.onclick=()=>{collapsed[key]=!collapsed[key];save();apply();draw();};
    wireGrip(resize,(drag,e)=>{
      const delta=drag.horizontal?drag.x-e.clientX:e.clientY-drag.y;
      const bound=drag.horizontal?innerWidth*.55:innerHeight*.65;
      sizes[drag.key]=Math.round(Math.max(drag.minimum,Math.min(bound,drag.size+delta*drag.direction)));
      applySizes();
    },e=>{
      const horizontal=wide()&&key==='Ticket';
      const box=$(key==='Ticket'?'ticketRow':body).getBoundingClientRect();
      const chartSharesPositions=wide()&&key==='Chart';
      const size=chartSharesPositions?$('positions').getBoundingClientRect().height:horizontal?box.width:box.height;
      return {horizontal,x:e.clientX,y:e.clientY,size,key:horizontal?'TicketWidth':chartSharesPositions?'Positions':key,direction:chartSharesPositions?-1:1,minimum:horizontal?190:key==='Positions'||chartSharesPositions?24:key==='Chart'?45:80};
    });
    wireGrip(move,(drag,e)=>{
      if(wide())return;
      const current=order.indexOf(key);
      const direction=e.step?Math.sign(e.step):Math.sign(e.clientY-drag.previousY);
      drag.previousY=e.clientY;
      const target=e.step?current+Math.sign(e.step):order.findIndex(candidate=>{
        const box=$(groups[candidate].ids[0]).getBoundingClientRect();
        return Math.abs(e.clientY-(box.top+box.height/2))<=Math.max(18,box.height/2);
      });
      if(target<0||target>=order.length||Math.sign(target-current)!==direction||!direction)return;
      order.splice(current,1);order.splice(target,0,key);arrange();
    },e=>({previousY:e.clientY}),true);
  }
  for(const key of ['Chart','Positions','Ticket','TicketWidth']){
    const input=$('layoutSize'+key);
    input.onchange=()=>{
      if(input.value&&input.checkValidity())sizes[key]=Number(input.value);
      else if(!input.value)delete sizes[key];
      save();applySizes();
    };
  }
  $('resetTerminalLayout').onclick=()=>{
    for(const key of Object.keys(sizes))delete sizes[key];
    order.splice(0,order.length,...defaults);save();arrange();applySizes();
  };
  arrange();applySizes();
}
function render(){renderRatios();if(loadingPair!==pair){loadingPair=pair;restoreSelectedTradeEvent();paintLoading();}syncNative();processBrowserPaper();checkLiveExits();syncLeverage();const price=priceOf(pair);try{
$('respawn').hidden=mode!=='paper';$('market').textContent=marketLabel(pair);$('price').textContent=money(price||NaN);if(price>0&&lastFlashPrice>0&&price!==lastFlashPrice){try{const el=$('price');el.className=price>lastFlashPrice?'pop-up':'pop-down';clearTimeout(flashTimer);flashTimer=setTimeout(()=>{try{el.className='';}catch{}},280);}catch{}}if(price>0)lastFlashPrice=price;$('empty').hidden=!!candlesOf(pair).length;$('mode').textContent=mode==='paper'?'PAPER':'LIVE · POLYGON';renderSyncStatus();
$('kbps').textContent=lastKbps.toFixed(1)+' KB/s';$('livedot').className=fresh(pair)?'on':'';
$('mute').textContent=(soundOn||tickOn)?'🔊':'🔇';renderAudioStatus();
}catch{}
try{$('balance').textContent=cashLabel(mode==='paper'?book.cash:liveBalance);}catch{}
try{$('closeMenu').hidden=history||!(mode==='paper'?book.positions:livePositions).length;}catch{}
let ps=mode==='paper'?book.positions:livePositions,net=0,unknownNet=false;for(const p of ps){if(!priceOf(p.pair)){unknownNet=true;continue}const v=p.kind==='paper'?Engine.value(p,priceOf(p.pair)).net:liveValue(p);if(Number.isFinite(v))net+=v;else unknownNet=true}if(unknownNet)net=NaN;
renderAccountMetrics(ps,net);
try{$('net').textContent=money(net);$('net').className=net>=0?'positive':'negative';$('positionsTab').className=history?'':'active';$('historyTab').className=history?'active':'';}catch{}
renderPositionPnl(ps);
let list=history?(mode==='paper'?book.history:liveHistory.filter(p=>wallet&&p.owner?.toLowerCase()===wallet.address.toLowerCase())):ps;let html='';if(!history&&mode==='live')for(const p of pending.filter(x=>wallet&&x.owner===wallet.address&&!x.dismissed))html+=`<div class="position">${esc(p.label)} <b>${esc(p.status)}</b>${canDismissOrder(p)?`<button data-dismiss-order="${esc(p.id)}" aria-label="Dismiss order error">×</button>`:''}<small>${esc(p.error||p.hash||'')}</small></div>`;if(!history&&mode==='paper')for(const q of book.pending||[]){const seconds=Math.max(0,Math.ceil((q.due-Date.now())/1000));html+=`<div class="position"><b>${q.action==='open'?(q.long?'L':'S'):'CLOSE'}</b><span>${q.lev?levLabel(q.lev)+'×':''}</span><span>${q.amount?cashLabel(q.amount):''}</span><b>${seconds}s</b><small>Paper ${esc(q.action)} pending · sampled once · fills at available execution-time market price${q.reason?' · '+esc(q.reason):''}</small></div>`;}
for(const p of list.filter(chartPair)){let v=history?p.net:p.kind==='paper'?Engine.value(p,refPrice(p.pair)||p.entry).net:liveValue(p);let cost=p.kind==='paper'?(history?paperReceipt(p):Engine.value(p,refPrice(p.pair)||p.entry)):null;const holdCls=cost?(cost.hold>0.0000005?'negative':cost.hold<-0.0000005?'positive':''):((p.holdingTime||p.feeTime)&&liveHolding(p)>0.0000005?'negative':(p.holdingTime||p.feeTime)&&liveHolding(p)<-0.0000005?'positive':'');const holdTxt=cost?`Hold ${cost.hold<0?'gain':'loss'} <b class="${holdCls}">${feeMoney(cost.hold)}</b> (${Math.abs(cost.holdRate).toFixed(6)}% notional/h · ${money(Math.abs(p.amount*p.lev*cost.holdRate/100))}/h ${cost.holdRate<0?'earned':'paid'}) · Borrow <b class="negative">${feeMoney(cost.borrow)}</b> · Funding <b class="${cost.funding<0?'positive':'negative'}">${feeMoney(cost.funding)}</b> ${cost.funding<0?'earned':'paid'}`:(p.holdingTime||p.feeTime)?`Hold ${Number.isFinite(liveHolding(p))?(liveHolding(p)<0?'gain':'loss'):'unavailable'} <b class="${holdCls}">${feeMoney(liveHolding(p))}</b> · Borrow <b class="${(p.borrow||0)>0.0000005?'negative':(p.borrow||0)<-0.0000005?'positive':''}">${feeMoney(p.borrow)}</b> · Funding <b class="${(p.funding||0)>0.0000005?'negative':(p.funding||0)<-0.0000005?'positive':''}">${feeMoney(p.funding)}</b> ${p.funding<0?'earned':'paid'}`:'';html+=`<div class="position"><b class="${p.long?'long':'short'}">${p.long?'L':'S'}</b><span>${levLabel(p.lev)}×</span><span>${cashLabel(p.amount)}</span><b class="${v>=0?'positive':'negative'}">${money(v)} <small>(${pnlPercentText(Engine.pnlPercent(v,p.amount))})</small></b>${!history?`<button data-exits="${esc(p.id)}">Exits</button><button data-close="${esc(p.id)}">×</button>`:''}<small>${p.pair===300&&pair===0?'BTCDEGEN · ':''}${esc(p.status)} · Entry ${money(p.entry)}${history&&p.kind==='paper'?' · '+esc(paperReceiptText(p)):cost?' · Open fee '+money(cost.openFee)+' · Close est. '+money(cost.closeFee)+' · '+holdTxt+' · holding + fees included in net · '+esc(p.cost.holdingSource||'Saved paper assumptions')+' · frozen-rate paper estimate':(p.holdingTime||p.feeTime)?' · Trading paid '+money(p.trading)+' · Close base est. '+money(p.closeEstimate)+' · '+holdTxt+' · '+(p.hourRate===undefined?'rate unavailable':(p.hourRate>=0?'+':'')+p.hourRate.toFixed(5)+'%/h')+' · '+esc(p.holdingError||p.feeError||'net estimate'):' · '+esc(p.holdingError||p.feeError||'Net costs unavailable')}</small></div>`}
try{setHTML('positions',html||'<p class="muted" style="padding:0 15px">'+(history?'No closed trades.':'No positions in this market.')+'</p>');}catch{}
try{$('costbadge').textContent=mode==='paper'?'Paper costs: estimates':'Net P&L: estimate';}catch{}
renderOrderTicket();
if(!fullyLoaded&&firstPublicDone&&candlesOf(pair).length>0)fullyLoaded=true;renderFees();renderAccount();renderProfile();draw();}
const EXIT_STYLE={
 tp:{label:'TP',meaning:'Take profit',color:'#57f2b3',dash:[12,4],width:2},
 sl:{label:'SL',meaning:'Stop loss',color:'#ff7c70',dash:[4,3],width:2},
 trail:{label:'TRAIL',meaning:'Trailing stop · follows the best price',color:'#62d7ff',dash:[10,3,2,3],width:2},
 chandelier:{label:'CHAN',meaning:'Chandelier exit · drawn once the ATR stop is calculated',color:'#ffd27c',dash:[2,3],width:2}
};
function chartExitLevels(positions){
 const levels=[];
 positions.forEach((p,i)=>{
  const paper=p.kind==='paper',rules=(paper?p.exits:liveExitRules.get(p.id))||{};
  const side=(p.long?'L':'S')+(pair===0&&p.pair===300?' D':'')+(positions.length>1?' #'+(paper?i+1:p.index):'');
  const values={
   tp:paper?rules.tp:Number(p.raw?.tp)/1e10,
   sl:paper?rules.sl:Number(p.raw?.sl)/1e10,
   trail:rules.trail>0?trailingStop(rules.best,rules.trail,p.long?1:-1):0,
   chandelier:rules.atr>0?rules.chandelier:0
  };
  for(const [key,price] of Object.entries(values)){
   if(Number.isFinite(price)&&price>0)levels.push({price,style:EXIT_STYLE[key],side});
  }
 });
 return levels;
}
// Keep labels in the left gutter and give the market price first choice of row.
function drawChartLabels(ctx,price,exits,trades,Y,left,top,bottom){
 const tradeRows=trades.map(([value,style,label,pnl,up,pct])=>({
  anchor:Y(value),style,label,details:[pnl,pct].filter(Boolean),up
 })).filter(row=>row.anchor>=top-16&&row.anchor<=bottom+16);
 const rows=exits.map(({price,style,side})=>{
  const anchor=Y(price),edge=anchor<top?'↑ ':anchor>bottom?'↓ ':'';
  return {anchor,style,label:edge+style.label+' '+side+' · $'+price.toFixed(price<1?6:2),boxed:true};
 }).concat(tradeRows);
 const compact=bottom-top<160||(rows.length+1)*18>bottom;
 const halfHeight=compact?5:8,spacing=2*halfHeight+2;
 const first=halfHeight+3,last=bottom+10-halfHeight;
 const x=3,maxWidth=left-x-10;
 if(last<first||maxWidth<24)return;
 const clamp=y=>Math.max(first,Math.min(last,y));
 const priceY=price>0?clamp(Y(price)):null;
 const slots=[];
 const start=priceY===null?first:first+(priceY-first)%spacing;
 for(let y=start;y<=last;y+=spacing){
  if(priceY===null||Math.abs(y-priceY)>1)slots.push(y);
 }
 const hidden=Math.max(0,rows.length-slots.length);
 const drawLabel=(row,y)=>{
  const {style,label,details=[],boxed}=row;
  ctx.font=(boxed?'bold ':'')+(compact?'9px':'10px')+' monospace';
  const labelWidth=ctx.measureText(label).width;
  const detailWidths=details.map(detail=>ctx.measureText(detail).width);
  const detailWidth=detailWidths.reduce((total,width)=>total+width+5,0);
  const width=Math.min(maxWidth,labelWidth+detailWidth+12);
  ctx.strokeStyle=style.color;
  ctx.lineWidth=1;
  ctx.beginPath();
  ctx.moveTo(x+width,y);
  ctx.lineTo(left,Math.max(top,Math.min(bottom,row.anchor)));
  ctx.stroke();
  ctx.fillStyle='#0b1623';
  ctx.fillRect(x,y-halfHeight,width,2*halfHeight);
  if(boxed){
   ctx.strokeStyle=style.color;
   ctx.lineWidth=1;
   ctx.strokeRect(x+.5,y-halfHeight+.5,width-1,2*halfHeight-1);
  }
  const scale=Math.min(1,(width-12)/(labelWidth+detailWidth));
  ctx.fillStyle=row.mark?'#fff':style.color;
  ctx.fillText(label,x+6,y+3,labelWidth*scale);
  ctx.fillStyle=row.up?'#10d49b':'#ff5979';
  let offset=labelWidth+5;
  details.forEach((detail,i)=>{
   ctx.fillText(detail,x+6+offset*scale,y+3,detailWidths[i]*scale);
   offset+=detailWidths[i]+5;
  });
 };
 if(priceY!==null)drawLabel({anchor:Y(price),style:LINE_STYLE.price,label:money(price),boxed:true,mark:true},priceY);
 for(const row of rows){
  if(!slots.length)break;
  const target=clamp(row.anchor);
  let nearest=0;
  for(let i=1;i<slots.length;i++){
   if(Math.abs(slots[i]-target)<Math.abs(slots[nearest]-target))nearest=i;
  }
  drawLabel(row,slots.splice(nearest,1)[0]);
 }
 if(hidden){
  ctx.font='10px monospace';
  ctx.fillStyle='#aab9cc';
  ctx.fillText('+'+hidden+' levels',x+6,bottom+19,Math.max(1,maxWidth-16));
 }
}
const LINE_STYLE={myLong:{color:'#ffe144',dash:[],width:2},myShort:{color:'#b373ff',dash:[],width:2},otherLong:{color:'#ff9f1a',dash:[2,3],width:1.5},otherShort:{color:'#9d7bff',dash:[6,3],width:1.5},aggLong:{color:'#00e5ff',dash:[10,4],width:3},aggShort:{color:'#ff7ad9',dash:[10,4],width:3},myLiq:{color:'#ff2450',dash:[4,4],width:1.5},myAvg:{color:'#ffffff',dash:[],width:2},otherLiq:{color:'#ff69bd',dash:[4,4],width:1.2},price:{color:'#20e08c',dash:[],width:1},avgLong:{color:'#ffe144',width:3.5,dash:[]},avgShort:{color:'#b373ff',width:3.5,dash:[]},avgLiqLong:{color:'#ff668f',width:3,dash:[8,3]},avgLiqShort:{color:'#ff9bdc',width:3,dash:[8,3]}};
function renderLegend(){
 const meanings={myLong:'Your long entry',myShort:'Your short entry',otherLong:'Public long entry',otherShort:'Public short entry',aggLong:'Grouped public long entries · identical entry and leverage',aggShort:'Grouped public short entries · identical entry and leverage',myLiq:'Your liquidation level · L/S labels identify side',myAvg:'Your notional-weighted average entry · both sides',otherLiq:'Individual public liquidation level · L/S labels identify side',price:'Latest market mark price',avgLong:'Public long average entry · all leverage and each populated band',avgShort:'Public short average entry · all leverage and each populated band',avgLiqLong:'Public long average liquidation · known and estimated levels',avgLiqShort:'Public short average liquidation · known and estimated levels'};
 $('legendRows').innerHTML=Object.entries({...EXIT_STYLE,...LINE_STYLE}).map(([key,style])=>{const pattern=style.dash.length?(style.dash[0]<=2?'dotted':'dashed'):'solid';return `<div class="legend-row"><svg width="64" height="18" viewBox="0 0 64 18" aria-hidden="true"><line x1="2" y1="9" x2="62" y2="9" stroke="${style.color}" stroke-width="${style.width}" stroke-dasharray="${style.dash.join(' ')}"/></svg><span>${style.meaning||meanings[key]}<small>${style.color} · ${pattern}</small></span></div>`}).join('');
}

function draw(){let canvas;try{canvas=$('chart');}catch{return}if(!canvas||!canvas.getBoundingClientRect)return;let r=canvas.getBoundingClientRect(),d=devicePixelRatio||1,w=r.width,h=r.height;if(!w||!h)return;if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=w*d;canvas.height=h*d}let ctx;try{ctx=canvas.getContext('2d');}catch{return}if(!ctx||!ctx.setTransform)return;ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,w,h);let full=candlesOf(pair);try{const gaps=full.filter(c=>c.source==='gap-fill').length;$('historyStatus').textContent=$('historyStatus').textContent.split(' · gaps:')[0]+(gaps?' · gaps: '+gaps+' amber placeholders · backfill pending':'');}catch{}let a=chartBars();chartDetails(a);if(!a.length)return;
let mine=(mode==='paper'?book.positions:livePositions).filter(chartPair);
const exitLevels=chartExitLevels(mine);
let others=$('overlay').checked?publicTrades.filter(p=>chartPair(p)&&p.isOpen&&(!selectedPublic||p.id===selectedPublic)):[];
let cl=clusteredPublic(others);let overlays=mine.concat(cl.singles,cl.groups);
/* Own entries and liquidation levels stay in the default scale, including
 * BTCDEGEN positions on BTC. Public levels never stretch the chart. */
const pvScale=priceOf(pair);
let lo=Math.min(...a.map(c=>c.l)),hi=Math.max(...a.map(c=>c.h));
if(pvScale>0){lo=Math.min(lo,pvScale);hi=Math.max(hi,pvScale);}for(const p of mine)for(const v of [p.entry,safeLiq(p)])if(Number.isFinite(v)&&v>0){lo=Math.min(lo,v);hi=Math.max(hi,v);}
let pad=Math.max((hi-lo)*.15,hi*.0003);lo-=pad;hi+=pad;const scaleSpan=hi-lo;lo+=view.yOff*scaleSpan;hi+=view.yOff*scaleSpan;
const plot=chartPlot(w),right=plot.right,top=20,bottom=h-40,headPad=plot.left,Y=v=>top+(hi-v)/(hi-lo)*(bottom-top);ctx.font='10px monospace';for(let i=0;i<=6;i++){let v=lo+(hi-lo)*i/6,y=Y(v);ctx.strokeStyle='#202938';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(right,y);ctx.stroke();ctx.fillStyle='#8290a5';ctx.fillText(v.toFixed(2),right+5,y+3)}
let step=plot.candleWidth/Math.max(1,a.length);
const strokeLine=(v,style)=>{if(!(v>0))return Y(v);let y=Y(v);if(!Number.isFinite(y))return y;ctx.strokeStyle=style.color;ctx.lineWidth=style.width||1.5;ctx.setLineDash(style.dash||[]);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(right,y);ctx.stroke();ctx.setLineDash([]);ctx.lineWidth=1;return y;};
/* Retain and stroke every market level, including offscreen coordinates.
 * The canvas clips only pixels; panning reveals levels without reloading. */
ctx.save();ctx.beginPath();ctx.rect(0,top,right,bottom-top);ctx.clip();
/* Pass 1: stroke every trade line. Pass 2: all trade labels (with live PnL). */
const tradeTags=[];
const pnlOf=p=>{const v=p.kind==='paper'?Engine.value(p,refPrice(p.pair)).net:p.kind==='live'?liveValue(p):estPnl(p.entry,p.long,p.lev,p.amount,refPrice(p.pair));if(!Number.isFinite(v))return [null,true,null];const pct=p.amount>0?v/p.amount*100:NaN;return [fmtPnl(v),v>=0,Number.isFinite(pct)?`(${pct>=0?'+':''}${pct.toFixed(1)}%)`:null];};
for(const p of mine.slice().reverse()){strokeLine(p.entry,p.long?LINE_STYLE.myLong:LINE_STYLE.myShort);const q=pnlOf(p);tradeTags.push([p.entry,p.long?LINE_STYLE.myLong:LINE_STYLE.myShort,`${p.long?'L':'S'} ${levLabel(p.lev)}× ${cashLabel(p.amount)}${p.pair===300&&pair===0?' D':''} NET`,q[0],q[1],q[2]]);const liq=safeLiq(p);if(liq>0){strokeLine(liq,LINE_STYLE.myLiq);tradeTags.push([liq,LINE_STYLE.myLiq,`${p.long?'L':'S'} LIQ${p.pair===300&&pair===0?' D':''}${p.kind==='live'&&!(p.liq>0)?' EST':''} ${money(liq)}`,null,true,null]);}}
/* Include every valid position, including small collateral and distant levels. */
const visibleSingles=cl.singles.filter(p=>(p.amount||0)>0);for(const p of visibleSingles){const st=p.long?LINE_STYLE.otherLong:LINE_STYLE.otherShort;strokeLine(p.entry,st);const q=pnlOf(p);tradeTags.push([p.entry,st,`${p.long?'L':'S'} ${levLabel(p.lev)}× ${cashLabel(p.amount)}${p.pair===300&&pair===0?' D':''}`,q[0],q[1],q[2]]);}
for(const g of cl.groups){const st=g.long?LINE_STYLE.aggLong:LINE_STYLE.aggShort;strokeLine(g.entry,st);tradeTags.push([g.entry,st,`AVG ${g.long?'L':'S'} ×${g.count} ${cashLabel(g.amount)}`,null,true,null]);}
for(const p of others.filter(p=>(p.amount||0)>0)){const liq=publicLiq(p);if(liq>0){strokeLine(liq,LINE_STYLE.otherLiq);tradeTags.push([liq,LINE_STYLE.otherLiq,`${p.long?'L':'S'} LIQ${Number.isFinite(p.liq)&&p.liq>0?'':' EST'} ${levLabel(p.lev)}× ${cashLabel(p.amount)}${p.pair===300&&pair===0?' D':''} · ${money(liq)}`,null,true,null]);}}
if($('avgOverlay').checked&&$('overlay').checked){const averageTags=[],averageLiqTags=[];marketAverages();for(const g of [...averageCache.sides.filter(g=>g.count),...averageCache.bands]){const st=g.long?LINE_STYLE.avgLong:LINE_STYLE.avgShort;strokeLine(g.entry,st);averageTags.push([g.entry,st,`AVG ${g.long?'L':'S'} ${g.band===undefined?'ALL':g.band+'×'} · ${g.count}`,null,true,null]);if(g.chartLiq>0){const ls=g.long?LINE_STYLE.avgLiqLong:LINE_STYLE.avgLiqShort;strokeLine(g.chartLiq,ls);averageLiqTags.push([g.chartLiq,ls,`AVG LIQ${g.estimatedCount?' EST':''} ${g.long?'L':'S'} ${g.band===undefined?'ALL':g.band+'×'} · ${money(g.chartLiq)}`,null,true,null]);}}tradeTags.splice(2,0,...averageLiqTags,...averageTags);}
/* My average position line (notional-weighted entry of my open trades here). */
const avgLn=myAvgEntry();if(avgLn>0){strokeLine(avgLn,LINE_STYLE.myAvg);const mt=myTotalNet(pair);tradeTags.splice(mine.length?Math.min(2,tradeTags.length):0,0,[avgLn,LINE_STYLE.myAvg,`MY AVG ${money(avgLn)}`,mt?fmtPnl(mt.total):null,mt?mt.total>=0:true,null]);}
/* Thin green price line behind the bars. */
const pv=pvScale;if(pv>0)strokeLine(pv,LINE_STYLE.price);
for(const {price,style} of exitLevels){
 ctx.globalAlpha=.14;
 strokeLine(price,{color:style.color,width:6});
 ctx.globalAlpha=1;
 strokeLine(price,style);
}
ctx.restore();
a.forEach((c,i)=>{let x=headPad+(i+.5)*step;ctx.strokeStyle=ctx.fillStyle=c.source==='gap-fill'?'#e8b44c':c.c>=c.o?'#09c78f':'#ff4969';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,Y(c.h));ctx.lineTo(x,Y(c.l));ctx.stroke();ctx.fillRect(x-Math.max(.5,Math.min(6,step*.65))/2,Y(Math.max(c.o,c.c)),Math.max(.5,Math.min(6,step*.65)),Math.max(1,Math.abs(Y(c.o)-Y(c.c))))});
drawChartLabels(ctx,pv,exitLevels,tradeTags,Y,headPad,top,bottom);
ctx.font='10px monospace';ctx.textAlign='center';
for(const tick of chartTimeTicks(a,headPad,plot.candleRight)){ctx.strokeStyle='#303b4c';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(tick.x,bottom);ctx.lineTo(tick.x,bottom+4);ctx.stroke();ctx.fillStyle='#b6c5da';ctx.fillText(tick.time,tick.x,h-21);ctx.fillStyle='#8190a5';ctx.fillText(tick.date,tick.x,h-7);}ctx.textAlign='left';}
function safeLiq(p){if(p.kind==='live'||p.kind==='public')return publicLiq(p);try{return Engine.liquidation(p)}catch{return NaN}}
function liveHolding(p){return Number.isFinite(p.borrow)&&Number.isFinite(p.funding)?p.borrow+p.funding:NaN;}
function liveValue(p){if(!priceOf(p.pair)||!p.feeTime)return NaN;return p.amount*p.lev*(p.long?1:-1)*(priceOf(p.pair)/p.entry-1)+(p.realizedPnl||0)-p.borrow-p.funding-p.trading-p.closeEstimate;}
function renderPublic(){statsRevision++;renderRatios();let list;try{list=publicTrades.filter(chartPair);}catch{list=[]}try{setHTML('publicTrades',list.map(p=>{const pv=estPnl(p.entry,p.long,p.lev,p.amount,refPrice(p.pair));const badge=Number.isFinite(pv)?` <b class="${pv>=0?'positive':'negative'}">${fmtPnl(pv)}${p.amount>0?` (${(pv/p.amount*100>=0?'+':'')}${(pv/p.amount*100).toFixed(1)}%)`:''}</b>`:'';return `<div class="public ${p.id===selectedPublic?'selected':''}" data-public="${esc(p.id)}">${p.pair===300&&pair===0?'<span class="net">BTCDEGEN</span> ':''}${p.net&&p.net!=='POLYGON'?`<span class="net">${esc(p.net)}</span> `:''}<b class="${p.long?'long':'short'}">${p.long?'L':'S'} ${levLabel(p.lev)}×</b> ${cashLabel(p.amount)}${badge} collateral<small>${esc((p.user||'').slice(0,8))}…${esc((p.user||'').slice(-4))} · ${p.isOpen?'Open':'Closed'}<br>Entry ${money(p.entry)} · ${'LIQ '+money(publicLiq(p))+(p.liq>0?'':' EST')}</small></div>`;}).join('')||'<p class="muted">No open traders in this market right now. Trades appear here and on the chart as they open.</p>');}catch{}}
let globalTrades=[],globalBusy=false,globalAt=0;
const NETS=[{name:'POLYGON',chain:137,host:'backend-polygon.gains.trade'},{name:'ARBITRUM',chain:42161,host:'backend-arbitrum.gains.trade'},{name:'BASE',chain:8453,host:'backend-base.gains.trade'}];
function openGlobal(){click();try{$('globalPanel').hidden=false;$('shade').hidden=false;}catch{}renderGlobal();loadGlobal();}
function closeGlobal(){try{$('globalPanel').hidden=true;$('shade').hidden=true;}catch{}}
async function loadGlobal(){if(globalBusy)return;globalBusy=true;try{$('globalStatus').textContent='Loading past 24h trades · Polygon + Arbitrum + Base…';}catch{}
const all=[];await Promise.all(NETS.map(async net=>{const urls=[`https://backend-global.gains.trade/api/trading-history/24h?chainId=${net.chain}`,`https://${net.host}/api/trading-history/24h?chainId=${net.chain}`];for(const u of urls){try{const j=await fetchJson(u,20000);if(!Array.isArray(j)||!j.length)continue;for(const g of j.sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,80))all.push({...g,net:net.name});break;}catch{}}}));
const merged=[...globalTrades.filter(g=>g._new),...all];merged.sort((a,b)=>new Date(b.date)-new Date(a.date));if(merged.length)globalTrades=merged.slice(0,150);globalAt=Date.now();seedLatestPublicTrade(merged);renderGlobal();
try{$('globalStatus').textContent=globalTrades.length?`${globalTrades.length} trades · past 24h · Polygon + Arbitrum + Base · streaming live`:'Global history unavailable · live events still stream in';}catch{}globalBusy=false;}
function globalAction(a){return {TradeOpenedMarket:'OPEN',TradeOpenedLimit:'OPEN◷',TradeClosedMarket:'CLOSE',TradeClosedLIQ:'LIQ',TradeClosedTP:'TP',TradeClosedSL:'SL',TradeLeverageUpdate:'LEV',TradePosSizeIncrease:'SIZE+',TradePosSizeDecrease:'SIZE-'}[a]||a;}
let globalOnlyPair=false;
function renderGlobal(){if($('globalPanel').hidden)return;try{const box=$('globalTrades');if(!box)return;const curSym=(TradeConfig.marketOrNull(pair)||{}).symbol;const rows=(globalOnlyPair&&curSym?globalTrades.filter(g=>g.pair===curSym):globalTrades);box.innerHTML=rows.map(g=>{const pnl=+g.pnl_net;const cls=g.action==='TradeClosedLIQ'?'liq':/OPEN/.test(g.action)?(g.long?'long':'short'):Number.isFinite(pnl)?(pnl>=0?'positive':'negative'):'';let tm='';try{tm=new Date(g.date).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});}catch{}return `<div class="gtrade ${g._new?'new':''}">${g.net?`<span class="net">${esc(g.net)}</span>`:''}<b class="${cls}">${esc(globalAction(g.action))}</b><span>${esc(g.pair||'')}</span><span>${g.long?'L':'S'} ${levLabel(+g.leverage)}×</span>${g.size!=null&&g.size!==''?`<span>${cashLabel(+g.size)}</span>`:''}<span>${money(+g.price)}</span>${Number.isFinite(pnl)&&/CLOSE|LIQ/.test(g.action)?`<b class="${pnl>=0?'positive':'negative'}">${money(pnl)}</b>`:''}<small>${tm} · ${esc(String(g.address||'').slice(0,6))}…</small></div>`;}).join('')||'<p class="muted">No global trades loaded yet.</p>';}catch{}}
/* Live backend events prepended as they happen (past list stays below). */
function pushGlobalLive(msg,net){try{if(msg.name==='new-trade-history'){const g=msg.value||msg;const key=String(g.tx||'')+':'+String(g.logIndex??g.tradeIndex)+':'+net;if(globalTrades.some(x=>x._eventKey===key))return;globalTrades.unshift({...g,net,_new:true,_eventKey:key});globalTrades=globalTrades.slice(0,150);renderGlobal();return;}if(msg.name==='liveEvent'||msg.name==='liveEvents')return;const v=msg.value||{};const t=v.trade||v;const pi=+(t.pairIndex??NaN);const item={net:net||'',date:new Date().toISOString(),pair:Number.isFinite(pi)?((TradeConfig.marketOrNull(pi)||{}).symbol||('pair '+pi)):String(v.pair||t.pair||''),address:String(t.user||t.trader||''),action:msg.name==='unregisterTrade'?'TradeClosedMarket':msg.name==='registerTrade'?'TradeOpenedMarket':msg.name,long:!!t.long,leverage:t.leverage!=null?Math.round(+t.leverage/1000):'',price:+(t.openPrice!=null?+t.openPrice/1e10:v.price)||NaN,pnl_net:NaN,_new:true};globalTrades.unshift(item);globalTrades=globalTrades.slice(0,150);renderGlobal();}catch{}}
/* Extra live streams so Arbitrum + Base trades append as they happen
 * (Polygon already streams via the main trade socket). */
let netSockets={},netSocketGenerations={};
function connectNetLive(net){if(net.name==='POLYGON')return;const generation=netSocketGenerations[net.name]=(netSocketGenerations[net.name]||0)+1,retry=()=>{if(generation===netSocketGenerations[net.name])connectNetLive(net);};noteConnection(net.name,'connecting','opening socket');const previous=netSockets[net.name];netSockets[net.name]=null;try{if(previous)previous.close();}catch{}let s;try{s=GainsRouting.socket('wss://'+net.host);}catch{noteConnection(net.name,'retry','socket blocked',8000);setTimeout(retry,8000);return;}netSockets[net.name]=s;s.onopen=()=>{if(s===netSockets[net.name]){noteConnection(net.name,'open','waiting for data');tradeFeedStatus(true);}};s.onmessage=e=>{try{if(s!==netSockets[net.name])return;const msg=JSON.parse(e.data);touchConnection(net.name);applyBackendChange(msg,net.name);if(['registerTrade','unregisterTrade','updateTrade','updateLeverage','updatePositionSize','liveEvent','liveEvents','new-trade-history'].includes(msg.name)){pushGlobalLive(msg,net.name);queuePublicReload();}}catch{}};s.onclose=()=>{if(s===netSockets[net.name]){noteConnection(net.name,'retry','socket closed',8000);setTimeout(retry,8000)}};s.onerror=()=>{};}
function renderMarketList(){try{const box=$('marketList');if(!box)return;const groups={};for(const m of TradeConfig.allMarkets()){const g=(m.degen?'degen · ': '')+m.group;if(!groups[g])groups[g]=[];groups[g].push(m);}let html='';/* smallest group first, main crypto list last at the bottom; A–Z inside each */const keys=Object.keys(groups).sort((a,b)=>groups[a].length-groups[b].length||(a<b?-1:1));for(const g of keys){groups[g].sort((x,y)=>{const ox=x.base.replace(/DEGEN$/,''),oy=y.base.replace(/DEGEN$/,'');if(ox!==oy)return ox<oy?-1:1;if(!!x.degen!==!!y.degen)return x.degen?1:-1;return x.symbol<y.symbol?-1:1;});html+=`<div class="mg">${esc(g.toUpperCase())} · ${groups[g].length}</div>`;for(const m of groups[g])html+=`<button class="marketchoice ${m.pairIndex===pair?'active':''}" data-pair="${m.pairIndex}">${m.degen?'↳ ':''}${esc(m.symbol)} <small>· ${m.maxLeverage}×</small></button>`;}setHTML('marketList',html);}catch{}}
/* Authoritative Polygon asset list (docs: listed-assets). Merges live pairs,
 * leverage bounds and delist filtering into the registry; bundled list stays
 * as fallback. Refreshes on tradingVariables events + every 5 min. */
let assetsAt=0,assetsBusy=false;
async function fetchJson(url,ms=15000){return GainsRouting.instance.json(url,ms);}
async function discoverAssets(){if(assetsBusy)return;assetsBusy=true;try{const {pairs,groups,pairInfos}=await fetchJson(PUBLIC_BASE+'/trading-variables/pairs,groups,pairInfos',20000);const list=pairs.map((p,i)=>{const g=groups[+p.groupIndex];const over=+((pairInfos.maxLeverages||[])[i]||0)/1e3;const max=over===0?+g.maxLeverage/1e3:over;return {pairIndex:i,symbol:String(p.from).split('_')[0]+'/'+p.to,maxLeverage:max,group:String(g.name).replace(/-\d+$/,'').replace(/^altcoins$/,'crypto'),minLeverage:+g.minLeverage/1e3};});const n=TradeConfig.discover(list);assetsAt=Date.now();if(n>0){syncLeverage();renderMarketList();renderFees();}return n;}catch{}finally{assetsBusy=false;}}
/* Instant OHLC fill for every pair (docs: price-feed /charts). Seeds the
 * current candle bucket so the chart is never empty before history lands. */
let chartsSnapshotBusy=false;
async function loadChartsSnapshot(){if(chartsSnapshotBusy)return false;chartsSnapshotBusy=true;try{const s=await fetchJson('https://backend-pricing.eu.gains.trade/charts');const n=Math.min(s.opens.length,s.highs.length,s.lows.length,s.closes.length);for(let i=0;i<n;i++){const o=+s.opens[i],h=+s.highs[i],l=+s.lows[i],c=+s.closes[i];if(![o,h,l,c].every(Number.isFinite)||l<=0)continue;const tt=Math.floor(Date.now()/60000)*60000,a=candlesOf(i);let k=a[a.length-1];if(k)k.t=Math.floor(Number(k.t)/60000)*60000;if(!k||k.t!==tt){k={t:tt,o,h,l,c,source:'gains-charts'};a.push(k);if(a.length>10080)a.splice(0,a.length-10080);}else if(k.source!=='gains-live'){k.o=o;k.h=h;k.l=l;k.c=c;}try{candles[i]=Engine.dedupeCandles(a);}catch{}}
for(let i=0;i<n;i++){const cc=+s.closes[i];if(cc>0&&!priceOf(i)){prices[i]=cc;}}if(snapshotBusy)setLoadBar(22,'Live snapshot in · loading history…');else setLoadBar(100,'Ready');return true;}catch{return false;}finally{chartsSnapshotBusy=false;}}
const N=v=>Number(v.toString()),priceUnit=v=>ethers.utils.parseUnits(v.toFixed(10),10),usdc=v=>N(v)/1e6;
function normalize(t){return {id:t.user.toLowerCase()+':'+N(t.index),user:t.user,index:N(t.index),pair:N(t.pairIndex),long:t.long,lev:N(t.leverage)/1000,entry:N(t.openPrice)/1e10,amount:usdc(t.collateralAmount),isOpen:t.isOpen,kind:'live',status:'Open',raw:t};}
function listedPair(i){try{return !!TradeConfig.marketOrNull(i);}catch{return i===0||i===1;}}
/* Display filter for other people's trades: accept any sane pairIndex so lines
 * never vanish just because the local registry is stale. Order placement still
 * enforces per-market caps via TradeConfig.market(). */
function displayablePair(i){return Number.isInteger(i)&&i>=0&&i<=1000;}

async function chain(){if(chainConnecting)return chainConnecting;chainConnecting=(async()=>{const endpoints=cfg.rpc===NETWORK.httpsRpc?[cfg.rpc,NETWORK.httpsFallback]:[cfg.rpc];let lastError;for(const url of endpoints){let candidate=provider&&provider.connection?.url===url?provider:new ethers.providers.JsonRpcProvider({url,timeout:15000});let nw;try{nw=await candidate.getNetwork()}catch(e){lastError=e;continue}if(nw.chainId!==NETWORK.chainId)throw Error('RPC must be Polygon chain 137');if(provider!==candidate){provider=candidate;provider.pollingInterval=4000;contract=new ethers.Contract(DIAMOND,GABI,provider)}return contract;}throw lastError||Error('Polygon RPC unavailable')})();try{return await chainConnecting}finally{chainConnecting=null}}

async function setupEvents(){for(const id of ['exportErrors','exportErrorsStats'])$(id).onclick=exportLiveErrors;const generation=++publicGeneration;try{eventContract?.removeAllListeners();}catch{}eventContract=null;if(eventProvider){try{eventProvider._websocket.onclose=null;eventProvider.destroy();}catch{}eventProvider=null}try{contract?.removeAllListeners();}catch{}try{const c=await chain();if(generation!==publicGeneration)return;const block=await provider.getBlockNumber();let seen=new Set();const onEvent=async(ev,historical=false)=>{if(generation!==publicGeneration)return;let key=ev.transactionHash+':'+ev.logIndex;if(ev.removed){for(const [id,change]of publicChanges)if(change.eventKey===key)publicChanges.delete(id);queuePublicReload();return}if(seen.has(key))return;seen.add(key);if(seen.size>5000)seen=new Set([...seen].slice(-2500));let a={...ev.args},t=a.t;if(ev.event==='LimitExecuted')a.open=[2,3].includes(N(a.orderType));if(!t||!displayablePair(N(t.pairIndex)))return;let p=normalize(t);if(N(t.collateralIndex)!==3){try{const collateral=await c.getCollateral(N(t.collateralIndex));p.amount=N(t.collateralAmount)/N(collateral.precision)*N(a.collateralPriceUsd)/1e8}catch{return}}p.kind='public';p.net='POLYGON';p.id='POLYGON:'+p.id;p.isOpen=a.open;p.eventKey=key;p.liq=N(a.liqPrice)/1e10;if(p.isOpen&&!p.liq&&priceOf(p.pair)){try{const lp=await c.getTradeLiquidationParams(t.user,t.index);p.liq=N(await c.getTradeLiquidationPrice({collateralIndex:t.collateralIndex,trader:t.user,pairIndex:t.pairIndex,index:t.index,openPrice:t.openPrice,long:t.long,collateral:t.collateralAmount,leverage:t.leverage,additionalFeeCollateral:0,liquidationParams:lp,currentPairPrice:priceUnit(priceOf(p.pair)),isCounterTrade:t.isCounterTrade,partialCloseMultiplier:1e10,beforeOpened:false}))/1e10}catch{}}applyPublicChange(p);p.eventPrice=N(a.marketPrice||a.oraclePrice||0)/1e10;notifyPublicTrade(p,p.isOpen?'open':ev.event==='LimitExecuted'&&N(a.orderType)===6?'liq':'close',historical||quietEvents);snapId++;knownPublic=new Map(publicTrades.filter(x=>x.isOpen).map(x=>[x.id,x]));renderPublic();if(wallet&&t.user.toLowerCase()===wallet.address.toLowerCase()){for(const row of pending){if(row.owner===wallet.address&&row.orderId===N(a.orderId.index)){row.status=a.open?'Open':'Closed';row.tradeIndex=N(t.index)}}pending=pending.filter(row=>!['Open','Closed'].includes(row.status));persist();if(!a.open)refreshWallet();else refreshWallet();}};
const attachEvents=(ec)=>{for(const name of ['MarketExecuted','LimitExecuted'])ec.on(name,(...args)=>onEvent(args[args.length-1]));for(const name of ['MarketOpenCanceled','MarketCloseCanceled'])ec.on(name,(...args)=>{const ev=args[args.length-1];if(!wallet||ev.args.trader.toLowerCase()!==wallet.address.toLowerCase())return;for(const row of pending)if(row.owner===wallet.address&&row.orderId===N(ev.args.orderId.index))row.status='Canceled on-chain · '+N(ev.args.cancelReason);persist();refreshWallet()});};let usingWss=false;if(cfg.eventRpc){let timer;try{eventProvider=new ethers.providers.WebSocketProvider(cfg.eventRpc);const net=await Promise.race([eventProvider.getNetwork(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Event WSS timed out')),12000)})]);if(net.chainId!==NETWORK.chainId)throw Error('Event RPC is not Polygon');eventContract=new ethers.Contract(DIAMOND,GABI,eventProvider);attachEvents(eventContract);usingWss=true;eventProvider._websocket.onclose=()=>{try{$('publicStatus').textContent='Event WebSocket disconnected. Reconnecting…';}catch{}setTimeout(()=>{if(generation===publicGeneration)setupEvents()},3000)};}catch{try{eventProvider?.destroy();}catch{}eventProvider=null;attachEvents(c);}finally{clearTimeout(timer)}}else attachEvents(c);
try{$('publicStatus').textContent=usingWss?'Polygon events · WebSocket':'Polygon events · HTTPS polling fallback';}catch{}
try{for(const name of ['MarketExecuted','LimitExecuted'])for(const ev of await c.queryFilter(c.filters[name](),Math.max(0,block-100),block))await onEvent(ev,true)}catch{}
}catch(e){try{$('publicStatus').textContent='Public feed unavailable: '+(e.reason||e.message);}catch{}setTimeout(()=>{if(generation===publicGeneration)setupEvents()},15000);}}
async function readLiveBorrowingFees(c,addr,p,curr){const [legacy,current]=await Promise.all([c.getTradeBorrowingFee({collateralIndex:p.raw.collateralIndex,trader:addr,pairIndex:p.pair,index:p.index,long:p.long,collateral:p.raw.collateralAmount,leverage:p.raw.leverage,currentPairPrice:curr}),c.getTradeBorrowingFeesCollateral(addr,p.index,curr)]);p.borrowLegacy=usdc(legacy);p.borrowV10=usdc(current);return ethers.BigNumber.from(legacy).add(current);}
async function refreshLivePositionFees(c,addr,p,curr){
 const results=await Promise.allSettled([
  readLiveBorrowingFees(c,addr,p,curr),c.getTradeFundingFeesCollateral(addr,p.index,curr),
  c.getTradeRealizedTradingFeesCollateral(addr,p.index),c.getTradeFeesData(addr,p.index),
  (async()=>{const fee=await c.getEffectiveTotalPositionSizeFeeP(p.pair,!!p.raw.isCounterTrade),base=p.raw.collateralAmount.mul(p.raw.leverage).mul(fee).div(1000).div(ethers.BigNumber.from(10).pow(12));return c.calculateFeeAmount(addr,base);})()
 ]);
 const now=Date.now();p.feeError='';p.holdingError='';
 if(results[0].status==='fulfilled'){p.borrow=usdc(results[0].value);p.borrowTime=now;}
 if(results[1].status==='fulfilled'){p.funding=usdc(results[1].value);p.fundingTime=now;}
 if(p.borrowTime||p.fundingTime)p.holdingTime=Math.max(p.borrowTime||0,p.fundingTime||0);
 if(results[0].status!=='fulfilled'||results[1].status!=='fulfilled')p.holdingError='Holding fee refresh incomplete; last confirmed amounts shown where available';
 if(results[2].status==='fulfilled')p.trading=usdc(results[2].value);
 if(results[3].status==='fulfilled')p.realizedPnl=usdc(results[3].value.realizedPnlCollateral);
 if(results[4].status==='fulfilled')p.closeEstimate=usdc(results[4].value);
 p.feeTime=results.every(r=>r.status==='fulfilled')?now:0;
 if(!p.feeTime)p.feeError='Net fee estimate unavailable; retrying';
 const f=marketFees[p.pair];p.hourRate=holdingRatesFresh(p.pair)?((p.long?f.borrowLongHourly:f.borrowShortHourly)??f.borrowHourly)+(p.long?f.fundLongHourly:f.fundShortHourly):undefined;
 // Liquidation-price estimation has no authority over actual accrued fees.
 try{const lp=await c.getTradeLiquidationParams(addr,p.index);p.liq=N(await c.getTradeLiquidationPrice({collateralIndex:p.raw.collateralIndex,trader:addr,pairIndex:p.pair,index:p.index,openPrice:p.raw.openPrice,long:p.long,collateral:p.raw.collateralAmount,leverage:p.raw.leverage,additionalFeeCollateral:0,liquidationParams:lp,currentPairPrice:curr,isCounterTrade:p.raw.isCounterTrade,partialCloseMultiplier:1e10,beforeOpened:false}))/1e10;}catch{p.liq=undefined;}
}
async function refreshWallet(){if(!wallet||refreshBusy)return false;const syncWallet=wallet,syncRpc=cfg.rpc;const sameWallet=()=>wallet===syncWallet&&cfg.rpc===syncRpc;refreshBusy=true;const prevLive=new Map();try{for(const p of livePositions){const v=liveValue(p);prevLive.set(p.id,{position:{...p},label:`${p.long?'L':'S'} ${levLabel(p.lev)}×`,v});}}catch{}try{const c=await chain(),addr=wallet.address;let collateral=await c.getCollateral(3);if(!collateral.isActive)throw Error('Polygon USDC collateral inactive');if(collateral.collateral.toLowerCase()!==NETWORK.usdc.toLowerCase())throw Error('Native USDC address mismatch');let token=new ethers.Contract(collateral.collateral,['function balanceOf(address) view returns(uint256)'],provider);liveBalance=usdc(await token.balanceOf(addr));let raw=await c.getTrades(addr);if(!sameWallet())return false;const old=livePositions;livePositions=raw.filter(t=>t.isOpen&&N(t.tradeType)===0&&listedPair(N(t.pairIndex))&&N(t.collateralIndex)===3).map(t=>({...old.find(p=>p.id===t.user.toLowerCase()+':'+N(t.index)),...normalize(t)}));
for(const p of livePositions){if(!priceOf(p.pair))continue;await refreshLivePositionFees(c,addr,p,priceUnit(priceOf(p.pair)));}

for(const row of pending.filter(p=>p.owner===addr&&p.approvalHash&&!p.hash&&!p.approvalConfirmed&&p.status!=='Approval rejected · order not submitted')){const receipt=await readPolygonReceipt(provider,row.approvalHash).catch(()=>null);if(receipt){row.status=receipt.status===0?'Approval failed on-chain':'Approval complete · order not submitted';}}
for(const row of pending.filter(p=>p.owner===addr&&p.hash&&p.orderId===undefined)){const receipt=await readPolygonReceipt(provider,row.hash).catch(()=>null);if(receipt){if(receipt.status===0)row.status='Failed on-chain';else{captureOrder(receipt,row,c);if(!reconcileConfirmedState(row,livePositions))row.status='Pending oracle execution'}}}let pend=await c.getPendingOrders(addr);const active=new Set(pend.filter(p=>p.isOpen).map(p=>String(N(p.index))));for(const p of pending.filter(p=>p.owner===addr&&p.orderId!==undefined)){if(!active.has(String(p.orderId))){if(p.action==='open'&&livePositions.some(t=>t.index===p.tradeIndex))p.status='Open';else if(p.action==='close'&&!livePositions.some(t=>t.index===p.tradeIndex))p.status='Closed';else p.status='Order resolved · check chain';}}
if(!sameWallet())return false;pending=pending.filter(p=>!['Open','Closed'].includes(p.status));persist();
try{for(const [id,info] of prevLive){if(!livePositions.some(x=>x.id===id)){const p=info.position;if(liveExitRules.delete(id))saveLiveExitRules();if(!liveHistory.some(x=>x.id===id&&x.owner===addr))liveHistory.unshift({...p,owner:addr,net:null,closed:Date.now(),status:'Closed · settlement unavailable'});persist();pushEvent(`CLOSED ${info.label} ${fmtPnl(info.v)}`,'');showBigEvent(`CLOSED ${fmtPnl(info.v)}`,info.v>=0?'big-win':'big-loss');}}}catch{}try{$('walletStatus').textContent=addr+' · '+money(liveBalance)+' USDC';}catch{}return true;}catch(e){try{$('walletStatus').textContent='Wallet sync unavailable: '+(e.reason||e.message)}catch{}return false;}finally{refreshBusy=false}}
let liveErrors=load('liveErrors',[]);
if(!Array.isArray(liveErrors))liveErrors=[];
function safeOrderError(error){
  const nested=error?.error?.error||error?.error;
  const clean=value=>String(value||'').replace(/https?:\/\/[^\s"'<>]+|wss?:\/\/[^\s"'<>]+/gi,'[RPC URL]').replace(/(?:0x)?[a-f0-9]{40,}/gi,'[hex redacted]').replace(/(?:body|requestBody|transaction|headers|authorization|api[-_ ]?key|token)\s*[:=]\s*.+/gi,'[RPC data redacted]').replace(/[\r\n\t]+/g,' ').slice(0,240);
  return {code:clean(error?.code),rpcCode:clean(nested?.code),reason:clean(nested?.reason||nested?.message||error?.reason||((error?.message||'').split(' (')[0]))};
}
function recordLiveError(stage,error,row){
  const details=safeOrderError(error);
  const reason=details.reason||'Unknown error';
  liveErrors.push({time:new Date().toISOString(),stage,...details,pair:row?.pair,side:row?.long===undefined?undefined:row.long?'long':'short',leverage:row?.leverage,collateralUnits:row?.collateralUnits,status:row?.status});
  liveErrors=liveErrors.slice(-100);
  try{localStorage.setItem('liveErrors',JSON.stringify(liveErrors));}catch{}
  return stage+' · '+reason;
}
function exportLiveErrors(){
  const legacy=pending.filter(row=>row.error&&!row.errorLogged).slice(-20).map(row=>({status:row.status,...safeOrderError({reason:row.error})}));
  const report=['TwinTrade v0.78.0 – Polygon live order diagnostics',new Date().toISOString(),...liveErrors.map(row=>JSON.stringify(row)),...legacy.map(row=>'Earlier order '+JSON.stringify(row))].join('\n')+'\n';
  if(window.Feed?.saveErrorReport){Feed.saveErrorReport(report);return;}
  const url=URL.createObjectURL(new Blob([report],{type:'text/plain'}));const link=document.createElement('a');link.href=url;link.download='TwinTrade-errors.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function canDismissOrder(row){return !!row.error||/^(Failed|Approval failed|Approval mismatch|Submission uncertain)/.test(row.status);}
function dismissOrderError(id){
  const row=pending.find(item=>item.id===id&&item.owner===wallet?.address);
  if(!row||!canDismissOrder(row))return;
  row.dismissed=true;
  persist();render();
}
function polygonTipRejected(reason){
  return /transaction gas price below minimum:\s*gas tip cap \d+, minimum needed \d+/i.test(reason);
}
function recoverRejectedApprovals(){
  let changed=false;
  for(const error of liveErrors){
    if(error.stage!=='USDC approval · Broadcasting signed transaction'||error.rpcCode!=='-32000'||!polygonTipRejected(error.reason))continue;
    const time=Date.parse(error.time);
    const rows=pending.filter(row=>row.action==='open'&&row.pair===error.pair&&row.collateralUnits===error.collateralUnits&&row.leverage===error.leverage&&(row.long?'long':'short')===error.side&&row.created<=time&&time-row.created<=120000);
    if(rows.length!==1)continue;
    const [row]=rows;
    if(!row.approvalHash||row.hash||row.approvalConfirmed||!/^Submission uncertain/.test(row.status))continue;
    row.status='Approval rejected · order not submitted';
    row.error='USDC approval · '+error.reason;
    changed=true;
  }
  if(changed)persist();
}
async function polygonFeeOverrides(rpc){
  const fees=await rpc.getFeeData();
  const minimum=ethers.utils.parseUnits('25','gwei');
  if(!fees.maxFeePerGas||!fees.maxPriorityFeePerGas)throw Error('Polygon RPC did not provide EIP-1559 gas estimates');
  const tip=fees.maxPriorityFeePerGas.lt(minimum)?minimum:fees.maxPriorityFeePerGas;
  const cap=fees.maxFeePerGas.add(tip.sub(fees.maxPriorityFeePerGas));
  return {type:2,maxPriorityFeePerGas:tip,maxFeePerGas:cap.lt(tip)?tip:cap};
}
recoverRejectedApprovals();
async function readPolygonReceipt(rpc,hash){
  const raw=await rpc.send('eth_getTransactionReceipt',[hash]);
  if(raw===null)return null;
  const receipt=rpc.formatter.receipt(raw);
  if(receipt.transactionHash.toLowerCase()!==hash.toLowerCase()||![0,1].includes(receipt.status)||!Number.isInteger(receipt.blockNumber))throw Error('Invalid Polygon receipt');
  return receipt;
}
async function pollPolygonReceipt(rpc,hash){
  const deadline=Date.now()+60000;
  // Keep broadcasts on the selected RPC. A second public Polygon endpoint
  // can independently confirm a receipt when the default RPC is lagging.
  const url=rpc.connection?.url;
  const backupUrl=url===NETWORK.httpsRpc?NETWORK.httpsFallback:url===NETWORK.httpsFallback?NETWORK.httpsRpc:null;
  const readers=[Promise.resolve(rpc)];
  if(backupUrl){
    const backup=new ethers.providers.JsonRpcProvider({url:backupUrl,timeout:8000},NETWORK.chainId);
    readers.push(backup.getNetwork().then(network=>{
      if(network.chainId!==NETWORK.chainId)throw Error('Receipt backup is not Polygon');
      return backup;
    }));
  }
  let lastError;
  do{
    try{
      return await Promise.any(readers.map(async source=>{
        const reader=await source;
        const receipt=await readPolygonReceipt(reader,hash);
        if(!receipt)throw null;
        return receipt;
      }));
    }catch(error){lastError=error.errors?.find(Boolean)||lastError;}
    if(Date.now()<deadline)await new Promise(resolve=>setTimeout(resolve,1250));
  }while(Date.now()<deadline);
  if(lastError)throw lastError;
  return null;
}
async function submitTracked(signer,request,row,field,setStage,beforeBroadcast=()=>{}){
  setStage('Preparing transaction and estimating POL gas');
  const rpc=signer.provider;
  const prepared=await signer.populateTransaction({...await request,...await polygonFeeOverrides(rpc)});
  const price=prepared.maxFeePerGas??prepared.gasPrice;
  if(price&&prepared.gasLimit&&(await rpc.getBalance(signer.address)).lt(prepared.gasLimit.mul(price)))throw Error('Insufficient POL for estimated gas');
  const signed=await signer.signTransaction(prepared);
  beforeBroadcast();
  const hash=ethers.utils.keccak256(signed);
  row[field]=hash;
  setStage('Broadcasting signed transaction');
  try{
    const returned=await rpc.send('eth_sendRawTransaction',[signed]);
    if(typeof returned!=='string'||returned.toLowerCase()!==hash)throw Error('RPC returned an unexpected transaction hash');
  }catch(error){
    const details=safeOrderError(error);
    if(details.rpcCode==='-32000'&&polygonTipRejected(details.reason)){
      delete row[field];
      throw error;
    }
    row.error=recordLiveError(row.stage,error,row);row.errorLogged=true;persist();
    // The node may have accepted the transaction before losing the response.
    // Look up the locally computed hash and never resend from this path.
  }
  setStage('Waiting for Polygon receipt');
  const receipt=await pollPolygonReceipt(rpc,hash);
  if(!receipt)throw Error('Receipt unavailable · check Polygon transaction status');
  if(receipt.status!==1)throw Object.assign(Error('Transaction reverted on Polygon'),{receipt});
  return receipt;
}
async function sendOrder(long){if(busy||bulkCloseBusy)return;let stage='Live order preflight',pendingRow;try{const orderMarket=TradeConfig.orderMarket(pair,+$('lev').value),orderPair=orderMarket.pairIndex,orderChartPair=pair;const sizingInputs=()=>[$('amount').value,$('dollars').value,$('amount').value==='custom'&&!$('dollars').value?$('sizeSlider').value:''].join('|');const selectedSize=sizingInputs();let {amount,percent,exact}=orderSize(mode==='paper'?book.cash:liveBalance),lev=+$('lev').value;if(!(amount>0)||!orderLeverageValid(lev,orderMarket))throw Error('Choose a positive amount and leverage up to '+orderMarket.maxLeverage+'×');if(mode==='paper'){busy=true;const orderConfig=cfg;if(!holdingRatesFresh(orderPair))await fetchHoldingRates(orderPair);if(mode!=='paper'||pair!==orderChartPair||cfg!==orderConfig||+$('lev').value!==lev||sizingInputs()!==selectedSize)throw Error('Order settings changed while loading holding rates. Review and retry.');requireFresh(orderPair);({amount,percent}=orderSize(book.cash));if(!(amount>0))throw Error('No available paper collateral');const costs=paperCosts(orderPair,long);if(window.Feed){if(Feed.updateCaps)Feed.updateCaps(JSON.stringify(TradeConfig.leverageMarkets().map(m=>({pairIndex:m.pairIndex,maxLeverage:m.maxLeverage,minLeverage:m.minLeverage}))));const result=exact?Feed.openDollars(orderPair,long,amount,lev,JSON.stringify(costs)):Feed.open(orderPair,long,percent,lev,JSON.stringify(costs));if(!result.startsWith('PENDING:'))throw Error(result);book=JSON.parse(Feed.paper());persist();toast('Paper open pending · collateral reserved · execution-time price will be used');return}if(!Array.isArray(book.pending))book.pending=[];if(book.pending.some(q=>q.action==='open'&&q.pair===orderPair&&q.long===long&&Math.abs(q.percent-percent)<1e-9&&Math.abs(q.lev-lev)<1e-9))throw Error('Duplicate paper open already pending');if(amount>book.cash)throw Error('Insufficient paper balance');const now=Date.now(),due=now+paperDelayMs(),id='p'+now+Math.random().toString(16).slice(2);book.cash-=amount;book.pending.push({id:'q'+id,action:'open',positionId:id,pair:orderPair,long,amount,percent,lev,cost:costs,submitted:now,due});persist();processBrowserPaper(now);toast('Paper open pending · collateral reserved · execution-time price will be used');return}if(!wallet)throw Error('Save a Polygon key first');liveQuote(orderPair);const orderWallet=wallet,orderSlip=cfg.maxSlip,orderRpc=cfg.rpc;if(pending.some(p=>p.owner===wallet.address&&/Sending|Pending|uncertain|Checking approval|Order resolved/.test(p.status)))throw Error('An order is still pending. Wait for reconciliation before submitting another.');busy=true;stage='Connecting to Polygon and reading market rules';const c=await chain(),signer=orderWallet.connect(provider),s=c.connect(signer),[state,col,fee]=await Promise.all([c.getTradingActivated(),c.getCollateral(orderMarket.collateralIndex),c.pairTotalPositionSizeFeeP(orderPair)]);if(N(state)!==0)throw Error('Polygon trading is paused or close-only');const registered=await c.pairs(orderMarket.pairIndex);const expectedBase=orderMarket.base.replace('DEGEN','');if(registered.from!==expectedBase&&registered.from!==orderMarket.base)throw Error('On-chain market no longer matches the selected market');if(registered.to!==orderMarket.quote)throw Error('On-chain market quote mismatch');if(!col.isActive)throw Error('USDC collateral is not active');if(col.collateral.toLowerCase()!==NETWORK.usdc.toLowerCase())throw Error('Contract collateral does not match configured native USDC');stage='Checking native USDC balance';let token=new ethers.Contract(col.collateral,['function symbol() view returns(string)','function decimals() view returns(uint8)','function allowance(address,address) view returns(uint256)','function approve(address,uint256) returns(bool)','function balanceOf(address) view returns(uint256)'],provider);if((await token.decimals())!==NETWORK.usdcDecimals)throw Error('USDC decimals mismatch');const units=ethers.utils.parseUnits(amount.toFixed(6),6);if((await token.balanceOf(wallet.address)).lt(units))throw Error('Insufficient USDC balance');
if(wallet!==orderWallet||mode!=='live'||pair!==orderChartPair||cfg.maxSlip!==orderSlip||cfg.rpc!==orderRpc||Number($('lev').value)!==lev||sizingInputs()!==selectedSize)throw Error('Order settings changed. Review the updated ticket.');
const reviewPrice=liveQuote(orderPair);
if(!confirm(`OPEN LIVE ${long?'L':'S'} ${orderMarket.symbol}\nCollateral ${collateralLabel(amount)} USDC · ${lev}×\nNotional ${money(amount*lev)} · max slippage ${orderSlip}%\nOracle reference ${money(reviewPrice)} · base fee estimate ${feeMoney(amount*lev*N(fee)/1e12)} per side. POL gas applies. Confirm before approval and signing.`))return;
pendingRow={created:Date.now(),id:Date.now().toString(),owner:orderWallet.address,action:'open',pair:orderPair,long,leverage:lev,collateralUnits:units.toString(),tradeIndexesBefore:livePositions.map(p=>p.index),label:`${long?'L':'S'} ${orderMarket.base} ${lev}×`,status:'Sending'};
pending.push(pendingRow);
const setStage=label=>{stage=label;pendingRow.stage=label;pendingRow.status='Sending · '+label;persist();};
const checkContext=()=>{if(wallet!==orderWallet||mode!=='live'||cfg.rpc!==orderRpc)throw Error('Live wallet, mode or RPC changed. Review again.');};
const checkQuote=()=>{checkContext();if(Math.abs(liveQuote(orderPair)/reviewPrice-1)*100>orderSlip)throw Error('Oracle moved beyond the reviewed slippage. Review the updated ticket.');};
setStage('Reading USDC allowance');
let allowance=await token.allowance(orderWallet.address,DIAMOND);
if(!allowance.eq(units)){
  const receipt=await submitTracked(signer,token.populateTransaction.approve(DIAMOND,units),pendingRow,'approvalHash',label=>setStage('USDC approval · '+label),checkQuote);
  pendingRow.approvalHash=receipt.transactionHash||pendingRow.approvalHash;
  pendingRow.approvalConfirmed=true;
  setStage('Verifying confirmed USDC allowance');
  allowance=await token.allowance(orderWallet.address,DIAMOND);
  if(!allowance.eq(units))throw Error('Exact USDC allowance was not confirmed; order was not submitted');
}
setStage('Simulating live order');
checkQuote();
const t={user:orderWallet.address,index:0,pairIndex:orderPair,leverage:Math.round(lev*1000),long,isOpen:true,collateralIndex:orderMarket.collateralIndex,tradeType:0,collateralAmount:units,openPrice:priceUnit(reviewPrice),tp:0,sl:0,isCounterTrade:false,positionSizeToken:0,__placeholder:0};
const args=[t,Math.round(orderSlip*1000),ZERO];
await s.callStatic.openTrade(...args);
const receipt=await submitTracked(signer,s.populateTransaction.openTrade(...args),pendingRow,'hash',label=>setStage('Open trade · '+label),checkQuote);
captureOrder(receipt,pendingRow,c);
pendingRow.status='Pending oracle execution';delete pendingRow.error;persist();refreshWallet();
}catch(e){
  if(mode==='live'||pendingRow){
    if(pendingRow){
      pendingRow.status=e.receipt?.status===0?'Failed on-chain':pendingRow.hash||(pendingRow.approvalHash&&!pendingRow.approvalConfirmed)?'Submission uncertain · check chain':'Failed · order not submitted';
      pendingRow.error=recordLiveError(stage,e,pendingRow);pendingRow.errorLogged=true;persist();
      if(pendingRow.approvalHash||pendingRow.hash)refreshWallet();
      toast(pendingRow.error);
    }else toast(recordLiveError(stage,e));
  }else toast(e.reason||e.message);
}finally{busy=false;render()}}

async function waitReceipt(tx){let timer;const receipt=tx.wait(1).catch(e=>{if(e.code==='TRANSACTION_REPLACED'&&!e.cancelled&&e.receipt?.status===1)return e.receipt;throw e});try{return await Promise.race([receipt,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Receipt timeout · submission uncertain; reconciliation continues')),60000)})]);}finally{clearTimeout(timer)}}
function captureOrder(receipt,p,c){for(const log of receipt.logs){try{let ev=c.interface.parseLog(log);if(ev.name==='MarketOrderInitiated')p.orderId=N(ev.args.orderId.index);if(ev.name==='PendingOrderStored'){p.orderId=N(ev.args.pendingOrder.index);p.tradeIndex=N(ev.args.pendingOrder.trade.index)}}catch{}}}
function reconcileConfirmedState(row,positions){if(row.orderId!==undefined)return false;if(row.action==='close'&&Number.isInteger(row.tradeIndex)&&!positions.some(p=>p.index===row.tradeIndex)){row.status='Closed';return true}if(row.action!=='open'||!Array.isArray(row.tradeIndexesBefore))return false;const before=new Set(row.tradeIndexesBefore.map(Number)),units=Number(row.collateralUnits),matches=positions.filter(p=>!before.has(p.index)&&p.pair===row.pair&&p.long===row.long&&Math.abs(p.lev-row.leverage)<1e-9&&Number.isFinite(units)&&Math.abs(p.amount*1e6-units)<.5);if(matches.length!==1)return false;row.tradeIndex=matches[0].index;row.status='Open';return true}
async function closeLive(p,reviewed=false,manual=true){if(busy)return false;busy=true;let row;try{if(!wallet||mode!=='live')throw Error('Load the position wallet in live mode first');const closeWallet=wallet,closeRpc=cfg.rpc;if(p.user&&p.user.toLowerCase()!==closeWallet.address.toLowerCase())throw Error('Position belongs to a different wallet');const checkContext=()=>{if(wallet!==closeWallet||mode!=='live'||cfg.rpc!==closeRpc)throw Error('Live wallet, mode or RPC changed. Review again.');};if(pending.some(x=>x.owner===wallet.address&&/Sending|Pending|uncertain|Order resolved/.test(x.status)))throw Error('An order is still pending. Wait for reconciliation before closing.');liveQuote(p.pair);if(!reviewed&&!confirm(`Close LIVE ${p.long?'long':'short'} ${levLabel(p.lev)}× position ${p.index}?`))return false;if(manual)closeRequestCue(liveValue(p));const c=await chain();checkContext();const signer=closeWallet.connect(provider),s=c.connect(signer);row={created:Date.now(),id:'c'+Date.now(),owner:closeWallet.address,action:'close',tradeIndex:p.index,pair:p.pair,long:p.long,leverage:p.lev,label:'Close '+p.index,status:'Sending'};pending.push(row);persist();const expected=priceUnit(liveQuote(p.pair));await s.callStatic.closeTradeMarket(p.index,expected);const r=await submitTracked(signer,s.populateTransaction.closeTradeMarket(p.index,expected),row,'hash',label=>{row.stage='Close trade · '+label;row.status='Sending · '+row.stage;persist();},()=>{checkContext();liveQuote(p.pair);});captureOrder(r,row,c);row.status='Pending oracle close';persist();if(!reviewed)showPaperClose({...p,status:'Close submitted · awaiting oracle settlement'},'Close submitted');refreshWallet();return true;}catch(e){if(row){row.status=e.receipt?.status===0?'Failed on-chain':row.hash?'Submission uncertain · check chain':'Failed';row.error=recordLiveError(row.stage||'Live close simulation',e,row);row.errorLogged=true;persist()}toast(row?.error||recordLiveError('Live close preflight',e));return false;}finally{busy=false}}

function applyPublicChange(p){const previous=publicTrades.find(x=>x.id===p.id);if(p.isOpen)p={...previous,...p,liq:p.liq>0?p.liq:previous?.liq};publicRevision++;publicChanges.set(p.id,{revision:publicRevision,p:p.isOpen?p:null,eventKey:p.eventKey});missingPublic.delete(p.id);const old=publicTrades.find(x=>x.id===p.id);publicTrades=publicTrades.filter(x=>x.id!==p.id);if(p.isOpen)publicTrades.push({...old,...p,liq:p.liq>0?p.liq:old?.liq});snapId++;renderPublic();}
function applyBackendChange(msg,net){try{if(msg.name==='liveEvents'||msg.name==='liveEvent'){applyBackendExecution(msg,net);return;}if(msg.name==='new-trade-history'){applyBackendHistory(msg,net);return;}if(msg.name==='deepReorg'){for(const id of publicChanges.keys())if(id.startsWith(net+':'))publicChanges.delete(id);missingPublic.clear();return;}const raw=msg.value?.trade?msg.value:msg.value?.user?{trade:msg.value}:null;if(!raw?.trade?.user||raw.trade.index===undefined)return;const id=net+':'+raw.trade.user.toLowerCase()+':'+N(raw.trade.index),old=publicTrades.find(p=>p.id===id)||knownPublic.get(id)||publicNoticeState.get(id)?.p;if(msg.name==='unregisterTrade'){applyPublicChange({id,isOpen:false});if(old){const action=publicAction(msg);if(action==='liq')notifyPublicTrade(old,action,quietEvents);else deferPublicClose(old,quietEvents);}return;}if(!['registerTrade','updateTrade','updateLeverage','updatePositionSize'].includes(msg.name))return;const merged={...old?.container,...raw,trade:{...old?.raw,...raw.trade,isOpen:true}};if(merged.trade.openPrice===undefined||merged.trade.pairIndex===undefined)return;const p=sdkPublic(merged,old,net);if(p){applyPublicChange(p);if(msg.name==='registerTrade')notifyPublicTrade(p,'open',quietEvents);}}catch{}}
function mergePublicSnapshot(next,okNets,revision){const result=new Map(next.map(p=>[p.id,p]));for(const p of publicTrades){if(!okNets.has(p.net||'POLYGON')){result.set(p.id,p);continue;}if(result.has(p.id)){missingPublic.delete(p.id);continue;}const n=(missingPublic.get(p.id)||0)+1;missingPublic.set(p.id,n);if(n<2)result.set(p.id,p);}
for(const [id,change]of publicChanges){if(change.revision>revision){if(change.p)result.set(id,change.p);else result.delete(id);}else if(change.p===null){result.delete(id);}else publicChanges.delete(id);}
for(const id of missingPublic.keys())if(!result.has(id))missingPublic.delete(id);return [...result.values()];}
let ratioCache={key:'',rows:[]};
function renderRatios(){const panel=$('ratioRows');if(!panel)return;const key=pair+':'+statsRevision;if(ratioCache.key!==key)ratioCache={key,rows:TradeState.leverageRatios(publicTrades.filter(chartPair))};const byValue=$('ratioBasis').value==='value';$('ratioScope').textContent=marketLabel(pair)+' · tracked public';const html=ratioCache.rows.map(g=>{const l=byValue?g.longValue:g.longCount,s=byValue?g.shortValue:g.shortCount,total=l+s,lp=total?Math.round(l/total*10000)/100:null,sp=lp===null?null:100-lp;return '<div class="ratio-card"><b>'+g.label+'</b><div><span class="long">L '+(lp===null?'—':lp.toFixed(2)+'%')+'</span> / <span class="short">S '+(sp===null?'—':sp.toFixed(2)+'%')+'</span></div><small>'+(byValue?money(l)+' : '+money(s):l+' : '+s)+' L:S'+(!total?' · no trades':'')+'</small><div class="ratio-track"><i style="width:'+(lp===null?0:lp)+'%"></i></div></div>';}).join('');if(panel.innerHTML!==html)panel.innerHTML=html;}
$('ratioBasis').onchange=renderRatios;
function marketAverages(){if(averageCache.pair!==pair||averageCache.revision!==statsRevision){const trades=publicTrades.filter(p=>chartPair(p)&&p.isOpen);averageCache={pair,revision:statsRevision,bands:TradeState.withLiqEstimates(TradeState.leverageAverages(trades),trades),sides:TradeState.withLiqEstimates(TradeState.sideStats(trades),trades)};}return averageCache.bands;}
function statsTable(rows,banded=false){return '<div class="stats-scroll"><table><thead><tr><th>Side'+(banded?' / band':'')+'</th><th>Positions</th><th>Collateral</th><th>Notional</th><th>Avg leverage</th><th>Avg entry</th><th>Avg LIQ (known)</th><th>Avg LIQ incl. estimates</th><th>LIQ coverage</th></tr></thead><tbody>'+rows.map(g=>'<tr><th class="'+(g.long?'long':'short')+'">'+(g.long?'L':'S')+(banded?' '+g.band+'×':'')+'</th><td>'+g.count+'</td><td>'+cashLabel(g.collateral)+'</td><td>'+cashLabel(g.notional??g.weight)+'</td><td>'+(Number.isFinite(g.leverage)?levLabel(g.leverage)+'×':banded?g.band+'×':'—')+'</td><td>'+money(g.entry)+'</td><td>'+money(g.liq>0?g.liq:NaN)+'</td><td>'+money((g.chartLiq??g.liq)>0?(g.chartLiq??g.liq):NaN)+(g.estimatedCount?' EST':'')+'</td><td>'+g.liqCount+'/'+g.count+(g.estimatedCount?' known · '+g.estimatedCount+' estimated':'')+'</td></tr>').join('')+'</tbody></table></div>';}
function renderStats(){if($('statsPanel').hidden)return;const now=Date.now(),tracked=publicTrades.filter(p=>p.isOpen&&chartPair(p)),mine=myPositions().map(p=>({...p,liq:safeLiq(p)})),quoteAge=lastOf(pair)>0?Math.max(0,(now-lastOf(pair))/1000):NaN;
renderConnectionDiagnostics();
$('statsMarket').textContent=marketLabel(pair)+' · '+mode.toUpperCase();
$('statsTransport').textContent=(window.Feed?'Native: '+(nativeStatus||'starting')+' · '+(nativeRunning?'monitor running':'background monitor off')+' · ':'')+(socket?.readyState===1?'Foreground socket connected':'Foreground recovery idle')+(nativeFeedError?' · '+nativeFeedError:'')+' · Index quote '+(Engine.freshQuote(indexPrices[pair],indexTimes[pair])?'fresh':'unavailable/stale');
$('statsFees').textContent=$('fees').textContent+' · Order estimate: '+$('quote').textContent;
$('statsFeed').textContent='Mark '+money(priceOf(pair)||NaN)+' · Index '+money(indexPrices[pair])+' · Quote age '+(Number.isFinite(quoteAge)?quoteAge.toFixed(1)+'s':'unavailable')+' · '+lastKbps.toFixed(1)+' KB/s · '+TradeState.syncStatus(priceOf(pair),lastOf(pair),now,syncBeganAt).text;
const chains=['POLYGON','ARBITRUM','BASE'].map(net=>net+' '+tracked.filter(p=>(p.net||'POLYGON')===net).length).join(' · ');
const net=myTotalNet(pair),cash=mode==='paper'?book.cash:liveBalance;
$('statsSummary').textContent=tracked.length+' tracked public positions · '+chains+' · '+mine.length+' own positions · Own estimated net '+money(net?net.total:mine.length?NaN:0)+' · Account available '+cashLabel(cash)+' · Pending orders '+pending.filter(p=>wallet&&p.owner?.toLowerCase()===wallet.address.toLowerCase()).length;
const bands=marketAverages();
const content='<h3>Public positions · all leverage</h3>'+statsTable(averageCache.sides)+'<h3>Public high-leverage bands</h3>'+(bands.length?statsTable(bands,true):'<p class="muted">No open positions at 50× or higher.</p>')+'<h3>Your positions · this market</h3>'+statsTable(TradeState.sideStats(mine));
if($('statsRows').innerHTML!==content)$('statsRows').innerHTML=content;
$('statsUpdated').textContent='Updated '+new Date(now).toLocaleTimeString()+' · Public entries/LIQs weighted by notional. Known LIQs shown separately. Chart averages include missing-price estimates: entry ± entry × 0.9 / leverage, before unknown fees, spread and dynamic thresholds; EST labels and coverage shown. Public P&L excludes unknown fees. Cached trade lines retained during feed delays.';}

function managePriceTransport(){if(document.hidden)return;const now=Date.now();if(window.Feed){if(!nativeRunning||now-syncBeganAt>8000&&(!fresh(pair)||!ticketIndexFresh())){if(!socket||socket.readyState===3||now-lastPriceConnect>15000&&now-Math.max(lastPriceFrame,lastPriceConnect)>15000)connectPrices();}}else if(!socket||socket.readyState===3||now-lastPriceConnect>15000&&now-Math.max(lastPriceFrame,lastPriceConnect)>15000)connectPrices();}
function ticketIndexFresh(){if(mode!=='live')return true;try{liveQuote(TradeConfig.orderMarket(pair,Number($('lev').value)).pairIndex);return true;}catch{return false;}}
function renderSyncStatus(){if(syncPair!==pair){syncPair=pair;syncBeganAt=Date.now();}const status=TradeState.syncStatus(priceOf(pair),lastOf(pair),Date.now(),syncBeganAt);$('connection').textContent=ticketIndexFresh()?status.text:'Gains oracle · waiting for order index';$('connection').className=status.delayed?'negative':'';$('desync').hidden=!status.delayed;$('desync').textContent=status.delayed?`Price feed delayed ${status.seconds}s · last prices and trade lines retained · orders paused when stale`:'';}
function openAccount(page){accountPage=page;try{$('drawer').hidden=true;$('accountPanel').hidden=false;$('shade').hidden=false;}catch{}syncNative();renderAccount();if(mode==='live'){refreshWallet();loadAccountHistory();}}
function renderAccount(){if($('accountPanel').hidden)return;const ps=mode==='paper'?book.positions:livePositions;const rows=accountPage==='history'?(mode==='paper'?book.history:liveHistory.filter(p=>wallet&&p.owner?.toLowerCase()===wallet.address.toLowerCase())):ps;const collateral=ps.reduce((s,p)=>s+p.amount,0),notional=ps.reduce((s,p)=>s+p.amount*p.lev,0);const values=ps.map(p=>mode==='paper'?Engine.value(p,priceOf(p.pair)||p.entry).net:liveValue(p));const net=values.every(Number.isFinite)?values.reduce((s,v)=>s+v,0):NaN;const cash=mode==='paper'?book.cash:liveBalance;const equity=Number.isFinite(cash)&&Number.isFinite(net)?cash+collateral+net:NaN;$('accountTitle').textContent=accountPage==='history'?'Past trades':'Portfolio';$('accountSummary').textContent=`${mode.toUpperCase()} · Available ${cashLabel(cash)} · Collateral ${money(collateral)} · Notional ${money(notional)} · Net ${money(net)} · Equity ${money(equity)} (estimated)`;setHTML('accountRows',rows.map(p=>{const v=accountPage==='history'?p.net:mode==='paper'?Engine.value(p,priceOf(p.pair)||p.entry).net:liveValue(p);return `<article class="account-row"><b>${esc(marketLabel(p.pair))}</b> <b class="${p.long?'long':'short'}">${p.long?'L':'S'} ${levLabel(p.lev)}×</b><p>Collateral ${cashLabel(p.amount)} · Entry ${money(p.entry)}${accountPage==='history'?' · Exit '+money(p.exit):''}</p><b class="${Number.isFinite(v)&&v<0?'negative':'positive'}">${accountPage==='history'?'Settled':'Estimated'} P&L ${money(v)}</b><small>${esc(p.status||'Open')}${accountPage==='history'&&p.kind==='paper'?' · '+esc(paperReceiptText(p)):''}${p.closed?' · '+esc(new Date(p.closed).toLocaleString()):''}</small></article>`}).join('')||'<p class="muted">No '+(accountPage==='history'?'past trades':'open positions')+' across any market.</p>');$('accountPortfolio').className=accountPage==='portfolio'?'active':'';$('accountHistory').className=accountPage==='history'?'active':'';}
let accountHistoryBusy=false;
async function loadAccountHistory(){if(!wallet||accountHistoryBusy)return;accountHistoryBusy=true;const owner=wallet.address.toLowerCase();try{const rows=await getPublicJson('/api/trading-history/24h?chainId=137');if(!Array.isArray(rows))throw Error('Invalid history');if(wallet?.address.toLowerCase()!==owner)return;for(const g of rows){if(String(g.address||'').toLowerCase()!==owner||!/CLOSE|LIQ/i.test(g.action||''))continue;const closed=Date.parse(g.date);if(!Number.isFinite(closed))continue;const pi=TradeConfig.allMarkets().find(m=>m.symbol===g.pair||m.symbol.replace('/','-')===g.pair)?.pairIndex;const id='history:'+String(g.tx||g.transactionHash||g.date)+':'+String(g.tradeIndex??g.index??g.pair);if(liveHistory.some(p=>p.id===id&&p.owner===owner))continue;liveHistory.unshift({id,owner,pair:pi,long:!!g.long,lev:+g.leverage,amount:null,entry:null,exit:Number.isFinite(+g.price)?+g.price:null,net:g.pnl_net!==null&&g.pnl_net!==undefined&&Number.isFinite(+g.pnl_net)?+g.pnl_net:null,closed,status:'Confirmed '+g.action});}liveHistory.sort((a,b)=>b.closed-a.closed);liveHistory=liveHistory.slice(0,200);persist();$('accountStatus').textContent='Confirmed Polygon closures from past 24h + locally observed closures. Settlement unavailable means no confirmed P&L yet.';}catch{$('accountStatus').textContent='Remote history unavailable · showing saved closures; no settlement values fabricated.';}finally{accountHistoryBusy=false;renderAccount();}}
function attachChrome(){
try{$('legendOpen').onclick=()=>{renderLegend();$('legendDialog').showModal()};$('closeLegend').onclick=()=>$('legendDialog').close();}catch{}
try{$('reconnectFeed').onclick=()=>{click();if(window.Feed&&nativeRunning&&Feed.reconnect)Feed.reconnect();connectPrices();toast('Reconnecting Gains price feed');};}catch{}
try{$('ratiosOpen').onclick=()=>{click();renderRatios();if(!$('ratiosDialog').open)$('ratiosDialog').showModal();};$('closeRatios').onclick=()=>$('ratiosDialog').close();}catch{}
try{$('chartInfoOpen').onclick=()=>{click();chartDetails(chartBars());if(!$('chartInfoDialog').open)$('chartInfoDialog').showModal();};$('closeChartInfo').onclick=()=>$('chartInfoDialog').close();}catch{}
try{$('statsOpen').onclick=()=>{hideAll();syncNative();$('statsPanel').hidden=false;$('shade').hidden=false;renderStats();};$('closeStats').onclick=hideAll;}catch{}
try{$('long').onclick=()=>{ensureAudio();return sendOrder(true)};}catch{}
try{$('short').onclick=()=>{ensureAudio();return sendOrder(false)};}catch{}
try{$('positions').onclick=e=>{if(bulkCloseBusy)return;const dismissal=e.target.dataset.dismissOrder;if(dismissal){dismissOrderError(dismissal);return;}const edit=e.target.dataset.exits,id=edit||e.target.dataset.close;if(!id)return;const p=(mode==='paper'?book.positions:livePositions).find(x=>x.id===id);if(p){if(edit){editExits(p);return;}if(mode==='paper'){try{closePaper(p)}catch(e){toast(e.message)}}else closeLive(p)}};}catch{}
try{$('menu').onclick=()=>{click();renderMarketList();$('drawer').hidden=false;$('shade').hidden=false;};}catch{}
try{$('traders').onclick=()=>{ensureAudio();click();renderPublic();$('tradersPanel').hidden=false;$('shade').hidden=false;};}catch{}
try{$('global').onclick=()=>{openGlobal();};}catch{}
try{$('globalOpen').onclick=()=>{hideAll();openGlobal();};}catch{}
try{$('closeGlobal').onclick=()=>{click();closeGlobal();};}catch{}
try{$('globalMine').onchange=()=>{globalOnlyPair=$('globalMine').checked;renderGlobal();};}catch{}
function hideAll(){try{$('statsPanel').hidden=true;}catch{}try{$('accountPanel').hidden=true;}catch{}try{$('drawer').hidden=true;}catch{}try{$('tradersPanel').hidden=true;}catch{}try{$('globalPanel').hidden=true;}catch{}try{$('shade').hidden=true;}catch{}}
try{$('exitApp').onclick=()=>{click();if(confirm('Fully turn off TwinTrade? This stops background monitoring and closes the app.')){try{if(window.Feed&&Feed.exitApp){Feed.exitApp();return;}}catch(e){}try{window.close();}catch(e){}toast('Full exit is available in the Android APK');}};}catch{}
try{$('shade').onclick=hideAll;}catch{}
try{document.querySelector('.dismiss').onclick=hideAll;}catch{}
try{$('closeTraders').onclick=hideAll;}catch{}
document.querySelectorAll('.marketchoice').forEach(b=>{if(b.onclick)return;});
try{$('marketList').onclick=e=>{const el=e.target.closest?.('[data-pair]');if(el){click();pair=+el.dataset.pair;selectedPublic=null;view.off=0;view.yOff=0;hideAll();renderMarketList();renderPublic();loadHistory(pair,Math.max(300,view.span),true);fetchMarketFees();render()}};}catch{}
try{document.querySelectorAll('.marketchoice').forEach(b=>{const prev=b.onclick;b.onclick=()=>{click();try{if(typeof prev==='function')prev();}catch{}if(b.dataset&&b.dataset.pair!==undefined&&b.dataset.pair!==''){pair=+b.dataset.pair;selectedPublic=null;view.off=0;view.yOff=0;try{renderMarketList();renderPublic();loadHistory(pair,Math.max(300,view.span),true);}catch{}render();}};});}catch{}
try{$('positionsTab').onclick=()=>{click();history=false;};}catch{}
try{$('historyTab').onclick=()=>{click();history=true;};}catch{}
try{$('settings').onclick=()=>{for(const k of Object.keys(defaults))$(''+k).value=cfg[k];try{$('soundOn').checked=soundOn;$('tickOn').checked=tickOn;$('soundProfile').value=soundProfile;$('soundLevel').value=String(soundLevel);}catch{}showRegistry();$('config').showModal()};}catch{}
try{$('closeConfig').onclick=()=>$('config').close();}catch{}
try{$('saveSettings').onclick=()=>{try{if(busy||bulkCloseBusy)throw Error('Wait for the current order or close batch before changing wallet or node settings');let c={};for(const k of Object.keys(defaults))c[k]=['rpc','eventRpc'].includes(k)?$(''+k).value.trim():+$(''+k).value;if(!c.rpc.startsWith('https://')||(c.eventRpc&&!c.eventRpc.startsWith('wss://')))throw Error('Use HTTPS and WSS endpoints');for(const k of ['fee','slip','borrow','funding','liq','maxSlip'])if(!Number.isFinite(c[k]))throw Error('Invalid cost input');if(c.fee<0||c.slip<0||c.slip>=100||c.borrow<0||c.liq<=0||c.liq>100||c.maxSlip<=0||c.maxSlip>65.535)throw Error('Cost input outside allowed range');cfg=c;try{soundOn=$('soundOn').checked;tickOn=$('tickOn').checked;soundProfile=['gentle','warm','minimal'].includes($('soundProfile').value)?$('soundProfile').value:'gentle';const level=+$('soundLevel').value;soundLevel=[.45,.7,1].includes(level)?level:1;}catch{}persist();renderAudioStatus();localStorage.setItem('config',JSON.stringify(cfg));provider?.removeAllListeners();eventProvider?.removeAllListeners();eventProvider?.destroy();provider=null;contract=null;eventProvider=null;if(wallet)wallet=wallet.connect(new ethers.providers.JsonRpcProvider(cfg.rpc));setupEvents();$('config').close();toast('Settings saved. Existing paper trades retain their original cost assumptions.')}catch(e){toast(e.message)}};}catch{}
try{$('saveKey').onclick=async()=>{try{if(busy||bulkCloseBusy)throw Error('Wait for the current order or close batch before changing wallet or node settings');let key=$('key').value.trim();if(!/^0x[0-9a-fA-F]{64}$/.test(key))throw Error('Private key must be 0x followed by 64 hex digits');let w=new ethers.Wallet(key);if(!window.Vault)throw Error('Encrypted key storage is available in the Android APK');let result=Vault.save(key);if(result!=='OK')throw Error(result);$('key').value='';wallet=w.connect(new ethers.providers.JsonRpcProvider(cfg.rpc));$('walletStatus').textContent=w.address;refreshWallet();toast('Key encrypted with Android Keystore')}catch(e){toast(e.message)}};}catch{}
try{$('forgetKey').onclick=()=>{if(busy||bulkCloseBusy){toast('Wait for the current order or close batch before removing the wallet');return;}if(confirm('Forget the stored key? Existing on-chain positions remain open.')){window.Vault?.forget();wallet=null;mode='paper';$('key').value='';$('walletStatus').textContent='Key removed'}};}catch{}
try{$('switchMode').onclick=async()=>{if(busy||bulkCloseBusy){toast('Wait for the current order or close batch before switching mode');return;}if(mode==='live'){mode='paper';return}try{if(!wallet)throw Error('Save a key first');await chain();await refreshWallet();if(confirm('Enable LIVE Polygon trading? Orders will spend real USDC after review.')){mode='live';$('config').close()}}catch(e){toast(e.reason||e.message)}};}catch{}
try{$('reset').onclick=()=>{if(confirm('Clear paper positions and history, and reset to $100?')){if(window.Feed)Feed.reset();book={cash:100,positions:[],history:[]};persist();eventSound('respawn');pushEvent('Respawn $100','');}};}catch{}
try{$('mute').onclick=()=>{if(soundOn||tickOn){soundOn=false;tickOn=false;toast('Sounds muted');}else{soundOn=true;tickOn=true;ensureAudio();click();toast('Event and price sounds enabled');}persist();render();};$('enableAudio').onclick=()=>{soundOn=true;tickOn=true;ensureAudio();$('soundOn').checked=true;$('tickOn').checked=true;persist();eventSound('my-long');render();};}catch{}
let soundPreviewBusy=false;
try{$('previewSounds').onclick=async()=>{if(soundPreviewBusy)return;soundPreviewBusy=true;$('previewSounds').disabled=true;ensureAudio();const keepS=soundOn,keepT=tickOn;soundOn=true;tickOn=true;try{for(const [kind,label] of SOUND_PREVIEW_SEQUENCE){toast('Sound: '+label);eventSound(kind);await new Promise(r=>setTimeout(r,Math.max(SOUND_PREVIEW_GAP_MS,eventCueDuration(kind)*1000+80)));}toast('Preview done');}finally{soundOn=keepS;tickOn=keepT;soundPreviewBusy=false;$('previewSounds').disabled=false;persist();renderAudioStatus();}};}catch{}
try{$('clusterToggle').onchange=()=>{clusterOn=$('clusterToggle').checked;persist();};}catch{}
try{$('retryPublic').onclick=()=>{click();loadPublicSnapshot(true);};}catch{}
try{$('zoomIn').onclick=()=>{click();setChartSpan(view.span/1.5);};}catch{}
try{$('resetChart').onclick=()=>{click();view={span:75,off:0,yOff:0};chartInterval=0;selectedPublic=null;othersCache.key='';renderPublic();draw();};$('portfolioOpen').onclick=()=>openAccount('portfolio');$('pastTradesOpen').onclick=()=>openAccount('history');$('closeAccount').onclick=hideAll;$('accountPortfolio').onclick=()=>{accountPage='portfolio';renderAccount()};$('accountHistory').onclick=()=>{accountPage='history';renderAccount()};}catch{}
try{$('zoomOut').onclick=()=>{click();setChartSpan(view.span*1.5);};}catch{}
try{const cv=$('chart');const ptrs=new Map();let base=null,pinchD=0;const maxOff=()=>Math.max(0,candlesOf(pair).length-1);
cv.addEventListener('pointerdown',e=>{ensureAudio();try{cv.setPointerCapture(e.pointerId);}catch{}ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});if(ptrs.size===1&&!base)base={x:e.clientX,y:e.clientY,off:view.off,yOff:view.yOff};if(ptrs.size===2){const q=[...ptrs.values()];pinchD=Math.hypot(q[0].x-q[1].x,q[0].y-q[1].y);}});
cv.addEventListener('pointermove',e=>{if(!ptrs.has(e.pointerId))return;ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
if(ptrs.size===2){const q=[...ptrs.values()];const d=Math.hypot(q[0].x-q[1].x,q[0].y-q[1].y);if(pinchD>0&&Math.abs(d-pinchD)>4){setChartSpan(view.span*pinchD/d);pinchD=d;}return;}
if(ptrs.size===1&&base){const dx=e.clientX-base.x,dy=e.clientY-base.y;if(Math.abs(dx)+Math.abs(dy)>2){view.off=Math.max(0,Math.min(maxOff(),base.off+Math.round(dx*view.span/chartPlot(cv.getBoundingClientRect().width).candleWidth)));view.yOff=base.yOff+dy/400;draw();}}});
cv.addEventListener('pointerup',e=>{ptrs.delete(e.pointerId);if(!ptrs.size){base=null;pinchD=0;requestChartHistory();}});
cv.addEventListener('pointercancel',e=>{ptrs.delete(e.pointerId);if(!ptrs.size){base=null;pinchD=0;}});
cv.addEventListener('wheel',e=>{e.preventDefault();setChartSpan(view.span*(e.deltaY<0?1/1.2:1.2));},{passive:false});}catch{}
}
function renderFees(){try{const el=$('fees');if(!el)return;const m=TradeConfig.orderMarket(pair,+$('lev').value),feePair=m.pairIndex,f=marketFees[feePair],rates=holdingRatesFresh(feePair);el.textContent=`${m?m.symbol:pair} · ${rates?'Borrow L '+(f.borrowLongHourly??f.borrowHourly)+'%/h / S '+(f.borrowShortHourly??f.borrowHourly)+'%/h · Fund L '+f.fundLongHourly+'%/h / S '+f.fundShortHourly+'%/h (Polygon)':'Holding rates unavailable · paper assumptions'} · Base open/close ${paperCosts(feePair,true).fee}%${f&&Number.isFinite(f.feePct)?' (Polygon)':' (estimate)'} · negative funding = earned`; }catch{}}

/* Hourly holding rates (docs: holding-rates). Polygon chainId 137 first,
 * then the Polygon chainId-filtered backend-global mirror. */
function holdingRatesFresh(pi){const f=marketFees[pi];return !!f&&Number.isFinite(f.borrowHourly)&&Number.isFinite(f.fundLongHourly)&&Number.isFinite(f.fundShortHourly)&&Date.now()-(f.at||0)>=0&&Date.now()-(f.at||0)<180000;}
const holdingRatesRequests=new Map();
function parseHoldingRates(j){let rows,source;try{rows=MarketData.rateRows(j);source=MarketData.rates(j);}catch{return null;}const row=rows[rows.length-1],number=v=>v===null||v===undefined||v===''?NaN:Number(v),b=number(row.borrowingFeeV2HourlyRate??row.borrowingFeeHourlyRate),fL=number(row.fundingFeeLongHourlyRate),fS=number(row.fundingFeeShortHourlyRate),legacyPresent=row.borrowingFeeV1LongHourlyRate!==undefined||row.borrowingFeeV1ShortHourlyRate!==undefined,v1L=legacyPresent?number(row.borrowingFeeV1LongHourlyRate):0,v1S=legacyPresent?number(row.borrowingFeeV1ShortHourlyRate):0;if(![b,fL,fS,v1L,v1S].every(Number.isFinite)||b<0||v1L<0||v1S<0)return null;
// v2/funding are fractions; legacy v1 is ALREADY percent, and is side-specific.
return {at:source.at,borrowHourly:b*100,borrowLongHourly:b*100+v1L,borrowShortHourly:b*100+v1S,fundLongHourly:fL*100,fundShortHourly:fS*100};}
function recoverPaperHolding(pi){const f=marketFees[pi];if(!holdingRatesFresh(pi))return;const args=[pi,f.borrowLongHourly??f.borrowHourly,f.borrowShortHourly??f.borrowHourly,f.fundLongHourly,f.fundShortHourly];if(window.Feed?.recoverHoldingRates){if(Feed.recoverHoldingRates(...args)>0){book=JSON.parse(Feed.paper());persist();}}else if(!window.Feed&&Engine.recoverHoldingRates(book,...args)>0)persist();}
function fetchHoldingRates(pi){if(holdingRatesRequests.has(pi))return holdingRatesRequests.get(pi);const request=(async()=>{const urls=[`${PUBLIC_BASE}/api/holding-rates/3/${pi}?chainId=137`,'https://backend-global.gains.trade/api/holding-rates/3/'+pi+'?chainId=137','https://backend-polygon.gains.dev/api/holding-rates/3/'+pi+'?chainId=137','https://backend-global.gains.dev/api/holding-rates/3/'+pi+'?chainId=137'];for(const u of urls){try{const rates=parseHoldingRates(await fetchJson(u));if(!rates)continue;marketFees[pi]={...marketFees[pi],...rates,feePct:marketFees[pi]?.feePct??NaN,src:'Polygon holding-rates'};marketFeesAt=Date.now();recoverPaperHolding(pi);render();return true;}catch{}}return false;})();holdingRatesRequests.set(pi,request);request.finally(()=>holdingRatesRequests.delete(pi));return request;}
async function refreshOpenHoldingRates(){const pairs=[...new Set((mode==='paper'?book.positions:livePositions).map(p=>p.pair))];for(const pi of pairs)if(!holdingRatesFresh(pi))await fetchHoldingRates(pi);}
function holdingEstimate(pi,long,amount,lev){const c=paperCosts(pi,long),rate=c.borrow+(Number.isFinite(c.fundingSide)?c.fundingSide:(long?1:-1)*c.funding),hourly=amount*lev*rate/100;return `${long?'L':'S'} hold ${money(Math.abs(hourly))}/h ${hourly<0?'credit':'cost'} (${(Math.abs(rate)*lev).toFixed(4)}% collateral/h)`;}
function paperCosts(pi,long){const f=marketFees[pi],c={...cfg};if(f&&Number.isFinite(f.feePct))c.fee=f.feePct;else if(TradeConfig.marketOrNull(pi)?.degen)c.fee=.02;if(f&&Number.isFinite(f.spreadPct))c.slip=f.spreadPct;else if([300,313,327].includes(pi))c.slip=0;if(holdingRatesFresh(pi)){c.borrow=(long?f.borrowLongHourly:f.borrowShortHourly)??f.borrowHourly;c.fundingSide=long?f.fundLongHourly:f.fundShortHourly;c.holdingSource='Polygon market rate saved at entry';}else c.holdingSource='Paper assumptions (market rates unavailable)';return c;}
const marketFeesLoading=new Set();
async function fetchMarketFees(){let pi;try{pi=TradeConfig.orderMarket(pair,+$('lev').value).pairIndex;}catch{return;}if(marketFeesLoading.has(pi))return;marketFeesLoading.add(pi);try{fetchHoldingRates(pi);try{const c=await chain();const [fee,registered]=await Promise.all([c.pairTotalPositionSizeFeeP(pi),c.pairs(pi)]);marketFees[pi]={...marketFees[pi],feePct:N(fee)/1e10,spreadPct:N(registered.spreadP)/1e10,feeAt:Date.now(),src:'Polygon contract + holding-rates'};renderFees();}catch{/* Retain explicit paper assumptions when Polygon is unavailable. */}}finally{marketFeesLoading.delete(pi);}}


let nativeCaps='',nativeCapsAt=0,nativeBookRaw='';const nativeCandleRevisions=new Map();
function syncNative(){if(!window.Feed)return;try{if(Date.now()-nativeCapsAt>5000){nativeCapsAt=Date.now();const caps=JSON.stringify(TradeConfig.leverageMarkets().map(m=>({pairIndex:m.pairIndex,maxLeverage:m.maxLeverage,minLeverage:m.minLeverage})));if(caps!==nativeCaps&&Feed.updateCaps){Feed.updateCaps(caps);nativeCaps=caps;}}}catch{}try{const s=JSON.parse(Feed.snapshotFor?Feed.snapshotFor(pair,nativeCandleRevisions.get(pair)??-1):Feed.snapshot());const prevPx={};for(const k of Object.keys(prices))prevPx[k]=prices[k];const prevTail=(candles[pair]||[]).slice(-1)[0]||null;const nowMs=Date.now();if(Array.isArray(s.prices)){for(let k=0;k<2;k++){const v=s.prices[k]||0,t=(Array.isArray(s.times)?s.times[k]:0)||0;if(v>0&&nowMs-t<10000){prices[k]=v;last[k]=t;}}}if(s.indexPrices)for(const k of Object.keys(s.indexPrices)){const v=+s.indexPrices[k],t=+((s.indexTimes||{})[k]||0);if(Engine.freshQuote(v,t)&&t>=(indexTimes[k]||0)){indexPrices[k]=v;indexTimes[k]=t;}}if(s.pricesByPair)for(const k of Object.keys(s.pricesByPair)){const v=+s.pricesByPair[k]||0,t=+((s.timesByPair||{})[k]||0);if(v>0&&nowMs-t<10000){prices[k]=v;last[k]=t;}}if(Array.isArray(s.candles)){for(let k=0;k<s.candles.length;k++)if(s.candles[k]?.length)candles[k]=Engine.mergeCandles(candles[k],s.candles[k]);}if(s.candlesByPair)for(const k of Object.keys(s.candlesByPair))candles[k]=Engine.mergeCandles(candles[k],s.candlesByPair[k]);if(s.selectedCandles){for(const k of Object.keys(s.selectedCandles))candles[k]=nativeCandleRevisions.get(+k)===s.candleRevision?Engine.mergeLiveTail(candles[k],s.selectedCandles[k]):Engine.mergeCandles(candles[k],s.selectedCandles[k]);nativeCandleRevisions.set(pair,s.candleRevision);}
/* Native bridge moves make the same sounds as socket moves. */
try{if(prevPx[pair]>0&&priceOf(pair)>0&&priceOf(pair)!==prevPx[pair]){onTick(prevPx[pair],priceOf(pair));checkCrossings(prevPx[pair],priceOf(pair));}const tail=(candles[pair]||[]).slice(-1)[0]||null;if(prevTail&&tail&&tail.t!==prevTail.t&&Number.isFinite(prevTail.o)&&Number.isFinite(prevTail.c))onCandleClose(prevTail);}catch{}
if(Feed.backgroundEvent){const event=JSON.parse(Feed.backgroundEvent());if(event.at&&(!tradeEvents.get(event.pair)||tradeEvents.get(event.pair).at<event.at))showTradeEvent(event.text,event.action,event.long,event.at,'background',event.id,event.pair);}
const bookRaw=Feed.paper();if(bookRaw!==nativeBookRaw){
 const next=JSON.parse(bookRaw);
 if(nativeBookRaw&&!document.hidden){const prior=new Set(JSON.parse(nativeBookRaw).history.map(p=>p.id)),closed=next.history.filter(p=>!prior.has(p.id)&&Date.now()-p.closed<2000);for(const p of closed.reverse())eventSound(paperCloseCue(p));}
 book=next;nativeBookRaw=bookRaw;
}try{if(typeof s.history==='string'&&s.history)$('historyStatus').textContent=s.history;}catch{}try{nativeRunning=!!s.running;nativeStatus=s.status||'';nativeFeedError=s.feedError||'';nativeAcceptedAt=+s.lastAcceptedFrame||0;$('keepAlive').checked=s.keepAlive!==undefined?!!s.keepAlive:!!s.running;}catch{}}catch{}}
async function fetchHistoryChain(chain,apiSym,from,to){const j=await fetchJson(`https://api.gains.trade/v1/${chain}/markets/${apiSym}/candles?interval=1m&from=${from}&to=${to}`);return {rows:Engine.history(j.data),chain};}
/* Reference price for PnL display: live oracle first, else latest candle
 * close, so colors/percentages show even before a feed tick arrives. */
function refPrice(p){const live=priceOf(p);if(live>0)return live;try{const a=candlesOf(p);if(a.length&&a[a.length-1].c>0)return a[a.length-1].c;}catch{}return 0;}
const historyLoading=new Set(),historyRetryTimers=new Map(),historyRequested=new Map(),historyRepairCursor=new Map(),historyRetryAttempts=new Map();
async function fetchHistoryRange(chain,sym,from,to){const ranges=[];for(let t=from;t<to;t+=300*60000)ranges.push([t,Math.min(to,t+300*60000)]);const rows=[];let succeeded=0,error;for(let i=0;i<ranges.length;i+=3){const pages=await Promise.allSettled(ranges.slice(i,i+3).map(([f,t])=>fetchHistoryChain(chain,sym,f,t)));for(const p of pages){if(p.status==='fulfilled'){succeeded++;rows.push(...p.value.rows);}else error=p.reason;}}if(!succeeded)throw error||Error('History unavailable');return {rows,chain};}
function scheduleHistoryRetry(targetPair,minutes,progress){const attempts=progress?0:(historyRetryAttempts.get(targetPair)||0)+1;historyRetryAttempts.set(targetPair,attempts);const delay=Math.min(300000,30000*2**Math.min(4,Math.max(0,attempts-1)));clearTimeout(historyRetryTimers.get(targetPair));historyRetryTimers.set(targetPair,setTimeout(()=>{historyRetryTimers.delete(targetPair);if(targetPair===pair&&!document.hidden)loadHistory(targetPair,minutes);},delay));}
async function loadHistory(targetPair=pair,requestedMinutes=Math.max(300,view.span),showProgress=false){
 if(historyLoading.has(targetPair)){historyRequested.set(targetPair,Math.max(historyRequested.get(targetPair)||0,requestedMinutes));return;}
 clearTimeout(historyRetryTimers.get(targetPair));historyRetryTimers.delete(targetPair);historyLoading.add(targetPair);if(showProgress&&targetPair===pair)loadingProgress('history:'+targetPair,5,'Loading candle history…');
 const before=candlesOf(targetPair).filter(c=>c.source==='gap-fill').length;let failed=false;
 try{
  const m=TradeConfig.marketOrNull(targetPair),apiSym=m?TradeConfig.apiSymbol(m):(targetPair?'ETH':'BTC')+'-USD',to=Date.now();let from=to-Math.min(10080,requestedMinutes)*60000;const retained=candlesOf(targetPair);if(historyLoadedAt[targetPair]&&retained.length&&retained[0].t<=from+60000)from=Math.max(from,to-300*60000);let got;
  try{got=await fetchHistoryRange('polygon',apiSym,from,to);if(!got.rows.length)throw Error('Empty history');}catch(e1){got=await fetchHistoryRange('arbitrum',apiSym,from,to);if(!got.rows.length)throw e1;}
  candles[targetPair]=Engine.mergeCandles(candlesOf(targetPair),got.rows);historyLoadedAt[targetPair]=Date.now();if(showProgress&&targetPair===pair)loadingProgress('history:'+targetPair,80,`History loaded · ${got.rows.length} candles · checking gaps`);
  if(targetPair===pair&&snapshotBusy)setLoadBar(38,'History loaded · drawing…');else if(targetPair===pair)setLoadBar(100,'Ready');
  if(targetPair===pair)$('historyStatus').textContent=`Gains history + live · 1m (${got.chain})`;
 }catch{failed=true;if(targetPair===pair){$('historyStatus').textContent='History unavailable · cached/live · backfill pending';setLoadBar(100,'History pending · live only');}}
 try{
  const m=TradeConfig.marketOrNull(targetPair),sym=m?TradeConfig.apiSymbol(m):(targetPair?'ETH':'BTC')+'-USD';
  const plan=Engine.gapRepairPlan(candlesOf(targetPair),historyRepairCursor.get(targetPair)||0);historyRepairCursor.set(targetPair,plan.next);
  await Promise.all(plan.ranges.map(async r=>{
   for(const chain of ['polygon','arbitrum']){
    try{const got=await fetchHistoryChain(chain,sym,r.from-60000,r.to+60000);candles[targetPair]=Engine.mergeCandles(candlesOf(targetPair),got.rows);if(!candlesOf(targetPair).some(c=>c.source==='gap-fill'&&c.t>=r.from&&c.t<r.to))break;}catch{/* Retain successful pages and live prices. */}
   }
  }));
 }finally{
  const remaining=candlesOf(targetPair).filter(c=>c.source==='gap-fill').length;
  if(failed||remaining)scheduleHistoryRetry(targetPair,requestedMinutes,remaining<before);else historyRetryAttempts.delete(targetPair);
  if(showProgress)loadingProgress('history:'+targetPair,100,failed?'History unavailable · cached/live · retry scheduled':remaining?`History loaded · ${remaining} gaps · repair scheduled`:'Candle history ready',true);historyLoading.delete(targetPair);const next=historyRequested.get(targetPair)||0;historyRequested.delete(targetPair);if(next>requestedMinutes)loadHistory(targetPair,next);
 }
}
try{$('respawn').onclick=()=>{if(mode==='paper')$('reset').onclick()};}catch{}
try{$('keepAlive').onchange=()=>{if(window.Feed)Feed.keepAlive($('keepAlive').checked)};}catch{}
try{$('battery').onclick=()=>window.Feed?.batterySettings();}catch{}


async function getPublicJson(path){return fetchJson(PUBLIC_BASE+path);}
async function getChainJson(net,path,ms){const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),ms||15000);try{const r=await fetch(net.host+path,{signal:ctl.signal});if(!r.ok)throw Error(net.name+' HTTP '+r.status);return await r.json()}finally{clearTimeout(timer)}}
const CHAINS=[{name:'POLYGON',host:PUBLIC_BASE},{name:'ARBITRUM',host:'https://backend-arbitrum.gains.trade'},{name:'BASE',host:'https://backend-base.gains.trade'}];
const COLLATERAL_DECIMALS={1:18,2:18,3:6,4:18};
const loadingTasks=new Map();let progressHideT=0;
function loadingProgress(task,pct,detail,done=false){loadingTasks.set(task,{pct:Math.max(0,Math.min(100,pct)),detail,done});paintLoading();}
function paintLoading(){try{const visible=[...loadingTasks.entries()].filter(([k])=>!k.startsWith('history:')||k==='history:'+pair).map(([,v])=>v),active=visible.filter(t=>!t.done),rows=active.length?active:visible;if(!rows.length){$('loadingProgress').hidden=true;return;}clearTimeout(progressHideT);const el=$('loadingProgress'),bar=$('loadingBar');el.hidden=false;bar.value=rows.reduce((n,t)=>n+t.pct,0)/rows.length;$('loadingDetails').textContent=rows.map(t=>t.detail).join(' · ');if(!active.length)progressHideT=setTimeout(()=>{el.hidden=true;loadingTasks.clear();},3500);}catch{}}
let loadHideT=0;
function setLoadBar(pct,msg){try{const el=$('syncMessage');if(!el)return;const text=String(msg||'').trim();if(text==='Ready')return;clearTimeout(loadHideT);if(!text){el.textContent='';el.hidden=true;return;}el.textContent=text;el.hidden=false;loadHideT=setTimeout(()=>{el.hidden=true;el.textContent='';},pct>=100?3500:8000);}catch{}}
let reloadAt=0,reloadTimer=0,snapStartAt=0,loadAttempts=0,fullyLoaded=false;
let publicReloadPending=false;
function queuePublicReload(){if(snapshotBusy){publicReloadPending=true;return;}if(reloadTimer)return;reloadTimer=setTimeout(()=>{reloadTimer=0;reloadAt=Date.now();loadPublicSnapshot();},2500);}
function sdkPublic(raw,previous,net){const t=raw.trade;if(!t||!displayablePair(N(t.pairIndex))||!t.isOpen||N(t.tradeType)!==0)return null;const p={...previous,...normalize(t),kind:'public',container:raw,isOpen:true,net:net||(previous&&previous.net)||'POLYGON'};p.id=p.net+':'+t.user.toLowerCase()+':'+N(t.index);const ci=N(t.collateralIndex);if(publicVars&&p.net==='POLYGON'){const col=publicVars.globalTradingVariables.collaterals[ci-1];if(col)p.amount=N(t.collateralAmount)/10**col.collateralConfig.decimals*(col.prices?.collateralPriceUsd||1);else p.amount=N(t.collateralAmount)/10**(COLLATERAL_DECIMALS[ci]||18);}else p.amount=N(t.collateralAmount)/10**(COLLATERAL_DECIMALS[ci]||18);return p;}
let liqRecalcBusy=false;
async function recalcPublic(){if(!publicVars||liqRecalcBusy)return;liqRecalcBusy=true;try{let processed=0;const g=publicVars.globalTradingVariables;for(const p of publicTrades){if(p.net&&p.net!=='POLYGON')continue;if(!p.isOpen||!p.container||!priceOf(p.pair))continue;try{const t=GainsMath.convertTradeContainer(p.container,g.collaterals);if(!t.tradeFeesData&&t.tradeInfo.contractsVersion<2)t.tradeFeesData={realizedPnlCollateral:0,realizedTradingFeesCollateral:0};const ctx=GainsMath.buildLiquidationPriceContext(g,t,{currentBlock:publicVars.blockNumber,currentTimestamp:Math.floor(Date.now()/1000),currentPairPrice:(indexPrices[p.pair]||priceOf(p.pair)),spreadP:g.pairs[p.pair]?g.pairs[p.pair].spreadP:0,traderFeeMultiplier:1});const liq=GainsMath.getLiquidationPrice(t.trade,ctx);if(!Number.isFinite(liq)||liq<=0)throw Error('Liquidation unavailable');p.liq=liq;p.liqTime=Date.now();p.liqError=false;}catch{p.liqError=true}if(++processed%40===0)await new Promise(r=>setTimeout(r,0));}renderPublic();}finally{liqRecalcBusy=false;}}
let liqBusy=false;
/* Polygon-only contract liq backfill for the nearest liq-less lines.
 * Used when the backend vars/SDK math is unavailable (verified v10 shape
 * mismatch) so pink LIQ lines still appear. */
async function backfillPublicLiq(){if(liqBusy)return;liqBusy=true;try{const c=await chain();const near=publicTrades.filter(p=>p.isOpen&&p.net==='POLYGON'&&!p.liq&&priceOf(p.pair)).sort((a,b)=>Math.abs(a.entry-priceOf(a.pair))-Math.abs(b.entry-priceOf(b.pair))).slice(0,12);for(const p of near){try{const t=p.container?p.container.trade:p.raw;if(!t||!t.user)continue;const lp=await c.getTradeLiquidationParams(t.user,t.index);const v=await c.getTradeLiquidationPrice({collateralIndex:t.collateralIndex,trader:t.user,pairIndex:t.pairIndex,index:t.index,openPrice:t.openPrice,long:t.long,collateral:t.collateralAmount,leverage:t.leverage,additionalFeeCollateral:0,liquidationParams:lp,currentPairPrice:priceUnit(priceOf(p.pair)),isCounterTrade:t.isCounterTrade,partialCloseMultiplier:1e10,beforeOpened:false});const liq=N(v)/1e10;if(liq>0){p.liq=liq;p.liqError=false;renderPublic();}}catch{}}}catch{}finally{liqBusy=false;}}
let firstPublicDone=publicTrades.length>0;knownPublic=new Map(publicTrades.map(p=>[p.id,p]));
async function loadPublicSnapshot(manual){if(snapshotBusy){if(manual===true)publicReloadPending=true;return;}snapshotBusy=true;snapStartAt=Date.now();loadAttempts++;const loud=manual===true||loadAttempts===1;if(loud)loadingProgress('traders',5,'Loading traders · Polygon / Arbitrum / Base');if(loud)setLoadBar(6,'Loading open trades · Polygon + Arbitrum + Base…');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let completedChains=0;const chainProgress={};
try{
const revision=publicRevision;const old=new Map(publicTrades.map(p=>[p.id,p]));
const next=[];let skipped=0;const perNet={};const chainErr=[];
const keyOf=(net,raw)=>{try{return net+':'+raw.trade.user.toLowerCase()+':'+N(raw.trade.index);}catch{return net+':?';}};
/* Each chain streams independently: a slow chain never blocks the others. */
const doChain=async net=>{let rows;try{rows=await getChainJson(net,'/open-trades',20000);if(!Array.isArray(rows)||rows.some(r=>!r?.trade?.user||r.trade.index===undefined))throw Error('Invalid open-trades snapshot');}catch(e){chainErr.push(net.name+' '+String((e&&e.message)||e));chainProgress[net.name]='unavailable';return;}let idx=0;const total=rows.length;while(idx<total){const end=Math.min(idx+60,total);for(;idx<end;idx++){try{const p=sdkPublic(rows[idx],old.get(keyOf(net.name,rows[idx])),net.name);if(p){next.push(p);perNet[p.net]=(perNet[p.net]||0)+1;}else skipped++;}catch{skipped++;}}if(loud){setLoadBar(6+Math.round(54*next.length/Math.max(1,total)),`Loading open trades… ${next.length} so far`);}chainProgress[net.name]=`${idx}/${total}`;if(loud)loadingProgress('traders',10+50*(completedChains+idx/Math.max(1,total))/CHAINS.length,Object.entries(chainProgress).map(([n,p])=>`${n} ${p}`).join(' · '));await sleep(0);}completedChains++;};
await Promise.all(CHAINS.map(doChain));
const okNets=new Set();for(const r of [{net:'POLYGON'},{net:'ARBITRUM'},{net:'BASE'}])okNets.add(r.net);
for(const line of chainErr.map(e=>e.split(' ')[0]))okNets.delete(line);
for(const q of publicTrades){if(!okNets.has(q.net||'POLYGON')&&!next.some(w=>w.id===q.id))next.push(q);}
const errs=chainErr.join('; ');
if(okNets.size)publicLoadedAt=Date.now();snapId++;const capped=mergePublicSnapshot(next,okNets,revision);const wasFirst=!firstPublicDone;notePublicDiff(capped,true);publicTrades=capped;
if(wasFirst&&capped.length)pushEvent(`Tracking ${capped.length} live open trades`,'');
if(loud)loadingProgress('traders',70,'Computing liquidation prices');if(loud)setLoadBar(70,'Computing liquidations…');
try{if(manual===true||Date.now()-publicVarsAttemptAt>60000){publicVarsAttemptAt=Date.now();let vars=null,verr=null;for(const u of ['/trading-variables/all','/trading-variables']){try{vars=await getChainJson(CHAINS[0],u,20000);break;}catch(e){verr=e;}}if(!vars)throw verr||Error('vars unavailable');try{publicVars=GainsMath.transformGlobalTradingVariables(vars);publicVarsAt=Date.now();}catch(e){publicVars=null;throw Error('liq math unavailable ('+((e&&e.message)||'backend too new').slice(0,60)+')');}}await recalcPublic();}
catch(e){try{$('publicStatus').textContent='Entries live · '+e.message+' · contract liq backfill running';}catch{}try{backfillPublicLiq();}catch{}}
const counts=`POL ${perNet.POLYGON||0} · ARB ${perNet.ARBITRUM||0} · BASE ${perNet.BASE||0}`;
if(okNets.size)firstPublicDone=true;
try{$('publicStatus').textContent=`${publicTrades.length} open traders (${counts})${skipped?` · skipped ${skipped}`:''}${errs?' · '+errs:''} · tap a trader to focus`;renderMarketList();}catch{}renderPublic();if(loud)setLoadBar(100,`${publicTrades.length} open trades synced`);
}catch(e){try{$('publicStatus').textContent='Trader snapshot unavailable: '+e.message;}catch{}if(!publicTrades.length){try{await loadPublicFromChain()}catch(err){try{$('publicStatus').textContent+=' · RPC fallback unavailable';}catch{}}}else{try{$('publicStatus').textContent+=' · keeping previous lines';}catch{}}if(loud)setLoadBar(100,'Offline — retrying');}finally{if(loud)loadingProgress('traders',100,`${publicTrades.length} traders tracked · `+(publicLoadedAt>=snapStartAt?'sync complete':'cached data · retry pending'),true);snapshotBusy=false;if(publicReloadPending){publicReloadPending=false;queuePublicReload();}}}
async function loadPublicFromChain(){const c=await chain(),found=[];for(let offset=0;;offset+=100){const trades=await c.getAllTrades(offset,100);for(const t of trades)if(t.isOpen&&N(t.tradeType)===0&&displayablePair(N(t.pairIndex))){const p={...normalize(t),kind:'public',isOpen:true,net:'POLYGON'};p.id='POLYGON:'+p.id;if(N(t.collateralIndex)!==3){const col=await c.getCollateral(t.collateralIndex),usd=await c.getCollateralPriceUsd(t.collateralIndex);p.amount=N(t.collateralAmount)/N(col.precision)*N(usd)/1e8}try{const lp=await c.getTradeLiquidationParams(t.user,t.index);p.liq=N(await c.getTradeLiquidationPrice({collateralIndex:t.collateralIndex,trader:t.user,pairIndex:t.pairIndex,index:t.index,openPrice:t.openPrice,long:t.long,collateral:t.collateralAmount,leverage:t.leverage,additionalFeeCollateral:0,liquidationParams:lp,currentPairPrice:priceUnit(priceOf(p.pair)||p.entry),isCounterTrade:t.isCounterTrade,partialCloseMultiplier:1e10,beforeOpened:false}))/1e10}catch{p.liqError=true}found.push(p)}if(trades.length<100)break}notePublicDiff(found.slice());publicTrades=mergePublicSnapshot(found,new Set(['POLYGON']),publicRevision);renderPublic();try{$('publicStatus').textContent=`${found.length} open traders · Polygon snapshot`;}catch{}}
function setupPublicBackend(){const generation=++publicBackendGeneration,retry=()=>{if(generation===publicBackendGeneration)setupPublicBackend();};noteConnection('POLYGON','connecting','opening socket');loadPublicSnapshot();const previous=publicSocket;publicSocket=null;if(previous)try{previous.close();}catch{}let s;try{s=GainsRouting.socket('wss://backend-polygon.gains.trade');}catch(e){try{$('publicStatus').textContent='Trade stream blocked · retrying';}catch{}const d=Math.min(30000,2500*Math.pow(2,publicRetry++));noteConnection('POLYGON','retry','socket blocked',d);setTimeout(retry,d);return;}publicSocket=s;s.onopen=()=>{if(s===publicSocket){noteConnection('POLYGON','open','waiting for data');tradeFeedStatus(true);}};publicSocket.onmessage=e=>{if(s!==publicSocket)return;try{rxBytes+=e.data.length;rxWindow+=e.data.length;const msg=JSON.parse(e.data);if(s!==publicSocket)return;publicRetry=0;touchConnection('POLYGON');applyBackendChange(msg,'POLYGON');if(msg.name==='currentBlock'&&publicVars){publicVars.blockNumber=Number(msg.value);return}if(['registerTrade','unregisterTrade','updateTrade','updateLeverage','updatePositionSize','deepReorg','tradingVariables','liveEvents','liveEvent','new-trade-history'].includes(msg.name)){pushGlobalLive(msg,'POLYGON');if(msg.name==='tradingVariables')discoverAssets();if(!publicRefreshTimer)publicRefreshTimer=setTimeout(()=>{publicRefreshTimer=0;queuePublicReload()},1200)}}catch{}};publicSocket.onclose=()=>{if(s!==publicSocket)return;const d=Math.min(30000,2500*Math.pow(2,publicRetry++));noteConnection('POLYGON','retry','socket closed',d);try{$('publicStatus').textContent='Trade stream retrying…';}catch{}setTimeout(retry,d);};publicSocket.onerror=()=>{};}
try{$('publicTrades').onclick=e=>{const el=e.target.closest?.('[data-public]');if(el){selectedPublic=selectedPublic===el.dataset.public?null:el.dataset.public;try{$('tradersPanel').hidden=true;$('shade').hidden=true;}catch{}renderPublic();draw()}};}catch{}
setInterval(()=>{if(document.hidden)return;recalcPublic();if(Date.now()-snapStartAt>60000)loadPublicSnapshot()},5000);
setInterval(()=>{if(document.hidden)return;renderStats();const now=Date.now(),ms=now-lastRateAt;if(ms>=1000){lastKbps=Engine.dataRate(rxWindow,ms);rxWindow=0;lastRateAt=now;try{$('kbps').textContent=lastKbps.toFixed(1)+' KB/s';$('livedot').className=fresh(pair)?'on':'';}catch{}}},1000);
setInterval(()=>{if(!document.hidden&&!historyRetryTimers.has(pair))loadHistory(pair);},60000);setInterval(()=>{fetchMarketFees();refreshOpenHoldingRates()},30000);
setInterval(()=>{try{if(!$('globalPanel').hidden||Date.now()-globalAt>180000)loadGlobal();}catch{}},60000);

let leverageKey='';
function syncLeverage(){try{const b=TradeConfig.leverageBounds(pair),key=pair+':'+b.min+':'+b.max,el=$('lev');if(key===leverageKey)return;leverageKey=key;el.min=String(b.min);el.max=String(b.max);el.disabled=!(b.max>0);$('leverageRange').textContent=b.max?'LEVERAGE · '+b.min+'–'+b.max+'×':'LEVERAGE · UNAVAILABLE';const value=+el.value;if(!Number.isFinite(value)||value<b.min||value>b.max)el.value=String(Math.min(b.max,Math.max(b.min,Number.isFinite(value)?value:b.min)));const options=[...new Set([b.min,1.1,2,3,4,5,10,20,25,50,75,100,125,150,200,250,300,400,500,750,1000,b.max])].filter(v=>{try{TradeConfig.orderMarket(pair,v);return true;}catch{return false;}}).sort((a,b)=>a-b);$('levPresets').innerHTML='<option value="">Quick ×</option>'+options.map(v=>'<option value="'+v+'">'+v+'×</option>').join('');$('levPresets').value='';}catch{}}

function showRegistry(){try{$('registry').innerHTML=`Chain: ${NETWORK.chainId}<br>Diamond: ${NETWORK.diamond}<br>Pyth: ${NETWORK.pyth}<br>Native USDC: ${NETWORK.usdc} (${NETWORK.usdcDecimals} decimals)<br>gUSDC vault: ${NETWORK.usdcVault}<hr>`+TradeConfig.markets.map(m=>`${m.symbol}: pair ${m.pairIndex}, collateral ${m.collateralIndex}, configured max ${m.maxLeverage}×${m.degen?' (DEGEN, separate feed)':''}<br>Pyth feed: ${m.feedId||'Not configured; uses Gains stream'}<br>`).join('');}catch{}}
try{$('nodeDefaults').onclick=()=>{$('rpc').value=NETWORK.httpsRpc;$('eventRpc').value=NETWORK.wssRpc;$('nodeStatus').textContent='Defaults restored. Save settings to apply.'};}catch{}
try{$('testNode').onclick=async()=>{let rpc=null,ws=null;const button=$('testNode');button.disabled=true;$('nodeStatus').textContent='Testing HTTPS, WSS, contracts and registry…';try{const httpUrl=$('rpc').value.trim(),wsUrl=$('eventRpc').value.trim();if(!httpUrl.startsWith('https://')||!wsUrl.startsWith('wss://'))throw Error('Use HTTPS and WSS URLs');rpc=new ethers.providers.JsonRpcProvider({url:httpUrl,timeout:12000});if((await rpc.getNetwork()).chainId!==NETWORK.chainId)throw Error('HTTPS node is not Polygon');for(const [label,address]of [['Diamond',DIAMOND],['Native USDC',NETWORK.usdc],['gUSDC vault',NETWORK.usdcVault],['Pyth',NETWORK.pyth]])if(await rpc.getCode(address.toLowerCase())==='0x')throw Error(label+' has no deployed code');const c=new ethers.Contract(DIAMOND,GABI,rpc),col=await c.getCollateral(NETWORK.collateralIndex);if(!col.isActive||col.collateral.toLowerCase()!==NETWORK.usdc.toLowerCase())throw Error('Collateral index 3 does not match active native USDC');const token=new ethers.Contract(NETWORK.usdc.toLowerCase(),['function decimals() view returns(uint8)'],rpc);if(N(await token.decimals())!==NETWORK.usdcDecimals)throw Error('USDC decimals mismatch');const btc=await c.pairs(TradeConfig.market(0).pairIndex);if(btc.from!=='BTC'||btc.to!=='USD')throw Error('Pair zero does not match BTC/USD');ws=new ethers.providers.WebSocketProvider(wsUrl);let timer;try{const net=await Promise.race([ws.getNetwork(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('WSS connection timed out')),12000)})]);if(net.chainId!==NETWORK.chainId)throw Error('WSS node is not Polygon')}finally{clearTimeout(timer)}$('nodeStatus').textContent='Verified: HTTPS/WSS Polygon 137, deployed contracts, native USDC and BTC/USD registry. No transactions sent.';}catch(e){$('nodeStatus').textContent='Connection check failed: '+(e.reason||e.message)}finally{rpc?.removeAllListeners();ws?.destroy();button.disabled=false}};}catch{}

attachChrome();
renderMarketList();
try{$('clusterToggle').checked=clusterOn;}catch{}
try{if(window.Vault){const k=Vault.load();if(/^0x[0-9a-fA-F]{64}$/.test(k))wallet=new ethers.Wallet(k,new ethers.providers.JsonRpcProvider(cfg.rpc))}}catch{}if(window.Feed){Feed.seed(JSON.stringify(book));syncNative()}else{loadChartsSnapshot().then(ok=>{if(ok)draw();});connectPrices()}loadHistory(pair,Math.max(300,view.span),true);setupEvents();setupPublicBackend();try{connectNetLive(NETS[1]);connectNetLive(NETS[2]);}catch{}discoverAssets().then(()=>loadGlobal());fetchMarketFees();setInterval(()=>{if(Date.now()-assetsAt>300000)discoverAssets()},60000);setInterval(loadChartsSnapshot,120000);setInterval(()=>{try{if(!fresh(pair))loadChartsSnapshot();}catch{}},25000);setInterval(()=>{if(!document.hidden)render()},250);setInterval(refreshWallet,12000);setupRowToggles();managePriceTransport();setInterval(managePriceTransport,5000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)onAppResume();else checkpointSession();});window.addEventListener('pagehide',checkpointSession);window.addEventListener('resize',draw);

syncLeverage();
$('dollars').oninput=renderOrderTicket;
$('amount').onchange=()=>{$('dollars').value='';renderOrderTicket();};
$('sizeSlider').oninput=()=>{$('dollars').value='';$('amount').value='custom';renderOrderTicket();};
$('levSlider').oninput=()=>{const slider=$('levSlider');$('lev').value=Number(Number(slider.value).toFixed(3));renderOrderTicket();};
$('levSlider').onchange=()=>{fetchMarketFees();render();};
try{$('levPresets').onchange=()=>{if($('levPresets').value){$('lev').value=$('levPresets').value;$('levPresets').value='';fetchMarketFees();render();}};$('lev').oninput=()=>render();$('lev').onchange=()=>{fetchMarketFees();render();};}catch{}

try{$('zoomMenu').onclick=()=>{const panel=$('zoomPanel');panel.hidden=!panel.hidden;$('zoomMenu').setAttribute('aria-expanded',String(!panel.hidden));};$('zoomMin').onclick=()=>chartRange(10080);$('zoomMax').onclick=()=>chartRange(10);$('zoomPanel').onclick=e=>{const range=e.target.closest?.('[data-range]'),interval=e.target.closest?.('[data-interval]');if(range)chartRange(+range.dataset.range);if(interval){chartInterval=+interval.dataset.interval;draw();}};if(savedSession.overlay!==undefined)$('overlay').checked=savedSession.overlay;if(savedSession.avgOverlay!==undefined)$('avgOverlay').checked=savedSession.avgOverlay;renderPublic();}catch{}

try{$('lev').addEventListener('change',()=>{fetchMarketFees();render();});}catch{}

refreshDeviceTimeZone();
