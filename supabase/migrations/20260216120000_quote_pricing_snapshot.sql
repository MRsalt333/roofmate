-- Quote pricing snapshot: store full pricing inputs + computed breakdown per job.
-- Legacy columns (material_cost, labour_cost, margin, final_price) remain for list views.

alter table public.quotes
  add column if not exists gst_percent numeric,
  add column if not exists waste_allowance_percent numeric,
  add column if not exists fixing_allowance_percent numeric,
  add column if not exists travel_callout_fee numeric,
  add column if not exists minimum_labour_charge numeric,
  add column if not exists minimum_quote_value numeric,
  add column if not exists deposit_percent numeric,
  add column if not exists steep_pitch_surcharge_percent numeric,
  add column if not exists template_id uuid references public.quote_templates (id) on delete set null,
  add column if not exists optional_extras jsonb not null default '{}'::jsonb,
  add column if not exists pricing_snapshot jsonb;

comment on column public.quotes.margin is 'Profit margin percent at time of quote (whole number, e.g. 15)';
comment on column public.quotes.pricing_snapshot is 'Full pricing inputs + computed breakdown JSON snapshot';

notify pgrst, 'reload schema';
