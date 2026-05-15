import { notFound, redirect } from "next/navigation";
import { isDemoMode } from "@/lib/demo";
import { getUserOrNull } from "@/lib/supabase/server";
import { fetchQuoteTemplateById } from "@/data/quoteTemplates";
import { TemplateEditPageChrome } from "@/components/templates/TemplateEditForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditTemplatePage({ params }: Props) {
  if (isDemoMode()) redirect("/account");
  const user = await getUserOrNull();
  if (!user) redirect("/login?next=/account");
  const { id } = await params;
  const template = await fetchQuoteTemplateById(id);
  if (!template) notFound();
  return <TemplateEditPageChrome template={template} />;
}
