-- Repair script for legacy databases that still reference public.users.password
-- Run this in Supabase SQL Editor.

create table if not exists public.users (
  id bigint generated always as identity primary key,
  auth_user_id uuid,
  name text not null default 'Usuario',
  email text not null unique,
  role text not null default 'user',
  created_at timestamptz not null default now()
);

create table if not exists public.data_records (
  id bigint generated always as identity primary key,
  key text not null,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.users
  add column if not exists auth_user_id uuid;

alter table public.users
  add column if not exists role text;

alter table public.users
  add column if not exists created_at timestamptz not null default now();

alter table public.users
  drop column if exists password;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'users_auth_user_id_fkey'
  ) then
    alter table public.users
      add constraint users_auth_user_id_fkey
      foreign key (auth_user_id)
      references auth.users(id)
      on delete set null;
  end if;
end $$;

update public.users
set email = lower(trim(email))
where email is not null;

update public.users
set role = 'user'
where role is null or role not in ('admin', 'user');

alter table public.users
  alter column role set default 'user';

alter table public.users
  alter column role set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'users_role_check'
  ) then
    alter table public.users
      add constraint users_role_check check (role in ('admin', 'user'));
  end if;
end $$;

create index if not exists idx_users_role on public.users(role);
create unique index if not exists idx_users_auth_user_id
  on public.users(auth_user_id)
  where auth_user_id is not null;

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_auth_user();

create or replace function public.handle_new_auth_user()
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
  normalized_email := lower(coalesce(new.email, ''));

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
    name = case
      when public.users.name is null or trim(public.users.name) = '' then excluded.name
      else public.users.name
    end;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

do $$
declare
  policy_name text;
begin
  for policy_name in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'users'
  loop
    execute format('drop policy if exists %I on public.users', policy_name);
  end loop;
end $$;

do $$
declare
  policy_name text;
begin
  for policy_name in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'data_records'
  loop
    execute format('drop policy if exists %I on public.data_records', policy_name);
  end loop;
end $$;

alter table public.users enable row level security;
alter table public.data_records enable row level security;

create policy "anon users select"
on public.users
for select
to anon, authenticated
using (true);

create policy "anon users insert"
on public.users
for insert
to anon, authenticated
with check (true);

create policy "anon users update"
on public.users
for update
to anon, authenticated
using (true)
with check (true);

create policy "anon users delete"
on public.users
for delete
to anon, authenticated
using (true);

create policy "anon data select"
on public.data_records
for select
to anon, authenticated
using (true);

create policy "anon data insert"
on public.data_records
for insert
to anon, authenticated
with check (true);

create policy "anon data update"
on public.data_records
for update
to anon, authenticated
using (true)
with check (true);

create policy "anon data delete"
on public.data_records
for delete
to anon, authenticated
using (true);
