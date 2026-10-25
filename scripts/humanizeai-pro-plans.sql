-- New HumanizeAI.pro product; do not modify HumanizeAI.com or existing plan indices.
insert into public.master_store_plans (product_id,plan_index,product_name,plan_name,duration,price_piasters,available,max_quantity,admin_overridden)
values ('humanizeai-pro',0,'HumanizeAI.pro','Standard — شهر','1 شهر',56000,true,5,false),
       ('humanizeai-pro',1,'HumanizeAI.pro','Lite — شهر','1 شهر',28000,true,5,false)
on conflict (product_id,plan_index) do nothing;
