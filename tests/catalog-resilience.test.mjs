import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog} from '../api/studio.mjs';
const model={model_id:'test-720',media_type:'video',api_name:'test',resolution:'720p'};
test('catalog tries next configured provider key after a timeout',async()=>{
 process.env.ROYAL_API_KEY='first-test-key';
 process.env.ROYAL_API_KEY_2='backup-test-key';
 const tried=[];
 global.fetch=async(_url,options)=>{
  tried.push(options.headers.Authorization);
  if(options.headers.Authorization==='Bearer first-test-key')throw Error('supplier temporarily down');
  return Response.json({data:[model,{model_id:'image',media_type:'image'}]});
 };
 const r=await catalog({forceRefresh:true});
 assert.equal(r.stale,false);
 assert.deepEqual(r.models,[model]);
 assert.deepEqual(tried,['Bearer first-test-key','Bearer backup-test-key']);
 delete process.env.ROYAL_API_KEY_2;
});
test('failed supplier refresh shows cached catalog only in read-only mode',async()=>{
 process.env.ROYAL_API_KEY='first-test-key';
 global.fetch=async()=>Response.json({error:{message:'temporarily unavailable'}},{status:503});
 const old=await catalog({forceRefresh:true,allowStale:true});
 assert.equal(old.stale,true);
 assert.deepEqual(old.models,[model]);
 await assert.rejects(()=>catalog({forceRefresh:true}),e=>e.status===503);
});
test('backend source includes refund column in both fresh and upgrade definitions',async()=>{
 const {readFileSync}=await import('node:fs');
 for(const file of ['background.sql','schema.sql']){
  const content=readFileSync(new URL('../supabase/'+file,import.meta.url),'utf8');
  assert.match(content,/select id,external_id,model,prompt,cost_cents,status,refunded,payload/);
 }
});
