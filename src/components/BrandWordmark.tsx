import type { HTMLAttributes } from "react";
import { RoofIcon } from "@/components/RoofIcon";

type Props = HTMLAttributes<HTMLSpanElement> & {
  /** Header bar vs auth hero */
  size?: "header" | "hero";
};

const sizeClass = {
  header: "text-3xl leading-none tracking-tight sm:text-4xl",
  hero: "text-5xl leading-none tracking-tight sm:text-6xl",
};

/**
 * Small roof icon + “Roof” (exact banner yellow) + “mate” (red).
 */
export function BrandWordmark({ size = "header", className = "", ...props }: Props) {
  const iconSize = size === "hero" ? "lg" : "md";

  return (
    <span
      className={`inline-flex items-center gap-1.5 sm:gap-2 ${sizeClass[size]} ${className}`}
      {...props}
    >
      <RoofIcon size={iconSize} className="translate-y-0.5" />
      <span className="inline-block font-extrabold leading-none">
        <span className="brand-roof-text">Roof</span>
        <span className="text-[#dc2626]">mate</span>
      </span>
    </span>
  );
}
