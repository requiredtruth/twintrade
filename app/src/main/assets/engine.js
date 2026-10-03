/* Pure paper accounting; all rates are percentages of notional. */
(function(root){
const finite=x=>Number.isFinite(x)&&x>0;
function parsePrices(raw){let a=typeof raw==='string'?JSON.parse(raw):raw;if(!Array.isArray(a)||a.length<=1||a.length%2)return [];let out=[];for(let i=0;i<a.length;i+=2)if((a[i]===0||a[i]===1)&&finite(a[i+1]))out.push([a[i],a[i+1]]);return out;}
function open(pair,long,amount,lev,price,cost,now=Date.now()){if(![amount,lev,price].every(finite)||lev>(pair===0?200:500)||!Number.isInteger(pair)||pair<0||pair>1)throw Error('Invalid order');const c={...cost};return {id:'p'+now+Math.random().toString(16).slice(2),pair,long,amount,lev,entry:price*(1+(long?1:-1)*c.slip/100),opened:now,cost:c,status:'Paper open',kind:'paper'};}
function value(p,price,now=Date.now()){const n=p.amount*p.lev,dir=p.long?1:-1,exit=price*(1-dir*p.cost.slip/100),hours=Math.max(0,now-p.opened)/3600000,holdRate=p.cost.borrow+(p.long?1:-1)*p.cost.funding,hold=n*holdRate/100*hours,openFee=n*p.cost.fee/100,closeFee=n*p.cost.fee/100,gross=n*dir*(exit/p.entry-1);return {gross,hold,holdRate,openFee,closeFee,net:gross-openFee-closeFee-hold};}
function liquidation(p,now=Date.now()){const v=value(p,p.entry,now),n=p.amount*p.lev,dir=p.long?1:-1;return p.entry*(1+dir*(-p.amount*p.cost.liq/100+v.openFee+v.closeFee+v.hold)/n)/(1-dir*p.cost.slip/100);}
function collateral(balance,percent){if(!Number.isFinite(balance)||balance<0||!finite(percent)||percent>100)throw Error('Choose collateral from 1–100%');return Math.floor(balance*percent/100*1e6)/1e6;}
function history(rows){if(!Array.isArray(rows))throw Error('Invalid candle history');return rows.map(r=>({t:Number(r.time),o:Number(r.open),h:Number(r.high),l:Number(r.low),c:Number(r.close),source:'gains-history'})).filter(c=>c.t>0&&[c.o,c.h,c.l,c.c].every(finite)&&c.h>=Math.max(c.o,c.c)&&c.l<=Math.min(c.o,c.c)).sort((a,b)=>a.t-b.t);}
const api={parsePrices,open,value,liquidation,collateral,history};root.Engine=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
