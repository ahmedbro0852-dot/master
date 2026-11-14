import {timingSafeEqual,createHmac} from 'node:crypto';
import {provider,backend} from './studio.mjs';
function retrySeconds(value,fallback=60){if(!value)return fallback;const n=Number(value);return Math.min(86400,Math.max(60,Number.isFinite(n)?n:Math.ceil((Date.parse(value)-Date.now())/1000)||fallback));}
export async function processJob(j){
 const identity={code_hash:j.code_hash,id:j.id};let retry=0;
 try{
  if(j.status==='submitting'&&j.request_body){
   const r=await provider('jobs',j.request_body,j.id,Number(j.provider_key)||0);
   if(!r.ok){
    if(r.status===429||r.status>=500){retry=retrySeconds(r.retryAfter);return 'retry';}
    await backend('finish',{...identity,status:'failed',payload:r.data});return 'failed';
   }
   const external_id=r.data.external_id||r.data.id;if(!external_id)return 'retry';
   j=await backend('finish',{...identity,status:r.data.status||'queued',external_id,payload:r.data});
  }else if(j.external_id&&!['succeeded','failed','canceled'].includes(j.status)){
   const r=await provider('jobs/'+encodeURIComponent(j.external_id),undefined,undefined,Number(j.provider_key)||0);
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
 const timestamp=String(req.headers['x-worker-timestamp']||''),signature=String(req.headers['x-worker-signature']||'');
 const secret=process.env.FLOW_WORKER_SECRET;
 if(req.method!=='POST'||!secret||!/^\d{10}$/.test(timestamp)||Math.abs(Date.now()/1000-Number(timestamp))>120||!/^[a-f0-9]{64}$/.test(signature))return res.status(403).json({error:'Forbidden'});
 const expected=createHmac('sha256',secret).update('master-flow-worker:'+timestamp).digest();
 if(!timingSafeEqual(Buffer.from(signature,'hex'),expected))return res.status(403).json({error:'Forbidden'});
 try{const jobs=await backend('claim',{});const results=await Promise.all(jobs.map(processJob));return res.json({ok:true,checked:results.length,results})}catch{return res.status(502).json({error:'Background runner unavailable'});}
}
