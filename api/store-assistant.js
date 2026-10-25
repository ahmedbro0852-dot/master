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
 const selected=knowledge.selectProducts(messages,typeof body.productId==='string'?body.productId:'');
 let rows=null;
 try{rows=await knowledge.liveRows();}catch{/* Fail closed for prices; the assistant must not invent a stale price. */}
 const system=knowledge.prompt(knowledge.contextFor(selected,rows),english);
 const result=text=>res.status(200).json({text:text.slice(0,7000),mode:'ai',sources:selected.map(p=>({name:p.name,url:'/products/'+p.id+'.html'})),pricesVerified:!!rows});
 // Use the user's existing provider; defaults match the original integration.
 // AEROLINK_API_KEY1 is the newer production credential, with the original
 // credential retained as an authentication-only fallback.
 const keys=[...new Set([process.env.AEROLINK_API_KEY1,process.env.AEROLINK_API_KEY].map(x=>String(x||'').trim()).filter(Boolean))];
 let unavailable=process.env.STORE_ASSISTANT_DISABLED==='1'?'disabled':'existing_api_missing';
 if(keys.length && process.env.STORE_ASSISTANT_DISABLED!=='1'){
  unavailable='existing_api_unavailable';
  try{
   const base=String(process.env.AEROLINK_BASE_URL||'').trim()||'https://aerolink.lat';
   const endpoint=String(process.env.AEROLINK_RESPONSES_PATH||'').trim()||'/responses';
   const model=String(process.env.AEROLINK_MODEL||'').trim()||'gpt-5.6-sol';
   const url=new URL(base.replace(/\/$/,'')+'/'+endpoint.replace(/^\//,''));
   if(url.protocol!=='https:'||url.username||url.password)throw Error('invalid_provider_url');
   const urls=[url,new URL('/v1/responses',url),new URL('/responses',url)].filter((u,i,list)=>list.findIndex(v=>v.href===u.href)===i);
   const signal=AbortSignal.timeout(20000);
   providerRequests:for(let index=0;index<keys.length;index++){
    const key=keys[index];
    for(let route=0;route<urls.length;route++){
     const response=await fetch(urls[route],{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+key,'X-API-Key':key},body:JSON.stringify({model,instructions:system,input:messages,max_output_tokens:850}),signal});
     if(!response.ok){
      unavailable=response.status===401||response.status===403?'existing_api_authentication':response.status===402?'existing_api_credits':response.status===429?'existing_api_rate_limit':response.status===404?'existing_api_endpoint_not_found':'existing_api_unavailable';
      const errorData=await response.json().catch(()=>({}));
      const modelError=/model.{0,60}(not.found|not.available|unsupported)|model_not_found|unsupported.model/i.test(JSON.stringify(errorData));
      if(modelError)unavailable='existing_api_model_unavailable';
      console.warn('store_assistant_existing_provider_status',response.status,{host:urls[route].host,path:urls[route].pathname,credential:index+1,modelError,json:!!response.headers?.get?.('content-type')?.includes('json')});
      if((response.status===404||response.status===405)&&route+1<urls.length)continue;
      if([401,403,404,405].includes(response.status)&&index+1<keys.length)continue providerRequests;
      break providerRequests;
     }
     const data=await response.json(),text=data.output_text||data.output?.flatMap(x=>(x.content||[]).map(c=>c.text||c.output_text||'')).join('\n')||data.choices?.[0]?.message?.content;
     if(typeof text==='string'&&text.trim())return result(text);
     unavailable='existing_api_empty_response';break providerRequests;
    }
   }
  }catch(error){unavailable=error.name==='TimeoutError'?'existing_api_timeout':'existing_api_unavailable';console.warn('store_assistant_existing_provider_unavailable',unavailable);}
 }
 return res.status(200).json({text:knowledge.fallback(selected,rows,english),mode:'catalog',aiUnavailable:unavailable,sources:selected.map(p=>({name:p.name,url:'/products/'+p.id+'.html'})),pricesVerified:!!rows});
};
