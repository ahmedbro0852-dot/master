create table public.master_store_funnel_daily (
  day date not null,
  stage text not null check (stage in ('product_view','plan_choice','cart_ready','order_submit','order_recorded')),
  visits bigint not null check (visits >= 0),
  primary key (day, stage)
);

alter table public.master_store_funnel_daily enable row level security;
revoke all on public.master_store_funnel_daily from public, anon, authenticated;
grant select on public.master_store_funnel_daily to authenticated;
create policy funnel_admin_read on public.master_store_funnel_daily
  for select to authenticated
  using (exists (
    select 1 from public.master_store_admins where user_id = (select auth.uid())
  ));

-- Only the counter increments. No visitor identifiers or order data are accepted or stored.
create function master_store_private.record_funnel(event_stage text)
returns void language sql security definer set search_path = '' as $$
  insert into public.master_store_funnel_daily(day, stage, visits)
  select (pg_catalog.now() at time zone 'Africa/Cairo')::date, event_stage, 1
  where event_stage in ('product_view','plan_choice','cart_ready','order_submit','order_recorded')
  on conflict (day, stage) do update
    set visits = public.master_store_funnel_daily.visits + 1;
$$;
revoke all on function master_store_private.record_funnel(text) from public, anon, authenticated;
grant execute on function master_store_private.record_funnel(text) to anon, authenticated;

create function public.master_store_record_funnel(event_stage text)
returns void language sql security invoker set search_path = '' as $$
  select master_store_private.record_funnel(event_stage);
$$;
revoke all on function public.master_store_record_funnel(text) from public, anon, authenticated;
grant execute on function public.master_store_record_funnel(text) to anon, authenticated;
