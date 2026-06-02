import type { RoofTypeValue } from "@/lib/constants";
import { applyTemplateToQuotePricing } from "@/lib/templateApply";
import {
  DEFAULT_QUOTE_PRICING_FIELDS,
  EMPTY_OPTIONAL_EXTRAS,
  type OptionalExtraKey,
  type OptionalExtrasState,
  type QuotePricingFields,
  type QuotePricingSnapshot,
} from "@/types/quotePricing";
import type { QuoteTemplateRow } from "@/types/quoteTemplate";
import { calculateQuotePricing, normalizeOptionalExtras } from "@/lib/quotePricing";
import type { DetailedQuoteBreakdown } from "@/types/quotePricing";
import type { PitchValue } from "@/lib/constants";

export function clonePricingFields(fields: QuotePricingFields): QuotePricingFields {
  const optionalExtras = { ...fields.optionalExtras };
  for (const key of Object.keys(optionalExtras) as (keyof typeof optionalExtras)[]) {
    optionalExtras[key] = { ...optionalExtras[key] };
  }
  return { ...fields, optionalExtras };
}

export function defaultQuotePricingFields(): QuotePricingFields {
  return clonePricingFields(DEFAULT_QUOTE_PRICING_FIELDS);
}

export function pricingFromTemplate(
  template: QuoteTemplateRow,
  roofType: RoofTypeValue,
  roofSizeSqm = 0
): QuotePricingFields {
  return clonePricingFields(applyTemplateToQuotePricing(template, roofType, roofSizeSqm));
}

export function parseOptionalExtras(raw: unknown): OptionalExtrasState {
  const base = { ...EMPTY_OPTIONAL_EXTRAS };
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return base;
  const o = raw as Record<string, unknown>;
  for (const key of Object.keys(base) as OptionalExtraKey[]) {
    const item = o[key];
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const row = item as Record<string, unknown>;
      const legacyRate = Number(row.ratePerLm ?? row.rate) || 0;
      base[key] = {
        enabled: row.enabled === true,
        ratePerLm: legacyRate,
        linearMeters: Number(row.linearMeters) || 0,
      };
    }
  }
  return normalizeOptionalExtras(base);
}

export function numField(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function parseQuotePricingFieldsFromJson(raw: Record<string, unknown>): QuotePricingFields {
  return {
    materialCostPerSqm: numField(raw.material_cost ?? raw.materialCostPerSqm, DEFAULT_QUOTE_PRICING_FIELDS.materialCostPerSqm),
    labourCostPerSqm: numField(raw.labour_cost ?? raw.labourCostPerSqm, DEFAULT_QUOTE_PRICING_FIELDS.labourCostPerSqm),
    profitMarginPercent: numField(raw.margin ?? raw.profit_margin_percent ?? raw.profitMarginPercent, DEFAULT_QUOTE_PRICING_FIELDS.profitMarginPercent),
    gstPercent: numField(raw.gst_percent ?? raw.gstPercent, 10),
    wasteAllowancePercent: numField(raw.waste_allowance_percent ?? raw.wasteAllowancePercent, 0),
    fixingAllowancePercent: numField(raw.fixing_allowance_percent ?? raw.fixingAllowancePercent, 0),
    travelCalloutFee: numField(raw.travel_callout_fee ?? raw.travelCalloutFee, 0),
    minimumLabourCharge: numField(raw.minimum_labour_charge ?? raw.minimumLabourCharge, 0),
    minimumQuoteValue: numField(raw.minimum_quote_value ?? raw.minimumQuoteValue, 0),
    depositPercent: numField(raw.deposit_percent ?? raw.depositPercent, 0),
    steepPitchSurchargePercent: numField(raw.steep_pitch_surcharge_percent ?? raw.steepPitchSurchargePercent, 0),
    optionalExtras: parseOptionalExtras(raw.optional_extras ?? raw.optionalExtras),
  };
}

export function buildPricingSnapshot(
  templateId: string | null,
  fields: QuotePricingFields,
  context: { roofSizeSqm: number; roofType: RoofTypeValue; pitch: PitchValue },
  computed: DetailedQuoteBreakdown
): QuotePricingSnapshot {
  return {
    templateId,
    ...clonePricingFields(fields),
    computed,
  };
}

export function computeBreakdownForForm(
  fields: QuotePricingFields,
  roofSizeSqm: number,
  roofType: RoofTypeValue,
  pitch: PitchValue
): DetailedQuoteBreakdown {
  return calculateQuotePricing({
    ...fields,
    roofSizeSqm,
    roofType,
    pitch,
  });
}
