import type { DetailedQuoteBreakdown } from "@/types/quotePricing";
import type { PricingBreakdown } from "@/lib/pricing";

function money(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "AUD" }).format(n);
}

function Line({ label, amount, muted }: { label: string; amount: number; muted?: boolean }) {
  if (amount <= 0 && muted) return null;
  return (
    <div className="flex justify-between gap-4">
      <dt className={muted ? "text-muted" : "text-red-900"}>{label}</dt>
      <dd className="font-medium">{money(amount)}</dd>
    </div>
  );
}

type DetailedProps = {
  breakdown: DetailedQuoteBreakdown;
  profitMarginPercent: number;
  gstPercent: number;
  depositPercent: number;
  pitchIsSteep?: boolean;
};

/** Full quote breakdown with allowances, extras, GST, and deposit. */
export function QuoteDetailedBreakdown({
  breakdown,
  profitMarginPercent,
  gstPercent,
  depositPercent,
  pitchIsSteep,
}: DetailedProps) {
  return (
    <dl className="grid gap-2.5 text-base">
      <Line label="Materials (base)" amount={breakdown.baseMaterialCost} muted />
      {breakdown.wasteAllowanceAmount > 0 ? (
        <Line label="Waste allowance" amount={breakdown.wasteAllowanceAmount} muted />
      ) : null}
      {breakdown.fixingAllowanceAmount > 0 ? (
        <Line label="Fixing allowance" amount={breakdown.fixingAllowanceAmount} muted />
      ) : null}
      <Line label="Materials (total)" amount={breakdown.totalMaterialCost} />
      <Line label="Labour" amount={breakdown.labourAfterMinimum} />
      {breakdown.baseLabourCost < breakdown.labourAfterMinimum ? (
        <p className="text-xs text-muted">Minimum labour charge applied</p>
      ) : null}
      {breakdown.optionalExtraLines.map((line) => (
        <Line key={line.key} label={line.label} amount={line.amount} muted />
      ))}
      {breakdown.travelFee > 0 ? <Line label="Travel / call-out" amount={breakdown.travelFee} muted /> : null}
      {breakdown.steepPitchSurchargeAmount > 0 ? (
        <Line
          label={pitchIsSteep ? "Steep pitch surcharge" : "Surcharge"}
          amount={breakdown.steepPitchSurchargeAmount}
          muted
        />
      ) : null}
      <div className="flex justify-between gap-4 border-t border-red-100 pt-2">
        <dt className="text-muted">Subtotal (before profit)</dt>
        <dd className="font-medium">{money(breakdown.subtotalBeforeProfit)}</dd>
      </div>
      <Line label={`Profit margin (${profitMarginPercent}%)`} amount={breakdown.profitMarginAmount} muted />
      <Line label={`GST (${gstPercent}%)`} amount={breakdown.gstAmount} muted />
      {breakdown.minimumQuoteAdjustment > 0 ? (
        <Line label="Minimum quote adjustment" amount={breakdown.minimumQuoteAdjustment} muted />
      ) : null}
      <div className="flex justify-between gap-4 rounded-xl border border-yellow-200 bg-gradient-to-r from-yellow-100 to-red-50 px-4 py-3">
        <dt className="font-semibold text-red-950">Final total</dt>
        <dd className="text-xl font-bold text-accent">{money(breakdown.finalPrice)}</dd>
      </div>
      {depositPercent > 0 && breakdown.depositRequired > 0 ? (
        <div className="flex justify-between gap-4 text-sm">
          <dt className="font-medium text-red-900">Deposit required ({depositPercent}%)</dt>
          <dd className="font-semibold">{money(breakdown.depositRequired)}</dd>
        </div>
      ) : null}
    </dl>
  );
}

type LegacyProps = {
  breakdown: PricingBreakdown;
  marginPercent: number;
};

/** Simple breakdown for legacy quotes without pricing snapshot. */
export function QuoteBreakdown({ breakdown, marginPercent }: LegacyProps) {
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
