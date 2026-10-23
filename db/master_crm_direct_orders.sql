-- Atomic, retry-safe manual order entry. Existing admin RLS applies to every write.
create or replace function public.master_store_crm_add_order(request_id uuid, customer jsonb, subscription jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare c public.master_crm_contacts; s public.master_crm_subscriptions; old_s public.master_crm_subscriptions; cid uuid; expected jsonb;
begin
 if not exists(select 1 from public.master_store_admins where user_id=(select auth.uid())) then raise exception 'ADMIN_REQUIRED';end if;
 if request_id is null or jsonb_typeof(customer)<>'object' or jsonb_typeof(subscription)<>'object' then raise exception 'INVALID_ORDER';end if;
 perform pg_advisory_xact_lock(hashtextextended(request_id::text,0));
 cid:=coalesce(nullif(customer->>'id','')::uuid,request_id);
 s:=jsonb_populate_record(null::public.master_crm_subscriptions,subscription);
 s.id:=request_id;s.contact_id:=cid;s.source_order_id:=null;s.source:=case when s.parent_id is null then 'manual' else 'renewal' end;
 s.reference:=coalesce(nullif(trim(s.reference),''),'MS-'||request_id::text);
 s.product:=trim(s.product);s.plan:=coalesce(trim(s.plan),'');s.duration:=coalesce(trim(s.duration),'');s.notes:=coalesce(trim(s.notes),'');
 s.quantity:=coalesce(s.quantity,1);s.amount_piasters:=coalesce(s.amount_piasters,0);s.payment_status:=coalesce(s.payment_status,'unpaid');s.lifecycle:=coalesce(s.lifecycle,'pending');s.order_status:='manual';s.perpetual:=coalesce(s.perpetual,false);s.ordered_on:=coalesce(s.ordered_on,(now() at time zone 'Africa/Cairo')::date);
 expected:=to_jsonb(s)-'created_at'-'updated_at';
 select * into old_s from public.master_crm_subscriptions where id=request_id;
 if found then
  if (to_jsonb(old_s)-'created_at'-'updated_at') is distinct from expected then raise exception 'REQUEST_CONFLICT';end if;
  if nullif(customer->>'id','') is null then
   select * into c from public.master_crm_contacts where id=cid;
   if c.name is distinct from trim(customer->>'name') or c.phone is distinct from coalesce(trim(customer->>'phone'),'') or c.email is distinct from coalesce(trim(customer->>'email'),'') then raise exception 'REQUEST_CONFLICT';end if;
  end if;
  return jsonb_build_object('id',old_s.id,'contact_id',cid,'reference',old_s.reference);
 end if;
 if nullif(customer->>'id','') is null then
  insert into public.master_crm_contacts(id,name,phone,email) values(cid,trim(customer->>'name'),coalesce(trim(customer->>'phone'),''),coalesce(trim(customer->>'email'),''));
 elsif not exists(select 1 from public.master_crm_contacts where id=cid) then raise exception 'CUSTOMER_NOT_FOUND';end if;
 if s.parent_id is not null and not exists(select 1 from public.master_crm_subscriptions where id=s.parent_id and contact_id=cid) then raise exception 'INVALID_RENEWAL';end if;
 insert into public.master_crm_subscriptions(id,contact_id,reference,source,parent_id,product,plan,duration,quantity,amount_piasters,payment_status,order_status,lifecycle,ordered_on,starts_on,ends_on,warranty_ends_on,notes,perpetual)
 values(s.id,s.contact_id,s.reference,s.source,s.parent_id,s.product,s.plan,s.duration,s.quantity,s.amount_piasters,s.payment_status,s.order_status,s.lifecycle,s.ordered_on,s.starts_on,s.ends_on,s.warranty_ends_on,s.notes,s.perpetual);
 return jsonb_build_object('id',s.id,'contact_id',cid,'reference',s.reference);
end;$$;
revoke all on function public.master_store_crm_add_order(uuid,jsonb,jsonb) from public,anon;
grant execute on function public.master_store_crm_add_order(uuid,jsonb,jsonb) to authenticated;
