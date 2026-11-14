import {timingSafeEqual} from 'node:crypto';
import {provider,backend} from './studio.mjs';
function retrySeconds(value,fallback=60){if(!value)return fallback;const n=Number(value);return Math.min(86400,Math.max(60,Number.isFinite(n)?n:Math.ceil((Date.parse(value)-Date.now())/1000)||fallback));}
export async function processJob(j){
 const identity={code_hash:j.code_hash,id:j.id};let retry=0;
 try{
  if(j.status==='submitting'&&j.request_body){
   const r=await provider('jobs',j.request_body,j.id);
   if(!r.ok){
    if(r.status===429||r.status>=500){retry=retrySeconds(r.retryAfter);return 'retry';}
    await backend('finish',{...identity,status:'failed',payload:r.data});return 'failed';
   }
   const external_id=r.data.external_id||r.data.id;if(!external_id)return 'retry';
   j=await backend('finish',{...identity,status:r.data.status||'queued',external_id,payload:r.data});
  }else if(j.external_id&&!['succeeded','failed','canceled'].includes(j.status)){
   const r=await provider('jobs/'+encodeURIComponent(j.external_id));
   if(!r.ok){retry=retrySeconds(r.retryAfter);return 'retry';}
   j=await backend('finish',{...identity,status:r.data.status,payload:r.data});
  }
  if(j.status==='succeeded'&&!j.file_key)await backend('archive',identity);
  return j.status;
 }catch{retry=60;return 'retry';}
 finally{try{await backend('release',{...identity,retry_seconds:retry})}catch{}}
}
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 const supplied=Buffer.from(String(req.headers['x-worker-secret']||'')),expected=Buffer.from(process.env.FLOW_WORKER_SECRET||'');
 if(req.method!=='POST'||!expected.length||supplied.length!==expected.length||!timingSafeEqual(supplied,expected))return res.status(403).json({error:'Forbidden'});
 try{const jobs=await backend('claim',{});const results=await Promise.all(jobs.map(processJob));return res.json({ok:true,checked:results.length,results})}catch{return res.status(502).json({error:'Background runner unavailable'});}
}
