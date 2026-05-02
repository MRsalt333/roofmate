/** Roof covering types shown in quote form */
export const ROOF_TYPES = [
  { value: "metal", label: "Metal" },
  { value: "tile", label: "Tile" },
  { value: "colorbond", label: "Colorbond" },
  { value: "concrete_tile", label: "Concrete tile" },
  { value: "terracotta", label: "Terracotta" },
  { value: "shingle", label: "Shingle" },
  { value: "other", label: "Other" },
] as const;

export type RoofTypeValue = (typeof ROOF_TYPES)[number]["value"];

export const PITCH_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "steep", label: "Steep" },
] as const;

export type PitchValue = (typeof PITCH_OPTIONS)[number]["value"];

/** Sensible defaults for first-time quote (editable in UI) */
export const DEFAULT_QUOTE_FORM = {
  materialCostPerSqm: 45,
  labourCostPerSqm: 35,
  marginPercent: 15,
};
