import type { PitchValue, RoofTypeValue } from "@/lib/constants";

/** Keys for optional line items (rates from template; user can edit per quote). */
export const OPTIONAL_EXTRA_KEYS = [
  "underlayment",
  "insulation",
  "gutter",
  "fascia",
  "downpipe",
  "ridge_capping",
  "flashing",
  "removal",
  "installation",
  "access_surcharge",
] as const;

export type OptionalExtraKey = (typeof OPTIONAL_EXTRA_KEYS)[number];

export type OptionalExtraLine = {
  enabled: boolean;
  /** Price per linear metre ($/m). */
  ratePerLm: number;
  /** Quantity in linear metres. */
  linearMeters: number;
};

export type OptionalExtrasState = Record<OptionalExtraKey, OptionalExtraLine>;

/** Editable pricing fields on the new-quote form (snapshot persisted on save). */
export type QuotePricingFields = {
  materialCostPerSqm: number;
  labourCostPerSqm: number;
  profitMarginPercent: number;
  gstPercent: number;
  wasteAllowancePercent: number;
  fixingAllowancePercent: number;
  travelCalloutFee: number;
  minimumLabourCharge: number;
  minimumQuoteValue: number;
  depositPercent: number;
  steepPitchSurchargePercent: number;
  optionalExtras: OptionalExtrasState;
};

export type QuotePricingContext = {
  roofSizeSqm: number;
  roofType: RoofTypeValue;
  pitch: PitchValue;
};

export type QuotePricingInput = QuotePricingFields & QuotePricingContext;

export type DetailedQuoteBreakdown = {
  baseMaterialCost: number;
  wasteAllowanceAmount: number;
  fixingAllowanceAmount: number;
  totalMaterialCost: number;
  baseLabourCost: number;
  labourAfterMinimum: number;
  optionalExtrasTotal: number;
  optionalExtraLines: {
    key: OptionalExtraKey;
    label: string;
    amount: number;
    linearMeters: number;
    ratePerLm: number;
  }[];
  travelFee: number;
  subtotalBeforeSurcharges: number;
  steepPitchSurchargeAmount: number;
  subtotalBeforeProfit: number;
  profitMarginAmount: number;
  subtotalBeforeGst: number;
  gstAmount: number;
  totalBeforeMinimum: number;
  minimumQuoteAdjustment: number;
  finalPrice: number;
  depositRequired: number;
};

export const EMPTY_OPTIONAL_EXTRAS: OptionalExtrasState = {
  underlayment: { enabled: false, ratePerLm: 0, linearMeters: 0 },
  insulation: { enabled: false, ratePerLm: 0, linearMeters: 0 },
  gutter: { enabled: false, ratePerLm: 0, linearMeters: 0 },
  fascia: { enabled: false, ratePerLm: 0, linearMeters: 0 },
  downpipe: { enabled: false, ratePerLm: 0, linearMeters: 0 },
  ridge_capping: { enabled: false, ratePerLm: 0, linearMeters: 0 },
  flashing: { enabled: false, ratePerLm: 0, linearMeters: 0 },
  removal: { enabled: false, ratePerLm: 0, linearMeters: 0 },
  installation: { enabled: false, ratePerLm: 0, linearMeters: 0 },
  access_surcharge: { enabled: false, ratePerLm: 0, linearMeters: 0 },
};

export const DEFAULT_QUOTE_PRICING_FIELDS: QuotePricingFields = {
  materialCostPerSqm: 45,
  labourCostPerSqm: 35,
  profitMarginPercent: 15,
  gstPercent: 10,
  wasteAllowancePercent: 0,
  fixingAllowancePercent: 0,
  travelCalloutFee: 0,
  minimumLabourCharge: 0,
  minimumQuoteValue: 0,
  depositPercent: 0,
  steepPitchSurchargePercent: 0,
  optionalExtras: EMPTY_OPTIONAL_EXTRAS,
};

/** Persisted on `quotes.pricing_snapshot` (JSON). */
export type QuotePricingSnapshot = QuotePricingFields & {
  templateId: string | null;
  computed: DetailedQuoteBreakdown;
};
