import { isDemoMode } from "@/lib/demo";

/**
 * Supabase public URL + anon key, or placeholders when demo mode is on
 * (so createClient never throws before real requests).
 */
export function getSupabaseUrlAndKey(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  if (url && key) {
    return { url, key };
  }
  if (isDemoMode()) {
    return {
      url: "https://demo-placeholder.supabase.co",
      key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
    };
  }
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Add them to .env.local, or set NEXT_PUBLIC_DEMO_MODE=true for a UI-only preview."
  );
}
