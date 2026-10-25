(async function(){
  'use strict';

  const menu=document.querySelector('.menu');
  const nav=document.querySelector('.topbar nav');

  if(menu&&nav){
    menu.setAttribute('aria-expanded','false');

    function closeMenu(restoreFocus=false){
      nav.classList.remove('open');
      menu.setAttribute('aria-expanded','false');
      menu.setAttribute('aria-label',window.MasterLocale?.getState().language==='en'?'Open menu':'فتح القائمة');
      if(restoreFocus)menu.focus();
    }

    menu.addEventListener('click',()=>{
      const open=nav.classList.toggle('open');
      menu.setAttribute('aria-expanded',String(open));
      menu.setAttribute('aria-label',window.MasterLocale?.getState().language==='en'?(open?'Close menu':'Open menu'):(open?'إغلاق القائمة':'فتح القائمة'));
      if(open)nav.querySelector('a')?.focus();
    });

    const updateMenuLabel=()=>{const open=nav.classList.contains('open'),en=window.MasterLocale?.getState().language==='en';menu.setAttribute('aria-label',en?(open?'Close menu':'Open menu'):(open?'إغلاق القائمة':'فتح القائمة'));};
    document.addEventListener('masterstore:localechange',updateMenuLabel);updateMenuLabel();
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeMenu()));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open'))closeMenu(true);});
    document.addEventListener('click',e=>{
      if(!nav.contains(e.target)&&!menu.contains(e.target))closeMenu();
    });
  }

  const accountLink=document.querySelector('.account-link');
  if(accountLink&&window.MasterCloud?.ready){
    let avatarSession=null;
    const drawAccountAvatar=()=>{
      const picture=avatarSession?.user&&window.MasterStore?.avatarData(avatarSession.user);
      accountLink.classList.toggle('with-avatar',!!picture);
      if(picture){accountLink.style.setProperty('--account-avatar-image','url("'+picture.path+'")');accountLink.style.setProperty('--account-avatar-position',picture.position);accountLink.dataset.avatarId=picture.id;accountLink.setAttribute('aria-label',accountLink.textContent);}
      else{accountLink.style.removeProperty('--account-avatar-image');accountLink.style.removeProperty('--account-avatar-position');delete accountLink.dataset.avatarId;accountLink.removeAttribute('aria-label');}
    };
    const updateAccountLink=session=>{avatarSession=session;accountLink.dataset.authenticated=String(!!session);window.MasterLocale?.apply();drawAccountAvatar();};
    document.addEventListener('masterstore:localechange',drawAccountAvatar);
    window.MasterCloud.client.auth.getSession().then(({data})=>updateAccountLink(data.session));
    window.MasterCloud.client.auth.onAuthStateChange((_event,session)=>updateAccountLink(session));
  }

  const grid=document.getElementById('grid');
  const filters=document.getElementById('filters');
  if(!grid||!filters)return;

  await window.MasterCatalogReady;
  const Catalog=window.MasterCatalog;
  const Store=window.MasterStore;
  const Locale=window.MasterLocale;
  const search=document.getElementById('search');
  const empty=document.getElementById('empty');
  const availableOnly=document.getElementById('availableOnly');
  const sort=document.getElementById('catalogSort');
  const loading=document.getElementById('catalogLoading');

  if(!Catalog||!Store){
    if(loading)loading.textContent='تعذر تحميل الكتالوج. حدّث الصفحة وحاول مرة أخرى.';
    return;
  }

  const popularityOrder=["supergrok-coursera-bundle","gemini-coursera-bundle","chatgpt-plus","chatgpt-teachers-k12","gemini-pro","canva-pro","adobe-cc","capcut-pro","kling","microsoft-365","grok","claude-pro","spotify","youtube","netflix","perplexity-pro","freepik","runway-pro","elevenlabs","academic-pro","humanizeai-standard","grammarly","quillbot","coursera","duolingo","notion","figma","linkedin-premium","zoom","manus","lovable-pro","lovable-lite","gamma-plus","gamma-account"];
  const popularityRank=new Map(popularityOrder.map((id,index)=>[id,index]));
  const statusRank={available:0,soon:1,out:2};
  const products=[...(Catalog.products||[])].filter(product=>!product.redirectTo).sort((a,b)=>{
    const rank=(statusRank[a.status]??9)-(statusRank[b.status]??9);
    return rank||((popularityRank.get(a.id)??999)-(popularityRank.get(b.id)??999));
  });
  const categories=['الكل',...(Catalog.categoryOrder||[...new Set(products.map(p=>p.category).filter(Boolean))])];
  const urlFilters=new URLSearchParams(location.search);
  const validCategories=new Set([...categories,...Object.values(Catalog.categoryGroups||{}).flat()]);
  let selected=validCategories.has(urlFilters.get('category'))?urlFilters.get('category'):'الكل';
  if(search)search.value=(urlFilters.get('q')||'').slice(0,120);
  if(availableOnly)availableOnly.checked=urlFilters.get('available')==='1';
  if(sort&&['price-asc','price-desc'].includes(urlFilters.get('sort')))sort.value=urlFilters.get('sort');

  const isEn=()=>Locale?.getState().language==='en';
  const ui=(ar,en)=>isEn()?en:ar;
  const tr=(value,kind,id)=>Locale?.catalogText(value,kind,id) ?? String(value??'');
  const esc=value=>Store.escapeHtml(value);

  function normalizeSearch(value){
    return String(value??'').replace(/[٠-٩]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))).replace(/(?<=\d)[,٬](?=\d)/g,'')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g,'')
      .replace(/[إأآٱ]/g,'ا')
      .replace(/ى/g,'ي')
      .replace(/ؤ/g,'و')
      .replace(/ئ/g,'ي')
      .replace(/ة/g,'ه')
      .replace(/[^a-z0-9\u0600-\u06FF]+/g,' ')
      .trim();
  }

  function initials(name){
    return String(name||'M').split(/\s+/).filter(Boolean).map(x=>x[0]).join('').slice(0,2).toUpperCase();
  }

  function logoMarkup(product){
    if(product.id==='gemini-coursera-bundle')return '<span class="bundle-brand-group"><span class="product-logo big bundle-main-logo"><img src="logos/coursera.svg" alt="Coursera Plus"></span><span class="bundle-gift-logos">'+['gemini','canva'].map(name=>'<span class="bundle-gift-logo"><img src="logos/'+name+'.svg" alt="'+(name==='gemini'?'Gemini':'Canva Pro')+'"><small>'+ui('مجانًا','FREE')+'</small></span>').join('')+'</span></span>';
    const local=product.logo?'logos/'+encodeURIComponent(product.logo)+'.svg?v=20261009-logo-review3':'';
    const src=product.logoUrl||local;
    const fallback=initials(product.name);
    if(!src)return '<span class="product-logo"><span class="logo-fallback visible">'+esc(fallback)+'</span></span>';
    return '<span class="product-logo">'+
      '<img src="'+esc(src)+'" data-fallback="'+esc(local)+'" alt="'+esc(product.name)+'" loading="lazy" decoding="async">'+
      '<span class="logo-fallback">'+esc(fallback)+'</span>'+
    '</span>';
  }

  function bindLogoFallbacks(container=grid){
    container.querySelectorAll('.product-logo img').forEach(img=>{
      const recoverLogo=()=>{
        const fallback=img.dataset.fallback;
        if(fallback&&!img.dataset.usedFallback&&img.src!==new URL(fallback,location.href).href){
          img.dataset.usedFallback='1';
          img.src=fallback;
          return;
        }
        img.hidden=true;
        img.nextElementSibling?.classList.add('visible');
      };
      img.addEventListener('error',recoverLogo);
      if(img.complete&&img.naturalWidth===0)recoverLogo();
    });
  }

  function savingMoney(plan){
    if(!plan||(!plan.oldPrice&&!plan.officialPrice))return '';
    const saving=Store.planAmount(plan,'oldPrice')-Store.planAmount(plan);
    return saving>0?Store.formatCurrency(saving,Store.getMarket().currency):'';
  }

  function cheapestPlan(product){
    const plans=product.plans||[];
    return plans.filter(plan=>!plan.hidden&&plan.available!==false).reduce((best,plan)=>{
      if(!best)return plan;
      return Store.planAmount(plan)<Store.planAmount(best)?plan:best;
    },null);
  }

  function statusClass(status){
    return status==='available'?'ok':status==='soon'?'soon':'out';
  }

  const searchAliases={'capcut-pro':'كاب كات كابكت كابكات كبكات','gemini-pro':'جيمناي جيميني جيميناي جيمني جوجل','chatgpt-plus':'شات جي بي تي شاتجبت تشات','elevenlabs':'ايلفن اليفن إليفن ايليفن','higgsfield-pro':'هيجزفيلد هيجسفيلد','leonardo-ai':'ليوناردو ليناردو ليرنادو ليرنادوا','grok':'جروك غروك سوبرجروك','coursera':'كورسيرا كورسيرا بلس','supergrok-coursera-bundle':'سوبر جروك كورسيرا كورسيرا بلس','windows-pro':'ويندوز وندوز ويندز','duolingo':'دولينجو دولينغو','quillbot':'كولبوت كويلبوت كويل بوت','claude-pro':'كلود كلاود','freepik':'فريبيك فري بيك','envato':'انفاتو إنفاتو','discord':'ديسكورد ديسكورات نيترو','canva-pro':'كانفا كنفا','grammarly':'جراملي جرامرلي','lovable-pro':'لوفابل لوفبل','perplexity-pro':'بيربليكسيتي بيربلكسيتي'};
  function searchText(product){
    return normalizeSearch([
      product.name,
      searchAliases[product.id]||'',
      product.id==='kling'?'كلينج كيلنج Kling':'' ,
      tr(product.category,'category',product.id),
      ...(product.categories||[]),
      tr(product.description,'description',product.id),
      tr(Catalog.statusLabel(product.status),'status',product.id),
      ...(product.plans||[]).flatMap(plan=>[
        tr(plan.name||'','planName',product.id),
        tr(plan.duration||'','duration',product.id),
        tr(plan.account||'','account',product.id),plan.credits||'',...(plan.features||[])
      ])
    ].join(' '));
  }

  function cardMarkup(product){
    const active=product.status==='available'&&(product.plans||[]).length>0;
    const plan=cheapestPlan(product);
    const status=tr(Catalog.statusLabel(product.status),'status',product.id);
    const price=active&&plan?Store.planMoney(plan):'—';
    const action=active
      ? '<a class="card-btn soft-btn" aria-label="'+esc(product.name+' — '+ui('شوف الباقات','View plans'))+'" href="products/'+encodeURIComponent(product.id)+'.html">'+ui('شوف الباقات','View plans')+' <span aria-hidden="true">'+(isEn()?'→':'←')+'</span></a>'
      : '<button class="card-btn disabled" type="button" disabled>'+esc(status)+'</button>';
    return '<article class="product-card light-card simple-service-card" aria-label="'+esc(product.name)+'" data-product-id="'+esc(product.id)+'" data-category="'+esc(product.category)+'" data-search="'+esc(searchText(product))+'">'+
      (product.id==='elevenlabs'&&product.plans?.[2]?.offerEndsAt&&product.plans?.[2]?.available!==false?'<p class="plan-saving">'+ui('⏰ عرض مؤقت · الحجز خلال 24 ساعة · الاشتراك شهر كامل','⏰ Limited-time offer · Book within 24 hours · 1-month subscription')+'</p>':'')+
      '<div class="card-top">'+logoMarkup(product)+'<h3 class="service-name" dir="auto">'+esc(product.name)+'</h3></div>'+
      (product.id==='gemini-coursera-bundle'?'<p class="bundle-card-summary">كورسيرا سنة + جيمناي ٣ شهور + كانفا ٣ سنين</p>':'')+(product.id==='supergrok-coursera-bundle'?'<p class="bundle-card-summary">'+ui('شهر لكل اشتراك · حسابات جاهزة · ضمان كامل','One month each · Ready accounts · Full warranty')+'</p>':'')+'<div class="light-meta">'+(active&&plan?Store.priceMarkup(plan):'<strong>'+esc(price)+'</strong>')+'</div>'+
      '<div class="card-bottom light-bottom">'+action+'</div>'+
    '</article>';
  }

  function renderCards(){
    grid.setAttribute('aria-busy','true');
    grid.innerHTML=products.map(cardMarkup).join('');
    bindLogoFallbacks();
    grid.setAttribute('aria-busy','false');
    if(loading)loading.hidden=true;
  }

  const matchesCategory=(product,category)=>{const tags=product?.categories||[product?.category];return category==='الكل'||tags.includes(category)||(Catalog.categoryGroups?.[category]||[]).some(sub=>tags.includes(sub));};
  function categoryLabel(category){
    return category==='الكل'?ui('الكل','All'):tr(category,'category','');
  }

  function drawFilters(){
    const parent=Object.keys(Catalog.categoryGroups||{}).find(group=>group===selected||Catalog.categoryGroups[group].includes(selected));
    const button=(category,active)=>'<button class="filter '+(active?'active':'')+'" type="button" data-cat="'+esc(category)+'" aria-pressed="'+active+'">'+esc(categoryLabel(category))+' <span class="filter-count">'+products.filter(p=>matchesCategory(p,category)).length+'</span></button>';
    filters.innerHTML='<div class="category-main" aria-label="'+ui('الأقسام الرئيسية','Main categories')+'">'+categories.map(category=>button(category,category===(parent||selected))).join('')+'</div>'+(parent?'<div class="category-sub" aria-label="'+ui('التصنيف الدقيق','Specific category')+'"><span class="category-sub-label">'+ui('اختار الاستخدام:','Choose a use:')+'</span>'+button(parent,selected===parent).replace(esc(categoryLabel(parent))+' <span',ui('كل القسم','All in category')+' <span')+Catalog.categoryGroups[parent].map(sub=>button(sub,selected===sub)).join('')+'</div>':'');

    filters.querySelectorAll('.filter').forEach(button=>{
      button.addEventListener('click',()=>{
        selected=button.dataset.cat||'الكل';
        drawFilters();
        applyFilters();
      });
    });
  }

  function applyFilters(){
    const q=normalizeSearch(search?.value||'');
    let visible=0;
    const rank=new Map(products.map((p,i)=>[p.id,i]));
    const amount=card=>{const p=cheapestPlan(Catalog.getProduct(card.dataset.productId));return p?Store.planAmount(p):null;};
    const cards=[...grid.querySelectorAll('.product-card')];
    cards.sort((a,b)=>{if(!sort?.value||sort.value==='featured')return rank.get(a.dataset.productId)-rank.get(b.dataset.productId);const av=amount(a),bv=amount(b);if(av===null)return bv===null?0:1;if(bv===null)return -1;return (sort.value==='price-desc'?bv-av:av-bv)||rank.get(a.dataset.productId)-rank.get(b.dataset.productId);});
    cards.forEach(card=>grid.appendChild(card));
    if(sort){const current=sort.value;sort.setAttribute('aria-label',ui('ترتيب الخدمات','Sort services'));sort.options[0].textContent=ui('ترتيب المتجر','Store order');sort.options[1].textContent=ui('السعر: الأقل أولًا','Price: low to high');sort.options[2].textContent=ui('السعر: الأعلى أولًا','Price: high to low');sort.value=current;}

    grid.querySelectorAll('.product-card').forEach(card=>{
      const categoryMatch=matchesCategory(Catalog.getProduct(card.dataset.productId),selected);
      const product=Catalog.getProduct(card.dataset.productId);
      const matches=categoryMatch&&(!availableOnly?.checked||product?.status==='available')&&(!q||q.split(/\s+/).every(word=>(card.dataset.search||'').includes(word)));
      card.hidden=!matches;
      if(matches)visible++;
    });

    const url=new URL(location.href);
    const state={q:search?.value.trim()||'',category:selected==='الكل'?'':selected,available:availableOnly?.checked?'1':'',sort:sort?.value==='featured'?'':sort?.value||''};
    for(const [key,value] of Object.entries(state)){if(value)url.searchParams.set(key,value);else url.searchParams.delete(key);}
    if(url.href!==location.href)history.replaceState(history.state,'',url);
    const count=document.getElementById('catalogResultCount');
    if(count)count.textContent=ui('عرض '+visible+' من '+products.length+' خدمة', 'Showing '+visible+' of '+products.length+' services');
    const availableLabel=document.getElementById('availableOnlyLabel');
    if(availableLabel)availableLabel.textContent=ui('المتاح فقط','Available only');
    if(empty){
      empty.hidden=visible>0;
      empty.innerHTML='<p>'+ui('مفيش نتيجة مطابقة. جرّب اسم تاني أو اعرض كل الخدمات.','No matching results. Try another name or browse all services.')+'</p><button type="button" class="filter" data-reset-search>'+ui('عرض كل الخدمات','Show all services')+'</button>';
    }
  }

  function updateCatalogCount(){
    const count=document.querySelector('[data-catalog-count]');
    if(count)count.textContent='+'+products.length;
  }

  function updateShelf(){
    const shelf=document.querySelector('.shelf-feature strong');
    const lovable=Catalog.getProduct('lovable-lite');
    if(shelf&&lovable?.plans?.[0])shelf.textContent=Store.planMoney(lovable.plans[0]);
  }


  function renderBestOffers(){
    const target=document.getElementById('bestOffersGrid');
    if(!target)return;
    const picks=[['supergrok-coursera-bundle',0],['elevenlabs',2],['cursor-pro',1],['coursera',0],['lovable-pro',1],['gemini-pro',0],['capcut-pro',1],['grok',0]];
    target.innerHTML=picks.map(([id,index])=>{
      const product=Catalog.getProduct(id),plan=product?.plans?.[index];
      if(!plan||plan.hidden||plan.available===false||product.status!=='available')return '';
      return '<article class="best-offer '+(id==='gemini-coursera-bundle'?'bundle-featured':'')+'">'+logoMarkup(product)+'<div><h3>'+esc(product.name)+'</h3>'+(id==='elevenlabs'&&plan.offerEndsAt?'<p class="plan-saving">'+ui('⏰ عرض مؤقت · مهلة الحجز 24 ساعة · الاشتراك شهر كامل','⏰ Limited-time offer · Book within 24 hours · 1-month subscription')+'</p>':'')+(id==='gemini-coursera-bundle'?'<p class="bundle-card-summary">اشتراك سنة بضمان كامل + هديتين مجانًا</p>':'')+(id==='supergrok-coursera-bundle'?'<p class="bundle-card-summary">'+ui('سوبر جروك شهر + كورسيرا بلس شهر · ضمان كامل','SuperGrok + Coursera Plus · One month each · Full warranty')+'</p>':'')+'<small>'+esc(id==='lovable-pro'&&index===1?ui('شهر · 100 كريدت + 5 يوميًا','Month · 100 credits + 5 daily'):tr(plan.duration,'duration',id))+'</small></div>'+Store.priceMarkup(plan)+'<a class="card-btn soft-btn" href="products/'+encodeURIComponent(id)+'.html?plan='+index+'">'+ui('شوف الباقة','View offer')+'</a></article>';
    }).join('');
    bindLogoFallbacks(target);
  }

  function renderAll(){
    renderBestOffers();
    renderCards();
    drawFilters();
    applyFilters();
    updateShelf();
    updateCatalogCount();
  }

  grid.addEventListener('click',event=>{
    if(event.target.closest('a,button,input,select'))return;
    const link=event.target.closest('.product-card')?.querySelector('a.card-btn');
    if(link)link.click();
  });
  empty?.addEventListener('click',event=>{
    if(!event.target.closest('[data-reset-search]'))return;
    if(search)search.value='';
    selected='الكل';if(availableOnly)availableOnly.checked=false;drawFilters();applyFilters();search?.focus();
  });
  search?.setAttribute('aria-label',ui('ابحث عن خدمة','Search services'));
  search?.addEventListener('input',applyFilters);
  availableOnly?.addEventListener('change',applyFilters);
  sort?.addEventListener('change',applyFilters);
  document.addEventListener('masterstore:localechange',renderAll);

  renderAll();
})();

