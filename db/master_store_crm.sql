-- Store CRM: admin-only contacts, subscription history and automatic order capture.
create table public.master_crm_contacts (
 id uuid primary key default gen_random_uuid(), identity_key text unique,
 user_id uuid references auth.users(id) on delete set null,
 name text not null check(length(trim(name)) between 1 and 120),
 phone text not null default '' check(length(phone)<=40),
 email text not null default '' check(length(email)<=160),
 notes text not null default '' check(length(notes)<=2000),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.master_crm_subscriptions (
 id uuid primary key default gen_random_uuid(),
 contact_id uuid not null references public.master_crm_contacts(id),
 source_order_id uuid unique references public.master_store_orders(id),
 reference text not null unique check(length(reference) between 1 and 100),
 source text not null check(source in ('website','manual','renewal')),
 parent_id uuid references public.master_crm_subscriptions(id),
 product text not null check(length(trim(product)) between 1 and 160),
 plan text not null default '' check(length(plan)<=160),
 duration text not null default '' check(length(duration)<=80),
 quantity integer not null default 1 check(quantity between 1 and 100),
 amount_piasters bigint not null default 0 check(amount_piasters between 0 and 1000000000),
 payment_status text not null default 'unpaid' check(payment_status in ('unpaid','paid','refunded')),
 order_status text not null default 'manual',
 lifecycle text not null default 'pending' check(lifecycle in ('pending','active','paused','cancelled','finished')),
 ordered_on date not null default current_date,
 starts_on date, ends_on date, warranty_ends_on date,
 notes text not null default '' check(length(notes)<=4000),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(ends_on is null or (starts_on is not null and ends_on>starts_on)),
 check(warranty_ends_on is null or (starts_on is not null and warranty_ends_on>=starts_on)),
 check(lifecycle<>'active' or (starts_on is not null and ends_on is not null))
);
create index master_crm_contact_user on public.master_crm_contacts(user_id);
create index master_crm_subscription_contact on public.master_crm_subscriptions(contact_id);
create index master_crm_subscription_parent on public.master_crm_subscriptions(parent_id);
create index master_crm_subscription_expiry on public.master_crm_subscriptions(ends_on) where lifecycle='active';
alter table public.master_crm_contacts enable row level security;
alter table public.master_crm_subscriptions enable row level security;
revoke all on public.master_crm_contacts,public.master_crm_subscriptions from public,anon,authenticated;
grant select,insert,update on public.master_crm_contacts,public.master_crm_subscriptions to authenticated;
grant all on public.master_crm_contacts,public.master_crm_subscriptions to service_role;
create policy crm_contacts_admin on public.master_crm_contacts for all to authenticated
 using(exists(select 1 from public.master_store_admins where user_id=(select auth.uid())))
 with check(exists(select 1 from public.master_store_admins where user_id=(select auth.uid())));
create policy crm_subscriptions_admin on public.master_crm_subscriptions for all to authenticated
 using(exists(select 1 from public.master_store_admins where user_id=(select auth.uid())))
 with check(exists(select 1 from public.master_store_admins where user_id=(select auth.uid())));

create function master_store_private.crm_stamp() returns trigger language plpgsql set search_path='' as $$
begin
 if tg_op='UPDATE' then
  if old.updated_at is distinct from new.updated_at then raise exception 'EDIT_CONFLICT'; end if;
  new.id:=old.id; new.created_at:=old.created_at;
  if tg_table_name='master_crm_subscriptions' and pg_trigger_depth()=1 then
   if new.source_order_id is distinct from old.source_order_id or new.source is distinct from old.source or new.parent_id is distinct from old.parent_id then raise exception 'CRM_SOURCE_LOCKED';end if;
   if old.source_order_id is not null and (new.amount_piasters is distinct from old.amount_piasters or new.payment_status is distinct from old.payment_status or new.order_status is distinct from old.order_status or new.reference is distinct from old.reference or new.product is distinct from old.product or new.plan is distinct from old.plan or new.quantity is distinct from old.quantity or new.contact_id is distinct from old.contact_id) then raise exception 'CRM_ORDER_LOCKED';end if;
  end if;
 end if;
 if tg_op='INSERT' and tg_table_name='master_crm_subscriptions' and pg_trigger_depth()=1 then
  if new.source_order_id is not null or new.source='website' then raise exception 'CRM_SOURCE_LOCKED';end if;
 end if;
 new.updated_at:=clock_timestamp(); return new;
end;$$;
revoke all on function master_store_private.crm_stamp() from public,anon,authenticated;
create trigger crm_contact_stamp before insert or update on public.master_crm_contacts for each row execute function master_store_private.crm_stamp();
create trigger crm_subscription_stamp before insert or update on public.master_crm_subscriptions for each row execute function master_store_private.crm_stamp();

create function master_store_private.crm_audit() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is not null and exists(select 1 from public.master_store_admins where user_id=auth.uid()) then
 insert into public.master_store_admin_audit(admin_id,action,target,before_data,after_data)
 values(auth.uid(),tg_table_name,new.id::text,case when tg_op='UPDATE' then to_jsonb(old) else null end,to_jsonb(new));
 end if;return new;
end;$$;
revoke all on function master_store_private.crm_audit() from public,anon,authenticated;
create trigger crm_contact_audit after insert or update on public.master_crm_contacts for each row execute function master_store_private.crm_audit();
create trigger crm_subscription_audit after insert or update on public.master_crm_subscriptions for each row execute function master_store_private.crm_audit();

-- Only unambiguous terms are inferred; unknown duration remains unset for review.
create function master_store_private.crm_end_date(start_date date,term text) returns date
language plpgsql immutable set search_path='' as $$
declare normalized text; n integer;
begin
 normalized:=translate(trim(term),'٠١٢٣٤٥٦٧٨٩','0123456789');
 if normalized !~ '^\d+\s*(شهر|شهور|أشهر|سنة|سنوات|سنين|يوم|أيام|ايام|month|months|year|years|day|days)$' then return null;end if;
 n:=substring(normalized from '^\d+')::integer;if n<1 or n>36500 then return null;end if;
 if normalized ~ '(شهر|شهور|أشهر|months?)$' then return (start_date+make_interval(months=>n))::date;
 elsif normalized ~ '(سنة|سنوات|سنين|years?)$' then return (start_date+make_interval(years=>n))::date;
 else return start_date+n;end if;
end;$$;
revoke all on function master_store_private.crm_end_date(date,text) from public,anon,authenticated;

create function master_store_private.crm_capture_order() returns trigger
language plpgsql security definer set search_path='' as $$
declare cid uuid; key text; activated date; ending date;
begin
 key:=case when new.user_id is not null then 'user:'||new.user_id::text
 when nullif(trim(new.customer->>'email'),'') is not null then 'email:'||lower(trim(new.customer->>'email'))
 when nullif(trim(new.customer->>'phone'),'') is not null then 'phone:'||regexp_replace(new.customer->>'phone','[^0-9+]','','g')
 else 'order:'||new.id::text end;
 insert into public.master_crm_contacts(identity_key,user_id,name,phone,email)
 values(key,new.user_id,left(coalesce(nullif(trim(new.customer->>'name'),''),'عميل الموقع'),120),left(coalesce(new.customer->>'phone',''),40),left(coalesce(new.customer->>'email',''),160))
 on conflict(identity_key) do update set user_id=coalesce(master_crm_contacts.user_id,excluded.user_id)
 returning id into cid;
 if new.status='completed' and (tg_op='INSERT' or old.status is distinct from 'completed') then
 activated:=(now() at time zone 'Africa/Cairo')::date;ending:=master_store_private.crm_end_date(activated,new.duration);
 end if;
 insert into public.master_crm_subscriptions(contact_id,source_order_id,reference,source,product,plan,duration,quantity,amount_piasters,payment_status,order_status,lifecycle,ordered_on,starts_on,ends_on)
 values(cid,new.id,new.id::text,'website',new.product,new.plan,new.duration,new.quantity,new.amount_piasters,
 case when new.status in('processing','completed') then 'paid' when new.status='cancelled' and new.payment='wallet' then 'refunded' else 'unpaid' end,
 new.status,case when new.status='cancelled' then 'cancelled' when ending is not null then 'active' else 'pending' end,
 (new.created_at at time zone 'Africa/Cairo')::date,activated,ending)
 on conflict(source_order_id) do update set
 order_status=excluded.order_status,
 payment_status=case when excluded.order_status in('processing','completed') then 'paid' when excluded.order_status='cancelled' and new.payment='wallet' then 'refunded' else master_crm_subscriptions.payment_status end,
 starts_on=coalesce(master_crm_subscriptions.starts_on,excluded.starts_on),
 ends_on=coalesce(master_crm_subscriptions.ends_on,excluded.ends_on),
 lifecycle=case when excluded.order_status='cancelled' then 'cancelled' when master_crm_subscriptions.lifecycle='pending' and excluded.ends_on is not null then 'active' else master_crm_subscriptions.lifecycle end;
 return new;
end;$$;
revoke all on function master_store_private.crm_capture_order() from public,anon,authenticated;
create trigger crm_capture_order after insert or update of status on public.master_store_orders for each row execute function master_store_private.crm_capture_order();

-- Backfill recorded orders without inventing historical activation dates.
insert into public.master_crm_contacts(identity_key,user_id,name,phone,email)
select distinct on (o.user_id) 'user:'||o.user_id::text,o.user_id,left(coalesce(nullif(o.customer->>'name',''),'عميل الموقع'),120),left(coalesce(o.customer->>'phone',''),40),left(coalesce(o.customer->>'email',''),160)
from public.master_store_orders o where o.user_id is not null order by o.user_id,o.created_at desc on conflict(identity_key) do nothing;
-- Website rows are inserted inside a trigger path, avoiding manual source impersonation.
alter table public.master_crm_subscriptions disable trigger crm_subscription_stamp;
insert into public.master_crm_subscriptions(contact_id,source_order_id,reference,source,product,plan,duration,quantity,amount_piasters,payment_status,order_status,lifecycle,ordered_on)
select c.id,o.id,o.id::text,'website',o.product,o.plan,o.duration,o.quantity,o.amount_piasters,
case when o.status in('completed','processing') then 'paid' else 'unpaid' end,o.status,case when o.status='cancelled' then 'cancelled' else 'pending' end,(o.created_at at time zone 'Africa/Cairo')::date
from public.master_store_orders o join public.master_crm_contacts c on c.identity_key='user:'||o.user_id::text on conflict(source_order_id) do nothing;
alter table public.master_crm_subscriptions enable trigger crm_subscription_stamp;
