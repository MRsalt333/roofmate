/**
 * Row shape for public.quote_templates (matches Supabase / migration).
 * Nullable numeric fields mean “not set” in the template editor.
 */
export type QuoteTemplateRow = {
  id: string;
  user_id: string;
  template_name: string;
  is_default: boolean;
  metal_roofing_per_sqm: number | null;
  tile_roofing_per_sqm: number | null;
  colorbond_per_sqm: number | null;
  underlayment_per_sqm: number | null;
  insulation_per_sqm: number | null;
  gutter_per_lm: number | null;
  fascia_per_lm: number | null;
  downpipe_per_unit: number | null;
  ridge_capping_per_lm: number | null;
  flashing_per_lm: number | null;
  fixing_allowance_percent: number | null;
  waste_allowance_percent: number | null;
  labour_per_sqm: number | null;
  labour_hourly_rate: number | null;
  minimum_labour_charge: number | null;
  removal_per_sqm: number | null;
  installation_per_sqm: number | null;
  travel_fee: number | null;
  access_surcharge: number | null;
  steep_pitch_surcharge_percent: number | null;
  markup_percent: number | null;
  profit_margin_percent: number | null;
  gst_percent: number;
  minimum_quote_value: number | null;
  deposit_percent: number | null;
  created_at: string;
  updated_at: string;
};

/** Main quote form pricing fields (manual or prefilled from a template). */
export type QuotePricingInputs = {
  materialCostPerSqm: number;
  labourCostPerSqm: number;
  marginPercent: number;
};

export type { QuoteCalculationResult } from "@/lib/pricing";