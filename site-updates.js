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

const headerNav=document.querySelector('.topbar #mainNav');
if(headerNav){
 let categoryLink=headerNav.querySelector('[data-site-category-link]');
 if(!categoryLink){
  categoryLink=document.createElement('a');
  categoryLink.href='/categories.html';
  categoryLink.dataset.siteCategoryLink='';
  headerNav.insertBefore(categoryLink,headerNav.children[1]||null);
 }
 const translateCategoryLink=()=>{categoryLink.textContent=t('الأقسام','Categories');};
 document.addEventListener('masterstore:localechange',translateCategoryLink);
 translateCategoryLink();
}

const main=document.querySelector('main');
if(main){if(!main.id)main.id='main-content';const skip=document.createElement('a');skip.className='skip-content';skip.href='#'+main.id;skip.textContent=t('انتقل للمحتوى','Skip to content');skip.onclick=()=>{main.tabIndex=-1;main.focus({preventScroll:true});};document.body.prepend(skip);}
const top=document.createElement('button');top.type='button';top.className='back-to-top';top.hidden=true;top.textContent='↑';top.setAttribute('aria-label',t('العودة لأعلى الصفحة','Back to top'));top.onclick=()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});document.body.append(top);
let ticking=false;function scroll(){if(ticking)return;ticking=true;requestAnimationFrame(()=>{top.hidden=window.scrollY<800;ticking=false;});}window.addEventListener('scroll',scroll,{passive:true});scroll();
const header=document.querySelector('.topbar');if(header&&window.ResizeObserver)new ResizeObserver(()=>{document.documentElement.style.setProperty('--store-header-height',Math.ceil(header.getBoundingClientRect().height)+'px');}).observe(header);
document.addEventListener('masterstore:localechange',()=>{localize();top.setAttribute('aria-label',t('العودة لأعلى الصفحة','Back to top'));const skip=document.querySelector('.skip-content');if(skip)skip.textContent=t('انتقل للمحتوى','Skip to content');});localize();
})();
/* Mobile UX · 2026-11-07: quick one-handed store navigation. */
(function(){
  'use strict';
  if(!document.querySelector('.topbar')||!document.querySelector('main')||document.querySelector('main.product-page'))return;
  if(document.querySelector('.mobile-shortcuts'))return;
  const isHome=location.pathname==='/'||/\/index\.html$/i.test(location.pathname);
  const icons={
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-7h6v7"/>',
    categories:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    cart:'<path d="M3 4h2l2.5 11h11l2-8H6"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>',
    account:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>'
  };
  const entries=[
    {key:'home',href:'/',ar:'الرئيسية',en:'Home'},
    {key:'categories',href:'/categories.html',ar:'الأقسام',en:'Categories'},
    {key:'search',href:isHome?'#store-search-mobile':'/#store-search-mobile',ar:'بحث',en:'Search'},
    {key:'cart',href:'/cart.html',ar:'السلة',en:'Cart'},
    {key:'account',href:'/account.html',ar:'حسابي',en:'Account'}
  ];
  const nav=document.createElement('nav');
  nav.className='mobile-shortcuts';
  const linkMap=new Map();
  entries.forEach(entry=>{
    const link=document.createElement('a');
    link.href=entry.href;
    link.dataset.mobileDestination=entry.key;
    const symbol=document.createElement('span');
    symbol.className='mobile-nav-icon';
    symbol.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+icons[entry.key]+'</svg>';
    if(entry.key==='cart'){
      const badge=document.createElement('span');
      badge.className='mobile-nav-badge';
      badge.dataset.navBadge='';
      badge.hidden=true;
      symbol.append(badge);
    }
    const label=document.createElement('span');
    label.className='mobile-nav-label';
    link.append(symbol,label);
    nav.append(link);
    linkMap.set(entry.key,link);
  });
  document.body.append(nav);

  const english=()=>window.MasterLocale?.getState?.()?.language==='en'||document.documentElement.lang==='en';
  function localize(){
    const en=english();
    nav.setAttribute('aria-label',en?'Mobile navigation':'التنقل السريع على الهاتف');
    entries.forEach(entry=>{
      const link=linkMap.get(entry.key);
      link.querySelector('.mobile-nav-label').textContent=en?entry.en:entry.ar;
      link.setAttribute('aria-label',en?entry.en:entry.ar);
    });
  }
  function markActive(prefer){
    const page=location.pathname.split('/').pop();
    let active=page==='cart.html'?'cart':page==='account.html'?'account':page==='categories.html'?'categories':isHome?'home':'';
    if(isHome&&new URLSearchParams(location.search).has('category'))active='categories';
    if(isHome&&location.hash==='#store-search-mobile')active='search';
    if(prefer)active=prefer;
    linkMap.forEach((link,key)=>{
      if(key===active)link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    });
  }
  const reduceMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function focusSearch(){
    const section=document.getElementById('products');
    const field=document.getElementById('search')||document.getElementById('heroCatalogSearch');
    if(!section||!field)return;
    section.scrollIntoView({block:'start',behavior:reduceMotion()?'auto':'smooth'});
    markActive('search');
    window.setTimeout(()=>field.focus({preventScroll:true}),reduceMotion()?0:260);
  }
  nav.addEventListener('click',event=>{
    const link=event.target.closest('a[data-mobile-destination]');
    if(!link||!isHome)return;
    if(link.dataset.mobileDestination==='search'){
      event.preventDefault();
      history.replaceState(null,'','#store-search-mobile');
      focusSearch();
    }else if(link.dataset.mobileDestination==='home'){
      event.preventDefault();
      history.replaceState(null,'',location.pathname+location.search);
      window.scrollTo({top:0,behavior:reduceMotion()?'auto':'smooth'});
      markActive('home');
    }
  });
  window.addEventListener('hashchange',()=>markActive());
  const inputTarget=element=>element?.matches?.('input:not([type="checkbox"]):not([type="radio"]),textarea,select,[contenteditable="true"]');
  document.addEventListener('focusin',event=>{if(inputTarget(event.target))nav.classList.add('input-active');});
  document.addEventListener('focusout',()=>{
    window.setTimeout(()=>{if(!inputTarget(document.activeElement))nav.classList.remove('input-active');},80);
  });
  const cartCount=document.querySelector('.topbar [data-cart-count]');
  const badge=nav.querySelector('[data-nav-badge]');
  function updateBadge(){
    const count=parseInt(cartCount?.textContent||'0',10)||0;
    badge.hidden=count<1;
    badge.textContent=count>99?'99+':String(count);
  }
  if(cartCount&&window.MutationObserver)new MutationObserver(updateBadge).observe(cartCount,{subtree:true,childList:true,characterData:true});
  document.addEventListener('masterstore:cartchange',updateBadge);
  document.addEventListener('masterstore:localechange',localize);
  localize();
  markActive();
  updateBadge();
  if(isHome&&location.hash==='#store-search-mobile')window.setTimeout(focusSearch,150);
})();
