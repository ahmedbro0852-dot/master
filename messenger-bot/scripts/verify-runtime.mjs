import {Miniflare} from 'miniflare';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const mf=new Miniflare({workers:[{config:{name:'bot',compatibilityDate:'2026-10-03',manifest:{mainModule:'worker.js',modulesRoot:new URL('../src/',import.meta.url).pathname,modules:{'worker.js':{type:'esm',contents:readFileSync('src/worker.js','utf8')},'dashboard.js':{type:'esm',contents:readFileSync('src/dashboard.js','utf8')}}},env:{STATE:{type:'durable-object',worker:'bot',exportName:'BotState'},ADMIN_TOKEN:{type:'json',value:'runtime-test-only'},GRAPH_VERSION:{type:'json',value:'v25.0'}},exports:{BotState:{type:'durable-object',storage:'sqlite'}}}}]});
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
 const r=await mf.dispatchFetch('https://bot.example/');assert.ok((await r.text()).includes('إضافة عميل'));
 console.log('Cloudflare runtime: create, update, tenant isolation, provider settings and dashboard HTML passed.');
}finally{await mf.dispose();}
