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
    drawPicks();
  }
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function drawPicks(){
    const target=document.getElementById('homePicksGrid'),Catalog=window.MasterCatalog,Store=window.MasterStore,Locale=window.MasterLocale;
    if(!target||!Catalog||!Store)return;
    const en=isEnglish();
    const choices=[['chatgpt-plus','مساعدك اليومي','Everyday AI'],['gemini-pro','بحث وأفكار','Research & ideas'],['canva-pro','تصميم أسهل','Design with ease'],['capcut-pro','فيديو ومونتاج','Video & editing'],['coursera','تعلّم مهارة','Learn a skill'],['elevenlabs','صوت لمحتواك','Voice for your content']];
    target.innerHTML=choices.map(([id,ar,use])=>{
      const p=Catalog.getProduct(id);if(!p||p.status!=='available')return '';
      const options=(p.plans||[]).map((plan,index)=>({plan,index})).filter(({plan})=>!plan.hidden&&plan.available!==false&&Number.isFinite(Store.planAmount(plan))&&Store.planAmount(plan)>0&&(!plan.offerEndsAt||Date.now()<Date.parse(plan.offerEndsAt)));
      options.sort((a,b)=>Store.planAmount(a.plan)-Store.planAmount(b.plan));
      if(!options.length)return '';const {plan,index}=options[0];
      const label=value=>Locale?.catalogText(value,'plan',id)||String(value||'');
      const name=en?(plan.nameEn||label(plan.name)):plan.name;
      const warranty=en?(plan.warrantyEn||label(plan.warranty)):plan.warranty;
      const account=en?(plan.accountEn||label(plan.account)):plan.account;
      return '<article class="home-plan"><div class="home-plan-top"><img src="'+esc(p.logoUrl||'logos/'+p.logo+'.svg')+'" alt="" width="44" height="44" loading="lazy"><span>'+esc(en?use:ar)+'</span></div><h3 dir="auto">'+esc(p.name)+'</h3><p class="home-plan-tier">'+esc(name)+'</p><div class="home-plan-price">'+Store.priceMarkup(plan)+'</div><dl><div><dt>'+ (en?'Duration':'المدة')+'</dt><dd>'+esc(label(plan.duration))+'</dd></div>'+(account?'<div><dt>'+(en?'Account':'نوع الحساب')+'</dt><dd>'+esc(account)+'</dd></div>':'')+(warranty?'<div><dt>'+(en?'Warranty':'الضمان')+'</dt><dd>'+esc(warranty)+'</dd></div>':'')+'</dl><a class="home-plan-cta" href="products/'+encodeURIComponent(id)+'.html?plan='+index+'">'+(en?'View plan & order':'تفاصيل الباقة والطلب')+' <span aria-hidden="true">'+(en?'→':'←')+'</span></a></article>';
    }).join('');
  }
  document.getElementById('homeSearch')?.addEventListener('submit',event=>{
    event.preventDefault();
    document.dispatchEvent(new CustomEvent('masterstore:homecategory',{detail:'الكل'}));
    const input=document.getElementById('search');if(!input)return;
    input.value=document.getElementById('homeQuery').value.trim().slice(0,120);input.dispatchEvent(new Event('input',{bubbles:true}));
    document.getElementById('products').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});input.focus({preventScroll:true});
  });
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
