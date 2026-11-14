import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

// Only the authorized provider's inbox-query responses are inspected.
// Keys and message contents must never be written to logs or disk.
const SOURCE_URL = 'https://popcornofficial.com/';
const QUERY_PATHS = new Set(['/api/query','/api/inbox/query']);

function isQuery(url,method) {
  try {
    const parsed = new URL(url,SOURCE_URL);
    return parsed.origin === new URL(SOURCE_URL).origin && method === 'POST' && QUERY_PATHS.has(parsed.pathname);
  } catch { return false; }
}

function isMetadata(request) {
  try { return JSON.parse(request?.postData() || '{}').metadataOnly === true; }
  catch { return false; }
}

function getMessages(data) {
  if (!data || typeof data !== 'object') return null;
  const items = data.messages ?? data.data?.messages ?? data.emails ?? data.items;
  return Array.isArray(items) ? items : null;
}

function categorizeError(data,status) {
  const reason = String(data?.message || data?.error || data?.detail || '');
  if (/invalid|disabled|unavailable|inactive|expired|not found|not exist|wrong key/i.test(reason)) {
    return {status:400,code:'KEY_NOT_ACTIVE',message:'مفتاح الاستلام غير نشط أو غير موجود لدى المصدر. تأكد منه مع البائع.'};
  }
  if (status===429 || /rate.?limit|too many|429/i.test(reason)) {
    return {status:429,code:'SOURCE_RATE_LIMIT',message:'مصدر الرسائل طلب تقليل المحاولات. حاول مرة أخرى بعد دقائق.'};
  }
  if (status===401 || status===403) {
    return {status:503,code:'SOURCE_RESTRICTED',message:'مصدر الرسائل لا يسمح بالاتصال حاليًا. يلزم مراجعة الربط مع مزود الخدمة.'};
  }
  return {status:502,code:'SOURCE_ERROR',message:'مصدر الرسائل ردّ بخطأ. حاول من المصدر مباشرة أو تواصل مع البائع.'};
}

function extractCode(message) {
  const explicit = String(message.code ?? message.verificationCode ?? message.otp ?? '').trim();
  if (explicit) return explicit.slice(0,32);
  const body = String(message.bodyText || message.bodyPreview || message.subject || '');
  const match = body.match(/(?:verification\s*code|one[- ]time\s*(?:pass(?:word|code)?|code)|security\s*code|OTP|رمز\s*(?:التحقق|الدخول)|كود\s*(?:التحقق|الدخول))[^0-9]{0,65}([0-9]{4,8})/i);
  return match?.[1] || '';
}

function normalize(messages) {
  return messages.slice(0,50).map(m => {
    if (!m || typeof m !== 'object') return {id:'',from:'',subject:'',receivedDateTime:null,code:'',bodyText:''};
    return {
      id:String(m.id || ''),from:String(m.from || m.sender || ''),
      subject:String(m.subject || ''),receivedDateTime:m.receivedDateTime || m.date || null,
      code:extractCode(m),bodyText:String(m.bodyText || m.bodyPreview || m.text || '').slice(0,20000)
    };
  });
}

