import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseUrlAndKey } from "@/lib/supabase/env";

/**
 * Request-scoped Supabase client for middleware (cookie read/write on the outgoing response).
 * After `await supabase.auth.getUser()` (or similar), return `getResponse()` so refreshed auth cookies are applied.
 */
export const createClient = (request: NextRequest) => {
  const { url, key } = getSupabaseUrlAndKey();

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  return { supabase, getResponse: () => supabaseResponse };
};