(function geminiDeadline(){
 const deadline=Date.parse('2026-10-27T00:00:00+03:00');
 const productView=(new URLSearchParams(location.search).get('id')||document.body.dataset.productId)==='gemini-pro';
 let clock;
 const mount=()=>{
  const target=productView?document.getElementById('productPage'):document.querySelector('[data-product-id="gemini-pro"]');
  if(!target||target.querySelector('[data-gemini-countdown]'))return;
  if(productView&&!target.querySelector('.product-hero'))return;
  if(clock)clearInterval(clock);
  const box=document.createElement('div');
  box.dataset.geminiCountdown='';box.className='gemini-deadline'+(productView?' gemini-deadline-detail':'');
  box.setAttribute('role','timer');box.setAttribute('aria-live','off');
  box.innerHTML='<span class="deadline-caption">ينتهي العرض قريبًا</span><span class="deadline-digits" dir="ltr"></span>';
  const digits=box.querySelector('.deadline-digits');
  const update=()=>{
   const ms=deadline-Date.now();
   if(ms<=0){box.textContent='انتهت مدة العرض · ٢٦ أكتوبر ٢٠٢٦';clearInterval(clock);return;}
   let seconds=Math.floor(ms/1000);const days=Math.floor(seconds/86400);seconds%=86400;
   const hours=Math.floor(seconds/3600);seconds%=3600;const minutes=Math.floor(seconds/60);seconds%=60;
   const values=[days,hours,minutes,seconds],labels=['يوم','ساعة','دقيقة','ثانية'];
   digits.innerHTML=values.map((value,i)=>'<span class="deadline-unit"><b>'+String(value).padStart(2,'0')+'</b><small>'+labels[i]+'</small></span>').join('<span class="deadline-separator">:</span>');
   box.setAttribute('aria-label','ينتهي العرض بعد '+days+' يوم و'+hours+' ساعة و'+minutes+' دقيقة و'+seconds+' ثانية');
  };
  if(productView){
   const panel=document.createElement('aside');panel.className='gemini-offer-notice';
   panel.innerHTML='<div><strong>قبل فوات الأوان</strong><p>آخر فرصة لعرض جيمناي ١٨ شهر: <b>٢٦ أكتوبر ٢٠٢٦</b>، حتى نهاية اليوم بتوقيت مصر.</p></div>';
   panel.append(box);target.querySelector('.product-hero').after(panel);
  }else{
   const bottom=target.querySelector('.card-bottom');if(bottom)bottom.before(box);else target.append(box);
  }
  update();clock=setInterval(update,1000);
 };
 mount();
 const root=document.getElementById(productView?'productPage':'grid');
 if(root)new MutationObserver(mount).observe(root,{childList:true});
})();

(function cursorOfferTimer(){
 const end=Date.parse('2026-10-13T11:32:00Z');
 const mount=()=>{
  const page=new URLSearchParams(location.search).get('id')==='cursor-pro';
  const root=page?document.querySelector('#productPage .product-hero'):document.querySelector('[data-product-id="cursor-pro"]');
  if(!root||root.querySelector('[data-cursor-offer]'))return;
  const box=document.createElement('div');box.dataset.cursorOffer='';box.setAttribute('role','timer');box.setAttribute('aria-live','off');box.style.cssText='color:#c62828;font-size:11px;line-height:1.8;margin:10px 0;text-align:center';
  const update=()=>{let s=Math.max(0,Math.floor((end-Date.now())/1000));const h=Math.floor(s/3600);s%=3600;const m=Math.floor(s/60);s%=60;box.textContent=end>Date.now()?'عرض الشهر 300ج · متبقي '+h+' ساعة : '+m+' دقيقة : '+s+' ثانية':'انتهى عرض الشهر بـ300ج';};
  root.append(box);update();setInterval(update,1000);
 };
 mount();const root=document.getElementById('productPage')||document.getElementById('grid');if(root)new MutationObserver(mount).observe(root,{childList:true});
})();
