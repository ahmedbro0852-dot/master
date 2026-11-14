create schema if not exists master_flow;
revoke all on schema master_flow from public,anon,authenticated;
grant usage on schema master_flow to service_role;
create table master_flow.codes(id uuid primary key default gen_random_uuid(), code_hash text unique not null, label text not null, balance_cents integer not null default 30 check(balance_cents>=0), granted_cents integer not null default 30, active boolean not null default true, created_at timestamptz not null default now());
create table master_flow.jobs(id uuid primary key, code_id uuid not null references master_flow.codes(id), external_id text unique, provider_key integer not null, model text not null, prompt text not null, cost_cents integer not null check(cost_cents>0), status text not null default 'submitting', refunded boolean not null default false, payload jsonb not null default '{}', created_at timestamptz not null default now(), file_key text, file_size bigint not null default 0, archive_state text not null default 'pending');
create index on master_flow.jobs(code_id,created_at desc);
create table master_flow.login_limits(ip_hash text primary key,started_at timestamptz not null default now(),attempts integer not null default 0);
alter table master_flow.codes enable row level security;
alter table master_flow.jobs enable row level security;
alter table master_flow.login_limits enable row level security;
revoke all on all tables in schema master_flow from public,anon,authenticated;
grant all on all tables in schema master_flow to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('master-flow-private','master-flow-private',false,104857600,array['video/mp4','image/png','image/jpeg','image/webp','audio/mpeg','audio/wav']) on conflict(id) do nothing;
create or replace function public.master_flow_rpc(p_action text,p_data jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare c master_flow.codes%rowtype;j master_flow.jobs%rowtype;v jsonb;lim master_flow.login_limits%rowtype;total bigint;
begin
 if p_action='login' then
  insert into master_flow.login_limits(ip_hash,attempts) values(p_data->>'ip_hash',1) on conflict(ip_hash) do update set attempts=case when master_flow.login_limits.started_at<now()-interval '15 minutes' then 1 else master_flow.login_limits.attempts+1 end,started_at=case when master_flow.login_limits.started_at<now()-interval '15 minutes' then now() else master_flow.login_limits.started_at end returning * into lim;
  if lim.attempts>10 then return jsonb_build_object('error','محاولات كثيرة. انتظر 15 دقيقة.','http',429);end if;
 end if;
 select * into c from master_flow.codes where code_hash=p_data->>'code_hash' and active=true for update;
 if c.id is null then return jsonb_build_object('error','الكود غير صحيح أو موقوف.','http',401);end if;
 if p_action in ('login','account','library') then
  select coalesce(jsonb_agg(to_jsonb(q) order by q.created_at desc),'[]') into v from (select id,external_id,model,prompt,cost_cents,status,payload,created_at,file_key,archive_state from master_flow.jobs where code_id=c.id order by created_at desc limit 100) q;
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
  insert into master_flow.jobs(id,code_id,provider_key,model,prompt,cost_cents) values((p_data->>'id')::uuid,c.id,(p_data->>'provider_key')::integer,p_data->>'model',p_data->>'prompt',(p_data->>'cost_cents')::integer) returning * into j;
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
