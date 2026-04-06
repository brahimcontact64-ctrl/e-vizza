-- Restore public read access for visa catalog pages

alter table if exists public.visas enable row level security;

drop policy if exists "visas_select_public_active" on public.visas;
create policy "visas_select_public_active"
  on public.visas
  for select
  to anon, authenticated
  using (is_active = true);
