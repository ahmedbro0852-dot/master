const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
(async()=>{
 const source=fs.readFileSync('catalog.js','utf8'),live=fs.readFileSync('catalog-live.js','utf8');
 const deadline=Date.parse('2026-10-28T05:15:00Z');
 for(const now of [deadline-1,deadline,deadline+86400000]){
  let timer;const box={window:{},Date:class extends Date{static now(){return now}},fetch:async()=>{throw Error('offline')},setTimeout:fn=>{timer=fn},document:{dispatchEvent(){}},CustomEvent:class {}};
  vm.runInNewContext(source,box);vm.runInNewContext(live,box);await box.window.MasterCatalogReady;
  const p=box.window.MasterCatalog.getProduct('lovable-pro');assert.equal(p.plans[3].price,now<deadline?430:450);assert.equal(p.plans[3].previousStorePrice,now<deadline?450:650);assert.notEqual(p.plans[3].available,false);assert.equal(p.plans[1].price,300);assert.equal(p.plans[2].price,1800);
  assert.equal(box.window.MasterCatalog.getProduct('lovable-lite').plans[0].price,p.plans[3].price);
  if(now<deadline){box.Date.now=()=>deadline;timer();assert.equal(p.plans[3].price,450);}
 }
 console.log('PASS Lovable: 430/450 verified previous price, automatic expiry including open tabs/offline, annual availability retained, other plans unchanged');
})().catch(e=>{console.error(e);process.exitCode=1});
