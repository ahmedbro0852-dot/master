-- Integration regression checks. All fixtures and financial entries roll back.
begin;
insert into auth.users(id,email,aud,role,email_confirmed_at,raw_app_meta_data,raw_user_meta_data)
values
 ('10000000-0000-4000-8000-000000000001','master-test-customer@example.invalid','authenticated','authenticated',now(),'{}','{}'),
 ('10000000-0000-4000-8000-000000000002','master-test-other@example.invalid','authenticated','authenticated',now(),'{}','{}'),
 ('10000000-0000-4000-8000-000000000003','master-test-admin@example.invalid','authenticated','authenticated',now(),'{}','{}');
insert into public.master_store_admins(user_id) values('10000000-0000-4000-8000-000000000003');
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
do $$
declare topup public.master_store_topups;
begin
 insert into public.master_store_profiles(user_id,name,phone) values(auth.uid(),'Customer','01000000000');
 begin insert into public.master_store_profiles(user_id,name) values('10000000-0000-4000-8000-000000000002','Intruder');raise exception 'TEST_FAILED: cross-user profile';exception when insufficient_privilege then null;end;
 begin insert into public.master_store_admins(user_id) values(auth.uid());raise exception 'TEST_FAILED: self admin';exception when insufficient_privilege then null;end;
 begin insert into public.master_store_wallets(user_id,balance_piasters) values(auth.uid(),100000);raise exception 'TEST_FAILED: self credit';exception when insufficient_privilege then null;end;
 select * into topup from public.master_store_request_topup('20000000-0000-4000-8000-000000000001',60000,'InstaPay','TEST-TRANSFER-001');
 if topup.status<>'pending' then raise exception 'TEST_FAILED: topup not pending';end if;
 perform public.master_store_request_topup('20000000-0000-4000-8000-000000000001',60000,'InstaPay','TEST-TRANSFER-001');
 if (select count(*) from public.master_store_topups)<>1 then raise exception 'TEST_FAILED: duplicate request';end if;
 if exists(select 1 from public.master_store_wallets where balance_piasters>0) then raise exception 'TEST_FAILED: pending credited';end if;
 begin perform public.master_store_review_topup(topup.id,true);raise exception 'TEST_FAILED: customer approval';exception when raise_exception then if SQLERRM<>'ADMIN_REQUIRED' then raise;end if;end;
 begin perform public.master_store_place_order('30000000-0000-4000-8000-000000000001','lovable-pro',1,1,'{"name":"Test","phone":"01000000000","email":"test@example.invalid"}','wallet',23000);raise exception 'TEST_FAILED: insufficient accepted';exception when raise_exception then if SQLERRM<>'INSUFFICIENT_BALANCE' then raise;end if;end;
 begin perform public.master_store_place_order('30000000-0000-4000-8000-000000000001','lovable-pro',1,1,'{"name":"Test","phone":"01000000000","email":"test@example.invalid"}','wallet',1);raise exception 'TEST_FAILED: fake price';exception when raise_exception then if SQLERRM<>'PRICE_CHANGED' then raise;end if;end;
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
do $$ begin if exists(select 1 from public.master_store_topups) or exists(select 1 from public.master_store_profiles) then raise exception 'TEST_FAILED: private records leaked';end if;end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',true);
select (public.master_store_review_topup('20000000-0000-4000-8000-000000000001',true)).status;
select (public.master_store_review_topup('20000000-0000-4000-8000-000000000001',true)).status;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
do $$ begin
 if (select balance_piasters from public.master_store_wallets where user_id=auth.uid())<>60000 then raise exception 'TEST_FAILED: credit repeated';end if;
 if (select count(*) from public.master_store_ledger)<>1 then raise exception 'TEST_FAILED: repeated ledger';end if;
 perform public.master_store_place_order('30000000-0000-4000-8000-000000000001','lovable-pro',1,1,'{"name":"Test","phone":"01000000000","email":"test@example.invalid"}','wallet',23000);
 perform public.master_store_place_order('30000000-0000-4000-8000-000000000001','lovable-pro',1,1,'{"name":"Test","phone":"01000000000","email":"test@example.invalid"}','wallet',23000);
 if (select balance_piasters from public.master_store_wallets where user_id=auth.uid())<>37000 then raise exception 'TEST_FAILED: debit repeated';end if;
 if (select count(*) from public.master_store_orders)<>1 then raise exception 'TEST_FAILED: order repeated';end if;
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',true);
select (public.master_store_review_order('30000000-0000-4000-8000-000000000001','cancelled')).status;
select (public.master_store_review_order('30000000-0000-4000-8000-000000000001','cancelled')).status;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
do $$ begin
 if (select balance_piasters from public.master_store_wallets where user_id=auth.uid())<>60000 then raise exception 'TEST_FAILED: refund repeated';end if;
 if (select count(*) from public.master_store_ledger)<>3 then raise exception 'TEST_FAILED: refund ledger';end if;
end $$;
reset role;
select 'PASS: ownership, self-credit protection, pending requests, price tampering, insufficient balance, idempotent credits/debits/refunds' as result;
rollback;
