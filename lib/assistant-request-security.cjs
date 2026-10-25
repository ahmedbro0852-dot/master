'use strict';
const {isIP}=require('node:net');
const MAX_BYTES=16000,WINDOW_MS=60000,MAX_CLIENTS=2000,MAX_PER_WINDOW=10,MAX_PER_IP=2,MAX_ACTIVE=32;
const clients=new Map();let active=0;
function header(req,name){return typeof req.headers?.[name]==='string'?req.headers[name]:'';}
function validate(req){
 if(req.method!=='POST')return{status:405,error:'method_not_allowed'};
 const origin=header(req,'origin'),host=header(req,'host'),fetchSite=header(req,'sec-fetch-site');
 if(!origin||!host||fetchSite==='cross-site')return{status:403,error:'origin_not_allowed'};
 try{const url=new URL(origin);if(url.origin!==origin||url.host!==host||url.username||url.password||!(url.protocol==='https:'||url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname)))return{status:403,error:'origin_not_allowed'};}catch{return{status:403,error:'origin_not_allowed'};}
 if(header(req,'content-type').split(';')[0].trim().toLowerCase()!=='application/json')return{status:415,error:'json_required'};
 const length=header(req,'content-length');if(length&&(!/^\d+$/.test(length)||!Number.isSafeInteger(Number(length))))return{status:400,error:'invalid_length'};
 if(Number(length)>MAX_BYTES)return{status:413,error:'message_too_long'};
 const body=req.body;if(!body||typeof body!=='object'||Array.isArray(body))return{status:400,error:'invalid_messages'};
 let encoded;try{encoded=JSON.stringify(body);}catch{return{status:400,error:'invalid_messages'};}
 if(Buffer.byteLength(encoded,'utf8')>MAX_BYTES)return{status:413,error:'message_too_long'};
 if(Object.keys(body).some(k=>!['messages','productId','planIndex','language'].includes(k)))return{status:400,error:'invalid_fields'};
 if(body.language!==undefined&&!['ar','en'].includes(body.language)||body.productId!==undefined&&(typeof body.productId!=='string'||body.productId.length>80||body.productId!==''&&!/^[a-z0-9-]+$/.test(body.productId))||body.planIndex!==undefined&&(!Number.isInteger(body.planIndex)||body.planIndex<0||body.planIndex>200))return{status:400,error:'invalid_fields'};
 const messages=body.messages;
 if(!Array.isArray(messages)||!messages.length||messages.length>12||messages.some(m=>!m||typeof m!=='object'||Array.isArray(m)||Object.keys(m).some(k=>!['role','content'].includes(k))||!['user','assistant'].includes(m.role)||typeof m.content!=='string'||!m.content.trim()||m.content.length>1200)||messages.at(-1).role!=='user'||JSON.stringify(messages).length>12000)return{status:400,error:'invalid_messages'};
 return null;
}
function clientKey(req){
 // Vercel overwrites these forwarding headers; local servers use the socket only.
 if(process.env.VERCEL==='1'){for(const name of ['x-vercel-forwarded-for','x-real-ip','x-forwarded-for']){const candidate=header(req,name).split(',')[0].trim();if(isIP(candidate))return candidate;}}
 return String(req.socket?.remoteAddress||'unknown').slice(0,100);
}
function acquire(req){const now=Date.now(),key=clientKey(req);for(const [id,state] of clients)if(state.until<=now&&state.active===0)clients.delete(id);
 let state=clients.get(key);if(!state){if(clients.size>=MAX_CLIENTS)return{retryAfter:60};state={count:0,active:0,until:now+WINDOW_MS};clients.set(key,state);}if(state.until<=now){state.count=0;state.until=now+WINDOW_MS;}
 if(state.count>=MAX_PER_WINDOW)return{retryAfter:Math.max(1,Math.ceil((state.until-now)/1000))};
 if(state.active>=MAX_PER_IP||active>=MAX_ACTIVE)return{retryAfter:2};state.count++;state.active++;active++;let released=false;
 return{release(){if(!released){released=true;state.active--;active--;}}};
}
module.exports={validate,acquire,clientKey,MAX_BYTES};
