const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict'),Social=require('../social-links.js');
assert.deepEqual(require('../seo-config.js').homeGraph['@graph'].find(x=>x['@type']==='Organization').sameAs,[Social.facebook,Social.whatsappChannel]);
const root=path.resolve(__dirname,'..'),sb={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'catalog.js'),'utf8'),sb);const catalog=sb.window.MasterCatalog,rows=catalog.products.flatMap(p=>(p.plans||[]).map((plan,i)=>({product_id:p.id,plan_index:i,price_piasters:Math.round(plan.price*100),available:p.status==='available'&&plan.available!==false,max_quantity:5,admin_overridden:false,previous_price_piasters:plan.previousStorePrice?Math.round(plan.previousStorePrice*100):null})));
const server=http.createServer((req,res)=>{let p=path.join(root,new URL(req.url,'http://localhost').pathname);if(p.endsWith('/'))p+='index.html';try{res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':p.endsWith('.webp')?'image/webp':p.endsWith('.svg')?'image/svg+xml':p.endsWith('.png')?'image/png':'text/html');res.end(fs.readFileSync(p))}catch{res.writeHead(404).end()}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port,b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox','--disable-dev-shm-usage']});try{const page=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[],quotes=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>localStorage.setItem('masterStoreLocaleV1',JSON.stringify({language:'en',market:'EG',manualMarket:true})));await page.route('**/*',r=>{let u=new URL(r.request().url());if(u.pathname==='/rest/v1/master_store_plans')return r.fulfill({contentType:'application/json',body:JSON.stringify(rows)});if(u.pathname==='/auth/v1/settings')return r.fulfill({contentType:'application/json',body:JSON.stringify({external:{google:true}})});if(u.pathname==='/rest/v1/rpc/master_store_quote_cart'){const body=r.request().postDataJSON();quotes.push(body);const items=body.items.map(x=>{let p=catalog.getProduct(x.product_id),plan=p.plans[x.plan_index],unit=Math.round(plan.price*100);return{...x,product:p.name,plan:plan.name,duration:plan.duration,unit_piasters:unit,amount_piasters:unit*x.quantity,max_quantity:5}}),total=items.reduce((n,x)=>n+x.amount_piasters,0);return r.fulfill({contentType:'application/json',body:JSON.stringify({items,subtotal_piasters:total,amount_piasters:total,discount_piasters:0,discount_percent:0,rules:{two:3,three:5,four:7,five:10}})})}if(u.origin!==origin)return r.abort();return r.continue()});

const untranslated=()=>[...document.querySelectorAll('body *')].filter(e=>e.checkVisibility()&&!e.closest('select,script,style,[data-no-translate]')&&[...e.childNodes].some(n=>n.nodeType===3&&/[\u0621-\u064a]/.test(n.textContent))).map(e=>({tag:e.tagName,cls:e.className,text:[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ')}));
const routes=['/index.html','/account.html','/cart.html','/track.html','/warranty.html',...catalog.products.filter(p=>!p.redirectTo).map(p=>'/product.html?id='+p.id),...require('../seo-config.js').categories.map(c=>'/categories/'+c.slug+'.html')];

let plansChecked=0;
async function assertEnglish(label){await page.waitForTimeout(0);assert.deepEqual(await page.evaluate(untranslated),[],label);assert.equal(await page.locator('html').getAttribute('dir'),'ltr');}
for(const route of routes){
 await page.goto(origin+route);await page.waitForTimeout(50);
 if(route.includes('product.html'))await page.locator('#productPage').waitFor();
 if(await page.locator('.menu').count()){
  await page.locator('.menu').click();await assertEnglish(route+' open navigation');
  assert.equal((await page.locator('.cart-nav').textContent()).replace(/\d+/g,'').trim(),'Cart');
  assert.equal(await page.locator('#mainNav').getAttribute('aria-label'),'Main navigation');
  await page.keyboard.press('Escape');
 }
 await assertEnglish(route);
 for(const value of await page.locator('input[name=plan]:not(:disabled)').evaluateAll(xs=>xs.map(x=>x.value))){
  await page.locator('input[name=plan][value="'+value+'"]').evaluate(x=>{x.checked=true;x.dispatchEvent(new Event('change',{bubbles:true}));});
  await assertEnglish(route+' plan '+value);plansChecked++;
 }
}
await page.goto(origin+'/index.html');await page.locator('#grid .product-card').first().waitFor();
await page.setViewportSize({width:1440,height:1000});await assertEnglish('desktop navigation');assert.match(await page.locator('.cart-nav').textContent(),/Cart/);await page.setViewportSize({width:390,height:844});
const prices=await page.evaluate(()=>MasterCatalog.getProduct('gemini-pro').plans.map(x=>MasterStore.planAmount(x)));
await page.locator('#languageSelect').selectOption('ar');assert.equal(await page.locator('html').getAttribute('dir'),'rtl');assert.match(await page.locator('.footer-policy').textContent(),/سياسة/);assert.match(await page.locator('.cart-nav').textContent(),/السلة/);
await page.locator('#languageSelect').selectOption('en');await assertEnglish('switch back to English');assert.match(await page.locator('.cart-nav').textContent(),/Cart/);assert.deepEqual(await page.evaluate(()=>MasterCatalog.getProduct('gemini-pro').plans.map(x=>MasterStore.planAmount(x))),prices);
await page.evaluate(()=>{const box=document.createElement('aside');box.id='lateTranslation';box.append(document.createComment('dynamic content'));box.innerHTML+='<p>وسائل الدفع</p><button aria-label="إغلاق">إغلاق</button>';document.body.append(box);});
await page.waitForFunction(()=>document.querySelector('#lateTranslation p').textContent==='Payment methods');assert.equal(await page.locator('#lateTranslation button').getAttribute('aria-label'),'Close');
await page.goto(origin+'/product.html?id=capcut-pro');await page.locator('#buyBtn').click();await assertEnglish('purchase choices');await page.locator('#languageSelect').evaluate(x=>window.MasterLocale.setLanguage('ar'));assert.match(await page.locator('#checkoutTitle').textContent(),/نكمل/);await page.evaluate(()=>MasterLocale.setLanguage('en'));await assertEnglish('purchase language round trip');await page.keyboard.press('Escape');
await page.evaluate(()=>MasterCart.add('capcut-pro',6));await page.goto(origin+'/cart.html');await page.locator('.cart-line').waitFor();await assertEnglish('populated cart');assert.equal(quotes.at(-1).items[0].product_id,'capcut-pro');
assert.deepEqual(errors,[]);console.log('PASS: '+routes.length+' public routes, '+plansChecked+' selectable plans, category pages, English/Arabic round trips, late text and accessible labels, purchase choices and quoted cart; unchanged plan amounts; no orders submitted.');
}finally{await b.close();server.close()}})().catch(e=>{console.error(e);server.close();process.exitCode=1});
