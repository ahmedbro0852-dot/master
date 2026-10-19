begin;
-- All fixtures and resulting audit entries are rolled back.
insert into auth.users(id,email) values('11111111-1111-4111-8111-111111111111','crm-admin-test@example.invalid'),('22222222-2222-4222-8222-222222222222','crm-customer-test@example.invalid');
insert into public.master_store_admins(user_id) values('11111111-1111-4111-8111-111111111111');
select set_config('request.jwt.claims','{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',true);
set local role authenticated;
insert into public.master_crm_contacts(id,name,phone) values('33333333-3333-4333-8333-333333333333','CRM test','201000000000');
insert into public.master_crm_subscriptions(id,contact_id,reference,source,product,duration,amount_piasters,payment_status,lifecycle,starts_on,ends_on)
values('44444444-4444-4444-8444-444444444444','33333333-3333-4333-8333-333333333333','CRM-TEST-OLD','manual','Test plan','1 شهر',12000,'paid','active','2026-01-31','2026-02-28');
insert into public.master_crm_subscriptions(contact_id,reference,source,parent_id,product,amount_piasters)
values('33333333-3333-4333-8333-333333333333','CRM-TEST-RENEW','renewal','44444444-4444-4444-8444-444444444444','Test renewal',12000);
do $$begin
 if (select count(*) from public.master_crm_subscriptions where reference like 'CRM-TEST%')<>2 then raise exception 'CRM manual/renewal failed';end if;
 begin
 insert into public.master_crm_subscriptions(contact_id,reference,source,product) values('33333333-3333-4333-8333-333333333333','CRM-TEST-SPOOF','website','Spoof');
 raise exception 'Website source spoof permitted';
 exception when raise_exception then if sqlerrm<>'CRM_SOURCE_LOCKED' then raise;end if;end;
end;$$;
reset role;
insert into public.master_store_orders(id,user_id,product_id,plan_index,product,plan,duration,quantity,amount_piasters,customer,payment,status)
values('55555555-5555-4555-8555-555555555555','22222222-2222-4222-8222-222222222222','duolingo',0,'Super Duolingo','Super','12 شهر',1,12000,'{"name":"CRM website test","phone":"201111111111","email":"crm-customer-test@example.invalid"}','external','pending_payment');
update public.master_store_orders set status='processing' where id='55555555-5555-4555-8555-555555555555';
update public.master_store_orders set status='completed' where id='55555555-5555-4555-8555-555555555555';
update public.master_store_orders set status='completed' where id='55555555-5555-4555-8555-555555555555';
do $$declare s public.master_crm_subscriptions;begin
 select * into s from public.master_crm_subscriptions where source_order_id='55555555-5555-4555-8555-555555555555';
 if s.lifecycle<>'active' or s.payment_status<>'paid' or s.ends_on is null or s.starts_on is null then raise exception 'Order activation sync failed';end if;
 if (select count(*) from public.master_crm_subscriptions where source_order_id=s.source_order_id)<>1 then raise exception 'Duplicate capture';end if;
 if master_store_private.crm_end_date('2026-01-31','1 شهر')<>'2026-02-28'::date then raise exception 'Month-end date failure';end if;
 if master_store_private.crm_end_date('2026-10-19','غير محدد') is not null then raise exception 'Invented term';end if;
end;$$;
set local role authenticated;
do $$begin
 begin
 update public.master_crm_subscriptions set amount_piasters=100 where source_order_id='55555555-5555-4555-8555-555555555555';
 raise exception 'Source price editable';
 exception when raise_exception then if sqlerrm<>'CRM_ORDER_LOCKED' then raise;end if;end;
end;$$;
reset role;
select set_config('request.jwt.claims','{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}',true);
set local role authenticated;
do $$begin
 if exists(select 1 from public.master_crm_contacts) or exists(select 1 from public.master_crm_subscriptions) then raise exception 'Customer can read CRM';end if;
 begin
 insert into public.master_crm_contacts(name) values('Unauthorized');
 raise exception 'Customer can write CRM';
 exception when insufficient_privilege then null;end;
end;$$;
reset role;
set local role anon;
do $$begin
 begin perform 1 from public.master_crm_contacts;raise exception 'Anonymous can read contacts';exception when insufficient_privilege then null;end;
 begin perform 1 from public.master_crm_subscriptions;raise exception 'Anonymous can read subscriptions';exception when insufficient_privilege then null;end;
end;$$;
reset role;
select 'PASS: admin manual entry and renewal, automatic order activation, idempotency, duration boundaries, source locks, customer/anonymous isolation' as result;
rollback;
