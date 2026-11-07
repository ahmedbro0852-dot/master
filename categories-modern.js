/* MASTER STORE · live category counts & real product logos */
(function(){
 'use strict';
 const en=()=>window.MasterLocale?.getState?.()?.language==='en'||document.documentElement.lang==='en';
 const all=()=>window.MasterCatalog?.products||[];
 const tagsFor=p=>p.categories||[p.category];
 const matches=(p,name)=>{
  const tags=tagsFor(p);
  return tags.includes(name)||(window.MasterCatalog?.categoryGroups?.[name]||[]).some(sub=>tags.includes(sub));
 };
 function logoFor(product){
  const direct=String(product.logoUrl||'');
  if(/^logos\/[\w.%-]+\.svg(?:\?[\w.=%-]+)?$/.test(direct))return '/'+direct;
  const name=String(product.logo||'');
  if(/^[a-z\d_-]+$/i.test(name))return '/logos/'+name+'.svg';
  return '';
 }
 function render(){
  const products=all().filter(p=>p&&!p.redirectTo&&p.status!=='soon'&&(p.plans||[]).some(plan=>!plan.hidden));
  document.querySelectorAll('[data-category-group]').forEach(card=>{
   const group=card.dataset.categoryGroup;
   const matching=products.filter(p=>matches(p,group));
   const counter=card.querySelector('[data-category-count]');
   if(counter)counter.textContent=matching.length?(en()?matching.length+' services':matching.length+' خدمة'):(en()?'Browse plans':'تصفح الباقات');
   const preview=card.querySelector('.cat-preview');
   if(!preview)return;
   preview.replaceChildren();
   const used=new Set();
   matching.forEach(product=>{
    if(preview.children.length>=3)return;
    const logo=logoFor(product);
    if(!logo||used.has(logo))return;
    used.add(logo);
    const img=document.createElement('img');
    img.src=logo;img.alt='';img.width=27;img.height=27;img.loading='lazy';img.decoding='async';
    img.addEventListener('error',()=>img.remove(),{once:true});
    preview.append(img);
   });
  });
 }
 const ready=window.MasterCatalogReady;
 if(ready&&typeof ready.then==='function')ready.then(render).catch(render);
 else render();
 document.addEventListener('masterstore:localechange',render);
})();
