import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isDemoMode } from "@/lib/demo";
import { createClient, getUserOrNull } from "@/lib/supabase/server";
import { calculatePricing } from "@/lib/pricing";
import { calculateQuotePricing } from "@/lib/quotePricing";
import { parseQuotePricingFieldsFromJson } from "@/lib/quoteFormState";
import { PITCH_OPTIONS, ROOF_TYPES } from "@/lib/constants";
import type { PitchValue, RoofTypeValue } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import { QuoteBreakdown, QuoteDetailedBreakdown } from "@/components/quotes/QuoteBreakdown";
import { DownloadPdfButton } from "@/components/quotes/DownloadPdfButton";
import type { QuoteRow } from "@/types/database";
import type { DetailedQuoteBreakdown, QuotePricingSnapshot } from "@/types/quotePricing";

type Props = { params: Promise<{ id: string }> };

const DEMO_QUOTE: QuoteRow = {
  id: "demo",
  user_id: "demo",
  customer_name: "Sample customer",
  address: "123 Demo Street, Brisbane",
  roof_size: 180,
  roof_type: "colorbond",
  pitch: "medium",
  material_cost: 45,
  labour_cost: 35,
  margin: 15,
  final_price: 16560,
  created_at: new Date().toISOString(),
};

export default async function QuoteDetailPage({ params }: Props) {
  const { id } = await params;

  if (isDemoMode() && id === "demo") {
    return <QuoteDetailContent quote={DEMO_QUOTE} />;
  }

  if (isDemoMode()) {
    notFound();
  }

  const user = await getUserOrNull();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/quotes/${id}`)}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  return <QuoteDetailContent quote={data as QuoteRow} />;
}

function QuoteDetailContent({ quote }: { quote: QuoteRow }) {
  const snapshot = quote.pricing_snapshot as QuotePricingSnapshot | null | undefined;
  const roofTypeValue = quote.roof_type as RoofTypeValue;
  const pitchValue = quote.pitch as PitchValue;

  let detailed: DetailedQuoteBreakdown | null = snapshot?.computed ?? null;
  let profitMargin = quote.margin;
  let gstPercent = quote.gst_percent ?? 10;
  let depositPercent = quote.deposit_percent ?? 0;

  if (!detailed && quote.gst_percent != null) {
    const pricing = parseQuotePricingFieldsFromJson({
      material_cost: quote.material_cost,
      labour_cost: quote.labour_cost,
      margin: quote.margin,
      gst_percent: quote.gst_percent,
      waste_allowance_percent: quote.waste_allowance_percent,
      fixing_allowance_percent: quote.fixing_allowance_percent,
      travel_callout_fee: quote.travel_callout_fee,
      minimum_labour_charge: quote.minimum_labour_charge,
      minimum_quote_value: quote.minimum_quote_value,
      deposit_percent: quote.deposit_percent,
      steep_pitch_surcharge_percent: quote.steep_pitch_surcharge_percent,
      optional_extras: quote.optional_extras,
    });
    detailed = calculateQuotePricing({
      ...pricing,
      roofSizeSqm: quote.roof_size,
      roofType: roofTypeValue,
      pitch: pitchValue,
    });
    profitMargin = pricing.profitMarginPercent;
    gstPercent = pricing.gstPercent;
    depositPercent = pricing.depositPercent;
  }

  const legacyBreakdown = calculatePricing({
    roofSizeSqm: quote.roof_size,
    materialCostPerSqm: quote.material_cost,
    labourCostPerSqm: quote.labour_cost,
    marginPercent: quote.margin,
  });

  const roofTypeLabel = ROOF_TYPES.find((r) => r.value === quote.roof_type)?.label ?? quote.roof_type;
  const pitchLabel = PITCH_OPTIONS.find((p) => p.value === quote.pitch)?.label ?? quote.pitch;
  const displayTotal = detailed?.finalPrice ?? quote.final_price;

  return (
    <div className="flex flex-col gap-6">
      <div className="no-print flex items-center justify-between gap-3">
        <Link
          href="/quotes/new"
          className="text-sm font-semibold text-red-800 underline decoration-yellow-500 decoration-2 underline-offset-2 hover:text-red-950"
        >
          ← New quote
        </Link>
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-red-800 underline decoration-yellow-500 decoration-2 underline-offset-2 hover:text-red-950"
        >
          Saved quotes
        </Link>
      </div>

      <Card id="quote-summary">
        <h1 className="text-2xl font-bold text-red-950">{quote.customer_name}</h1>
        <p className="mt-1 text-sm text-muted">
          {new Date(quote.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
        </p>
        {quote.address ? <p className="mt-3 text-base">{quote.address}</p> : null}
        <dl className="mt-4 grid gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Roof size</dt>
            <dd>{quote.roof_size} m²</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Roof type</dt>
            <dd>{roofTypeLabel}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Pitch</dt>
            <dd>{pitchLabel}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-red-950">Totals</h2>
        {detailed ? (
          <QuoteDetailedBreakdown
            breakdown={detailed}
            profitMarginPercent={profitMargin}
            gstPercent={gstPercent}
            depositPercent={depositPercent}
            pitchIsSteep={quote.pitch === "steep"}
          />
        ) : (
          <QuoteBreakdown breakdown={legacyBreakdown} marginPercent={quote.margin} />
        )}
        <p className="mt-3 text-xs text-muted">Saved total: {displayTotal.toLocaleString(undefined, { style: "currency", currency: "AUD" })}</p>
        <div className="no-print mt-6">
          <DownloadPdfButton
            payload={{
              customerName: quote.customer_name,
              address: quote.address,
              roofSizeSqm: quote.roof_size,
              roofTypeLabel,
              pitchLabel,
              materialPerSqm: quote.material_cost,
              labourPerSqm: quote.labour_cost,
              marginPercent: profitMargin,
              breakdown: detailed ?? legacyBreakdown,
              gstPercent,
              depositRequired: detailed?.depositRequired,
            }}
          />
        </div>
      </Card>
    </div>
  );
}
