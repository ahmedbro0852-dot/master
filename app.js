(function(){
  'use strict';

  const menu=document.querySelector('.menu');
  const nav=document.querySelector('.topbar nav');

  if(menu&&nav){
    menu.setAttribute('aria-expanded','false');
    menu.addEventListener('click',()=>{
      const open=nav.classList.toggle('open');
      menu.setAttribute('aria-expanded',String(open));
    });
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
      nav.classList.remove('open');
      menu.setAttribute('aria-expanded','false');
    }));
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'){
        nav.classList.remove('open');
        menu.setAttribute('aria-expanded','false');
      }
    });
    document.addEventListener('click',e=>{
      if(!nav.contains(e.target)&&!menu.contains(e.target)){
        nav.classList.remove('open');
        menu.setAttribute('aria-expanded','false');
      }
    });
  }

  const grid=document.getElementById('grid');
  const filters=document.getElementById('filters');
  const search=document.getElementById('search');
  const empty=document.getElementById('empty');
  if(!grid||!filters)return;

  const cards=[...grid.querySelectorAll('.product-card')];
  const Catalog=window.MasterCatalog;
  const Store=window.MasterStore;
  const categories=['الكل',...new Set(cards.map(c=>c.dataset.category).filter(Boolean))];

  function refreshBrandLogos(){
    if(!Catalog)return;
    cards.forEach(card=>{
      const link=card.querySelector('a[href*="product.html?id="]');
      const img=card.querySelector('.product-logo img');
      if(!link||!img)return;
      const id=new URL(link.getAttribute('href'),location.href).searchParams.get('id');
      const product=Catalog.getProduct(id);
      if(!product)return;
      const local=product.logo?'logos/'+encodeURIComponent(product.logo)+'.svg?v=20260924-brand7':'';
      const src=product.logoUrl||local;
      if(local)img.dataset.fallback=local;
      if(src)img.src=src;
    });
  }

  function refreshLocalizedPrices(){
    if(!Catalog||!Store)return;
    cards.forEach(card=>{
      const link=card.querySelector('a[href*="product.html?id="]');
      const price=card.querySelector('.light-meta strong');
      if(!link||!price)return;
      const id=new URL(link.getAttribute('href'),location.href).searchParams.get('id');
      const product=Catalog.getProduct(id);
      if(!product?.plans?.length)return;
      const plan=product.plans.reduce((best,item)=>!best||Store.planAmount(item)<Store.planAmount(best)?item:best,null);
      if(plan)price.textContent=Store.planMoney(plan);
    });
    const shelf=document.querySelector('.shelf-feature strong');
    const lovable=Catalog.getProduct('lovable-lite');
    if(shelf&&lovable?.plans?.[0])shelf.textContent=Store.planMoney(lovable.plans[0]);
  }

  const categoryEn={
    'الكل':'All','AI Tools':'AI Tools','التصميم':'Design','التعليم':'Education',
    'الإنتاجية':'Productivity','VPN والحماية':'VPN & Security','الترفيه':'Entertainment'
  };
  function categoryLabel(c){
    const en=window.MasterLocale?.getState().language==='en';
    return en?(categoryEn[c]||c):c;
  }

  function tr(value,kind,id){
    return window.MasterLocale?.catalogText(value,kind,id) ?? String(value??'');
  }
  function refreshLocalizedCards(){
    if(!Catalog)return;
    const en=window.MasterLocale?.getState().language==='en';
    cards.forEach(card=>{
      const link=card.querySelector('a[href*="product.html?id="]');
      if(!link)return;
      const id=new URL(link.getAttribute('href'),location.href).searchParams.get('id');
      const product=Catalog.getProduct(id);
      if(!product)return;
      const desc=card.querySelector('.desc');
      const category=card.querySelector('.category');
      const status=card.querySelector('.status');
      const duration=card.querySelector('.light-meta span');
      const button=card.querySelector('.card-btn');
      const firstPlan=product.plans?.[0];
      if(desc)desc.textContent=tr(product.description,'description',id);
      if(category)category.textContent=tr(product.category,'category',id);
      if(status)status.textContent=tr(Catalog.statusLabel(product.status),'status',id);
      if(duration)duration.textContent=firstPlan?tr(firstPlan.duration,'duration',id):(en?'Unavailable':'غير متوفر');
      if(button)button.innerHTML=(en?'View plans':'شوف الباقات')+' <span>'+(en?'→':'←')+'</span>';
      card.dataset.search=[
        product.name,tr(product.description,'description',id),tr(product.category,'category',id),
        ...(product.plans||[]).map(p=>tr(p.name||p.duration,'planName',id))
      ].join(' ').toLowerCase();
    });
    if(empty)empty.textContent=en?'No matching results.':'مفيش نتيجة مطابقة.';
  }
  function refreshLocalizedCategories(){
    cards.forEach(card=>{
      const el=card.querySelector('.category');
      if(el)el.textContent=categoryLabel(card.dataset.category||'');
    });
    drawFilters();
  }
  document.addEventListener('masterstore:localechange',()=>{
    refreshLocalizedPrices();
    refreshLocalizedCategories();
    refreshLocalizedCards();
    apply();
  });
  let selected='الكل';

  function apply(){
    const q=(search?.value||'').trim().toLowerCase();
    let visible=0;
    cards.forEach(card=>{
      const categoryMatch=selected==='الكل'||card.dataset.category===selected;
      const text=(card.dataset.search||card.textContent||'').toLowerCase();
      const matches=categoryMatch&&(!q||text.includes(q));
      card.hidden=!matches;
      if(matches)visible++;
    });
    if(empty)empty.style.display=visible?'none':'block';
  }

  function drawFilters(){
    filters.innerHTML=categories.map(c=>'<button class="filter '+(c===selected?'active':'')+'" type="button" data-cat="'+c+'" aria-pressed="'+(c===selected?'true':'false')+'">'+categoryLabel(c)+'</button>').join('');
    filters.querySelectorAll('button').forEach(btn=>{
      btn.addEventListener('click',()=>{
        selected=btn.dataset.cat;
        drawFilters();
        apply();
      });
    });
  }

  search?.addEventListener('input',apply);
  drawFilters();
  apply();
  refreshBrandLogos();
  refreshLocalizedCategories();
  refreshLocalizedCards();
  refreshLocalizedPrices();
})();