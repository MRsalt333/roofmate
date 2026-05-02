import { isDemoMode } from "@/lib/demo";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function POST() {
  if (isDemoMode()) {
    redirect("/dashboard");
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
