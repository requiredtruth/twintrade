const assert=require('node:assert/strict'),P=require('../app/src/main/assets/performance.js');
const now=1800000000000,trade=(id,net,amount=100,closed=now)=>({id,net,amount,closed,opened:closed-3600000,long:true});
let s=P.calculate([trade('c',20,100,now),trade('a',10,100,now-2),trade('b',-5,100,now-1)],{now});
assert.equal(s.net,25);assert.equal(s.count,3);assert.equal(s.wins,2);assert.equal(s.losses,1);assert.equal(s.profitFactor,6);assert.equal(s.maxDrawdown,5);assert.deepEqual(s.curve.map(p=>p.net),[0,10,5,25]);assert.equal(s.averageHold,3600000);assert(Math.abs(s.sharpe-((.1-.05+.2)/3)/Math.sqrt((.1-1/12)**2/2+(-.05-1/12)**2/2+(.2-1/12)**2/2))<1e-10);assert(Math.abs(s.sortino-(1/12)/Math.sqrt(.0025/3))<1e-10);
s=P.calculate([trade('a',10),trade('a',10),trade('b',null),trade('c',0),trade('d',100,0),trade('future',1,100,now+1)],{now});assert.equal(s.count,3);assert.equal(s.returnCount,2);assert.equal(s.net,110);assert.equal(s.excluded,1);assert.equal(s.breakeven,1);assert(Number.isNaN(s.sortino));assert(Number.isNaN(s.profitFactor));
s=P.calculate([trade('old',100,100,now-8*86400000),trade('new',-10)],{now,days:7});assert.equal(s.count,1);assert.equal(s.net,-10);assert.equal(s.maxDrawdown,10);assert(Number.isNaN(s.sharpe));assert(Number.isNaN(s.sortino));
s=P.calculate([],{now});assert.equal(s.count,0);assert.equal(s.net,0);assert(Number.isNaN(s.winRate));assert(Number.isNaN(s.sharpe));
s=P.calculate([trade('a',10),trade('b',10)],{now});assert(Number.isNaN(s.sharpe),'Zero volatility is not an infinite ratio');
console.log('PASS closed-trade analytics: ordering, net, drawdown, wins/losses, duplicate/unknown exclusion, sample Sharpe, downside Sortino and range filters');
