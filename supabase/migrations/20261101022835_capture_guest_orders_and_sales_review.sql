-- Guest checkout is a narrow, write-only API; no public table access is granted.
alter table public.master_store_orders alter column user_id drop not null;
alter table public.master_store_carts alter column user_id drop not null;
alter table public.master_store_carts add column guest_token_hash text;
alter table public.master_store_orders add constraint guest_orders_external_payment check(user_id is not null or payment<>'wallet');
alter table public.master_store_carts add constraint guest_carts_receipt_required check(user_id is not null or (payment<>'wallet' and guest_token_hash is not null));
create index master_store_orders_guest_contact_date on public.master_store_orders ((lower(customer->>'email')),created_at desc) where user_id is null;

create function master_store_private.guest_checkout(request_id uuid, receipt_token uuid, items jsonb, contact jsonb, method text, quoted_amount bigint)
returns jsonb language plpgsql security definer set search_path='' as $$
declare old public.master_store_carts; q jsonb; r record; o public.master_store_orders; results jsonb:='[]'; clean jsonb; token_hash text; phone_key text;
begin
 if auth.uid() is not null then raise exception 'USE_ACCOUNT_CHECKOUT';end if;
 if request_id is null or receipt_token is null or contact is null or jsonb_typeof(contact)<>'object' then raise exception 'INVALID_ORDER';end if;
 clean:=jsonb_build_object('name',trim(contact->>'name'),'phone',trim(contact->>'phone'),'email',lower(trim(contact->>'email')));
 if coalesce(length(clean->>'name'),0) not between 1 and 80 or coalesce(length(clean->>'phone'),0) not between 5 and 30 or coalesce(length(clean->>'email'),0) not between 3 and 120 or (clean->>'email') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'INVALID_ORDER';end if;
 if method is null or method not in ('InstaPay','Vodafone Cash','Taptap Send','CliQ','Sham Cash','PayPal','Barq','Binance / USDT') then raise exception 'INVALID_PAYMENT';end if;
 token_hash:=encode(sha256(convert_to(receipt_token::text,'UTF8')),'hex');
 perform pg_advisory_xact_lock(hashtextextended('guest-request:'||request_id::text,0));
 select * into old from public.master_store_carts where id=request_id;
 if found then
  if old.user_id is not null or old.guest_token_hash is distinct from token_hash or old.items is distinct from items or old.customer is distinct from clean or old.payment is distinct from method then raise exception 'REQUEST_CONFLICT';end if;
  select coalesce(jsonb_agg(to_jsonb(z) order by z.id),'[]') into results from public.master_store_orders z where cart_id=request_id;
  return jsonb_build_object('cart_id',request_id,'quote',old.quote,'orders',results);
 end if;
 phone_key:=regexp_replace(clean->>'phone','[^0-9]','','g');
 if length(phone_key) not between 5 and 20 then raise exception 'INVALID_ORDER';end if;
 perform pg_advisory_xact_lock(hashtextextended('guest-phone:'||phone_key,0));
 perform pg_advisory_xact_lock(hashtextextended('guest-email:'||(clean->>'email'),0));
 q:=master_store_private.quote_cart(items);
 if quoted_amount is null or quoted_amount<>(q->>'amount_piasters')::bigint then raise exception 'PRICE_CHANGED';end if;
 if (select count(*) from public.master_store_orders where user_id is null and created_at>now()-interval '1 hour' and (lower(customer->>'email')=clean->>'email' or regexp_replace(customer->>'phone','[^0-9]','','g')=phone_key))+jsonb_array_length(q->'items')>20 then raise exception 'ORDER_LIMIT';end if;
 insert into public.master_store_carts(id,user_id,items,customer,payment,quote,guest_token_hash) values(request_id,null,items,clean,method,q,token_hash);
 for r in select value x from jsonb_array_elements(q->'items') loop
  insert into public.master_store_orders(id,user_id,product_id,plan_index,product,plan,duration,quantity,amount_piasters,customer,payment,status,cart_id,subtotal_piasters,discount_piasters)
  values(gen_random_uuid(),null,r.x->>'product_id',(r.x->>'plan_index')::int,r.x->>'product',r.x->>'plan',r.x->>'duration',(r.x->>'quantity')::int,(r.x->>'amount_piasters')::bigint,clean,method,'pending_payment',request_id,(r.x->>'subtotal_piasters')::bigint,(r.x->>'discount_piasters')::bigint) returning * into o;
  results:=results||jsonb_build_array(to_jsonb(o));
 end loop;
 return jsonb_build_object('cart_id',request_id,'quote',q,'orders',results);
