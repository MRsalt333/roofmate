/** Same JWT Supabase uses in docs examples — invalid host; avoids crashing when env is incomplete. */
const PLACEHOLDER_URL = "https://demo-placeholder.supabase.co";
const PLACEHOLDER_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

/**
 * Supabase public URL + anon key, or stable placeholders when either is missing.
 * Never throws — misconfiguration is handled at call sites (demo UI, redirects, try/catch on getUser).
 */
export function getSupabaseUrlAndKey(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  if (url && key) {
    return { url, key };
  }
  return { url: PLACEHOLDER_URL, key: PLACEHOLDER_KEY };
}
