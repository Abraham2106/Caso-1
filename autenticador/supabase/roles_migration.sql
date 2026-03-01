-- Roles migration for existing databases
-- Run in Supabase SQL Editor

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

insert into public.users (name, email, password, role)
values
  ('Administrador Demo', 'admin@example.com', 'admin123', 'admin'),
  ('Administrador Principal', 'admin2@example.com', 'admin123', 'admin')
on conflict (email) do update
set
  name = excluded.name,
  password = excluded.password,
  role = excluded.role;

-- Optional: promote existing user to admin
update public.users
set role = 'admin'
where email = 'demo@example.com';
