import { isDemoMode } from "@/lib/demo";
import { getUserOrNull } from "@/lib/supabase/server";
import { fetchDefaultQuoteTemplate, fetchQuoteTemplatesForUser } from "@/data/quoteTemplates";
import { NewQuoteForm } from "@/components/quotes/NewQuoteForm";

export default async function NewQuotePage() {
  const demo = isDemoMode();
  const user = demo ? null : await getUserOrNull();
  const templates = user && !demo ? await fetchQuoteTemplatesForUser() : [];
  const defaultTemplate = user && !demo ? await fetchDefaultQuoteTemplate() : null;

  return (
    <NewQuoteForm isDemo={demo} isLoggedIn={Boolean(user)} templates={templates} defaultTemplate={defaultTemplate} />
  );
}
