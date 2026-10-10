-- MASTER STORE: isolated tables; all amounts are integer Egyptian piastres.
create schema if not exists master_store_private;
revoke all on schema master_store_private from public, anon;
grant usage on schema master_store_private to authenticated, service_role;

create table public.master_store_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '' check(length(name)<=80),
  phone text not null default '' check(length(phone)<=30)
);
create table public.master_store_admins (user_id uuid primary key references auth.users(id));
create table public.master_store_wallets (
  user_id uuid primary key references auth.users(id),
  balance_piasters bigint not null default 0 check(balance_piasters>=0)
);
create table public.master_store_plans (
  product_id text not null, plan_index integer not null,
  product_name text not null, plan_name text not null, duration text not null,
  price_piasters bigint not null check(price_piasters>0),
  available boolean not null, max_quantity integer not null default 5,
  primary key(product_id,plan_index)
);
create table public.master_store_topups (
  id uuid primary key, user_id uuid not null references auth.users(id),
  amount_piasters bigint not null check(amount_piasters between 5000 and 5000000),
  payment text not null, reference text not null check(length(reference) between 6 and 100),
  status text not null default 'pending' check(status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(), reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  unique(user_id,payment,reference)
);
create table public.master_store_orders (
  id uuid primary key, user_id uuid not null references auth.users(id),
  product_id text not null, plan_index integer not null,
  product text not null, plan text not null, duration text not null,
  quantity integer not null check(quantity between 1 and 5),
  amount_piasters bigint not null check(amount_piasters>0),
  customer jsonb not null, payment text not null,
  status text not null check(status in ('pending_payment','processing','completed','cancelled')),
  created_at timestamptz not null default now()
);
create table public.master_store_ledger (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id),
  amount_piasters bigint not null check(amount_piasters<>0),
  kind text not null check(kind in ('topup','purchase','refund')),
  topup_id uuid references public.master_store_topups(id),
  order_id uuid references public.master_store_orders(id),
  created_at timestamptz not null default now(),
  unique(topup_id), unique(order_id,kind)
);
create index master_store_topups_user_date on public.master_store_topups(user_id,created_at desc);
create index master_store_orders_user_date on public.master_store_orders(user_id,created_at desc);
create index master_store_ledger_user_date on public.master_store_ledger(user_id,created_at desc);

alter table public.master_store_profiles enable row level security;
alter table public.master_store_admins enable row level security;
alter table public.master_store_wallets enable row level security;
alter table public.master_store_plans enable row level security;
alter table public.master_store_topups enable row level security;
alter table public.master_store_orders enable row level security;
alter table public.master_store_ledger enable row level security;
revoke all on public.master_store_profiles, public.master_store_admins, public.master_store_wallets, public.master_store_plans, public.master_store_topups, public.master_store_orders, public.master_store_ledger from anon,authenticated;
grant select,insert,update on public.master_store_profiles to authenticated;
grant select on public.master_store_admins,public.master_store_wallets,public.master_store_plans,public.master_store_topups,public.master_store_orders,public.master_store_ledger to authenticated;
grant all on public.master_store_profiles,public.master_store_admins,public.master_store_wallets,public.master_store_plans,public.master_store_topups,public.master_store_orders,public.master_store_ledger to service_role;
create policy profile_owner on public.master_store_profiles for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy admin_self on public.master_store_admins for select to authenticated using(user_id=(select auth.uid()));
create policy wallet_owner on public.master_store_wallets for select to authenticated using(user_id=(select auth.uid()));
create policy plans_read on public.master_store_plans for select to authenticated using(true);
create policy topup_read on public.master_store_topups for select to authenticated using(user_id=(select auth.uid()) or exists(select 1 from public.master_store_admins where user_id=(select auth.uid())));
create policy orders_read on public.master_store_orders for select to authenticated using(user_id=(select auth.uid()) or exists(select 1 from public.master_store_admins where user_id=(select auth.uid())));
create policy ledger_owner on public.master_store_ledger for select to authenticated using(user_id=(select auth.uid()));

