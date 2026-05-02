-- Roofmate schema: profiles (extends auth.users) + quotes (jobs)
-- Run in Supabase SQL Editor or via `supabase db push` when using Supabase CLI.

-- Profiles mirror auth users for app-specific columns
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Contractor profile; id matches auth.users.id';

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  customer_name text not null,
  address text,
  roof_size numeric not null check (roof_size > 0),
  roof_type text not null,
  pitch text not null,
  material_cost numeric not null check (material_cost >= 0),
  labour_cost numeric not null check (labour_cost >= 0),
  margin numeric not null check (margin >= 0),
  final_price numeric not null check (final_price >= 0),
  created_at timestamptz not null default now()
);

comment on table public.quotes is 'Saved roofing quotes (jobs) per user';
comment on column public.quotes.material_cost is 'Material $/m² at time of quote';
comment on column public.quotes.labour_cost is 'Labour $/m² at time of quote';
comment on column public.quotes.margin is 'Margin percent as whole number, e.g. 15 for 15%';

-- New auth user → profile row
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.quotes enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "quotes_select_own" on public.quotes;
create policy "quotes_select_own"
  on public.quotes for select
  using (auth.uid() = user_id);

drop policy if exists "quotes_insert_own" on public.quotes;
create policy "quotes_insert_own"
  on public.quotes for insert
  with check (auth.uid() = user_id);

drop policy if exists "quotes_update_own" on public.quotes;
create policy "quotes_update_own"
  on public.quotes for update
  using (auth.uid() = user_id);

drop policy if exists "quotes_delete_own" on public.quotes;
create policy "quotes_delete_own"
  on public.quotes for delete
  using (auth.uid() = user_id);
