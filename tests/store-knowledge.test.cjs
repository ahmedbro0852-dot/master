const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),k=require('../lib/store-assistant.cjs');
const box={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../catalog.js'),'utf8'),box);const products=box.window.MasterCatalog.products.filter(p=>!p.redirectTo);
const rows=products.flatMap(p=>(p.plans||[]).map((plan,i)=>({product_id:p.id,plan_index:i,price_piasters:Math.round(Number(plan.price)*100),available:p.status==='available'&&plan.available!==false,max_quantity:5,previous_price_piasters:null})));
const ask=(text,history=[])=>k.selectProducts([...history.map(content=>({role:'user',content})),{role:'user',content:text}],null,rows);
for(const text of ['إكستريم بكام؟','سيرفر اكستريم عربي','Xtream IPTV price']){
 const found=ask(text).find(p=>p.id==='xtream-iptv');assert(found,text);
 const plan=JSON.parse(k.contextFor([found],rows)).details[0].plans[0];
 assert.equal(plan.priceEGP,350);assert.match(plan.duration,/12 شهر أو أكثر/);
 assert.match(plan.account,/عشوائي/);assert.match(plan.activation,/رابط السيرفر/);
 assert.match(plan.warranty,/يُؤكد/);assert(plan.notes.some(n=>/عدد الشاشات/.test(n)));
 assert(plan.features.some(n=>/4 ميجابت/.test(n)));assert.equal(found.plans[0].officialPrice,undefined);
}
for(const text of ['فيزيو بكام؟','فيسيو برو','Visio Professional LTSC']){
 const found=ask(text).find(p=>p.id==='visio-professional');assert(found,text);
 const plans=JSON.parse(k.contextFor([found],rows)).details[0].plans;
 assert.deepEqual(plans.map(p=>p.priceEGP),[380,380,380,350]);
 assert(plans.every(p=>p.notes.some(n=>n.includes('https://tinyurl.com/OfficeActiveSystem'))));
 assert(plans.every(p=>/يُؤكد/.test(p.warranty)));
}
for(const text of ['باقة كيرسور جروك اكس بكام؟','Cursor Grok X Premium bundle','اشتراك اكس الموحّد']){
 const found=ask(text).find(p=>p.id==='cursor-grok-x-bundle');assert(found,text);
 const plan=JSON.parse(k.contextFor([found],rows)).details[0].plans[0];assert.equal(plan.priceEGP,1000);assert.equal(plan.duration,'1 شهر');assert.match(plan.account,/إيميلك الشخصي/);assert.match(plan.warranty,/كامل.*شهر/);assert.match(plan.credits,/أسبوعي مشترك/);assert(plan.features.some(x=>/استخدام إضافي مدفوع/.test(x)));assert(plan.notes.some(x=>/لا تتضمن Coursera/.test(x)));
}
// Keep the ready-account offer separate from personal-email activation.
{
 const ready=products.find(p=>p.id==='grok-cursor-premium');assert(ready);
 const plan=JSON.parse(k.contextFor([ready],rows)).details[0].plans[0];
 assert.equal(plan.priceEGP,1298);assert.equal(plan.duration,'1 شهر');assert.match(plan.warranty,/28/);assert.match(plan.account,/جاهز/);assert.match(plan.activation,/كلمة مرور البريد/);assert(plan.features.some(x=>/مشترك/.test(x)));assert(plan.notes.some(x=>/ليست تفعيلًا/.test(x)));assert.equal(ready.plans[0].officialPrice.amount,30);assert(ask('جروك كيرسور حساب جاهز').some(p=>p.id===ready.id));
 const personal=products.find(p=>p.id==='cursor-grok-x-bundle').plans[0];assert.equal(personal.price,1000);assert.match(personal.account,/إيميلك الشخصي/);assert.match(personal.warranty,/شهر/);
}
assert.equal(products.find(p=>p.id==='supergrok-coursera-bundle').plans[0].price,1399);
{
 const eleven=products.find(p=>p.id==='elevenlabs'),plans=JSON.parse(k.contextFor([eleven],rows)).details[0].plans,pro=plans[3];
 assert.equal(plans.length,4);assert.equal(plans[1].priceEGP,1250);assert.equal(plans[2].priceEGP,550);assert.equal(pro.priceEGP,450);assert.equal(pro.duration,'1 شهر');assert.match(pro.warranty,/25/);assert.match(pro.credits,/50,000/);assert.match(pro.account,/مساحة عمل/);assert(pro.features.some(x=>/استنساخ الصوت غير متاح/.test(x)));assert.equal(eleven.plans[3].officialPrice,undefined);
}
{
 const product=products.find(p=>p.id==='freepik'),plans=JSON.parse(k.contextFor([product],rows)).details[0].plans;
 assert.equal(plans.length,3);assert.equal(plans[0].priceEGP,450);assert.equal(plans[1].priceEGP,840);assert.equal(product.plans[1].basePriceUSD,15);assert.match(plans[1].account,/الشخصي/);assert.match(plans[1].warranty,/شهر/);assert(plans[1].features.every(x=>!x.includes('للتحميل فقط')&&!x.includes('PSD')));assert(plans[0].features.some(x=>x.includes('للتحميل فقط')));assert.equal(product.plans[1].officialPrice,undefined);assert.equal(plans[2].priceEGP,1344);assert.equal(product.plans[2].basePriceUSD,24);assert.match(plans[2].credits,/20,000/);assert.match(plans[2].account,/الشخصي/);assert.match(plans[2].warranty,/شهر/);assert(plans[2].features.every(x=>!x.includes('للتحميل فقط')));assert.equal(product.plans[2].officialPrice,undefined);
}
// Ended 18-month indices remain stable but are never offered; Google tiers keep separate terms.
{
 const gemini=products.find(p=>p.id==='gemini-pro');assert(gemini.plans.slice(0,2).every(p=>p.hidden&&p.available===false));
 const plans=JSON.parse(k.contextFor([gemini],rows)).details[0].plans;
 assert.deepEqual(plans.map(p=>p.index),[2,3]);assert.deepEqual(plans.map(p=>p.priceEGP),[80,200]);assert.deepEqual(plans.map(p=>p.duration),['1 شهر','3 شهور']);assert.match(plans[0].credits,/1,000/);assert.match(plans[0].credits,/مشترك/);assert.match(plans[0].warranty,/شهر/);assert.match(plans[1].warranty,/3/);assert.equal(plans[1].credits,null);assert(plans.every(p=>!p.duration.includes('18')));
 const plus=products.find(p=>p.id==='google-ai-plus'),plusPlans=JSON.parse(k.contextFor([plus],rows)).details[0].plans;
 assert.deepEqual(plusPlans.map(p=>p.priceEGP),[150,220]);assert.deepEqual(plusPlans.map(p=>p.duration),['6 شهور','12 شهر']);assert(plusPlans.every(p=>/الشخصي/.test(p.account)&&/تؤكد|تُؤكد/.test(p.warranty)&&p.credits===null));assert(plus.plans.every(p=>!p.officialPrice));assert(ask('جوجول بلس').some(p=>p.id==='google-ai-plus'));
}
{
 const lov=products.find(p=>p.id==='lovable-pro'),plans=JSON.parse(k.contextFor([lov],rows)).details[0].plans,newPlan=plans.find(p=>p.index===4);
 assert.equal(newPlan.priceEGP,1050);assert.equal(newPlan.duration,'3 شهور');assert.match(newPlan.credits,/100.*شهري.*5.*يومي/);assert.match(newPlan.account,/خاص.*جاهز/);assert.match(newPlan.activation,/كود الدخول/);assert.match(newPlan.warranty,/كامل.*3/);assert.equal(lov.plans[4].officialPrice.amount,75);assert.equal(lov.plans[4].officialPrice.months,3);assert.equal(lov.plans[1].price,300);
 const plus=products.find(p=>p.id==='chatgpt-plus'),plusPlans=JSON.parse(k.contextFor([plus],rows)).details[0].plans,ready=plusPlans.find(p=>p.index===3);
 assert(plus.plans[1].hidden&&plus.plans[1].available===false);assert.equal(ready.priceEGP,780);assert.equal(ready.duration,'1 شهر');assert.match(ready.warranty,/25/);assert.match(ready.account,/خاص.*غير مشترك/);assert.equal(plus.plans[0].price,320);assert.equal(plus.plans[2].price,1100);assert.equal(plus.plans[3].officialPrice.amount,20);assert.equal(plus.plans[3].officialPrice.months,1);
 const host=products.find(p=>p.id==='hostinger'),hostPlan=JSON.parse(k.contextFor([host],rows)).details[0].plans[0];
 assert.equal(host.plans[0].basePriceUSD,25);assert.equal(hostPlan.priceEGP,1400);assert.equal(hostPlan.duration,'12 شهر');assert.match(hostPlan.account,/بريدك الشخصي/);assert.match(hostPlan.warranty,/12/);assert(hostPlan.features.some(x=>/غير محدود.*مواقعك/.test(x)));assert(hostPlan.features.some(x=>/نطاق واحد.*(?:للسنة|السنة) الأولى/.test(x)));assert(hostPlan.notes.some(x=>/التخزين.*المعالج.*الذاكرة/.test(x)));assert(ask('هوستنجر استضافة').some(p=>p.id==='hostinger'));
}
assert.equal(k.budgetFrom('ميزانيتي ٣٠٠ جنيه'),300);assert.equal(k.budgetFrom('budget 250 EGP'),250);assert.equal(k.budgetFrom('عايز فيديو 4k'),null);assert.equal(k.budgetFrom('budget 20 USD'),null);assert.equal(k.budgetFrom('ميزانيتي ١٬٠٠٠ جنيه'),1000);
assert.equal(ask('هل الفاتورة ضريبية؟ ينفع أدفع Binance؟ ولو اشتريت 3 اشتراكات الخصم كام؟').length,0);
for(const text of ['شات جو بكام؟','ChatGPT Go price','شات جي بي تي جو بضمان']){const go=ask(text);assert.equal(go.length,1);assert.equal(go[0].id,'chatgpt-go');const plan=JSON.parse(k.contextFor(go,rows)).details[0].plans[0];assert.equal(plan.priceEGP,320);assert.equal(plan.duration,'1 شهر');assert.match(plan.warranty,/كامل/);assert.match(plan.account,/جاهز/);}
for(const text of ['بيسكارت بكام؟','بيكسارت حساب خاص','Picsart plans']){const found=ask(text).find(p=>p.id==='picsart');assert(found,text);assert.equal(found.name,'Picsart Pro');assert(found.plans.every(p=>p.planType==='Pro'));assert.equal(found.plans[0].officialPrice,undefined);assert.equal(found.plans[4].officialPrice.amount,126);assert.equal(found.plans[4].officialPrice.months,12);const plans=JSON.parse(k.contextFor([found],rows)).details[0].plans;assert.equal(plans.length,5);assert.match(plans[0].credits,/بدون/);for(const plan of plans.slice(1)){assert.match(plan.credits,/500/);assert.match(plan.credits,/شهري/);}assert(plans.every(p=>/كامل/.test(p.warranty)));}
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
