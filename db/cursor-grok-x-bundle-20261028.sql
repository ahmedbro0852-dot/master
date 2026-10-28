-- New unified Premium bundle; preserve any later admin edits.
insert into public.master_store_plans(product_id,plan_index,product_name,plan_name,duration,price_piasters,available,max_quantity,admin_overridden)
values ('cursor-grok-x-bundle',0,'Cursor Pro + Grok + X Premium+','Premium — شهر على إيميلك','1 شهر',100000,true,5,false)
on conflict(product_id,plan_index) do nothing;
