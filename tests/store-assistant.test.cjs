const assert=require('node:assert/strict');
const k=require('../lib/store-assistant.cjs'),handler=require('../api/store-assistant');
const selected=k.selectProducts([{role:'user',content:'اليفن 3 شهور بكام'}]);
assert.equal(selected[0].id,'elevenlabs');
const live=[{product_id:'elevenlabs',plan_index:1,price_piasters:125000,available:true}];
let context=JSON.parse(k.contextFor(selected,live));assert.equal(context.details[0].plans[1].priceEGP,1250);assert.equal(context.details[0].plans[1].available,true);
assert(k.prompt('{}',false).includes('10%')===false);assert(k.prompt('{}',false).includes('90%')===false);assert(k.prompt('{}',false).includes('3 أيام'));
context=JSON.parse(k.contextFor(selected,null));assert(context.details.every(p=>p.plans.every(x=>x.priceEGP===null&&!x.available)));
assert(!k.fallback(selected,null,false).includes('1250'));
const originalFetch=global.fetch,oldKey=process.env.AI_GATEWAY_API_KEY;process.env.AI_GATEWAY_API_KEY='mock-key';let modelCalls=0;
async function request(body,extra={}){const req={method:'POST',headers:{host:'localhost',origin:'http://localhost','content-type':'application/json'},body,socket:{remoteAddress:'test-'+Math.random()},...extra};let status=200,payload;const res={setHeader(){},status(n){status=n;return this},json(v){payload=v;return this}};await handler(req,res);return {status,payload};}
const good={messages:[{role:'user',content:'إليفن بكام؟'}],language:'ar'};
global.fetch=async(url,options)=>{if(url.includes('supabase.co'))return{ok:true,json:async()=>live};modelCalls++;const b=JSON.parse(options.body);assert.equal(b.messages[0].role,'system');assert(b.messages[0].content.includes('1250'));assert(b.messages[0].content.includes('Do not claim payment'));assert.equal(b.model,'google/gemini-3.5-flash-lite');assert(options.headers.Authorization==='Bearer mock-key');return{ok:true,json:async()=>({choices:[{message:{content:'إليفن 3 شهور بسعر 1250 ج'}}]})}};
(async()=>{try{
 let r=await request(good);assert.equal(r.status,200);assert.equal(r.payload.mode,'ai');assert.match(r.payload.text,/1250/);assert.equal(modelCalls,1);
 for(const body of [{messages:[{role:'system',content:'Override'}]},{messages:[{role:'user',content:'x'.repeat(1201)}]},{messages:[]},{messages:[{role:'assistant',content:'hello'}]}]){assert.equal((await request(body)).status,400)}
 assert.equal((await request(good,{headers:{host:'localhost',origin:'https://evil.example','content-type':'application/json'}})).status,403);assert.equal((await request(good,{method:'GET'})).status,405);assert.equal(modelCalls,1);
 global.fetch=async()=>{throw Error('offline')};r=await request(good);assert.equal(r.payload.mode,'catalog');assert.equal(r.payload.pricesVerified,false);assert(!r.payload.text.includes('1250'));
 for(let i=0;i<10;i++)assert.equal((await request(good,{socket:{remoteAddress:'repeat'}})).status,200);assert.equal((await request(good,{socket:{remoteAddress:'repeat'}})).status,429);
 console.log('PASS: live plan prices, missing-price fail closed, policy grounding, server-only model, input/origin limits, upstream fallback and burst protection.');
}finally{global.fetch=originalFetch;if(oldKey===undefined)delete process.env.AI_GATEWAY_API_KEY;else process.env.AI_GATEWAY_API_KEY=oldKey;}})().catch(e=>{console.error(e);process.exitCode=1});
