/**
 * UI-only preview without a Supabase project.
 *
 * Enabled when `NEXT_PUBLIC_DEMO_MODE` is truthy, or when Supabase URL/key
 * are not both set (implicit preview so the app does not 500 on missing env).
 * Set `NEXT_PUBLIC_DEMO_MODE=false` to opt out and surface configuration errors instead.
 */
export function isDemoMode(): boolean {
  const v = process.env.NEXT_PUBLIC_DEMO_MODE?.trim().toLowerCase();
  if (v === "false" || v === "0" || v === "no") {
    return false;
  }
  if (v === "true" || v === "1" || v === "yes") {
    return true;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  if (!url || !key) {
    return true;
  }

  return false;
}
