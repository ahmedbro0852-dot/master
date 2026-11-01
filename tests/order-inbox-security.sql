begin;
insert into auth.users(id,email,aud,role,email_confirmed_at,raw_app_meta_data,raw_user_meta_data) values
('a3100000-0000-4000-8000-000000000001','inbox-admin@example.invalid','authenticated','authenticated',now(),'{}','{}'),
('a3100000-0000-4000-8000-000000000002','inbox-client@example.invalid','authenticated','authenticated',now(),'{}','{}');
insert into public.master_store_wallets(user_id,balance_piasters) values('a3100000-0000-4000-8000-000000000002',20000);
insert into public.master_store_admins(user_id) values('a3100000-0000-4000-8000-000000000001');
insert into public.master_store_plans(product_id,plan_index,product_name,plan_name,duration,price_piasters,available,max_quantity) values('inbox-rollback-fixture',0,'Rollback fixture','Fixture','1 شهر',10000,true,5),('inbox-rollback-fixture',1,'Rollback fixture','Unavailable','1 شهر',10000,false,5);
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$
declare a jsonb:='[{"product_id":"inbox-rollback-fixture","plan_index":0,"quantity":1}]'; c jsonb:='{"name":"Rollback test","phone":"+201000000001","email":"inbox-guest@example.invalid"}'; r jsonb;
begin
 begin perform public.master_store_guest_checkout('a3200000-0000-4000-8000-000000000001','a3300000-0000-4000-8000-000000000001',a,c,'wallet',10000);raise exception 'accepted guest wallet';exception when raise_exception then if SQLERRM<>'INVALID_PAYMENT' then raise;end if;end;
 begin perform public.master_store_guest_checkout('a3200000-0000-4000-8000-000000000001','a3300000-0000-4000-8000-000000000001',a,c,'InstaPay',1);raise exception 'accepted fake price';exception when raise_exception then if SQLERRM<>'PRICE_CHANGED' then raise;end if;end;
 begin perform public.master_store_guest_checkout('a3200000-0000-4000-8000-000000000001','a3300000-0000-4000-8000-000000000001','[{"product_id":"inbox-rollback-fixture","plan_index":1,"quantity":1}]',c,'InstaPay',10000);raise exception 'accepted unavailable';exception when raise_exception then if SQLERRM<>'PLAN_UNAVAILABLE' then raise;end if;end;
 r:=public.master_store_guest_checkout('a3200000-0000-4000-8000-000000000001','a3300000-0000-4000-8000-000000000001',a,c,'InstaPay',10000);
 if r->'orders'->0->>'status'<>'pending_payment' or r->'orders'->0->>'user_id' is not null then raise exception 'guest marked paid';end if;
 if public.master_store_guest_checkout('a3200000-0000-4000-8000-000000000001','a3300000-0000-4000-8000-000000000001',a,c,'InstaPay',10000)<>r then raise exception 'retry changed order';end if;
 perform public.master_store_guest_checkout('a3200000-0000-4000-8000-000000000002','a3300000-0000-4000-8000-000000000002',a,c,'InstaPay',10000);
 begin perform public.master_store_guest_receipt('a3200000-0000-4000-8000-000000000001','a3300000-0000-4000-8000-000000000099');raise exception 'receipt leaked';exception when raise_exception then if SQLERRM<>'RECEIPT_UNAVAILABLE' then raise;end if;end;
 begin perform public.master_store_guest_checkout('a3200000-0000-4000-8000-000000000001','a3300000-0000-4000-8000-000000000099',a,c,'InstaPay',10000);raise exception 'retry leaked';exception when raise_exception then if SQLERRM<>'REQUEST_CONFLICT' then raise;end if;end;
 begin perform 1 from public.master_store_orders;raise exception 'public table read';exception when insufficient_privilege then null;end;
 begin perform public.master_store_order_inbox('','all','all',0);raise exception 'public admin access';exception when insufficient_privilege then null;end;
end;$$;
reset role;
do $$begin
 if (select count(*) from public.master_store_orders where product_id='inbox-rollback-fixture')<>2 then raise exception 'repeat customer not preserved / retry duplicated';end if;
 if (select count(*) from public.master_crm_subscriptions where source_order_id in(select id from public.master_store_orders where product_id='inbox-rollback-fixture'))<>2 then raise exception 'CRM missing guest';end if;
 if exists(select 1 from public.master_store_ledger where order_id in(select id from public.master_store_orders where product_id='inbox-rollback-fixture')) then raise exception 'guest moved money';end if;
