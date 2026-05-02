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
  /** Whole number percent, e.g. 15 */
  margin: number;
  final_price: number;
  created_at: string;
};

export type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
};
