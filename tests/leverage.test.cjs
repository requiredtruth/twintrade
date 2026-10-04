const assert=require('node:assert/strict'),C=require('../app/src/main/assets/config.js'),E=require('../app/src/main/assets/engine.js');
const cost={fee:0,slip:0,borrow:0,funding:0,liq:90};
for(const m of C.allMarkets()){for(const lev of [m.minLeverage,m.maxLeverage]){assert.equal(C.orderMarket(m.pairIndex,lev).pairIndex,m.pairIndex);assert.equal(E.open(m.pairIndex,true,1,lev,100,cost).lev,lev);}assert.throws(()=>E.open(m.pairIndex,true,1,m.minLeverage-.001,100,cost));assert.throws(()=>E.open(m.pairIndex,true,1,m.maxLeverage+.001,100,cost));}
for(const lev of [1.1,1.101,149.999,150])assert.equal(C.orderMarket(2,lev).pairIndex,2);
for(const lev of [1,150.001,1.1001,NaN,Infinity])assert.throws(()=>C.orderMarket(2,lev));
C.discover([{pairIndex:2,symbol:'LINK/USD',minLeverage:1.1,maxLeverage:125},{pairIndex:21,symbol:'EUR/USD',minLeverage:10,maxLeverage:750}]);assert.equal(C.orderMarket(2,125).maxLeverage,125);assert.throws(()=>C.orderMarket(2,150));assert.throws(()=>C.orderMarket(21,1.1));assert.equal(C.orderMarket(21,750).maxLeverage,750);
C.discover([{pairIndex:2,symbol:'LINK/USD',minLeverage:1.1,maxLeverage:.001}]);assert(!C.allMarkets().some(m=>m.pairIndex===2));assert.equal(C.leverageMarkets().find(m=>m.pairIndex===2).maxLeverage,.001);assert.throws(()=>C.orderMarket(2,1.1));
console.log('PASS: every bundled market minimum/maximum, 1.1x and 0.001x precision, 150x altcoins, live min/max overrides, forex bounds and delisted bridge caps.');
