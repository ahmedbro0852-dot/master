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

  const statusRank={available:0,soon:1,out:2};
  const products=[...(Catalog.products||[])].sort((a,b)=>{
    const rank=(statusRank[a.status]??9)-(statusRank[b.status]??9);
    return rank||0;
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

  function bindLogoFallbacks(){
    grid.querySelectorAll('.product-logo img').forEach(img=>{
      img.addEventListener('error',()=>{
        const fallback=img.dataset.fallback;
        if(fallback&&!img.dataset.usedFallback&&img.src!==new URL(fallback,location.href).href){
          img.dataset.usedFallback='1';
          img.src=fallback;
          return;
        }
        img.hidden=true;
        img.nextElementSibling?.classList.add('visible');
      },{once:false});
    });
  }

  function savingMoney(plan){
    if(!plan||!plan.oldPrice||Number(plan.oldPrice)<=Number(plan.price))return '';
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
    const multiple=(product.plans||[]).length>1;
    const status=tr(Catalog.statusLabel(product.status),'status',product.id);

    let metaLabel=product.status==='soon'?ui('قريبًا','Coming soon'):ui('غير متوفر','Unavailable');
    let price='—';
    if(active&&plan){
      metaLabel=multiple?ui('يبدأ من','From'):tr(plan.duration||'','duration',product.id);
      price=Store.planMoney(plan);
    }

    const action=active
      ? '<a class="card-btn soft-btn" href="product.html?id='+encodeURIComponent(product.id)+'">'+ui('شوف الباقات','View plans')+' <span aria-hidden="true">'+(isEn()?'→':'←')+'</span></a>'
      : '<button class="card-btn disabled" type="button" disabled>'+esc(status)+'</button>';

    const saveText=active&&plan?savingMoney(plan):'';
    const saveBadge=saveText?'<span class="card-saving">'+ui('وفر','Save')+' '+esc(saveText)+'</span>':'';

    return '<article class="product-card light-card" data-product-id="'+esc(product.id)+'" data-category="'+esc(product.category)+'" data-search="'+esc(searchText(product))+'">'+
      '<div class="card-top">'+logoMarkup(product)+'<span class="status '+statusClass(product.status)+'">'+esc(status)+'</span></div>'+
      '<div class="card-copy"><p class="category">'+esc(tr(product.category,'category',product.id))+'</p><h3>'+esc(product.name)+'</h3><p class="desc">'+esc(tr(product.description||'','description',product.id))+'</p></div>'+
      '<div class="light-meta"><div class="light-meta-copy"><span>'+esc(metaLabel)+'</span>'+saveBadge+'</div><strong>'+esc(price)+'</strong></div>'+
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
      empty.textContent=ui('مفيش نتيجة مطابقة.','No matching results.');
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

  function renderAll(){
    renderCards();
    drawFilters();
    applyFilters();
    updateShelf();
    updateCatalogCount();
  }

  search?.addEventListener('input',applyFilters);
  document.addEventListener('masterstore:localechange',renderAll);

  renderAll();
})();