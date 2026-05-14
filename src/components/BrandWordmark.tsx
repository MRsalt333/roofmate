import type { HTMLAttributes } from "react";
import Image from "next/image";

type Props = HTMLAttributes<HTMLSpanElement> & {
  /** Header bar vs auth hero */
  size?: "header" | "hero";
};

const imgClass = {
  header:
    "h-[72px] w-auto max-w-[min(100%,440px)] sm:h-20 sm:max-w-[520px]",
  hero: "h-56 w-auto max-w-full sm:h-64 md:h-72",
};

/**
 * Official roofmate logo (wordmark + tagline + icon).
 */
export function BrandWordmark({ size = "header", className = "", ...props }: Props) {
  return (
    <span
      className={`inline-flex items-center justify-center ${imgClass[size]} ${className}`}
      {...props}
    >
      <Image
        src="/brand/roofmate-logo.png"
        alt="roofmate — Aussies #1 roofing estimator"
        width={1024}
        height={227}
        className={`h-full w-auto object-contain ${size === "header" ? "object-left" : "object-center"}`}
        priority={size === "hero"}
        sizes={size === "hero" ? "(max-width: 640px) 90vw, 800px" : "520px"}
      />
    </span>
  );
}
