(function(){
'use strict';
if(document.querySelector('.store-assistant-launcher'))return;
const t=(ar,en)=>window.MasterLocale?.getState().language==='en'?en:ar;
const launcher=document.createElement('button');launcher.type='button';launcher.className='store-assistant-launcher';launcher.setAttribute('aria-haspopup','dialog');
launcher.innerHTML='<img class="assistant-logo" src="/logos/store-assistant.svg?v=20261025-assistant-logo1" alt="" width="32" height="32"><span></span>';
const dialog=document.createElement('dialog');dialog.className='store-assistant-dialog';dialog.setAttribute('aria-labelledby','store-assistant-title');
dialog.innerHTML='<header class="assistant-header"><img src="/logos/store-assistant.svg?v=20261025-assistant-logo1" alt="" width="46" height="46"><div><h2 id="store-assistant-title"></h2><p data-assistant-mode></p></div><button type="button" class="assistant-close">×</button></header><div class="assistant-conversation" role="log" aria-live="polite" aria-relevant="additions" tabindex="0"></div><div class="assistant-suggestions"></div><div class="assistant-status" role="status"></div><div class="assistant-request-actions"><button type="button" class="assistant-stop" hidden></button><button type="button" class="assistant-retry" hidden></button></div><form class="assistant-form"><label for="store-assistant-input" class="assistant-sr-only"></label><textarea id="store-assistant-input" rows="2" maxlength="1200" required></textarea><button type="submit" class="assistant-send"></button></form><footer class="assistant-footer"><p></p><div><button type="button" class="assistant-reset"></button><a href="https://wa.me/201500950624" target="_blank" rel="noopener"></a></div></footer>';
document.body.append(launcher,dialog);
const log=dialog.querySelector('.assistant-conversation'),input=dialog.querySelector('textarea'),send=dialog.querySelector('.assistant-send'),status=dialog.querySelector('.assistant-status'),suggestions=dialog.querySelector('.assistant-suggestions');
const stop=dialog.querySelector('.assistant-stop'),retry=dialog.querySelector('.assistant-retry');
let lastQuestion='',answerMode='ai';
let history=[],busy=false,controller=null,generation=0,returnFocus=launcher;
launcher.setAttribute('aria-expanded','false');
function safeUrl(value){
 try{const u=new URL(value,location.origin);if(u.origin===location.origin && (/^\/products\/[a-z0-9-]+\.html$/.test(u.pathname)||['/account.html','/track.html','/warranty.html','/','/index.html'].includes(u.pathname)))return u.pathname+u.search+u.hash;if(Object.values(window.MasterSocialLinks||{}).filter(Boolean).some(link=>new URL(link).href===u.href))return u.href;if(u.origin==='https://wa.me'&&u.pathname==='/201500950624')return u.href;}catch{}return null;
}
function appendText(node,text){
 text=text.replace(/\\\//g,'/');
 const pattern=/\[([^\]\n]+)\]\(\s*([^\s)]+)\s*\)|https:\/\/[^\s<>]+|\/products\/[a-z0-9-]+\.html(?:\?plan=\d+)?|\/(?:account|track|warranty)\.html/g;
 let previous=0;for(const m of text.matchAll(pattern)){node.append(document.createTextNode(text.slice(previous,m.index).replace(/\*\*/g,'')));const raw=m[2]||m[0],url=safeUrl(raw);if(url){const a=document.createElement('a');a.href=url;a.textContent=m[1]||(url.startsWith('https:')?t('التواصل مع الدعم','Contact support'):t('عرض التفاصيل','View details'));if(url.startsWith('https:')){a.target='_blank';a.rel='noopener';}node.append(a);}else node.append(document.createTextNode(m[1]||raw));previous=m.index+m[0].length;}node.append(document.createTextNode(text.slice(previous).replace(/\*\*/g,'')));
}
function message(role,text,sources){const box=document.createElement('div');box.className='assistant-message assistant-'+role;const label=document.createElement('small');label.textContent=role==='user'?t('أنت','You'):t('مساعد ماستر ستور','Master Store assistant');const p=document.createElement('p');if(role==='user')p.textContent=text;else appendText(p,text);box.append(label,p);if(sources?.length){const links=document.createElement('div');links.className='assistant-sources';for(const source of sources.slice(0,3)){const url=safeUrl(source.url);if(!url)continue;const a=document.createElement('a');a.href=url;a.textContent=window.MasterLocale?.text(source.name)||source.name;links.append(a);}box.append(links);}log.append(box);log.scrollTop=log.scrollHeight;}
function currentContext(){const productId=document.body.dataset.productId||new URLSearchParams(location.search).get('id')||'';const radio=document.querySelector('input[name=plan]:checked');return {productId,planIndex:radio?Number(radio.value):undefined};}
function planCards(plans,verified){
 if(!verified||!Array.isArray(plans))return;
 const reply=log.lastElementChild,wrap=document.createElement('div');wrap.className='assistant-plan-cards';
 const tr=(value,kind,id)=>window.MasterLocale?.catalogText(value,kind,id)||String(value||'');
 for(const plan of plans.slice(0,3)){
  const url=safeUrl(plan.url);if(!url||!/^\/products\/[a-z0-9-]+\.html\?plan=\d+$/.test(url)||!Number.isFinite(plan.priceEGP)||plan.priceEGP<=0)continue;
  const card=document.createElement('a');card.className='assistant-plan-card';card.href=url;
  const title=document.createElement('strong');title.textContent=window.MasterLocale?.text(plan.product)||plan.product;
  const name=document.createElement('span');name.textContent=tr(plan.name,'planName',plan.productId);
  const amount=document.createElement('b');amount.textContent=new Intl.NumberFormat(document.documentElement.lang==='en'?'en-GB':'ar-EG',{style:'currency',currency:'EGP',maximumFractionDigits:2}).format(plan.priceEGP);
  const terms=document.createElement('small');terms.textContent=tr(plan.duration,'duration',plan.productId)+' · '+t('الضمان: ','Warranty: ')+tr(plan.warranty,'warranty',plan.productId);
  const credits=document.createElement('small');credits.textContent=plan.credits?t('الرصيد: ','Credits: ')+tr(plan.credits,'credits',plan.productId):'';
  const action=document.createElement('span');action.className='assistant-plan-action';action.textContent=t('راجع الباقة ←','Review plan →');
  card.append(title,name,amount,terms);if(plan.credits)card.append(credits);card.append(action);wrap.append(card);
 }
 if(wrap.children.length){reply.append(wrap);const note=document.createElement('small');note.className='assistant-verified';note.textContent=t('أسعار البطاقات من الكتالوج الحالي · الإجمالي النهائي في السلة.','Card prices are from the current catalogue · final total is shown in the cart.');reply.append(note);log.scrollTop=log.scrollHeight;}
}
function quickQuestions(){
 suggestions.replaceChildren();const context=currentContext(),product=window.MasterCatalog?.getProduct(context.productId),name=window.MasterLocale?.text(product?.name)||product?.name;
 const questions=history.length?[t('قارن الضمان وطريقة التفعيل','Compare warranty and activation'),t('أنهي باقة أنسب لاستخدامي؟','Which plan best fits my needs?')]:product?[t('قارن باقات ','Compare plans for ')+name,t('ضمان الباقة المختارة إيه؟','What is the selected plan’s warranty?'),t('تفعيل الباقة دي إزاي؟','How is this plan activated?')]:[t('أختار اشتراك إزاي؟','Help me choose a plan'),t('إليفن لابس بكام؟','How much is ElevenLabs?'),t('الضمان بيشمل إيه؟','What does the warranty cover?')];
 for(const q of questions){const b=document.createElement('button');b.type='button';b.textContent=q;b.disabled=busy;b.onclick=()=>submit(q);suggestions.append(b);}
}
function welcome(){message('assistant',t('أهلًا بيك في ماستر ستور 👋\nقولّي محتاج اشتراك لإيه أو اسألني عن السعر، التفعيل والضمان.','Welcome to Master Store 👋\nTell me what you need, or ask about prices, activation and warranty.'));}
function labels(){const english=window.MasterLocale?.getState().language==='en';dialog.dir=english?'ltr':'rtl';launcher.querySelector('span').textContent=t('اسأل المساعد','Ask the assistant');launcher.setAttribute('aria-label',t('افتح مساعد ماستر ستور','Open Master Store assistant'));dialog.querySelector('h2').textContent=t('مساعد ماستر ستور','Master Store assistant');dialog.querySelector('[data-assistant-mode]').textContent=answerMode==='catalog'?t('تفاصيل من كتالوج المتجر','Store catalogue details'):t('مساعد بالذكاء الاصطناعي','AI shopping assistant');dialog.querySelector('.assistant-close').setAttribute('aria-label',t('إغلاق المساعد','Close assistant'));dialog.querySelector('label').textContent=t('اكتب سؤالك','Your question');input.placeholder=t('اسأل عن اشتراك أو قارن الباقات…','Ask about a subscription or compare plans…');send.textContent=t('إرسال','Send');dialog.querySelector('.assistant-reset').textContent=t('محادثة جديدة','New chat');dialog.querySelector('footer a').textContent=t('تواصل مع الدعم ↗','Contact support ↗');dialog.querySelector('footer p').textContent=t('ردود آلية قد تخطئ · لا ترسل كلمات مرور أو أكواد دخول.','AI can make mistakes · Never share passwords or login codes.');stop.textContent=t('إيقاف الرد','Stop response');retry.textContent=t('إعادة المحاولة','Try again');quickQuestions();}
async function submit(text,reuse=false){
 text=text.trim();if(!text||busy||text.length>1200)return;
 lastQuestion=text;const current=++generation;busy=true;stop.hidden=false;retry.hidden=true;send.disabled=true;input.value='';suggestions.hidden=true;if(!reuse)message('user',text);status.textContent=t('براجع التفاصيل عشان أرد عليك…','Checking the details…');
 const messages=[...history,{role:'user',content:text}].slice(-11);const requestController=new AbortController();controller=requestController;const timer=setTimeout(()=>requestController.abort(),28000);
 try{const {productId,planIndex}=currentContext();const response=await fetch('/api/store-assistant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages,productId,planIndex,language:window.MasterLocale?.getState().language||'ar'}),signal:controller.signal});const data=await response.json();if(!response.ok)throw Error(response.status===429?'rate':'network');if(typeof data.text!=='string')throw Error('invalid');if(current!==generation)return;message('assistant',data.text,data.recommendations?.length?[]:data.sources);planCards(data.recommendations,data.pricesVerified);answerMode=data.mode;history=[...messages,{role:'assistant',content:data.text.slice(0,1200)}].slice(-10);dialog.querySelector('[data-assistant-mode]').textContent=data.mode==='ai'?t('مساعد بالذكاء الاصطناعي','AI shopping assistant'):t('تفاصيل من كتالوج المتجر','Store catalogue details');status.textContent='';suggestions.hidden=false;}
 catch(error){if(current!==generation)return;status.textContent=error.message==='rate'?t('استنى دقيقة وجرب تاني، أو كلم الدعم.','Wait a minute and try again, or contact support.'):t('مش قادر أجيب الرد دلوقتي. جرّب تاني أو تواصل مع الدعم.','Could not get a reply. Try again or contact support.');input.value=text;retry.hidden=false;}
 finally{clearTimeout(timer);if(current===generation){busy=false;send.disabled=false;stop.hidden=true;controller=null;quickQuestions();if(dialog.open)input.focus();}}
}
function openAssistant(question,trigger){returnFocus=trigger instanceof HTMLElement?trigger:launcher;if(!dialog.open)dialog.showModal();launcher.setAttribute('aria-expanded','true');if(!log.children.length)welcome();if(typeof question==='string')input.value=question.slice(0,1200);input.focus();}
stop.onclick=()=>{if(!busy)return;generation++;controller?.abort();controller=null;busy=false;send.disabled=false;stop.hidden=true;retry.hidden=false;status.textContent=t('تم إيقاف الرد. تقدر تعدّل السؤال أو تعيد المحاولة.','Response stopped. Edit your question or try again.');input.value=lastQuestion;input.focus();};
retry.onclick=()=>{const text=input.value.trim()||lastQuestion;submit(text,text===lastQuestion);};
launcher.onclick=()=>openAssistant(undefined,launcher);
document.addEventListener('masterstore:ask-plan',e=>openAssistant(e.detail?.question,e.detail?.trigger));
dialog.querySelector('.assistant-close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{launcher.setAttribute('aria-expanded','false');(returnFocus?.isConnected?returnFocus:launcher).focus();});dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog.querySelector('form').onsubmit=e=>{e.preventDefault();submit(input.value);};input.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();submit(input.value);}};
dialog.querySelector('.assistant-reset').onclick=()=>{generation++;controller?.abort();controller=null;busy=false;send.disabled=false;stop.hidden=true;retry.hidden=true;lastQuestion='';answerMode='ai';history=[];log.replaceChildren();status.textContent='';suggestions.hidden=false;input.value='';labels();welcome();input.focus();};
document.addEventListener('masterstore:localechange',labels);labels();
})();
