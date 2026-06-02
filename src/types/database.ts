import type { QuotePricingSnapshot } from "@/types/quotePricing";

/** Row shape for public.quotes (jobs) */
export type QuoteRow = {
  id: string;
  user_id: string;
  customer_name: string;
  address: string | null;
  roof_size: number;
  roof_type: string;
  pitch: string;
  /** Per sqm at time of quote */
  material_cost: number;
  labour_cost: number;
  /** Profit margin percent (whole number, e.g. 15) */
  margin: number;
  final_price: number;
  created_at: string;
  gst_percent?: number | null;
  waste_allowance_percent?: number | null;
  fixing_allowance_percent?: number | null;
  travel_callout_fee?: number | null;
  minimum_labour_charge?: number | null;
  minimum_quote_value?: number | null;
  deposit_percent?: number | null;
  steep_pitch_surcharge_percent?: number | null;
  template_id?: string | null;
  optional_extras?: Record<string, unknown> | null;
  pricing_snapshot?: QuotePricingSnapshot | null;
};

export type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
};
