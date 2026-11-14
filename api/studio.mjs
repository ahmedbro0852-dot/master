import {createHash} from 'node:crypto';
const hash=v=>createHash('sha256').update(v).digest('hex');
let catalogCache;
export async function provider(path,body,id){const r=await fetch('https://api.royaltechno.cc/v1/'+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+process.env.ROYAL_API_KEY,'Content-Type':'application/json',...(id?{'Idempotency-Key':id}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(25000)});let x;try{x=await r.json()}catch{x={error:{message:'الخدمة غير متاحة مؤقتًا.'}}}return {ok:r.ok,status:r.status,data:x,retryAfter:r.headers.get("retry-after")};}
export async function backend(action,data){const r=await fetch(process.env.FLOW_BACKEND_URL,{method:'POST',headers:{'Content-Type':'application/json','x-studio-secret':process.env.FLOW_GATEWAY_SECRET},body:JSON.stringify({action,data}),signal:AbortSignal.timeout(45000)});const x=await r.json();if(!r.ok){const e=Error(x.error||'تعذر الاتصال بقاعدة البيانات');e.status=r.status;throw e}return x;}
async function catalog(){if(catalogCache&&Date.now()-catalogCache.at<60000)return catalogCache.data;const r=await provider('models');if(!r.ok)throw Error(r.data.error?.message);catalogCache={at:Date.now(),data:r.data.data||[]};return catalogCache.data;}
function jobView(j){return {...j,id:j.id,stored:!!j.file_key,output:j.file_key?{...j.payload?.output,url:'/api/studio?action=download&id='+j.id}:j.payload?.output,error:j.payload?.error};}
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
 if(action==='catalog')return res.json({models:await catalog()});
 if(action==='login'){
  const code=String(req.body?.code||'').replace(/\s+/g,'').toUpperCase();
  if(!/^MF-[A-F0-9]{6}-[A-F0-9]{6}-[A-F0-9]{6}$/.test(code))return res.status(401).json({error:'الكود غير صحيح'});
  const code_hash=hash(code),ip_hash=hash(process.env.FLOW_GATEWAY_SECRET+(req.headers['x-forwarded-for']||'unknown'));
  const account=await backend('login',{code_hash,ip_hash});res.setHeader('Set-Cookie',`flow_session=${code_hash}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=31536000`);return res.json({...account,jobs:account.jobs.map(jobView)});
 }
 if(action==='logout'){res.setHeader('Set-Cookie','flow_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');return res.json({ok:true});}
 const code_hash=getCookie(req);if(!/^[a-f0-9]{64}$/.test(code_hash))return res.status(401).json({error:'أدخل كود الهدية للمتابعة'});
 const account=await backend('account',{code_hash});
 if(action==='account'){res.setHeader('Set-Cookie',`flow_session=${code_hash}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=31536000`);return res.json({...account,jobs:account.jobs.map(jobView)});}
 if(action==='generate'){
  const body=req.body||{},id=body.id;
  if(!/^[a-f0-9-]{36}$/i.test(id))return res.status(400).json({error:'رقم الطلب غير صالح'});
  const m=(await catalog()).find(m=>m.model_id===body.model_id&&['video','image'].includes(m.media_type));
  if(!m)return res.status(400).json({error:'النموذج غير متاح'});
  const prompt=String(body.prompt||'').trim();if(!prompt||prompt.length>m.prompt_max)return res.status(400).json({error:'راجع طول وصف المشهد'});
  const duration=Number(body.duration||m.duration_default);
  if(m.media_type==='video'&&!m.duration_options.includes(duration))return res.status(400).json({error:'مدة غير مدعومة'});
  const price=m.prices.find(p=>p.duration_sec===duration)||m.prices[0],cost=price?.cost_usd_cents;
  if(!Number.isInteger(cost)||cost<=0)return res.status(400).json({error:'السعر غير متاح'});
  if(!m.aspect_ratios.includes(body.ratio))return res.status(400).json({error:'مقاس غير مدعوم'});
  if(body.image){const u=new URL(body.image);if(u.protocol!=='https:')return res.status(400).json({error:'رابط الصورة يجب أن يكون HTTPS'});}
  if(m.requires_start_image&&!body.image)return res.status(400).json({error:'النموذج يتطلب صورة مرجعية'});
  const request_body={model:m.api_name,input:{prompt,aspect_ratio:body.ratio,resolution:m.resolution,count:1,...(m.media_type==='video'?{duration_sec:duration}:{}),...(body.image?{start_image_url:body.image}:{})}};
  const reservation=await backend('reserve',{code_hash,id,cost_cents:cost,provider_key:0,model:m.display_name,prompt,request_body});
  return res.status(reservation.existing?200:202).json(jobView(reservation.job));
 }
 const id=String(req.query.id||'');if(!/^[a-f0-9-]{36}$/i.test(id))return res.status(400).json({error:'رقم الطلب غير صالح'});
 let j=await backend('job',{code_hash,id});
 if(action==='download'){
  const f=await backend('file',{code_hash,id});res.setHeader('Cache-Control','private, no-store');return res.redirect(302,f.url);
 }
 if(action==='status'){
  if(j.external_id&&!['succeeded','failed','canceled'].includes(j.status)){
   const r=await provider('jobs/'+encodeURIComponent(j.external_id));if(!r.ok)return res.status(r.status).json({error:r.data.error?.message||'تعذر تحديث الطلب'});
   j=await backend('finish',{code_hash,id,status:r.data.status,payload:r.data});
  }
  if(j.status==='succeeded'&&!j.file_key){try{await backend('archive',{code_hash,id});j=await backend('job',{code_hash,id})}catch{}}
  return res.json(jobView(j));
 }
 return res.status(404).json({error:'المسار غير موجود'});
 }catch(e){return res.status(e.status||502).json({error:e.status?e.message:'تعذر إكمال الاتصال. راجع أعمالك قبل إعادة إرسال أي طلب توليد.'});}
}
