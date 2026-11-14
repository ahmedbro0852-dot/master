-- Additive production patch: expose the existing refund flag in account history.
-- Preserve all other RPC behavior, access grants, and balance mutations.
do $flow$
declare definition text;
declare before_text text := 'select id,external_id,model,prompt,cost_cents,status,payload,created_at,file_key,archive_state from master_flow.jobs';
declare after_text  text := 'select id,external_id,model,prompt,cost_cents,status,refunded,payload,created_at,file_key,archive_state from master_flow.jobs';
begin
 select pg_get_functiondef('public.master_flow_rpc(text,jsonb)'::regprocedure) into definition;
 if position(after_text in definition)>0 then return; end if;
 if position(before_text in definition)=0 then raise exception 'Unexpected RPC definition; refund visibility patch aborted'; end if;
 execute replace(definition,before_text,after_text);
end
$flow$;
