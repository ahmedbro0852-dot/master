const {chromium}=require('playwright'),fs=require('fs'),http=require('http'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
const mock=`(()=>{
 const user=()=>{const id=localStorage.getItem('avatar-test-user')||'customer-a';return {id,email:id+'@example.invalid',user_metadata:JSON.parse(localStorage.getItem('avatar-test-'+id)||'{"name":"Test Customer","other":"preserved"}')}};
 window.avatarWrites=[];
 window.MasterCloud={ready:true,user:async()=>window.avatarSessionChanged?{id:'someone-else'}:user(),dashboard:async()=>({user:user(),profile:{name:'Test Customer',phone:''},balance:0,topups:[],orders:[],ledger:[],isAdmin:false}),unwrap:async p=>{const r=await p;if(r.error)throw r.error;return r.data},errorText:()=> 'Network error',client:{auth:{getSession:async()=>({data:{session:{user:user()}}}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),updateUser:async attributes=>{window.avatarWrites.push(attributes);await new Promise(r=>setTimeout(r,80));if(window.avatarFail)return {error:Error('Network error')};const current=user();current.user_metadata={...current.user_metadata,...attributes.data};localStorage.setItem('avatar-test-'+current.id,JSON.stringify(current.user_metadata));return {data:{user:current},error:null}}}}};
})();`;
const server=http.createServer((req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;res.setHeader('Content-Type',pathname.endsWith('.js')?'text/javascript':pathname.endsWith('.css')?'text/css':pathname.endsWith('.svg')?'image/svg+xml':'text/html');res.end(fs.readFileSync(path.join(root,pathname)));}catch{res.writeHead(404).end();}});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},locale:'ar-EG',reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin!==origin)return r.abort();if(u.pathname==='/cloud.js')return r.fulfill({contentType:'text/javascript',body:mock});return r.continue();});
  await page.goto(origin+'/account.html');const trigger=page.locator('.avatar-trigger');await trigger.waitFor();await trigger.click();
  const dialog=page.locator('#avatarDialog');assert(await dialog.evaluate(d=>d.open));assert.equal(await dialog.locator('.avatar-option img').count(),32);
  await dialog.locator('img').evaluateAll(imgs=>imgs.forEach(i=>i.loading='eager'));
  await page.waitForFunction(()=>[...document.querySelectorAll('#avatarDialog img')].every(i=>i.complete&&i.naturalWidth>0));
  for(const viewport of [{width:320,height:568},{width:390,height:844},{width:1440,height:1000}]){
   await page.setViewportSize(viewport);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));const r=await dialog.boundingBox();assert(r.x>=0&&r.y>=0&&r.x+r.width<=viewport.width+1&&r.y+r.height<=viewport.height+1,JSON.stringify({viewport,r}));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));const actions=await dialog.locator('.avatar-actions').boundingBox();assert(actions.y>=r.y&&actions.y+actions.height<=r.y+r.height+1,'Footer stays inside dialog');
  }
  await page.setViewportSize({width:390,height:844});
  const choose=id=>dialog.locator('.avatar-option:has(input[value="'+id+'"])').click();
  await choose('avatar-32');assert((await dialog.locator('.avatar-preview img').getAttribute('src')).endsWith('avatar-32.svg'));
  await page.keyboard.press('Escape');await dialog.waitFor({state:'detached'});assert.equal(await dialog.count(),0);assert(await trigger.evaluate(e=>e===document.activeElement));assert.equal(await page.evaluate(()=>avatarWrites.length),0);
  await trigger.click();await choose('avatar-32');await dialog.locator('[type=submit]').click();await dialog.waitFor({state:'detached'});
  assert((await trigger.locator('img').getAttribute('src')).endsWith('avatar-32.svg'));
  assert.deepEqual(await page.evaluate(()=>avatarWrites),[{data:{master_avatar:'avatar-32'}}]);
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('avatar-test-customer-a')).other),'preserved');
  await page.reload();await trigger.waitFor();assert((await trigger.locator('img').getAttribute('src')).endsWith('avatar-32.svg'));
  await trigger.click();await choose('avatar-01');await page.evaluate(()=>window.avatarFail=true);await dialog.locator('[type=submit]').click();await dialog.locator('.avatar-save-status:not([hidden])').waitFor();
  assert((await trigger.locator('img').getAttribute('src')).endsWith('avatar-32.svg'));assert(await dialog.locator('[type=submit]').isEnabled());
  await page.evaluate(()=>window.avatarFail=false);await dialog.locator('[type=submit]').click();await dialog.waitFor({state:'detached'});assert((await trigger.locator('img').getAttribute('src')).endsWith('avatar-01.svg'));
  await trigger.click();await choose('avatar-02');await page.evaluate(()=>window.avatarSessionChanged=true);const before=await page.evaluate(()=>avatarWrites.length);await dialog.locator('[type=submit]').click();await dialog.locator('.avatar-save-status:not([hidden])').waitFor();assert.equal(await page.evaluate(()=>avatarWrites.length),before);await page.keyboard.press('Escape');await dialog.waitFor({state:'detached'});
  await page.evaluate(()=>{localStorage.setItem('avatar-test-user','customer-b');localStorage.setItem('avatar-test-customer-b',JSON.stringify({master_avatar:'https://bad.example/avatar.svg'}));});await page.reload();await trigger.waitFor();assert.equal(await trigger.locator('img').count(),0);
  await trigger.click();await choose('avatar-02');await page.keyboard.press('ArrowRight');assert.equal(await dialog.locator('input:checked').count(),1);await page.keyboard.press('Escape');await dialog.waitFor({state:'detached'});
  await page.evaluate(()=>{window.MasterLocale.setLanguage('en');});await trigger.waitFor();await trigger.click();assert.equal(await dialog.getAttribute('dir'),'ltr');assert.equal(await dialog.locator('h2').textContent(),'Choose your avatar');
  await page.evaluate(()=>{localStorage.setItem('masterStoreThemeV1','dark');window.MasterLocale.setLanguage('ar');});await page.reload();await trigger.waitFor();await trigger.click();await page.waitForFunction(()=>[...document.querySelectorAll('#avatarDialog img')].every(i=>i.complete&&i.naturalWidth>0));await page.screenshot({path:'/tmp/master-avatar-picker.png'});
  assert.deepEqual(errors,[]);console.log('PASS: 32 loaded avatars; real account integration; mobile/desktop fit; preview, cancel, keyboard, persistence, metadata merge, failed-save retry, account isolation and English labels.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
