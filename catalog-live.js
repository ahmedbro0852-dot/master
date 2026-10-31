(function(){
'use strict';
window.MasterCatalogPriceRows=null;
window.MasterCatalogReady=(async()=>{
 if(!window.MasterCatalog)return;
 try{
 const response=await fetch('https://gmysuhoebcapigdidnnv.supabase.co/rest/v1/master_store_plans?select=product_id,plan_index,price_piasters,available,max_quantity,admin_overridden,previous_price_piasters',{headers:{apikey:'sb_publishable_zHcukZ2xWD8RqrYu3i-Wzw_Kd4c8x-h'},cache:'no-store',signal:AbortSignal.timeout(5000)});
 if(!response.ok)throw Error('catalog');
 const rows=await response.json();
 if(!Array.isArray(rows))throw Error('catalog');
 window.MasterCatalogPriceRows=rows;
 for(const row of rows){
 const p=window.MasterCatalog.getProduct(row.product_id),plan=p?.plans?.[row.plan_index];if(!plan)continue;
 plan.available=row.available;plan.max_quantity=row.max_quantity;
 if(Object.prototype.hasOwnProperty.call(row,'previous_price_piasters')){plan.storePriceHistoryKnown=true;if(Number(row.previous_price_piasters)>0)plan.previousStorePrice=Number(row.previous_price_piasters)/100;else delete plan.previousStorePrice;}
 if(row.admin_overridden){plan.price=row.price_piasters/100;delete plan.basePriceUSD;delete plan.marketPrices;plan.manualPrice=true;}
 }
 for(const p of window.MasterCatalog.products){for(const plan of p.plans||[]){if(plan.offerEndsAt&&Date.now()>=Date.parse(plan.offerEndsAt))plan.available=false;}const plans=p.plans||[];if(plans.some(x=>x.available===true))p.status='available';else if(plans.some(x=>x.available===false)&&p.status!=='soon')p.status='out';}
 }catch{/* Cached catalogue stays usable; checkout always rechecks server prices. */}
 for(const p of window.MasterCatalog.products){for(const plan of p.plans||[]){if(plan.offerEndsAt&&Date.now()>=Date.parse(plan.offerEndsAt))plan.available=false;}}
 applyExpiredPromotions();
 const next=window.MasterCatalog.products.flatMap(p=>p.plans||[]).map(p=>Date.parse(p.promotionEndsAt)).filter(t=>t>Date.now()).sort((a,b)=>a-b)[0];
 if(next)setTimeout(()=>{applyExpiredPromotions();document.dispatchEvent(new CustomEvent('masterstore:localechange'));},Math.min(next-Date.now()+100,2147483647));
})();
function applyExpiredPromotions(){
 for(const p of window.MasterCatalog.products)for(const plan of p.plans||[]){
  if(plan.promotionEndsAt&&Date.now()>=Date.parse(plan.promotionEndsAt)&&plan.price===430){
   plan.price=plan.regularPrice;plan.previousStorePrice=plan.regularPreviousStorePrice;plan.oldPrice=plan.regularPreviousStorePrice;
  }
 }
}
})();
