-- Auth/Profile/RLS hardening for e-Vizza
-- Safe to run multiple times (uses IF NOT EXISTS checks where possible)

-- Ensure RLS is enabled
alter table if exists public.profiles enable row level security;
alter table if exists public.passport_vault enable row level security;
alter table if exists public.documents enable row level security;
alter table if exists public.applications enable row level security;

-- Auto-create profile after auth.users signup
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();

-- profiles policies
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- passport_vault policies
drop policy if exists "passport_vault_select_own" on public.passport_vault;
create policy "passport_vault_select_own"
  on public.passport_vault
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "passport_vault_insert_own" on public.passport_vault;
create policy "passport_vault_insert_own"
  on public.passport_vault
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "passport_vault_update_own" on public.passport_vault;
create policy "passport_vault_update_own"
  on public.passport_vault
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- documents policies
drop policy if exists "documents_select_own" on public.documents;
create policy "documents_select_own"
  on public.documents
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "documents_insert_own" on public.documents;
create policy "documents_insert_own"
  on public.documents
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- applications policies
drop policy if exists "applications_select_own" on public.applications;
create policy "applications_select_own"
  on public.applications
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "applications_insert_own" on public.applications;
create policy "applications_insert_own"
  on public.applications
  for insert
  to authenticated
  with check (auth.uid() = user_id);
