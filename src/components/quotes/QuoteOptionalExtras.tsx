"use client";

import { useId, useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import {
  calculateOptionalExtraAmount,
  estimatedPerimeterLm,
  normalizeOptionalExtras,
  OPTIONAL_EXTRA_LENGTH_LABEL,
  OPTIONAL_EXTRA_RATE_LABEL,
  optionalExtraLabel,
} from "@/lib/quotePricing";
import { OPTIONAL_EXTRA_KEYS, type OptionalExtraKey, type OptionalExtrasState } from "@/types/quotePricing";

type Props = {
  extras: OptionalExtrasState;
  onChange: (extras: OptionalExtrasState) => void;
  roofSizeSqm: number;
};

function money(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "AUD" }).format(n);
}

export function QuoteOptionalExtras({ extras, onChange, roofSizeSqm }: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const normalized = useMemo(() => normalizeOptionalExtras(extras), [extras]);
  const suggestedLm = useMemo(() => estimatedPerimeterLm(roofSizeSqm), [roofSizeSqm]);

  const enabledCount = useMemo(
    () => OPTIONAL_EXTRA_KEYS.filter((key) => normalized[key].enabled).length,
    [normalized]
  );

  const update = (key: OptionalExtraKey, patch: Partial<(typeof normalized)[OptionalExtraKey]>) => {
    onChange(
      normalizeOptionalExtras({
        ...normalized,
        [key]: { ...normalized[key], ...patch },
      })
    );
  };

  const toggle = (key: OptionalExtraKey, enabled: boolean) => {
    const current = normalized[key];
    update(key, {
      enabled,
      linearMeters:
        enabled && current.linearMeters <= 0 && suggestedLm > 0 ? suggestedLm : current.linearMeters,
    });
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
        <span>
          Optional extras
          {!open && enabledCount > 0 ? (
            <span className="ml-2 font-normal text-muted">({enabledCount} selected)</span>
          ) : null}
        </span>
        <span className="text-red-800" aria-hidden>
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? (
        <div id={panelId} className="flex flex-col gap-3 border-t border-red-100 px-4 pb-4 pt-3">
          <p className="text-xs text-muted">
            All extras are charged as <strong className="font-semibold text-red-900">linear metres × $/m</strong>{" "}
            (not a flat rate). Enter the length in metres and your price per linear metre.
            {suggestedLm > 0 ? ` Suggested length when enabling: ~${suggestedLm} m.` : null}
          </p>
          <ul className="flex flex-col gap-2">
            {OPTIONAL_EXTRA_KEYS.map((key) => {
              const line = normalized[key];
              const lineTotal = line.enabled ? calculateOptionalExtraAmount(line) : 0;
              return (
                <li
                  key={key}
                  className="flex flex-col gap-2 rounded-lg border border-red-100 bg-white/80 p-3"
                >
                  <label className="flex min-w-0 items-center gap-2 text-sm font-medium text-red-950">
                    <input
                      type="checkbox"
                      checked={line.enabled}
                      onChange={(e) => toggle(key, e.target.checked)}
                      className="h-4 w-4 shrink-0 rounded border-red-300"
                    />
                    <span>{optionalExtraLabel(key)}</span>
                  </label>
                  {line.enabled ? (
                    <>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Input
                          id={`extra_lm_${key}`}
                          label={OPTIONAL_EXTRA_LENGTH_LABEL}
                          inputMode="decimal"
                          value={line.linearMeters > 0 ? String(line.linearMeters) : ""}
                          onChange={(e) => {
                            const linearMeters = e.target.value === "" ? 0 : Number(e.target.value);
                            update(key, { linearMeters: Number.isFinite(linearMeters) ? linearMeters : 0 });
                          }}
                          className="[&_input]:min-h-10 [&_input]:text-base"
                        />
                        <Input
                          id={`extra_rate_per_lm_${key}`}
                          label={OPTIONAL_EXTRA_RATE_LABEL}
                          inputMode="decimal"
                          value={line.ratePerLm > 0 ? String(line.ratePerLm) : ""}
                          onChange={(e) => {
                            const ratePerLm = e.target.value === "" ? 0 : Number(e.target.value);
                            update(key, { ratePerLm: Number.isFinite(ratePerLm) ? ratePerLm : 0 });
                          }}
                          className="[&_input]:min-h-10 [&_input]:text-base"
                        />
                      </div>
                      {line.linearMeters > 0 && line.ratePerLm > 0 ? (
                        <p className="text-xs font-medium text-red-900">
                          {line.linearMeters} m × {money(line.ratePerLm)}/m = {money(lineTotal)}
                        </p>
                      ) : (
                        <p className="text-xs text-muted">Enter linear metres and $/m to include in the quote.</p>
                      )}
                    </>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
