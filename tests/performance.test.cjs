const assert=require('node:assert/strict');
const Engine=require('../app/src/main/assets/engine.js');
const now=Date.now(),t=Math.floor(now/60000)*60000;
const bar=(time,c,source='gains-live')=>({t:time,o:c,h:c+1,l:c-1,c,source});
for(const [existing,incoming] of [
 [[bar(t,100)],[bar(t,102)]],
 [[bar(t-60000,100,'gains-history')],[bar(t-60000,102)]],
 [[bar(t-60000,100,'gains-history')],[bar(t-60000,102,'gains-history')]],
 [[bar(t-60000,100)],[bar(t,102)]],
 [[bar(t-60000,100),bar(t,101)],[bar(t-60000,102)]],
 [[bar(t,100)],[{...bar(t,102),l:104}]],
 [[bar(t,100)],[bar(t,102,'gap-fill')]],
 [[],[bar(t,100)]]
]){
 const expected=Engine.mergeCandles(existing,incoming,now);
 const result=Engine.mergeLiveTail(structuredClone(existing),incoming,now);
 assert.deepEqual(result,expected,'incremental merge must preserve reconciliation semantics');
}
const week=Array.from({length:10080},(_,i)=>bar(t-(10079-i)*60000,100));const reference=week;
for(let i=0;i<100;i++){const result=Engine.mergeLiveTail(week,[bar(t,101+i)],now);assert.equal(result,reference,'tail update must not rebuild week');assert.equal(result.length,10080);}
assert.equal(week[0].c,100);assert.equal(week.at(-1).c,200);
console.log('PASS: incremental live-tail parity (history authority, gaps, invalid candles, rollovers) and 100 retained-week updates without rebuilding history.');
