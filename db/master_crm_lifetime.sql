-- Track lifetime licenses without inventing an expiry date.
alter table public.master_crm_subscriptions add column if not exists perpetual boolean not null default false;
alter table public.master_crm_subscriptions drop constraint master_crm_subscriptions_check2;
alter table public.master_crm_subscriptions add constraint master_crm_active_dates check(lifecycle<>'active' or (starts_on is not null and (ends_on is not null or perpetual)));
alter table public.master_crm_subscriptions add constraint master_crm_perpetual_no_expiry check(not perpetual or ends_on is null);
create or replace function master_store_private.crm_end_date(start_date date,term text) returns date
language plpgsql immutable set search_path='' as $$
declare normalized text; n integer;
begin
 normalized:=translate(lower(trim(term)),'٠١٢٣٤٥٦٧٨٩','0123456789');
 if normalized in ('شهر','سنة','يوم','month','year','day') then normalized:='1 '||normalized;end if;
 if normalized !~ '^\d+\s*(شهر|شهور|أشهر|سنة|سنوات|سنين|يوم|أيام|ايام|month|months|year|years|day|days)$' then return null;end if;
 n:=substring(normalized from '^\d+')::integer;if n<1 or n>36500 then return null;end if;
 if normalized ~ '(شهر|شهور|أشهر|months?)$' then return (start_date+make_interval(months=>n))::date;
 elsif normalized ~ '(سنة|سنوات|سنين|years?)$' then return (start_date+make_interval(years=>n))::date;
 else return start_date+n;end if;
end;$$;
revoke all on function master_store_private.crm_end_date(date,text) from public,anon,authenticated;

create or replace function master_store_private.crm_capture_order() returns trigger
language plpgsql security definer set search_path='' as $$
declare cid uuid; key text; activated date; ending date; permanent boolean:=false;
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
 activated:=(now() at time zone 'Africa/Cairo')::date;ending:=master_store_private.crm_end_date(activated,new.duration);permanent:=new.duration like 'مدى الحياة%';
 end if;
 insert into public.master_crm_subscriptions(contact_id,source_order_id,reference,source,product,plan,duration,quantity,amount_piasters,payment_status,order_status,lifecycle,ordered_on,starts_on,ends_on,perpetual)
 values(cid,new.id,new.id::text,'website',new.product,new.plan,new.duration,new.quantity,new.amount_piasters,
 case when new.status in('processing','completed') then 'paid' when new.status='cancelled' and new.payment='wallet' then 'refunded' else 'unpaid' end,
 new.status,case when new.status='cancelled' then 'cancelled' when ending is not null or permanent then 'active' else 'pending' end,
 (new.created_at at time zone 'Africa/Cairo')::date,activated,ending,permanent)
 on conflict(source_order_id) do update set
 order_status=excluded.order_status,
 perpetual=master_crm_subscriptions.perpetual or excluded.perpetual,
 payment_status=case when excluded.order_status in('processing','completed') then 'paid' when excluded.order_status='cancelled' and new.payment='wallet' then 'refunded' else master_crm_subscriptions.payment_status end,
 starts_on=coalesce(master_crm_subscriptions.starts_on,excluded.starts_on),
 ends_on=coalesce(master_crm_subscriptions.ends_on,excluded.ends_on),
 lifecycle=case when excluded.order_status='cancelled' then 'cancelled' when master_crm_subscriptions.lifecycle='pending' and (excluded.ends_on is not null or excluded.perpetual) then 'active' else master_crm_subscriptions.lifecycle end;
 return new;
end;$$;
