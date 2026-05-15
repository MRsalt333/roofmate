import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseUrlAndKey } from "@/lib/supabase/env";

export const createClient = () => {
  const { url, key } = getSupabaseUrlAndKey();
  return createBrowserClient(url, key);
};
