"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/demo";
import { createClient, getUserOrNull } from "@/lib/supabase/server";

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

function rowPayloadFromForm(fd: FormData) {
  const isDefault = String(fd.get("is_default") ?? "") === "on" || String(fd.get("is_default") ?? "") === "true";
  return {
    template_name: reqStr(fd, "template_name", "Default template"),
    is_default: isDefault,
    metal_roofing_per_sqm: optNum(fd, "metal_roofing_per_sqm"),
    tile_roofing_per_sqm: optNum(fd, "tile_roofing_per_sqm"),
    colorbond_per_sqm: optNum(fd, "colorbond_per_sqm"),
    underlayment_per_sqm: optNum(fd, "underlayment_per_sqm"),
    insulation_per_sqm: optNum(fd, "insulation_per_sqm"),
    gutter_per_lm: optNum(fd, "gutter_per_lm"),
    fascia_per_lm: optNum(fd, "fascia_per_lm"),
    downpipe_per_unit: optNum(fd, "downpipe_per_unit"),
    ridge_capping_per_lm: optNum(fd, "ridge_capping_per_lm"),
    flashing_per_lm: optNum(fd, "flashing_per_lm"),
    fixing_allowance_percent: optNum(fd, "fixing_allowance_percent"),
    waste_allowance_percent: optNum(fd, "waste_allowance_percent"),
    labour_per_sqm: optNum(fd, "labour_per_sqm"),
    labour_hourly_rate: optNum(fd, "labour_hourly_rate"),
    minimum_labour_charge: optNum(fd, "minimum_labour_charge"),
    removal_per_sqm: optNum(fd, "removal_per_sqm"),
    installation_per_sqm: optNum(fd, "installation_per_sqm"),
    travel_fee: optNum(fd, "travel_fee"),
    access_surcharge: optNum(fd, "access_surcharge"),
    steep_pitch_surcharge_percent: optNum(fd, "steep_pitch_surcharge_percent"),
    markup_percent: optNum(fd, "markup_percent"),
    profit_margin_percent: optNum(fd, "profit_margin_percent"),
    gst_percent: optNum(fd, "gst_percent") ?? 10,
    minimum_quote_value: optNum(fd, "minimum_quote_value"),
    deposit_percent: optNum(fd, "deposit_percent"),
  };
}

async function clearOtherDefaults(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  await supabase.from("quote_templates").update({ is_default: false }).eq("user_id", userId);
}

export type TemplateActionState = { ok: boolean; message: string } | null;

export async function createQuoteTemplateAction(
  _prev: TemplateActionState,
  fd: FormData
): Promise<TemplateActionState> {
  if (isDemoMode()) {
    return { ok: false, message: "Templates are unavailable in preview mode." };
  }
  const user = await getUserOrNull();
  if (!user) return { ok: false, message: "Sign in to save templates." };
  const supabase = await createClient();
  const payload = rowPayloadFromForm(fd);
  if (payload.is_default) {
    await clearOtherDefaults(supabase, user.id);
  }
  const { data, error } = await supabase
    .from("quote_templates")
    .insert({ ...payload, user_id: user.id })
    .select("id")
    .single();
  if (error) return { ok: false, message: error.message };
  revalidatePath("/account");
  revalidatePath("/quotes/new");
  redirect(`/account/templates/${data.id}/edit`);
}

export async function updateQuoteTemplateAction(
  _prev: TemplateActionState,
  fd: FormData
): Promise<TemplateActionState> {
  if (isDemoMode()) {
    return { ok: false, message: "Templates are unavailable in preview mode." };
  }
  const user = await getUserOrNull();
  if (!user) return { ok: false, message: "Sign in to save templates." };
  const id = String(fd.get("id") ?? "").trim();
  if (!id) return { ok: false, message: "Missing template id." };
  const supabase = await createClient();
  const payload = rowPayloadFromForm(fd);
  if (payload.is_default) {
    await clearOtherDefaults(supabase, user.id);
  }
  const { error } = await supabase
    .from("quote_templates")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/account");
  revalidatePath("/quotes/new");
  revalidatePath(`/account/templates/${id}/edit`);
  return { ok: true, message: "Saved." };
}

export async function deleteQuoteTemplateFormAction(fd: FormData): Promise<void> {
  const id = String(fd.get("id") ?? "").trim();
  if (!id) return;
  await deleteQuoteTemplateAction(id);
}

export async function setDefaultTemplateFormAction(fd: FormData): Promise<void> {
  const id = String(fd.get("id") ?? "").trim();
  if (!id) return;
  await setDefaultTemplateAction(id);
}

export async function deleteQuoteTemplateAction(id: string): Promise<TemplateActionState> {
  if (isDemoMode()) return { ok: false, message: "Preview mode." };
  const user = await getUserOrNull();
  if (!user) return { ok: false, message: "Sign in required." };
  const supabase = await createClient();
  const { error } = await supabase.from("quote_templates").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/account");
  revalidatePath("/quotes/new");
  redirect("/account");
}

export async function setDefaultTemplateAction(id: string): Promise<void> {
  if (isDemoMode()) return;
  const user = await getUserOrNull();
  if (!user) return;
  const supabase = await createClient();
  await clearOtherDefaults(supabase, user.id);
  await supabase
    .from("quote_templates")
    .update({ is_default: true, updated_at: new Date().toISOString() })
    .eq("id", id)
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
  const user = await getUserOrNull();
  if (!user) return { ok: false, message: "Create an account to save this template for next time." };
  const name = reqStr(fd, "template_name", "My pricing");
  const material = optNum(fd, "material_cost");
  const labour = optNum(fd, "labour_cost");
  const margin = optNum(fd, "margin");
  const makeDefault = String(fd.get("make_default") ?? "") === "true";

  const supabase = await createClient();
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
  if (error) return { ok: false, message: error.message };
  revalidatePath("/account");
  revalidatePath("/quotes/new");
  return { ok: true, message: "Template saved." };
}
