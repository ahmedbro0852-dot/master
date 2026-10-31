-- User price reduction for the monthly Creator plan only. Existing reduction trigger records 550 EGP as the previous price.
update public.master_store_plans
set price_piasters=50000, admin_overridden=true
where product_id='elevenlabs' and plan_index=2 and price_piasters=55000;
