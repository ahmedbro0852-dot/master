-- Private, manually paid WhatsApp-order delivery. No credentials in public tables or audit payloads.
create schema if not exists master_delivery_private;
revoke all on schema master_delivery_private from public;
grant usage on schema master_delivery_private to anon,authenticated;
create table master_delivery_private.links(
 id uuid primary key, token_hash text not null, payload_hash text not null unique,
 product text not null check(length(product) between 1 and 160), plan text not null default '' check(length(plan)<=160),
 payload text not null check(length(payload) between 1 and 20000), instructions text not null default '' check(length(instructions)<=5000),
 recipient_name text not null default '', recipient_phone text not null default '',
 user_id uuid references auth.users(id) on delete set null, claim_hash text,
 created_by uuid not null references auth.users(id), created_at timestamptz not null default now(),
 expires_at timestamptz not null default now()+interval '30 days',claimed_at timestamptz,revoked_at timestamptz,
 crm_id uuid not null unique references public.master_crm_subscriptions(id)
);
alter table master_delivery_private.links enable row level security;
revoke all on master_delivery_private.links from public,anon,authenticated;
create index delivery_owner_idx on master_delivery_private.links(user_id) where user_id is not null;
create function master_delivery_private.dispatch(action text, delivery_id uuid, access_token text, details jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r master_delivery_private.links; u uuid:=auth.uid(); t text; k text; nm text; ph text; cid uuid; crid uuid; result jsonb;
begin
 if action in ('create','admin_list','revoke') then
  if u is null or not exists(select 1 from public.master_store_admins where user_id=u) then raise exception 'ADMIN_REQUIRED';end if;
  if action='admin_list' then
   select coalesce(jsonb_agg(x),'[]') into result from (select id,product,plan,recipient_name,recipient_phone,created_at,expires_at,claimed_at,revoked_at,crm_id from master_delivery_private.links order by created_at desc limit 200)x;
   return result;
  end if;
  if action='revoke' then
   update master_delivery_private.links set revoked_at=coalesce(revoked_at,now()) where id=delivery_id;
   if not found then raise exception 'DELIVERY_UNAVAILABLE';end if;
   return jsonb_build_object('revoked',true);
  end if;
  if delivery_id is null or access_token is null or access_token !~ '^[a-f0-9]{64}$' or (details->>'paid') is distinct from 'true' then raise exception 'INVALID_DELIVERY';end if;
  if coalesce(length(trim(details->>'product')),0) not between 1 and 160 or coalesce(length(trim(details->>'payload')),0) not between 1 and 20000 or coalesce(length(details->>'instructions'),0)>5000 or coalesce(length(details->>'plan'),0)>160 or coalesce(length(details->>'name'),0)>120 or coalesce(length(details->>'phone'),0)>40 then raise exception 'INVALID_DELIVERY';end if;
  nm:=trim(coalesce(details->>'name',''));ph:=regexp_replace(coalesce(details->>'phone',''),'[^0-9]','','g');
  if ph<>'' and ph !~ '^[0-9]{8,15}$' then raise exception 'INVALID_PHONE';end if;
  perform pg_advisory_xact_lock(hashtextextended(delivery_id::text,0));
  select * into r from master_delivery_private.links where id=delivery_id;
  if found then
   if r.created_by<>u or r.token_hash<>encode(sha256(convert_to(access_token,'UTF8')),'hex') then raise exception 'DELIVERY_CONFLICT';end if;
   return jsonb_build_object('id',r.id,'crm_id',r.crm_id);
  end if;
  cid:=gen_random_uuid();crid:=gen_random_uuid();
  insert into public.master_crm_contacts(id,name,phone) values(cid,coalesce(nullif(nm,''),'عميل رابط استلام'),ph);
  insert into public.master_crm_subscriptions(id,contact_id,reference,source,product,plan,duration,amount_piasters,payment_status,order_status,lifecycle,notes)
  values(crid,cid,'DL-'||delivery_id::text,'manual',trim(details->>'product'),coalesce(details->>'plan',''),coalesce(left(details->>'duration',80),''),coalesce((details->>'amount_piasters')::bigint,0),'paid','جاهز للاستلام','pending','طلب واتساب مدفوع — رابط تسليم خاص. بيانات الدخول محفوظة في سجل التسليم الخاص.');
  insert into master_delivery_private.links(id,token_hash,payload_hash,product,plan,payload,instructions,recipient_name,recipient_phone,created_by,crm_id)
  values(delivery_id,encode(sha256(convert_to(access_token,'UTF8')),'hex'),encode(sha256(convert_to(trim(details->>'payload'),'UTF8')),'hex'),trim(details->>'product'),coalesce(details->>'plan',''),trim(details->>'payload'),coalesce(details->>'instructions',''),nm,ph,u,crid);
  return jsonb_build_object('id',delivery_id,'crm_id',crid);
 end if;
 if action='mine' then
  if u is null then raise exception 'AUTH_REQUIRED';end if;
  select coalesce(jsonb_agg(x),'[]') into result from (select id,product,plan,claimed_at from master_delivery_private.links where user_id=u and revoked_at is null and claimed_at is not null order by claimed_at desc limit 100)x;return result;
 end if;
 if action not in ('preview','claim','read') or action is null then raise exception 'INVALID_ACTION';end if;
 select * into r from master_delivery_private.links where id=delivery_id for update;
 if not found or r.revoked_at is not null then raise exception 'DELIVERY_UNAVAILABLE';end if;
 -- The owner may recover a claimed order from their account without the original link.
 if action='read' and u is not null and r.user_id=u and r.claimed_at is not null then
  return jsonb_build_object('id',r.id,'product',r.product,'plan',r.plan,'payload',r.payload,'instructions',r.instructions,'claimed_at',r.claimed_at);
 end if;
 if access_token is null or access_token !~ '^[a-f0-9]{64}$' or r.token_hash<>encode(sha256(convert_to(access_token,'UTF8')),'hex') then raise exception 'DELIVERY_UNAVAILABLE';end if;
 if r.claimed_at is null and r.expires_at<now() then raise exception 'DELIVERY_UNAVAILABLE';end if;
 if action='preview' then
  return jsonb_build_object('id',r.id,'product',r.product,'plan',r.plan,'needs_phone',r.recipient_phone='','claimed',r.claimed_at is not null);
 end if;
 k:=details->>'claim_key';
 if k is null or k !~ '^[a-f0-9]{64}$' then raise exception 'INVALID_DELIVERY';end if;
 t:=encode(sha256(convert_to(k,'UTF8')),'hex');
 if r.claimed_at is not null then
  if r.user_id is not null then
   if u is null or u<>r.user_id then raise exception 'DELIVERY_CLAIMED';end if;
  elsif r.claim_hash<>t then raise exception 'DELIVERY_CLAIMED';end if;
 else
  if action<>'claim' then raise exception 'DELIVERY_UNAVAILABLE';end if;
  nm:=trim(coalesce(nullif(r.recipient_name,''),details->>'name',''));ph:=coalesce(nullif(r.recipient_phone,''),regexp_replace(coalesce(details->>'phone',''),'[^0-9]','','g'));
  if length(nm) not between 1 and 120 or ph !~ '^[0-9]{8,15}$' then raise exception 'RECIPIENT_REQUIRED';end if;
  update master_delivery_private.links set recipient_name=nm,recipient_phone=ph,user_id=u,claim_hash=t,claimed_at=now() where id=r.id returning * into r;
  update public.master_crm_contacts set name=nm,phone=ph,user_id=u where id=(select contact_id from public.master_crm_subscriptions where id=r.crm_id);
  update public.master_crm_subscriptions set order_status='تم الاستلام',notes=left(notes||E'\nتم فتح صندوق التسليم وتسجيل المستلم.',4000) where id=r.crm_id;
 end if;
 return jsonb_build_object('id',r.id,'product',r.product,'plan',r.plan,'payload',r.payload,'instructions',r.instructions,'claimed_at',r.claimed_at);
end;$$;
revoke all on function master_delivery_private.dispatch(text,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function master_delivery_private.dispatch(text,uuid,text,jsonb) to anon,authenticated;
create function public.master_delivery(action text,delivery_id uuid default null,access_token text default null,details jsonb default '{}')
returns jsonb language sql security invoker set search_path='' as $$select master_delivery_private.dispatch(action,delivery_id,access_token,details);$$;
revoke all on function public.master_delivery(text,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.master_delivery(text,uuid,text,jsonb) to anon,authenticated;
create policy delivery_no_direct_client_access on master_delivery_private.links for all to anon,authenticated using(false) with check(false);
comment on table master_delivery_private.links is 'Private paid delivery payloads. Direct client access intentionally denied. Token/owner-authorized RPC only; never expose in Data API schemas.';
