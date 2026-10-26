-- Add only the requested one-month ChatGPT Go ready-account plan.
insert into public.master_store_plans(product_id,plan_index,product_name,plan_name,duration,price_piasters,available,max_quantity,admin_overridden)
values('chatgpt-go',0,'ChatGPT Go','ChatGPT Go — حساب جاهز','1 شهر',32000,true,5,false)
on conflict(product_id,plan_index) do nothing;
