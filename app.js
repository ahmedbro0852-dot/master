(function(){
  'use strict';
  const grid=document.getElementById('grid');
  const filters=document.getElementById('filters');
  const search=document.getElementById('search');
  const empty=document.getElementById('empty');
  const menu=document.querySelector('.menu');
  if(!grid||!filters)return;

  const cards=[...grid.querySelectorAll('.product-card')];
  const categories=['الكل',...new Set(cards.map(c=>c.dataset.category).filter(Boolean))];
  let selected='الكل';

  function apply(){
    const q=(search?.value||'').trim().toLowerCase();
    let visible=0;
    cards.forEach(card=>{
      const cat=selected==='الكل'||card.dataset.category===selected;
      const text=(card.dataset.search||card.textContent||'').toLowerCase();
      const ok=cat&&(!q||text.includes(q));
      card.style.display=ok?'flex':'none';
      if(ok)visible++;
    });
    if(empty)empty.style.display=visible?'none':'block';
  }

  function drawFilters(){
    filters.innerHTML=categories.map(c=>'<button class="filter '+(c===selected?'active':'')+'" type="button" data-cat="'+c+'">'+c+'</button>').join('');
    filters.querySelectorAll('button').forEach(btn=>{
      btn.addEventListener('click',()=>{selected=btn.dataset.cat;drawFilters();apply();});
    });
  }

  if(menu){
    const nav=document.querySelector('.topbar nav');
    if(nav){
      menu.addEventListener('click',()=>nav.classList.toggle('open'));
      nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
    }
  }
  search?.addEventListener('input',apply);
  drawFilters();
  apply();
})();