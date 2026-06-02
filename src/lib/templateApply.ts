import { DEFAULT_QUOTE_FORM } from "@/lib/constants";
import type { RoofTypeValue } from "@/lib/constants";
import { estimatedPerimeterLm } from "@/lib/quotePricing";
import {
  DEFAULT_QUOTE_PRICING_FIELDS,
  EMPTY_OPTIONAL_EXTRAS,
  type OptionalExtraKey,
  type OptionalExtrasState,
  type QuotePricingFields,
} from "@/types/quotePricing";
import type { QuoteTemplateRow } from "@/types/quoteTemplate";

function num(v: number | null | undefined, fallback: number): number {
  if (v == null || !Number.isFinite(Number(v))) return fallback;
  return Number(v);
}

/**
 * Material $/m² from template by roof type (Metal / Tile / Colorbond per spec).
 */
export function materialPerSqmFromTemplate(template: QuoteTemplateRow, roofType: RoofTypeValue): number {
  if (roofType === "colorbond") {
    return num(template.colorbond_per_sqm, num(template.metal_roofing_per_sqm, DEFAULT_QUOTE_FORM.materialCostPerSqm));
  }
  if (roofType === "tile" || roofType === "concrete_tile" || roofType === "terracotta") {
    return num(template.tile_roofing_per_sqm, DEFAULT_QUOTE_FORM.materialCostPerSqm);
  }
  if (roofType === "metal") {
    return num(template.metal_roofing_per_sqm, DEFAULT_QUOTE_FORM.materialCostPerSqm);
  }
  return num(
    template.metal_roofing_per_sqm,
    num(template.tile_roofing_per_sqm, DEFAULT_QUOTE_FORM.materialCostPerSqm)
  );
}

export function labourPerSqmFromTemplate(template: QuoteTemplateRow): number {
  return num(template.labour_per_sqm, DEFAULT_QUOTE_FORM.labourCostPerSqm);
}

export function profitMarginFromTemplate(template: QuoteTemplateRow): number {
  return num(template.profit_margin_percent, DEFAULT_QUOTE_FORM.marginPercent);
}

function optionalExtrasFromTemplate(
  template: QuoteTemplateRow,
  defaultLinearMeters: number
): OptionalExtrasState {
  const base = { ...EMPTY_OPTIONAL_EXTRAS };
  const map: { key: OptionalExtraKey; rate: number | null }[] = [
    { key: "underlayment", rate: template.underlayment_per_sqm },
    { key: "insulation", rate: template.insulation_per_sqm },
    { key: "gutter", rate: template.gutter_per_lm },
    { key: "fascia", rate: template.fascia_per_lm },
    { key: "downpipe", rate: template.downpipe_per_unit },
    { key: "ridge_capping", rate: template.ridge_capping_per_lm },
    { key: "flashing", rate: template.flashing_per_lm },
    { key: "removal", rate: template.removal_per_sqm },
    { key: "installation", rate: template.installation_per_sqm },
    { key: "access_surcharge", rate: template.access_surcharge },
  ];
  const defaultLm = defaultLinearMeters > 0 ? defaultLinearMeters : 0;
  for (const { key, rate } of map) {
    if (rate != null && Number.isFinite(rate)) {
      base[key] = {
        enabled: false,
        ratePerLm: Number(rate),
        linearMeters: defaultLm,
      };
    }
  }
  return base;
}

/**
 * Maps a pricing template to full quote pricing fields (prefill only; user edits per quote).
 */
export function applyTemplateToQuotePricing(
  template: QuoteTemplateRow,
  roofType: RoofTypeValue,
  roofSizeSqm = 0
): QuotePricingFields {
  const defaultLm = estimatedPerimeterLm(roofSizeSqm);
  return {
    materialCostPerSqm: materialPerSqmFromTemplate(template, roofType),
    labourCostPerSqm: labourPerSqmFromTemplate(template),
    profitMarginPercent: profitMarginFromTemplate(template),
    gstPercent: num(template.gst_percent, DEFAULT_QUOTE_PRICING_FIELDS.gstPercent),
    wasteAllowancePercent: num(template.waste_allowance_percent, 0),
    fixingAllowancePercent: num(template.fixing_allowance_percent, 0),
    travelCalloutFee: num(template.travel_fee, 0),
    minimumLabourCharge: num(template.minimum_labour_charge, 0),
    minimumQuoteValue: num(template.minimum_quote_value, 0),
    depositPercent: num(template.deposit_percent, 0),
    steepPitchSurchargePercent: num(template.steep_pitch_surcharge_percent, 0),
    optionalExtras: optionalExtrasFromTemplate(template, defaultLm),
  };
}

/** @deprecated Use applyTemplateToQuotePricing */
export function applyTemplateToQuoteInputs(
  template: QuoteTemplateRow,
  roofType: RoofTypeValue
): { material: number; labour: number; margin: number } {
  const p = applyTemplateToQuotePricing(template, roofType);
  return {
    material: p.materialCostPerSqm,
    labour: p.labourCostPerSqm,
    margin: p.profitMarginPercent,
  };
}
