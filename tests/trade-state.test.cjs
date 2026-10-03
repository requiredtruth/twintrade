const assert=require('node:assert/strict'),T=require('../app/src/main/assets/trade-state.js');
const p={isOpen:true,long:true,lev:100,entry:100,amount:10,liq:90};const g=T.leverageAverages([p,{...p,amount:30,entry:110,liq:0},{...p,long:false,lev:74,liq:115},{...p,lev:10},{...p,isOpen:false}]);
assert.equal(g.length,2);const l=g.find(x=>x.long);assert.equal(l.entry,107.5);assert.equal(l.liq,90);assert.equal(l.count,2);assert.equal(l.liqCount,1);assert.equal(g.find(x=>!x.long).band,75);
assert.equal(T.syncStatus(100,1000,30999).delayed,false);assert.equal(T.syncStatus(100,1000,31000).delayed,true);assert.equal(T.syncStatus(100,6000,6001).delayed,false);assert.equal(T.syncStatus(0,0,31000,1000).delayed,true);
console.log('PASS: notional-weighted side/leverage averages, missing liquidation denominator, low leverage exclusion and 30-second desync/recovery.');

const sides=T.sideStats([p,{...p,entry:110,amount:30,liq:undefined},{...p,amount:NaN},{...p,isOpen:false}]);assert.equal(sides[0].entry,107.5);assert.equal(sides[0].liq,90);assert.equal(sides[0].count,2);assert.equal(sides[0].notional,4000);assert.equal(sides[1].entry,null);assert.equal(sides[1].liq,null);assert.equal(T.syncStatus(0,0,30999,1000).delayed,false);

const missing=[{...p,liq:undefined},{...p,lev:200,entry:110,amount:30,liq:0},{...p,long:false,lev:25,liq:null},{...p,isOpen:false,entry:9999}];
const estimated=T.withLiqEstimates(T.sideStats(missing),missing);
assert.equal(T.estimateLiq(p),99.1);assert(Math.abs(T.estimateLiq({...p,long:false})-100.9)<1e-10);
assert.equal(estimated[0].estimatedCount,2);assert.equal(estimated[0].liq,null);
assert(Math.abs(estimated[0].chartLiq-(99.1*1000+109.505*6000)/7000)<1e-10);
assert(Math.abs(estimated[1].chartLiq-103.6)<1e-10);assert.equal(estimated[1].estimatedCount,1);
assert.equal(T.estimateLiq({...p,lev:NaN}),null);assert.equal(T.estimateLiq({...p,lev:0}),null);
const mix=T.withLiqEstimates(T.sideStats([p,...missing]),[p,...missing])[0];assert.equal(mix.liq,90);assert.equal(mix.liqCount,1);assert.equal(mix.chartLiqCount,3);
const bands=T.withLiqEstimates(T.leverageAverages(missing),missing);assert.equal(bands.length,2);assert(Math.abs(bands.find(g=>g.band===200).chartLiq-109.505)<1e-10);
assert.equal(T.withLiqEstimates(T.sideStats([]),[])[0].chartLiq,null);
console.log('PASS: estimated long/short LIQs, mixed known/estimated weighting, all leverage and band coverage, invalid/closed positions excluded.');
