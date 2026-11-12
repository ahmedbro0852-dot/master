(async function(){
'use strict';
await window.MasterCatalogReady;
const SEO=window.MasterSEO;if(!SEO)return;
const catalog=window.MasterCatalog,id=new URLSearchParams(location.search).get('id')||document.body.dataset.productId;
const isProduct=location.pathname.endsWith('/product.html')||!!document.body.dataset.productId;
function meta(key,value,property){let el=document.head.querySelector('meta['+(property?'property':'name')+'="'+key+'"]');if(!el){el=document.createElement('meta');el.setAttribute(property?'property':'name',key);document.head.appendChild(el);}el.content=value;}
function canonical(url){let el=document.head.querySelector('link[rel="canonical"]');if(!el){el=document.createElement('link');el.rel='canonical';document.head.appendChild(el);}el.href=url;meta('og:url',url,true);}
function schema(data){let el=document.getElementById('master-seo-data');if(!el){el=document.createElement('script');el.id='master-seo-data';el.type='application/ld+json';document.head.appendChild(el);}el.textContent=JSON.stringify(data);}
if(isProduct){
 const p=catalog?.getProduct(id);if(!p){meta('robots','noindex,follow');return;}
 // The product renderer handles aliases; keep their canonical on the destination.
 const destination=p.redirectByPlan?.[new URLSearchParams(location.search).get('plan')||'0']||p.redirectTo;
 if(destination){const target=catalog.getProduct(destination.id);if(target)canonical(SEO.productUrl(target));return;}
 canonical(SEO.productUrl(p));meta('robots',SEO.indexable(p)?'index,follow':'noindex,follow');
 meta('og:image',SEO.image(p),true);meta('og:locale','ar_EG',true);meta('twitter:card','summary');
 // Only use server-confirmed prices, never guessed prices or fabricated reviews.
 schema(SEO.productGraph(p,catalog.categoryGroups,window.MasterCatalogPriceRows));
}else if(location.pathname==='/'||location.pathname.endsWith('/index.html')){
 canonical(SEO.origin+'/');schema(SEO.homeGraph);
}
})();
