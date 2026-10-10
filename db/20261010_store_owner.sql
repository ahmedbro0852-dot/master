-- The administrator is the verified email of the connected GitHub owner.
-- No role or email supplied in user_metadata is accepted.
create function master_store_private.bootstrap_owner() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if exists(select 1 from auth.users where id=new.user_id and lower(email)='ahmedbro0852@gmail.com' and email_confirmed_at is not null) then
    insert into public.master_store_admins(user_id) values(new.user_id) on conflict do nothing;
  end if;
  return new;
end; $$;
revoke all on function master_store_private.bootstrap_owner() from public,anon,authenticated;
create trigger master_store_owner_profile after insert or update on public.master_store_profiles for each row execute function master_store_private.bootstrap_owner();
