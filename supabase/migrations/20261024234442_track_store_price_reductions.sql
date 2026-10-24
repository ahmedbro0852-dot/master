-- Preserve verified former store prices separately from official reference prices.
alter table public.master_store_plans
  add column if not exists previous_price_piasters bigint
  check(previous_price_piasters is null or previous_price_piasters > price_piasters);

create or replace function master_store_private.track_plan_price_reduction()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if new.duration is distinct from old.duration or new.plan_name is distinct from old.plan_name then
    new.previous_price_piasters := null;
  elsif new.price_piasters < old.price_piasters then
    new.previous_price_piasters := old.price_piasters;
  elsif old.previous_price_piasters is not null and new.price_piasters >= old.previous_price_piasters then
    new.previous_price_piasters := null;
  else
    new.previous_price_piasters := old.previous_price_piasters;
  end if;
  return new;
end;
$$;
revoke all on function master_store_private.track_plan_price_reduction() from public, anon, authenticated;
create trigger track_plan_price_reduction
before update of price_piasters, duration, plan_name on public.master_store_plans
for each row execute function master_store_private.track_plan_price_reduction();

-- Backfill only prices supported by catalogue history or existing former-price data.
-- A renamed/replaced plan is excluded from historical matching.
update public.master_store_plans p
set previous_price_piasters = history.previous_price
from (values
  ('chatgpt-teachers-k12', 0, 50000),
  ('stealth-writer', 0, 104880),
  ('stealth-writer', 1, 235980),
  ('adobe-express', 0, 59900),
  ('elevenlabs', 1, 150000),
  ('lovable-pro', 3, 65000),
  ('elevenlabs', 2, 120000),
  ('duolingo', 0, 30000)
) as history(product_id, plan_index, previous_price)
where p.product_id=history.product_id and p.plan_index=history.plan_index
and p.price_piasters < history.previous_price;
