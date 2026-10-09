(function(){
'use strict';
const origin='https://master-pi-six.vercel.app';
const catalog=window.MasterCatalog;
const id=new URLSearchParams(location.search).get('id');
const p=catalog&&catalog.getProduct(id);
const isProduct=location.pathname.endsWith('/product.html');
function meta(key,value,property){let el=document.head.querySelector('meta['+(property?'property':'name')+'="'+key+'"]');if(!el){el=document.createElement('meta');el.setAttribute(property?'property':'name',key);document.head.appendChild(el);}el.content=value;}
function canonical(url){let el=document.head.querySelector('link[rel="canonical"]');if(!el){el=document.createElement('link');el.rel='canonical';document.head.appendChild(el);}el.href=url;meta('og:url',url,true);}
function schema(data){const el=document.createElement('script');el.type='application/ld+json';el.textContent=JSON.stringify(data);document.head.appendChild(el);}
if(isProduct){
 if(!p){meta('robots','noindex,follow');return;}
 const url=origin+'/product.html?id='+encodeURIComponent(p.id);
 canonical(url);
 meta('og:image',new URL(p.logoUrl||'master-store-logo.png',origin+'/').href,true);
 schema({'@context':'https://schema.org','@type':'Product',name:p.name,description:p.description,url,image:new URL(p.logoUrl||'master-store-logo.png',origin+'/').href});
}else{
 canonical(origin+'/');
 schema({'@context':'https://schema.org','@type':'WebSite',name:'MASTER STORE',alternateName:'ماستر ستور',url:origin+'/'});
 schema({'@context':'https://schema.org','@type':'Organization',name:'MASTER STORE',url:origin+'/',logo:origin+'/master-store-logo.png',sameAs:['https://www.facebook.com/share/19XBCdMAm5/']});
}
})();
