begin;

update public.master_store_plans
set price_piasters = 50000, admin_overridden = true, updated_at = now()
where product_id = 'autodesk-apps' and plan_index = 0;

update public.master_store_plans
set plan_name = 'Adobe Express Premium — لينك استرداد بدون بطاقة', updated_at = now()
where product_id = 'adobe-express' and plan_index = 1;

insert into public.master_store_plans
  (product_id, plan_index, product_name, plan_name, duration, price_piasters, available, max_quantity, admin_overridden, launched_at)
values
  ('alight-motion-premium', 0, 'Alight Motion Premium', 'Premium — سنة', '12 شهر', 70000, true, 5, true, now()),
  ('canva-business-admin', 0, 'Canva Pro Business Admin', 'Business Admin — شهر — حتى 100 عضو', '1 شهر', 35000, true, 5, true, now())
on conflict (product_id, plan_index) do nothing;

commit;
