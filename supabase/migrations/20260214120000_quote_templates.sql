-- Quote templates: reusable pricing for signed-in users.
-- Run in Supabase SQL editor or via supabase db push.

create table if not exists public.quote_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  template_name text not null default 'Default template',
  is_default boolean not null default false,

  metal_roofing_per_sqm numeric,
  tile_roofing_per_sqm numeric,
  colorbond_per_sqm numeric,
  underlayment_per_sqm numeric,
  insulation_per_sqm numeric,
  gutter_per_lm numeric,
  fascia_per_lm numeric,
  downpipe_per_unit numeric,
  ridge_capping_per_lm numeric,
  flashing_per_lm numeric,
  fixing_allowance_percent numeric,
  waste_allowance_percent numeric,

  labour_per_sqm numeric,
  labour_hourly_rate numeric,
  minimum_labour_charge numeric,
  removal_per_sqm numeric,
  installation_per_sqm numeric,
  travel_fee numeric,
  access_surcharge numeric,
  steep_pitch_surcharge_percent numeric,

  markup_percent numeric,
  profit_margin_percent numeric,
  gst_percent numeric not null default 10,
  minimum_quote_value numeric,
  deposit_percent numeric,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quote_templates_user_id_idx on public.quote_templates (user_id);

-- At most one default template per user (Postgres partial unique index).
create unique index if not exists quote_templates_one_default_per_user
  on public.quote_templates (user_id)
  where is_default = true;

alter table public.quote_templates enable row level security;

drop policy if exists "quote_templates_select_own" on public.quote_templates;
create policy "quote_templates_select_own"
  on public.quote_templates for select
  using (auth.uid() = user_id);

drop policy if exists "quote_templates_insert_own" on public.quote_templates;
create policy "quote_templates_insert_own"
  on public.quote_templates for insert
  with check (auth.uid() = user_id);

drop policy if exists "quote_templates_update_own" on public.quote_templates;
create policy "quote_templates_update_own"
  on public.quote_templates for update
  using (auth.uid() = user_id);

drop policy if exists "quote_templates_delete_own" on public.quote_templates;
create policy "quote_templates_delete_own"
  on public.quote_templates for delete
  using (auth.uid() = user_id);

-- Refresh PostgREST schema cache so the table appears to the JS client immediately.
notify pgrst, 'reload schema';
