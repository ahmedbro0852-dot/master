-- A one-month store offer; never convert the annual official equivalent to a fake standalone price.
begin;
insert into public.master_store_plans(product_id,plan_index,product_name,plan_name,duration,price_piasters,available,max_quantity,admin_overridden)
values('skillshare',0,'Skillshare','شهر — حساب خاص جاهز — ضمان كامل','1 شهر',33600,true,5,false)
on conflict(product_id,plan_index) do nothing;
do $$
begin
 if not exists(select 1 from public.master_store_plans where product_id='skillshare' and plan_index=0 and duration='1 شهر' and price_piasters=33600 and available=true)
 then raise exception 'Existing Skillshare row differs; review without overwriting';end if;
end $$;
commit;
