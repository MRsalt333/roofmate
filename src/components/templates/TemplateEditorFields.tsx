"use client";

import type { MutableRefObject } from "react";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import type { QuoteTemplateRow } from "@/types/quoteTemplate";

type Props = {
  initial: QuoteTemplateRow | null;
  /** Keeps the latest editor JSON in sync every render so the parent can merge it into FormData on submit. */
  fieldsSnapshotRef?: MutableRefObject<string>;
};

type FieldState = {
  template_name: string;
  is_default: boolean;
  metal_roofing_per_sqm: string;
  tile_roofing_per_sqm: string;
  colorbond_per_sqm: string;
  underlayment_per_sqm: string;
  insulation_per_sqm: string;
  gutter_per_lm: string;
  fascia_per_lm: string;
  downpipe_per_unit: string;
  ridge_capping_per_lm: string;
  flashing_per_lm: string;
  fixing_allowance_percent: string;
  waste_allowance_percent: string;
  labour_per_sqm: string;
  labour_hourly_rate: string;
  minimum_labour_charge: string;
  removal_per_sqm: string;
  installation_per_sqm: string;
  travel_fee: string;
  access_surcharge: string;
  steep_pitch_surcharge_percent: string;
  markup_percent: string;
  profit_margin_percent: string;
  gst_percent: string;
  minimum_quote_value: string;
  deposit_percent: string;
};

function dv(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(Number(n))) return "";
  return String(n);
}

function emptyFields(): FieldState {
  return {
    template_name: "Default template",
    is_default: false,
    metal_roofing_per_sqm: "",
    tile_roofing_per_sqm: "",
    colorbond_per_sqm: "",
    underlayment_per_sqm: "",
    insulation_per_sqm: "",
    gutter_per_lm: "",
    fascia_per_lm: "",
    downpipe_per_unit: "",
    ridge_capping_per_lm: "",
    flashing_per_lm: "",
    fixing_allowance_percent: "",
    waste_allowance_percent: "",
    labour_per_sqm: "",
    labour_hourly_rate: "",
    minimum_labour_charge: "",
    removal_per_sqm: "",
    installation_per_sqm: "",
    travel_fee: "",
    access_surcharge: "",
    steep_pitch_surcharge_percent: "",
    markup_percent: "",
    profit_margin_percent: "",
    gst_percent: "10",
    minimum_quote_value: "",
    deposit_percent: "",
  };
}

function rowToFields(row: QuoteTemplateRow): FieldState {
  return {
    template_name: row.template_name || "Default template",
    is_default: row.is_default,
    metal_roofing_per_sqm: dv(row.metal_roofing_per_sqm),
    tile_roofing_per_sqm: dv(row.tile_roofing_per_sqm),
    colorbond_per_sqm: dv(row.colorbond_per_sqm),
    underlayment_per_sqm: dv(row.underlayment_per_sqm),
    insulation_per_sqm: dv(row.insulation_per_sqm),
    gutter_per_lm: dv(row.gutter_per_lm),
    fascia_per_lm: dv(row.fascia_per_lm),
    downpipe_per_unit: dv(row.downpipe_per_unit),
    ridge_capping_per_lm: dv(row.ridge_capping_per_lm),
    flashing_per_lm: dv(row.flashing_per_lm),
    fixing_allowance_percent: dv(row.fixing_allowance_percent),
    waste_allowance_percent: dv(row.waste_allowance_percent),
    labour_per_sqm: dv(row.labour_per_sqm),
    labour_hourly_rate: dv(row.labour_hourly_rate),
    minimum_labour_charge: dv(row.minimum_labour_charge),
    removal_per_sqm: dv(row.removal_per_sqm),
    installation_per_sqm: dv(row.installation_per_sqm),
    travel_fee: dv(row.travel_fee),
    access_surcharge: dv(row.access_surcharge),
    steep_pitch_surcharge_percent: dv(row.steep_pitch_surcharge_percent),
    markup_percent: dv(row.markup_percent),
    profit_margin_percent: dv(row.profit_margin_percent),
    gst_percent: dv(row.gst_percent) || "10",
    minimum_quote_value: dv(row.minimum_quote_value),
    deposit_percent: dv(row.deposit_percent),
  };
}

