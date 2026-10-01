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

-- Photos are optional; safe to run on an existing installation.
alter table public.dedicatorias add column if not exists photo_path text
    check (photo_path is null or photo_path ~ '^recuerdos/[0-9a-f-]{36}\.(jpg|png|webp)$');
grant insert (photo_path) on public.dedicatorias to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('recuerdos', 'recuerdos', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public,
    file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Subir recuerdos" on storage.objects;
create policy "Subir recuerdos" on storage.objects
    for insert to anon, authenticated
    with check (bucket_id = 'recuerdos' and name ~ '^recuerdos/[0-9a-f-]{36}\.(jpg|png|webp)$');
-- No public update/delete permissions: visitors cannot overwrite others' photos.

-- Multiple photos per message, preserving previously uploaded single photos.
create or replace function public.valid_recuerdo_paths(paths text[])
returns boolean language sql immutable set search_path = '' as $$
    select paths is not null and cardinality(paths) <= 10
        and not exists (
            select 1 from unnest(paths) as item(path)
            where path is null or path !~ '^recuerdos/[0-9a-f-]{36}\.(jpg|png|webp)$'
        );
$$;
alter table public.dedicatorias add column if not exists photo_paths text[] not null default '{}'
    check (public.valid_recuerdo_paths(photo_paths));
grant insert (photo_paths) on public.dedicatorias to anon, authenticated;

create or replace view public.recuerdos_publicos with (security_invoker = true) as
select d.id, d.name, d.created_at, photos.photo_path, photos.photo_index
from public.dedicatorias d
cross join lateral unnest(
    case when cardinality(d.photo_paths) > 0 then d.photo_paths
         when d.photo_path is not null then array[d.photo_path]
         else array[]::text[] end
) with ordinality as photos(photo_path, photo_index);
grant select on public.recuerdos_publicos to anon, authenticated;
