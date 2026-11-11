-- Every Gamma delivery requires both a unique 128-bit private link ticket and PIN 600. The short PIN alone is never sufficient.
-- Existing redemption hashes and customer credentials remain private.
create or replace function master_delivery_private.gamma_dispatch(
 action text, code text, order_id uuid, claim_key text, details jsonb
) returns jsonb language plpgsql security definer set search_path='' as $fn$
declare
 u uuid:=auth.uid();
 a master_delivery_private.gamma_inventory%rowtype;
 r master_delivery_private.gamma_redemptions%rowtype;
 o public.master_store_orders%rowtype;
 normalized_code text;
 token_hash text;
 claim_digest text;
 id_new uuid;
begin
 if action in ('admin_summary','stock_add','issue') then
  if u is null or not exists (select 1 from public.master_store_admins where user_id=u) then
   raise exception 'ADMIN_REQUIRED';
  end if;
  if action='admin_summary' then
   return jsonb_build_object(
    'available',(select count(*) from master_delivery_private.gamma_inventory where assigned_at is null and expires_on>=current_date),
    'expired_stock',(select count(*) from master_delivery_private.gamma_inventory where assigned_at is null and expires_on<current_date),
    'issued',(select count(*) from master_delivery_private.gamma_redemptions where claimed_at is null),
    'delivered',(select count(*) from master_delivery_private.gamma_redemptions where claimed_at is not null),
    'recent',(select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) from
      (select order_id,issued_at,expires_at,claimed_at from master_delivery_private.gamma_redemptions
       order by issued_at desc limit 35) x)
   );
  end if;
  if action='stock_add' then
   if coalesce(length(trim(details->>'email')),0) not between 5 and 320
      or position('@' in coalesce(details->>'email',''))<2
      or coalesce(length(details->>'password'),0) not between 1 and 512
      or coalesce(length(details->>'mailbox_url'),0) not between 10 and 2048
      or left(coalesce(details->>'mailbox_url',''),8)<>'https://'
      or coalesce((details->>'expires_on')::date,current_date-1)<current_date
      or coalesce((details->>'credits_min')::int,4000) not between 1 and 100000
      or coalesce((details->>'credits_estimate')::int,4400) not between 4000 and 100000
      or coalesce((details->>'credits_min')::int,4000)>coalesce((details->>'credits_estimate')::int,4400)
   then raise exception 'INVALID_STOCK';end if;
   insert into master_delivery_private.gamma_inventory
   (email,password,mailbox_url,expires_on,credits_min,credits_estimate,created_by)
   values(trim(details->>'email'),details->>'password',trim(details->>'mailbox_url'),
          (details->>'expires_on')::date,
          coalesce((details->>'credits_min')::int,4000),
          coalesce((details->>'credits_estimate')::int,4400),u)
   returning * into a;
   return jsonb_build_object('saved',true,'inventory_id',a.id);
  end if;
  -- Issuing a code is an explicit, logged, administrator payment confirmation.
  if action='issue' then
   normalized_code:=lower(regexp_replace(coalesce(code,''),'[^0-9a-fA-F]','','g'));
   if order_id is null or length(normalized_code)<>32
      or (details->>'payment_confirmed') is distinct from 'true'
   then raise exception 'INVALID_REQUEST';end if;
   select * into o from public.master_store_orders where id=order_id for update;
   if not found then raise exception 'ORDER_NOT_FOUND';end if;
   if o.product_id<>'gamma-plus' or o.plan_index<>2 then raise exception 'WRONG_PRODUCT';end if;
   if o.status='cancelled' then raise exception 'ORDER_CANCELLED';end if;
   if exists(select 1 from master_delivery_private.gamma_redemptions where gamma_redemptions.order_id=o.id) then
    raise exception 'CODE_ALREADY_ISSUED';
   end if;
   select * into a from master_delivery_private.gamma_inventory
    where assigned_at is null and expires_on>=current_date
    order by expires_on,created_at,id for update skip locked limit 1;
   if not found then raise exception 'OUT_OF_STOCK';end if;
   token_hash:=encode(sha256(convert_to(normalized_code,'UTF8')),'hex');
   id_new:=gen_random_uuid();
   insert into master_delivery_private.gamma_redemptions(id,order_id,inventory_id,code_hash,issued_by)
     values(id_new,o.id,a.id,token_hash,u);
   update master_delivery_private.gamma_inventory set assigned_at=now() where id=a.id;
   update public.master_store_orders set status='processing'
     where id=o.id and status='pending_payment';
   insert into public.master_store_admin_audit(admin_id,action,target,after_data)
     values(u,'gamma_payment_confirmed_code_issued',o.id::text,
            jsonb_build_object('redemption_id',id_new,'inventory_id',a.id));
   return jsonb_build_object('issued',true,'order_id',o.id,'expires_at',(select expires_at from master_delivery_private.gamma_redemptions where id=id_new));
  end if;
 end if;
 if action not in ('redeem','read') then raise exception 'INVALID_ACTION';end if;
 normalized_code:=lower(regexp_replace(coalesce(code,''),'[^0-9a-fA-F]','','g'));
 if length(normalized_code)<>32 or coalesce(claim_key,'') !~ '^[a-f0-9]{64}$' then
  raise exception 'INVALID_CODE';
 end if;
 if action='redeem' and (details->>'pin') is distinct from '600' then
  raise exception 'INVALID_PIN';
 end if;
 token_hash:=encode(sha256(convert_to(normalized_code,'UTF8')),'hex');
 claim_digest:=encode(sha256(convert_to(claim_key,'UTF8')),'hex');
 select * into r from master_delivery_private.gamma_redemptions
  where code_hash=token_hash for update;
 if not found then raise exception 'INVALID_CODE';end if;
 if r.claimed_at is null then
  if action<>'redeem' or r.expires_at<now() then raise exception 'CODE_EXPIRED';end if;
  update master_delivery_private.gamma_redemptions
    set claimed_at=now(),claim_hash=claim_digest,customer_user_id=u
    where id=r.id returning * into r;
  update public.master_store_orders set status='completed'
    where id=r.order_id and status='processing';
 else
  if r.claim_hash is distinct from claim_digest then raise exception 'CODE_ALREADY_REDEEMED';end if;
 end if;
 select * into a from master_delivery_private.gamma_inventory where id=r.inventory_id;
 return jsonb_build_object(
  'product','Gamma Pro','plan','Pro — شهر','price_egp',600,
  'order_id',r.order_id,'email',a.email,'password',a.password,
  'mailbox_url',a.mailbox_url,'expires_on',a.expires_on,
  'credits_estimate',a.credits_estimate,'credits_min',a.credits_min,
  'warranty','ضمان كامل خلال مدة الاشتراك','claimed_at',r.claimed_at
 );
end;$fn$;
