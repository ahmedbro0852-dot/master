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
 const {normalize,suggest}=window.MasterStoreSearch;
 const icons=document.querySelectorAll('.cat-tile');
 let prepared=false,serviceCandidates=[];
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
   return (ia<0?999:ia)-(ib<0?999:ib);
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
  serviceCandidates=products.filter(product=>product.status==='available').map(product=>({
   name:product.name,
   id:product.id,
   search:[product.nameEn,product.category,...(product.categories||[])].filter(Boolean).join(' '),
   href:'/products/'+encodeURIComponent(product.id)+'.html',
   logo:logoFor(product)
  }));
  icons.forEach(card=>{
   const group=card.dataset.categoryGroup;
   const items=products.filter(p=>match(p,group));
   const counter=card.querySelector('[data-category-count]');
   if(counter)counter.textContent=items.length?(locale()?items.length+' services':items.length+' خدمة'):(locale()?'Explore plans':'استكشف الباقات');
   card.dataset.categorySearch=normalize(card.textContent+' '+items.map(x=>x.name+' '+(x.nameEn||'')).join(' '));
   const title=card.querySelector('.cat-copy h3 '+(locale()?'.cat-en':'.cat-ar'));
   if(title)card.setAttribute('aria-label',title.textContent.trim());
   if(!prepared)decorate(card,items);
  });
  prepared=true;
  const total=document.querySelector('[data-cat-total]');
  if(total)total.textContent=products.length?(locale()?products.length+'+ subscriptions':products.length+'+ اشتراك'):'MASTER STORE';
 }
 const field=document.getElementById('categorySearch');
 const empty=document.getElementById('categoryEmptyResult');
 const clear=document.getElementById('clearCategorySearch');
 const count=document.getElementById('categoryResultCount');
 const services=document.getElementById('categoryServiceResults');
 const serviceList=document.getElementById('categoryServiceList');
 function clearSearch(){
  field.value='';filter();field.focus();
 }
 function serviceLink(service){
  const link=document.createElement('a');
  link.href=service.href;
  if(service.logo){
   const image=document.createElement('img');
   image.src=service.logo;image.alt='';image.width=32;image.height=32;
   image.addEventListener('error',()=>image.remove(),{once:true});
   link.append(image);
  }
  const name=document.createElement('bdi');
  name.textContent=service.name;
  link.append(name);
  const item=document.createElement('li');
  item.append(link);
  return item;
 }
 function filter(){
  const query=normalize(field.value);
  const words=query.split(' ').filter(Boolean);
  let shown=0;
  icons.forEach(card=>{
   const visible=words.every(word=>card.dataset.categorySearch?.includes(word));
   card.hidden=!visible;
   if(visible)shown++;
  });
  const matches=query?suggest(serviceCandidates,query,serviceCandidates.length):[];
  const displayed=matches.slice(0,8);
  serviceList.replaceChildren(...displayed.map(serviceLink));
  services.hidden=!matches.length;
  clear.hidden=!field.value;
  empty.hidden=!query||!!(shown||matches.length);
  const serviceCount=matches.length>displayed.length?displayed.length+' / '+matches.length:String(matches.length);
  count.textContent=query?(locale()?'Categories: '+shown+' · Matching subscriptions: '+serviceCount:'الأقسام: '+shown+' · الاشتراكات المطابقة: '+serviceCount):'';
  field.placeholder=locale()?'Search categories or subscriptions…':'ابحث عن قسم أو اشتراك...';
  field.setAttribute('aria-label',locale()?'Search categories and subscriptions':'البحث في الأقسام والاشتراكات');
 }
 field.addEventListener('input',filter);
 field.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&field.value){event.preventDefault();clearSearch();}
 });
 clear.addEventListener('click',clearSearch);
 document.addEventListener('masterstore:localechange',()=>{render();filter();});
 const ready=window.MasterCatalogReady;
 if(ready&&typeof ready.then==='function')ready.then(()=>{render();filter();}).catch(()=>{render();filter();});
 else {render();filter();}
})();
