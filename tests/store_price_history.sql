-- Verify the automatic price history without retaining test changes.
begin;
update public.master_store_plans set price_piasters=120000 where product_id='elevenlabs' and plan_index=1;
do $$begin
 if (select previous_price_piasters from public.master_store_plans where product_id='elevenlabs' and plan_index=1)<>125000 then raise exception 'Former price not captured';end if;
end$$;
update public.master_store_plans set price_piasters=130000 where product_id='elevenlabs' and plan_index=1;
do $$begin
 if (select previous_price_piasters from public.master_store_plans where product_id='elevenlabs' and plan_index=1) is not null then raise exception 'Invalid discount retained';end if;
 if exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where p.proname='track_plan_price_reduction' and n.nspname='master_store_private' and p.prosecdef) then raise exception 'Price trigger must use security invoker';end if;
 if has_function_privilege('anon','master_store_private.track_plan_price_reduction()','execute') then raise exception 'Internal trigger exposed';end if;
end$$;
rollback;
