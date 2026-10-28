-- US$15 at the storefront's fixed 56 EGP/USD conversion; preserve later admin edits.
insert into public.master_store_plans(product_id,plan_index,product_name,plan_name,duration,price_piasters,available,max_quantity,admin_overridden)
values ('freepik',1,'Freepik','Essential — شهر على إيميلك الخاص','1 شهر',84000,true,5,false)
on conflict(product_id,plan_index) do nothing;
