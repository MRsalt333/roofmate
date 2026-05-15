import type { PostgrestError } from "@supabase/supabase-js";

/** Join PostgREST fields so UI shows something actionable (RLS, FK, type errors, etc.). */
export function formatPostgrestError(error: PostgrestError): string {
  const parts = [error.message];
  if (error.details) parts.push(error.details);
  if (error.hint) parts.push(error.hint);
  if (error.code) parts.push(`(${error.code})`);
  return parts.join(" ").trim().slice(0, 800);
}