end;$$;

-- A receipt requires its separate random capability, never an ID or email alone.
create function master_store_private.guest_receipt(request_id uuid,receipt_token uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if request_id is null or receipt_token is null then raise exception 'RECEIPT_UNAVAILABLE';end if;
 if not exists(select 1 from public.master_store_carts c where c.id=request_id and c.user_id is null and c.guest_token_hash=encode(sha256(convert_to(receipt_token::text,'UTF8')),'hex')) then raise exception 'RECEIPT_UNAVAILABLE';end if;
 select coalesce(jsonb_agg(to_jsonb(o) order by o.id),'[]') into result from public.master_store_orders o where o.cart_id=request_id;
 return result;
end;$$;
revoke all on function master_store_private.guest_checkout(uuid,uuid,jsonb,jsonb,text,bigint),master_store_private.guest_receipt(uuid,uuid) from public,anon,authenticated;
grant usage on schema master_store_private to anon;
grant execute on function master_store_private.guest_checkout(uuid,uuid,jsonb,jsonb,text,bigint) to anon;
grant execute on function master_store_private.guest_receipt(uuid,uuid) to anon,authenticated;
create function public.master_store_guest_checkout(request_id uuid,receipt_token uuid,items jsonb,contact jsonb,method text,quoted_amount bigint) returns jsonb language sql security invoker set search_path='' as $$select master_store_private.guest_checkout(request_id,receipt_token,items,contact,method,quoted_amount);$$;
create function public.master_store_guest_receipt(request_id uuid,receipt_token uuid) returns jsonb language sql security invoker set search_path='' as $$select master_store_private.guest_receipt(request_id,receipt_token);$$;
revoke all on function public.master_store_guest_checkout(uuid,uuid,jsonb,jsonb,text,bigint),public.master_store_guest_receipt(uuid,uuid) from public,anon,authenticated;
grant execute on function public.master_store_guest_checkout(uuid,uuid,jsonb,jsonb,text,bigint) to anon;
grant execute on function public.master_store_guest_receipt(uuid,uuid) to anon,authenticated;

-- Internal sales notes are kept out of customer-visible order rows.
create table public.master_store_order_reviews(
 order_id uuid primary key references public.master_store_orders(id),
 outcome text not null check(outcome in('unreviewed','purchased','not_purchased','follow_up')),
 note text not null default '' check(length(note)<=2000),
 version integer not null default 1,
 reviewed_by uuid not null references auth.users(id),updated_at timestamptz not null default now()
);
alter table public.master_store_order_reviews enable row level security;
revoke all on public.master_store_order_reviews from public,anon,authenticated;
grant select on public.master_store_order_reviews to authenticated;
grant all on public.master_store_order_reviews to service_role;
create policy order_reviews_admin on public.master_store_order_reviews for select to authenticated using(exists(select 1 from public.master_store_admins where user_id=(select auth.uid())));
create function master_store_private.set_order_outcome(request_id uuid,outcome text,note text,expected_version integer) returns jsonb
language plpgsql security definer set search_path='' as $$
declare previous public.master_store_order_reviews; result public.master_store_order_reviews;
begin
 if auth.uid() is null or not exists(select 1 from public.master_store_admins where user_id=auth.uid()) then raise exception 'ADMIN_REQUIRED';end if;
 if outcome is null or outcome not in('unreviewed','purchased','not_purchased','follow_up') or note is null or length(note)>2000 then raise exception 'INVALID_REVIEW';end if;
 perform 1 from public.master_store_orders where id=request_id for update;if not found then raise exception 'NOT_FOUND';end if;
 select * into previous from public.master_store_order_reviews where order_id=request_id;
 if expected_version is null or expected_version<>coalesce(previous.version,0) then raise exception 'EDIT_CONFLICT';end if;
 insert into public.master_store_order_reviews(order_id,outcome,note,reviewed_by) values(request_id,outcome,trim(note),auth.uid())
 on conflict(order_id) do update set outcome=excluded.outcome,note=excluded.note,version=master_store_order_reviews.version+1,reviewed_by=auth.uid(),updated_at=clock_timestamp() returning * into result;
 insert into public.master_store_admin_audit(admin_id,action,target,before_data,after_data) values(auth.uid(),'order_sales_review',request_id::text,case when previous.order_id is null then null else to_jsonb(previous) end,to_jsonb(result));
 return to_jsonb(result);
end;$$;
create function public.master_store_set_order_outcome(request_id uuid,outcome text,note text,expected_version integer) returns jsonb language sql security invoker set search_path='' as $$select master_store_private.set_order_outcome(request_id,outcome,note,expected_version);$$;

create function master_store_private.list_order_inbox(search_text text,status_filter text,outcome_filter text,page_number integer) returns jsonb
language plpgsql security definer set search_path='' as $$
declare results jsonb; total bigint; needle text:=lower(trim(coalesce(search_text,'')));
begin
 if auth.uid() is null or not exists(select 1 from public.master_store_admins where user_id=auth.uid()) then raise exception 'ADMIN_REQUIRED';end if;
 if length(needle)>120 or page_number is null or page_number<0 or status_filter is null or status_filter not in('all','pending_payment','processing','completed','cancelled') or outcome_filter is null or outcome_filter not in('all','unreviewed','purchased','not_purchased','follow_up') then raise exception 'INVALID_REVIEW';end if;
 select count(*) into total from public.master_store_orders o left join public.master_store_order_reviews r on r.order_id=o.id
 where (needle='' or strpos(lower(o.id::text||' '||coalesce(o.cart_id::text,'')||' '||o.product||' '||o.plan||' '||o.customer::text),needle)>0) and (status_filter='all' or o.status=status_filter) and (outcome_filter='all' or coalesce(r.outcome,'unreviewed')=outcome_filter);
 select coalesce(jsonb_agg(x.row order by x.created_at desc,x.id desc),'[]') into results from(
 select o.created_at,o.id,to_jsonb(o)||jsonb_build_object('sales_outcome',coalesce(r.outcome,'unreviewed'),'sales_note',coalesce(r.note,''),'review_version',coalesce(r.version,0)) row
 from public.master_store_orders o left join public.master_store_order_reviews r on r.order_id=o.id
 where (needle='' or strpos(lower(o.id::text||' '||coalesce(o.cart_id::text,'')||' '||o.product||' '||o.plan||' '||o.customer::text),needle)>0) and (status_filter='all' or o.status=status_filter) and (outcome_filter='all' or coalesce(r.outcome,'unreviewed')=outcome_filter)
 order by o.created_at desc,o.id desc limit 50 offset page_number::bigint*50)x;
 return jsonb_build_object('orders',results,'total',total,'page',page_number,'page_size',50);
end;$$;
create function public.master_store_order_inbox(search_text text,status_filter text,outcome_filter text,page_number integer) returns jsonb language sql security invoker set search_path='' as $$select master_store_private.list_order_inbox(search_text,status_filter,outcome_filter,page_number);$$;
revoke all on function master_store_private.set_order_outcome(uuid,text,text,integer),master_store_private.list_order_inbox(text,text,text,integer),public.master_store_set_order_outcome(uuid,text,text,integer),public.master_store_order_inbox(text,text,text,integer) from public,anon,authenticated;
grant execute on function master_store_private.set_order_outcome(uuid,text,text,integer),master_store_private.list_order_inbox(text,text,text,integer),public.master_store_set_order_outcome(uuid,text,text,integer),public.master_store_order_inbox(text,text,text,integer) to authenticated;

create or replace function master_store_private.checkout_cart(request_id uuid,items jsonb,contact jsonb,method text,quoted_amount bigint) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); q jsonb; old public.master_store_carts; r record; o public.master_store_orders; results jsonb:='[]'; cost bigint;
begin
 if u is null then raise exception 'AUTH_REQUIRED'; end if;
 if request_id is null or contact is null or coalesce(length(contact->>'name'),0) not between 1 and 80 or coalesce(length(contact->>'phone'),0) not between 5 and 30 or coalesce(length(contact->>'email'),0) not between 3 and 120 then raise exception 'INVALID_ORDER'; end if;
 if method is null or method not in ('wallet','InstaPay','Vodafone Cash','Taptap Send','CliQ','Sham Cash','PayPal','Barq','Binance / USDT') then raise exception 'INVALID_PAYMENT'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(u::text,0));
 select * into old from public.master_store_carts where id=request_id;
 if found then
  if old.user_id is distinct from u or old.items<>items or old.payment<>method or old.customer<>contact then raise exception 'REQUEST_CONFLICT'; end if;
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
 insert into public.master_store_carts(id,user_id,items,customer,payment,quote,created_at) values(request_id,u,items,contact,method,q,now());
 for r in select value x from jsonb_array_elements(q->'items') loop
  insert into public.master_store_orders(id,user_id,product_id,plan_index,product,plan,duration,quantity,amount_piasters,customer,payment,status,cart_id,subtotal_piasters,discount_piasters)
  values(gen_random_uuid(),u,r.x->>'product_id',(r.x->>'plan_index')::int,r.x->>'product',r.x->>'plan',r.x->>'duration',(r.x->>'quantity')::int,(r.x->>'amount_piasters')::bigint,contact,method,case when method='wallet' then 'processing' else 'pending_payment' end,request_id,(r.x->>'subtotal_piasters')::bigint,(r.x->>'discount_piasters')::bigint) returning * into o;
  if method='wallet' then insert into public.master_store_ledger(user_id,amount_piasters,kind,order_id) values(u,-o.amount_piasters,'purchase',o.id); end if;
  results:=results||jsonb_build_array(to_jsonb(o));
 end loop;
 return jsonb_build_object('cart_id',request_id,'quote',q,'orders',results);
