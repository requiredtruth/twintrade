/* User-supplied Polygon connection and market specification.
 * v0.4.0: full liquid Gains market registry (pair indices mirror the
 * official Gains markets API). BTC (0) and BTCDEGEN (300) are separate
 * entries, as are ETH (1) / ETHDEGEN (313). Only markets with a live
 * maxLeverage >= 2 are listed; delisted rows (0.001x) are omitted.
 * Pair 99 is intentionally unlisted (reserved, keeps registry sparse). */
(function(root){
const config=Object.freeze({chainId:137,name:'Polygon PoS',httpsRpc:'https://polygon-bor-rpc.publicnode.com',httpsFallback:'https://polygon-rpc.com',wssRpc:'wss://polygon-bor-rpc.publicnode.com',diamond:'0x209A9A01980377916851af2cA075C2b170452018',pyth:'0xff1a0f4744e8582DF1aE09D5611b887B6a12925C',usdc:'0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',usdcDecimals:6,usdcVault:'0x29019Fe2e72E8d4D2118E8D0318BeF389ffe2C81',collateralIndex:3});
const M=(symbol,base,pairIndex,maxLeverage,group,degen)=>Object.freeze({symbol,base,quote:'USD',pairIndex,collateralIndex:3,feedId:pairIndex===0?'0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43':null,maxLeverage,group:group||'crypto',degen:!!degen});
const markets=Object.freeze([
M('BTC/USD','BTC',0,200,'crypto'),
M('ETH/USD','ETH',1,500,'crypto'),
M('LINK/USD','LINK',2,150,'crypto'),
M('DOGE/USD','DOGE',3,150,'crypto'),
M('ADA/USD','ADA',5,150,'crypto'),
M('AAVE/USD','AAVE',7,150,'crypto'),
M('LTC/USD','LTC',13,150,'crypto'),
M('UNI/USD','UNI',17,150,'crypto'),
M('XRP/USD','XRP',19,150,'crypto'),
M('SOL/USD','SOL',33,150,'crypto'),
M('BNB/USD','BNB',47,150,'crypto'),
M('AVAX/USD','AVAX',102,150,'crypto'),
M('ATOM/USD','ATOM',103,150,'crypto'),
M('NEAR/USD','NEAR',104,150,'crypto'),
M('ARB/USD','ARB',109,150,'crypto'),
M('INJ/USD','INJ',129,150,'crypto'),
M('FIL/USD','FIL',137,150,'crypto'),
M('APT/USD','APT',138,150,'crypto'),
M('OP/USD','OP',141,150,'crypto'),
M('SUI/USD','SUI',153,150,'crypto'),
M('FET/USD','FET',155,150,'crypto'),
M('BONK/USD','BONK',193,150,'crypto'),
M('WIF/USD','WIF',205,150,'crypto'),
M('TAO/USD','TAO',223,150,'crypto'),
M('ONDO/USD','ONDO',215,150,'crypto'),
M('POL/USD','POL',269,150,'crypto'),
M('TRUMP/USD','TRUMP',328,150,'crypto'),
M('HYPE/USD','HYPE',331,150,'crypto'),
M('PEPE/USD','PEPE',134,150,'crypto'),
M('EUR/USD','EUR',21,1000,'forex'),
M('USD/JPY','JPY',22,1000,'forex'),
M('GBP/USD','GBP',23,1000,'forex'),
M('XAU/USD','XAU',90,250,'commodities'),
M('XAG/USD','XAG',91,250,'commodities'),
M('WTI/USD','WTI',187,150,'commodities'),
M('SPY/USD','SPY',86,100,'indices'),
M('QQQ/USD','QQQ',87,100,'indices'),
M('AAPL/USD','AAPL',58,4,'stocks'),
M('MSFT/USD','MSFT',62,4,'stocks'),
M('NVDA/USD','NVDA',65,4,'stocks'),
M('META/USD','META',81,4,'stocks'),
M('COIN/USD','COIN',376,2,'stocks'),
M('MSTR/USD','MSTR',378,2,'stocks'),
M('BTCDEGEN/USD','BTCDEGEN',300,500,'crypto',true),
M('ETHDEGEN/USD','ETHDEGEN',313,500,'crypto',true),
M('BNBDEGEN/USD','BNBDEGEN',327,500,'crypto',true),
]);
function market(index){const m=marketOrNull(index);if(!m)throw Error('Unsupported market');if(m.maxLeverage<2)throw Error('Market trading is unavailable');return m;}
function leverageCap(index){const ids=index===0?[0,300]:[index];return Math.max(0,...ids.map(i=>marketOrNull(i)?.maxLeverage||0));}
function orderMarket(index,leverage){const primary=marketOrNull(index);if(index===0&&(!primary||primary.maxLeverage<2||leverage>primary.maxLeverage)){const degen=market(300);if(!Number.isFinite(leverage)||leverage<1||leverage>degen.maxLeverage)throw Error("BTC leverage unavailable for this market");return degen;}return market(index);}
function marketOrNull(index){return discovered.find(m=>m.pairIndex===index)||markets.find(m=>m.pairIndex===index)||null;}
/* Runtime-merged Polygon assets from
 * backend-polygon.gains.trade/trading-variables/pairs,groups,pairInfos.
 * Entries: {pairIndex,symbol,base,maxLeverage,group,degen}. Bundled list wins. */
let discovered=[];
function discover(list){if(!Array.isArray(list))return 0;let n=0;for(const e of list){try{const pi=+e.pairIndex;if(!Number.isInteger(pi)||pi<0||pi>1000)continue;const lev=+e.maxLeverage;if(!Number.isFinite(lev)||lev<0)continue;const sym=String(e.symbol||'').toUpperCase();if(!/^[A-Z0-9]+\/[A-Z0-9]+$/.test(sym))continue;const base=sym.split('/')[0];const grp=String(e.group||'crypto');discovered=discovered.filter(m=>m.pairIndex!==pi);discovered.push(Object.freeze({symbol:sym,base,quote:sym.split('/')[1],pairIndex:pi,collateralIndex:3,feedId:null,maxLeverage:lev,group:grp,degen:/DEGEN/.test(base)}));n++;}catch{}}return n;}
function allMarkets(){return markets.map(m=>marketOrNull(m.pairIndex)).concat(discovered.filter(d=>!markets.some(m=>m.pairIndex===d.pairIndex))).sort((a,b)=>a.pairIndex-b.pairIndex);}
function apiSymbol(m){return m.base+'-'+m.quote;}
const api={network:config,markets,market,leverageCap,orderMarket,marketOrNull,allMarkets,discover,apiSymbol};
root.TradeConfig=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
