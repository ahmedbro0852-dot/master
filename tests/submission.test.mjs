import test from 'node:test';
import assert from 'node:assert/strict';
import {submissionId,clearSubmissionId,SUBMISSION_STORAGE_KEY} from '../lib/submission.mjs';

function storage(){
 const items=new Map();
 return {getItem:k=>items.has(k)?items.get(k):null,setItem:(k,v)=>items.set(k,v),removeItem:k=>items.delete(k)};
}
const req={model_id:'veo-720',prompt:'Morning at the seaside',duration:8,ratio:'landscape',creation_mode:'text',image:''};
test('ambiguous network response reuses one UUID for exactly the same video',async()=>{
 const store=storage();
 const a=await submissionId(req,store,1000);
 const b=await submissionId({...req},store,2000);
 assert.equal(a,b);
 assert.equal(JSON.parse(store.getItem(SUBMISSION_STORAGE_KEY)).id,a);
});
test('changing the prompt or any relevant input creates a separate request',async()=>{
 const store=storage();
 const a=await submissionId(req,store,1000);
 const b=await submissionId({...req,prompt:'Another scene'},store,2000);
 assert.notEqual(a,b);
 const c=await submissionId({...req,prompt:'Another scene',duration:10},store,3000);
 assert.notEqual(b,c);
});
test('successful confirmation clears retry token, allowing new deliberate video',async()=>{
 const store=storage();
 const a=await submissionId(req,store,1000);
 clearSubmissionId(store);
 assert.equal(store.getItem(SUBMISSION_STORAGE_KEY),null);
 const b=await submissionId(req,store,2000);
 assert.notEqual(a,b);
});
test('old entries are never recycled and invalid storage never crashes submissions',async()=>{
 const store=storage();
 const a=await submissionId(req,store,1000);
 const b=await submissionId(req,store,31*60*1000);
 assert.notEqual(a,b);
 store.setItem(SUBMISSION_STORAGE_KEY,'broken');
 const c=await submissionId(req,store,32*60*1000);
 assert.notEqual(b,c);
});
