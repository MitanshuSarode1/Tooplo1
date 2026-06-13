-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  role text not null check (role in ('student', 'company', 'admin')),
  is_verified boolean not null default false,
  created_at timestamp with time zone not null default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Admin check helper function (security definer to avoid RLS recursion)
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- RLS Policies
create policy "Users can read their own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Admins can read all profiles"
  on public.profiles
  for select
  using (public.is_admin());

create policy "Admins can update all profiles"
  on public.profiles
  for update
  using (public.is_admin());
