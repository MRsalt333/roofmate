import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * UI-only preview without a Supabase project.
 *
 * Preview when Supabase URL + public key (anon or publishable) are not both set.
 * `NEXT_PUBLIC_DEMO_MODE=true` from the README quick start is ignored once a real project
 * is configured, so saving quotes/templates still works after you add keys.
 * Set `NEXT_PUBLIC_DEMO_MODE=false` to require keys and surface misconfiguration errors.
 */
export function isDemoMode(): boolean {
  const v = process.env.NEXT_PUBLIC_DEMO_MODE?.trim().toLowerCase();
  if (v === "false" || v === "0" || v === "no") {
    return false;
  }

  // Preview without a project: missing URL or public key.
  if (!isSupabaseConfigured()) {
    return true;
  }

  return false;
}