create function master_store_private.request_topup(request_id uuid, amount bigint, method text, transfer_reference text)
returns public.master_store_topups language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); result public.master_store_topups;
begin
  if u is null then raise exception 'AUTH_REQUIRED'; end if;
  if amount is null or amount not between 5000 and 5000000 or transfer_reference is null or length(trim(transfer_reference)) not between 6 and 100 or method is null or method not in ('InstaPay','Vodafone Cash','Taptap Send','CliQ','Sham Cash','PayPal','Barq','Binance / USDT') then raise exception 'INVALID_TOPUP'; end if;
  -- Serialize all financial requests for this customer.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(u::text,0));
  select * into result from public.master_store_topups where (id=request_id or (user_id=u and payment=method and reference=trim(transfer_reference)));
  if found then
    if result.user_id<>u or result.amount_piasters<>amount or result.payment<>method or result.reference<>trim(transfer_reference) then raise exception 'REQUEST_CONFLICT'; end if;
    return result;
  end if;
  if (select count(*) from public.master_store_topups where user_id=u and status='pending')>=3 then raise exception 'PENDING_LIMIT'; end if;
  insert into public.master_store_topups(id,user_id,amount_piasters,payment,reference) values(request_id,u,amount,method,trim(transfer_reference)) returning * into result;
  return result;
end; $$;

create function master_store_private.place_order(request_id uuid, product_key text, plan_number integer, qty integer, contact jsonb, method text, quoted_amount bigint)
returns public.master_store_orders language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); p public.master_store_plans; result public.master_store_orders; cost bigint;
begin
  if u is null then raise exception 'AUTH_REQUIRED'; end if;
  if qty is null or qty not between 1 and 5 or contact is null or coalesce(length(contact->>'name'),0) not between 1 and 80 or coalesce(length(contact->>'phone'),0) not between 5 and 30 or coalesce(length(contact->>'email'),0) not between 3 and 120 then raise exception 'INVALID_ORDER'; end if;
  if method is null or method not in ('wallet','InstaPay','Vodafone Cash','Taptap Send','CliQ','Sham Cash','PayPal','Barq','Binance / USDT') then raise exception 'INVALID_PAYMENT'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(u::text,0));
  select * into result from public.master_store_orders where id=request_id;
  if found then
    if result.user_id<>u or result.product_id<>product_key or result.plan_index<>plan_number or result.quantity<>qty or result.payment<>method then raise exception 'REQUEST_CONFLICT'; end if;
    return result;
  end if;
  select * into p from public.master_store_plans where product_id=product_key and plan_index=plan_number and available;
  if not found or qty>p.max_quantity then raise exception 'PLAN_UNAVAILABLE'; end if;
  cost:=p.price_piasters*qty;
  if quoted_amount is null or quoted_amount<>cost then raise exception 'PRICE_CHANGED'; end if;
  if (select count(*) from public.master_store_orders where user_id=u and created_at>now()-interval '1 hour')>=20 then raise exception 'ORDER_LIMIT'; end if;
  if method='wallet' then
    insert into public.master_store_wallets(user_id) values(u) on conflict do nothing;
    update public.master_store_wallets set balance_piasters=balance_piasters-cost where user_id=u and balance_piasters>=cost;
    if not found then raise exception 'INSUFFICIENT_BALANCE'; end if;
  end if;
  insert into public.master_store_orders(id,user_id,product_id,plan_index,product,plan,duration,quantity,amount_piasters,customer,payment,status)
    values(request_id,u,product_key,plan_number,p.product_name,p.plan_name,p.duration,qty,cost,
      pg_catalog.jsonb_build_object('name',contact->>'name','phone',contact->>'phone','email',contact->>'email'),method,case when method='wallet' then 'processing' else 'pending_payment' end) returning * into result;
  if method='wallet' then insert into public.master_store_ledger(user_id,amount_piasters,kind,order_id) values(u,-cost,'purchase',request_id); end if;
  return result;
end; $$;

