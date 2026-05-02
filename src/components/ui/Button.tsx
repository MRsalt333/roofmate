import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  variant = "primary",
  className = "",
  disabled,
  type = "button",
  ...props
}: Props) {
  const base =
    "inline-flex min-h-12 items-center justify-center rounded-xl px-5 text-base font-semibold transition-[color,background-color,border-color,box-shadow,transform] disabled:opacity-50 touch-manipulation focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  const styles =
    variant === "primary"
      ? "border-2 border-red-800 bg-accent text-white shadow-md shadow-red-900/15 hover:bg-accent-hover hover:border-red-950 active:scale-[0.99]"
      : variant === "secondary"
        ? "border-2 border-red-700 bg-brand-yellow-soft text-red-950 hover:bg-yellow-300 hover:border-red-800"
        : "border-2 border-transparent bg-transparent text-red-800 hover:border-yellow-400 hover:bg-yellow-100 hover:text-red-950";

  return (
    <button type={type} disabled={disabled} className={`${base} ${styles} ${className}`} {...props} />
  );
}
