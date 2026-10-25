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
 const token=process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN;
 if(token && process.env.STORE_ASSISTANT_DISABLED!=='1'){
  try{
   const response=await fetch('https://ai-gateway.vercel.sh/v1/chat/completions',{
    method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},signal:AbortSignal.timeout(22000),
    body:JSON.stringify({model:process.env.STORE_ASSISTANT_MODEL||'google/gemini-3.5-flash-lite',messages:[{role:'system',content:knowledge.prompt(knowledge.contextFor(selected,rows),english)},...messages],max_tokens:1000,temperature:0.2})
   });
   if(!response.ok){console.warn('store_assistant_gateway_status',response.status);throw Error('gateway_unavailable');}
   const data=await response.json(),text=data.choices?.[0]?.message?.content;
   if(typeof text!=='string'||!text.trim())throw Error('empty_answer');
   return res.status(200).json({text:text.slice(0,7000),mode:'ai',sources:selected.map(p=>({name:p.name,url:'/products/'+p.id+'.html'})),pricesVerified:!!rows});
  }catch(error){console.warn('store_assistant_unavailable',error.name==='TimeoutError'?'timeout':'upstream');}
 }
 return res.status(200).json({text:knowledge.fallback(selected,rows,english),mode:'catalog',sources:selected.map(p=>({name:p.name,url:'/products/'+p.id+'.html'})),pricesVerified:!!rows});
};
