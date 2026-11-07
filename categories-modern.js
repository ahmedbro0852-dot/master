/* MASTER STORE · category artwork from real catalogue logos (no fabricated listings) */
(function(){
 'use strict';
 const locale=()=>window.MasterLocale?.getState?.()?.language==='en'||document.documentElement.lang==='en';
 const groups=()=>window.MasterCatalog?.categoryGroups||{};
 const all=()=>window.MasterCatalog?.products||[];
 const tagsFor=p=>p.categories||[p.category];
 const match=(p,category)=>tagsFor(p).includes(category)||(groups()[category]||[]).some(sub=>tagsFor(p).includes(sub));
 const prefer={
  'محادثة ومساعد ذكي':['chatgpt-plus','gemini-pro','grok','supergrok-coursera-bundle'],
  'الفيديو':['capcut-pro','kling','heygen','runway'],
  'الصور والتصميم':['canva-pro','picsart','leonardo','autodesk-apps'],
  'الصوت':['elevenlabs','murf','suno','elevenlabs-creator'],
  'البرمجة والمواقع':['cursor-pro','lovable-pro','vercel-pro','bolt'],
  'الكتابة والبحث':['perplexity-pro','quillbot','turnitin','grammarly'],
  'التعليم':['coursera','duolingo','skillshare'],
  'العمل والإنتاجية':['notion','zoom','gamma-plus','windows-11-pro'],
  'الترفيه':['discord-nitro','spotify','shahid','iptv'],
  'الحماية والاتصالات':['nordvpn','surfshark','malwarebytes','truecaller']
 };
 function logoFor(p){
  const direct=String(p.logoUrl||'');
  if(/^logos\/[a-z0-9_.%-]+\.svg(?:\?[a-z0-9_.=%-]+)?$/i.test(direct))return '/'+direct;
  const id=String(p.logo||'');
  return /^[a-z0-9_-]+$/i.test(id)?'/logos/'+id+'.svg':'';
 }
 const normalize=str=>String(str||'').toLowerCase().normalize('NFKD').replace(/[\u064b-\u065f\u0670]/g,'').replace(/[إأآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/\s+/g,' ').trim();
 const icons=document.querySelectorAll('.cat-tile');
 let prepared=false;
 function addFallback(art,card){
  if(art.querySelector('.cat-art-fallback'))return;
  const fallback=document.createElement('span');fallback.className='cat-art-fallback';
  const svg=card.querySelector('.cat-symbol svg');
  if(svg)fallback.append(svg.cloneNode(true));
  art.append(fallback);
 }
 function decorate(card,items){
  let art=card.querySelector('.cat-art');
  if(!art){
   art=document.createElement('span');art.className='cat-art';
   const top=card.querySelector('.cat-tile-top');
   top?.insertAdjacentElement('afterend',art);
  }
  art.replaceChildren();
  const order=prefer[card.dataset.categoryGroup]||[];
  const ranked=[...items].sort((a,b)=>{
   const ia=order.indexOf(a.id),ib=order.indexOf(b.id);
   return (ia<0?999:ia)-(ib<0?999);
  });
  const sources=new Set();
  const pics=ranked.map(p=>({p,url:logoFor(p)})).filter(o=>o.url&&!sources.has(o.url)&&sources.add(o.url)).slice(0,3);
  if(!pics.length){addFallback(art,card);return;}
  const stack=document.createElement('span');stack.className='cat-art-logos';
  pics.forEach(({p,url})=>{
   const frame=document.createElement('span');frame.className='cat-art-logo';
   const img=document.createElement('img');
   img.src=url;img.alt='';img.loading='lazy';img.decoding='async';img.width=80;img.height=80;
   img.addEventListener('error',()=>{frame.remove();if(!stack.children.length)addFallback(art,card);},{once:true});
   frame.append(img);stack.append(frame);
  });
  art.append(stack);
 }
 function render(){
  const products=all().filter(p=>p&&!p.redirectTo&&p.status!=='soon'&&(p.plans||[]).some(plan=>!plan.hidden));
  icons.forEach(card=>{
   const group=card.dataset.categoryGroup;
   const items=products.filter(p=>match(p,group));
   const counter=card.querySelector('[data-category-count]');
   if(counter)counter.textContent=items.length?(locale()?items.length+' services':items.length+' خدمة'):(locale()?'Explore plans':'استكشف الباقات');
   card.dataset.categorySearch=normalize(card.textContent+' '+items.map(x=>x.name+' '+(x.nameEn||'')).join(' '));
   if(!prepared)decorate(card,items);
  });
  prepared=true;
  const total=document.querySelector('[data-cat-total]');
  if(total)total.textContent=products.length?(locale()?products.length+'+ subscriptions':products.length+'+ اشتراك'):'MASTER STORE';
 }
 const field=document.getElementById('categorySearch');
 const empty=document.getElementById('categoryEmptyResult');
 function filter(){
  const query=normalize(field?.value);
  let shown=0;
  icons.forEach(card=>{
   const visible=!query||card.dataset.categorySearch?.includes(query);
   card.hidden=!visible;
   if(visible)shown++;
  });
  if(empty)empty.hidden=!!shown;
 }
 field?.addEventListener('input',filter);
 document.addEventListener('masterstore:localechange',()=>{render();filter();});
 const ready=window.MasterCatalogReady;
 if(ready&&typeof ready.then==='function')ready.then(()=>{render();filter();}).catch(()=>{render();filter();});
 else {render();filter();}
})();
