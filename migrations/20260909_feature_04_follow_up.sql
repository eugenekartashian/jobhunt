-- Feature 04 follow-up: user profile bootstrap, tailored flag, and supporting schema polish.

alter table public.jobs
add column if not exists is_tailored boolean not null default false;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name
  )
  values (
    new.id,
    new.email,
    coalesce(
      nullif(new.profile ->> 'name', ''),
      nullif(new.profile ->> 'full_name', ''),
      nullif(new.metadata ->> 'name', ''),
      nullif(new.metadata ->> 'full_name', '')
    )
  )
  on conflict (id) do update
  set
    email = coalesce(excluded.email, public.profiles.email),
    full_name = coalesce(public.profiles.full_name, excluded.full_name);

  return new;
end;
$$;

drop trigger if exists handle_new_user on auth.users;
create trigger handle_new_user
after insert on auth.users
for each row
execute function public.handle_new_user();
