-- Ejecutar en el SQL Editor del proyecto Supabase.
create table if not exists public.dedicatorias (
    id uuid primary key default gen_random_uuid(),
    name text not null check (char_length(btrim(name)) between 1 and 100),
    text text not null check (char_length(btrim(text)) between 1 and 2000),
    created_at timestamptz not null default now()
);

alter table public.dedicatorias enable row level security;
revoke all on public.dedicatorias from anon, authenticated;
grant select on public.dedicatorias to anon, authenticated;
grant insert (name, text) on public.dedicatorias to anon, authenticated;

drop policy if exists "Leer dedicatorias" on public.dedicatorias;
create policy "Leer dedicatorias" on public.dedicatorias
    for select to anon, authenticated using (true);

drop policy if exists "Enviar dedicatorias" on public.dedicatorias;
create policy "Enviar dedicatorias" on public.dedicatorias
    for insert to anon, authenticated with check (true);
