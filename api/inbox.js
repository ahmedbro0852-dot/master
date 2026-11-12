import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export default async function handler(req,res){
res.setHeader('Cache-Control','no-store');
if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({ok:false,message:'طريقة غير مدعومة'});}
if(req.headers.origin && req.headers.origin!=='https://'+req.headers.host && req.headers.origin!=='http://'+req.headers.host)return res.status(403).json({ok:false,message:'طلب غير مسموح'});
const key=typeof req.body?.key==='string'?req.body.key.trim():'';
if(!/^[A-Za-z0-9-]{8,100}$/.test(key))return res.status(400).json({ok:false,message:'أدخل مفتاح استلام صحيحًا'});
let browser;
try{
browser=await puppeteer.launch({args:chromium.args,executablePath:process.env.CHROME_EXECUTABLE_PATH || await chromium.executablePath(),headless:'shell'});
// A fresh browser per request keeps every mailbox session isolated.
const page=await browser.newPage();
page.setDefaultTimeout(20000);
const nav=await page.goto('https://popcornofficial.com/',{waitUntil:'domcontentloaded',timeout:25000});
const blocked=nav?.status()===403||/verify you are human|checking your browser|just a moment|access denied/i.test(await page.title());
if(blocked){console.error('Inbox browser blocked',nav?.status());return res.status(503).json({ok:false,message:'المصدر لا يسمح باتصال المتصفح الآلي حاليًا. يلزم السماح بالربط من مزود الخدمة.'});}
await page.waitForSelector('input[placeholder^="MG-"]');
await page.type('input[placeholder^="MG-"]',key);
const result=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/query'&&r.request().method()==='POST',{timeout:25000});
await page.evaluate(()=>{const button=Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()==='Open Inbox');if(!button||button.disabled)throw Error('INBOX_BUTTON_UNAVAILABLE');button.click();});
const upstream=await result;
if(!upstream.headers()['content-type']?.includes('application/json'))return res.status(503).json({ok:false,message:'مصدر الرسائل رفض طلب الاستلام. يرجى المحاولة لاحقًا.'});
const data=await upstream.json();
if(!data.ok){const invalid=/invalid|disabled/i.test(data.message||'');return res.status(invalid?400:502).json({ok:false,message:invalid?'مفتاح الاستلام غير صالح أو معطّل لدى المصدر.':'تعذّر استرجاع الرسائل من المصدر. حاول لاحقًا.'});}
const messages=Array.isArray(data.messages)?data.messages.slice(0,50).map(m=>({id:String(m.id||''),from:String(m.from||''),subject:String(m.subject||''),receivedDateTime:m.receivedDateTime||null,code:String(m.code||''),bodyText:String(m.bodyText||m.bodyPreview||'').slice(0,20000)})):[];
return res.status(200).json({ok:true,messages});
}catch(error){console.error('Inbox browser failure',error.name);return res.status(502).json({ok:false,message:'تعذّر فتح صندوق الرسائل الآن. أعد المحاولة بعد قليل.'});}
finally{if(browser)await browser.close().catch(()=>{});}
}