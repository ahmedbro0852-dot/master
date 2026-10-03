import {Miniflare} from 'miniflare';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const mf=new Miniflare({workers:[{config:{name:'bot',compatibilityDate:'2026-10-03',manifest:{mainModule:'worker.js',modulesRoot:new URL('../src/',import.meta.url).pathname,modules:{'worker.js':{type:'esm',contents:readFileSync('src/worker.js','utf8')},...Object.fromEntries(['dashboard.js','portal.js','commerce.js'].map(n=>[n,{type:'esm',contents:readFileSync('src/'+n,'utf8')}]))}},env:{STATE:{type:'durable-object',worker:'bot',exportName:'BotState'},ADMIN_TOKEN:{type:'json',value:'runtime-test-only'},GRAPH_VERSION:{type:'json',value:'v25.0'}},exports:{BotState:{type:'durable-object',storage:'sqlite'}}}}]});
async function call(path,data,method='GET'){
 const r=await mf.dispatchFetch('https://bot.example'+path,{method,headers:{authorization:'Bearer runtime-test-only','content-type':'application/json'},body:data?JSON.stringify(data):undefined});
 const d=await r.json();assert.ok(r.ok,JSON.stringify(d));return d;
}
try{
 const a=await call('/api/clients',{businessName:'عميل اختبار أول'},'POST');
 const b=await call('/api/clients',{businessName:'عميل اختبار ثانٍ'},'POST');
 await call('/api/clients/'+a.id,{...a,knowledge:'الشحن خلال ثلاثة أيام'},'PUT');
 const rows=await call('/api/clients');assert.equal(rows.length,2);assert.equal(rows.find(c=>c.id===a.id).knowledge,'الشحن خلال ثلاثة أيام');assert.equal(rows.find(c=>c.id===b.id).knowledge,'');
 const settings=await call('/api/settings',{baseURL:'https://gateway.example/v1',model:'provider-model',outputParameter:'max_tokens'},'POST');assert.equal(settings.hasKey,false);
 const r=await mf.dispatchFetch('https://bot.example/');assert.ok((await r.text()).includes('اختار باقتك'));
 const cookies=[];
 async function customer(path,data,index=0,method){const r=await mf.dispatchFetch('https://bot.example/api/'+path,{method:method||(data?'POST':'GET'),headers:{'content-type':'application/json',...(cookies[index]?{cookie:cookies[index]}:{})},body:data?JSON.stringify(data):undefined});const d=await r.json();return {r,d};}
 for(let i=0;i<2;i++){const {r,d}=await customer('shop/register',{name:'زبون '+i,email:`customer${i}@example.com`,phone:'20100000000'+i,password:'correct-password-'+i},i);assert.equal(r.status,200,JSON.stringify(d));assert.equal(d.hash,undefined);assert.match(r.headers.get('set-cookie'),/HttpOnly; Secure; SameSite=Strict/);cookies[i]=r.headers.get('set-cookie').split(';')[0];}
 const store=await call('/api/commerce/store');
 const order=await customer('account/orders',{planId:store.plans[0].id,businessName:'نشاط الزبون',price:1,ownerUserId:'fake'});assert.equal(order.r.status,201);assert.equal(order.d.plan.price,store.plans[0].price);
 assert.equal((await customer('account/orders')).d.length,1);assert.equal((await customer('account/orders',undefined,1)).d.length,0);
 assert.equal((await customer('account/orders/'+order.d.id+'/message',{text:'تواصل معي للتأكيد'},1)).r.status,403);
 assert.equal((await customer('account/orders/'+order.d.id+'/message',{text:'تواصل معي للتأكيد'})).r.status,200);
 const approved=await call('/api/commerce/orders/'+order.d.id+'/approve',{},'POST');assert.equal(approved.status,'approved');
 await call('/api/commerce/orders/'+order.d.id+'/approve',{},'POST');assert.equal((await call('/api/clients')).length,3);
 const own=await customer('account/clients');assert.equal(own.d.length,1);assert.equal(own.d[0].enabled,false);assert.equal((await customer('account/clients',undefined,1)).d.length,0);
 assert.equal((await customer('account/clients/'+approved.clientId,{businessName:'سرقة',knowledge:'x'},1,'PUT')).r.status,403);
 assert.equal((await customer('account/clients/'+approved.clientId,{businessName:'نشاطي',knowledge:'الشحن ٥٠ جنيه',monthlyReplies:999999},0,'PUT')).r.status,400);
 assert.equal((await customer('account/clients/'+approved.clientId,{businessName:'نشاطي',knowledge:'الشحن ٥٠ جنيه'},0,'PUT')).r.status,200);
 await call('/api/clients/'+approved.clientId,{...own.d[0],knowledge:'تعديل الإدارة'},'PUT');assert.equal((await customer('account/clients')).d.length,1);
 const forbidden=await mf.dispatchFetch('https://bot.example/api/commerce/users',{headers:{cookie:cookies[0]}});assert.equal(forbidden.status,401);
 const login=await customer('shop/login',{email:'customer0@example.com',password:'correct-password-0'});assert.equal(login.r.status,200);assert.equal((await customer('shop/login',{email:'customer0@example.com',password:'wrong-password'})).r.status,401);
 const users=await call('/api/commerce/users');assert.equal(users.length,2);assert.ok(users.every(u=>!u.hash&&!u.salt));
 await call('/api/commerce/orders/'+order.d.id+'/message',{text:'تم تأكيد الدفع'},'POST');const thread=(await customer('account/orders')).d[0];assert.equal(thread.messages[1].role,'admin');
 const xss='</script><script>alert(1)</script>';await call('/api/commerce/store',{...store,plans:store.plans.map((p,i)=>({...p,name:i===0?xss:p.name}))},'PUT');
 for(const route of ['/','/account','/admin']){const response=await mf.dispatchFetch('https://bot.example'+route);assert.equal(response.status,200);assert.match(response.headers.get('content-security-policy'),/frame-ancestors 'none'/);}
 console.log('Commerce runtime: signup, hashed login, order pricing, manual approval, idempotency, customer/admin isolation, protected plan limits and support thread passed.');
 console.log('Cloudflare runtime: create, update, tenant isolation, provider settings and dashboard HTML passed.');
}finally{await mf.dispose();}
