-- Seven-day discovery shelf; independent of cancelled poster campaigns.
alter table public.master_store_plans add column if not exists launched_at timestamptz,
 add column if not exists discounted_at timestamptz;
-- Baseline legacy rows remain null. Only verified recent additions are seeded.
update public.master_store_plans set launched_at=updated_at
where launched_at is null and ((product_id in ('autodesk-apps','kaspersky-premium','avast-premium','mcafee-total-protection','norton-360-premium','grok-cursor-premium') and plan_index=0)
 or (product_id='gemini-pro' and plan_index=4) or (product_id='kling' and plan_index=1));
-- Release commits establish these reduction times; updated_at is not reduction history.
update public.master_store_plans set discounted_at='2026-10-31T07:09:09Z' where product_id='elevenlabs' and plan_index=2 and price_piasters=50000 and previous_price_piasters=55000 and discounted_at is null;
update public.master_store_plans set discounted_at='2026-10-31T21:14:07Z' where product_id='chatgpt-plus' and plan_index=3 and price_piasters=70000 and previous_price_piasters=78000 and discounted_at is null;
create or replace function master_store_private.track_plan_discovery()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if tg_op='INSERT' then
  new.launched_at:=statement_timestamp(); new.discounted_at:=null;
 else
  new.launched_at:=old.launched_at;
  if new.duration is distinct from old.duration or new.plan_name is distinct from old.plan_name then
   new.discounted_at:=null;
  elsif new.price_piasters<old.price_piasters then
   new.discounted_at:=statement_timestamp();
  elsif new.price_piasters>old.price_piasters then
   new.discounted_at:=null;
  else new.discounted_at:=old.discounted_at;
  end if;
 end if;
 return new;
end; $$;
revoke all on function master_store_private.track_plan_discovery() from public,anon,authenticated;
create trigger track_plan_discovery before insert or update on public.master_store_plans
for each row execute function master_store_private.track_plan_discovery();
