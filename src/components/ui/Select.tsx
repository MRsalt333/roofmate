import type { SelectHTMLAttributes } from "react";

export type SelectOption = { value: string; label: string };

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: readonly SelectOption[];
};

export function Select({ label, id, options, name, className = "", ...props }: Props) {
  const selectId = id ?? name;
  return (
    <label className="flex flex-col gap-1.5" htmlFor={selectId}>
      <span className="text-sm font-semibold text-red-900">{label}</span>
      <select
        id={selectId}
        name={name}
        className={`min-h-12 w-full rounded-xl border-2 border-red-200 bg-card px-4 text-lg text-foreground outline-none transition-shadow focus:border-red-600 focus:ring-4 focus:ring-ring/90 ${className}`}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
