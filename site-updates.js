(function(){
'use strict';
const t=(ar,en)=>window.MasterLocale?.getState().language==='en'?en:ar;
const links=window.MasterSocialLinks;
function localize(){
 document.querySelectorAll('[data-follow-title]').forEach(x=>x.textContent=t('خليك متابع أحدث عروضنا','Keep up with our latest offers'));
 document.querySelectorAll('[data-follow-description]').forEach(x=>x.textContent=t('تابع عروض ماستر ستور على فيسبوك وقناة واتساب، واختار الباقة المناسبة ليك.','Follow Master Store on Facebook and our WhatsApp channel for offers and updates.'));
 document.querySelectorAll('.store-follow-facebook').forEach(a=>{if(links)a.href=links.facebook;});
 document.querySelectorAll('.store-follow-channel,.footer-whatsapp-channel').forEach(a=>{if(links?.whatsappChannel)a.href=links.whatsappChannel;});
 document.querySelectorAll('[data-follow-channel]').forEach(x=>x.textContent=t('قناة عروض واتساب','WhatsApp offers channel'));
 document.querySelectorAll('.footer-whatsapp-channel').forEach(x=>x.textContent=t('قناة عروض واتساب ↗','WhatsApp offers channel ↗'));
 document.querySelectorAll('[data-follow-facebook]').forEach(x=>{x.textContent=t('تابعنا على فيسبوك','Follow us on Facebook');});
 document.querySelectorAll('.footer-facebook').forEach(a=>{if(links)a.href=links.facebook;a.textContent=t('تابعنا على فيسبوك ↗','Follow us on Facebook ↗');});
}
const main=document.querySelector('main');
if(main){if(!main.id)main.id='main-content';const skip=document.createElement('a');skip.className='skip-content';skip.href='#'+main.id;skip.textContent=t('انتقل للمحتوى','Skip to content');skip.onclick=()=>{main.tabIndex=-1;main.focus({preventScroll:true});};document.body.prepend(skip);}
const top=document.createElement('button');top.type='button';top.className='back-to-top';top.hidden=true;top.textContent='↑';top.setAttribute('aria-label',t('العودة لأعلى الصفحة','Back to top'));top.onclick=()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});document.body.append(top);
let ticking=false;function scroll(){if(ticking)return;ticking=true;requestAnimationFrame(()=>{top.hidden=window.scrollY<800;ticking=false;});}window.addEventListener('scroll',scroll,{passive:true});scroll();
const header=document.querySelector('.topbar');if(header&&window.ResizeObserver)new ResizeObserver(()=>{document.documentElement.style.setProperty('--store-header-height',Math.ceil(header.getBoundingClientRect().height)+'px');}).observe(header);
document.addEventListener('masterstore:localechange',()=>{localize();top.setAttribute('aria-label',t('العودة لأعلى الصفحة','Back to top'));const skip=document.querySelector('.skip-content');if(skip)skip.textContent=t('انتقل للمحتوى','Skip to content');});localize();
})();