export function TemplateEditorFields({ initial, fieldsSnapshotRef }: Props) {
  const [f, setF] = useState<FieldState>(() => (initial ? rowToFields(initial) : emptyFields()));

  const syncKey = useMemo(
    () => (initial ? `${initial.id}:${initial.updated_at}` : "new"),
    [initial?.id, initial?.updated_at]
  );

  useEffect(() => {
    setF(initial ? rowToFields(initial) : emptyFields());
  }, [syncKey]);

  const templateFieldsJson = useMemo(() => JSON.stringify(f), [f]);
  if (fieldsSnapshotRef) {
    fieldsSnapshotRef.current = templateFieldsJson;
  }

  return (
    <div className="flex flex-col gap-6">
      <input type="hidden" name="template_fields_json" value={templateFieldsJson} />
      <div className="flex flex-col gap-3">
        <Input
          id="tpl_name"
          label="Template name"
          required
          value={f.template_name}
          onChange={(e) => setF((s) => ({ ...s, template_name: e.target.value }))}
        />
        <label className="flex items-center gap-2 text-sm font-semibold text-red-950">
          <input
            type="checkbox"
            checked={f.is_default}
            onChange={(e) => setF((s) => ({ ...s, is_default: e.target.checked }))}
            className="h-4 w-4 rounded border-red-300"
          />
          Set as default template
        </label>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-red-950">Material pricing ($ / m² unless noted)</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            id="metal_roofing_per_sqm"
            label="Metal roofing / m²"
            inputMode="decimal"
            value={f.metal_roofing_per_sqm}
            onChange={(e) => setF((s) => ({ ...s, metal_roofing_per_sqm: e.target.value }))}
          />
          <Input
            id="tile_roofing_per_sqm"
            label="Tile roofing / m²"
            inputMode="decimal"
            value={f.tile_roofing_per_sqm}
            onChange={(e) => setF((s) => ({ ...s, tile_roofing_per_sqm: e.target.value }))}
          />
          <Input
            id="colorbond_per_sqm"
            label="Colorbond / m²"
            inputMode="decimal"
            value={f.colorbond_per_sqm}
            onChange={(e) => setF((s) => ({ ...s, colorbond_per_sqm: e.target.value }))}
          />
          <Input
            id="underlayment_per_sqm"
            label="Underlayment / sarking / m²"
            inputMode="decimal"
            value={f.underlayment_per_sqm}
            onChange={(e) => setF((s) => ({ ...s, underlayment_per_sqm: e.target.value }))}
          />
          <Input
            id="insulation_per_sqm"
            label="Insulation / m²"
            inputMode="decimal"
            value={f.insulation_per_sqm}
            onChange={(e) => setF((s) => ({ ...s, insulation_per_sqm: e.target.value }))}
          />
          <Input
            id="gutter_per_lm"
            label="Gutter / linear m"
            inputMode="decimal"
            value={f.gutter_per_lm}
            onChange={(e) => setF((s) => ({ ...s, gutter_per_lm: e.target.value }))}
          />
          <Input
            id="fascia_per_lm"
            label="Fascia / linear m"
            inputMode="decimal"
            value={f.fascia_per_lm}
            onChange={(e) => setF((s) => ({ ...s, fascia_per_lm: e.target.value }))}
          />
          <Input
            id="downpipe_per_unit"
            label="Downpipe / unit"
            inputMode="decimal"
            value={f.downpipe_per_unit}
            onChange={(e) => setF((s) => ({ ...s, downpipe_per_unit: e.target.value }))}
          />
          <Input
            id="ridge_capping_per_lm"
            label="Ridge capping / linear m"
            inputMode="decimal"
            value={f.ridge_capping_per_lm}
            onChange={(e) => setF((s) => ({ ...s, ridge_capping_per_lm: e.target.value }))}
          />
          <Input
            id="flashing_per_lm"
            label="Flashing / linear m"
            inputMode="decimal"
            value={f.flashing_per_lm}
            onChange={(e) => setF((s) => ({ ...s, flashing_per_lm: e.target.value }))}
          />
          <Input
            id="fixing_allowance_percent"
            label="Fixing / screw allowance (%)"
            inputMode="decimal"
            value={f.fixing_allowance_percent}
            onChange={(e) => setF((s) => ({ ...s, fixing_allowance_percent: e.target.value }))}
          />
          <Input
            id="waste_allowance_percent"
            label="Waste allowance (%)"
            inputMode="decimal"
            value={f.waste_allowance_percent}
            onChange={(e) => setF((s) => ({ ...s, waste_allowance_percent: e.target.value }))}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-red-950">Labour & site</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            id="labour_per_sqm"
            label="Labour / m²"
            inputMode="decimal"
            value={f.labour_per_sqm}
            onChange={(e) => setF((s) => ({ ...s, labour_per_sqm: e.target.value }))}
          />
          <Input
            id="labour_hourly_rate"
            label="Labour hourly rate"
            inputMode="decimal"
            value={f.labour_hourly_rate}
            onChange={(e) => setF((s) => ({ ...s, labour_hourly_rate: e.target.value }))}
          />
          <Input
            id="minimum_labour_charge"
            label="Minimum labour charge"
            inputMode="decimal"
            value={f.minimum_labour_charge}
            onChange={(e) => setF((s) => ({ ...s, minimum_labour_charge: e.target.value }))}
          />
          <Input
            id="removal_per_sqm"
            label="Removal / demolition / m²"
            inputMode="decimal"
            value={f.removal_per_sqm}
            onChange={(e) => setF((s) => ({ ...s, removal_per_sqm: e.target.value }))}
          />
          <Input
            id="installation_per_sqm"
            label="Installation / m²"
            inputMode="decimal"
            value={f.installation_per_sqm}
            onChange={(e) => setF((s) => ({ ...s, installation_per_sqm: e.target.value }))}
          />
          <Input
            id="travel_fee"
            label="Travel / call-out fee"
            inputMode="decimal"
            value={f.travel_fee}
            onChange={(e) => setF((s) => ({ ...s, travel_fee: e.target.value }))}
          />
          <Input
            id="access_surcharge"
            label="Difficult access surcharge"
            inputMode="decimal"
            value={f.access_surcharge}
            onChange={(e) => setF((s) => ({ ...s, access_surcharge: e.target.value }))}
          />
          <Input
            id="steep_pitch_surcharge_percent"
            label="Steep pitch surcharge (%)"
            inputMode="decimal"
            value={f.steep_pitch_surcharge_percent}
            onChange={(e) => setF((s) => ({ ...s, steep_pitch_surcharge_percent: e.target.value }))}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-red-950">Business</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            id="markup_percent"
            label="Markup (%)"
            inputMode="decimal"
            value={f.markup_percent}
            onChange={(e) => setF((s) => ({ ...s, markup_percent: e.target.value }))}
          />
          <Input
            id="profit_margin_percent"
            label="Profit margin (% on subtotal)"
            inputMode="decimal"
            value={f.profit_margin_percent}
            onChange={(e) => setF((s) => ({ ...s, profit_margin_percent: e.target.value }))}
          />
          <Input
            id="gst_percent"
            label="GST (%)"
            inputMode="decimal"
            value={f.gst_percent}
            onChange={(e) => setF((s) => ({ ...s, gst_percent: e.target.value }))}
          />
          <Input
            id="minimum_quote_value"
            label="Minimum quote value"
            inputMode="decimal"
            value={f.minimum_quote_value}
            onChange={(e) => setF((s) => ({ ...s, minimum_quote_value: e.target.value }))}
          />
          <Input
            id="deposit_percent"
            label="Deposit (%)"
            inputMode="decimal"
            value={f.deposit_percent}
            onChange={(e) => setF((s) => ({ ...s, deposit_percent: e.target.value }))}
          />
        </div>
      </section>
    </div>
  );
}
