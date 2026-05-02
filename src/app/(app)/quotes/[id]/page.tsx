import Link from "next/link";
import { notFound } from "next/navigation";
import { isDemoMode } from "@/lib/demo";
import { createClient } from "@/lib/supabase/server";
import { calculatePricing } from "@/lib/pricing";
import { PITCH_OPTIONS, ROOF_TYPES } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import { QuoteBreakdown } from "@/components/quotes/QuoteBreakdown";
import { DownloadPdfButton } from "@/components/quotes/DownloadPdfButton";
import type { QuoteRow } from "@/types/database";

type Props = { params: Promise<{ id: string }> };

/** Static sample used for `/quotes/demo` in preview mode */
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  return <QuoteDetailContent quote={data as QuoteRow} />;
}

function QuoteDetailContent({ quote }: { quote: QuoteRow }) {
  const breakdown = calculatePricing({
    roofSizeSqm: quote.roof_size,
    materialCostPerSqm: quote.material_cost,
    labourCostPerSqm: quote.labour_cost,
    marginPercent: quote.margin,
  });

  const roofTypeLabel = ROOF_TYPES.find((r) => r.value === quote.roof_type)?.label ?? quote.roof_type;
  const pitchLabel = PITCH_OPTIONS.find((p) => p.value === quote.pitch)?.label ?? quote.pitch;

  return (
    <div className="flex flex-col gap-6">
      <div className="no-print flex items-center justify-between gap-3">
        <Link href="/dashboard" className="text-sm font-semibold text-red-800 underline decoration-yellow-500 decoration-2 underline-offset-2 hover:text-red-950">
          ← Dashboard
        </Link>
        <Link href="/quotes/new" className="text-sm font-semibold text-red-800 underline decoration-yellow-500 decoration-2 underline-offset-2 hover:text-red-950">
          New quote
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
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Material rate</dt>
            <dd>${quote.material_cost}/m²</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Labour rate</dt>
            <dd>${quote.labour_cost}/m²</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-red-950">Totals</h2>
        <QuoteBreakdown breakdown={breakdown} marginPercent={quote.margin} />
        <p className="mt-3 text-xs text-muted">Stored total: matches line items within rounding.</p>
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
              marginPercent: quote.margin,
              breakdown,
            }}
          />
        </div>
      </Card>
    </div>
  );
}
