(function(){
'use strict';
const keys={favorites:'master-favorites-v1',recent:'master-recent-v1'},memory={favorites:[],recent:[]};
function read(kind){try{const stored=localStorage.getItem(keys[kind]);const value=stored===null?memory[kind]:JSON.parse(stored);return Array.isArray(value)?[...new Set(value.filter(x=>typeof x==='string'&&/^[a-z0-9-]{1,80}$/.test(x)))].slice(0,kind==='recent'?6:100):[];}catch{return memory[kind];}}
function write(kind,value){memory[kind]=value;try{localStorage.setItem(keys[kind],JSON.stringify(value));}catch{}document.dispatchEvent(new CustomEvent('masterstore:shoppingchange',{detail:{kind}}));}
const t=(ar,en)=>window.MasterLocale?.getState().language==='en'?en:ar;
function button(product){const saved=read('favorites').includes(product.id);return '<button type="button" class="favorite-service" data-favorite="'+product.id+'" aria-pressed="'+saved+'" aria-label="'+window.MasterStore.escapeHtml(t(saved?'إزالة من المفضلة: ':'إضافة للمفضلة: ',saved?'Remove from favorites: ':'Save to favorites: ')+product.name)+'"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg></button>';}
function refresh(){document.querySelectorAll('[data-favorite]').forEach(el=>{const p=window.MasterCatalog?.getProduct(el.dataset.favorite);if(p){const saved=read('favorites').includes(p.id);el.setAttribute('aria-pressed',String(saved));el.setAttribute('aria-label',t(saved?'إزالة من المفضلة: ':'إضافة للمفضلة: ',saved?'Remove from favorites: ':'Save to favorites: ')+p.name);}});}
document.addEventListener('click',e=>{const el=e.target.closest('[data-favorite]');if(!el||!window.MasterCatalog?.getProduct(el.dataset.favorite))return;const ids=read('favorites'),id=el.dataset.favorite;write('favorites',ids.includes(id)?ids.filter(x=>x!==id):[id,...ids].slice(0,100));refresh();});
window.addEventListener('storage',e=>{for(const kind of Object.keys(keys))if(e.key===keys[kind]||e.key===null){document.dispatchEvent(new CustomEvent('masterstore:shoppingchange',{detail:{kind}}));refresh();}});
document.addEventListener('masterstore:localechange',refresh);
window.MasterShopping=Object.freeze({read,button,view(id){if(window.MasterCatalog?.getProduct(id))write('recent',[id,...read('recent').filter(x=>x!==id)].slice(0,6));},clearRecent(){write('recent',[]);}});
})();
