-- User replaced the ended 18-month Gemini offer on 2026-10-31.
update public.master_store_plans set available=false,admin_overridden=true,updated_at=now()
where product_id='gemini-pro' and plan_index in(0,1) and available=true;
insert into public.master_store_plans(product_id,plan_index,product_name,plan_name,duration,price_piasters,available,max_quantity,admin_overridden)
values
 ('gemini-pro',2,'Gemini Pro','Pro — دعوة عائلية — شهر على إيميلك','1 شهر',8000,true,5,false),
 ('gemini-pro',3,'Gemini Pro','Pro — تفعيل مباشر — 3 شهور على إيميلك','3 شهور',20000,true,5,false),
 ('google-ai-plus',0,'Google AI Plus','Plus — 6 شهور على إيميلك','6 شهور',15000,true,5,false),
 ('google-ai-plus',1,'Google AI Plus','Plus — 12 شهر على إيميلك','12 شهر',22000,true,5,false)
on conflict(product_id,plan_index) do nothing;
