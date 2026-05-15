import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseUrlAndKey } from "@/lib/supabase/env";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

export const createClient = (cookieStore: CookieStore) => {
  const { url, key } = getSupabaseUrlAndKey();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          /* The `setAll` method was called from a Server Component — safe to ignore when middleware refreshes sessions. */
        }
      },
    },
  });
};
