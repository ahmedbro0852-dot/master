// Run with: node tests/invoices.test.cjs (Playwright + Chromium required).
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{let file=path.join(base,new URL(req.url,'http://localhost').pathname);if(!file.startsWith(base+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox','--disable-dev-shm-usage']});
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();
 const id='12345678-1234-1234-1234-123456789abc',cart='aaaaaaaa-1234-1234-1234-123456789abc';
 const row={id,cart_id:cart,product:'Windows 11 Pro',plan:'Pro — Lifetime',duration:'مدى الحياة للإصدار المشترى',quantity:2,amount_piasters:50350,subtotal_piasters:53000,discount_piasters:2650,payment:'wallet',status:'processing',created_at:'2026-10-23T10:00:00Z',customer:{name:'<img src=x onerror=alert(1)>',email:'test@example.invalid',phone:'01000000000'}};
 let rows=[row],signed=true,queries=[];
 await page.route('**/*',async route=>{const u=new URL(route.request().url());if(u.origin!==origin)return route.abort();if(u.pathname==='/cloud.js')return route.fulfill({contentType:'text/javascript',body:`window.MasterCloud={ready:true,user:async()=>window.__signed?{id:'owner'}:null,unwrap:async x=>x,client:{from:()=>{let q={select(){return q},eq(k,v){window.__queries.push([k,v]);return q},order(){return q},limit(){return Promise.resolve(window.__rows)}};return q},auth:{onAuthStateChange(fn){window.__auth=fn}}}};`});return route.continue();});
 async function open(query,guest=[]){await page.addInitScript(({r,s,g})=>{window.__rows=r;window.__signed=s;window.__queries=[];localStorage.setItem('masterStoreOrdersV1',JSON.stringify(g));},{r:rows,s:signed,g:guest});await page.goto(origin+'/invoice.html?'+query);await page.waitForFunction(()=>document.getElementById('invoiceRoot').getAttribute('aria-busy')==='false');}
 try{
  await open('id='+id);assert.equal(await page.locator('.invoice-status.paid').count(),1);assert.equal(await page.locator('td').count(),5);assert.equal(await page.locator('.invoice-info img').count(),0);assert.match(await page.locator('.invoice-info').innerText(),/<img/);assert.equal(await page.locator('#printInvoice').isDisabled(),false);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.deepEqual(await page.evaluate(()=>window.__queries),[['id',id]]);
  await page.evaluate(()=>window.MasterLocale.setLanguage('ar'));await page.screenshot({path:'/tmp/master-invoice-ar.png',fullPage:true});await page.emulateMedia({media:'print'});await page.pdf({path:'/tmp/master-invoice-ar.pdf',format:'A4'});await page.emulateMedia({media:'screen'});await page.click('#languageButton');await page.waitForFunction(()=>document.documentElement.lang==='en');assert.match(await page.locator('.invoice-totals').innerText(),/503\.5/);assert.match(await page.locator('.invoice-totals').innerText(),/26\.5/);
  let printed=false;await page.exposeFunction('__printed',()=>{printed=true});await page.evaluate(()=>window.print=()=>window.__printed());await page.click('#printInvoice');assert(printed);
  await page.emulateMedia({media:'print'});assert.equal(await page.locator('.invoice-toolbar').isVisible(),false);await page.pdf({path:'/tmp/master-invoice-test.pdf',format:'A4'});await page.emulateMedia({media:'screen'});await page.screenshot({path:'/tmp/master-invoice-mobile.png',fullPage:true});
  await page.evaluate(()=>window.__auth('SIGNED_OUT'));assert.equal(await page.locator('.invoice-sheet').count(),0);assert(await page.locator('#printInvoice').isDisabled());
  rows=[{...row,status:'pending_payment',payment:'InstaPay'}];await open('id='+id);assert.equal(await page.locator('.invoice-status.paid').count(),0);assert.equal(await page.locator('.invoice-notice').count(),1);
  rows=[{...row,status:'cancelled'}];await open('id='+id);assert.equal(await page.locator('.invoice-status.cancelled').count(),1);
  rows=[row,{...row,id:'second',amount_piasters:10000,discount_piasters:0}];await open('cart='+cart);assert.equal(await page.locator('tbody tr').count(),2);assert.deepEqual(await page.evaluate(()=>window.__queries),[['cart_id',cart]]);
  rows=[];await open('id='+id);assert.equal(await page.locator('.invoice-sheet').count(),0);assert(await page.locator('#printInvoice').isDisabled());
  rows=[{...row,ordered_on:'2026-10-23',reference:'DIRECT-100',contact:{name:'Direct customer',phone:'201111111111'},payment_status:'paid',quantity:100}];await open('crm='+id);assert.equal(await page.locator('.invoice-status.paid').count(),1);assert.match(await page.locator('.invoice-info').innerText(),/DIRECT-100/);assert.equal(await page.locator('#backLink').getAttribute('href'),'management.html');
  rows=[{...rows[0],payment_status:'refunded'}];await open('crm='+id);assert.equal(await page.locator('.invoice-status.cancelled').count(),1);assert.equal(await page.locator('.invoice-status.paid').count(),0);
  await open('crm='+id+'&source=device');assert.equal(await page.locator('.invoice-sheet').count(),0);
  signed=false;await open('id='+id);assert.equal(await page.locator('.invoice-sheet').count(),0);assert.deepEqual(await page.evaluate(()=>window.__queries),[]);
  const guest={id:'MS-GUEST',cartId:'guest-cart',product:'Windows',plan:'Pro',quantity:1,total:265,discount:0,status:'completed',payment:'wallet',createdAt:row.created_at,customer:{name:'Guest'}};
  await open('id=MS-GUEST&source=device',[guest]);assert.equal(await page.locator('.invoice-sheet').count(),1);assert.equal(await page.locator('.invoice-status.paid').count(),0);assert.equal(await page.locator('.invoice-notice').count(),1);assert.deepEqual(await page.evaluate(()=>window.__queries),[]);
  await open('cart=guest-cart&source=device',[guest]);assert.equal(await page.locator('tbody tr').count(),1);
  console.log('PASS: saved totals/discounts, cart invoice, payment states, device warning, escaped customer data, auth cleanup, mobile layout, print/PDF and no unauthorized fallback.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
