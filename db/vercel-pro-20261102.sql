-- Scope this insertion to the new Vercel Pro offer; preserve all existing rows and dates.
begin;
insert into public.master_store_plans(product_id,plan_index,product_name,plan_name,duration,price_piasters,available,max_quantity,admin_overridden)
values('vercel-pro',0,'Vercel Pro','Pro — شهر — على حسابك الشخصي','1 شهر',75000,true,5,false)
on conflict(product_id,plan_index) do nothing;
do $$
begin
 if not exists(select 1 from public.master_store_plans where product_id='vercel-pro' and plan_index=0 and duration='1 شهر' and price_piasters=75000 and available=true)
 then raise exception 'Existing Vercel Pro row differs; review without overwriting';end if;
end $$;
commit;
