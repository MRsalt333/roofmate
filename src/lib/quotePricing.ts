import type { PitchValue } from "@/lib/constants";
import {
  EMPTY_OPTIONAL_EXTRAS,
  type DetailedQuoteBreakdown,
  type OptionalExtraKey,
  type OptionalExtraLine,
  type OptionalExtrasState,
  type QuotePricingInput,
} from "@/types/quotePricing";

export function roundCurrency(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Rough perimeter (m) from roof area — default length when enabling an extra. */
export function estimatedPerimeterLm(roofSizeSqm: number): number {
  if (roofSizeSqm <= 0) return 0;
  return roundCurrency(4 * Math.sqrt(roofSizeSqm));
}

const EXTRA_LABELS: Record<OptionalExtraKey, string> = {
  underlayment: "Underlayment / sarking",
  insulation: "Insulation",
  gutter: "Gutter",
  fascia: "Fascia",
  downpipe: "Downpipe",
  ridge_capping: "Ridge capping",
  flashing: "Flashing",
  removal: "Removal / demolition",
  installation: "Installation",
  access_surcharge: "Difficult access",
};

export function optionalExtraLabel(key: OptionalExtraKey): string {
  return EXTRA_LABELS[key];
}

/** UI copy — optional extras are always priced per linear metre. */
export const OPTIONAL_EXTRA_RATE_LABEL = "Cost per linear metre ($/m)";
export const OPTIONAL_EXTRA_LENGTH_LABEL = "Linear metres (m)";

/** Ensures legacy saved rows with `rate` still work as $/m. */
export function normalizeOptionalExtraLine(
  line: OptionalExtraLine & { rate?: number }
): OptionalExtraLine {
  return {
    enabled: Boolean(line.enabled),
    ratePerLm: Number(line.ratePerLm ?? line.rate) || 0,
    linearMeters: Number(line.linearMeters) || 0,
  };
}

export function normalizeOptionalExtras(extras: OptionalExtrasState): OptionalExtrasState {
  const out = { ...extras };
  for (const key of Object.keys(out) as OptionalExtraKey[]) {
    out[key] = normalizeOptionalExtraLine(out[key] as OptionalExtraLine & { rate?: number });
  }
  return out;
}

/** Line total: linear metres × $/m. */
export function calculateOptionalExtraAmount(line: OptionalExtraLine): number {
  const rate = Math.max(0, line.ratePerLm);
  const metres = Math.max(0, line.linearMeters);
  if (rate <= 0 || metres <= 0) return 0;
  return roundCurrency(metres * rate);
}

export function formatOptionalExtraLineLabel(key: OptionalExtraKey, line: OptionalExtraLine): string {
  const base = EXTRA_LABELS[key];
  if (line.linearMeters > 0 && line.ratePerLm > 0) {
    return `${base} (${line.linearMeters} m × $${line.ratePerLm}/m)`;
  }
  return base;
}

function sumOptionalExtras(extras: OptionalExtrasState): {
  total: number;
  lines: DetailedQuoteBreakdown["optionalExtraLines"];
} {
  const lines: DetailedQuoteBreakdown["optionalExtraLines"] = [];
  let total = 0;
  for (const key of Object.keys(extras) as OptionalExtraKey[]) {
    const line = extras[key];
    if (!line.enabled) continue;
    const amount = calculateOptionalExtraAmount(line);
    if (amount <= 0) continue;
    total = roundCurrency(total + amount);
    lines.push({
      key,
      label: formatOptionalExtraLineLabel(key, line),
      amount,
      linearMeters: line.linearMeters,
      ratePerLm: line.ratePerLm,
    });
  }
  return { total, lines };
}

/**
 * Full quote calculation per product rules.
 * markup_percent from templates is intentionally excluded.
 */
export function calculateQuotePricing(input: QuotePricingInput): DetailedQuoteBreakdown {
  const size = Math.max(0, input.roofSizeSqm);
  const matRate = Math.max(0, input.materialCostPerSqm);
  const labRate = Math.max(0, input.labourCostPerSqm);
  const wastePct = Math.max(0, input.wasteAllowancePercent);
  const fixingPct = Math.max(0, input.fixingAllowancePercent);
  const profitPct = Math.max(0, input.profitMarginPercent);
  const gstPct = Math.max(0, input.gstPercent);
  const steepPct = Math.max(0, input.steepPitchSurchargePercent);
  const minLabour = Math.max(0, input.minimumLabourCharge);
  const minQuote = Math.max(0, input.minimumQuoteValue);
  const depositPct = Math.max(0, input.depositPercent);
  const travel = Math.max(0, input.travelCalloutFee);

  const baseMaterialCost = roundCurrency(size * matRate);
  const wasteAllowanceAmount = roundCurrency(baseMaterialCost * (wastePct / 100));
  const materialAfterWaste = baseMaterialCost + wasteAllowanceAmount;
  const fixingAllowanceAmount = roundCurrency(materialAfterWaste * (fixingPct / 100));
  const totalMaterialCost = roundCurrency(materialAfterWaste + fixingAllowanceAmount);

  const baseLabourCost = roundCurrency(size * labRate);
  const labourAfterMinimum = roundCurrency(Math.max(baseLabourCost, minLabour));

  const { total: optionalExtrasTotal, lines: optionalExtraLines } = sumOptionalExtras(
    input.optionalExtras ?? EMPTY_OPTIONAL_EXTRAS
  );

  const travelFee = roundCurrency(travel);
  const subtotalBeforeSurcharges = roundCurrency(
    totalMaterialCost + labourAfterMinimum + optionalExtrasTotal + travelFee
  );

  const steepPitchSurchargeAmount =
    input.pitch === "steep" && steepPct > 0
      ? roundCurrency(subtotalBeforeSurcharges * (steepPct / 100))
      : 0;

  const subtotalBeforeProfit = roundCurrency(subtotalBeforeSurcharges + steepPitchSurchargeAmount);
  const profitMarginAmount = roundCurrency(subtotalBeforeProfit * (profitPct / 100));
  const subtotalBeforeGst = roundCurrency(subtotalBeforeProfit + profitMarginAmount);
  const gstAmount = roundCurrency(subtotalBeforeGst * (gstPct / 100));
  const totalBeforeMinimum = roundCurrency(subtotalBeforeGst + gstAmount);

  const finalPrice = roundCurrency(Math.max(totalBeforeMinimum, minQuote));
  const minimumQuoteAdjustment =
    finalPrice > totalBeforeMinimum ? roundCurrency(finalPrice - totalBeforeMinimum) : 0;

  const depositRequired = roundCurrency(finalPrice * (depositPct / 100));

  return {
    baseMaterialCost,
    wasteAllowanceAmount,
    fixingAllowanceAmount,
    totalMaterialCost,
    baseLabourCost,
    labourAfterMinimum,
    optionalExtrasTotal,
    optionalExtraLines,
    travelFee,
    subtotalBeforeSurcharges,
    steepPitchSurchargeAmount,
    subtotalBeforeProfit,
    profitMarginAmount,
    subtotalBeforeGst,
    gstAmount,
    totalBeforeMinimum,
    minimumQuoteAdjustment,
    finalPrice,
    depositRequired,
  };
}

export function isSteepPitch(pitch: string): pitch is PitchValue {
  return pitch === "steep";
}
