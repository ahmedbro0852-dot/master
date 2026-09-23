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
  const categories=['الكل',...new Set(cards.map(c=>c.dataset.category).filter(Boolean))];
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
    filters.innerHTML=categories.map(c=>'<button class="filter '+(c===selected?'active':'')+'" type="button" data-cat="'+c+'" aria-pressed="'+(c===selected?'true':'false')+'">'+c+'</button>').join('');
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
})();