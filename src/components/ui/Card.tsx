import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border-2 border-red-200 bg-card p-5 shadow-md shadow-red-950/10 sm:p-6 ${className}`}
      {...props}
    />
  );
}
