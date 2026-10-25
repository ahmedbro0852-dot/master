const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),k=require('../lib/store-assistant.cjs');
const box={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../catalog.js'),'utf8'),box);const products=box.window.MasterCatalog.products.filter(p=>!p.redirectTo);
const rows=products.flatMap(p=>(p.plans||[]).map((plan,i)=>({product_id:p.id,plan_index:i,price_piasters:Math.round(Number(plan.price)*100),available:p.status==='available'&&plan.available!==false,max_quantity:5,previous_price_piasters:null})));
const ask=(text,history=[])=>k.selectProducts([...history.map(content=>({role:'user',content})),{role:'user',content:text}],null,rows);
assert.equal(k.budgetFrom('ميزانيتي ٣٠٠ جنيه'),300);assert.equal(k.budgetFrom('budget 250 EGP'),250);assert.equal(k.budgetFrom('عايز فيديو 4k'),null);assert.equal(k.budgetFrom('budget 20 USD'),null);assert.equal(k.budgetFrom('ميزانيتي ١٬٠٠٠ جنيه'),1000);
assert.equal(ask('هل الفاتورة ضريبية؟ ينفع أدفع Binance؟ ولو اشتريت 3 اشتراكات الخصم كام؟').length,0);
assert(ask('إليفن لابس بكام؟').some(p=>p.id==='elevenlabs'));
assert(ask('قارن جيميني وشات جي بي تي').some(p=>p.id==='gemini-pro'));assert(ask('قارن جيميني وشات جي بي تي').some(p=>p.id==='chatgpt-plus'));
assert(ask('طيب ينفع على إيميلي؟',['إليفن لابس بكام؟']).some(p=>p.id==='elevenlabs'));
assert(ask('عايز أتعلم إنجليزي').some(p=>p.id==='duolingo'));
assert(ask('عايز أعمل مونتاج فيديو ميزانيتي ٣٠٠ جنيه').some(p=>p.id==='capcut-pro'));
for(const p of ask('عايز أعمل مونتاج فيديو ميزانيتي ٣٠٠ جنيه')){const available=rows.filter(x=>x.product_id===p.id&&x.available);assert(available.some(x=>x.price_piasters<=30000),p.id+' respects budget');}
const chosen=['capcut-pro','higgsfield-pro','windows-pro','gemini-pro','elevenlabs'].map(id=>products.find(p=>p.id===id));
const context=JSON.parse(k.contextFor(chosen,rows,{question:'ميزانيتي ٣٠٠ جنيه',discountRules:{two:3,three:5,four:7,fiveOrMore:10}}));
const cap=context.details.find(p=>p.id==='capcut-pro');assert.match(cap.plans[0].credits,/قليل|قد لا/);assert.match(cap.plans[6].credits,/2,?000/);assert.match(cap.plans[7].credits,/500/);assert(cap.plans[7].account||cap.plans[7].activation);
const higgs=context.details.find(p=>p.id==='higgsfield-pro');assert(higgs.plans[1].features.some(x=>/210/.test(x)));assert(!higgs.plans[1].features.some(x=>/سنة كاملة/.test(x)),'Starter must not inherit annual terms');
const win=context.details.find(p=>p.id==='windows-pro');assert(win.plans.every(x=>x.features.length>0&&x.accountType));
assert.equal(context.quantityDiscounts.fiveOrMore,10);assert.equal(context.requestBudgetEGP,300);assert(context.paymentMethods.includes('Binance / USDT'));assert(context.paymentMethods.includes('Sham Cash'));assert(context.storeHelp.length>=30);assert.equal(context.directory.length,products.length);assert(context.directory.some(p=>p.id==='elevenlabs'&&p.startingPriceEGP>0));
const noPrices=JSON.parse(k.contextFor(chosen,null));assert(noPrices.directory.every(p=>p.startingPriceEGP===null));assert(noPrices.details.every(p=>p.plans.every(x=>x.priceEGP===null&&x.previousPriceEGP===null&&!x.available)));
(async()=>{assert.deepEqual(await k.liveDiscounts(async()=>({ok:true,json:async()=>[{two:2,three:4,four:6,five:8}]})),{two:2,three:4,four:6,fiveOrMore:8});await assert.rejects(()=>k.liveDiscounts(async()=>({ok:true,json:async()=>[{two:99}]})));console.log('PASS: '+products.length+' services, '+context.storeHelp.length+' help topics, plan-specific features/credits/account types, budget/use-case/Arabic/follow-up retrieval, live payment/discount data and no stale prices. Context '+JSON.stringify(context).length+' characters.');})().catch(e=>{console.error(e);process.exitCode=1});

assert.equal(ask("هدية جيمناي مع كاب كات")[0].id,"capcut-gemini-gift");
assert.equal(ask("اليفن 3 شهور بكام")[0].id,"elevenlabs");
