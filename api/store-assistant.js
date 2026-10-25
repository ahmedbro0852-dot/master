const knowledge = require('../lib/store-assistant.cjs');
// Best-effort burst protection per instance, not a durable billing limit.
const bursts = new Map();
function allowed(ip) {
 const now=Date.now(); for (const [key,value] of bursts) if(value.until<now) bursts.delete(key);
 const value=bursts.get(ip)||{count:0,until:now+60000}; value.count++; bursts.set(ip,value);
 return value.count<=10 && bursts.size<=2000;
}
module.exports = async function handler(req,res) {
 res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Robots-Tag','noindex');
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'method_not_allowed'});}
 const origin=req.headers.origin;
 const host=req.headers.host;
 if(origin && (!host || origin!==`https://${host}` && origin!==`http://${host}`))return res.status(403).json({error:'origin_not_allowed'});
 if(!String(req.headers['content-type']||'').includes('application/json'))return res.status(415).json({error:'json_required'});
 if(Number(req.headers['content-length']||0)>16000)return res.status(413).json({error:'message_too_long'});
 const body=req.body;
 if(!body || !Array.isArray(body.messages) || !body.messages.length || body.messages.length>12)return res.status(400).json({error:'invalid_messages'});
 const messages=body.messages;
 if(messages.some(m=>!m || !['user','assistant'].includes(m.role) || typeof m.content!=='string' || !m.content.trim() || m.content.length>1200) || messages.at(-1).role!=='user' || JSON.stringify(messages).length>12000)return res.status(400).json({error:'invalid_messages'});
 const ip=String(req.headers['x-vercel-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0];
 if(!allowed(ip)){res.setHeader('Retry-After','60');return res.status(429).json({error:'too_many_messages'});}
 const english=body.language==='en';
 const snapshots=await Promise.allSettled([knowledge.liveRows(),knowledge.liveDiscounts()]);
 const rows=snapshots[0].status==='fulfilled'?snapshots[0].value:null;
 const discountRules=snapshots[1].status==='fulfilled'?snapshots[1].value:null;
 const selected=knowledge.selectProducts(messages,typeof body.productId==='string'?body.productId:'',rows);
 const system=knowledge.prompt(knowledge.contextFor(selected,rows,{language:body.language,question:messages.at(-1).content,discountRules}),english);
 const result=text=>res.status(200).json({text:text.slice(0,7000),mode:'ai',sources:selected.map(p=>({name:p.name,url:'/products/'+p.id+'.html'})),pricesVerified:!!rows});
 // User-selected DarkAPI, authenticated only from the server environment.
 const key=String(process.env.DARKAPI_API_KEY||'').trim();
 let unavailable=process.env.STORE_ASSISTANT_DISABLED==='1'?'disabled':'darkapi_missing';
 if(key && process.env.STORE_ASSISTANT_DISABLED!=='1'){
  unavailable='darkapi_unavailable';
  try{
   const base=String(process.env.DARKAPI_BASE_URL||'').trim()||'https://darkapi.shop/v1';
   const model=String(process.env.DARKAPI_MODEL||'').trim()||'gpt-6-luna';
   const url=new URL(base.replace(/\/$/,'')+'/chat/completions');
   if(url.protocol!=='https:'||url.username||url.password)throw Error('invalid_provider_url');
   const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+key},body:JSON.stringify({model,messages:[{role:'system',content:system},...messages],max_completion_tokens:1000}),signal:AbortSignal.timeout(20000)});
   if(response.ok){
    const data=await response.json(),text=data.choices?.[0]?.message?.content;
    if(typeof text==='string'&&text.trim())return result(text);
    unavailable='darkapi_empty_response';
   }else{
    const errorData=await response.json().catch(()=>({}));
    const invalidKey=errorData?.error?.code==='invalid_api_key'||errorData?.error?.type==='invalid_api_key';
    unavailable=invalidKey||response.status===401||response.status===403?'darkapi_authentication':response.status===402?'darkapi_credits':response.status===429?'darkapi_rate_limit':'darkapi_unavailable';
    console.warn('store_assistant_darkapi_status',response.status,invalidKey?'invalid_api_key':unavailable);
   }
  }catch(error){unavailable=error.name==='TimeoutError'?'darkapi_timeout':'darkapi_unavailable';console.warn('store_assistant_darkapi_unavailable',unavailable);}
 }
 return res.status(200).json({text:knowledge.fallback(selected,rows,english),mode:'catalog',aiUnavailable:unavailable,sources:selected.map(p=>({name:p.name,url:'/products/'+p.id+'.html'})),pricesVerified:!!rows});
};
