/**
 * Roofing quote pricing helpers.
 *
 * Formulas (per spec):
 * - total_material_cost = roof_size_sqm × material_cost_per_sqm
 * - total_labour_cost = roof_size_sqm × labour_cost_per_sqm
 * - subtotal = material + labour
 * - margin_amount = subtotal × (margin_percent / 100)
 * - final_price = subtotal + margin_amount
 */

export type PricingInputs = {
  roofSizeSqm: number;
  materialCostPerSqm: number;
  labourCostPerSqm: number;
  /** Whole number, e.g. 15 for 15% */
  marginPercent: number;
};

export type PricingBreakdown = {
  totalMaterialCost: number;
  totalLabourCost: number;
  subtotal: number;
  marginAmount: number;
  finalPrice: number;
};

export function calculatePricing(input: PricingInputs): PricingBreakdown {
  const size = Math.max(0, input.roofSizeSqm);
  const mat = Math.max(0, input.materialCostPerSqm);
  const lab = Math.max(0, input.labourCostPerSqm);
  const marginPct = Math.max(0, input.marginPercent);

  const totalMaterialCost = roundCurrency(size * mat);
  const totalLabourCost = roundCurrency(size * lab);
  const subtotal = roundCurrency(totalMaterialCost + totalLabourCost);
  const marginAmount = roundCurrency(subtotal * (marginPct / 100));
  const finalPrice = roundCurrency(subtotal + marginAmount);

  return {
    totalMaterialCost,
    totalLabourCost,
    subtotal,
    marginAmount,
    finalPrice,
  };
}

/** Round to 2 decimals for currency display and persistence */
export function roundCurrency(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
