/* User-supplied Polygon connection and market specification. */
(function(root){
const config=Object.freeze({chainId:137,name:'Polygon PoS',httpsRpc:'https://polygon-bor-rpc.publicnode.com',httpsFallback:'https://polygon-rpc.com',wssRpc:'wss://polygon-bor-rpc.publicnode.com',diamond:'0x209A9A01980377916851af2cA075C2b170452018',pyth:'0xff1a0f4744e8582DF1aE09D5611b887B6a12925C',usdc:'0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',usdcDecimals:6,usdcVault:'0x29019Fe2e72E8d4D2118E8D0318BeF389ffe2C81',collateralIndex:3});
const markets=Object.freeze([Object.freeze({symbol:'BTC/USD',base:'BTC',quote:'USD',pairIndex:0,collateralIndex:3,feedId:'0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',maxLeverage:200}),Object.freeze({symbol:'ETH/USD',base:'ETH',quote:'USD',pairIndex:1,collateralIndex:3,feedId:null,maxLeverage:500})]);
const api={network:config,markets,market(index){const m=markets.find(m=>m.pairIndex===index);if(!m)throw Error('Unsupported market');return m;}};
root.TradeConfig=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
