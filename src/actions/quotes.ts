"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/demo";
import { createClient } from "@/lib/supabase/server";
import { calculateQuotePricing } from "@/lib/quotePricing";
import { buildPricingSnapshot, parseQuotePricingFieldsFromJson } from "@/lib/quoteFormState";
import { PITCH_OPTIONS, ROOF_TYPES } from "@/lib/constants";
import type { PitchValue, RoofTypeValue } from "@/lib/constants";
import { formatPostgrestError } from "@/lib/supabase/postgrestError";
import type { QuotePricingFields } from "@/types/quotePricing";

function validRoofType(v: string): v is RoofTypeValue {
  return ROOF_TYPES.some((r) => r.value === v);
}

function validPitch(v: string): v is PitchValue {
  return PITCH_OPTIONS.some((p) => p.value === v);
}

export type SaveQuoteState = { message: string } | null;

type NormalizedQuote = {
  customer_name: string;
  address: string | null;
  roof_size: number;
  roof_type: RoofTypeValue;
  pitch: PitchValue;
  template_id: string | null;
  pricing: QuotePricingFields;
};

type QuoteReadResult = { ok: true; data: NormalizedQuote } | { ok: false; message: string };

function readQuotePayload(raw: Record<string, unknown>): QuoteReadResult {
  const customer_name = String(raw.customer_name ?? "").trim();
  const address = String(raw.address ?? "").trim() || null;
  const roof_size = Number(raw.roof_size);
  const roof_type = String(raw.roof_type ?? "");
  const pitch = String(raw.pitch ?? "");
  const template_id = String(raw.template_id ?? "").trim() || null;

  if (!customer_name) return { ok: false, message: "Customer name is required." };
  if (!Number.isFinite(roof_size) || roof_size <= 0) {
    return { ok: false, message: "Roof size must be a positive number." };
  }
  if (!validRoofType(roof_type)) return { ok: false, message: "Invalid roof type." };
  if (!validPitch(pitch)) return { ok: false, message: "Invalid pitch." };

  const pricing = parseQuotePricingFieldsFromJson(raw);
  if (pricing.materialCostPerSqm < 0 || pricing.labourCostPerSqm < 0 || pricing.profitMarginPercent < 0) {
    return { ok: false, message: "Pricing values cannot be negative." };
  }

  return {
    ok: true,
    data: { customer_name, address, roof_size, roof_type, pitch, template_id, pricing },
  };
}

function readQuoteFromFormData(formData: FormData): QuoteReadResult {
  const raw: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    raw[key] = value;
  });
  const json = formData.get("quote_json");
  if (typeof json === "string" && json.trim()) {
    try {
      return readQuotePayload(JSON.parse(json) as Record<string, unknown>);
    } catch {
      return { ok: false, message: "Invalid quote data." };
    }
  }
  return readQuotePayload(raw);
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
  return readQuotePayload(raw as Record<string, unknown>);
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

  const computed = calculateQuotePricing({
    ...data.pricing,
    roofSizeSqm: data.roof_size,
    roofType: data.roof_type,
    pitch: data.pitch,
  });

  const snapshot = buildPricingSnapshot(data.template_id, data.pricing, {
    roofSizeSqm: data.roof_size,
    roofType: data.roof_type,
    pitch: data.pitch,
  }, computed);

  const { data: row, error } = await supabase
    .from("quotes")
    .insert({
      user_id: user.id,
      customer_name: data.customer_name,
      address: data.address,
      roof_size: data.roof_size,
      roof_type: data.roof_type,
      pitch: data.pitch,
      material_cost: data.pricing.materialCostPerSqm,
      labour_cost: data.pricing.labourCostPerSqm,
      margin: data.pricing.profitMarginPercent,
      final_price: computed.finalPrice,
      gst_percent: data.pricing.gstPercent,
      waste_allowance_percent: data.pricing.wasteAllowancePercent,
      fixing_allowance_percent: data.pricing.fixingAllowancePercent,
      travel_callout_fee: data.pricing.travelCalloutFee,
      minimum_labour_charge: data.pricing.minimumLabourCharge,
      minimum_quote_value: data.pricing.minimumQuoteValue,
      deposit_percent: data.pricing.depositPercent,
      steep_pitch_surcharge_percent: data.pricing.steepPitchSurchargePercent,
      template_id: data.template_id,
      optional_extras: data.pricing.optionalExtras,
      pricing_snapshot: snapshot,
    })
    .select("id")
    .single();

  if (error) {
    const msg = formatPostgrestError(error);
    if (msg.includes("permission denied") || msg.toLowerCase().includes("row-level security")) {
      return {
        message:
          "Could not save the quote (database blocked the write). Apply migrations `20260215140000_app_table_grants.sql`, `20260215160000_schema_usage_grants.sql`, and `20260216120000_quote_pricing_snapshot.sql` in the Supabase SQL editor, or run `npm run db:push`. Details: " +
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

export async function saveQuoteAction(_prev: SaveQuoteState, formData: FormData): Promise<SaveQuoteState> {
  const read = readQuoteFromFormData(formData);
  if (!read.ok) return { message: read.message };
  return persistQuote(read.data);
}

export async function saveQuoteFromJsonAction(json: string): Promise<SaveQuoteState> {
  const read = readQuoteFromJson(json);
  if (!read.ok) return { message: read.message };
  return persistQuote(read.data);
}