end; $$;
grant usage on schema master_store_private to anon;

create or replace function master_store_private.place_order(request_id uuid, product_key text, plan_number integer, qty integer, contact jsonb, method text, quoted_amount bigint)
returns public.master_store_orders language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); p public.master_store_plans; result public.master_store_orders; cost bigint;
begin
  if u is null then raise exception 'AUTH_REQUIRED'; end if;
  if qty is null or qty not between 1 and 5 or contact is null or coalesce(length(contact->>'name'),0) not between 1 and 80 or coalesce(length(contact->>'phone'),0) not between 5 and 30 or coalesce(length(contact->>'email'),0) not between 3 and 120 then raise exception 'INVALID_ORDER'; end if;
  if method is null or method not in ('wallet','InstaPay','Vodafone Cash','Taptap Send','CliQ','Sham Cash','PayPal','Barq','Binance / USDT') then raise exception 'INVALID_PAYMENT'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(u::text,0));
  select * into result from public.master_store_orders where id=request_id;
  if found then
    if result.user_id is distinct from u or result.product_id<>product_key or result.plan_index<>plan_number or result.quantity<>qty or result.payment<>method then raise exception 'REQUEST_CONFLICT'; end if;
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

create or replace function master_store_private.review_order(request_id uuid, new_status text)
returns public.master_store_orders language plpgsql security definer set search_path='' as $$
declare result public.master_store_orders; u uuid;
begin
  if not exists(select 1 from public.master_store_admins where user_id=auth.uid()) then raise exception 'ADMIN_REQUIRED'; end if;
  if new_status is null or new_status not in ('processing','completed','cancelled') then raise exception 'INVALID_STATUS'; end if;
  select user_id into u from public.master_store_orders where id=request_id;
  if not found then raise exception 'NOT_FOUND'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(coalesce(u,request_id)::text,0));
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
