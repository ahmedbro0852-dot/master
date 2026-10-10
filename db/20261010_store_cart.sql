alter table public.master_store_orders add column cart_id uuid, add column subtotal_piasters bigint, add column discount_piasters bigint not null default 0;
create table public.master_store_carts(id uuid primary key,user_id uuid not null references auth.users(id),items jsonb not null,customer jsonb not null,payment text not null,quote jsonb not null,created_at timestamptz not null default now());
alter table public.master_store_carts enable row level security;
revoke all on public.master_store_carts from anon,authenticated;
grant select on public.master_store_carts to authenticated;
grant all on public.master_store_carts to service_role;
create policy cart_owner on public.master_store_carts for select to authenticated using(user_id=(select auth.uid()));
alter table public.master_store_orders add foreign key(cart_id) references public.master_store_carts(id);
create index master_store_carts_user_date on public.master_store_carts(user_id,created_at desc);
create function master_store_private.quote_cart(items jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare r record; p public.master_store_plans; n int:=0; rate int; subtotal bigint:=0; savings bigint:=0; line bigint; off bigint; rows jsonb:='[]';
begin
 if items is null or jsonb_typeof(items)<>'array' or jsonb_array_length(items) not between 1 and 20 then raise exception 'INVALID_CART'; end if;
 if exists(select 1 from jsonb_array_elements(items) x where coalesce((x->>'quantity')::int,0) not between 1 and 5) then raise exception 'INVALID_CART'; end if;
 for r in select x->>'product_id' product_id,(x->>'plan_index')::int plan_index,sum((x->>'quantity')::int)::int quantity from jsonb_array_elements(items) x group by 1,2 order by 1,2 loop
  if r.quantity not between 1 and 5 then raise exception 'INVALID_CART'; end if;
  select * into p from public.master_store_plans where product_id=r.product_id and plan_index=r.plan_index and available;
  if not found or r.quantity>p.max_quantity then raise exception 'PLAN_UNAVAILABLE'; end if;
  n:=n+r.quantity;
  rows:=rows||jsonb_build_array(jsonb_build_object('product_id',p.product_id,'plan_index',p.plan_index,'quantity',r.quantity,'product',p.product_name,'plan',p.plan_name,'duration',p.duration,'unit_piasters',p.price_piasters));
 end loop;
 if n not between 1 and 50 then raise exception 'INVALID_CART'; end if;
 rate:=case when n>=5 then 10 when n=4 then 7 when n=3 then 5 when n=2 then 3 else 0 end;
 items:='[]';
 for r in select value x from jsonb_array_elements(rows) loop
  line:=(r.x->>'unit_piasters')::bigint*(r.x->>'quantity')::int; off:=round(line*rate/100.0);
  subtotal:=subtotal+line; savings:=savings+off;
  items:=items||jsonb_build_array(r.x||jsonb_build_object('subtotal_piasters',line,'discount_piasters',off,'amount_piasters',line-off));
 end loop;
 return jsonb_build_object('items',items,'quantity',n,'discount_percent',rate,'subtotal_piasters',subtotal,'discount_piasters',savings,'amount_piasters',subtotal-savings);
end; $$;
create function master_store_private.checkout_cart(request_id uuid,items jsonb,contact jsonb,method text,quoted_amount bigint) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); q jsonb; old public.master_store_carts; r record; o public.master_store_orders; results jsonb:='[]'; cost bigint;
begin
 if u is null then raise exception 'AUTH_REQUIRED'; end if;
 if request_id is null or contact is null or coalesce(length(contact->>'name'),0) not between 1 and 80 or coalesce(length(contact->>'phone'),0) not between 5 and 30 or coalesce(length(contact->>'email'),0) not between 3 and 120 then raise exception 'INVALID_ORDER'; end if;
 if method is null or method not in ('wallet','InstaPay','Vodafone Cash','Taptap Send','CliQ','Sham Cash','PayPal','Barq','Binance / USDT') then raise exception 'INVALID_PAYMENT'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(u::text,0));
 select * into old from public.master_store_carts where id=request_id;
 if found then
  if old.user_id<>u or old.items<>items or old.payment<>method or old.customer<>contact then raise exception 'REQUEST_CONFLICT'; end if;
  select coalesce(jsonb_agg(to_jsonb(z)),'[]') into results from public.master_store_orders z where cart_id=request_id;
  return jsonb_build_object('cart_id',request_id,'quote',old.quote,'orders',results);
 end if;
 q:=master_store_private.quote_cart(items); cost:=(q->>'amount_piasters')::bigint;
 if quoted_amount is null or quoted_amount<>cost then raise exception 'PRICE_CHANGED'; end if;
 if (select count(*) from public.master_store_orders where user_id=u and created_at>now()-interval '1 hour')+jsonb_array_length(q->'items')>20 then raise exception 'ORDER_LIMIT'; end if;
 if method='wallet' then
  insert into public.master_store_wallets(user_id) values(u) on conflict do nothing;
  update public.master_store_wallets set balance_piasters=balance_piasters-cost where user_id=u and balance_piasters>=cost;
  if not found then raise exception 'INSUFFICIENT_BALANCE'; end if;
 end if;
 insert into public.master_store_carts values(request_id,u,items,contact,method,q,now());
 for r in select value x from jsonb_array_elements(q->'items') loop
  insert into public.master_store_orders(id,user_id,product_id,plan_index,product,plan,duration,quantity,amount_piasters,customer,payment,status,cart_id,subtotal_piasters,discount_piasters)
  values(gen_random_uuid(),u,r.x->>'product_id',(r.x->>'plan_index')::int,r.x->>'product',r.x->>'plan',r.x->>'duration',(r.x->>'quantity')::int,(r.x->>'amount_piasters')::bigint,contact,method,case when method='wallet' then 'processing' else 'pending_payment' end,request_id,(r.x->>'subtotal_piasters')::bigint,(r.x->>'discount_piasters')::bigint) returning * into o;
  if method='wallet' then insert into public.master_store_ledger(user_id,amount_piasters,kind,order_id) values(u,-o.amount_piasters,'purchase',o.id); end if;
  results:=results||jsonb_build_array(to_jsonb(o));
 end loop;
 return jsonb_build_object('cart_id',request_id,'quote',q,'orders',results);
end; $$;
grant usage on schema master_store_private to anon;
revoke all on function master_store_private.quote_cart(jsonb),master_store_private.checkout_cart(uuid,jsonb,jsonb,text,bigint) from public,anon,authenticated;
grant execute on function master_store_private.quote_cart(jsonb) to anon,authenticated;
grant execute on function master_store_private.checkout_cart(uuid,jsonb,jsonb,text,bigint) to authenticated;
create function public.master_store_quote_cart(items jsonb) returns jsonb language sql security invoker set search_path='' as $$select master_store_private.quote_cart(items);$$;
create function public.master_store_checkout_cart(request_id uuid,items jsonb,contact jsonb,method text,quoted_amount bigint) returns jsonb language sql security invoker set search_path='' as $$select master_store_private.checkout_cart(request_id,items,contact,method,quoted_amount);$$;
revoke all on function public.master_store_quote_cart(jsonb),public.master_store_checkout_cart(uuid,jsonb,jsonb,text,bigint) from public,anon,authenticated;
grant execute on function public.master_store_quote_cart(jsonb) to anon,authenticated;
grant execute on function public.master_store_checkout_cart(uuid,jsonb,jsonb,text,bigint) to authenticated;