create function master_store_private.review_topup(request_id uuid, approve boolean)
returns public.master_store_topups language plpgsql security definer set search_path='' as $$
declare result public.master_store_topups; u uuid;
begin
  if not exists(select 1 from public.master_store_admins where user_id=auth.uid()) then raise exception 'ADMIN_REQUIRED'; end if;
  if approve is null then raise exception 'INVALID_REVIEW'; end if;
  select user_id into u from public.master_store_topups where id=request_id;
  if not found then raise exception 'NOT_FOUND'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(u::text,0));
  select * into result from public.master_store_topups where id=request_id for update;
  if result.status<>'pending' then return result; end if;
  update public.master_store_topups set status=case when approve then 'approved' else 'rejected' end,reviewed_at=now(),reviewed_by=auth.uid() where id=request_id returning * into result;
  if approve then
    insert into public.master_store_wallets(user_id,balance_piasters) values(u,result.amount_piasters)
      on conflict(user_id) do update set balance_piasters=public.master_store_wallets.balance_piasters+excluded.balance_piasters;
    insert into public.master_store_ledger(user_id,amount_piasters,kind,topup_id) values(u,result.amount_piasters,'topup',request_id);
  end if;
  return result;
end; $$;

create function master_store_private.review_order(request_id uuid, new_status text)
returns public.master_store_orders language plpgsql security definer set search_path='' as $$
declare result public.master_store_orders; u uuid;
begin
  if not exists(select 1 from public.master_store_admins where user_id=auth.uid()) then raise exception 'ADMIN_REQUIRED'; end if;
  if new_status is null or new_status not in ('processing','completed','cancelled') then raise exception 'INVALID_STATUS'; end if;
  select user_id into u from public.master_store_orders where id=request_id;
  if not found then raise exception 'NOT_FOUND'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(u::text,0));
  select * into result from public.master_store_orders where id=request_id for update;
  if result.status=new_status then return result; end if;
  if result.status in ('completed','cancelled') then raise exception 'ORDER_CLOSED'; end if;
  if new_status='cancelled' and result.payment='wallet' then
    update public.master_store_wallets set balance_piasters=balance_piasters+result.amount_piasters where user_id=u;
    insert into public.master_store_ledger(user_id,amount_piasters,kind,order_id) values(u,result.amount_piasters,'refund',request_id);
  end if;
  update public.master_store_orders set status=new_status where id=request_id returning * into result;
  return result;
end; $$;

revoke all on all functions in schema master_store_private from public,anon,authenticated;
grant execute on function master_store_private.request_topup(uuid,bigint,text,text),master_store_private.place_order(uuid,text,integer,integer,jsonb,text,bigint),master_store_private.review_topup(uuid,boolean),master_store_private.review_order(uuid,text) to authenticated;
create function public.master_store_request_topup(request_id uuid, amount bigint, method text, transfer_reference text) returns public.master_store_topups language sql security invoker set search_path='' as $$ select master_store_private.request_topup(request_id,amount,method,transfer_reference); $$;
create function public.master_store_place_order(request_id uuid, product_key text, plan_number integer, qty integer, contact jsonb, method text, quoted_amount bigint) returns public.master_store_orders language sql security invoker set search_path='' as $$ select master_store_private.place_order(request_id,product_key,plan_number,qty,contact,method,quoted_amount); $$;
create function public.master_store_review_topup(request_id uuid, approve boolean) returns public.master_store_topups language sql security invoker set search_path='' as $$ select master_store_private.review_topup(request_id,approve); $$;
create function public.master_store_review_order(request_id uuid,new_status text) returns public.master_store_orders language sql security invoker set search_path='' as $$ select master_store_private.review_order(request_id,new_status); $$;
revoke all on function public.master_store_request_topup(uuid,bigint,text,text),public.master_store_place_order(uuid,text,integer,integer,jsonb,text,bigint),public.master_store_review_topup(uuid,boolean),public.master_store_review_order(uuid,text) from public,anon;
grant execute on function public.master_store_request_topup(uuid,bigint,text,text),public.master_store_place_order(uuid,text,integer,integer,jsonb,text,bigint),public.master_store_review_topup(uuid,boolean),public.master_store_review_order(uuid,text) to authenticated;
