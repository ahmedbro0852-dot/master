-- New 18-month personal-email offer; keep retired plan indices 0/1 unavailable.
insert into public.master_store_plans(product_id,plan_index,product_name,plan_name,duration,price_piasters,available,max_quantity,admin_overridden)
values ('gemini-pro',4,'Gemini Pro','Pro — 18 شهرًا على إيميلك — ضمان شهر','18 شهر',30000,true,5,false)
on conflict(product_id,plan_index) do nothing;
