import type { User } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isDemoMode } from "@/lib/demo";

function safeInternalPath(next: string | null): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

export async function updateSession(request: NextRequest) {
  if (isDemoMode()) {
    const path = request.nextUrl.pathname;
    if (path === "/") {
      return NextResponse.redirect(new URL("/quotes/new", request.url));
    }
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  let user: User | null = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user ?? null;
  } catch {
    /* Invalid URL, network, or JWKS errors — treat as signed out instead of 500 */
  }

  const isAuthPage = request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup";

  if (isAuthPage && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = safeInternalPath(redirectUrl.searchParams.get("next")) ?? "/quotes/new";
    redirectUrl.searchParams.delete("next");
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
