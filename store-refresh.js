(()=>{
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const en=()=>document.documentElement.lang==='en';
  const top=document.createElement('button');
  top.type='button';top.className='store-top-button';top.textContent='↑';
  const label=()=>top.setAttribute('aria-label',en()?'Back to top':'العودة للأعلى');
  label();document.body.append(top);
  top.addEventListener('click',()=>window.scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'}));
  let scheduled=false;
  const update=()=>{top.classList.toggle('is-visible',window.scrollY>650);scheduled=false;};
  window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update);}},{passive:true});
  update();
  document.addEventListener('masterstore:localechange',label);
  const seen=new WeakSet();
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      const el=entry.target;observer.unobserve(el);
      if(reduced.matches||!el.animate)continue;
      el.animate([{opacity:.2,translate:'0 22px'},{opacity:1,translate:'0 0'}],{duration:650,easing:'cubic-bezier(.2,.8,.2,1)'});
    }
  },{threshold:.08});
  const discover=()=>{
    document.querySelectorAll('.best-offer,.product-card,.steps article,.terms-grid article,.wallet-intro,.product-hero,.summary-card').forEach(el=>{if(!seen.has(el)){seen.add(el);observer.observe(el);}});
  };
  discover();
  for(const id of ['grid','bestOffersGrid','productPage']){
    const target=document.getElementById(id);
    if(target)new MutationObserver(discover).observe(target,{childList:true});
  }
  document.querySelectorAll('img[src*="master-store-logo.png"]').forEach(img=>{img.src='master-store-logo.svg?v=20261018-complete1';img.width=208;img.height=56;});
  const shelf=document.querySelector('.subscription-shelf');
  if(shelf)new IntersectionObserver(entries=>{shelf.style.animationPlayState=entries[0].isIntersecting&&!document.hidden?'running':'paused';}).observe(shelf);
})();
