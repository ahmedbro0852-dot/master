-- Owner discontinued the Gamma Pro PIN-600 automatic delivery feature after the available account was sold.
-- Existing general delivery-box workflows remain unaffected.
-- The sold credential was removed from the private live database, not stored here.
REVOKE EXECUTE ON FUNCTION public.master_gamma_delivery(text,text,uuid,text,jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION master_delivery_private.gamma_dispatch(text,text,uuid,text,jsonb) FROM PUBLIC, anon, authenticated;
