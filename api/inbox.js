export default async function handler(req,res){
res.setHeader('Cache-Control','no-store');
if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({ok:false,message:'طريقة غير مدعومة'});}
if(req.headers.origin && req.headers.origin!== 'https://'+req.headers.host && req.headers.origin!=='http://'+req.headers.host)return res.status(403).json({ok:false,message:'طلب غير مسموح'});
const key=typeof req.body?.key==='string'?req.body.key.trim():'';
if(!/^[A-Za-z0-9-]{8,100}$/.test(key))return res.status(400).json({ok:false,message:'أدخل مفتاح استلام صحيحًا'});
try{
const upstream=await fetch('https://popcornofficial.com/api/query',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({cdKey:key,recoveryAttemptId:crypto.randomUUID()}),signal:AbortSignal.timeout(25000)});
const data=await upstream.json();
if(!data.ok){const invalid=/invalid|disabled/i.test(data.message||'');return res.status(invalid?400:502).json({ok:false,message:invalid?'مفتاح الاستلام غير صالح أو معطّل لدى المصدر.':'تعذّر استرجاع الرسائل من المصدر. حاول لاحقًا.'});}
const messages=Array.isArray(data.messages)?data.messages.slice(0,50).map(m=>({id:String(m.id||''),from:String(m.from||''),subject:String(m.subject||''),receivedDateTime:m.receivedDateTime||null,code:String(m.code||''),bodyText:String(m.bodyText||m.bodyPreview||'').slice(0,20000)})):[];
return res.status(200).json({ok:true,messages});
}catch{return res.status(502).json({ok:false,message:'تعذّر الاتصال بمصدر الرسائل. أعد المحاولة بعد قليل.'});}
}