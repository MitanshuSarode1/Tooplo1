-- Companies table
create table if not exists public.companies (
  id uuid references public.profiles(id) 
     on delete cascade not null primary key,
  company_name text not null,
  industry text,
  website text,
  logo_url text,
  description text,
  is_verified boolean default false,
  employee_count text,
  completion_percentage integer default 30
);

-- Add company_id to applications table
alter table public.applications
add column if not exists 
company_id uuid references public.companies(id);

-- Enable RLS
alter table public.companies enable row level security;

-- RLS Policies
create policy "Companies manage own profile"
on public.companies for all
using (auth.uid() = id);

create policy "Admins manage all companies"
on public.companies for all
using (public.is_admin());
