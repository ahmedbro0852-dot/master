-- Normalize CapCut monthly pricing; existing orders retain their purchase price.
update public.master_store_plans set price_piasters=20000,updated_at=clock_timestamp() where product_id='capcut-pro' and plan_index=1 and price_piasters=15000;
