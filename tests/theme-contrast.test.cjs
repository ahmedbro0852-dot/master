const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict'),Social=require('../social-links.js');
assert.deepEqual(require('../seo-config.js').homeGraph['@graph'].find(x=>x['@type']==='Organization').sameAs,[Social.facebook,Social.whatsappChannel]);
const root=path.resolve(__dirname,'..'),sb={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'catalog.js'),'utf8'),sb);const catalog=sb.window.MasterCatalog,rows=catalog.products.flatMap(p=>(p.plans||[]).map((plan,i)=>({product_id:p.id,plan_index:i,price_piasters:Math.round(plan.price*100),available:p.status==='available'&&plan.available!==false,max_quantity:5,admin_overridden:false,previous_price_piasters:plan.previousStorePrice?Math.round(plan.previousStorePrice*100):null})));
const server=http.createServer((req,res)=>{let p=path.join(root,new URL(req.url,'http://localhost').pathname);if(p.endsWith('/'))p+='index.html';try{res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':p.endsWith('.webp')?'image/webp':p.endsWith('.svg')?'image/svg+xml':p.endsWith('.png')?'image/png':'text/html');res.end(fs.readFileSync(p))}catch{res.writeHead(404).end()}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port,b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox','--disable-dev-shm-usage']});try{const page=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[],quotes=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>localStorage.setItem('masterStoreLocaleV1',JSON.stringify({language:'ar',market:'EG',manualMarket:true})));await page.route('**/*',r=>{let u=new URL(r.request().url());if(u.pathname==='/rest/v1/master_store_plans')return r.fulfill({contentType:'application/json',body:JSON.stringify(rows)});if(u.pathname==='/auth/v1/settings')return r.fulfill({contentType:'application/json',body:JSON.stringify({external:{google:true}})});if(u.pathname==='/rest/v1/rpc/master_store_quote_cart'){const body=r.request().postDataJSON();quotes.push(body);const items=body.items.map(x=>{let p=catalog.getProduct(x.product_id),plan=p.plans[x.plan_index],unit=Math.round(plan.price*100);return{...x,product:p.name,plan:plan.name,duration:plan.duration,unit_piasters:unit,amount_piasters:unit*x.quantity,max_quantity:5}}),total=items.reduce((n,x)=>n+x.amount_piasters,0);return r.fulfill({contentType:'application/json',body:JSON.stringify({items,subtotal_piasters:total,amount_piasters:total,discount_piasters:0,discount_percent:0,rules:{two:3,three:5,four:7,five:10}})})}if(u.origin!==origin)return r.abort();return r.continue()});

const lowContrast=()=>{function rgb(s){return(s.match(/[\d.]+/g)||[]).map(Number)}function lum(c){let v=c.slice(0,3).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4});return v[0]*.2126+v[1]*.7152+v[2]*.0722}let seen=new Set;return [...document.querySelectorAll('body *')].filter(e=>e.checkVisibility()&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).flatMap(e=>{let s=getComputedStyle(e),a=e,bg;while(a){let t=getComputedStyle(a);if(t.backgroundImage!=='none')return[];bg=rgb(t.backgroundColor);if(bg.length===3||bg[3]===1)break;a=a.parentElement}if(!a)return[];let fg=rgb(s.color),x=lum(fg),y=lum(bg),ratio=(Math.max(x,y)+.05)/(Math.min(x,y)+.05);let key=e.className+':'+s.color+':'+bg;if(ratio>=4.5||seen.has(key))return[];seen.add(key);return[{tag:e.tagName,cls:e.className,text:e.textContent.trim().slice(0,65),fg:s.color,bg,ratio:ratio.toFixed(2)}]})};
for(const theme of ['dark','midnight','forest','warm','light']){
 await page.addInitScript(value=>localStorage.setItem('masterStoreThemeV1',value),theme);
 for(const route of ['/index.html','/product.html?id=capcut-pro','/account.html','/cart.html','/track.html','/warranty.html']){
  await page.goto(origin+route); await page.waitForTimeout(150);
  if(route.includes('product.html'))await page.locator('#buyBtn').waitFor();
  if(route.includes('account.html'))await page.locator('#authForm').waitFor();
  if(theme!=='light')assert.deepEqual(await page.evaluate(lowContrast),[],theme+' contrast '+route);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),theme+' mobile layout '+route);
  if(route.includes('index.html')){
   await page.locator('[data-theme-toggle]').click();
   if(theme!=='light')assert.deepEqual(await page.evaluate(lowContrast),[],theme+' appearance menu');
   await page.keyboard.press('Escape');
   await page.locator('.store-assistant-launcher').click();
   if(theme!=='light')assert.deepEqual(await page.evaluate(lowContrast),[],theme+' assistant dialog');
   await page.keyboard.press('Escape');
  }
 }
}
assert.deepEqual(errors,[]);console.log('PASS: visible text contrast >=4.5:1 on solid backgrounds across 6 pages in dark, midnight, forest and warm; mobile layout, theme menu, assistant, light-mode smoke; no page errors.');
}finally{await b.close();server.close()}})().catch(e=>{console.error(e);server.close();process.exitCode=1});
