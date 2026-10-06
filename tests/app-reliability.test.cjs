// Execute the real application handlers against deterministic transport/DOM doubles.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const eth=require('../app/src/main/assets/ethers.js');
const nodes={},stored={},intervals=[],timeouts=[];
const ctx2d=new Proxy({measureText:s=>({width:s.length*6})},{get:(o,k)=>o[k]||(()=>{})});
const node=id=>nodes[id]??={id,value:({amount:'10',lev:'10'})[id]||'',options:[],checked:true,hidden:true,textContent:'',innerHTML:'',className:'',dataset:{},getBoundingClientRect:()=>({width:393,height:400}),getContext:()=>ctx2d,addEventListener(){},showModal(){this.open=true},close(){this.open=false}};
const env={console,document:{getElementById:node,querySelector:()=>node('dismiss'),querySelectorAll:()=>[],addEventListener(){}},localStorage:{getItem:k=>stored[k]||null,setItem:(k,v)=>stored[k]=v},setTimeout:(f,ms)=>{timeouts.push({f,ms});return timeouts.length},clearTimeout(){},setInterval:(f,ms)=>{intervals.push({f,ms});return intervals.length},devicePixelRatio:1,confirm:()=>false,addEventListener(){},WebSocket:class{constructor(url){this.url=url;this.readyState=1;}close(){this.readyState=3}},ethers:{utils:eth.utils,providers:{JsonRpcProvider:class{constructor(){this.connection={url:'fixture'}}async getNetwork(){throw Error('offline fixture')}}},Contract:class{}},AbortController,fetch:async()=>{throw Error('offline fixture')},GABI:[]};
env.window=env;vm.createContext(env);const run=code=>vm.runInContext(code,env);
const assets=path.join(__dirname,'../app/src/main/assets');for(const f of ['config.js','engine.js','trade-state.js','app.js'])run(fs.readFileSync(path.join(assets,f),'utf8'));
(async()=>{
 await new Promise(resolve=>setImmediate(resolve));
 // A second close of the same paper order must never credit the balance twice.
 run('setPrice(0,100,Date.now());');await run('sendOrder(true)');
 const p=run('book.positions[0]');run('closePaper(book.positions[0])');const balance=run('book.cash');
 env.oldPosition=p;assert.throws(()=>run('closePaper(oldPosition)'),/already closed/);assert.equal(run('book.cash'),balance);
 // Delayed BTC history cannot get assigned to ETH after selection changes.
 let resolveBtc,resolveEth;env.fetchHistoryChain=async(chain,sym)=>new Promise(resolve=>{if(sym==='BTC-USD')resolveBtc=resolve;else resolveEth=resolve});
 const btc=run('loadHistory(0)');run('pair=1');const ether=run('loadHistory(1)');
 resolveEth({rows:[{t:Math.floor(Date.now()/60000)*60000-60000,o:20,h:20,l:20,c:20}],chain:'polygon'});await ether;
 resolveBtc({rows:[{t:Math.floor(Date.now()/60000)*60000-60000,o:10,h:10,l:10,c:10}],chain:'polygon'});await btc;
 assert.equal(run('candles[0][0].c'),10);assert.equal(run('candles[1][0].c'),20);
 // Review rejected: no token approval or trading transaction.
 const state={approvals:0,opens:0,signerConnected:false,allowance:eth.utils.parseUnits('1000',6),approvalApplies:true,desyncAfterApproval:false};
 env.chain=async()=>({connect(){return this},getTradingActivated:async()=>0,getCollateral:async()=>({isActive:true,collateral:run('NETWORK.usdc')}),pairTotalPositionSizeFeeP:async()=>0,pairs:async()=>({from:'BTC',to:'USD'}),callStatic:{openTrade:async()=>{}},openTrade:async()=>{state.opens++;return{hash:'open-hash',wait:async()=>({logs:[],status:1})}},interface:{parseLog(){throw Error('no logs')}}});
 env.ethers.Contract=class{async decimals(){return 6}async balanceOf(){return eth.utils.parseUnits('100',6)}async allowance(){return state.allowance}connect(){state.signerConnected=true;return this}async approve(spender,value){assert(state.signerConnected,'Approval must have a signer');assert.equal(spender.toLowerCase(),run('DIAMOND.toLowerCase()'));state.approvals++;if(state.approvalApplies)state.allowance=value;return{hash:'approval-original',wait:async()=>{if(state.desyncAfterApproval)run('indexTimes[0]=last[0]-2001');return{status:1,transactionHash:'approval-replacement'}}}}};
 run("wallet={address:'0x1111111111111111111111111111111111111111',connect(){return this}};liveBalance=100;mode='live';pair=0;setPrice(0,100,Date.now());indexPrices[0]=100;indexTimes[0]=Date.now();");
 await run('sendOrder(true)');assert.equal(state.approvals,0);assert.equal(state.opens,0);
 env.confirm=()=>true;await run('sendOrder(true)');assert.equal(state.approvals,1);assert.equal(state.opens,1);assert(state.allowance.eq(eth.utils.parseUnits('10',6)));assert.equal(run('pending[0].approvalHash'),'approval-replacement');
 // An oversized pre-existing allowance is reduced to the exact order amount. A token that
 // does not apply that change must stop before simulation or submission and journal the reason.
 run('pending=[]');state.allowance=eth.utils.parseUnits('1000',6);state.approvalApplies=false;const opened=state.opens;
 await run('sendOrder(false)');assert.equal(state.approvals,2);assert.equal(state.opens,opened);assert.equal(run('pending[0].status'),'Approval mismatch · order not submitted');assert(node('toast').textContent.includes('order was not submitted'));
 // Fresh mark/index values from different frames must not reach simulation. Recheck after
 // allowance confirmation catches a feed split that appears while the wallet is signing.
 state.approvalApplies=true;state.desyncAfterApproval=true;state.allowance=eth.utils.parseUnits('1000',6);run('pending=[];last[0]=Date.now();indexTimes[0]=last[0];indexPrices[0]=100');
 await run('sendOrder(false)');assert.equal(state.approvals,3);assert.equal(state.opens,opened);assert(node('toast').textContent.includes('not synchronized'));
 run('pending=[];last[0]=Date.now();indexTimes[0]=last[0]-1001');assert.throws(()=>run('liveQuote(0)'),/not synchronized/);
 run('indexTimes[0]=Date.now();last[0]=indexTimes[0]-1001');assert.throws(()=>run('liveQuote(0)'),/not synchronized/);
 state.desyncAfterApproval=false;run('indexTimes[0]=last[0];pending=[{owner:wallet.address,status:"Pending oracle execution"}]');assert.equal(run('liveQuote(0)'),100);
 // An unresolved submission prevents both another open and duplicate close.
 await run('sendOrder(false)');assert.equal(state.opens,1);
 env.position={pair:0,index:1,long:true,lev:10};await run('closeLive(position)');assert.equal(state.opens,1);assert(node('toast').textContent.includes('pending'));
 console.log('PASS: duplicate paper settlement, market-switch history race, rejected review, signer-bound approval and pending-order exclusion.');
})().catch(e=>{console.error(e);process.exit(1)});
