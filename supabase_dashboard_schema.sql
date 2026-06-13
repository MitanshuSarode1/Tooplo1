-- Admin helper function
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- Students table
create table public.students (
  id uuid references public.profiles(id) 
     on delete cascade not null primary key,
  name text not null,
  phone text,
  university text,
  skills text[] default '{}',
  resume_url text,
  completion_percentage integer default 30
);

-- Applications table
create table public.applications (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) 
             on delete cascade not null,
  job_id uuid references public.jobs(id) 
         on delete cascade,
  company_name text not null,
  job_title text not null,
  applied_date timestamp with time zone default now() not null,
  ai_match_score numeric(4,1) default 0,
  status text not null check (
    status in ('Applied','Shortlisted','Interview','Rejected')
  )
);

-- Enable RLS
alter table public.students enable row level security;
alter table public.applications enable row level security;

-- RLS Policies
create policy "Students manage own profile"
on public.students for all using (auth.uid() = id);

create policy "Admins manage all students"
on public.students for all using (public.is_admin());

create policy "Students view own applications"
on public.applications for select 
using (auth.uid() = student_id);

create policy "Students insert own applications"
on public.applications for insert 
with check (auth.uid() = student_id);
