-- Raise the existing monthly 100 + 5/day SKU without changing plan indices.
update public.master_store_plans set price_piasters=30000,updated_at=now() where product_id='lovable-pro' and plan_index=1 and price_piasters=23000;
