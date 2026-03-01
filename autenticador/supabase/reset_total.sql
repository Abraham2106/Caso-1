-- ============================================================
-- RESET TOTAL (AUTH + PUBLIC) - FLUJO SIMPLE
-- ============================================================
-- Ejecutar en Supabase SQL Editor.
-- ADVERTENCIA: borra todos los usuarios y datos del proyecto.

begin;

-- Limpiar objetos previos
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_inserted on auth.users;
drop trigger if exists on_auth_user_updated on auth.users;

drop function if exists public.handle_new_auth_user();
drop function if exists public.trg_sync_auth_user_to_profile();
drop function if exists public.trg_set_updated_at();
drop function if exists public.trg_normalize_user_fields();
drop function if exists public.current_user_is_admin();
drop function if exists public.current_user_email();

-- Borrar autenticacion (si existe)
delete from auth.users;

-- Borrar tablas public
drop table if exists public.data_records cascade;
drop table if exists public.users cascade;
drop table if exists public.roles cascade;

-- Crear esquema simple
create table public.users (
  id bigint generated always as identity primary key,
  name text not null,
  username text not null unique,
  email text not null unique,
  password text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint users_email_lowercase check (email = lower(email)),
  constraint users_username_lowercase check (username = lower(username)),
  constraint users_name_not_empty check (length(trim(name)) > 0)
);

create index idx_users_role on public.users(role);

create table public.data_records (
  id bigint generated always as identity primary key,
  key text not null,
  value text not null,
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.trg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

create or replace function public.trg_normalize_user_fields()
returns trigger
language plpgsql
as $$
begin
  new.name := trim(new.name);
  new.email := lower(trim(new.email));
  new.username := lower(trim(new.username));

  if new.name = '' then
    raise exception 'El nombre no puede estar vacio.';
  end if;

  return new;
end;
$$;

create trigger trg_users_normalize_fields
before insert or update on public.users
for each row execute function public.trg_normalize_user_fields();

create trigger trg_users_set_updated_at
before update on public.users
for each row execute function public.trg_set_updated_at();

create trigger trg_data_records_set_updated_at
before update on public.data_records
for each row execute function public.trg_set_updated_at();

-- RLS abierta para prototipo
alter table public.users enable row level security;
alter table public.data_records enable row level security;

do $$
declare
  p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'users'
  loop
    execute format('drop policy if exists %I on public.users', p.policyname);
  end loop;
end $$;

do $$
declare
  p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'data_records'
  loop
    execute format('drop policy if exists %I on public.data_records', p.policyname);
  end loop;
end $$;

create policy "users select"
on public.users
for select
to anon, authenticated
using (true);

create policy "users insert"
on public.users
for insert
to anon, authenticated
with check (true);

create policy "users update"
on public.users
for update
to anon, authenticated
using (true)
with check (true);

create policy "users delete"
on public.users
for delete
to anon, authenticated
using (true);

create policy "data select"
on public.data_records
for select
to anon, authenticated
using (true);

create policy "data insert"
on public.data_records
for insert
to anon, authenticated
with check (true);

create policy "data update"
on public.data_records
for update
to anon, authenticated
using (true)
with check (true);

create policy "data delete"
on public.data_records
for delete
to anon, authenticated
using (true);

-- Usuarios hardcodeados solicitados
insert into public.users (name, username, email, password, role)
values
  ('Demo Admin', 'demo', 'demo@example', 'demo123', 'admin'),
  ('Demo User', 'userdemo', 'user@example', 'user123', 'user');

insert into public.data_records (key, value)
values
  ('region', 'Costa Rica'),
  ('entorno', 'Produccion');

commit;
