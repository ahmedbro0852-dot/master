/* Public 72-hour poster campaigns. Only browser-local display timestamps/cursor are stored. */
(function(){
'use strict';
const FIRST_DELAY=12000,COOLDOWN=21600000,RETRY_DELAY=30000,SLIDE_DELAY=8000,REFRESH_DELAY=60000;
const KEY='masterStoreXtreamAdV1',START_KEY='masterStoreAdBrowseStartV1',CURSOR_KEY='masterStoreCampaignCursorV1';
const API='https://gmysuhoebcapigdidnnv.supabase.co/rest/v1/master_store_campaigns';
const SELECT='id,product_id,plan_index,poster_path,title_ar,title_en,alt_ar,alt_en,expected_price_piasters,poster_currency,credit_key,starts_at,ends_at,enabled,created_at';
const path=location.pathname,ownProduct=document.body.dataset.productId||new URLSearchParams(location.search).get('id')||(path.match(/^\/products\/([a-z0-9-]+)\.html$/)||[])[1];
const publicPage=['/','/index.html','/warranty.html','/product.html'].includes(path)||/^\/(?:products|categories)\/[a-z0-9-]+\.html$/.test(path);
if(!publicPage||typeof HTMLDialogElement==='undefined')return;
let timer,slideTimer,expiryTimer,refreshTimer,dialog,current,checking=false,changing=false,returnFocus,queue=[],retryAt=0,memoryShownAt=0,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,hovering=false,requestVersion=0,manualViewing=false,autoSuppressed=false,discovered=false,discoveryTimer,launcher,launcherStatus;
const images=new Map(),loadedAt=Date.now();
function storedTime(storage,key){try{const n=Number(storage.getItem(key));return Number.isFinite(n)&&n>0&&n<=Date.now()+60000?n:0;}catch{return 0;}}
function lastShown(){let at=memoryShownAt;try{at=Math.max(at,storedTime(localStorage,KEY));}catch{}try{at=Math.max(at,storedTime(sessionStorage,KEY));}catch{}return at;}
function markShown(){memoryShownAt=Date.now();try{localStorage.setItem(KEY,String(memoryShownAt));}catch{try{sessionStorage.setItem(KEY,String(memoryShownAt));}catch{}}}
let browseStart=loadedAt;try{browseStart=storedTime(sessionStorage,START_KEY)||loadedAt;sessionStorage.setItem(START_KEY,String(browseStart));}catch{}
const en=()=>window.MasterLocale?.getState().language==='en',text=(ar,english)=>en()?english:ar;
function busy(){return document.activeElement?.matches('input,textarea,select,[contenteditable="true"]')||[...document.querySelectorAll('dialog[open],[role="dialog"][aria-modal="true"]')].some(el=>el!==dialog&&el.getClientRects().length>0);}
function eligible(c){const start=Date.parse(c.starts_at),end=Date.parse(c.ends_at),now=Date.now();return c.enabled===true&&/^[a-z0-9][a-z0-9-]{0,119}$/.test(c.id)&&/^[a-z0-9-]+$/.test(c.product_id)&&Number.isInteger(c.plan_index)&&c.plan_index>=0&&c.product_id!==ownProduct&&/^images\/offers\/[a-z0-9-]+\.webp$/.test(c.poster_path)&&Number.isSafeInteger(Number(c.expected_price_piasters))&&Number(c.expected_price_piasters)>0&&['EGP','USD'].includes(c.poster_currency)&&typeof c.title_ar==='string'&&typeof c.title_en==='string'&&typeof c.alt_ar==='string'&&typeof c.alt_en==='string'&&end-start===259200000&&start<=now&&end>now;}
async function fetchCampaigns(){
 const url=new URL(API);url.searchParams.set('select',SELECT);url.searchParams.set('enabled','eq.true');url.searchParams.set('order','created_at.desc,id.asc');url.searchParams.set('limit','100');
 const r=await fetch(url,{headers:{apikey:'sb_publishable_zHcukZ2xWD8RqrYu3i-Wzw_Kd4c8x-h'},cache:'no-store',signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('campaigns_unavailable');const rows=await r.json();if(!Array.isArray(rows))throw Error('campaigns_invalid');
 // RLS also checks current stock and exact server price, so stale-price posters are not public.
 return rows.filter(eligible);
}
function activeQueue(){queue=queue.filter(eligible);return queue;}
function updateLauncher(){if(!launcher)return;const n=activeQueue().length;launcher.parentElement.hidden=discovered&&!n;launcher.textContent=text('العروض الجديدة','New arrivals')+(n?' · '+n:'');launcher.setAttribute('aria-label',text('عرض بوسترات المنتجات الجديدة','View new product posters'));}
async function discover(){clearTimeout(discoveryTimer);if(checking||dialog?.open)return;try{queue=await fetchCampaigns();discovered=true;updateLauncher();}catch{discoveryTimer=setTimeout(discover,RETRY_DELAY);}}
function buildLauncher(){
 const bar=document.createElement('div');bar.className='site-ad-launcher-bar';bar.hidden=false;bar.dataset.noTranslate='true';
 launcher=document.createElement('button');launcher.type='button';launcher.className='site-ad-launcher';launcher.setAttribute('aria-haspopup','dialog');launcher.setAttribute('aria-controls','masterSiteAd');launcher.onclick=()=>attempt(true);
 launcherStatus=document.createElement('span');launcherStatus.className='site-ad-launcher-status';launcherStatus.setAttribute('role','status');bar.append(launcher,launcherStatus);
 const header=document.querySelector('header.topbar');if(header)header.after(bar);else (document.querySelector('main')||document.body).prepend(bar);updateLauncher();discover();
}

function imageFor(c){if(images.has(c.poster_path))return images.get(c.poster_path);const work=new Promise((resolve,reject)=>{const img=new Image(1122,1402);img.className='site-ad-image';img.decoding='async';img.onload=()=>resolve(img);img.onerror=()=>{images.delete(c.poster_path);reject(Error('poster_unavailable'));};img.src='/'+c.poster_path;});images.set(c.poster_path,work);return work;}
function link(href,label){const a=document.createElement('a');a.href=href;a.textContent=label;a.target='_blank';a.rel='noopener noreferrer';return a;}
function build(){
 dialog=document.createElement('dialog');dialog.id='masterSiteAd';dialog.className='site-ad';dialog.setAttribute('aria-labelledby','masterSiteAdTitle');dialog.dataset.noTranslate='true';
 dialog.innerHTML='<div class="site-ad-card"><header class="site-ad-header"><h2 id="masterSiteAdTitle"></h2><button type="button" class="site-ad-close" autofocus>×</button></header><a class="site-ad-image-link"></a><div class="site-ad-footer"><div class="site-ad-navigation"><button type="button" data-ad-prev>‹</button><span class="site-ad-count" aria-live="polite"></span><button type="button" data-ad-next>›</button><button type="button" data-ad-pause></button></div><a class="site-ad-cta"></a><p class="site-ad-market-note"></p><details class="site-ad-credits"><summary>ⓘ</summary><p></p></details></div></div>';
 document.body.append(dialog);dialog.querySelector('.site-ad-close').onclick=()=>dialog.close();
 for(const a of dialog.querySelectorAll('.site-ad-image-link,.site-ad-cta'))a.addEventListener('click',()=>dialog.close());
 dialog.querySelector('[data-ad-prev]').onclick=()=>{paused=true;advance(-1);};dialog.querySelector('[data-ad-next]').onclick=()=>{paused=true;advance(1);};dialog.querySelector('[data-ad-pause]').onclick=()=>{paused=!paused;updateCopy();scheduleSlide();};
 dialog.querySelector('.site-ad-card').addEventListener('mouseenter',()=>{hovering=true;clearTimeout(slideTimer);});dialog.querySelector('.site-ad-card').addEventListener('mouseleave',()=>{hovering=false;scheduleSlide();});
 dialog.addEventListener('focusin',e=>{if(!e.target.matches('.site-ad-close,[data-ad-pause]')){paused=true;updateCopy();clearTimeout(slideTimer);}});
 dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();paused=true;advance(e.key==='ArrowRight'?1:-1);}});
 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
 dialog.addEventListener('close',()=>{requestVersion++;changing=false;clearTimeout(slideTimer);clearTimeout(expiryTimer);clearTimeout(refreshTimer);document.documentElement.classList.remove('site-ad-visible');if(!manualViewing)markShown();manualViewing=false;if(returnFocus?.isConnected&&returnFocus!==document.body)returnFocus.focus({preventScroll:true});schedule();});
}
function updateCopy(){
 updateLauncher();if(!dialog||!current)return;dialog.dir=en()?'ltr':'rtl';dialog.querySelector('h2').textContent=en()?current.title_en:current.title_ar;
 const destination='/products/'+current.product_id+'.html?plan='+current.plan_index;for(const a of dialog.querySelectorAll('.site-ad-image-link,.site-ad-cta'))a.href=destination;
 dialog.querySelector('.site-ad-image-link').setAttribute('aria-label',text('عرض تفاصيل الباقة','View plan details'));const img=dialog.querySelector('img');if(img)img.alt=en()?current.alt_en:current.alt_ar;
 dialog.querySelector('.site-ad-close').setAttribute('aria-label',text('إغلاق الإعلان','Close advertisement'));dialog.querySelector('.site-ad-cta').textContent=text('شوف تفاصيل الاشتراك ←','View subscription details →');
 const n=activeQueue(),i=n.findIndex(c=>c.id===current.id);dialog.querySelector('.site-ad-navigation').hidden=n.length<2;dialog.querySelector('.site-ad-count').textContent=text('إعلان '+(i+1)+' من '+n.length,'Ad '+(i+1)+' of '+n.length);
 dialog.querySelector('[data-ad-prev]').setAttribute('aria-label',text('الإعلان السابق','Previous advertisement'));dialog.querySelector('[data-ad-next]').setAttribute('aria-label',text('الإعلان التالي','Next advertisement'));
 const play=dialog.querySelector('[data-ad-pause]');play.textContent=paused?'▶':'Ⅱ';play.setAttribute('aria-label',paused?text('تشغيل التبديل التلقائي','Play automatic switching'):text('إيقاف التبديل التلقائي','Pause automatic switching'));play.setAttribute('aria-pressed',String(!paused));
 const note=dialog.querySelector('.site-ad-market-note');note.hidden=current.poster_currency==='EGP'&&(window.MasterLocale?.getState().market||'EG')==='EG';note.textContent=current.poster_currency==='USD'?text('سعر البوستر بالدولار؛ المقابل حسب عملة المتجر في صفحة الباقة.','Poster price is in US dollars; see the plan page for your store-currency equivalent.'):text('السعر في البوستر بالجنيه المصري؛ راجع سعر بلدك في صفحة الاشتراك.','Poster price is in Egyptian pounds; check your market price on the plan page.');
 const credits=dialog.querySelector('.site-ad-credits');credits.hidden=current.credit_key!=='salah-wikiportraits';credits.querySelector('summary').setAttribute('aria-label',text('معلومات التصميم','Design information'));credits.querySelector('summary').title=text('معلومات التصميم','Design information');credits.querySelector('p').replaceChildren(document.createTextNode(text('صورة صلاح: ','Salah photo: ')),link('https://commons.wikimedia.org/wiki/File:Mohamed_Salah_Argentina_v_Egypt_7_July_2026-161_(cropped).jpg','Bryan Berlin / WikiPortraits'),document.createTextNode(' · '),link('https://creativecommons.org/licenses/by-sa/4.0/','CC BY-SA 4.0'),document.createTextNode(text(' · دمج وتعديل.',' · Composited and modified.')));
}
function scheduleSlide(){clearTimeout(slideTimer);if(dialog?.open&&!paused&&!hovering&&!document.hidden&&activeQueue().length>1)slideTimer=setTimeout(()=>advance(1),SLIDE_DELAY);}
function scheduleExpiry(){clearTimeout(expiryTimer);if(!dialog?.open)return;const next=Math.min(...activeQueue().map(c=>Date.parse(c.ends_at)));if(Number.isFinite(next))expiryTimer=setTimeout(()=>{if(!activeQueue().length){dialog.close();return;}if(!queue.some(c=>c.id===current?.id))advance(0);else{updateCopy();scheduleExpiry();}},Math.max(1,next-Date.now()+10));else dialog.close();}
async function showCampaign(c){const version=++requestVersion,img=await imageFor(c);if(version!==requestVersion||!eligible(c))return false;if(!dialog)build();current=c;dialog.dataset.campaignId=c.id;dialog.querySelector('.site-ad-image-link').replaceChildren(img);dialog.querySelector('.site-ad-credits').open=false;updateCopy();try{localStorage.setItem(CURSOR_KEY,c.id);}catch{}return true;}
async function advance(step){if(changing||!dialog?.open)return;changing=true;clearTimeout(slideTimer);try{const n=activeQueue();if(!n.length){dialog.close();return;}let i=n.findIndex(c=>c.id===current?.id);if(i<0)i=0;else i=(i+step+n.length)%n.length;for(let k=0;k<n.length;k++){try{if(await showCampaign(n[(i+k)%n.length]))break;}catch{queue=queue.filter(c=>c.id!==n[(i+k)%n.length].id);}}if(!activeQueue().length)dialog.close();}finally{changing=false;scheduleSlide();scheduleExpiry();}}
async function refreshOpen(){if(!dialog?.open)return;try{queue=await fetchCampaigns();discovered=true;updateLauncher();if(!queue.length){dialog.close();return;}if(!queue.some(c=>c.id===current?.id))await advance(0);else{current=queue.find(c=>c.id===current.id);updateCopy();scheduleExpiry();}}catch{dialog.close();retryAt=Date.now()+RETRY_DELAY;}finally{if(dialog?.open)refreshTimer=setTimeout(refreshOpen,REFRESH_DELAY);}}
function schedule(){clearTimeout(timer);if(document.hidden||dialog?.open||checking||autoSuppressed)return;const shown=lastShown(),due=Math.max(browseStart+FIRST_DELAY,shown?shown+COOLDOWN:0,retryAt);timer=setTimeout(attempt,Math.max(0,due-Date.now()));}
async function attempt(manual=false){
 manual=manual===true;
 if(checking||dialog?.open||document.hidden)return;if(!manual&&Date.now()<Math.max(browseStart+FIRST_DELAY,lastShown()?lastShown()+COOLDOWN:0)){schedule();return;}if(busy()){retryAt=Date.now()+RETRY_DELAY;schedule();return;}
 checking=true;if(launcher){launcher.disabled=true;launcherStatus.textContent='';}try{queue=await fetchCampaigns();discovered=true;updateLauncher();if(!queue.length){if(manual)launcherStatus.textContent=text('لا توجد إعلانات متاحة حاليًا.','No campaigns are currently available.');retryAt=Date.now()+REFRESH_DELAY;return;}let previous;try{previous=localStorage.getItem(CURSOR_KEY);}catch{}const i=queue.findIndex(c=>c.id===previous);queue=queue.slice(i+1).concat(queue.slice(0,i+1));
 let ready=false;for(const c of [...queue]){try{if(await showCampaign(c)){ready=true;break;}}catch{queue=queue.filter(x=>x.id!==c.id);}}if(!ready){retryAt=Date.now()+RETRY_DELAY;return;}
 if(document.hidden||busy()||(!manual&&lastShown()&&Date.now()-lastShown()<COOLDOWN)||!eligible(current)){retryAt=Date.now()+RETRY_DELAY;return;}returnFocus=document.activeElement;manualViewing=manual;if(manual)autoSuppressed=true;dialog.showModal();document.documentElement.classList.add('site-ad-visible');if(!manual)markShown();scheduleSlide();scheduleExpiry();refreshTimer=setTimeout(refreshOpen,REFRESH_DELAY);
 }catch{if(manual&&launcherStatus)launcherStatus.textContent=text('تعذر تحميل الإعلانات. جرّب تاني.','Unable to load posters. Please try again.');retryAt=Date.now()+RETRY_DELAY;}finally{checking=false;if(launcher)launcher.disabled=false;schedule();}
}
window.addEventListener('storage',e=>{if(e.key===KEY)schedule();});document.addEventListener('visibilitychange',()=>{if(document.hidden)clearTimeout(slideTimer);else if(dialog?.open){if(!eligible(current))advance(0);scheduleSlide();}else schedule();});document.addEventListener('focusout',()=>{if(!dialog?.open)schedule();});document.addEventListener('masterstore:localechange',updateCopy);buildLauncher();schedule();
})();
