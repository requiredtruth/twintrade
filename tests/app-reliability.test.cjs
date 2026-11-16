// Execute the real application handlers against deterministic transport/DOM doubles.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const eth=require('../app/src/main/assets/ethers.js');
const nodes={},stored={},intervals=[],timeouts=[];
const ctx2d=new Proxy({measureText:s=>({width:s.length*6})},{get:(o,k)=>o[k]||(()=>{})});
const node=id=>nodes[id]??={id,value:({amount:'10',lev:'10'})[id]||'',options:[],checked:true,hidden:true,textContent:'',innerHTML:'',className:'',dataset:{},getBoundingClientRect:()=>({width:393,height:400}),getContext:()=>ctx2d,addEventListener(){},showModal(){this.open=true},close(){this.open=false}};
const env={console,document:{getElementById:node,querySelector:()=>node('dismiss'),querySelectorAll:()=>[],addEventListener(){}},localStorage:{getItem:k=>stored[k]||null,setItem:(k,v)=>stored[k]=v},setTimeout:(f,ms)=>{timeouts.push({f,ms});return timeouts.length},clearTimeout(){},setInterval:(f,ms)=>{intervals.push({f,ms});return intervals.length},devicePixelRatio:1,confirm:()=>false,addEventListener(){},WebSocket:class{constructor(url){this.url=url;this.readyState=1;}close(){this.readyState=3}},ethers:{utils:eth.utils,providers:{JsonRpcProvider:class{constructor(){this.connection={url:'fixture'}}async getNetwork(){throw Error('offline fixture')}}},Contract:class{}},AbortController,fetch:async()=>{throw Error('offline fixture')},GABI:[]};
env.window=env;Object.assign(env,{URL,clearInterval:()=>{}});vm.createContext(env);const run=code=>vm.runInContext(code,env);
const assets=path.join(__dirname,'../app/src/main/assets');for(const f of ['config.js','engine.js','trade-state.js','market-data.js','routing.js','app.js'])run(fs.readFileSync(path.join(assets,f),'utf8'));
(async()=>{
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(run('paperDelayMs(()=>0)'),30000);assert.equal(run('paperDelayMs((()=>{const v=[.1,0];return()=>v.shift()})())'),3000);assert.equal(run('paperDelayMs((()=>{const v=[.1,.99999];return()=>v.shift()})())'),10000);
 // A second close of the same paper order must never credit the balance twice.
 run('setPrice(0,100,Date.now());');await run('sendOrder(true)');
 assert.equal(run('book.positions.length'),0);assert.equal(run('book.pending.length'),1);assert.equal(run('book.cash'),90);run('render()');assert(node('positions').innerHTML.includes('sampled once'));assert(node('positions').innerHTML.includes('execution-time market price'));
 assert.equal(JSON.parse(stored.paper).pending[0].due,run('book.pending[0].due'));run('setPrice(0,105,Date.now());processBrowserPaper(Date.now()+31000)');const p=run('book.positions[0]');assert.equal(p.entry,run('105*(1+book.positions[0].cost.slip/100)'));run('closePaper(book.positions[0])');const deadline=run('book.pending[0].due');run('closePaper(book.positions[0])');assert.equal(run('book.pending[0].due'),deadline);
 run('setPrice(0,110,Date.now());processBrowserPaper(Date.now()+62000)');assert.equal(run('book.history[0].exit'),110);const balance=run('book.cash');env.oldPosition=p;assert.throws(()=>run('closePaper(oldPosition)'),/already closed/);assert.equal(run('book.cash'),balance);
 // Delayed BTC history cannot get assigned to ETH after selection changes.
 let resolveBtc,resolveEth;env.fetchHistoryChain=async(chain,sym)=>new Promise(resolve=>{if(sym==='BTC-USD')resolveBtc=resolve;else resolveEth=resolve});
 const btc=run('loadHistory(0)');run('pair=1');const ether=run('loadHistory(1)');
 resolveEth({rows:[{t:Math.floor(Date.now()/60000)*60000-60000,o:20,h:20,l:20,c:20}],chain:'polygon'});await ether;
 resolveBtc({rows:[{t:Math.floor(Date.now()/60000)*60000-60000,o:10,h:10,l:10,c:10}],chain:'polygon'});await btc;
 assert.equal(run('candles[0][0].c'),10);assert.equal(run('candles[1][0].c'),20);
 // Review rejected: no token approval or trading transaction.
 const state={approvals:0,opens:0,allowance:eth.utils.parseUnits('1000',6),approvalApplies:true,desyncAfterApproval:false,loseApprovalResponse:true};
 const requests=new Map();
 const rpc={
   async getFeeData(){return {maxFeePerGas:eth.utils.parseUnits('31.5','gwei'),maxPriorityFeePerGas:eth.utils.parseUnits('1.5','gwei')};},
   async send(method,[signed]){
     assert.equal(method,'eth_sendRawTransaction');
     const hash=eth.utils.keccak256(signed);
     assert.equal(run(state.prepared.kind==='approve'?'pending[0].approvalHash':'pending[0].hash'),hash,'hash persisted before broadcast');
     requests.set(hash,state.prepared.kind);
     if(state.prepared.kind==='approve'){
       state.approvals++;
       if(state.approvalApplies)state.allowance=state.prepared.value;
       if(state.loseApprovalResponse)throw Object.assign(Error('processing response error'),{code:'SERVER_ERROR',error:{code:-32000,message:'RPC lost response https://example.test/api/PRIVATE_TOKEN'}});
     }else state.opens++;
     return hash;
   },
   async waitForTransaction(hash){
     assert(requests.has(hash));
     if(state.missingReceipt)return null;
     if(requests.get(hash)==='approve'&&state.desyncAfterApproval)run('indexTimes[0]=Date.now()-5001');
     return {transactionHash:hash,logs:[],status:1};
   }
 };
 env.chain=async()=>({connect(){return this},getTradingActivated:async()=>0,getCollateral:async()=>({isActive:true,collateral:run('NETWORK.usdc')}),pairTotalPositionSizeFeeP:async()=>0,pairs:async()=>({from:'BTC',to:'USD'}),callStatic:{openTrade:async()=>{}},populateTransaction:{openTrade:async()=>({kind:'open'})},interface:{parseLog(){throw Error('no logs')}}});
 env.ethers.Contract=class{
   constructor(){this.populateTransaction={approve:async(spender,value)=>{assert.equal(spender.toLowerCase(),run('DIAMOND.toLowerCase()'));return {kind:'approve',value};}}}
   async decimals(){return 6}
   async balanceOf(){return eth.utils.parseUnits('100',6)}
   async allowance(){return state.allowance}
 };
 env.fixtureWallet={address:'0x1111111111111111111111111111111111111111',provider:rpc,connect(){return this},async populateTransaction(req){assert.equal(eth.utils.formatUnits(req.maxPriorityFeePerGas,'gwei'),'25.0');assert.equal(eth.utils.formatUnits(req.maxFeePerGas,'gwei'),'55.0');return req},async signTransaction(req){state.prepared=req;return req.kind==='approve'?'0x01':'0x02'}};
 run("wallet=fixtureWallet;liveBalance=100;mode='live';pair=0;setPrice(0,100,Date.now());indexPrices[0]=100;indexTimes[0]=Date.now();");
 await run('sendOrder(true)');assert.equal(state.approvals,0);assert.equal(state.opens,0);
 env.confirm=()=>true;await run('sendOrder(true)');assert.equal(state.approvals,1);assert.equal(state.opens,1);assert(state.allowance.eq(eth.utils.parseUnits('10',6)));assert.equal(run('pending[0].approvalHash'),eth.utils.keccak256('0x01'));assert.equal(state.approvals,1,'ambiguous approval is never repeated');assert(!stored.liveErrors.includes('PRIVATE_TOKEN'));assert(stored.liveErrors.includes('RPC lost response'));state.loseApprovalResponse=false;
 // An oversized pre-existing allowance is reduced to the exact order amount. A token that
 // does not apply that change must stop before simulation or submission and journal the reason.
 run('pending=[]');state.allowance=eth.utils.parseUnits('1000',6);state.approvalApplies=false;const opened=state.opens;
 await run('sendOrder(false)');assert.equal(state.approvals,2);assert.equal(state.opens,opened);assert.equal(run('pending[0].status'),'Failed · order not submitted');assert(node('toast').textContent.includes('order was not submitted'));
 // Recheck the execution index after allowance confirmation and block a stale quote.
 state.approvalApplies=true;state.desyncAfterApproval=true;state.allowance=eth.utils.parseUnits('1000',6);run('pending=[];last[0]=Date.now();indexTimes[0]=last[0];indexPrices[0]=100');
 await run('sendOrder(false)');assert.equal(state.approvals,3);assert.equal(state.opens,opened);assert(node('toast').textContent.includes('fresh Gains index quote'));
 run('pending=[];last[0]=Date.now();indexTimes[0]=last[0]-5001');assert.throws(()=>run('liveQuote(0)'),/fresh Gains index quote/);
 run('indexTimes[0]=Date.now();last[0]=indexTimes[0]-5001');assert.equal(run('liveQuote(0)'),100);
 run("$('dollars').value='2.123456'");assert.equal(run('orderSize(100).amount'),2.123456);
 run("$('dollars').value='';$('amount').value='custom';$('sizeSlider').value='12.5'");assert.equal(run('orderSize(100).amount'),12.5);
 run("$('amount').value='10'");
 state.desyncAfterApproval=false;run('indexTimes[0]=Date.now();pending=[{owner:wallet.address,status:"Pending oracle execution"}]');assert.equal(run('liveQuote(0)'),100);
 run('pending=[]');state.missingReceipt=true;state.allowance=eth.utils.parseUnits('1000',6);
 await run('sendOrder(false)');assert.equal(state.approvals,4);assert.equal(state.opens,opened);
 assert.equal(run('pending[0].status'),'Submission uncertain · check chain');
 await run('sendOrder(false)');assert.equal(state.approvals,4,'uncertain transaction blocks duplicate submission');
 state.missingReceipt=false;
 // If a confirmed receipt cannot be decoded into an oracle order ID, exact submitted
 // metadata and the pre-submit index set safely reconcile the resulting state. Ambiguous
 // matches remain blocked instead of guessing.
 env.journal={action:'open',pair:0,long:true,leverage:10,collateralUnits:'10000000',tradeIndexesBefore:[1]};
 env.positions=[{index:1,pair:0,long:true,lev:10,amount:10},{index:2,pair:0,long:true,lev:10,amount:10}];
 assert.equal(run('reconcileConfirmedState(journal,positions)'),true);assert.equal(env.journal.status,'Open');assert.equal(env.journal.tradeIndex,2);
 env.journal={action:'open',pair:0,long:true,leverage:10,collateralUnits:'10000000',tradeIndexesBefore:[1]};
 env.positions=[{index:2,pair:0,long:true,lev:10,amount:10},{index:3,pair:0,long:true,lev:10,amount:10}];
 assert.equal(run('reconcileConfirmedState(journal,positions)'),false);assert.equal(env.journal.status,undefined);
 env.journal={action:'close',tradeIndex:7};env.positions=[];assert.equal(run('reconcileConfirmedState(journal,positions)'),true);assert.equal(env.journal.status,'Closed');
 // An unresolved submission prevents both another open and duplicate close.
 await run('sendOrder(false)');assert.equal(state.opens,1);
 env.position={pair:0,index:1,long:true,lev:10};await run('closeLive(position)');assert.equal(state.opens,1);assert(node('toast').textContent.includes('pending'));
 run("pending=[{id:'older',owner:wallet.address,action:'open',pair:0,long:true,leverage:100,collateralUnits:'5353748',created:Date.now()-1000,approvalHash:'0x42',status:'Submission uncertain · check chain'}];liveErrors=[{time:new Date().toISOString(),stage:'USDC approval · Broadcasting signed transaction',rpcCode:'-32000',reason:'transaction gas price below minimum: gas tip cap 1500000000, minimum needed 25000000000',pair:0,side:'long',leverage:100,collateralUnits:'5353748'}];recoverRejectedApprovals();render()");
 assert.equal(run('pending[0].status'),'Approval rejected · order not submitted');
 assert(node('positions').innerHTML.includes('data-dismiss-order="older"'));
 node('positions').onclick({target:{dataset:{dismissOrder:'older'}}});
 assert.equal(JSON.parse(stored.pending)[0].dismissed,true);
 assert(!node('positions').innerHTML.includes('Approval rejected'));
 run("pending=[];indexTimes[0]=Date.now()");
 state.allowance=eth.utils.parseUnits('1000',6);
 rpc.send=async()=>{throw Object.assign(Error('processing response error'),{error:{code:-32000,message:'transaction gas price below minimum: gas tip cap 25000000000, minimum needed 30000000000'}});};
 await run('sendOrder(true)');
 assert.equal(run('pending[0].status'),'Failed · order not submitted');
 assert.equal(run('pending[0].approvalHash'),undefined);
 console.log('PASS: duplicate paper settlement, market-switch history race, rejected review, signer-bound approval and pending-order exclusion.');
})().catch(e=>{console.error(e);process.exit(1)});