end;$$;
set local role authenticated;
select set_config('request.jwt.claim.sub','a3100000-0000-4000-8000-000000000002',true);
do $$declare o uuid;begin
 begin perform public.master_store_order_inbox('','all','all',0);raise exception 'customer admin access';exception when raise_exception then if SQLERRM<>'ADMIN_REQUIRED' then raise;end if;end;
 begin perform public.master_store_set_order_outcome(gen_random_uuid(),'purchased','stolen',0);raise exception 'customer review access';exception when raise_exception then if SQLERRM<>'ADMIN_REQUIRED' then raise;end if;end;
 begin perform public.master_store_checkout_cart('a3200000-0000-4000-8000-000000000001','[{"product_id":"inbox-rollback-fixture","plan_index":0,"quantity":1}]','{"name":"Rollback test","phone":"+201000000001","email":"inbox-guest@example.invalid"}','InstaPay',10000);raise exception 'account stole guest cart';exception when raise_exception then if SQLERRM<>'REQUEST_CONFLICT' then raise;end if;end;
 if exists(select 1 from public.master_store_orders where product_id='inbox-rollback-fixture') or exists(select 1 from public.master_store_order_reviews) then raise exception 'customer private rows leaked';end if;
 o:=(public.master_store_guest_receipt('a3200000-0000-4000-8000-000000000001','a3300000-0000-4000-8000-000000000001')->0->>'id')::uuid;
 begin perform public.master_store_place_order(o,'inbox-rollback-fixture',0,1,'{"name":"Client","phone":"01000000001","email":"client@example.invalid"}','InstaPay',10000);raise exception 'account stole guest order';exception when raise_exception then if SQLERRM<>'REQUEST_CONFLICT' then raise;end if;end;
 perform public.master_store_checkout_cart('a3200000-0000-4000-8000-000000000003','[{"product_id":"inbox-rollback-fixture","plan_index":0,"quantity":1}]','{"name":"Client","phone":"01000000001","email":"client@example.invalid"}','wallet',10000);
 perform public.master_store_checkout_cart('a3200000-0000-4000-8000-000000000003','[{"product_id":"inbox-rollback-fixture","plan_index":0,"quantity":1}]','{"name":"Client","phone":"01000000001","email":"client@example.invalid"}','wallet',10000);
 if (select balance_piasters from public.master_store_wallets where user_id=auth.uid())<>10000 then raise exception 'wallet retry debited twice';end if;
 perform public.master_store_place_order('a3200000-0000-4000-8000-000000000004','inbox-rollback-fixture',0,1,'{"name":"Client","phone":"01000000001","email":"client@example.invalid"}','InstaPay',10000);

end;$$;
reset role;
-- More than the old 500-row cap, all synthetic and rolled back.
insert into public.master_store_orders(id,user_id,product_id,plan_index,product,plan,duration,quantity,amount_piasters,customer,payment,status,created_at)
select gen_random_uuid(),'a3100000-0000-4000-8000-000000000002','inbox-pagination-fixture',0,'Pagination fixture','Fixture','1 شهر',1,10000,'{"name":"Pagination fixture","email":"page@example.invalid","phone":"01000000000"}','InstaPay','pending_payment',now()-i*interval '1 day' from generate_series(1,501)i;
set local role authenticated;
select set_config('request.jwt.claim.sub','a3100000-0000-4000-8000-000000000001',true);
do $$declare r jsonb; o uuid; review jsonb;begin
 r:=public.master_store_order_inbox('Pagination fixture','all','all',10);
 if (r->>'total')::int<>501 or jsonb_array_length(r->'orders')<>1 then raise exception 'old history inaccessible';end if;
 r:=public.master_store_order_inbox('inbox-guest@example.invalid','all','all',0);o:=(r->'orders'->0->>'id')::uuid;
 review:=public.master_store_set_order_outcome(o,'purchased','Admin-only test note',0);
 if (select status from public.master_store_orders where id=o)<>'pending_payment' then raise exception 'classification confirmed payment';end if;
 begin perform public.master_store_set_order_outcome(o,'not_purchased','stale',0);raise exception 'stale review accepted';exception when raise_exception then if SQLERRM<>'EDIT_CONFLICT' then raise;end if;end;
 perform public.master_store_set_order_outcome(o,'not_purchased','Reversible review',1);
 if (public.master_store_order_inbox(o::text,'all','not_purchased',0)->>'total')::int<>1 then raise exception 'outcome filter failed';end if;
 if (public.master_store_guest_receipt('a3200000-0000-4000-8000-000000000001','a3300000-0000-4000-8000-000000000001')->0) ? 'sales_note' then raise exception 'admin note leaked';end if;
 perform public.master_store_review_order(o,'cancelled');
 if not exists(select 1 from public.master_store_admin_audit where target=o::text and action='order_sales_review') then raise exception 'review not audited';end if;
 select id into o from public.master_store_orders where cart_id='a3200000-0000-4000-8000-000000000003';
 perform public.master_store_review_order(o,'cancelled');perform public.master_store_review_order(o,'cancelled');
 if (select balance_piasters from public.master_store_wallets where user_id='a3100000-0000-4000-8000-000000000002')<>20000 then raise exception 'wallet refund failed';end if;

end;$$;
reset role;
rollback;
