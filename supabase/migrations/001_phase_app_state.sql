create table if not exists public.app_state (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_app_state_updated_at on public.app_state;

create trigger set_app_state_updated_at
before update on public.app_state
for each row
execute function public.set_updated_at();

alter table public.app_state enable row level security;

drop policy if exists "Allow anon full access for personal app state" on public.app_state;

create policy "Allow anon full access for personal app state"
on public.app_state
for all
to anon, authenticated
using (true)
with check (true);