export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow','POST');
    return res.status(405).json({ok:false,message:'طريقة غير مدعومة'});
  }
  const host=req.headers.host;
  if (req.headers.origin && !['https://'+host,'http://'+host].includes(req.headers.origin)) {
    return res.status(403).json({ok:false,message:'طلب غير مسموح'});
  }
  const key=typeof req.body?.key === 'string' ? req.body.key.trim() : '';
  if (!/^[A-Za-z0-9-]{8,100}$/.test(key)) {
    return res.status(400).json({ok:false,code:'INVALID_FORMAT',message:'صيغة المفتاح غير صحيحة. انسخ المفتاح كاملًا من البائع.'});
  }

  let browser;
  let stage='launch';
  const observed=[];
  const responseStatuses=[];
  try {
    browser=await puppeteer.launch({
      args:chromium.args,
      executablePath:process.env.CHROME_EXECUTABLE_PATH || await chromium.executablePath(),
      headless:'shell'
    });
    const page=await browser.newPage();
    page.setDefaultTimeout(18000);

    // Capture the page's own authorized fetch response. Unlike CDP response.json(),
    // Response.clone() is resilient to response-body eviction/navigation errors.
    await page.evaluateOnNewDocument(() => {
      const captured=[];
      Object.defineProperty(window,'__inboxQueryCapture',{value:captured});
      const originalFetch=window.fetch;
      window.fetch=function(...args){
        let tracked=false,metadataOnly=false;
        try{
          const input=args[0];
          const href=typeof input==='string'?input:input?.url;
          const u=new URL(href,location.href);
          const method=String(args[1]?.method || input?.method || 'GET').toUpperCase();
          tracked=u.origin===location.origin && method==='POST' &&
            (u.pathname==='/api/query'||u.pathname==='/api/inbox/query');
          if(typeof args[1]?.body==='string') {
            try{metadataOnly=JSON.parse(args[1].body).metadataOnly===true;}catch{}
          }
        }catch{}
        return originalFetch.apply(this,args).then(response=>{
          if(tracked) {
            response.clone().text().then(text=>{
              let data=null;
              try{data=JSON.parse(text);}catch{}
              captured.push({status:response.status,metadataOnly,data});
            }).catch(()=>captured.push({status:response.status,metadataOnly,data:null}));
          }
          return response;
        });
      };
    });

    // Extra fallback for XHR-based requests. Errors are absorbed to avoid
    // unhandled Puppeteer promise rejections that previously restarted Railway.
    page.on('response', response => {
      if (!isQuery(response.url(),response.request().method())) return;
      responseStatuses.push(response.status());
      void response.text().then(text => {
        let data=null;
        try{data=JSON.parse(text);}catch{}
        observed.push({status:response.status(),metadataOnly:isMetadata(response.request()),data});
      }).catch(() => {});
    });

    stage='navigation';
    const nav=await page.goto(SOURCE_URL,{waitUntil:'domcontentloaded',timeout:25000});
    const title=await page.title();
    if (nav?.status()===403 || /verify you are human|checking your browser|just a moment|access denied/i.test(title)) {
      return res.status(503).json({ok:false,code:'SOURCE_RESTRICTED',message:'المصدر يمنع الاتصال الآلي حاليًا. يلزم الربط الرسمي مع مزود الخدمة.'});
    }

    stage='form';
    const input='input[placeholder^="MG-"]';
    await page.waitForSelector(input);
    await page.type(input,key);
    await page.waitForFunction(() => Array.from(document.querySelectorAll('button')).some(b=>b.textContent.trim()==='Open Inbox'&&!b.disabled),{timeout:18000});

    stage='query';
    const button='form.mailbox-form button.primary-btn';
    if (await page.$(button)) {
      await page.click(button);
    } else {
      await page.evaluate(() => {
        const b=Array.from(document.querySelectorAll('button')).find(x=>x.textContent.trim()==='Open Inbox'&&!x.disabled);
        if (!b) throw Error('INBOX_BUTTON_UNAVAILABLE');
        b.click();
      });
    }

    // The provider can send metadataOnly validation first, then the full messages.
    // Never display an empty inbox unless an actual full message response exists.
    const started=Date.now();
    while (Date.now()-started < 48000) {
      let browserResults=[];
      try{browserResults=await page.evaluate(()=>window.__inboxQueryCapture || []);}catch{}
      const candidates=[...browserResults,...observed];
      const valid=candidates.find(x => !x.metadataOnly && x.data?.ok !== false &&
        x.data?.success !== false && getMessages(x.data) !== null);
      if (valid) return res.status(200).json({ok:true,messages:normalize(getMessages(valid.data))});

      const failed=candidates.find(x=>x.data && (x.data.ok===false || x.data.success===false));
      if(failed){
        const info=categorizeError(failed.data,failed.status);
        return res.status(info.status).json({ok:false,code:info.code,message:info.message});
      }
      const restricted=candidates.find(x=>x.status===401 || x.status===403 || x.status===429);
      if(restricted){
        const info=categorizeError(restricted.data,restricted.status);
        return res.status(info.status).json({ok:false,code:info.code,message:info.message});
      }
      await new Promise(resolve=>setTimeout(resolve,600));
    }
    console.error('Inbox source did not return a full inbox response', {statusCodes:responseStatuses.slice(0,10),receivedCount:observed.length});
    return res.status(responseStatuses.length ? 502 : 504).json({
      ok:false,
      code:responseStatuses.length?'SOURCE_INCOMPLETE':'SOURCE_TIMEOUT',
      message:responseStatuses.length
        ? 'المصدر ردّ لكن لم يرسل بيانات الرسائل كاملة. جرّب الاستلام من المصدر مباشرة.'
        : 'مصدر الرسائل لم يرد على طلب الاستلام. قد يكون الربط الخارجي متوقفًا.'
    });
  } catch(error) {
    // Deliberately log only stage and error type, never key or email contents.
    console.error('Inbox lookup failed',{stage,type:error?.name||'Error'});
    const timeout=error?.name==='TimeoutError';
    return res.status(timeout?504:502).json({
      ok:false,code:timeout?'SOURCE_TIMEOUT':'SOURCE_FAILURE',
      message:timeout?'مصدر الرسائل تأخر في الرد. جرّب مرة أخرى بعد قليل.':'تعذّر استلام الرسائل من المصدر. حاول لاحقًا.'
    });
  } finally {
    if(browser)await browser.close().catch(()=>{});
  }
}
