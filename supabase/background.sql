create extension if not exists pg_net with schema extensions;
alter table master_flow.jobs add column request_body jsonb;
alter table master_flow.jobs add column lease_until timestamptz;
alter table master_flow.jobs add column checked_at timestamptz;
create index master_flow_jobs_worker on master_flow.jobs(status,checked_at);
create or replace function public.master_flow_worker_claim() returns jsonb language plpgsql security invoker set search_path='' as $$
declare result jsonb;
begin
 update master_flow.jobs set archive_state='pending',file_size=0 where archive_state='saving' and file_key is null and checked_at<now()-interval '10 minutes' and (lease_until is null or lease_until<now());
 with pending as (
 select j.id from master_flow.jobs j join master_flow.codes c on c.id=j.code_id
 where c.active and (j.lease_until is null or j.lease_until<now()) and (j.checked_at is null or j.checked_at<now()-interval '45 seconds')
 and ((j.status='submitting' and j.request_body is not null) or (j.status in ('queued','processing') and j.external_id is not null) or (j.status='succeeded' and j.file_key is null and j.archive_state='pending'))
 order by j.checked_at nulls first,j.created_at limit 3 for update of j skip locked
 ), claimed as (
 update master_flow.jobs j set lease_until=now()+interval '3 minutes',checked_at=now() from pending p where j.id=p.id returning j.*
 ) select coalesce(jsonb_agg(to_jsonb(j)||jsonb_build_object('code_hash',c.code_hash)),'[]') into result from claimed j join master_flow.codes c on c.id=j.code_id;
 return result;
end $$;
revoke all on function public.master_flow_worker_claim() from public,anon,authenticated;
grant execute on function public.master_flow_worker_claim() to service_role;

create or replace function public.master_flow_rpc(p_action text,p_data jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare c master_flow.codes%rowtype;j master_flow.jobs%rowtype;v jsonb;lim master_flow.login_limits%rowtype;total bigint;
begin
 if p_action='claim' then return public.master_flow_worker_claim();end if;
 if p_action='login' then
  insert into master_flow.login_limits(ip_hash,attempts) values(p_data->>'ip_hash',1) on conflict(ip_hash) do update set attempts=case when master_flow.login_limits.started_at<now()-interval '15 minutes' then 1 else master_flow.login_limits.attempts+1 end,started_at=case when master_flow.login_limits.started_at<now()-interval '15 minutes' then now() else master_flow.login_limits.started_at end returning * into lim;
  if lim.attempts>10 then return jsonb_build_object('error','محاولات كثيرة. انتظر 15 دقيقة.','http',429);end if;
 end if;
 select * into c from master_flow.codes where code_hash=p_data->>'code_hash' and active=true for update;
 if c.id is null then return jsonb_build_object('error','الكود غير صحيح أو موقوف.','http',401);end if;
 if p_action in ('login','account','library') then
  select coalesce(jsonb_agg(to_jsonb(q) order by q.created_at desc),'[]') into v from (select id,external_id,model,prompt,cost_cents,status,refunded,payload,created_at,file_key,archive_state from master_flow.jobs where code_id=c.id order by created_at desc limit 100) q;
  select coalesce(sum(file_size),0) into total from master_flow.jobs where code_id=c.id;
  return jsonb_build_object('label',c.label,'balance_cents',c.balance_cents,'granted_cents',c.granted_cents,'jobs',v,'storage_used',total,'storage_limit',524288000);
 elsif p_action='reserve' then
  perform pg_advisory_xact_lock(546102039);
  select * into j from master_flow.jobs where id=(p_data->>'id')::uuid;
  if j.id is not null then
   if j.code_id<>c.id then return jsonb_build_object('error','رقم طلب غير متاح','http',409);end if;
   return jsonb_build_object('existing',true,'job',to_jsonb(j));
  end if;
  if (p_data->>'cost_cents')::integer<=0 or c.balance_cents<(p_data->>'cost_cents')::integer then return jsonb_build_object('error','رصيد الكود لا يكفي لهذا النموذج.','http',402);end if;
  if exists(select 1 from master_flow.jobs where code_id=c.id and status in ('submitting','queued','processing')) then return jsonb_build_object('error','انتظر اكتمال طلبك الحالي.','http',429);end if;
  if (select count(*) from master_flow.jobs where status in ('submitting','queued','processing'))>=3 then return jsonb_build_object('error','الاستوديو مشغول. جرّب بعد انتهاء الطلبات الحالية.','http',429);end if;
  update master_flow.codes set balance_cents=balance_cents-(p_data->>'cost_cents')::integer where id=c.id;
  insert into master_flow.jobs(id,code_id,provider_key,model,prompt,cost_cents,request_body) values((p_data->>'id')::uuid,c.id,(p_data->>'provider_key')::integer,p_data->>'model',p_data->>'prompt',(p_data->>'cost_cents')::integer,p_data->'request_body') returning * into j;
  return jsonb_build_object('job',to_jsonb(j));
 end if;
 select * into j from master_flow.jobs where id=(p_data->>'id')::uuid and code_id=c.id for update;
 if j.id is null then return jsonb_build_object('error','الطلب غير موجود','http',404);end if;
 if p_action='finish' then
  if j.status in ('succeeded','failed','canceled') then return to_jsonb(j);end if;
  if p_data->>'status' not in ('queued','processing','succeeded','failed','canceled','submitting') then return jsonb_build_object('error','حالة غير صحيحة','http',400);end if;
  update master_flow.jobs set status=p_data->>'status',external_id=coalesce(p_data->>'external_id',external_id),payload=coalesce(p_data->'payload',payload) where id=j.id;
  if p_data->>'status' in ('failed','canceled') and not j.refunded then
   update master_flow.codes set balance_cents=balance_cents+j.cost_cents where id=c.id;
   update master_flow.jobs set refunded=true where id=j.id;
  end if;
 elsif p_action='reserve_archive' then
  perform pg_advisory_xact_lock(546102040);
  if j.status<>'succeeded' or j.file_size>0 or (p_data->>'size')::bigint not between 1 and 104857600 then return jsonb_build_object('allowed',false);end if;
  if (select coalesce(sum(file_size),0) from master_flow.jobs where code_id=c.id)+(p_data->>'size')::bigint>524288000 or (select coalesce(sum(file_size),0) from master_flow.jobs)+(p_data->>'size')::bigint>5242880000 then return jsonb_build_object('allowed',false);end if;
  update master_flow.jobs set file_size=(p_data->>'size')::bigint,archive_state='saving' where id=j.id;return jsonb_build_object('allowed',true);
 elsif p_action='release' then
  update master_flow.jobs set lease_until=now()+make_interval(secs=>least(86400,greatest(0,coalesce((p_data->>'retry_seconds')::integer,0)))),checked_at=now() where id=j.id;
 elsif p_action='stored' then
  update master_flow.jobs set file_key=p_data->>'file_key',archive_state='stored' where id=j.id;
 elsif p_action='archive_failed' then
  update master_flow.jobs set file_size=0,archive_state='pending' where id=j.id and file_key is null;
 elsif p_action<>'job' then return jsonb_build_object('error','إجراء غير صحيح','http',400);
 end if;
 select * into j from master_flow.jobs where id=j.id;
 return to_jsonb(j);
end; $$;
revoke all on function public.master_flow_rpc(text,jsonb) from public,anon,authenticated;
grant execute on function public.master_flow_rpc(text,jsonb) to service_role;
