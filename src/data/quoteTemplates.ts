import { createClient, getUserOrNull } from "@/lib/supabase/server";
import type { QuoteTemplateRow } from "@/types/quoteTemplate";

export async function fetchQuoteTemplatesForUser(): Promise<QuoteTemplateRow[]> {
  const user = await getUserOrNull();
  if (!user) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("quote_templates")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as QuoteTemplateRow[];
  } catch {
    return [];
  }
}

export async function fetchQuoteTemplateById(id: string): Promise<QuoteTemplateRow | null> {
  const user = await getUserOrNull();
  if (!user) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("quote_templates")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (error || !data) return null;
    return data as QuoteTemplateRow;
  } catch {
    return null;
  }
}

export async function fetchDefaultQuoteTemplate(): Promise<QuoteTemplateRow | null> {
  const user = await getUserOrNull();
  if (!user) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("quote_templates")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .maybeSingle();
    if (error || !data) return null;
    return data as QuoteTemplateRow;
  } catch {
    return null;
  }
}
