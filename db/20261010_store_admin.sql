-- Trusted manual store controls. All mutations require membership in master_store_admins.
alter table public.master_store_plans add column admin_overridden boolean not null default false, add column updated_at timestamptz not null default now();
create table public.master_store_discount_rules(
 id int primary key check(id=1), two int not null check(two between 0 and 50),three int not null check(three between 0 and 50),four int not null check(four between 0 and 50),five int not null check(five between 0 and 50),
 updated_at timestamptz not null default now(),check(two<=three and three<=four and four<=five));
insert into public.master_store_discount_rules(id,two,three,four,five) values(1,3,5,7,10);
create table public.master_store_admin_audit(id uuid primary key default gen_random_uuid(),admin_id uuid not null references auth.users(id),action text not null,target text not null,before_data jsonb,after_data jsonb,created_at timestamptz not null default now());
create table public.master_store_adjustments(id uuid primary key,user_id uuid not null references auth.users(id),admin_id uuid not null references auth.users(id),amount_piasters bigint not null check(amount_piasters<>0 and abs(amount_piasters)<=5000000),reason text not null check(length(reason) between 6 and 200),created_at timestamptz not null default now());
alter table public.master_store_ledger drop constraint master_store_ledger_kind_check;
alter table public.master_store_ledger add constraint master_store_ledger_kind_check check(kind in('topup','purchase','refund','manual_credit','manual_debit'));
alter table public.master_store_ledger add column adjustment_id uuid unique references public.master_store_adjustments(id),add column note text;
alter table public.master_store_discount_rules enable row level security;
alter table public.master_store_admin_audit enable row level security;
alter table public.master_store_adjustments enable row level security;
revoke all on public.master_store_discount_rules,public.master_store_admin_audit,public.master_store_adjustments from anon,authenticated;
grant select on public.master_store_discount_rules to anon,authenticated;
grant select on public.master_store_admin_audit,public.master_store_adjustments to authenticated;
grant all on public.master_store_discount_rules,public.master_store_admin_audit,public.master_store_adjustments to service_role;
create policy discount_public on public.master_store_discount_rules for select to anon,authenticated using(true);
create policy audit_admin on public.master_store_admin_audit for select to authenticated using(exists(select 1 from public.master_store_admins where user_id=(select auth.uid())));
create policy adjustment_read on public.master_store_adjustments for select to authenticated using(user_id=(select auth.uid()) or exists(select 1 from public.master_store_admins where user_id=(select auth.uid())));
create index master_store_adjustments_user on public.master_store_adjustments(user_id,created_at desc);
create index master_store_audit_date on public.master_store_admin_audit(created_at desc);
create function master_store_private.audit_admin_change() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.master_store_admins where user_id=auth.uid()) and to_jsonb(old) is distinct from to_jsonb(new) then
 insert into public.master_store_admin_audit(admin_id,action,target,before_data,after_data)
 values(auth.uid(),tg_table_name,coalesce(to_jsonb(new)->>'id',(to_jsonb(new)->>'product_id')||':'||(to_jsonb(new)->>'plan_index')),to_jsonb(old),to_jsonb(new));
 end if;
 return new;
end; $$;
revoke all on function master_store_private.audit_admin_change() from public,anon,authenticated;
create trigger audit_store_plan after update on public.master_store_plans for each row execute function master_store_private.audit_admin_change();
create trigger audit_store_discount after update on public.master_store_discount_rules for each row execute function master_store_private.audit_admin_change();
create trigger audit_store_topup after update on public.master_store_topups for each row execute function master_store_private.audit_admin_change();
create trigger audit_store_order after update on public.master_store_orders for each row execute function master_store_private.audit_admin_change();

create function master_store_private.admin_plan(product_key text,plan_number int,price bigint,is_available boolean,quantity_limit int,expected_version timestamptz)
returns public.master_store_plans language plpgsql security definer set search_path='' as $$
declare p public.master_store_plans;
begin
 if not exists(select 1 from public.master_store_admins where user_id=auth.uid()) then raise exception 'ADMIN_REQUIRED';end if;
 if price is null or price not between 100 and 100000000 or is_available is null or quantity_limit is null or quantity_limit not between 1 and 5 then raise exception 'INVALID_PLAN';end if;
 select * into p from public.master_store_plans where product_id=product_key and plan_index=plan_number for update;
 if not found then raise exception 'PLAN_UNAVAILABLE';end if;
 if expected_version is null or p.updated_at<>expected_version then raise exception 'EDIT_CONFLICT';end if;
 update public.master_store_plans set price_piasters=price,available=is_available,max_quantity=quantity_limit,admin_overridden=true,updated_at=clock_timestamp() where product_id=product_key and plan_index=plan_number returning * into p;
 return p;
