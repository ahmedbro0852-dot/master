-- Append Plus at stable index 2; retries must not overwrite prices or restart launch dates.
insert into public.master_store_plans(product_id,plan_index,product_name,plan_name,duration,price_piasters,available,max_quantity,admin_overridden)
values ('higgsfield-pro',2,'Higgsfield AI','Plus — شهر — 1,200 كريدت — حساب جاهز','1 شهر',156800,true,5,false)
on conflict(product_id,plan_index) do nothing;
