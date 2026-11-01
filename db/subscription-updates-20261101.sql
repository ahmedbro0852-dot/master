-- Confirmed commercial edits only. Keep stable indices, stock, campaign history and deadlines.
begin;
do $$
begin
  if not exists(select 1 from public.master_store_plans where product_id='chatgpt-plus' and plan_index=3 and price_piasters in (70000,65000))
     or not exists(select 1 from public.master_store_plans where product_id='chatgpt-go' and plan_index=0 and price_piasters in (32000,29000))
     or not exists(select 1 from public.master_store_plans where product_id='kling' and plan_index=1 and price_piasters=89600)
     or not exists(select 1 from public.master_store_plans where product_id='lovable-pro' and plan_index=3 and price_piasters=45000)
  then raise exception 'Live plan prices changed; review before applying subscription updates'; end if;
end $$;
update public.master_store_plans
set price_piasters=65000,plan_name='Plus — شهر — حساب خاص جاهز — ضمان شهر',admin_overridden=true
where product_id='chatgpt-plus' and plan_index=3
and (price_piasters<>65000 or plan_name<>'Plus — شهر — حساب خاص جاهز — ضمان شهر');
update public.master_store_plans set price_piasters=29000,admin_overridden=true
where product_id='chatgpt-go' and plan_index=0 and price_piasters<>29000;
update public.master_store_plans set plan_name='Standard — شهر — 1,000 إلى 1,300 كريدت — ضمان شهر'
where product_id='kling' and plan_index=1 and plan_name<>'Standard — شهر — 1,000 إلى 1,300 كريدت — ضمان شهر';
update public.master_store_plans set plan_name='Pro Lite — سنة — رابط تفعيل'
where product_id='lovable-pro' and plan_index=3 and plan_name<>'Pro Lite — سنة — رابط تفعيل';
insert into public.master_store_plans(product_id,plan_index,product_name,plan_name,duration,price_piasters,available,max_quantity,admin_overridden)
values
('quizlet-plus',0,'Quizlet Plus Unlimited','Plus Unlimited — شهر — حساب جاهز','1 شهر',19600,true,5,false),
('truecaller-gold',0,'Truecaller Gold','Gold — سنة — حساب جاهز','12 شهر',78400,true,5,false)
on conflict(product_id,plan_index) do nothing;
do $$
begin
  if not exists(select 1 from public.master_store_plans where product_id='quizlet-plus' and plan_index=0 and price_piasters=19600 and duration='1 شهر' and available=true)
     or not exists(select 1 from public.master_store_plans where product_id='truecaller-gold' and plan_index=0 and price_piasters=78400 and duration='12 شهر' and available=true)
  then raise exception 'An existing new-product row differs from the requested terms; review without overwriting it'; end if;
end $$;
commit;
