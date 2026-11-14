-- FLOW_WORKER_SECRET must already be configured in Vercel and in Vault as
-- master_flow_worker_secret. Never put its plaintext value in this file.
create or replace function master_flow.tick(force_run boolean default false) returns bigint language plpgsql security invoker set search_path='' as $$
declare request_id bigint; ts text:=floor(extract(epoch from now()))::bigint::text;
begin
 if not force_run and not exists(select 1 from master_flow.jobs where status in ('submitting','queued','processing') or (status='succeeded' and file_key is null and archive_state in ('pending','saving'))) then return null;end if;
 select net.http_post(
  url:='https://master-flow-studio.vercel.app/api/worker',
  headers:=jsonb_build_object('Content-Type','application/json','x-worker-timestamp',ts,'x-worker-signature',encode(extensions.hmac('master-flow-worker:'||ts,(select decrypted_secret from vault.decrypted_secrets where name='master_flow_worker_secret'),'sha256'),'hex')),
  body:='{}'::jsonb,
  timeout_milliseconds:=125000
 ) into request_id;
 return request_id;
end $$;
revoke all on function master_flow.tick(boolean) from public,anon,authenticated,service_role;
select cron.schedule('master-flow-background','* * * * *','select master_flow.tick();');
