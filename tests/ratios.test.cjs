const assert=require('node:assert/strict'),{leverageRatios}=require('../app/src/main/assets/trade-state.js');
const trade=(lev,long,amount=10,isOpen=true)=>({lev,long,amount,isOpen});
const rows=leverageRatios([trade(1.1,true),trade(9.999,false),trade(10,true),trade(49.999,false),trade(50,true),trade(75,false),trade(100,true),trade(150,false),trade(200,true),trade(500,false),trade(1000,true),trade(100,false,10,false),trade(NaN,true)]);
assert.equal(rows[0].longCount,6);assert.equal(rows[0].shortCount,5);assert.equal(rows.slice(1).reduce((n,g)=>n+g.longCount+g.shortCount,0),11);
assert.equal(rows.find(g=>g.min===10).longCount,1);assert.equal(rows.find(g=>g.min===500).shortCount,1);assert.equal(rows.find(g=>g.min===1000).longCount,1);
const weighted=leverageRatios([trade(100,true,1),trade(100,false,3)])[0];assert.equal(weighted.longValue/(weighted.longValue+weighted.shortValue),.25);assert.equal(weighted.longCount,weighted.shortCount);assert.equal(leverageRatios([])[0].longCount,0);
console.log('PASS: exact fractional tier boundaries, no duplicate membership, closed/invalid exclusion, totals and count versus position-value weighting');
