import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export default async function handler(req,res){
res.setHeader('Cache-Control','no-store');
if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({ok:false,message:'طريقة غير مدعومة'});}
if(req.headers.origin && req.headers.origin!=='https://'+req.headers.host && req.headers.origin!=='http://'+req.headers.host)return res.status(403).json({ok:false,message:'طلب غير مسموح'});
const key=typeof req.body?.key==='string'?req.body.key.trim():'';
if(!/^[A-Za-z0-9-]{8,100}$/.test(key))return res.status(400).json({ok:false,code:'INVALID_FORMAT',message:'صيغة المفتاح غير صحيحة. انسخ مفتاح الاستلام كاملًا من البائع.'});
let browser;let stage='launch';
try{
browser=await puppeteer.launch({args:chromium.args,executablePath:process.env.CHROME_EXECUTABLE_PATH || await chromium.executablePath(),headless:'shell'});
// A fresh browser per request keeps every mailbox session isolated.
const page=await browser.newPage();
page.setDefaultTimeout(20000);
stage='navigation';
const nav=await page.goto('https://popcornofficial.com/',{waitUntil:'domcontentloaded',timeout:25000});
const blocked=nav?.status()===403||/verify you are human|checking your browser|just a moment|access denied/i.test(await page.title());
if(blocked){console.error('Inbox browser blocked',nav?.status());return res.status(503).json({ok:false,message:'المصدر لا يسمح باتصال المتصفح الآلي حاليًا. يلزم السماح بالربط من مزود الخدمة.'});}
stage='form';
await page.waitForSelector('input[placeholder^="MG-"]');
await page.type('input[placeholder^="MG-"]',key);
await page.waitForFunction(()=>Array.from(document.querySelectorAll('button')).some(b=>b.textContent.trim()==='Open Inbox'&&!b.disabled),{timeout:20000});
await page.bringToFront();
console.info('Inbox page visibility',await page.evaluate(()=>document.visibilityState));
stage='query';
const [upstream]=await Promise.all([
  page.waitForResponse(r=>{
    const path=new URL(r.url()).pathname;
    if(!['/api/query','/api/inbox/query'].includes(path)||r.request().method()!=='POST')return false;
    try{return JSON.parse(r.request().postData()||'{}').metadataOnly!==true}catch{return false}
  },{timeout:70000}),
  page.click('form.mailbox-form button.primary-btn')
]);
// Promise.all observes both rejections, including when a failed click closes the page.
if(!upstream.headers()['content-type']?.includes('application/json'))return res.status(503).json({ok:false,message:'مصدر الرسائل رفض طلب الاستلام. يرجى المحاولة لاحقًا.'});
stage='response';
const data=await upstream.json();
if(!data||data.ok!==true){
  const reason=String(data?.message||data?.error||'');
  const invalid=/invalid|disabled|unavailable|inactive|expired|not found|not exist/i.test(reason);
  const limited=/rate.?limit|too many|429/i.test(reason);
  return res.status(invalid?400:limited?429:502).json({
    ok:false,code:invalid?'KEY_NOT_ACTIVE':limited?'SOURCE_RATE_LIMIT':'SOURCE_ERROR',
    message:invalid?'المفتاح غير نشط أو غير موجود لدى مصدر الرسائل. اطلب من البائع مفتاحًا صالحًا.':limited?'مصدر الرسائل طلب تقليل المحاولات. حاول بعد قليل.':'تعذّر استرجاع الرسائل من المصدر. حاول لاحقًا.'
  });
}
function extractCode(message){
  const explicit=String(message.code||message.verificationCode||message.otp||'').trim();
  if(explicit)return explicit.slice(0,32);
  const body=String(message.bodyText||message.bodyPreview||'');
  const match=body.match(/(?:verification\s*code|one[- ]time\s*(?:pass(?:word|code)?|code)|security\s*code|OTP|رمز\s*(?:التحقق|الدخول)|كود\s*(?:التحقق|الدخول))[^0-9]{0,65}([0-9]{4,8})/i);
  return match?.[1]||'';
}
const messages=Array.isArray(data.messages)?data.messages.slice(0,50).map(m=>({
  id:String(m.id||''),from:String(m.from||''),subject:String(m.subject||''),
  receivedDateTime:m.receivedDateTime||null,code:extractCode(m),
  bodyText:String(m.bodyText||m.bodyPreview||'').slice(0,20000)
})):[];
return res.status(200).json({ok:true,messages});
}catch(error){console.error('Inbox browser failure',stage,error.name);const timeout=error.name==='TimeoutError';return res.status(timeout?504:502).json({ok:false,message:timeout?'مصدر الرسائل تأخر في الرد. انتظر قليلًا ثم أعد المحاولة.':'تعذّر فتح صندوق الرسائل الآن. أعد المحاولة بعد قليل.'});}
finally{if(browser)await browser.close().catch(()=>{});}
}