const knowledge = require('../lib/store-assistant.cjs');
const security=require('../lib/assistant-request-security.cjs');
module.exports = async function handler(req,res) {
 res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Robots-Tag','noindex');
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cross-Origin-Resource-Policy','same-origin');
 const invalid=security.validate(req);if(invalid){if(invalid.status===405)res.setHeader('Allow','POST');return res.status(invalid.status).json({error:invalid.error});}
 const lease=security.acquire(req);if(!lease.release){res.setHeader('Retry-After',String(lease.retryAfter));return res.status(429).json({error:'too_many_messages'});}
 const body=req.body,messages=body.messages;
 try{
 const english=body.language==='en';
 const snapshots=await Promise.allSettled([knowledge.liveRows(),knowledge.liveDiscounts()]);
 const rows=snapshots[0].status==='fulfilled'?snapshots[0].value:null;
 const discountRules=snapshots[1].status==='fulfilled'?snapshots[1].value:null;
 const selected=knowledge.selectProducts(messages,typeof body.productId==='string'?body.productId:'',rows);
 const shopping=knowledge.shoppingContext(selected,rows,{messages,productId:body.productId,planIndex:body.planIndex});
 const extras={recommendations:shopping.recommendations,budgetEGP:shopping.budgetEGP,checkedAt:rows?new Date().toISOString():null};
 const system=knowledge.prompt(knowledge.contextFor(selected,rows,{language:body.language,question:messages.at(-1).content,messages,productId:body.productId,planIndex:body.planIndex,discountRules}),english);
 const result=text=>res.status(200).json({text:text.slice(0,7000),mode:'ai',...extras,sources:selected.map(p=>({name:p.name,url:'/products/'+p.id+'.html'})),pricesVerified:!!rows});
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
 return res.status(200).json({text:knowledge.fallback(selected,rows,english,{messages,productId:body.productId,planIndex:body.planIndex}),mode:'catalog',...extras,aiUnavailable:unavailable,sources:selected.map(p=>({name:p.name,url:'/products/'+p.id+'.html'})),pricesVerified:!!rows});
 }catch{console.warn('store_assistant_unavailable','internal_error');return res.status(503).json({error:'temporarily_unavailable'});}finally{lease.release();}
};
