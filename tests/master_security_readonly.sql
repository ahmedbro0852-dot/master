-- Read-only RLS/admin boundary verification; no account fixtures or financial writes.
begin read only;
do $$ begin if exists(select 1 from auth.users where id='ffffffff-ffff-4fff-bfff-ffffffffffff') then raise exception 'Test identity collision'; end if; end $$;
select set_config('request.jwt.claim.sub','ffffffff-ffff-4fff-bfff-ffffffffffff',true);
select set_config('request.jwt.claims','{"sub":"ffffffff-ffff-4fff-bfff-ffffffffffff","role":"authenticated"}',true);
set local role authenticated;
do $$ begin
 if exists(select 1 from public.master_store_orders) or exists(select 1 from public.master_store_wallets) or exists(select 1 from public.master_crm_contacts) or exists(select 1 from public.master_crm_subscriptions) then raise exception 'TEST_FAILED: private data visible'; end if;
 begin perform public.master_store_admin_snapshot(); raise exception 'TEST_FAILED: admin snapshot permitted'; exception when raise_exception then if SQLERRM <> 'ADMIN_REQUIRED' then raise; end if; end;
end $$;
rollback;
select 'PASS: unrelated authenticated identity cannot read store orders/wallets/CRM or use admin snapshot' as security_check;
