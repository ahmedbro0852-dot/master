create table public.master_store_campaigns (
 id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{0,119}$'),
 product_id text not null,
 plan_index integer not null,
 poster_path text not null check (poster_path ~ '^images/offers/[a-z0-9-]+\.webp$'),
 title_ar text not null check (length(title_ar) between 1 and 180),
 title_en text not null check (length(title_en) between 1 and 180),
 alt_ar text not null check (length(alt_ar) between 1 and 600),
 alt_en text not null check (length(alt_en) between 1 and 600),
 expected_price_piasters bigint not null check (expected_price_piasters>0),
 poster_currency text not null default 'EGP' check (poster_currency in ('EGP','USD')),
 credit_key text check (credit_key is null or credit_key='salah-wikiportraits'),
 starts_at timestamptz not null default now(),
 ends_at timestamptz not null default (now()+interval '72 hours'),
 enabled boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 foreign key(product_id,plan_index) references public.master_store_plans(product_id,plan_index),
 check (ends_at=starts_at+interval '72 hours')
);
alter table public.master_store_campaigns enable row level security;
create policy campaign_live_read on public.master_store_campaigns for select to anon,authenticated using (
 enabled and starts_at<=now() and ends_at>now()
 and exists(select 1 from public.master_store_plans p where p.product_id=master_store_campaigns.product_id and p.plan_index=master_store_campaigns.plan_index and p.available and p.price_piasters=master_store_campaigns.expected_price_piasters)
);
create policy campaign_admin_read on public.master_store_campaigns for select to authenticated using (
 exists(select 1 from public.master_store_admins a where a.user_id=(select auth.uid()))
);
create policy campaign_admin_update on public.master_store_campaigns for update to authenticated using (
 exists(select 1 from public.master_store_admins a where a.user_id=(select auth.uid()))
) with check (
 exists(select 1 from public.master_store_admins a where a.user_id=(select auth.uid()))
);
revoke all on public.master_store_campaigns from public,anon,authenticated;
grant select on public.master_store_campaigns to anon,authenticated;
grant update(enabled,updated_at) on public.master_store_campaigns to authenticated;
create index campaign_active_window on public.master_store_campaigns(ends_at,starts_at) where enabled;
comment on table public.master_store_campaigns is 'Public poster campaigns expire exactly 72 hours after launch; only administrators may pause or resume them.';
