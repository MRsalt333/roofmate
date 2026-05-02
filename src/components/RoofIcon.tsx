import type { SVGAttributes } from "react";

type Props = SVGAttributes<SVGSVGElement> & {
  size?: "md" | "lg";
};

const box = { md: "h-8 w-8 sm:h-9 sm:w-9", lg: "h-10 w-10 sm:h-12 sm:w-12" };

/** Simple roof + wall mark; yellow fill matches `--banner-yellow` */
export function RoofIcon({ size = "md", className = "", ...props }: Props) {
  return (
    <svg
      viewBox="0 0 32 26"
      className={`shrink-0 ${box[size]} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <path
        d="M2 16 L16 3 L30 16 Z"
        fill="var(--banner-yellow, #fde047)"
        stroke="#991b1b"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M9 16 v9.5 h14 V16"
        stroke="#991b1b"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
