-- One selected Visio edition per purchase; do not overwrite future admin pricing.
insert into public.master_store_plans(product_id,plan_index,product_name,plan_name,duration,price_piasters,available,max_quantity,admin_overridden)
values
('visio-professional',0,'Microsoft Visio Professional','Visio Professional 2016','إصدار ثابت — دفعة واحدة',38000,true,5,false),
('visio-professional',1,'Microsoft Visio Professional','Visio Professional 2019','إصدار ثابت — دفعة واحدة',38000,true,5,false),
('visio-professional',2,'Microsoft Visio Professional','Visio Professional 2021','إصدار ثابت — دفعة واحدة',38000,true,5,false),
('visio-professional',3,'Microsoft Visio Professional','Visio Professional LTSC 2024','إصدار ثابت — دفعة واحدة',35000,true,5,false)
on conflict(product_id,plan_index) do nothing;
