const {chromium}=require('playwright'),fs=require('fs'),http=require('http'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{try{const f=path.join(root,new URL(req.url,'http://localhost').pathname);res.setHeader('Content-Type',f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.svg')?'image/svg+xml':'text/html');res.end(fs.readFileSync(f));}catch{res.writeHead(404).end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port,b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});try{
 const context=await b.newContext({viewport:{width:390,height:844},locale:'ar-EG',reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await context.addInitScript(()=>{if(!localStorage.getItem('masterStoreLocaleV1'))localStorage.setItem('masterStoreLocaleV1',JSON.stringify({language:'ar',market:'EG'}));});
 await context.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin!==origin)return r.abort();if(u.pathname==='/cloud.js')return r.fulfill({contentType:'text/javascript',body:'window.MasterCloud={ready:false}'});return r.continue();});
 await page.goto(origin+'/product.html?id=elevenlabs&plan=1');const option=page.locator('.plan-option:has(input[value="1"])');await option.locator('.plan-price-tag').waitFor();
 assert.match(await option.locator('.plan-price-tag>strong').textContent(),/1,250/);assert.match(await option.locator('.plan-previous-price del').textContent(),/1,500/);assert.match(await option.locator('.plan-previous-price small').textContent(),/بدلًا من/);
 assert.match(await page.locator('#planDetails .plan-previous-price del').textContent(),/1,500/);assert.equal(await page.locator('.plan-option .plan-previous-price').count(),2);assert.match(await option.locator('.plan-saving').textContent(),/250/);assert.match(await option.locator('.plan-saving').textContent(),/سعر المتجر السابق/);assert.equal(await option.locator('del').evaluate(el=>getComputedStyle(el).textDecorationLine),'line-through');
 for(const viewport of [{width:320,height:568},{width:390,height:844},{width:1440,height:1000}]){
  await page.setViewportSize(viewport);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const overflow=await page.evaluate(()=>[...document.querySelectorAll('body *')].map(e=>({tag:e.tagName,cls:e.className,x:e.getBoundingClientRect().x,w:e.getBoundingClientRect().width,parent:e.parentElement?.outerHTML?.slice(0,1800),white:getComputedStyle(e).whiteSpace,text:e.className==='plan-saving'?e.textContent:''})).filter(r=>r.x<0||r.x+r.w>innerWidth+1).slice(0,12));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No price overflow '+viewport.width+' '+JSON.stringify(overflow));
 }
 await page.setViewportSize({width:390,height:844});await option.screenshot({path:'/tmp/master-eleven-price-before-after.png',style:'.mobile-order-bar,.support-fab{visibility:hidden!important}'});
 await page.evaluate(()=>{MasterLocale.setLanguage('en');});await page.waitForFunction(()=>document.querySelector('.plan-previous-price small')?.textContent==='Previously');assert.match(await option.locator('del').textContent(),/1,500/);
 assert.deepEqual(errors,[]);console.log('PASS: 1250 current price, 1500 struck previous store price, distinct official reference, Arabic/English and mobile fit.');
 }finally{await b.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1});
