(function(){
'use strict';
function normalize(s){return String(s??'').toLowerCase().normalize('NFKD').replace(/[٠-٩]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))).replace(/(?<=\d)[,٬](?=\d)/g,'').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g,'').replace(/[إأآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/ة/g,'ه').replace(/[^a-z0-9\u0600-\u06FF]+/g,' ').trim();}
const popular=['chatgpt-plus','chatgpt-go','grok','gemini-pro','capcut-pro','canva-pro','coursera','elevenlabs','cursor-pro','lovable-pro','spotify'];
const priority=new Map(popular.map((id,i)=>[id,popular.length-i]));
function matches(product,q){const words=normalize(q).split(' ').filter(Boolean);const hay=normalize([product.name,product.id,product.search,product.category].join(' '));return words.every(word=>hay.includes(word));}
function score(product,q){const query=normalize(q),name=normalize(product.name),rank=priority.get(product.id)||0;if(!query)return rank;if(name===query)return 1000+rank;if(name.startsWith(query))return 600+rank;if(name.split(' ').some(w=>w.startsWith(query)))return 420+rank;if(name.includes(query))return 300+rank;return 100+rank;}
function suggest(products,q,limit=7){return products.filter(p=>p.href&&p.status!=='soon'&&p.status!=='out'&&matches(p,q)).sort((a,b)=>score(b,q)-score(a,q)||a.name.localeCompare(b.name)).slice(0,limit);}
window.MasterStoreSearch={normalize,matches,score,suggest};
if(typeof document==='undefined')return;
Promise.resolve(window.MasterCatalogReady).then(()=>{
 const catalog=document.getElementById('search'),hero=document.getElementById('heroCatalogSearch'),grid=document.getElementById('grid');
 if(!catalog||!hero||!grid)return;
 const groups=[...document.querySelectorAll('[data-master-search]')];
 const isEn=()=>document.documentElement.lang==='en'||window.MasterLocale?.getState?.().language==='en';
 const t=(ar,en)=>isEn()?en:ar;
 let opened=null,active=-1;
 const candidates=()=>[...grid.querySelectorAll('.product-card')].map(card=>{
  const id=card.dataset.productId,p=window.MasterCatalog?.getProduct?.(id),link=card.querySelector('a.card-btn[href]');
  return {id,name:p?.name||card.querySelector('.service-name')?.textContent||id,category:p?.category||'',search:card.dataset.search||'',href:link?.getAttribute('href')||'',status:p?.status||'out',logo:card.querySelector('.product-logo img')?.getAttribute('src')||''};
 }).filter(p=>p.id&&p.href&&!p.href.startsWith('javascript:'));
 function options(g){return [...g.querySelectorAll('.master-suggest-option')];}
 function close(){
  for(const g of groups){const input=g.querySelector('input[type=search]'),panel=g.querySelector('.master-search-suggestions');panel.hidden=true;panel.replaceChildren();input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');}
  opened=null;active=-1;
 }
 function highlight(g,index){
  const nodes=options(g);if(!nodes.length)return;
  active=(index+nodes.length)%nodes.length;
  nodes.forEach((node,i)=>{node.classList.toggle('active',i===active);node.setAttribute('aria-selected',String(i===active));});
  g.querySelector('input[type=search]').setAttribute('aria-activedescendant',nodes[active].id);
  nodes[active].scrollIntoView?.({block:'nearest'});
 }
 function show(g){
  const input=g.querySelector('input[type=search]'),panel=g.querySelector('.master-search-suggestions'),list=suggest(candidates(),input.value);
  close();opened=g;
  const heading=document.createElement('div');heading.className='master-suggest-heading';heading.textContent=input.value.trim()?t('اقتراحات مناسبة','Suggested services'):t('أشهر الخدمات','Popular services');panel.append(heading);
  if(!list.length){const msg=document.createElement('p');msg.className='master-suggest-empty';msg.textContent=t('مفيش نتائج مطابقة. جرّب اسمًا مختلفًا.','No matching services. Try another name.');panel.append(msg);}
  for(let i=0;i<list.length;i++){
   const p=list[i],link=document.createElement('a');link.href=p.href;link.className='master-suggest-option';link.id=g.dataset.masterSearch+'-option-'+i;link.setAttribute('role','option');link.setAttribute('aria-selected','false');
   const icon=document.createElement('span');icon.className='master-suggest-logo';
   if(p.logo){const img=document.createElement('img');img.src=p.logo;img.alt='';img.width=29;img.height=29;img.loading='lazy';img.addEventListener('error',()=>{img.remove();icon.textContent='⌕';});icon.append(img);}else icon.textContent='⌕';
   const body=document.createElement('span');body.className='master-suggest-text';
   const title=document.createElement('strong');title.textContent=p.name;
   const cat=document.createElement('small');cat.textContent=p.category||t('اشتراك رقمي','Digital subscription');
   body.append(title,cat);
   const arrow=document.createElement('span');arrow.className='master-suggest-arrow';arrow.textContent='↗';
   link.append(icon,body,arrow);panel.append(link);
  }
  panel.hidden=false;input.setAttribute('aria-expanded','true');
 }
 function setQuery(value,source){
  const q=String(value||'').slice(0,120);
  if(source!==hero)hero.value=q;
  if(source!==catalog)catalog.value=q;
  const clear=hero.closest('[data-master-search]')?.querySelector('[data-search-clear]');if(clear)clear.hidden=!q;
  if(source!==catalog)catalog.dispatchEvent(new Event('input',{bubbles:true}));
 }
 function jump(){
  const all=document.querySelector('#filters .filter[data-cat="الكل"]');if(all&&!all.classList.contains('active'))all.click();
  for(const key of ['availableOnly','favoritesOnly']){const input=document.getElementById(key);if(input?.checked){input.checked=false;input.dispatchEvent(new Event('change',{bubbles:true}));}}
  document.getElementById('products')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
 }
 for(const g of groups){
  const input=g.querySelector('input[type=search]'),panel=g.querySelector('.master-search-suggestions');
  const submit=g.querySelector('[data-search-submit]'),clear=g.querySelector('[data-search-clear]');
  input.setAttribute('role','combobox');input.setAttribute('aria-autocomplete','list');input.setAttribute('aria-haspopup','listbox');input.setAttribute('aria-controls',panel.id);input.setAttribute('aria-expanded','false');
  input.addEventListener('input',()=>{setQuery(input.value,input);show(g);});
  input.addEventListener('focus',()=>show(g));
  g.addEventListener('focusout',event=>{if(!g.contains(event.relatedTarget))close();});
  input.addEventListener('keydown',event=>{
   if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();if(opened!==g)show(g);highlight(g,event.key==='ArrowDown'?active+1:(active<0?0:active)-1);}
   else if(event.key==='Enter'){event.preventDefault();const link=opened===g&&active>=0?options(g)[active]:null;if(link)link.click();else{setQuery(input.value,input);close();jump();}}
   else if(event.key==='Escape'&&opened===g){event.preventDefault();close();}
  });
  submit?.addEventListener('click',()=>{setQuery(input.value,input);close();jump();});
  clear?.addEventListener('click',()=>{setQuery('',null);close();input.focus();});
 }
 document.querySelectorAll('[data-search-chip]').forEach(chip=>chip.addEventListener('click',()=>{setQuery(chip.dataset.searchChip||'',null);close();jump();}));
 document.addEventListener('masterstore:searchreset',()=>{setQuery('',null);close();});
 document.addEventListener('pointerdown',event=>{if(!event.target.closest('[data-master-search]'))close();});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&opened)close();});
 document.addEventListener('masterstore:localechange',()=>{if(opened)show(opened);});
 if(catalog.value.trim())setQuery(catalog.value,null);
}).catch(err=>console.warn('Service search suggestions unavailable:',err?.message||err));
})();
