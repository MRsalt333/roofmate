import { Input } from "@/components/ui/Input";
import type { QuoteTemplateRow } from "@/types/quoteTemplate";

type Props = {
  initial: QuoteTemplateRow | null;
};

function dv(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(Number(n))) return "";
  return String(n);
}

export function TemplateEditorFields({ initial }: Props) {
  const id = initial?.id;
  return (
    <div className="flex flex-col gap-6">
      {id ? <input type="hidden" name="id" value={id} /> : null}
      <div className="flex flex-col gap-3">
        <Input label="Template name" name="template_name" required defaultValue={initial?.template_name ?? "Default template"} />
        <label className="flex items-center gap-2 text-sm font-semibold text-red-950">
          <input type="checkbox" name="is_default" defaultChecked={initial?.is_default ?? false} className="h-4 w-4 rounded border-red-300" />
          Set as default template
        </label>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-red-950">Material pricing ($ / m² unless noted)</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Metal roofing / m²" name="metal_roofing_per_sqm" inputMode="decimal" defaultValue={dv(initial?.metal_roofing_per_sqm)} />
          <Input label="Tile roofing / m²" name="tile_roofing_per_sqm" inputMode="decimal" defaultValue={dv(initial?.tile_roofing_per_sqm)} />
          <Input label="Colorbond / m²" name="colorbond_per_sqm" inputMode="decimal" defaultValue={dv(initial?.colorbond_per_sqm)} />
          <Input label="Underlayment / sarking / m²" name="underlayment_per_sqm" inputMode="decimal" defaultValue={dv(initial?.underlayment_per_sqm)} />
          <Input label="Insulation / m²" name="insulation_per_sqm" inputMode="decimal" defaultValue={dv(initial?.insulation_per_sqm)} />
          <Input label="Gutter / linear m" name="gutter_per_lm" inputMode="decimal" defaultValue={dv(initial?.gutter_per_lm)} />
          <Input label="Fascia / linear m" name="fascia_per_lm" inputMode="decimal" defaultValue={dv(initial?.fascia_per_lm)} />
          <Input label="Downpipe / unit" name="downpipe_per_unit" inputMode="decimal" defaultValue={dv(initial?.downpipe_per_unit)} />
          <Input label="Ridge capping / linear m" name="ridge_capping_per_lm" inputMode="decimal" defaultValue={dv(initial?.ridge_capping_per_lm)} />
          <Input label="Flashing / linear m" name="flashing_per_lm" inputMode="decimal" defaultValue={dv(initial?.flashing_per_lm)} />
          <Input label="Fixing / screw allowance (%)" name="fixing_allowance_percent" inputMode="decimal" defaultValue={dv(initial?.fixing_allowance_percent)} />
          <Input label="Waste allowance (%)" name="waste_allowance_percent" inputMode="decimal" defaultValue={dv(initial?.waste_allowance_percent)} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-red-950">Labour & site</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Labour / m²" name="labour_per_sqm" inputMode="decimal" defaultValue={dv(initial?.labour_per_sqm)} />
          <Input label="Labour hourly rate" name="labour_hourly_rate" inputMode="decimal" defaultValue={dv(initial?.labour_hourly_rate)} />
          <Input label="Minimum labour charge" name="minimum_labour_charge" inputMode="decimal" defaultValue={dv(initial?.minimum_labour_charge)} />
          <Input label="Removal / demolition / m²" name="removal_per_sqm" inputMode="decimal" defaultValue={dv(initial?.removal_per_sqm)} />
          <Input label="Installation / m²" name="installation_per_sqm" inputMode="decimal" defaultValue={dv(initial?.installation_per_sqm)} />
          <Input label="Travel / call-out fee" name="travel_fee" inputMode="decimal" defaultValue={dv(initial?.travel_fee)} />
          <Input label="Difficult access surcharge" name="access_surcharge" inputMode="decimal" defaultValue={dv(initial?.access_surcharge)} />
          <Input label="Steep pitch surcharge (%)" name="steep_pitch_surcharge_percent" inputMode="decimal" defaultValue={dv(initial?.steep_pitch_surcharge_percent)} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-red-950">Business</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Markup (%)" name="markup_percent" inputMode="decimal" defaultValue={dv(initial?.markup_percent)} />
          <Input label="Profit margin (% on subtotal)" name="profit_margin_percent" inputMode="decimal" defaultValue={dv(initial?.profit_margin_percent)} />
          <Input label="GST (%)" name="gst_percent" inputMode="decimal" defaultValue={dv(initial?.gst_percent) || "10"} />
          <Input label="Minimum quote value" name="minimum_quote_value" inputMode="decimal" defaultValue={dv(initial?.minimum_quote_value)} />
          <Input label="Deposit (%)" name="deposit_percent" inputMode="decimal" defaultValue={dv(initial?.deposit_percent)} />
        </div>
      </section>
    </div>
  );
}
