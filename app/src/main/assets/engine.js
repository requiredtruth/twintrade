/* Pure paper accounting; all rates are percentages of notional.
 * v0.4.0: pairs are any non-negative Gains pairIndex (full market registry
 * lives in config.js / TradeConfig). Per-market leverage caps are enforced
 * by the UI layer via TradeConfig.market(pair).maxLeverage. */
(function(root){
const finite=x=>Number.isFinite(x)&&x>0;
function parsePrices(raw){const v=parseV4(raw);return v.mark;}
/* v4 pricing: {"m":[pair,price,...],"i":[pair,price,...],"t":ms} (mark/index).
 * Legacy v3: flat [pair,price,...]. Singleton [ts] heartbeat → empty. */
function parseV4(raw){let a;try{a=typeof raw==='string'?JSON.parse(raw):raw;}catch{return {mark:[],index:[],t:0};}const flat=x=>{if(!Array.isArray(x)||x.length<=1||x.length%2)return [];let out=[];for(let i=0;i<x.length;i+=2)if(Number.isInteger(x[i])&&x[i]>=0&&finite(x[i+1]))out.push([x[i],x[i+1]]);return out;};if(a&&typeof a==='object'&&!Array.isArray(a))return {mark:flat(a.m),index:flat(a.i),t:Number(a.t)||0};const f=flat(a);return {mark:f,index:f,t:0};}
function maxLevFor(pair){try{if(root.TradeConfig&&root.TradeConfig.marketOrNull){const m=root.TradeConfig.marketOrNull(pair);if(m)return m.maxLeverage;}}catch{}return pair===0?200:pair===1?500:1000;}
function validateCosts(c){if(!c||typeof c!=='object')throw Error('Invalid cost assumptions');for(const k of ['fee','slip','borrow','funding','liq'])if(!Number.isFinite(c[k]))throw Error('Invalid cost assumptions');if(c.fee<0||c.slip<0||c.slip>=100||c.borrow<0||c.liq<=0||c.liq>100)throw Error('Cost assumptions outside allowed range');return c;}
function freshQuote(price,time,now=Date.now(),maxAge=5000){return finite(price)&&Number.isFinite(time)&&time>0&&time<=now&&now-time<maxAge;}
function open(pair,long,amount,lev,price,cost,now=Date.now()){validateCosts(cost);if(![amount,lev,price].every(finite)||!Number.isInteger(pair)||pair<0||pair>1000||lev<1||typeof long!=='boolean'||lev>maxLevFor(pair))throw Error('Invalid order');const c={...cost};return {id:'p'+now+Math.random().toString(16).slice(2),pair,long,amount,lev,entry:price*(1+(long?1:-1)*c.slip/100),opened:now,cost:c,status:'Paper open',kind:'paper'};}
function value(p,price,now=Date.now()){const n=p.amount*p.lev,dir=p.long?1:-1,exit=price*(1-dir*p.cost.slip/100),hours=Math.max(0,now-p.opened)/3600000,holdRate=p.cost.borrow+(p.long?1:-1)*p.cost.funding,hold=n*holdRate/100*hours,openFee=n*p.cost.fee/100,closeFee=n*p.cost.fee/100,gross=n*dir*(exit/p.entry-1);return {gross,hold,holdRate,openFee,closeFee,net:gross-openFee-closeFee-hold};}
function liquidation(p,now=Date.now()){const v=value(p,p.entry,now),n=p.amount*p.lev,dir=p.long?1:-1;return p.entry*(1+dir*(-p.amount*p.cost.liq/100+v.openFee+v.closeFee+v.hold)/n)/(1-dir*p.cost.slip/100);}
function collateral(balance,percent){if(!Number.isFinite(balance)||balance<0||!finite(percent)||percent>100)throw Error('Choose collateral from 1–100%');return Math.floor(balance*percent/100*1e6)/1e6;}
function history(rows){if(!Array.isArray(rows))throw Error('Invalid candle history');return rows.map(r=>{let t=Number(r.time);if(t>=1e9&&t<1e12)t*=1000;t=Math.floor(t/60000)*60000;return {t,o:Number(r.open),h:Number(r.high),l:Number(r.low),c:Number(r.close),source:'gains-history'};}).filter(c=>c.t>0&&[c.o,c.h,c.l,c.c].every(finite)&&c.h>=Math.max(c.o,c.c)&&c.l<=Math.min(c.o,c.c)).sort((a,b)=>a.t-b.t);}
/* Group only EXACT same-side duplicates: identical entry price AND identical
 * leverage collapse to one line (amounts summed, liq averaged). Everything
 * else stays individual — no more near-price averaging. */
function clusterEntries(trades,tolerancePct){const out={singles:[],groups:[]};for(const side of [true,false]){const byKey=new Map();for(const t of trades){if(!!t.long!==side)continue;const k=(t.lev||0)+':'+t.entry;if(!byKey.has(k))byKey.set(k,[]);byKey.get(k).push(t);}for(const chunk of byKey.values()){if(chunk.length<2){out.singles.push(chunk[0]);}else{const liqs=chunk.map(t=>t.liq).filter(v=>Number.isFinite(v)&&v>0);out.groups.push({long:side,entry:chunk[0].entry,count:chunk.length,members:chunk.map(t=>t.id),amount:chunk.reduce((s,t)=>s+(t.amount||0),0),lev:chunk[0].lev||0,aggregated:true,exact:true,liq:liqs.length?liqs.reduce((s,v)=>s+v,0)/liqs.length:undefined,kind:'aggregate'});}}}return out;}
/* Classify a price move for tick sounds: direction + big/small. */
function moveClass(prev,next,bigPct=0.05){if(!(prev>0)||!(next>0)||prev===next)return 'flat';const pct=(next-prev)/prev*100;const big=Math.abs(pct)>=bigPct;if(pct>0)return big?'up-big':'up-small';return big?'down-big':'down-small';}
/* Bytes → KB/s over a window. */
function dataRate(bytes,ms){if(!(bytes>=0)||!(ms>0))return 0;return bytes/1024/(ms/1000);}
/* Merge same-minute buckets (defensive: history/charts/live/native merges must
 * never show a bar twice). All times are floored to the minute so unaligned
 * feeds (seconds, ms offsets) collapse into one bar. Prefers live OHLC,
 * widens h/l, sorts, caps 600. */
function dedupeCandles(list){if(!Array.isArray(list))return [];const m=new Map();for(const c of list){if(!c||!(c.t>0)||![c.o,c.h,c.l,c.c].every(finite)||c.h<Math.max(c.o,c.c)||c.l>Math.min(c.o,c.c)||c.h<c.l)continue;let raw=Number(c.t);if(raw>=1e9&&raw<1e12)raw*=1000;const t=Math.floor(raw/60000)*60000;if(!(t>0))continue;const k=m.get(t);if(!k){m.set(t,{t,o:+c.o,h:+c.h,l:+c.l,c:+c.c,source:c.source});continue;}const live=c.source==='gains-live',kLive=k.source==='gains-live',useLive=live||!kLive;const o=useLive?+c.o:k.o,cc=useLive?+c.c:k.c;if(![o,cc].every(Number.isFinite))continue;m.set(t,{t,o,h:Math.max(k.h,+c.h),l:Math.min(k.l,+c.l),c:cc,source:live?c.source:(kLive?k.source:(c.source||k.source))});}return [...m.values()].filter(c=>[c.o,c.h,c.l,c.c].every(Number.isFinite)).sort((a,b)=>a.t-b.t).slice(-600);}
function avgNet(nets){if(!Array.isArray(nets))return null;const f=nets.filter(Number.isFinite);return f.length?f.reduce((s,v)=>s+v,0)/f.length:null;}
/* Sound mood from average open P&L: positive / negative / flat (none). */
function positionMood(avg,hasPositions){if(!hasPositions||!Number.isFinite(avg)||avg===0)return 'flat';return avg>0?'positive':'negative';}
const api={validateCosts,freshQuote,parsePrices,parseV4,open,value,liquidation,collateral,history,dedupeCandles,clusterEntries,moveClass,dataRate,avgNet,positionMood,maxLevFor};root.Engine=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
