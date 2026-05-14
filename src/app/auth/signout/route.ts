import { isDemoMode } from "@/lib/demo";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function POST() {
  if (isDemoMode()) {
    redirect("/dashboard");
  }
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    /* still sign user out in the browser if remote signOut fails */
  }
  redirect("/login");
}
