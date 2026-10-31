-- Separate ready-account offer; preserve existing personal-email bundle and prices.
insert into public.master_store_plans(product_id,plan_index,product_name,plan_name,duration,price_piasters,available,max_quantity,admin_overridden)
values ('grok-cursor-premium',0,'Grok Premium + Cursor Premium','Premium — شهر — حساب جاهز — ضمان 28 يومًا','1 شهر',129800,true,5,false)
on conflict(product_id,plan_index) do nothing;
