(function(root){
'use strict';
const WEEK=7*24*60*60*1000;
function recent(value,now){const t=Date.parse(value);return Number.isFinite(t)&&t<=now&&now<t+WEEK;}
function entries(rows,catalog,now=Date.now()){
 return (rows||[]).flatMap(row=>{
  const product=catalog.getProduct(row.product_id),plan=product?.plans?.[row.plan_index];
  if(!row.available||!product||product.redirectTo||!plan||plan.hidden||plan.available===false||!Number.isFinite(Number(row.price_piasters))||Number(row.price_piasters)<=0)return [];
  if(plan.offerEndsAt&&now>=Date.parse(plan.offerEndsAt))return [];
  const discounted=recent(row.discounted_at,now)&&Number(row.previous_price_piasters)>Number(row.price_piasters);
  const added=recent(row.launched_at,now);
  if(!discounted&&!added)return [];
  return [{row,product,plan,discounted,added,stamp:Math.max(added?Date.parse(row.launched_at):0,discounted?Date.parse(row.discounted_at):0)}];
 }).sort((a,b)=>b.stamp-a.stamp||a.product.id.localeCompare(b.product.id)||a.row.plan_index-b.row.plan_index);
}
if(typeof module==='object'&&module.exports){module.exports={entries,recent,WEEK};return;}
const section=document.getElementById('freshOffers');if(!section)return;
const Store=root.MasterStore,Locale=root.MasterLocale;
let rows=null,busy=false,signature="";
function render(){
 const en=Locale?.getState().language==='en',text=(ar,english)=>en?english:ar,E=Store.escapeHtml;
 section.querySelector('h2').textContent=text('جديد العروض والتخفيضات','New arrivals & price drops');
 section.querySelector('.fresh-offers-note').textContent=text('أحدث الإضافات والتخفيضات خلال 7 أيام. مدة الظهور هنا لا تعني انتهاء السعر أو الاشتراك.','New plans and price drops from the last 7 days. Shelf visibility does not set the price or subscription expiry.');
 const items=entries(rows,root.MasterCatalog);
 section.hidden=!items.length;
 const next=JSON.stringify([en,Locale?.getState(),items.map(x=>[x.row,x.product.name])]);if(next===signature)return;signature=next;
 section.querySelector('.fresh-offers-grid').innerHTML=items.map(({row,product,plan,added,discounted})=>{
  const priced={...plan,price:Number(row.price_piasters)/100,manualPrice:true};
  delete priced.basePriceUSD;delete priced.currencyPrices;delete priced.marketPrices;
  const tr=(v,k)=>Locale?.catalogText(v,k,product.id)||v||'';
  const former={...priced,price:Number(row.previous_price_piasters)/100};
  return '<article class="fresh-offer"><div class="fresh-offer-top"><img src="'+E(product.logoUrl||(product.logo?'logos/'+encodeURIComponent(product.logo)+'.svg':'master-store-logo.png'))+'" alt="" width="48" height="48" loading="lazy"><div class="fresh-offer-badges">'+(added?'<span>'+text('جديد','New')+'</span>':'')+(discounted?'<span>'+text('انخفض السعر','Price drop')+'</span>':'')+'</div></div><h3 dir="auto">'+E(product.name)+'</h3><p>'+E(tr(plan.name,'planName'))+'</p><small>'+E(tr(plan.duration,'duration'))+'</small><div class="fresh-offer-price">'+(discounted?'<del>'+E(Store.planMoney(former))+'</del>':'')+'<strong>'+E(Store.planMoney(priced))+'</strong></div><a class="card-btn soft-btn" href="products/'+encodeURIComponent(product.id)+'.html?plan='+row.plan_index+'">'+text('تفاصيل الباقة','View plan')+'<span aria-hidden="true"> '+(en?'→':'←')+'</span></a></article>';
 }).join('');
}
async function refresh(){
 if(busy||document.hidden)return;busy=true;
 try{const response=await fetch('https://gmysuhoebcapigdidnnv.supabase.co/rest/v1/master_store_plans?select=product_id,plan_index,price_piasters,previous_price_piasters,available,launched_at,discounted_at',{headers:{apikey:'sb_publishable_zHcukZ2xWD8RqrYu3i-Wzw_Kd4c8x-h'},cache:'no-store',signal:AbortSignal.timeout(5000)});if(!response.ok)throw Error('catalog');const data=await response.json();if(!Array.isArray(data))throw Error('catalog');rows=data;}
 catch{rows=null;}finally{busy=false;render();}
}
Promise.resolve(root.MasterCatalogReady).then(()=>{refresh();setInterval(refresh,60000);setInterval(render,1000);});
document.addEventListener('masterstore:localechange',()=>{if(rows)render();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
})(typeof window==='undefined'?globalThis:window);
