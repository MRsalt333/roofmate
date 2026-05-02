/** UI-only preview: no Supabase project required */
export function isDemoMode(): boolean {
  const v = process.env.NEXT_PUBLIC_DEMO_MODE?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}
