"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { saveQuoteAction, type SaveQuoteState } from "@/actions/quotes";
import { saveQuickTemplateFromQuoteAction, type TemplateActionState } from "@/actions/templates";
import { calculatePricing } from "@/lib/pricing";
import { applyTemplateToQuoteInputs } from "@/lib/templateApply";
import { DEFAULT_QUOTE_FORM, PITCH_OPTIONS, ROOF_TYPES } from "@/lib/constants";
import type { PitchValue, RoofTypeValue } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { QuoteBreakdown } from "@/components/quotes/QuoteBreakdown";
import { DownloadPdfButton } from "@/components/quotes/DownloadPdfButton";
import type { QuotePdfPayload } from "@/lib/pdf/quotePdf";
import type { QuoteTemplateRow } from "@/types/quoteTemplate";

const initialSaveState: SaveQuoteState = null;
const initialTplState: TemplateActionState = null;

export type NewQuoteFormProps = {
  isDemo: boolean;
  isLoggedIn: boolean;
  templates: QuoteTemplateRow[];
  defaultTemplate: QuoteTemplateRow | null;
};

export function NewQuoteForm({ isDemo, isLoggedIn, templates, defaultTemplate }: NewQuoteFormProps) {
  const [state, formAction, pending] = useActionState(saveQuoteAction, initialSaveState);
  const [tplState, saveTplAction, tplPending] = useActionState(saveQuickTemplateFromQuoteAction, initialTplState);

  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [roofSize, setRoofSize] = useState("120");
  const [roofType, setRoofType] = useState<string>(ROOF_TYPES[0].value);
  const [pitch, setPitch] = useState<string>(PITCH_OPTIONS[0].value);
  const [material, setMaterial] = useState(String(DEFAULT_QUOTE_FORM.materialCostPerSqm));
  const [labour, setLabour] = useState(String(DEFAULT_QUOTE_FORM.labourCostPerSqm));
  const [margin, setMargin] = useState(String(DEFAULT_QUOTE_FORM.marginPercent));
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [guestTplHint, setGuestTplHint] = useState(false);
  const [quickTplName, setQuickTplName] = useState("My pricing");
  const [makeDefaultTpl, setMakeDefaultTpl] = useState(false);

  const appliedDefaultOnce = useRef(false);

  useEffect(() => {
    if (!defaultTemplate || appliedDefaultOnce.current || templates.length === 0) return;
    appliedDefaultOnce.current = true;
    setSelectedTemplateId(defaultTemplate.id);
    const a = applyTemplateToQuoteInputs(defaultTemplate, roofType as RoofTypeValue, pitch as PitchValue);
    setMaterial(String(a.material));
    setLabour(String(a.labour));
    setMargin(String(a.margin));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- apply default once when template list loads
  }, [defaultTemplate?.id, templates.length]);

  useEffect(() => {
    if (!selectedTemplateId) return;
    const t = templates.find((x) => x.id === selectedTemplateId);
    if (!t) return;
    const a = applyTemplateToQuoteInputs(t, roofType as RoofTypeValue, pitch as PitchValue);
    setMaterial(String(a.material));
    setLabour(String(a.labour));
    setMargin(String(a.margin));
  }, [selectedTemplateId, roofType, pitch, templates]);

  const roofSizeNum = Number(roofSize);
  const materialNum = Number(material);
  const labourNum = Number(labour);
  const marginNum = Number(margin);

  const breakdown = useMemo(() => {
    if (
      !Number.isFinite(roofSizeNum) ||
      roofSizeNum <= 0 ||
      !Number.isFinite(materialNum) ||
      !Number.isFinite(labourNum) ||
      !Number.isFinite(marginNum)
    ) {
      return calculatePricing({
        roofSizeSqm: 0,
        materialCostPerSqm: 0,
        labourCostPerSqm: 0,
        marginPercent: 0,
      });
    }
    return calculatePricing({
      roofSizeSqm: roofSizeNum,
      materialCostPerSqm: materialNum,
      labourCostPerSqm: labourNum,
      marginPercent: marginNum,
    });
  }, [roofSizeNum, materialNum, labourNum, marginNum]);

  const roofTypeLabel = ROOF_TYPES.find((r) => r.value === roofType)?.label ?? roofType;
  const pitchLabel = PITCH_OPTIONS.find((p) => p.value === pitch)?.label ?? pitch;

  const pdfPayload: QuotePdfPayload | null =
    customerName.trim().length > 0
      ? {
          customerName: customerName.trim(),
          address: address.trim() || null,
          roofSizeSqm: roofSizeNum,
          roofTypeLabel,
          pitchLabel,
          materialPerSqm: materialNum,
          labourPerSqm: labourNum,
          marginPercent: marginNum,
          breakdown,
        }
      : null;

  function onQuickSaveTemplate() {
    if (!isLoggedIn || isDemo) {
      setGuestTplHint(true);
      return;
    }
    const fd = new FormData();
    fd.set("template_name", quickTplName);
    fd.set("material_cost", material);
    fd.set("labour_cost", labour);
    fd.set("margin", margin);
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

      <form action={formAction} className="flex flex-col gap-6">
        <Card className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-red-950">New quote</h1>
          {isLoggedIn && !isDemo && templates.length > 0 ? (
            <Select
              label="Pricing template (optional)"
              options={[
                { value: "", label: "Manual pricing" },
                ...templates.map((t) => ({ value: t.id, label: t.is_default ? `${t.template_name} (default)` : t.template_name })),
              ]}
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              hint="Prefills material, labour, and margin. You can still edit every field."
            />
          ) : null}

          <Input
            label="Customer name"
            name="customer_name"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <Input label="Address" name="address" value={address} onChange={(e) => setAddress(e.target.value)} />
          <Input
            label="Roof size (m²)"
            name="roof_size"
            inputMode="decimal"
            required
            value={roofSize}
            onChange={(e) => setRoofSize(e.target.value)}
          />
          <Select
            label="Roof type"
            name="roof_type"
            options={ROOF_TYPES}
            value={roofType}
            onChange={(e) => setRoofType(e.target.value)}
          />
          <Select label="Pitch" name="pitch" options={PITCH_OPTIONS} value={pitch} onChange={(e) => setPitch(e.target.value)} />
          <Input
            label="Material cost ($/m²)"
            name="material_cost"
            inputMode="decimal"
            required
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
          />
          <Input
            label="Labour cost ($/m²)"
            name="labour_cost"
            inputMode="decimal"
            required
            value={labour}
            onChange={(e) => setLabour(e.target.value)}
          />
          <Input
            label="Margin (%)"
            name="margin"
            inputMode="decimal"
            required
            value={margin}
            onChange={(e) => setMargin(e.target.value)}
            hint="Applied to subtotal (materials + labour)"
          />
        </Card>

        {state?.message ? <p className="text-sm font-medium text-red-800">{state.message}</p> : null}

        <Card id="quote-preview">
          <h2 className="mb-4 text-lg font-semibold text-red-950">Quote preview</h2>
          <QuoteBreakdown breakdown={breakdown} marginPercent={marginNum} />
          <div className="no-print mt-6 flex flex-col gap-3 sm:flex-row">
            <Button type="submit" disabled={pending} className="flex-1">
              {pending ? "Saving…" : isLoggedIn && !isDemo ? "Save quote" : "Save quote (sign in to keep)"}
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
              <input type="checkbox" checked={makeDefaultTpl} onChange={(e) => setMakeDefaultTpl(e.target.checked)} className="h-4 w-4" />
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
            <Link href="/account" className="text-sm font-semibold text-red-800 underline decoration-yellow-500 decoration-2 underline-offset-2">
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
