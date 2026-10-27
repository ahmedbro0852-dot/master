-- Picsart private ready accounts, prices in piastres. Credit terms are in catalog.js.
insert into public.master_store_plans(product_id,plan_index,product_name,plan_name,duration,price_piasters,available,max_quantity,admin_overridden)
values
('picsart',0,'Picsart','خاص — 7 أيام','7 أيام',6500,true,5,false),
('picsart',1,'Picsart','خاص — 1 شهر','1 شهر',22000,true,5,false),
('picsart',2,'Picsart','خاص — 3 شهور','3 شهور',55000,true,5,false),
('picsart',3,'Picsart','خاص — 6 شهور','6 شهور',90000,true,5,false),
('picsart',4,'Picsart','خاص — 12 شهر','12 شهر',165000,true,5,false)
on conflict(product_id,plan_index) do nothing;
