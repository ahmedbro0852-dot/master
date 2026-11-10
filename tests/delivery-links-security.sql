begin;
insert into auth.users(id,email,aud,role) values('d1100000-0000-4000-8000-000000000001','delivery-admin-fixture@example.invalid','authenticated','authenticated'),('d1100000-0000-4000-8000-000000000002','delivery-user-fixture@example.invalid','authenticated','authenticated'),('d1100000-0000-4000-8000-000000000003','delivery-other-fixture@example.invalid','authenticated','authenticated');
insert into public.master_store_admins(user_id) values('d1100000-0000-4000-8000-000000000001');
select set_config('request.jwt.claim.sub','d1100000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $$declare result jsonb; begin
 result:=public.master_delivery('create','d2200000-0000-4000-8000-000000000001',repeat('a',64),'{"product":"TEST DELIVERY ONLY","plan":"Test","payload":"TEST ONLY - no real credentials","phone":"201000000000","paid":true,"amount_piasters":100}');
 perform public.master_delivery('create','d2200000-0000-4000-8000-000000000001',repeat('a',64),'{"product":"TEST DELIVERY ONLY","payload":"TEST ONLY - no real credentials","paid":true}');
 begin perform public.master_delivery('create','d2200000-0000-4000-8000-000000000002',repeat('b',64),'{"product":"TEST","payload":"TEST ONLY - no real credentials","paid":true}');raise exception 'TEST_DUPLICATE_ACCEPTED';exception when unique_violation then null;end;
 begin perform public.master_delivery('create','d2200000-0000-4000-8000-000000000002',repeat('b',64),'{"product":"TEST","payload":"OTHER TEST","paid":false}');raise exception 'TEST_UNPAID_ACCEPTED';exception when raise_exception then if sqlerrm<>'INVALID_DELIVERY' then raise;end if;end;
 perform public.master_delivery('create','d2200000-0000-4000-8000-000000000002',repeat('b',64),'{"product":"TEST SIGNED","payload":"OTHER TEST","paid":true}');
end$$;
reset role;
select set_config('request.jwt.claim.sub','',true);
set local role anon;
do $$declare result jsonb; begin
 begin perform public.master_delivery('admin_list');raise exception 'TEST_ADMIN_LEAK';exception when raise_exception then if sqlerrm<>'ADMIN_REQUIRED' then raise;end if;end;
 begin perform public.master_delivery('preview','d2200000-0000-4000-8000-000000000001',repeat('c',64));raise exception 'TEST_BAD_TOKEN';exception when raise_exception then if sqlerrm<>'DELIVERY_UNAVAILABLE' then raise;end if;end;
 result:=public.master_delivery('preview','d2200000-0000-4000-8000-000000000001',repeat('a',64));if result?'payload' or result?'recipient_phone' then raise exception 'TEST_PREVIEW_LEAK';end if;
 result:=public.master_delivery('claim','d2200000-0000-4000-8000-000000000001',repeat('a',64),jsonb_build_object('name','Test Guest','phone','9999999999','claim_key',repeat('d',64)));
 if result->>'payload'<>'TEST ONLY - no real credentials' then raise exception 'TEST_CLAIM_FAILED';end if;
 perform public.master_delivery('read','d2200000-0000-4000-8000-000000000001',repeat('a',64),jsonb_build_object('claim_key',repeat('d',64)));
 begin perform public.master_delivery('claim','d2200000-0000-4000-8000-000000000001',repeat('a',64),jsonb_build_object('name','Other','claim_key',repeat('e',64)));raise exception 'TEST_DOUBLE_CLAIM';exception when raise_exception then if sqlerrm<>'DELIVERY_CLAIMED' then raise;end if;end;
 begin perform 1 from master_delivery_private.links;raise exception 'TEST_TABLE_LEAK';exception when insufficient_privilege then null;end;
end$$;
reset role;
select set_config('request.jwt.claim.sub','d1100000-0000-4000-8000-000000000002',true);
set local role authenticated;
do $$begin
 perform public.master_delivery('claim','d2200000-0000-4000-8000-000000000002',repeat('b',64),jsonb_build_object('name','Test Signed','phone','201000000001','claim_key',repeat('f',64)));
 if jsonb_array_length(public.master_delivery('mine'))<>1 then raise exception 'TEST_MINE_FAILED';end if;
 perform public.master_delivery('read','d2200000-0000-4000-8000-000000000002');
end$$;
reset role;
select set_config('request.jwt.claim.sub','d1100000-0000-4000-8000-000000000003',true);
set local role authenticated;
do $$begin
 if jsonb_array_length(public.master_delivery('mine'))<>0 then raise exception 'TEST_WRONG_OWNER';end if;
 begin perform public.master_delivery('read','d2200000-0000-4000-8000-000000000002');raise exception 'TEST_ACCOUNT_LEAK';exception when raise_exception then if sqlerrm<>'DELIVERY_UNAVAILABLE' then raise;end if;end;
end$$;
reset role;
do $$begin
 if (select recipient_phone from master_delivery_private.links where id='d2200000-0000-4000-8000-000000000001')<>'201000000000' then raise exception 'TEST_PHONE_OVERWRITE';end if;
 if (select count(*) from public.master_crm_subscriptions where reference like 'DL-d2200000-%' and order_status='تم الاستلام' and payment_status='paid')<>2 then raise exception 'TEST_CRM_FAILED';end if;
 if (select user_id from public.master_crm_contacts where name='Test Signed') is distinct from 'd1100000-0000-4000-8000-000000000002'::uuid then raise exception 'TEST_CONTACT_BINDING';end if;
end$$;
select set_config('request.jwt.claim.sub','d1100000-0000-4000-8000-000000000001',true);
set local role authenticated;
select public.master_delivery('revoke','d2200000-0000-4000-8000-000000000001');
reset role;
select set_config('request.jwt.claim.sub','',true);
set local role anon;
do $$begin
 begin perform public.master_delivery('read','d2200000-0000-4000-8000-000000000001',repeat('a',64),jsonb_build_object('claim_key',repeat('d',64)));raise exception 'TEST_REVOKED_ACCEPTED';exception when raise_exception then if sqlerrm<>'DELIVERY_UNAVAILABLE' then raise;end if;end;
end$$;
reset role;
rollback;
select 'PASS: no real orders persisted; admin, payment, token, duplicate payload, preview secrecy, first claim, retry, owner recovery, guest recovery, recipient locking, CRM and revocation boundaries' as validation;
