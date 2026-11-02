-- Append confirmed offers at stable indices. No legacy stock or campaign changes.
begin;
insert into public.master_store_plans(product_id,plan_index,product_name,plan_name,duration,price_piasters,available,max_quantity,admin_overridden)
values
('heygen',1,'HeyGen Creator','Creator — شهر — 600 كريدت — ضمان 15 يومًا','1 شهر',79900,true,5,false),
('expressvpn',1,'ExpressVPN','سنتان — حساب جاهز — ضمان كامل','24 شهر',308000,true,5,false),
('ehunt-elite',0,'EHunt Elite','Elite — شهر — حساب جاهز','1 شهر',151200,true,5,false),
('storyblocks',0,'Storyblocks','تحميل غير محدود — شهر — حساب خاص','1 شهر',89600,true,5,false),
('magiclight-pro',0,'MagicLight Pro','Pro — شهر — 47,000 كريدت — حساب جاهز','1 شهر',159900,true,5,false)
on conflict(product_id,plan_index) do nothing;
do $$
begin
  if exists (
    select 1 from (values
      ('heygen',1,79900::bigint,'1 شهر'),
      ('expressvpn',1,308000::bigint,'24 شهر'),
      ('ehunt-elite',0,151200::bigint,'1 شهر'),
      ('storyblocks',0,89600::bigint,'1 شهر'),
      ('magiclight-pro',0,159900::bigint,'1 شهر')
    ) expected(product_id,plan_index,price_piasters,duration)
    left join public.master_store_plans p using(product_id,plan_index)
    where p.product_id is null or p.price_piasters<>expected.price_piasters
       or p.duration<>expected.duration or not p.available
  ) then raise exception 'A target plan has different live price/term/stock; review rather than overwrite'; end if;
end $$;
commit;
