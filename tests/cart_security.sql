begin;
insert into auth.users(id,email,aud,role,email_confirmed_at,raw_app_meta_data,raw_user_meta_data) values('11000000-0000-4000-8000-000000000001','cart-test@example.invalid','authenticated','authenticated',now(),'{}','{}'),('11000000-0000-4000-8000-000000000002','cart-other@example.invalid','authenticated','authenticated',now(),'{}','{}');
insert into public.master_store_wallets values('11000000-0000-4000-8000-000000000001',200000);
set local role authenticated;
select set_config('request.jwt.claim.sub','11000000-0000-4000-8000-000000000001',true);
do $$
declare q jsonb; r jsonb; a jsonb:='[{"product_id":"windows-pro","plan_index":0,"quantity":2},{"product_id":"lovable-pro","plan_index":1,"quantity":1}]'; c jsonb:='{"name":"Test","phone":"01000000000","email":"test@example.invalid"}'; n int;
begin
 for n in 1..5 loop
 q:=public.master_store_quote_cart(jsonb_build_array(jsonb_build_object('product_id','windows-pro','plan_index',0,'quantity',n)));
 if (q->>'discount_percent')::int<>(case n when 1 then 0 when 2 then 3 when 3 then 5 when 4 then 7 else 10 end) then raise exception 'wrong tier';end if;
 end loop;
 q:=public.master_store_quote_cart(a);
 if (q->>'quantity')::int<>3 or (q->>'discount_percent')::int<>5 or (q->>'amount_piasters')::int<>71440 then raise exception 'mixed discount incorrect';end if;
 begin perform public.master_store_checkout_cart('21000000-0000-4000-8000-000000000001',a,c,'wallet',1);raise exception 'accepted fake price';exception when raise_exception then if SQLERRM<>'PRICE_CHANGED' then raise;end if;end;
 r:=public.master_store_checkout_cart('21000000-0000-4000-8000-000000000001',a,c,'wallet',71440);
 perform public.master_store_checkout_cart('21000000-0000-4000-8000-000000000001',a,c,'wallet',71440);
 if (select balance_piasters from public.master_store_wallets where user_id=auth.uid())<>128560 or (select count(*) from public.master_store_orders where cart_id='21000000-0000-4000-8000-000000000001')<>2 then raise exception 'duplicate debit';end if;
 begin perform public.master_store_quote_cart('[{"product_id":"windows-pro","plan_index":0,"quantity":3},{"product_id":"windows-pro","plan_index":0,"quantity":3}]');raise exception 'duplicate limit bypass';exception when raise_exception then if SQLERRM<>'INVALID_CART' then raise;end if;end;
 begin perform public.master_store_checkout_cart('21000000-0000-4000-8000-000000000002','[{"product_id":"cursor-pro","plan_index":0,"quantity":1}]',c,'wallet',705700);raise exception 'insufficient accepted';exception when raise_exception then if SQLERRM<>'INSUFFICIENT_BALANCE' then raise;end if;end;
 if (select count(*) from public.master_store_carts)<>1 then raise exception 'failed checkout persisted';end if;
end $$;
select set_config('request.jwt.claim.sub','11000000-0000-4000-8000-000000000002',true);
do $$ begin if exists(select 1 from public.master_store_carts) or exists(select 1 from public.master_store_orders) then raise exception 'private cart leaked';end if;end $$;
rollback;
