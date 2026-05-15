"use server";

import type { PostgrestError, User } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/demo";
import { createClient, getUserOrNull } from "@/lib/supabase/server";
import { formatPostgrestError } from "@/lib/supabase/postgrestError";

function optNum(fd: FormData, key: string): number | null {
  const v = String(fd.get(key) ?? "").trim();
  if (v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function reqStr(fd: FormData, key: string, fallback: string): string {
  const v = String(fd.get(key) ?? "").trim();
  return v.length > 0 ? v : fallback;
}

function rowPayloadFromPlainObject(o: Record<string, unknown>) {
  const str = (k: string) => (o[k] == null ? "" : String(o[k]).trim());
  const optNumFromObj = (k: string): number | null => {
    const v = str(k);
    if (v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const isDefault = o.is_default === true || str("is_default") === "true" || str("is_default") === "on";
  return {
    template_name: str("template_name") || "Default template",
    is_default: isDefault,
    metal_roofing_per_sqm: optNumFromObj("metal_roofing_per_sqm"),
    tile_roofing_per_sqm: optNumFromObj("tile_roofing_per_sqm"),
    colorbond_per_sqm: optNumFromObj("colorbond_per_sqm"),
    underlayment_per_sqm: optNumFromObj("underlayment_per_sqm"),
    insulation_per_sqm: optNumFromObj("insulation_per_sqm"),
    gutter_per_lm: optNumFromObj("gutter_per_lm"),
    fascia_per_lm: optNumFromObj("fascia_per_lm"),
    downpipe_per_unit: optNumFromObj("downpipe_per_unit"),
    ridge_capping_per_lm: optNumFromObj("ridge_capping_per_lm"),
    flashing_per_lm: optNumFromObj("flashing_per_lm"),
    fixing_allowance_percent: optNumFromObj("fixing_allowance_percent"),
    waste_allowance_percent: optNumFromObj("waste_allowance_percent"),
    labour_per_sqm: optNumFromObj("labour_per_sqm"),
    labour_hourly_rate: optNumFromObj("labour_hourly_rate"),
    minimum_labour_charge: optNumFromObj("minimum_labour_charge"),
    removal_per_sqm: optNumFromObj("removal_per_sqm"),
    installation_per_sqm: optNumFromObj("installation_per_sqm"),
    travel_fee: optNumFromObj("travel_fee"),
    access_surcharge: optNumFromObj("access_surcharge"),
    steep_pitch_surcharge_percent: optNumFromObj("steep_pitch_surcharge_percent"),
    markup_percent: optNumFromObj("markup_percent"),
    profit_margin_percent: optNumFromObj("profit_margin_percent"),
    gst_percent: optNumFromObj("gst_percent") ?? 10,
    minimum_quote_value: optNumFromObj("minimum_quote_value"),
    deposit_percent: optNumFromObj("deposit_percent"),
  };
}

type TemplateRowPayload = ReturnType<typeof rowPayloadFromPlainObject>;

/** Parses editor JSON from the client (string or pre-parsed object). */
function parseTemplateRowPayloadFromUnknown(raw: unknown): TemplateRowPayload | null {
  if (raw == null) return null;
  if (typeof File !== "undefined" && raw instanceof File) return null;
  let parsed: unknown;
  if (typeof raw === "string") {
    const s = raw.trim();
    if (!s) return null;
    try {
      parsed = JSON.parse(s);
    } catch {
      return null;
    }
  } else if (typeof raw === "object") {
    parsed = raw;
  } else {
    return null;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
  return rowPayloadFromPlainObject(parsed as Record<string, unknown>);
}

async function clearOtherDefaults(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  await supabase.from("quote_templates").update({ is_default: false }).eq("user_id", userId);
}

/** One Supabase client + validated user JWT for writes (avoids stale/empty session on a second client). */
async function supabaseForWrite(options?: {
  /** When set, used instead of the default sign-in message if there is no user. */
  unsignedMessage?: string;
}): Promise<
  { ok: true; supabase: Awaited<ReturnType<typeof createClient>>; user: User } | { ok: false; message: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (!user) {
    if (options?.unsignedMessage) {
      return { ok: false, message: options.unsignedMessage };
    }
    const msg = error?.message?.toLowerCase().includes("jwt")
      ? "Your session expired — please sign in again."
      : "Sign in to save templates.";
    return { ok: false, message: msg };
  }
  return { ok: true, supabase, user };
}

function dbWriteErrorMessage(error: PostgrestError, table: string): string {
  const base = formatPostgrestError(error);
  const m = base.toLowerCase();
  if (m.includes("permission denied") || m.includes("row-level security")) {
    return `Could not save (${table}). Apply migrations \`20260215140000_app_table_grants.sql\` and \`20260215160000_schema_usage_grants.sql\` (or \`npm run db:push\`). ${base}`;
  }
  return base;
}

export type TemplateActionState = { ok: boolean; message: string } | null;

/**
 * Create a quote template from the editor JSON string.
 * Uses a plain string argument (not FormData + useActionState + bind) so the payload is never dropped by the action runtime.
 */
export async function createQuoteTemplateFromJsonAction(json: string): Promise<TemplateActionState> {
  if (isDemoMode()) {
    return { ok: false, message: "Templates are unavailable in preview mode." };
  }
  const ctx = await supabaseForWrite();
  if (!ctx.ok) return { ok: false, message: ctx.message };
  const { supabase, user } = ctx;
  const payload = parseTemplateRowPayloadFromUnknown(json);
  if (!payload) {
    return { ok: false, message: "Could not read template fields. Refresh the page and try again." };
  }
  if (payload.is_default) {
    await clearOtherDefaults(supabase, user.id);
  }
  const { error } = await supabase.from("quote_templates").insert({ ...payload, user_id: user.id });
  if (error) return { ok: false, message: dbWriteErrorMessage(error, "quote_templates") };
  revalidatePath("/account");
  revalidatePath("/quotes/new");
  redirect("/account");
}

/** Update a quote template from the editor JSON string (see createQuoteTemplateFromJsonAction). */
export async function updateQuoteTemplateFromJsonAction(
  templateId: string,
  json: string
): Promise<TemplateActionState> {
  if (isDemoMode()) {
    return { ok: false, message: "Templates are unavailable in preview mode." };
  }
  const ctx = await supabaseForWrite();
  if (!ctx.ok) return { ok: false, message: ctx.message };
  const { supabase, user } = ctx;
  const id = String(templateId ?? "").trim();
  if (!id) return { ok: false, message: "Missing template id." };
  const payload = parseTemplateRowPayloadFromUnknown(json);
  if (!payload) {
    return { ok: false, message: "Could not read template fields. Refresh the page and try again." };
  }
  if (payload.is_default) {
    await clearOtherDefaults(supabase, user.id);
  }
  const { error } = await supabase
    .from("quote_templates")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, message: dbWriteErrorMessage(error, "quote_templates") };
  revalidatePath("/account");
  revalidatePath("/quotes/new");
  revalidatePath(`/account/templates/${id}/edit`);
  redirect("/account");
}

export async function deleteQuoteTemplateAction(
  id: string,
  _formData?: FormData
): Promise<TemplateActionState> {
  const templateId = String(id ?? "").trim();
  if (!templateId) return { ok: false, message: "Missing template id." };
  if (isDemoMode()) return { ok: false, message: "Preview mode." };
  const user = await getUserOrNull();
  if (!user) return { ok: false, message: "Sign in required." };
  const supabase = await createClient();
  const { error } = await supabase.from("quote_templates").delete().eq("id", templateId).eq("user_id", user.id);
  if (error) return { ok: false, message: formatPostgrestError(error) };
  revalidatePath("/account");
  revalidatePath("/quotes/new");
  redirect("/account");
}

/** Native `<form action>` expects `Promise<void>`; errors from delete are rare (RLS); success redirects. */
export async function deleteQuoteTemplateFormAction(
  templateId: string,
  _formData: FormData
): Promise<void> {
  await deleteQuoteTemplateAction(templateId, _formData);
}

export async function setDefaultTemplateAction(id: string, _formData?: FormData): Promise<void> {
  const templateId = String(id ?? "").trim();
  if (!templateId) return;
  if (isDemoMode()) return;
  const user = await getUserOrNull();
  if (!user) return;
  const supabase = await createClient();
  await clearOtherDefaults(supabase, user.id);
  await supabase
    .from("quote_templates")
    .update({ is_default: true, updated_at: new Date().toISOString() })
    .eq("id", templateId)
    .eq("user_id", user.id);
  revalidatePath("/account");
  revalidatePath("/quotes/new");
}

/**
 * Saves current quote line material/labour/margin into a new template (quick save from quote form).
 */
export async function saveQuickTemplateFromQuoteAction(
  _prev: TemplateActionState,
  fd: FormData
): Promise<TemplateActionState> {
  if (isDemoMode()) {
    return { ok: false, message: "Templates are unavailable in preview mode." };
  }
  const ctx = await supabaseForWrite({
    unsignedMessage: "Create an account to save this template for next time.",
  });
  if (!ctx.ok) return { ok: false, message: ctx.message };
  const { supabase, user } = ctx;
  const name = reqStr(fd, "template_name", "My pricing");
  const material = optNum(fd, "material_cost");
  const labour = optNum(fd, "labour_cost");
  const margin = optNum(fd, "margin");
  const makeDefault = String(fd.get("make_default") ?? "") === "true";

  if (makeDefault) {
    await clearOtherDefaults(supabase, user.id);
  }
  const { error } = await supabase.from("quote_templates").insert({
    user_id: user.id,
    template_name: name,
    is_default: makeDefault,
    metal_roofing_per_sqm: material,
    tile_roofing_per_sqm: material,
    colorbond_per_sqm: material,
    labour_per_sqm: labour,
    profit_margin_percent: margin,
    gst_percent: 10,
  });
  if (error) return { ok: false, message: dbWriteErrorMessage(error, "quote_templates") };
  revalidatePath("/account");
  revalidatePath("/quotes/new");
  return { ok: true, message: "Template saved." };
}
