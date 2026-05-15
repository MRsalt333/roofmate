/** Same JWT Supabase uses in docs examples — invalid host; avoids crashing when env is incomplete. */
const PLACEHOLDER_URL = "https://demo-placeholder.supabase.co";
const PLACEHOLDER_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

/** True when real project URL and a public client key (anon JWT or publishable key) are set. */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    "";
  return Boolean(url && key);
}

/**
 * Supabase public URL + client key (anon or publishable), or stable placeholders when either is missing.
 * Never throws — misconfiguration is handled at call sites (demo UI, redirects, try/catch on getUser).
 */
export function getSupabaseUrlAndKey(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const publishable =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
  const key = anon || publishable;
  if (url && key) {
    return { url, key };
  }
  return { url: PLACEHOLDER_URL, key: PLACEHOLDER_KEY };
}
