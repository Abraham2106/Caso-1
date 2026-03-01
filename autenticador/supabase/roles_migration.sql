-- Roles and auth profile migration for existing databases
-- Run in Supabase SQL Editor

alter table public.users
  add column if not exists role text;

alter table public.users
  add column if not exists auth_user_id uuid;

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

insert into public.users (name, email, role)
values
  ('Administrador Demo', 'admin@example.com', 'admin'),
  ('Administrador Principal', 'admin2@example.com', 'admin')
on conflict (email) do update
set
  name = excluded.name,
  role = excluded.role;

-- Optional: promote existing user to admin
update public.users
set role = 'admin'
where email = 'demo@example.com';
