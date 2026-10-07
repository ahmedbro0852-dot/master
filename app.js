(function(){
  'use strict';

  const menu=document.querySelector('.menu');
  const nav=document.querySelector('.topbar nav');

  if(menu&&nav){
    menu.setAttribute('aria-expanded','false');

    function closeMenu(){
      nav.classList.remove('open');
      menu.setAttribute('aria-expanded','false');
    }

    menu.addEventListener('click',()=>{
      const open=nav.classList.toggle('open');
      menu.setAttribute('aria-expanded',String(open));
    });

    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
    document.addEventListener('click',e=>{
      if(!nav.contains(e.target)&&!menu.contains(e.target))closeMenu();
    });
  }

  const grid=document.getElementById('grid');
  const filters=document.getElementById('filters');
  if(!grid||!filters)return;

  const Catalog=window.MasterCatalog;
  const Store=window.MasterStore;
  const Locale=window.MasterLocale;
  const search=document.getElementById('search');
  const empty=document.getElementById('empty');
  const loading=document.getElementById('catalogLoading');

  if(!Catalog||!Store){
    if(loading)loading.textContent='تعذر تحميل الكتالوج. حدّث الصفحة وحاول مرة أخرى.';
    return;
  }

  const popularityOrder=["chatgpt-plus","gemini-pro","canva-pro","adobe-cc","capcut-pro","kling","microsoft-365","grok","claude-pro","spotify","youtube","netflix","perplexity-pro","freepik","runway-pro","elevenlabs","academic-pro","humanizeai-standard","grammarly","quillbot","coursera","duolingo","notion","figma","linkedin-premium","zoom","manus-pro","manus","lovable-pro","lovable-lite","gamma-plus","gamma-account","chatgpt-teachers-k12"];
  const popularityRank=new Map(popularityOrder.map((id,index)=>[id,index]));
  const statusRank={available:0,soon:1,out:2};
  const products=[...(Catalog.products||[])].sort((a,b)=>{
    const rank=(statusRank[a.status]??9)-(statusRank[b.status]??9);
    return rank||((popularityRank.get(a.id)??999)-(popularityRank.get(b.id)??999));
  });
  const categories=['الكل',...(Catalog.categoryOrder||[...new Set(products.map(p=>p.category).filter(Boolean))])];
  let selected='الكل';

  const isEn=()=>Locale?.getState().language==='en';
  const ui=(ar,en)=>isEn()?en:ar;
  const tr=(value,kind,id)=>Locale?.catalogText(value,kind,id) ?? String(value??'');
  const esc=value=>Store.escapeHtml(value);

  function normalizeSearch(value){
    return String(value??'')
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
    const local=product.logo?'logos/'+encodeURIComponent(product.logo)+'.svg?v=20260924-sec19':'';
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
    return plans.reduce((best,plan)=>{
      if(!best)return plan;
      return Store.planAmount(plan)<Store.planAmount(best)?plan:best;
    },null);
  }

  function statusClass(status){
    return status==='available'?'ok':status==='soon'?'soon':'out';
  }

  function searchText(product){
    return normalizeSearch([
      product.name,
      product.id==='kling'?'كلينج كيلنج Kling':'' ,
      tr(product.category,'category',product.id),
      tr(product.description,'description',product.id),
      tr(Catalog.statusLabel(product.status),'status',product.id),
      ...(product.plans||[]).flatMap(plan=>[
        tr(plan.name||'','planName',product.id),
        tr(plan.duration||'','duration',product.id),
        tr(plan.account||'','account',product.id)
      ])
    ].join(' '));
  }

  function cardMarkup(product){
    const active=product.status==='available'&&(product.plans||[]).length>0;
    const plan=cheapestPlan(product);
    const status=tr(Catalog.statusLabel(product.status),'status',product.id);
    const price=active&&plan?Store.planMoney(plan):'—';
    const action=active
      ? '<a class="card-btn soft-btn" aria-label="'+esc(product.name+' — '+ui('شوف الباقات','View plans'))+'" href="product.html?id='+encodeURIComponent(product.id)+'">'+ui('شوف الباقات','View plans')+' <span aria-hidden="true">'+(isEn()?'→':'←')+'</span></a>'
      : '<button class="card-btn disabled" type="button" disabled>'+esc(status)+'</button>';
    return '<article class="product-card light-card simple-service-card" aria-label="'+esc(product.name)+'" data-product-id="'+esc(product.id)+'" data-category="'+esc(product.category)+'" data-search="'+esc(searchText(product))+'">'+
      '<div class="card-top">'+logoMarkup(product)+'<h3 class="service-name" dir="auto">'+esc(product.name)+'</h3></div>'+
      '<div class="light-meta"><strong>'+esc(price)+'</strong></div>'+
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

  function categoryLabel(category){
    return category==='الكل'?ui('الكل','All'):tr(category,'category','');
  }

  function drawFilters(){
    filters.innerHTML=categories.map(category=>
      '<button class="filter '+(category===selected?'active':'')+'" type="button" data-cat="'+esc(category)+'" aria-pressed="'+(category===selected?'true':'false')+'">'+esc(categoryLabel(category))+'</button>'
    ).join('');

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

    grid.querySelectorAll('.product-card').forEach(card=>{
      const categoryMatch=selected==='الكل'||card.dataset.category===selected;
      const matches=categoryMatch&&(!q||(card.dataset.search||'').includes(q));
      card.hidden=!matches;
      if(matches)visible++;
    });

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
    const picks=[['lovable-pro',0],['gemini-pro',0],['capcut-pro',1],['grok',0],['lovable-pro',1]];
    target.innerHTML=picks.map(([id,index])=>{
      const product=Catalog.getProduct(id),plan=product?.plans?.[index];
      if(!plan)return '';
      return '<article class="best-offer">'+logoMarkup(product)+'<div><h3>'+esc(product.name)+'</h3><small>'+esc(id==='lovable-pro'&&index===1?ui('شهر · 100 كريدت + 5 يوميًا','Month · 100 credits + 5 daily'):tr(plan.duration,'duration',id))+'</small></div><strong>'+Store.planMoney(plan)+(plan.oldPrice?' <del>'+Store.planMoney({...plan,price:plan.oldPrice})+'</del>':'')+'</strong><a class="card-btn soft-btn" href="product.html?id='+encodeURIComponent(id)+'&plan='+index+'">'+ui('شوف الباقة','View offer')+'</a></article>';
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
    selected='الكل';drawFilters();applyFilters();search?.focus();
  });
  search?.setAttribute('aria-label',ui('ابحث عن خدمة','Search services'));
  search?.addEventListener('input',applyFilters);
  document.addEventListener('masterstore:localechange',renderAll);

  renderAll();
})();