end; $$;
create function master_store_private.admin_discounts(two int,three int,four int,five int,expected_version timestamptz) returns public.master_store_discount_rules language plpgsql security definer set search_path='' as $$
declare d public.master_store_discount_rules;
begin
 if not exists(select 1 from public.master_store_admins where user_id=auth.uid()) then raise exception 'ADMIN_REQUIRED';end if;
 if two is null or three is null or four is null or five is null or two not between 0 and 50 or two>three or three>four or four>five or five>50 then raise exception 'INVALID_DISCOUNT';end if;
 select * into d from public.master_store_discount_rules where id=1 for update;
 if expected_version is null or d.updated_at<>expected_version then raise exception 'EDIT_CONFLICT';end if;
 update public.master_store_discount_rules set two=admin_discounts.two,three=admin_discounts.three,four=admin_discounts.four,five=admin_discounts.five,updated_at=clock_timestamp() where id=1 returning * into d;
 return d;
end; $$;
create function master_store_private.admin_adjust_wallet(request_id uuid,customer_id uuid,amount bigint,reason text) returns public.master_store_adjustments language plpgsql security definer set search_path='' as $$
declare a public.master_store_adjustments;
begin
 if not exists(select 1 from public.master_store_admins where user_id=auth.uid()) then raise exception 'ADMIN_REQUIRED';end if;
 if request_id is null or amount is null or amount=0 or abs(amount)>5000000 or reason is null or length(trim(reason)) not between 6 and 200 then raise exception 'INVALID_ADJUSTMENT';end if;
 if not exists(select 1 from public.master_store_profiles where user_id=customer_id) then raise exception 'CUSTOMER_NOT_FOUND';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(customer_id::text,0));
 select * into a from public.master_store_adjustments where id=request_id;
 if found then
  if a.user_id<>customer_id or a.admin_id<>auth.uid() or a.amount_piasters<>amount or a.reason<>trim(reason) then raise exception 'REQUEST_CONFLICT';end if;
  return a;
 end if;
 insert into public.master_store_wallets(user_id) values(customer_id) on conflict do nothing;
 update public.master_store_wallets set balance_piasters=balance_piasters+amount where user_id=customer_id and balance_piasters+amount>=0;
 if not found then raise exception 'INSUFFICIENT_BALANCE';end if;
 insert into public.master_store_adjustments values(request_id,customer_id,auth.uid(),amount,trim(reason),now()) returning * into a;
 insert into public.master_store_ledger(user_id,amount_piasters,kind,adjustment_id,note) values(customer_id,amount,case when amount>0 then 'manual_credit' else 'manual_debit' end,request_id,trim(reason));
 insert into public.master_store_admin_audit(admin_id,action,target,after_data) values(auth.uid(),'wallet_adjustment',customer_id::text,to_jsonb(a));
 return a;
end; $$;
create function master_store_private.admin_snapshot() returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.master_store_admins where user_id=auth.uid()) then raise exception 'ADMIN_REQUIRED';end if;
 return jsonb_build_object(
 'plans',(select coalesce(jsonb_agg(to_jsonb(p) order by p.product_name,p.plan_index),'[]') from public.master_store_plans p),
 'discounts',(select to_jsonb(d) from public.master_store_discount_rules d where id=1),
 'orders',(select coalesce(jsonb_agg(to_jsonb(o)),'[]') from(select * from public.master_store_orders order by created_at desc limit 500)o),
 'topups',(select coalesce(jsonb_agg(to_jsonb(o)),'[]') from(select * from public.master_store_topups order by created_at desc limit 500)o),
 'customers',(select coalesce(jsonb_agg(to_jsonb(c)),'[]') from(select p.user_id,p.name,p.phone,u.email,coalesce(w.balance_piasters,0) balance_piasters from public.master_store_profiles p join auth.users u on u.id=p.user_id left join public.master_store_wallets w on w.user_id=p.user_id order by u.created_at desc limit 500)c),
 'audit',(select coalesce(jsonb_agg(to_jsonb(a)),'[]') from(select * from public.master_store_admin_audit order by created_at desc limit 100)a),
 'stats',jsonb_build_object('orders',(select count(*) from public.master_store_orders),'pending_orders',(select count(*) from public.master_store_orders where status in('pending_payment','processing')),'pending_topups',(select count(*) from public.master_store_topups where status='pending'),'completed_sales',(select coalesce(sum(amount_piasters),0) from public.master_store_orders where status='completed')));
