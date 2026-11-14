-- Retain the full reference image only while its durable submission is pending.
-- After the provider job ID is saved, tracking uses that ID rather than resending
-- the source image. This keeps account/status payloads and database storage small.
create or replace function master_flow.clear_submitted_image() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
 if new.external_id is not null or new.status in ('succeeded','failed','canceled') then new.request_body=null;end if;
 return new;
end $$;
revoke all on function master_flow.clear_submitted_image() from public,anon,authenticated;
grant execute on function master_flow.clear_submitted_image() to service_role;
create trigger master_flow_clear_submitted_image before update on master_flow.jobs
for each row execute function master_flow.clear_submitted_image();
