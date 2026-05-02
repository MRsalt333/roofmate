import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseUrlAndKey } from "@/lib/supabase/env";

export function createClient() {
  const { url, key } = getSupabaseUrlAndKey();
  return createBrowserClient(url, key);
}
