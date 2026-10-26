-- Lovable Pro Lite yearly promotion. No customer/order/schema changes.
-- Schedule is UTC; end is 28 Oct 2026 at 08:15 Africa/Cairo.
begin;
do $$ begin
 if (select count(*) from public.master_store_plans where (product_id,plan_index) in (('lovable-pro',3),('lovable-lite',0)) and price_piasters=45000)=2 then
  update public.master_store_plans set price_piasters=43000,admin_overridden=true,updated_at=clock_timestamp()
  where (product_id,plan_index) in (('lovable-pro',3),('lovable-lite',0));
 else raise exception 'UNEXPECTED_LOVABLE_PRICE'; end if;
end $$;
select cron.schedule('master-lovable-lite-430-20261028','* * * * *',$job$
do $body$
declare r record;
begin
 if clock_timestamp() >= timestamptz '2026-10-28T05:15:00Z' then
  for r in update public.master_store_plans set price_piasters=45000,updated_at=clock_timestamp()
   where (product_id,plan_index) in (('lovable-pro',3),('lovable-lite',0)) and price_piasters=43000 and admin_overridden=true
   returning product_id,plan_index loop
    update public.master_store_plans set previous_price_piasters=case when r.product_id='lovable-pro' then 65000 else null end
    where product_id=r.product_id and plan_index=r.plan_index;
  end loop;
  perform cron.unschedule('master-lovable-lite-430-20261028');
 end if;
end $body$;
$job$);
commit;
