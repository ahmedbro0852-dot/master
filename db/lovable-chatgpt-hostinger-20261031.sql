-- Three offers added by the user; preserve every existing price and stable plan index.
insert into public.master_store_plans(product_id,plan_index,product_name,plan_name,duration,price_piasters,available,max_quantity,admin_overridden)
values
 ('lovable-pro',4,'Lovable','Pro — 3 شهور — حساب خاص جاهز','3 شهور',105000,true,5,false),
 ('chatgpt-plus',3,'ChatGPT Plus','Plus — شهر — حساب خاص جاهز — ضمان 25 يومًا','1 شهر',78000,true,5,false),
 ('hostinger',0,'Hostinger Unlimited','Unlimited — سنة على إيميلك','12 شهر',140000,true,5,false)
on conflict(product_id,plan_index) do nothing;
