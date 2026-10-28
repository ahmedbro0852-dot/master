-- US$24 at the storefront's fixed 56 EGP/USD conversion; preserve later admin edits.
insert into public.master_store_plans(product_id,plan_index,product_name,plan_name,duration,price_piasters,available,max_quantity,admin_overridden)
values ('freepik',2,'Freepik','Premium — شهر · 20 ألف كريدت · على إيميلك','1 شهر',134400,true,5,false)
on conflict(product_id,plan_index) do nothing;
