const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
(async()=>{
 const source=fs.readFileSync('catalog.js','utf8'),live=fs.readFileSync('catalog-live.js','utf8');
 const ctx={window:{},Date,fetch:async()=>{throw Error('offline')},setTimeout(){},document:{dispatchEvent(){}},CustomEvent:class {}};
 vm.runInNewContext(source,ctx);vm.runInNewContext(live,ctx);await ctx.window.MasterCatalogReady;
 const p=ctx.window.MasterCatalog.getProduct('lovable-pro');
 const visible=p.plans.map((x,i)=>({...x,index:i})).filter(x=>!x.hidden&&x.available!==false);
 assert.equal(visible.length,2);
 assert.deepEqual(Array.from(visible,x=>x.index),[2,4]);
 assert.equal(p.plans[2].price,3000);
 assert.equal(p.plans[4].price,1000);
 assert.equal(p.plans[4].accountType,'حساب خاص');
 assert.match(p.plans[4].warranty,/ضمان كامل/);
 assert.match(p.plans[4].credits,/100 كريدت شهريًا/);
 for(const i of [0,1,3]){assert.equal(p.plans[i].hidden,true);assert.equal(p.plans[i].available,false);}
 assert(!p.plans.some(x=>x.promotionEndsAt),'No stale Lovable promotion');
 const legacy=ctx.window.MasterCatalog.getProduct('lovable-lite');
 assert.equal(legacy.redirectTo.plan,4);
 assert.equal(legacy.plans[0].hidden,true);
 assert.equal(legacy.plans[0].available,false);
 assert.equal(ctx.window.MasterCatalog.startingPrice(p),'1,000 ج');
 console.log('PASS: only yearly (3000) and private 3-month (1000) Lovable Pro plans are offered.');
})().catch(e=>{console.error(e);process.exitCode=1});
