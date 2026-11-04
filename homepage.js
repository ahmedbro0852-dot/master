(()=>{
  'use strict';
  const isEnglish=()=>document.documentElement.lang==='en';
  function translate(){
    document.querySelectorAll('[data-home-ar]').forEach(el=>{
      const value=isEnglish()?el.dataset.homeEn:el.dataset.homeAr;
      // Only fixed, locally authored heading markup uses HTML.
      if(el.id==='home-title')el.innerHTML=value;else el.textContent=value;
    });
    updateCounts();
  }
  function matches(product,category){
    const tags=product.categories||[product.category];
    return category==='الذكاء الاصطناعي'?tags.some(tag=>/الذكاء الاصطناعي|مساعد ذكي|مساعد كتابة الكود|تعليق صوتي|أفاتار|توليد موسيقى/.test(tag)):tags.includes(category)||(window.MasterCatalog?.categoryGroups?.[category]||[]).some(tag=>tags.includes(tag));
  }
  function updateCounts(){
    const products=(window.MasterCatalog?.products||[]).filter(p=>!p.redirectTo);
    document.querySelectorAll('[data-count-category]').forEach(el=>{
      const count=products.filter(p=>matches(p,el.dataset.countCategory)).length;
      el.textContent=count+(isEnglish()?' subscriptions':' اشتراكات');
    });
  }
  document.querySelectorAll('[data-home-category]').forEach(link=>link.addEventListener('click',event=>{
    if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0||document.documentElement.dataset.homeCatalogReady!=='true')return;
    event.preventDefault();
    document.dispatchEvent(new CustomEvent('masterstore:homecategory',{detail:link.dataset.homeCategory}));
    document.querySelectorAll('[data-home-category]').forEach(el=>el.setAttribute('aria-current',String(el===link)));
    const grid=document.getElementById('products');
    grid.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
    const heading=grid.querySelector('h2');heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});
  }));
  document.addEventListener('masterstore:localechange',translate);
  Promise.resolve(window.MasterCatalogReady).then(translate);
  translate();
})();
