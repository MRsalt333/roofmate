import type { PricingBreakdown } from "@/lib/pricing";

function money(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "AUD" }).format(n);
}

type Props = {
  breakdown: PricingBreakdown;
  marginPercent: number;
};

/** Read-only line items for preview and saved-quote views */
export function QuoteBreakdown({ breakdown, marginPercent }: Props) {
  return (
    <dl className="grid gap-3 text-base">
      <div className="flex justify-between gap-4">
        <dt className="text-muted">Materials</dt>
        <dd className="font-medium">{money(breakdown.totalMaterialCost)}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-muted">Labour</dt>
        <dd className="font-medium">{money(breakdown.totalLabourCost)}</dd>
      </div>
      <div className="flex justify-between gap-4 border-t border-border pt-3">
        <dt className="text-muted">Subtotal</dt>
        <dd className="font-medium">{money(breakdown.subtotal)}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-muted">Margin ({marginPercent}%)</dt>
        <dd className="font-medium">{money(breakdown.marginAmount)}</dd>
      </div>
      <div className="flex justify-between gap-4 rounded-xl border border-yellow-200 bg-gradient-to-r from-yellow-100 to-red-50 px-4 py-3">
        <dt className="font-semibold text-red-950">Total</dt>
        <dd className="text-xl font-bold text-accent">{money(breakdown.finalPrice)}</dd>
      </div>
    </dl>
  );
}
