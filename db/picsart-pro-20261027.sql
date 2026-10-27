-- Correct only product/plan display names after confirming the Pro tier.
update public.master_store_plans set product_name='Picsart Pro',plan_name=case when plan_name like 'Pro — %' then plan_name else 'Pro — '||plan_name end where product_id='picsart' and plan_index between 0 and 4;
