(function(){
  'use strict';
  const grid=document.getElementById('grid');
  const filters=document.getElementById('filters');
  const search=document.getElementById('search');
  const empty=document.getElementById('empty');
  const menu=document.querySelector('.menu');
  let selected='الكل';

  const categories=['الكل',...categoryOrder.filter(c=>products.some(p=>p.category===c))];

  function icon(p){
    const fallback=(p.name||'M').split(/\s+/).map(x=>x[0]).join('').slice(0,2);
    return '<span class="product-logo">'+
      (p.logo?'<img src="logos/'+encodeURIComponent(p.logo)+'.svg" alt="" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'grid\'">':'')+
      '<span class="logo-fallback"'+(p.logo?'':' style="display:grid"')+'>'+fallback+'</span></span>';
  }

  function statusClass(s){
    return s==='available'?'ok':s==='soon'?'soon':'out';
  }

  function drawFilters(){
    filters.innerHTML=categories.map(c=>'<button class="filter '+(c===selected?'active':'')+'" type="button" data-cat="'+c+'">'+c+'</button>').join('');
    filters.querySelectorAll('button').forEach(btn=>{
      btn.onclick=()=>{selected=btn.dataset.cat;drawFilters();draw();};
    });
  }

  function draw(){
    const q=(search?.value||'').trim().toLowerCase();
    const list=products.filter(p=>{
      const cat=selected==='الكل'||p.category===selected;
      const hay=[p.name,p.category,p.description,statusLabel(p.status),...(p.plans||[]).map(x=>[x.name,x.duration,x.price].join(' '))].join(' ').toLowerCase();
      return cat&&(!q||hay.includes(q));
    }).sort((a,b)=>{
      const rank={available:0,soon:1,out:2};
      return (rank[a.status]??9)-(rank[b.status]??9);
    });

    grid.innerHTML=list.map(p=>{
      const disabled=p.status!=='available';
      return '<article class="product-card">'+
        '<div class="card-top">'+icon(p)+'<span class="status '+statusClass(p.status)+'">'+statusLabel(p.status)+'</span></div>'+
        '<h3>'+MasterStore.escapeHtml(p.name)+'</h3>'+
        '<p class="category">'+MasterStore.escapeHtml(p.category)+'</p>'+
        '<p class="desc">'+MasterStore.escapeHtml(p.description||'')+'</p>'+
        '<div class="card-bottom"><div><small>'+(p.plans?.length>1?p.plans.length+' باقات':(p.plans?.[0]?.duration||'—'))+'</small><strong>'+startingPrice(p)+'</strong></div>'+
        (disabled?'<button class="card-btn disabled" type="button" disabled>'+statusLabel(p.status)+'</button>':'<a class="card-btn" href="product.html?id='+encodeURIComponent(p.id)+'">التفاصيل والطلب</a>')+
        '</div></article>';
    }).join('');
    empty.style.display=list.length?'none':'block';
  }

  if(menu){
    const nav=document.querySelector('.topbar nav');
    menu.onclick=()=>nav.classList.toggle('open');
    nav.querySelectorAll('a').forEach(a=>a.onclick=()=>nav.classList.remove('open'));
  }
  search?.addEventListener('input',draw);
  drawFilters();
  draw();
})();