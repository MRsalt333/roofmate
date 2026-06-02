"use client";

import { useActionState, useEffect, useMemo, useRef, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { saveQuoteFromJsonAction, type SaveQuoteState } from "@/actions/quotes";
import { saveQuickTemplateFromQuoteAction, type TemplateActionState } from "@/actions/templates";
import { computeBreakdownForForm, defaultQuotePricingFields, pricingFromTemplate } from "@/lib/quoteFormState";
import { materialPerSqmFromTemplate } from "@/lib/templateApply";
import { DEFAULT_QUOTE_FORM, PITCH_OPTIONS, ROOF_TYPES } from "@/lib/constants";
import type { PitchValue, RoofTypeValue } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { QuoteDetailedBreakdown } from "@/components/quotes/QuoteBreakdown";
import { QuoteAdvancedPricing } from "@/components/quotes/QuoteAdvancedPricing";
import { QuoteOptionalExtras } from "@/components/quotes/QuoteOptionalExtras";
import { DownloadPdfButton } from "@/components/quotes/DownloadPdfButton";
import type { QuotePdfPayload } from "@/lib/pdf/quotePdf";
import type { QuoteTemplateRow } from "@/types/quoteTemplate";
import type { QuotePricingFields } from "@/types/quotePricing";

const initialTplState: TemplateActionState = null;

function isNextRedirectError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as { digest: unknown }).digest === "string" &&
    String((err as { digest: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

function strField(n: number): string {
  return Number.isFinite(n) ? String(n) : "";
}

export type NewQuoteFormProps = {
  isDemo: boolean;
  isLoggedIn: boolean;
  templates: QuoteTemplateRow[];
  defaultTemplate: QuoteTemplateRow | null;
};

export function NewQuoteForm({ isDemo, isLoggedIn, templates, defaultTemplate }: NewQuoteFormProps) {
  const [quoteSaveState, setQuoteSaveState] = useState<SaveQuoteState>(null);
  const [quoteSavePending, startQuoteSaveTransition] = useTransition();
  const [tplState, saveTplAction, tplPending] = useActionState(saveQuickTemplateFromQuoteAction, initialTplState);

  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [roofSize, setRoofSize] = useState("120");
  const [roofType, setRoofType] = useState<string>(ROOF_TYPES[0].value);
  const [pitch, setPitch] = useState<string>(PITCH_OPTIONS[0].value);
  const [pricing, setPricing] = useState<QuotePricingFields>(() => defaultQuotePricingFields());
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [guestTplHint, setGuestTplHint] = useState(false);
  const [quickTplName, setQuickTplName] = useState("My pricing");
  const [makeDefaultTpl, setMakeDefaultTpl] = useState(false);

  const appliedDefaultOnce = useRef(false);
  const skipTemplateApply = useRef(false);

  const patchPricing = (patch: Partial<QuotePricingFields>) => {
    setPricing((prev) => ({ ...prev, ...patch }));
  };

  const applyTemplate = (template: QuoteTemplateRow) => {
    const size = Number(roofSize);
    setPricing(
      pricingFromTemplate(template, roofType as RoofTypeValue, Number.isFinite(size) && size > 0 ? size : 0)
    );
  };

  useEffect(() => {
    if (!defaultTemplate || appliedDefaultOnce.current || templates.length === 0) return;
    appliedDefaultOnce.current = true;
    setSelectedTemplateId(defaultTemplate.id);
    applyTemplate(defaultTemplate);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once on load
  }, [defaultTemplate?.id, templates.length]);

  useEffect(() => {
    if (!selectedTemplateId) return;
    const t = templates.find((x) => x.id === selectedTemplateId);
    if (!t) return;
    if (skipTemplateApply.current) {
      skipTemplateApply.current = false;
      return;
    }
    applyTemplate(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- full apply when template id changes
  }, [selectedTemplateId]);

  useEffect(() => {
    if (!selectedTemplateId) return;
    const t = templates.find((x) => x.id === selectedTemplateId);
    if (!t) return;
    setPricing((prev) => ({
      ...prev,
      materialCostPerSqm: materialPerSqmFromTemplate(t, roofType as RoofTypeValue),
    }));
  }, [roofType, selectedTemplateId, templates]);

  const roofSizeNum = Number(roofSize);
  const roofTypeValue = roofType as RoofTypeValue;
  const pitchValue = pitch as PitchValue;

  const breakdown = useMemo(() => {
    if (!Number.isFinite(roofSizeNum) || roofSizeNum <= 0) {
      return computeBreakdownForForm(pricing, 0, roofTypeValue, pitchValue);
    }
    return computeBreakdownForForm(pricing, roofSizeNum, roofTypeValue, pitchValue);
  }, [pricing, roofSizeNum, roofTypeValue, pitchValue]);

  const roofTypeLabel = ROOF_TYPES.find((r) => r.value === roofType)?.label ?? roofType;
  const pitchLabel = PITCH_OPTIONS.find((p) => p.value === pitch)?.label ?? pitch;
  const hasTemplate = Boolean(selectedTemplateId);

  const pdfPayload: QuotePdfPayload | null =
    customerName.trim().length > 0
      ? {
          customerName: customerName.trim(),
          address: address.trim() || null,
          roofSizeSqm: roofSizeNum,
          roofTypeLabel,
          pitchLabel,
          materialPerSqm: pricing.materialCostPerSqm,
          labourPerSqm: pricing.labourCostPerSqm,
          marginPercent: pricing.profitMarginPercent,
          breakdown,
          gstPercent: pricing.gstPercent,
          depositRequired: breakdown.depositRequired,
        }
      : null;

  function buildSaveJson(): string {
    return JSON.stringify({
      customer_name: customerName.trim(),
      address: address.trim(),
      roof_size: roofSize,
      roof_type: roofType,
      pitch,
      template_id: selectedTemplateId || null,
      material_cost: pricing.materialCostPerSqm,
      labour_cost: pricing.labourCostPerSqm,
      margin: pricing.profitMarginPercent,
      profit_margin_percent: pricing.profitMarginPercent,
      gst_percent: pricing.gstPercent,
      waste_allowance_percent: pricing.wasteAllowancePercent,
      fixing_allowance_percent: pricing.fixingAllowancePercent,
      travel_callout_fee: pricing.travelCalloutFee,
      minimum_labour_charge: pricing.minimumLabourCharge,
      minimum_quote_value: pricing.minimumQuoteValue,
      deposit_percent: pricing.depositPercent,
      steep_pitch_surcharge_percent: pricing.steepPitchSurchargePercent,
      optional_extras: pricing.optionalExtras,
    });
  }

  function handleSaveQuoteSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setQuoteSaveState(null);
    startQuoteSaveTransition(() => {
      void (async () => {
        try {
          const next = await saveQuoteFromJsonAction(buildSaveJson());
          if (next?.message) setQuoteSaveState(next);
        } catch (err) {
          if (isNextRedirectError(err)) return;
          setQuoteSaveState({
            message: err instanceof Error ? err.message : "Could not save quote.",
          });
        }
      })();
    });
  }

  function onQuickSaveTemplate() {
    if (!isLoggedIn || isDemo) {
      setGuestTplHint(true);
      return;
    }
    const fd = new FormData();
    fd.set("template_name", quickTplName);
    fd.set("material_cost", String(pricing.materialCostPerSqm));
    fd.set("labour_cost", String(pricing.labourCostPerSqm));
    fd.set("margin", String(pricing.profitMarginPercent));
    fd.set("make_default", makeDefaultTpl ? "true" : "false");
    saveTplAction(fd);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="no-print flex items-center justify-between gap-3">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-red-800 underline decoration-yellow-500 decoration-2 underline-offset-2 hover:text-red-950"
        >
          ← Saved quotes
        </Link>
      </div>

      <form onSubmit={handleSaveQuoteSubmit} className="flex flex-col gap-6">
        <Card className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-red-950">New quote</h1>
          {isLoggedIn && !isDemo && templates.length > 0 ? (
            <Select
              label="Pricing template (optional)"
              options={[
                { value: "", label: "Manual pricing" },
                ...templates.map((t) => ({
                  value: t.id,
                  label: t.is_default ? `${t.template_name} (default)` : t.template_name,
                })),
              ]}
              value={selectedTemplateId}
              onChange={(e) => {
                skipTemplateApply.current = false;
                setSelectedTemplateId(e.target.value);
              }}
              hint="Prefills pricing from your template. Every value stays editable for this quote."
            />
          ) : null}

          <Input
            id="quote_customer_name"
            label="Customer name"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <Input id="quote_address" label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
          <Input
            id="quote_roof_size"
            label="Roof size (m²)"
            inputMode="decimal"
            required
            value={roofSize}
            onChange={(e) => setRoofSize(e.target.value)}
          />
          <Select label="Roof type" options={ROOF_TYPES} value={roofType} onChange={(e) => setRoofType(e.target.value)} />
          <Select label="Pitch" options={PITCH_OPTIONS} value={pitch} onChange={(e) => setPitch(e.target.value)} />

          <div className="border-t border-red-100 pt-4">
            <p className="mb-3 text-sm font-semibold text-red-950">Core pricing</p>
            <div className="flex flex-col gap-3">
              <Input
                id="quote_material_cost"
                label="Material cost ($/m²)"
                inputMode="decimal"
                required
                value={strField(pricing.materialCostPerSqm)}
                onChange={(e) => patchPricing({ materialCostPerSqm: Number(e.target.value) || 0 })}
              />
              <Input
                id="quote_labour_cost"
                label="Labour cost ($/m²)"
                inputMode="decimal"
                required
                value={strField(pricing.labourCostPerSqm)}
                onChange={(e) => patchPricing({ labourCostPerSqm: Number(e.target.value) || 0 })}
              />
              <Input
                id="quote_profit_margin"
                label="Profit margin (%)"
                inputMode="decimal"
                required
                value={strField(pricing.profitMarginPercent)}
                onChange={(e) => patchPricing({ profitMarginPercent: Number(e.target.value) || 0 })}
                hint="Applied to subtotal before GST"
              />
            </div>
          </div>

          <QuoteAdvancedPricing
            fields={pricing}
            onChange={patchPricing}
            showHelper={hasTemplate}
          />

          <QuoteOptionalExtras
            extras={pricing.optionalExtras}
            onChange={(optionalExtras) => patchPricing({ optionalExtras })}
            roofSizeSqm={roofSizeNum}
          />
        </Card>

        {quoteSaveState?.message ? <p className="text-sm font-medium text-red-800">{quoteSaveState.message}</p> : null}

        <Card id="quote-preview">
          <h2 className="mb-4 text-lg font-semibold text-red-950">Quote breakdown</h2>
          <QuoteDetailedBreakdown
            breakdown={breakdown}
            profitMarginPercent={pricing.profitMarginPercent}
            gstPercent={pricing.gstPercent}
            depositPercent={pricing.depositPercent}
            pitchIsSteep={pitch === "steep"}
          />
          <div className="no-print mt-6 flex flex-col gap-3 sm:flex-row">
            <Button type="submit" disabled={quoteSavePending} className="flex-1">
              {quoteSavePending ? "Saving…" : isLoggedIn && !isDemo ? "Save quote" : "Save quote (sign in to keep)"}
            </Button>
            {pdfPayload ? <DownloadPdfButton payload={pdfPayload} /> : null}
          </div>
        </Card>
      </form>

      <Card className="no-print flex flex-col gap-3">
        <h2 className="text-base font-semibold text-red-950">Templates</h2>
        {isLoggedIn && !isDemo ? (
          <>
            <p className="text-sm text-muted">Save these prices as a reusable template for your next job.</p>
            <Input label="Template name" value={quickTplName} onChange={(e) => setQuickTplName(e.target.value)} />
            <label className="flex items-center gap-2 text-sm font-medium text-red-950">
              <input
                type="checkbox"
                checked={makeDefaultTpl}
                onChange={(e) => setMakeDefaultTpl(e.target.checked)}
                className="h-4 w-4"
              />
              Make default template
            </label>
            {tplState?.message ? (
              <p className={`text-sm font-medium ${tplState.ok ? "text-red-900" : "text-red-800"}`}>{tplState.message}</p>
            ) : null}
            <Button type="button" variant="secondary" disabled={tplPending} onClick={onQuickSaveTemplate}>
              {tplPending ? "Saving…" : "Save these prices as template"}
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted">
              Create an account to save this template for next time. You can keep building quotes without signing up.
            </p>
            <Link
              href="/account"
              className="text-sm font-semibold text-red-800 underline decoration-yellow-500 decoration-2 underline-offset-2"
            >
              Open account
            </Link>
          </>
        )}
        {guestTplHint ? (
          <p className="text-sm font-medium text-red-800">Create an account to save this template for next time.</p>
        ) : null}
      </Card>
    </div>
  );
}
