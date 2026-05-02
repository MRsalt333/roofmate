"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/demo";
import { createClient } from "@/lib/supabase/server";
import { calculatePricing } from "@/lib/pricing";
import { PITCH_OPTIONS, ROOF_TYPES } from "@/lib/constants";

function validRoofType(v: string) {
  return ROOF_TYPES.some((r) => r.value === v);
}

function validPitch(v: string) {
  return PITCH_OPTIONS.some((p) => p.value === v);
}

export type SaveQuoteState = { message: string } | null;

/**
 * Persists a quote row for the signed-in user.
 * Uses the same pricing rules as the client preview (`calculatePricing`).
 */
export async function saveQuoteAction(_prev: SaveQuoteState, formData: FormData): Promise<SaveQuoteState> {
  const customer_name = String(formData.get("customer_name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim() || null;
  const roof_size = Number(formData.get("roof_size"));
  const roof_type = String(formData.get("roof_type") ?? "");
  const pitch = String(formData.get("pitch") ?? "");
  const material_cost = Number(formData.get("material_cost"));
  const labour_cost = Number(formData.get("labour_cost"));
  const margin = Number(formData.get("margin"));

  if (!customer_name) return { message: "Customer name is required." };
  if (!Number.isFinite(roof_size) || roof_size <= 0) {
    return { message: "Roof size must be a positive number." };
  }
  if (!validRoofType(roof_type)) return { message: "Invalid roof type." };
  if (!validPitch(pitch)) return { message: "Invalid pitch." };
  if (!Number.isFinite(material_cost) || material_cost < 0) return { message: "Material cost invalid." };
  if (!Number.isFinite(labour_cost) || labour_cost < 0) return { message: "Labour cost invalid." };
  if (!Number.isFinite(margin) || margin < 0) return { message: "Margin invalid." };

  if (isDemoMode()) {
    redirect("/quotes/demo");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { message: "You must be signed in." };
  }

  const breakdown = calculatePricing({
    roofSizeSqm: roof_size,
    materialCostPerSqm: material_cost,
    labourCostPerSqm: labour_cost,
    marginPercent: margin,
  });

  const { data, error } = await supabase
    .from("quotes")
    .insert({
      user_id: user.id,
      customer_name,
      address,
      roof_size,
      roof_type,
      pitch,
      material_cost,
      labour_cost,
      margin,
      final_price: breakdown.finalPrice,
    })
    .select("id")
    .single();

  if (error) {
    return { message: error.message };
  }

  revalidatePath("/dashboard");
  redirect(`/quotes/${data.id}`);
}
