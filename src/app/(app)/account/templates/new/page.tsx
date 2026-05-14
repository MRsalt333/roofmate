import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/demo";
import { getUserOrNull } from "@/lib/supabase/server";
import { TemplateCreatePageChrome } from "@/components/templates/TemplateCreateForm";

export default async function NewTemplatePage() {
  if (isDemoMode()) {
    redirect("/account");
  }
  const user = await getUserOrNull();
  if (!user) {
    redirect("/login?next=/account/templates/new");
  }

  return <TemplateCreatePageChrome />;
}
