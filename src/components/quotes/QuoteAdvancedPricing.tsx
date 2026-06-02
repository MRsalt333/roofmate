"use client";

import { useId, useState } from "react";
import { Input } from "@/components/ui/Input";
import type { QuotePricingFields } from "@/types/quotePricing";

type Props = {
  fields: QuotePricingFields;
  onChange: (patch: Partial<QuotePricingFields>) => void;
  showHelper?: boolean;
};

function str(n: number): string {
  return Number.isFinite(n) ? String(n) : "";
}

export function QuoteAdvancedPricing({ fields, onChange, showHelper = true }: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const setNum = (key: keyof QuotePricingFields, value: string) => {
    const n = value === "" ? 0 : Number(value);
    onChange({ [key]: Number.isFinite(n) ? n : 0 } as Partial<QuotePricingFields>);
  };

  return (
    <div className="rounded-xl border-2 border-red-100 bg-red-50/40">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold text-red-950"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span>Advanced pricing from template</span>
        <span className="text-red-800" aria-hidden>
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? (
        <div id={panelId} className="flex flex-col gap-3 border-t border-red-100 px-4 pb-4 pt-3">
          {showHelper ? (
            <p className="text-xs text-muted">Prefilled from template. You can edit these for this quote only.</p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              id="waste_allowance"
              label="Waste allowance %"
              inputMode="decimal"
              value={str(fields.wasteAllowancePercent)}
              onChange={(e) => setNum("wasteAllowancePercent", e.target.value)}
            />
            <Input
              id="fixing_allowance"
              label="Fixing allowance %"
              inputMode="decimal"
              value={str(fields.fixingAllowancePercent)}
              onChange={(e) => setNum("fixingAllowancePercent", e.target.value)}
            />
            <Input
              id="gst_percent"
              label="GST %"
              inputMode="decimal"
              value={str(fields.gstPercent)}
              onChange={(e) => setNum("gstPercent", e.target.value)}
            />
            <Input
              id="travel_fee"
              label="Travel / call-out fee ($)"
              inputMode="decimal"
              value={str(fields.travelCalloutFee)}
              onChange={(e) => setNum("travelCalloutFee", e.target.value)}
            />
            <Input
              id="min_labour"
              label="Minimum labour charge ($)"
              inputMode="decimal"
              value={str(fields.minimumLabourCharge)}
              onChange={(e) => setNum("minimumLabourCharge", e.target.value)}
            />
            <Input
              id="min_quote"
              label="Minimum quote value ($)"
              inputMode="decimal"
              value={str(fields.minimumQuoteValue)}
              onChange={(e) => setNum("minimumQuoteValue", e.target.value)}
            />
            <Input
              id="deposit_percent"
              label="Deposit %"
              inputMode="decimal"
              value={str(fields.depositPercent)}
              onChange={(e) => setNum("depositPercent", e.target.value)}
            />
            <Input
              id="steep_surcharge"
              label="Steep pitch surcharge %"
              inputMode="decimal"
              value={str(fields.steepPitchSurchargePercent)}
              onChange={(e) => setNum("steepPitchSurchargePercent", e.target.value)}
              hint="Applied when pitch is Steep"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
