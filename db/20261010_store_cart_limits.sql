create or replace function master_store_private.quote_cart(items jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare r record; p public.master_store_plans; n int:=0; rate int; subtotal bigint:=0; savings bigint:=0; line bigint; off bigint; rows jsonb:='[]'; rules public.master_store_discount_rules;
begin
 if items is null or jsonb_typeof(items)<>'array' or jsonb_array_length(items) not between 1 and 20 then raise exception 'INVALID_CART'; end if;
 if exists(select 1 from jsonb_array_elements(items) x where coalesce((x->>'quantity')::int,0) not between 1 and 5) then raise exception 'INVALID_CART'; end if;
 for r in select x->>'product_id' product_id,(x->>'plan_index')::int plan_index,sum((x->>'quantity')::int)::int quantity from jsonb_array_elements(items) x group by 1,2 order by 1,2 loop
  if r.quantity not between 1 and 5 then raise exception 'INVALID_CART'; end if;
  select * into p from public.master_store_plans where product_id=r.product_id and plan_index=r.plan_index and available;
  if not found or r.quantity>p.max_quantity then raise exception 'PLAN_UNAVAILABLE'; end if;
  n:=n+r.quantity;
  rows:=rows||jsonb_build_array(jsonb_build_object('product_id',p.product_id,'plan_index',p.plan_index,'quantity',r.quantity,'product',p.product_name,'plan',p.plan_name,'duration',p.duration,'unit_piasters',p.price_piasters,'max_quantity',p.max_quantity));
 end loop;
 if n not between 1 and 50 then raise exception 'INVALID_CART'; end if;
 select * into rules from public.master_store_discount_rules where id=1;
 rate:=case when n>=5 then rules.five when n=4 then rules.four when n=3 then rules.three when n=2 then rules.two else 0 end;
 items:='[]';
 for r in select value x from jsonb_array_elements(rows) loop
  line:=(r.x->>'unit_piasters')::bigint*(r.x->>'quantity')::int; off:=round(line*rate/100.0);
  subtotal:=subtotal+line; savings:=savings+off;
  items:=items||jsonb_build_array(r.x||jsonb_build_object('subtotal_piasters',line,'discount_piasters',off,'amount_piasters',line-off));
 end loop;
 return jsonb_build_object('items',items,'quantity',n,'discount_percent',rate,'rules',to_jsonb(rules),'subtotal_piasters',subtotal,'discount_piasters',savings,'amount_piasters',subtotal-savings);
end; $$;
