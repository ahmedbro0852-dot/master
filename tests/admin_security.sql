begin;
insert into auth.users(id,email,aud,role,email_confirmed_at,raw_app_meta_data,raw_user_meta_data) values
('12000000-0000-4000-8000-000000000001','admin-customer@example.invalid','authenticated','authenticated',now(),'{}','{"role":"admin"}'),
('12000000-0000-4000-8000-000000000002','admin-controller@example.invalid','authenticated','authenticated',now(),'{}','{}');
insert into public.master_store_profiles(user_id,name) values('12000000-0000-4000-8000-000000000001','Test customer');
insert into public.master_store_admins values('12000000-0000-4000-8000-000000000002');
insert into public.master_store_plans(product_id,plan_index,product_name,plan_name,duration,price_piasters,available) values('admin-test-plan',0,'Admin test','Test plan','Month',10000,true);
set local role authenticated;
select set_config('request.jwt.claim.sub','12000000-0000-4000-8000-000000000001',true);
do $$ begin
 begin perform public.master_store_admin_snapshot();raise exception 'customer admin access';exception when raise_exception then if SQLERRM<>'ADMIN_REQUIRED' then raise;end if;end;
 begin perform public.master_store_admin_adjust_wallet('22000000-0000-4000-8000-000000000001',auth.uid(),50000,'Fake admin credit');raise exception 'self credit allowed';exception when raise_exception then if SQLERRM<>'ADMIN_REQUIRED' then raise;end if;end;
 begin update public.master_store_plans set price_piasters=1;raise exception 'direct price write';exception when insufficient_privilege then null;end;
end $$;
select set_config('request.jwt.claim.sub','12000000-0000-4000-8000-000000000002',true);
do $$
declare p public.master_store_plans; d public.master_store_discount_rules; q jsonb; a jsonb:='[{"product_id":"admin-test-plan","plan_index":0,"quantity":2}]'; c jsonb:='{"name":"Test","phone":"01000000000","email":"test@example.invalid"}';
begin
 perform public.master_store_admin_snapshot();
 select * into p from public.master_store_plans where product_id='admin-test-plan';
 perform public.master_store_admin_plan('admin-test-plan',0,12000,true,3,p.updated_at);
 begin perform public.master_store_admin_plan('admin-test-plan',0,100,true,3,p.updated_at);raise exception 'stale edit accepted';exception when raise_exception then if SQLERRM<>'EDIT_CONFLICT' then raise;end if;end;
 select * into d from public.master_store_discount_rules where id=1;
 perform public.master_store_admin_discounts(4,6,8,12,d.updated_at);
 q:=public.master_store_quote_cart(a);
 if (q->>'amount_piasters')::int<>23040 or (q->>'discount_percent')::int<>4 then raise exception 'admin price or discount ignored';end if;
 begin perform public.master_store_admin_discounts(8,4,6,12,d.updated_at);raise exception 'descending discounts accepted';exception when raise_exception then if SQLERRM<>'INVALID_DISCOUNT' then raise;end if;end;
 perform public.master_store_admin_adjust_wallet('22000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000001',50000,'Verified manual transfer');
 perform public.master_store_admin_adjust_wallet('22000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000001',50000,'Verified manual transfer');
 begin perform public.master_store_admin_adjust_wallet('22000000-0000-4000-8000-000000000002','12000000-0000-4000-8000-000000000001',-60000,'Debit balance check');raise exception 'negative balance allowed';exception when raise_exception then if SQLERRM<>'INSUFFICIENT_BALANCE' then raise;end if;end;
 if (select count(*) from public.master_store_admin_audit where admin_id=auth.uid())<>3 then raise exception 'audit incomplete';end if;
end $$;
select set_config('request.jwt.claim.sub','12000000-0000-4000-8000-000000000001',true);
do $$
declare r jsonb;
begin
 if (select balance_piasters from public.master_store_wallets where user_id=auth.uid())<>50000 then raise exception 'credit duplicated';end if;
 if exists(select 1 from public.master_store_admin_audit) then raise exception 'audit leaked to customer';end if;
 r:=public.master_store_checkout_cart('32000000-0000-4000-8000-000000000001','[{"product_id":"admin-test-plan","plan_index":0,"quantity":2}]','{"name":"Test","phone":"01000000000","email":"test@example.invalid"}','wallet',23040);
 if (select balance_piasters from public.master_store_wallets where user_id=auth.uid())<>26960 then raise exception 'wrong discounted debit';end if;
end $$;
select set_config('request.jwt.claim.sub','12000000-0000-4000-8000-000000000002',true);
do $$
declare o public.master_store_orders;
begin
 select * into o from public.master_store_orders where cart_id='32000000-0000-4000-8000-000000000001';
 perform public.master_store_review_order(o.id,'cancelled');
 perform public.master_store_review_order(o.id,'cancelled');
end $$;
select set_config('request.jwt.claim.sub','12000000-0000-4000-8000-000000000001',true);
do $$ begin if (select balance_piasters from public.master_store_wallets where user_id=auth.uid())<>50000 then raise exception 'refund incorrect';end if;end $$;
select 'PASS: trusted admin role, manual prices and discounts, stale edits, idempotent wallet adjustments, audit privacy and discounted refunds' result;
rollback;
