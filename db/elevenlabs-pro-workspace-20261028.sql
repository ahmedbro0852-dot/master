-- Additional plan; preserve all Creator plan indices and later admin edits.
insert into public.master_store_plans(product_id,plan_index,product_name,plan_name,duration,price_piasters,available,max_quantity,admin_overridden)
values ('elevenlabs',3,'ElevenLabs Creator / Pro','Pro — شهر · مساحة عمل · 50 ألف كريدت','1 شهر',45000,true,5,false)
on conflict(product_id,plan_index) do nothing;