end; $$;
create function public.master_store_admin_plan(product_key text,plan_number int,price bigint,is_available boolean,quantity_limit int,expected_version timestamptz) returns public.master_store_plans language sql security invoker set search_path='' as $$select master_store_private.admin_plan(product_key,plan_number,price,is_available,quantity_limit,expected_version);$$;
create function public.master_store_admin_discounts(two int,three int,four int,five int,expected_version timestamptz) returns public.master_store_discount_rules language sql security invoker set search_path='' as $$select master_store_private.admin_discounts(two,three,four,five,expected_version);$$;
create function public.master_store_admin_adjust_wallet(request_id uuid,customer_id uuid,amount bigint,reason text) returns public.master_store_adjustments language sql security invoker set search_path='' as $$select master_store_private.admin_adjust_wallet(request_id,customer_id,amount,reason);$$;
create function public.master_store_admin_snapshot() returns jsonb language sql security invoker set search_path='' as $$select master_store_private.admin_snapshot();$$;
revoke all on function master_store_private.admin_plan(text,int,bigint,boolean,int,timestamptz),master_store_private.admin_discounts(int,int,int,int,timestamptz),master_store_private.admin_adjust_wallet(uuid,uuid,bigint,text),master_store_private.admin_snapshot() from public,anon,authenticated;
revoke all on function public.master_store_admin_plan(text,int,bigint,boolean,int,timestamptz),public.master_store_admin_discounts(int,int,int,int,timestamptz),public.master_store_admin_adjust_wallet(uuid,uuid,bigint,text),public.master_store_admin_snapshot() from public,anon,authenticated;
grant execute on function master_store_private.admin_plan(text,int,bigint,boolean,int,timestamptz),master_store_private.admin_discounts(int,int,int,int,timestamptz),master_store_private.admin_adjust_wallet(uuid,uuid,bigint,text),master_store_private.admin_snapshot() to authenticated;
grant execute on function public.master_store_admin_plan(text,int,bigint,boolean,int,timestamptz),public.master_store_admin_discounts(int,int,int,int,timestamptz),public.master_store_admin_adjust_wallet(uuid,uuid,bigint,text),public.master_store_admin_snapshot() to authenticated;
-- Public catalogue exposes only catalogue data. Customer and wallet data stay private.
grant select on public.master_store_plans to anon;
create policy plan_public on public.master_store_plans for select to anon using(true);
create or replace function master_store_private.quote_cart(items jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare r record; p public.master_store_plans; n int:=0; rate int; subtotal bigint:=0; savings bigint:=0; line bigint; off bigint; rows jsonb:='[]'; rules public.master_store_discount_rules;
begin
 if items is null or jsonb_typeof(items)<>'array' or jsonb_array_length(items) not between 1 and 20 then raise exception 'INVALID_CART'; end if;
 if exists(select 1 from jsonb_array_elements(items) x where coalesce((x->>'quantity')::int,0) not between 1 and 5) then raise exception 'INVALID_CART'; end if;
 for r in select x->>'product_id' product_id,(x->>'plan_index')::int plan_index,sum((x->>'quantity')::int)::int quantity from jsonb_array_elements(items) x group by 1,2 order by 1,2 loop
  if r.quantity not between 1 and 5 then raise exception 'INVALID_CART'; end if;
  select * into p from public.master_store_plans where product_id=r.product_id and plan_index=r.plan_index and available;
  if not found or r.quantity>p.max_quantity then raise exception 'PLAN_UNAVAILABLE'; end if;
  n:=n+r.quantity;
  rows:=rows||jsonb_build_array(jsonb_build_object('product_id',p.product_id,'plan_index',p.plan_index,'quantity',r.quantity,'product',p.product_name,'plan',p.plan_name,'duration',p.duration,'unit_piasters',p.price_piasters,'max_quantity',p.max_quantity));
 end loop;
 if n not between 1 and 50 then raise exception 'INVALID_CART'; end if;
 select * into rules from public.master_store_discount_rules where id=1;
 rate:=case when n>=5 then rules.five when n=4 then rules.four when n=3 then rules.three when n=2 then rules.two else 0 end;
 items:='[]';
 for r in select value x from jsonb_array_elements(rows) loop
  line:=(r.x->>'unit_piasters')::bigint*(r.x->>'quantity')::int; off:=round(line*rate/100.0);
  subtotal:=subtotal+line; savings:=savings+off;
  items:=items||jsonb_build_array(r.x||jsonb_build_object('subtotal_piasters',line,'discount_piasters',off,'amount_piasters',line-off));
 end loop;
 return jsonb_build_object('items',items,'quantity',n,'discount_percent',rate,'rules',to_jsonb(rules),'subtotal_piasters',subtotal,'discount_piasters',savings,'amount_piasters',subtotal-savings);
end; $$;
