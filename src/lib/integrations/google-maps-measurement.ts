/**
 * Scaffold: Google Maps roof measurement
 * ---------------------------------------
 * Future: use Maps JavaScript API + Geometry or a third-party roof measurement
 * service to pre-fill roof area (m²) on the quote form.
 *
 * Env vars (add when implementing):
 * - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
 */

export type RoofMeasurementDraft = {
  /** Approximate roof footprint or panel area in m² */
  areaSqm: number;
  /** Optional confidence / source tag for audit */
  source?: "manual_polygon" | "provider_estimate";
};

export async function fetchRoofMeasurementDraft(_address: string): Promise<RoofMeasurementDraft | null> {
  // Intentionally unimplemented — return null until Maps integration ships.
  return null;
}
