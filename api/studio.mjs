import {createHash} from 'node:crypto';
import {quoteCents} from '../lib/pricing.mjs';
import {validateReferenceImage} from '../lib/reference-image.mjs';
const hash=v=>createHash('sha256').update(v).digest('hex');
let catalogCache,catalogPromise;
// Secrets stay in Vercel: never expose keys or use a different key for an accepted job.
const keyName=slot=>slot===0?'ROYAL_API_KEY':'ROYAL_API_KEY_'+(slot+1);
export function providerSlots(){
 return Array.from({length:6},(_,slot)=>slot).filter(slot=>Boolean(process.env[keyName(slot)]));
}
export async function provider(path,body,id,slot=0,timeoutMs=25000){
 const key=process.env[keyName(slot)];
 if(!key)throw Error('Provider credential is unavailable');
 const r=await fetch('https://api.royaltechno.cc/v1/'+path,{
  method:body?'POST':'GET',
  headers:{Authorization:'Bearer '+key,'Content-Type':'application/json',...(id?{'Idempotency-Key':id}:{})},
  ...(body?{body:JSON.stringify(body)}:{}),
  signal:AbortSignal.timeout(timeoutMs)
 });
 let x;try{x=await r.json()}catch{x={error:{message:'الخدمة غير متاحة مؤقتًا.'}}}
 return {ok:r.ok,status:r.status,data:x,retryAfter:r.headers.get('retry-after')};
}
export async function backend(action,data){const r=await fetch(process.env.FLOW_BACKEND_URL,{method:'POST',headers:{'Content-Type':'application/json','x-studio-secret':process.env.FLOW_GATEWAY_SECRET},body:JSON.stringify({action,data}),signal:AbortSignal.timeout(45000)});const x=await r.json();if(!r.ok){const e=Error(x.error||'تعذر الاتصال بقاعدة البيانات');e.status=r.status;throw e}return x;}
export async function catalog({allowStale=false,forceRefresh=false}={}){
 const now=Date.now();
 if(!forceRefresh&&catalogCache&&now-catalogCache.at<60000)return {models:catalogCache.data,stale:false};
 async function fetchFresh(){
  // Capped upstream wait prevents six timed-out keys exhausting a serverless request.
  // A successful catalog is cached but is never trusted indefinitely for pricing.
  for(const slot of providerSlots()){
   try{
    const r=await provider('models',undefined,undefined,slot,4000);
    if(r.ok&&Array.isArray(r.data?.data)){
     const models=r.data.data.filter(m=>m&&m.media_type==='video');
     catalogCache={at:Date.now(),data:models};
     return models;
    }
   }catch{ /* Timeout or broken key: try the next configured key. */ }
  }
  throw Object.assign(Error('تعذّر تحديث النماذج من مزوّد التوليد حاليًا'),{status:503});
 }
 try{
  if(!catalogPromise)catalogPromise=fetchFresh().finally(()=>{catalogPromise=null;});
  return {models:await catalogPromise,stale:false};
 }catch(e){
  // Only show an old catalog. Never create or price a video from stale data.
  if(allowStale&&catalogCache&&Date.now()-catalogCache.at<10*60*1000)return {models:catalogCache.data,stale:true};
  throw e;
 }
}
function jobView(j){
 const output=j.payload?.output;
 return {
  id:j.id,model:j.model,prompt:j.prompt,cost_cents:j.cost_cents,
  status:j.status,refunded:!!j.refunded,created_at:j.created_at,
  archive_state:j.archive_state,stored:!!j.file_key,
  output:j.file_key?{...(output||{}),url:'/api/studio?action=download&id='+j.id}:output,
  error:j.payload?.error,
  payload:{started_at:j.payload?.started_at,output:output?.type?{type:output.type}:undefined}
 };
}
function getCookie(req){const raw=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('flow_session='));return raw?.slice(13)||'';}
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');const action=req.query.action||'account';
 try{
 if(req.method==='POST'){
  const origin=req.headers.origin,host=req.headers.host;
  if(!origin||new URL(origin).host!==host)return res.status(403).json({error:'مصدر الطلب غير مسموح'});
  if(!(req.headers['content-type']||'').startsWith('application/json'))return res.status(415).json({error:'JSON مطلوب'});
 }
 if(req.method!=='POST'&&['login','generate','logout'].includes(action))return res.status(405).json({error:'Method not allowed'});
 if(action==='catalog')return res.json(await catalog({allowStale:true}));
 if(action==='login'){
  const code=String(req.body?.code||'').replace(/\s+/g,'').toUpperCase();
  if(!/^MF-[A-F0-9]{6}-[A-F0-9]{6}-[A-F0-9]{6}$/.test(code))return res.status(401).json({error:'الكود غير صحيح'});
  const code_hash=hash(code),ip_hash=hash(process.env.FLOW_GATEWAY_SECRET+(req.headers['x-forwarded-for']||'unknown'));
  const account=await backend('login',{code_hash,ip_hash});res.setHeader('Set-Cookie',`flow_session=${code_hash}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=31536000`);return res.json({...account,jobs:account.jobs.map(jobView)});
 }
 if(action==='logout'){res.setHeader('Set-Cookie','flow_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');return res.json({ok:true});}
 const code_hash=getCookie(req);if(!/^[a-f0-9]{64}$/.test(code_hash))return res.status(401).json({error:'أدخل كود الهدية للمتابعة'});
 if(action==='account'){const account=await backend('account',{code_hash});res.setHeader('Set-Cookie',`flow_session=${code_hash}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=31536000`);return res.json({...account,jobs:account.jobs.map(jobView)});}
 if(action==='generate'){
  const body=req.body||{},id=body.id;
  if(!/^[a-f0-9-]{36}$/i.test(id))return res.status(400).json({error:'رقم الطلب غير صالح'});
  const {models:liveModels}=await catalog();
  const m=liveModels.find(m=>m.model_id===body.model_id&&m.media_type==='video');
  if(!m)return res.status(400).json({error:'النموذج غير متاح'});
  const prompt=String(body.prompt||'').trim();if(!prompt||prompt.length>m.prompt_max)return res.status(400).json({error:'راجع طول وصف المشهد'});
  const duration=Number(body.duration||m.duration_default);
  if(m.media_type==='video'&&!m.duration_options.includes(duration))return res.status(400).json({error:'مدة غير مدعومة'});
  const cost=quoteCents(m,duration);
  if(!Number.isInteger(cost)||cost<=0)return res.status(400).json({error:'السعر غير متاح'});
  if(!m.aspect_ratios.includes(body.ratio))return res.status(400).json({error:'مقاس غير مدعوم'});
  if(body.image){if(!m.start_image_supported)return res.status(400).json({error:'النموذج لا يدعم صورة بداية'});try{body.image=validateReferenceImage(body.image)}catch(e){return res.status(400).json({error:e.message})}}
  if(body.creation_mode==='image'&&!body.image)return res.status(400).json({error:'ارفع صورة البداية أولًا'});
  if(m.requires_start_image&&!body.image)return res.status(400).json({error:'النموذج يتطلب صورة مرجعية'});
  const request_body={model:m.api_name,input:{prompt,aspect_ratio:body.ratio,resolution:m.resolution,count:1,...(m.media_type==='video'?{duration_sec:duration}:{}),...(body.image?{start_image_url:body.image}:{})}};
  const slots=providerSlots();if(!slots.length)return res.status(503).json({error:'خدمة التوليد غير مهيأة حاليًا'});
  const provider_key=slots[parseInt(id.replace(/-/g,'').slice(0,8),16)%slots.length];
  const reservation=await backend('reserve',{code_hash,id,cost_cents:cost,provider_key,model:m.display_name,prompt,request_body});
  return res.status(reservation.existing?200:202).json(jobView(reservation.job));
 }
 const id=String(req.query.id||'');if(!/^[a-f0-9-]{36}$/i.test(id))return res.status(400).json({error:'رقم الطلب غير صالح'});
 let j=await backend('job',{code_hash,id});
 if(action==='download'){
  const f=await backend('file',{code_hash,id});res.setHeader('Cache-Control','private, no-store');return res.redirect(302,f.url);
 }
 if(action==='status')return res.json(jobView(j));
 return res.status(404).json({error:'المسار غير موجود'});
 }catch(e){return res.status(e.status||502).json({error:e.status?e.message:'تعذر إكمال الاتصال. راجع أعمالك قبل إعادة إرسال أي طلب توليد.'});}
}
