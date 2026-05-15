"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/demo";
import { createClient } from "@/lib/supabase/server";
import { calculatePricing } from "@/lib/pricing";
import { PITCH_OPTIONS, ROOF_TYPES } from "@/lib/constants";
import { formatPostgrestError } from "@/lib/supabase/postgrestError";

function validRoofType(v: string) {
  return ROOF_TYPES.some((r) => r.value === v);
}

function validPitch(v: string) {
  return PITCH_OPTIONS.some((p) => p.value === v);
}

export type SaveQuoteState = { message: string } | null;

type NormalizedQuote = {
  customer_name: string;
  address: string | null;
  roof_size: number;
  roof_type: string;
  pitch: string;
  material_cost: number;
  labour_cost: number;
  margin: number;
};

type QuoteReadResult = { ok: true; data: NormalizedQuote } | { ok: false; message: string };

function readQuoteFromFormData(formData: FormData): QuoteReadResult {
  const customer_name = String(formData.get("customer_name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim() || null;
  const roof_size = Number(formData.get("roof_size"));
  const roof_type = String(formData.get("roof_type") ?? "");
  const pitch = String(formData.get("pitch") ?? "");
  const material_cost = Number(formData.get("material_cost"));
  const labour_cost = Number(formData.get("labour_cost"));
  const margin = Number(formData.get("margin"));

  if (!customer_name) return { ok: false, message: "Customer name is required." };
  if (!Number.isFinite(roof_size) || roof_size <= 0) {
    return { ok: false, message: "Roof size must be a positive number." };
  }
  if (!validRoofType(roof_type)) return { ok: false, message: "Invalid roof type." };
  if (!validPitch(pitch)) return { ok: false, message: "Invalid pitch." };
  if (!Number.isFinite(material_cost) || material_cost < 0) return { ok: false, message: "Material cost invalid." };
  if (!Number.isFinite(labour_cost) || labour_cost < 0) return { ok: false, message: "Labour cost invalid." };
  if (!Number.isFinite(margin) || margin < 0) return { ok: false, message: "Margin invalid." };

  return {
    ok: true,
    data: { customer_name, address, roof_size, roof_type, pitch, material_cost, labour_cost, margin },
  };
}

function readQuoteFromJson(json: string): QuoteReadResult {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return { ok: false, message: "Invalid quote data. Refresh the page and try again." };
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, message: "Invalid quote data." };
  }
  const o = raw as Record<string, unknown>;
  const customer_name = String(o.customer_name ?? "").trim();
  const address = String(o.address ?? "").trim() || null;
  const roof_size = Number(o.roof_size);
  const roof_type = String(o.roof_type ?? "");
  const pitch = String(o.pitch ?? "");
  const material_cost = Number(o.material_cost);
  const labour_cost = Number(o.labour_cost);
  const margin = Number(o.margin);

  if (!customer_name) return { ok: false, message: "Customer name is required." };
  if (!Number.isFinite(roof_size) || roof_size <= 0) {
    return { ok: false, message: "Roof size must be a positive number." };
  }
  if (!validRoofType(roof_type)) return { ok: false, message: "Invalid roof type." };
  if (!validPitch(pitch)) return { ok: false, message: "Invalid pitch." };
  if (!Number.isFinite(material_cost) || material_cost < 0) return { ok: false, message: "Material cost invalid." };
  if (!Number.isFinite(labour_cost) || labour_cost < 0) return { ok: false, message: "Labour cost invalid." };
  if (!Number.isFinite(margin) || margin < 0) return { ok: false, message: "Margin invalid." };

  return {
    ok: true,
    data: { customer_name, address, roof_size, roof_type, pitch, material_cost, labour_cost, margin },
  };
}

async function persistQuote(data: NormalizedQuote): Promise<SaveQuoteState> {
  if (isDemoMode()) {
    redirect("/quotes/demo");
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (!user) {
    const hint = authError?.message?.toLowerCase().includes("jwt")
      ? "Your session expired — please sign in again."
      : "Create an account to save this quote to your list. You can still download a PDF from the preview above.";
    return { message: hint };
  }

  const breakdown = calculatePricing({
    roofSizeSqm: data.roof_size,
    materialCostPerSqm: data.material_cost,
    labourCostPerSqm: data.labour_cost,
    marginPercent: data.margin,
  });

  const { data: row, error } = await supabase
    .from("quotes")
    .insert({
      user_id: user.id,
      customer_name: data.customer_name,
      address: data.address,
      roof_size: data.roof_size,
      roof_type: data.roof_type,
      pitch: data.pitch,
      material_cost: data.material_cost,
      labour_cost: data.labour_cost,
      margin: data.margin,
      final_price: breakdown.finalPrice,
    })
    .select("id")
    .single();

  if (error) {
    const msg = formatPostgrestError(error);
    if (msg.includes("permission denied") || msg.toLowerCase().includes("row-level security")) {
      return {
        message:
          "Could not save the quote (database blocked the write). Apply migrations `20260215140000_app_table_grants.sql` and `20260215160000_schema_usage_grants.sql` in the Supabase SQL editor, or run `npm run db:push`. Details: " +
          msg,
      };
    }
    return { message: msg };
  }

  const newId = row?.id;
  if (!newId || typeof newId !== "string") {
    return {
      message:
        "The quote was saved but its id could not be read. Check RLS allows SELECT on your own rows right after INSERT.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/quotes/new");
  redirect(`/quotes/${newId}`);
}

/**
 * Persists a quote row for the signed-in user.
 * Uses the same pricing rules as the client preview (`calculatePricing`).
 */
export async function saveQuoteAction(_prev: SaveQuoteState, formData: FormData): Promise<SaveQuoteState> {
  const read = readQuoteFromFormData(formData);
  if (!read.ok) return { message: read.message };
  return persistQuote(read.data);
}

/**
 * Same as {@link saveQuoteAction} but accepts a JSON string from the client.
 * Use this from controlled forms — do not rely on `useActionState` + `FormData` alone (entries can be dropped).
 */
export async function saveQuoteFromJsonAction(json: string): Promise<SaveQuoteState> {
  const read = readQuoteFromJson(json);
  if (!read.ok) return { message: read.message };
  return persistQuote(read.data);
}
