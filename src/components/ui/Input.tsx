import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function Input({ label, hint, id, className = "", ...props }: Props) {
  const inputId = id ?? props.name;
  return (
    <label className="flex flex-col gap-1.5" htmlFor={inputId}>
      <span className="text-sm font-semibold text-red-900">{label}</span>
      <input
        id={inputId}
        className={`min-h-12 w-full rounded-xl border-2 border-red-200 bg-card px-4 text-lg text-foreground outline-none transition-shadow placeholder:text-red-900/40 focus:border-red-600 focus:ring-4 focus:ring-ring/90 ${className}`}
        {...props}
      />
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
}
