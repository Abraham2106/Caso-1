-- ============================================================
-- Base de datos desde cero (Supabase/PostgreSQL) - 3FN
-- Compatible con la app actual (tabla public.users y public.data_records)
-- ============================================================
-- IMPORTANTE: Este script borra y recrea tablas en public.

begin;

-- Limpieza de objetos previos
drop trigger if exists on_auth_user_inserted on auth.users;
drop trigger if exists on_auth_user_updated on auth.users;

drop function if exists public.trg_sync_auth_user_to_profile();
drop function if exists public.trg_set_updated_at();
drop function if exists public.trg_normalize_user_fields();
drop function if exists public.current_user_is_admin();
drop function if exists public.current_user_email();

drop table if exists public.data_records cascade;
drop table if exists public.users cascade;
drop table if exists public.roles cascade;

-- Catalogo de roles (3FN: entidad separada)
create table public.roles (
  code text primary key,
  name text not null unique
);

insert into public.roles (code, name)
values
  ('admin', 'Administrador'),
  ('user', 'Usuario');

-- Perfiles de usuario (credenciales NO van aqui; viven en auth.users)
create table public.users (
  id bigint generated always as identity primary key,
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'user' references public.roles(code),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint users_email_lowercase check (email = lower(email)),
  constraint users_name_not_empty check (length(trim(name)) > 0)
);

create index idx_users_role on public.users(role);
create index idx_users_created_at on public.users(created_at);

-- Datos administrables del dashboard
create table public.data_records (
  id bigint generated always as identity primary key,
  key text not null,
  value text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index idx_data_records_created_at on public.data_records(created_at);

-- Helpers de sesion
create or replace function public.current_user_email()
returns text
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.auth_user_id = auth.uid()
      and u.role = 'admin'
  );
$$;

grant execute on function public.current_user_email() to anon, authenticated;
grant execute on function public.current_user_is_admin() to anon, authenticated;

-- Trigger generico de auditoria (updated_at)
create or replace function public.trg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

-- Normalizacion de campos de users
create or replace function public.trg_normalize_user_fields()
returns trigger
language plpgsql
as $$
begin
  new.email := lower(trim(new.email));
  new.name := trim(new.name);

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

-- Sincroniza auth.users -> public.users (registro y cambios de email/meta)
create or replace function public.trg_sync_auth_user_to_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text;
  metadata_name text;
  resolved_name text;
begin
  normalized_email := lower(trim(coalesce(new.email, '')));

  if normalized_email = '' then
    return new;
  end if;

  metadata_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'name', '')), '');
  resolved_name := coalesce(metadata_name, split_part(normalized_email, '@', 1), 'Usuario');

  insert into public.users (auth_user_id, name, email, role)
  values (new.id, resolved_name, normalized_email, 'user')
  on conflict (email) do update
  set
    auth_user_id = excluded.auth_user_id,
    email = excluded.email,
    name = case
      when public.users.name is null or trim(public.users.name) = '' then excluded.name
      else public.users.name
    end,
    updated_at = timezone('utc', now());

  return new;
end;
$$;

create trigger on_auth_user_inserted
after insert on auth.users
for each row execute function public.trg_sync_auth_user_to_profile();

create trigger on_auth_user_updated
after update of email, raw_user_meta_data on auth.users
for each row execute function public.trg_sync_auth_user_to_profile();

-- RLS
alter table public.roles enable row level security;
alter table public.users enable row level security;
alter table public.data_records enable row level security;

-- Roles: lectura publica, sin escrituras directas desde cliente
create policy "roles select"
on public.roles
for select
to anon, authenticated
using (true);

-- Users:
-- - Admin ve y gestiona todo
-- - Usuario normal ve su perfil
-- - Usuario puede reclamar perfil precreado por admin si coincide email JWT
create policy "users select"
on public.users
for select
to authenticated
using (
  public.current_user_is_admin()
  or auth.uid() = auth_user_id
  or (auth_user_id is null and email = public.current_user_email())
);

create policy "users insert"
on public.users
for insert
to authenticated
with check (
  public.current_user_is_admin()
  or (
    auth.uid() = auth_user_id
    and role = 'user'
    and email = public.current_user_email()
  )
);

create policy "users update"
on public.users
for update
to authenticated
using (
  public.current_user_is_admin()
  or auth.uid() = auth_user_id
  or (auth_user_id is null and email = public.current_user_email())
)
with check (
  public.current_user_is_admin()
  or (auth.uid() = auth_user_id and email = public.current_user_email())
);

create policy "users delete"
on public.users
for delete
to authenticated
using (
  public.current_user_is_admin()
  and auth_user_id is distinct from auth.uid()
);

-- Data records:
-- - Lectura para cualquier autenticado
-- - Escritura solo admin
create policy "data select"
on public.data_records
for select
to authenticated
using (auth.uid() is not null);

create policy "data insert"
on public.data_records
for insert
to authenticated
with check (public.current_user_is_admin());

create policy "data update"
on public.data_records
for update
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "data delete"
on public.data_records
for delete
to authenticated
using (public.current_user_is_admin());

-- No se insertan usuarios aqui:
-- las credenciales existen solo en auth.users y deben crearse con /register
-- (o desde Supabase Auth -> Users -> Create user).
-- Luego puedes promover un correo a admin con:
-- update public.users set role = 'admin' where email = 'tu-correo@dominio.com';

insert into public.data_records (key, value)
values
  ('region', 'Costa Rica'),
  ('entorno', 'Produccion')
on conflict do nothing;

commit;
