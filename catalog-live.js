(function(){
'use strict';
window.MasterCatalogReady=(async()=>{
 if(!window.MasterCatalog)return;
 try{
 const response=await fetch('https://gmysuhoebcapigdidnnv.supabase.co/rest/v1/master_store_plans?select=product_id,plan_index,price_piasters,available,max_quantity,admin_overridden',{headers:{apikey:'sb_publishable_zHcukZ2xWD8RqrYu3i-Wzw_Kd4c8x-h'},cache:'no-store',signal:AbortSignal.timeout(5000)});
 if(!response.ok)throw Error('catalog');
 const rows=await response.json();
 for(const row of rows){
 const p=window.MasterCatalog.getProduct(row.product_id),plan=p?.plans?.[row.plan_index];if(!plan)continue;
 plan.available=row.available;plan.max_quantity=row.max_quantity;
 if(row.admin_overridden){plan.price=row.price_piasters/100;delete plan.basePriceUSD;delete plan.marketPrices;plan.manualPrice=true;}
 }
 for(const p of window.MasterCatalog.products){const plans=p.plans||[];if(plans.some(x=>x.available===true))p.status='available';else if(plans.some(x=>x.available===false)&&p.status!=='soon')p.status='out';}
 }catch{/* Cached catalogue stays usable; checkout always rechecks server prices. */}
})();
})();
