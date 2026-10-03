const assert=require('node:assert/strict'),T=require('../app/src/main/assets/trade-state.js');
const p={isOpen:true,long:true,lev:100,entry:100,amount:10,liq:90};const g=T.leverageAverages([p,{...p,amount:30,entry:110,liq:0},{...p,long:false,lev:74,liq:115},{...p,lev:10},{...p,isOpen:false}]);
assert.equal(g.length,2);const l=g.find(x=>x.long);assert.equal(l.entry,107.5);assert.equal(l.liq,90);assert.equal(l.count,2);assert.equal(l.liqCount,1);assert.equal(g.find(x=>!x.long).band,75);
assert.equal(T.syncStatus(100,1000,30999).delayed,false);assert.equal(T.syncStatus(100,1000,31000).delayed,true);assert.equal(T.syncStatus(100,6000,6001).delayed,false);assert.equal(T.syncStatus(0,0,31000,1000).delayed,true);
console.log('PASS: notional-weighted side/leverage averages, missing liquidation denominator, low leverage exclusion and 30-second desync/recovery.');

const sides=T.sideStats([p,{...p,entry:110,amount:30,liq:undefined},{...p,amount:NaN},{...p,isOpen:false}]);assert.equal(sides[0].entry,107.5);assert.equal(sides[0].liq,90);assert.equal(sides[0].count,2);assert.equal(sides[0].notional,4000);assert.equal(sides[1].entry,null);assert.equal(sides[1].liq,null);assert.equal(T.syncStatus(0,0,30999,1000).delayed,false);
