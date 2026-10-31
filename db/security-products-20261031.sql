insert into public.master_store_plans(product_id,plan_index,product_name,plan_name,duration,price_piasters,available,max_quantity,admin_overridden) values
('kaspersky-premium',0,'Kaspersky Premium','سنة — جهاز واحد — Windows','12 شهر',80000,true,5,false),
('avast-premium',0,'Avast Premium Security + VPN','سنة — جهاز واحد','12 شهر',30000,true,5,false),
('mcafee-total-protection',0,'McAfee Total Protection','سنة — جهاز واحد','12 شهر',45000,true,5,false),
('norton-360-premium',0,'Norton 360 Premium','سنة — جهاز واحد','12 شهر',75000,true,5,false)
on conflict(product_id,plan_index) do nothing;
