-- Store offer: assigned Arabic-content IPTV server; exact expiry confirmed at delivery.
insert into public.master_store_plans(product_id,plan_index,product_name,plan_name,duration,price_piasters,available,max_quantity,admin_overridden)
values ('xtream-iptv',0,'Xtream IPTV','سيرفر عربي عشوائي — سنة أو أكثر','12 شهر أو أكثر حسب السيرفر المستلَم',35000,true,5,false)
on conflict(product_id,plan_index) do nothing;
