-- Feature 04: Database Schema
-- InsForge/Postgres tables, RLS policies, indexes, and update triggers.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  location text,
  current_title text,
  experience_level text check (
    experience_level is null
    or experience_level in ('junior', 'mid', 'senior', 'lead')
  ),
  years_experience integer check (
    years_experience is null
    or years_experience >= 0
  ),
  skills text[] not null default '{}',
  industries text[] not null default '{}',
  work_experience jsonb not null default '[]'::jsonb,
  education jsonb not null default '{}'::jsonb,
  job_titles_seeking text[] not null default '{}',
  remote_preference text check (
    remote_preference is null
    or remote_preference in ('remote', 'onsite', 'hybrid', 'any')
  ),
  preferred_locations text[] not null default '{}',
  salary_expectation text,
  cover_letter_tone text check (
    cover_letter_tone is null
    or cover_letter_tone in ('formal', 'casual', 'enthusiastic')
  ),
  linkedin_url text,
  portfolio_url text,
  work_authorization text check (
    work_authorization is null
    or work_authorization in ('citizen', 'permanent_resident', 'visa_required')
  ),
  resume_pdf_url text,
  resume_pdf_key text,
  is_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'running' check (
    status in ('running', 'completed', 'failed')
  ),
  job_title_searched text not null,
  location_searched text,
  jobs_found integer not null default 0 check (jobs_found >= 0),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    completed_at is null
    or completed_at >= started_at
  )
);

drop trigger if exists set_agent_runs_updated_at on public.agent_runs;
create trigger set_agent_runs_updated_at
before update on public.agent_runs
for each row
execute function public.set_updated_at();

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.agent_runs(id) on delete set null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  source text not null check (source in ('search', 'url')),
  source_url text not null,
  external_apply_url text,
  title text not null,
  company text not null,
  location text,
  salary text,
  job_type text check (
    job_type is null
    or job_type in ('fulltime', 'parttime', 'contract')
  ),
  about_role text,
  responsibilities text[] not null default '{}',
  requirements text[] not null default '{}',
  nice_to_have text[] not null default '{}',
  benefits text[] not null default '{}',
  about_company text,
  match_score integer check (
    match_score is null
    or (match_score >= 0 and match_score <= 100)
  ),
  match_reason text,
  matched_skills text[] not null default '{}',
  missing_skills text[] not null default '{}',
  company_research jsonb,
  tailored_resume_url text,
  tailored_resume_key text,
  tailored_cover_letter text,
  tailored_at timestamptz,
  found_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_jobs_updated_at on public.jobs;
create trigger set_jobs_updated_at
before update on public.jobs
for each row
execute function public.set_updated_at();

create unique index if not exists jobs_user_source_url_unique
on public.jobs (user_id, source_url);

create index if not exists agent_runs_user_started_idx
on public.agent_runs (user_id, started_at desc);

create index if not exists jobs_user_found_idx
on public.jobs (user_id, found_at desc);

create index if not exists jobs_user_match_score_idx
on public.jobs (user_id, match_score desc);

create index if not exists jobs_run_idx
on public.jobs (run_id);

create table if not exists public.agent_logs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.agent_runs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  level text not null check (
    level in ('info', 'success', 'warning', 'error')
  ),
  job_id uuid references public.jobs(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists agent_logs_user_created_idx
on public.agent_logs (user_id, created_at desc);

create index if not exists agent_logs_run_created_idx
on public.agent_logs (run_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.agent_runs enable row level security;
alter table public.jobs enable row level security;
alter table public.agent_logs enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
on public.profiles
for delete
using (id = auth.uid());

drop policy if exists "agent_runs_select_own" on public.agent_runs;
create policy "agent_runs_select_own"
on public.agent_runs
for select
using (user_id = auth.uid());

drop policy if exists "agent_runs_insert_own" on public.agent_runs;
create policy "agent_runs_insert_own"
on public.agent_runs
for insert
with check (user_id = auth.uid());

drop policy if exists "agent_runs_update_own" on public.agent_runs;
create policy "agent_runs_update_own"
on public.agent_runs
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "agent_runs_delete_own" on public.agent_runs;
create policy "agent_runs_delete_own"
on public.agent_runs
for delete
using (user_id = auth.uid());

drop policy if exists "jobs_select_own" on public.jobs;
create policy "jobs_select_own"
on public.jobs
for select
using (user_id = auth.uid());

drop policy if exists "jobs_insert_own" on public.jobs;
create policy "jobs_insert_own"
on public.jobs
for insert
with check (user_id = auth.uid());

drop policy if exists "jobs_update_own" on public.jobs;
create policy "jobs_update_own"
on public.jobs
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "jobs_delete_own" on public.jobs;
create policy "jobs_delete_own"
on public.jobs
for delete
using (user_id = auth.uid());

drop policy if exists "agent_logs_select_own" on public.agent_logs;
create policy "agent_logs_select_own"
on public.agent_logs
for select
using (user_id = auth.uid());

drop policy if exists "agent_logs_insert_own" on public.agent_logs;
create policy "agent_logs_insert_own"
on public.agent_logs
for insert
with check (user_id = auth.uid());

drop policy if exists "agent_logs_update_own" on public.agent_logs;
create policy "agent_logs_update_own"
on public.agent_logs
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "agent_logs_delete_own" on public.agent_logs;
create policy "agent_logs_delete_own"
on public.agent_logs
for delete
using (user_id = auth.uid());
