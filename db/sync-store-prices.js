/* Generate the server wallet catalogue after each catalog.js price/availability edit. */
const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const root=path.resolve(__dirname,'..'),context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'catalog.js'),'utf8'),context);
const quote=value=>"'"+String(value).replaceAll("'","''")+"'";
const rows=context.window.MasterCatalog.products.flatMap(product=>(product.plans||[]).flatMap((plan,index)=>{
  if(!(Number(plan.price)>0))return [];
  return ['('+[quote(product.id),index,quote(product.name),quote(plan.name||''),quote(plan.duration||''),Math.round(Number(plan.price)*100),product.status==='available',product.id==='gamma-account'?1:5].join(',')+')'];
}));
const sql='-- Server wallet catalogue: integer EGP piastres. Apply after catalogue changes.\nupdate public.master_store_plans set available=false;\ninsert into public.master_store_plans(product_id,plan_index,product_name,plan_name,duration,price_piasters,available,max_quantity) values\n'+rows.join(',\n')+'\non conflict(product_id,plan_index) do update set product_name=excluded.product_name,plan_name=excluded.plan_name,duration=excluded.duration,price_piasters=excluded.price_piasters,available=excluded.available,max_quantity=excluded.max_quantity;\n';
fs.writeFileSync(path.join(__dirname,'20261010_store_prices.sql'),sql);console.log(rows.length+' server plans generated');
