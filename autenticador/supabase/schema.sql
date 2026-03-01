-- Run this script in Supabase SQL Editor.

create table if not exists public.users (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null unique,
  password text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

create table if not exists public.data_records (
  id bigint generated always as identity primary key,
  key text not null,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.data_records enable row level security;

-- Development policies for anon access.
-- Tighten these policies before production.

drop policy if exists "anon users select" on public.users;
drop policy if exists "anon users insert" on public.users;
drop policy if exists "anon users delete" on public.users;

create policy "anon users select"
on public.users
for select
to anon
using (true);

create policy "anon users insert"
on public.users
for insert
to anon
with check (true);

create policy "anon users delete"
on public.users
for delete
to anon
using (true);


drop policy if exists "anon data select" on public.data_records;
drop policy if exists "anon data insert" on public.data_records;
drop policy if exists "anon data update" on public.data_records;
drop policy if exists "anon data delete" on public.data_records;

create policy "anon data select"
on public.data_records
for select
to anon
using (true);

create policy "anon data insert"
on public.data_records
for insert
to anon
with check (true);

create policy "anon data update"
on public.data_records
for update
to anon
using (true)
with check (true);

create policy "anon data delete"
on public.data_records
for delete
to anon
using (true);

insert into public.users (name, email, password)
values ('Usuario Demo', 'demo@example.com', 'demo123')
on conflict (email) do nothing;

-- Ensure role exists and normalize existing users for old deployments.
alter table public.users
  add column if not exists role text;

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

-- Promote demo account and create admin accounts.
insert into public.users (name, email, password, role)
values
  ('Administrador Demo', 'admin@example.com', 'admin123', 'admin'),
  ('Administrador Principal', 'admin2@example.com', 'admin123', 'admin')
on conflict (email) do update
set
  name = excluded.name,
  password = excluded.password,
  role = excluded.role;

update public.users
set role = 'admin'
where email = 'admin@example.com';

insert into public.data_records (key, value)
values
  ('region', 'Costa Rica'),
  ('entorno', 'Produccion')
on conflict do nothing;
