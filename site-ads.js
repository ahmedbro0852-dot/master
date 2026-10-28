/* A public storefront campaign; only local impression timestamps are stored. */
(function(){
'use strict';
const FIRST_DELAY=12000,COOLDOWN=6*60*60*1000,RETRY_DELAY=30000;
const KEY='masterStoreXtreamAdV1',START_KEY='masterStoreAdBrowseStartV1';
const POSTER='/images/offers/xtream-iptv-all-leagues-year-350.webp';
const DESTINATION='/products/xtream-iptv.html?plan=0';
const path=location.pathname,ownProduct=path==='/products/xtream-iptv.html'||(path==='/product.html'&&new URLSearchParams(location.search).get('id')==='xtream-iptv');
const publicPage=path==='/'||path==='/index.html'||path==='/warranty.html'||path==='/product.html'||/^\/(?:products|categories)\/[a-z0-9-]+\.html$/.test(path);
if(!publicPage||ownProduct||typeof HTMLDialogElement==='undefined')return;
let timer,dialog,image,checking=false,retryAt=0,memoryShownAt=0,returnFocus;
const loadedAt=Date.now();
function storedTime(storage,key){try{const n=Number(storage.getItem(key));return Number.isFinite(n)&&n>0&&n<=Date.now()+60000?n:0;}catch{return 0;}}
function lastShown(){let at=memoryShownAt;try{at=Math.max(at,storedTime(localStorage,KEY));}catch{}try{at=Math.max(at,storedTime(sessionStorage,KEY));}catch{}return at;}
function markShown(){memoryShownAt=Date.now();try{localStorage.setItem(KEY,String(memoryShownAt));}catch{try{sessionStorage.setItem(KEY,String(memoryShownAt));}catch{}}}
let browseStart=loadedAt;
try{browseStart=storedTime(sessionStorage,START_KEY)||loadedAt;sessionStorage.setItem(START_KEY,String(browseStart));}catch{}
function en(){return window.MasterLocale?.getState().language==='en';}
function text(ar,english){return en()?english:ar;}
function busy(){
 if(document.activeElement?.matches('input,textarea,select,[contenteditable="true"]'))return true;
 return [...document.querySelectorAll('dialog[open],[role="dialog"][aria-modal="true"]')].some(el=>el!==dialog&&el.getClientRects().length>0);
}
function validRow(row){return row?.product_id==='xtream-iptv'&&Number(row.plan_index)===0&&row.available===true&&Number(row.price_piasters)===35000;}
async function campaignAvailable(){
 try{
  if(window.MasterCatalogReady)await window.MasterCatalogReady;
  const row=window.MasterCatalogPriceRows?.find(r=>r.product_id==='xtream-iptv'&&Number(r.plan_index)===0);
  if(row&&Date.now()-loadedAt<60000)return validRow(row);
  const url='https://gmysuhoebcapigdidnnv.supabase.co/rest/v1/master_store_plans?select=product_id,plan_index,price_piasters,available&product_id=eq.xtream-iptv&plan_index=eq.0&limit=1';
  const response=await fetch(url,{headers:{apikey:'sb_publishable_zHcukZ2xWD8RqrYu3i-Wzw_Kd4c8x-h'},cache:'no-store',signal:AbortSignal.timeout(5000)});
  if(!response.ok)return false;
  const rows=await response.json();return Array.isArray(rows)&&rows.length===1&&validRow(rows[0]);
 }catch{return false;}
}
function updateCopy(){
 if(!dialog)return;
 dialog.dir=en()?'ltr':'rtl';
 dialog.querySelector('h2').textContent=text('عرض الكورة من ماستر ستور','Football offer from MASTER STORE');
 dialog.querySelector('.site-ad-close').setAttribute('aria-label',text('إغلاق الإعلان','Close advertisement'));
 dialog.querySelector('.site-ad-image-link').setAttribute('aria-label',text('عرض تفاصيل اشتراك Xtream IPTV','View Xtream IPTV subscription details'));
 image.alt=text('إعلان Xtream IPTV بعنوان شاهد جميع الدوريات: اشتراك سنة بسعر 350 جنيه، على TV والموبايل والرسيفر، مع صلاح ومرموش.','Arabic Xtream IPTV advertisement titled Watch all leagues: one year for EGP 350, on TV, phone and receiver, featuring Salah and Marmoush.');
 dialog.querySelector('.site-ad-cta').textContent=text('شوف تفاصيل الاشتراك ←','View subscription details →');
 const note=dialog.querySelector('.site-ad-market-note');note.hidden=(window.MasterLocale?.getState().market||'EG')==='EG';
 note.textContent=text('السعر في البوستر بالجنيه المصري؛ راجع سعر بلدك في صفحة الاشتراك.','The poster price is in Egyptian pounds; check your market price on the subscription page.');
 const info=dialog.querySelector('.site-ad-credits summary');info.textContent='ⓘ';info.setAttribute('aria-label',text('معلومات التصميم','Design information'));info.title=text('معلومات التصميم','Design information');
 dialog.querySelector('.site-ad-credit-prefix').textContent=text('صورة صلاح: ','Salah photo: ');
 dialog.querySelector('.site-ad-credit-edit').textContent=text('دمج وتعديل.','Composited and modified.');
}
function link(href,label){const a=document.createElement('a');a.href=href;a.textContent=label;a.target='_blank';a.rel='noopener noreferrer';return a;}
function build(){
 dialog=document.createElement('dialog');dialog.id='masterSiteAd';dialog.className='site-ad';dialog.setAttribute('aria-labelledby','masterSiteAdTitle');dialog.dataset.noTranslate='true';
 const header=document.createElement('header');header.className='site-ad-header';
 const title=document.createElement('h2');title.id='masterSiteAdTitle';
 const close=document.createElement('button');close.type='button';close.className='site-ad-close';close.textContent='×';close.autofocus=true;close.onclick=()=>dialog.close();header.append(title,close);
 const visual=document.createElement('a');visual.href=DESTINATION;visual.className='site-ad-image-link';visual.append(image);
 const footer=document.createElement('div');footer.className='site-ad-footer';
 const cta=document.createElement('a');cta.href=DESTINATION;cta.className='site-ad-cta';
 const note=document.createElement('p');note.className='site-ad-market-note';
 const credits=document.createElement('details');credits.className='site-ad-credits';
 const summary=document.createElement('summary'),credit=document.createElement('p'),prefix=document.createElement('span'),edit=document.createElement('span');prefix.className='site-ad-credit-prefix';edit.className='site-ad-credit-edit';
 credit.append(prefix,link('https://commons.wikimedia.org/wiki/File:Mohamed_Salah_Argentina_v_Egypt_7_July_2026-161_(cropped).jpg','Bryan Berlin / WikiPortraits'),' · ',link('https://creativecommons.org/licenses/by-sa/4.0/','CC BY-SA 4.0'),' · ',edit);credits.append(summary,credit);
 footer.append(cta,note,credits);dialog.append(header,visual,footer);document.body.append(dialog);updateCopy();
 for(const a of [visual,cta])a.addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
 dialog.addEventListener('close',()=>{document.documentElement.classList.remove('site-ad-visible');markShown();if(returnFocus?.isConnected&&returnFocus!==document.body)returnFocus.focus({preventScroll:true});schedule();});
}
function loadImage(){
 if(image?.complete&&image.naturalWidth)return Promise.resolve();
 return new Promise((resolve,reject)=>{image=new Image(1122,1402);image.className='site-ad-image';image.decoding='async';image.onload=()=>resolve();image.onerror=()=>reject(Error('poster_unavailable'));image.src=POSTER;});
}
function schedule(){
 clearTimeout(timer);if(document.hidden||dialog?.open||checking)return;
 const shown=lastShown(),due=Math.max(browseStart+FIRST_DELAY,shown?shown+COOLDOWN:0,retryAt);
 timer=setTimeout(attempt,Math.max(0,due-Date.now()));
}
async function attempt(){
 if(checking||dialog?.open)return;
 if(document.hidden)return;
 if(Date.now()<Math.max(browseStart+FIRST_DELAY,lastShown()?lastShown()+COOLDOWN:0)){schedule();return;}
 if(busy()){retryAt=Date.now()+RETRY_DELAY;schedule();return;}
 checking=true;
 try{
  if(!await campaignAvailable()){retryAt=Date.now()+COOLDOWN;return;}
  await loadImage();
  if(document.hidden||busy()||(lastShown()&&Date.now()-lastShown()<COOLDOWN)){retryAt=Date.now()+RETRY_DELAY;return;}
  if(!dialog)build();else updateCopy();
  returnFocus=document.activeElement;dialog.showModal();document.documentElement.classList.add('site-ad-visible');markShown();
 }catch{retryAt=Date.now()+RETRY_DELAY;}
 finally{checking=false;schedule();}
}
window.addEventListener('storage',event=>{if(event.key===KEY)schedule();});
document.addEventListener('visibilitychange',schedule);
document.addEventListener('focusout',()=>{if(!dialog?.open)schedule();});
document.addEventListener('masterstore:localechange',()=>{updateCopy();if(dialog?.open)campaignAvailable().then(ok=>{if(!ok&&dialog?.open)dialog.close();});});
schedule();
})();
