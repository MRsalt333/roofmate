import { DEFAULT_QUOTE_FORM } from "@/lib/constants";
import type { QuoteTemplateRow } from "@/types/quoteTemplate";
import type { PitchValue, RoofTypeValue } from "@/lib/constants";

function num(v: number | null | undefined, fallback: number): number {
  if (v == null || !Number.isFinite(Number(v))) return fallback;
  return Number(v);
}

/**
 * Picks a material $/m² from the template based on roof type, with sensible fallbacks.
 */
export function materialPerSqmFromTemplate(template: QuoteTemplateRow, roofType: RoofTypeValue): number {
  if (roofType === "colorbond") {
    return num(template.colorbond_per_sqm, num(template.metal_roofing_per_sqm, DEFAULT_QUOTE_FORM.materialCostPerSqm));
  }
  if (roofType === "tile" || roofType === "concrete_tile" || roofType === "terracotta") {
    return num(template.tile_roofing_per_sqm, DEFAULT_QUOTE_FORM.materialCostPerSqm);
  }
  return num(template.metal_roofing_per_sqm, DEFAULT_QUOTE_FORM.materialCostPerSqm);
}

export function labourPerSqmFromTemplate(template: QuoteTemplateRow): number {
  return num(template.labour_per_sqm, DEFAULT_QUOTE_FORM.labourCostPerSqm);
}

/**
 * Maps template business fields to the quote form margin (% on subtotal).
 * Adds steep pitch surcharge into the margin field when pitch is steep (prefill only; user can edit).
 */
export function marginPercentFromTemplate(
  template: QuoteTemplateRow,
  pitch: PitchValue
): number {
  const base = num(
    template.profit_margin_percent,
    num(template.markup_percent, DEFAULT_QUOTE_FORM.marginPercent)
  );
  if (pitch === "steep") {
    return base + num(template.steep_pitch_surcharge_percent, 0);
  }
  return base;
}

export function applyTemplateToQuoteInputs(
  template: QuoteTemplateRow,
  roofType: RoofTypeValue,
  pitch: PitchValue
): { material: number; labour: number; margin: number } {
  return {
    material: materialPerSqmFromTemplate(template, roofType),
    labour: labourPerSqmFromTemplate(template),
    margin: marginPercentFromTemplate(template, pitch),
  };
}
