insert into public.master_store_plans (product_id,plan_index,product_name,plan_name,duration,price_piasters,available,max_quantity,admin_overridden)
values ('capcut-gemini-gift',0,'كاب كات + جيمناي هدية','باقة هدية جيمناي','كاب كات شهر · جيمناي 18 شهر',32000,true,5,false),
('elevenlabs-gemini-gift',0,'إليفن لابس + جيمناي هدية','باقة هدية جيمناي','إليفن شهر · جيمناي 18 شهر',55000,true,5,false),
('lovable-gemini-gift',0,'لوفابل Lite + جيمناي هدية','باقة هدية جيمناي','لوفابل 12 شهر · جيمناي 18 شهر',45000,true,5,false)
on conflict (product_id,plan_index) do nothing;
