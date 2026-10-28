/* Run after npm run build with Playwright and CHROMIUM_EXECUTABLE_PATH available. */
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),vm=require('node:vm');
const root=path.resolve('_site'),box={window:{}},KEY='masterStoreXtreamAdV1',SIX_HOURS=21600000;
vm.runInNewContext(fs.readFileSync('catalog.js','utf8'),box);
const rows=box.window.MasterCatalog.products.flatMap(p=>(p.plans||[]).map((x,i)=>({product_id:p.id,plan_index:i,price_piasters:Math.round(x.price*100),available:p.status==='available'&&x.available!==false,max_quantity:5,admin_overridden:true,previous_price_piasters:null})));
const server=http.createServer((request,response)=>{let file=path.join(root,new URL(request.url,'http://localhost').pathname);if(file.endsWith('/'))file+='index.html';try{if(!file.startsWith(root+path.sep))throw Error();response.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.html':'text/html'})[path.extname(file)]||'application/octet-stream');response.end(fs.readFileSync(file));}catch{response.writeHead(404).end();}});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox','--disable-dev-shm-usage']}),errors=[];
 async function pageFor(route='/',options={}){
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
  await p.clock.install({time:new Date('2026-10-28T10:00:00Z')});
  await p.addInitScript(()=>localStorage.setItem('masterStoreLocaleV1',JSON.stringify({market:'EG',language:'ar',manualMarket:true})));
  await p.route('**/*',r=>{const u=new URL(r.request().url());if(u.pathname==='/rest/v1/master_store_plans'){
   if(options.networkError)return r.abort();let data=rows.map(x=>x.product_id==='xtream-iptv'?{...x,price_piasters:options.price??35000,available:options.available??true}:x);
   if(u.searchParams.has('product_id'))data=data.filter(x=>x.product_id==='xtream-iptv'&&x.plan_index===0);
   return r.fulfill({contentType:'application/json',body:JSON.stringify(data)});
  }if(u.origin!==origin)return r.abort();return r.continue();});
  await p.goto(origin+route);await p.evaluate(async()=>{if(window.MasterCatalogReady)await MasterCatalogReady;});
  await p.clock.pauseAt(await p.evaluate(()=>Date.now()+100));return p;
 }
 const open=p=>p.locator('#masterSiteAd[open]');
 try{
  const p=await pageFor();await p.clock.fastForward(10000);assert.equal(await open(p).count(),0,'not immediate');await p.clock.fastForward(2100);await open(p).waitFor();
  assert.equal(await p.locator('#masterSiteAd img').evaluate(e=>e.naturalWidth),1122);assert.match(await p.locator('#masterSiteAd img').getAttribute('src'),/xtream-iptv-football-year-350.webp$/);
  assert.equal(await p.locator('#masterSiteAd .site-ad-cta').getAttribute('href'),'/products/xtream-iptv.html?plan=0');
  assert(await p.evaluate(key=>Number(localStorage.getItem(key))>0,KEY));assert(await p.locator('.site-ad-close').evaluate(e=>e===document.activeElement));
  for(const width of [320,390,1440]){await p.setViewportSize({width,height:844});await p.clock.runFor(40);const r=await p.locator('#masterSiteAd').boundingBox();assert(r.x>=0&&r.y>=0&&r.x+r.width<=width+1&&r.y+r.height<=845,'dialog fits '+width);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  await p.setViewportSize({width:390,height:844});await p.evaluate(()=>MasterLocale.setLanguage('en'));assert.equal(await p.locator('.site-ad-close').getAttribute('aria-label'),'Close advertisement');assert(!/[\u0621-\u064a]/.test(await p.locator('#masterSiteAd').textContent()));
  await p.evaluate(()=>MasterLocale.setMarket('SA'));assert(await p.locator('.site-ad-market-note').isVisible());await p.evaluate(()=>MasterLocale.setMarket('EG'));assert(!await p.locator('.site-ad-market-note').isVisible());
  await p.evaluate(()=>MasterLocale.setLanguage('ar'));await p.screenshot({path:'/tmp/master-site-ad-mobile.png'});
  await p.keyboard.press('Escape');await open(p).waitFor({state:'hidden'});await p.clock.runFor(40);assert(!await p.evaluate(()=>document.documentElement.classList.contains('site-ad-visible')));
  await p.locator('[data-theme-toggle]').click({force:true});await p.locator('[data-theme-choice=dark]').click({force:true});
  await p.clock.fastForward(SIX_HOURS-1000);assert.equal(await open(p).count(),0,'cooldown holds');await p.clock.fastForward(1100);await open(p).waitFor();
  assert.notEqual(await p.locator('#masterSiteAd').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 255, 255)','dark theme');await p.screenshot({path:'/tmp/master-site-ad-dark.png'});
  await p.locator('.site-ad-close').click({force:true});await p.clock.runFor(40);await p.goto(origin+'/categories/entertainment.html');await p.clock.fastForward(20000);assert.equal(await open(p).count(),0,'cooldown persists across pages');await p.context().close();

  const typing=await pageFor();await typing.locator('#search').focus();await typing.clock.fastForward(13000);assert.equal(await open(typing).count(),0,'typing is not interrupted');assert.equal(await typing.evaluate(k=>localStorage.getItem(k),KEY),null);await typing.locator('#search').blur();await typing.clock.fastForward(31000);await open(typing).waitFor();await typing.context().close();

  const modal=await pageFor();await modal.evaluate(()=>{const d=document.createElement('dialog');d.id='checkout-test';d.textContent='Checkout in progress';document.body.append(d);d.showModal();});await modal.clock.fastForward(13000);assert.equal(await open(modal).count(),0,'another modal is not interrupted');await modal.evaluate(()=>document.querySelector('#checkout-test').close());await modal.clock.runFor(100);await modal.clock.fastForward(31000);await modal.clock.runFor(100);await open(modal).waitFor();await modal.context().close();

  const hidden=await pageFor();await hidden.evaluate(()=>Object.defineProperty(document,'hidden',{configurable:true,get:()=>true}));await hidden.clock.fastForward(13000);assert.equal(await open(hidden).count(),0,'hidden tab is not counted');assert.equal(await hidden.evaluate(k=>localStorage.getItem(k),KEY),null);await hidden.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));});await hidden.clock.runFor(100);await open(hidden).waitFor();await hidden.context().close();

  for(const [route,options,label] of [['/',{price:40000},'changed price'],['/',{available:false},'unavailable'],['/categories/entertainment.html',{networkError:true},'price check failed'],['/products/xtream-iptv.html',{},'own product'],['/cart.html',{},'cart'],['/account.html',{},'login'],['/admin.html',{},'admin']]){
   const q=await pageFor(route,options);if(/cart|account|admin/.test(label))await q.addScriptTag({url:origin+'/site-ads.js'});
   await q.clock.fastForward(15000);assert.equal(await open(q).count(),0,label);assert.equal(await q.evaluate(k=>localStorage.getItem(k),KEY),null,label+' should not consume impression');await q.context().close();
  }
  const category=await pageFor('/categories/entertainment.html');await category.clock.fastForward(13000);await open(category).waitFor();await category.locator('.site-ad-cta').click({force:true});await category.waitForURL('**/products/xtream-iptv.html?plan=0');assert.equal(await category.locator('#masterSiteAd').count(),0);assert.equal(await category.evaluate(()=>JSON.parse(localStorage.getItem('master-cart-v1')||'[]').length),0,'ad click does not add to cart');await category.context().close();
  const crossTab=await pageFor();await crossTab.evaluate(k=>{localStorage.setItem(k,String(Date.now()));dispatchEvent(new StorageEvent('storage',{key:k}));},KEY);await crossTab.clock.fastForward(15000);assert.equal(await open(crossTab).count(),0,'shared browser impression suppresses another page');await crossTab.context().close();
  assert.deepEqual(errors,[]);console.log('PASS: delayed recurring ad, six-hour cooldown across navigation, dismiss/Escape/focus, mobile/desktop fit, AR/EN and currency note, busy/hidden suppression, current-price and stock guards, private-page exclusion, category CTA without an order.');
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
