import { jsPDF } from "jspdf";
import type { PricingBreakdown } from "@/lib/pricing";

export type QuotePdfPayload = {
  customerName: string;
  address: string | null;
  roofSizeSqm: number;
  roofTypeLabel: string;
  pitchLabel: string;
  materialPerSqm: number;
  labourPerSqm: number;
  marginPercent: number;
  breakdown: PricingBreakdown;
  /** Optional line shown at bottom (e.g. company name) */
  footerNote?: string;
};

/**
 * Builds a minimal A4 PDF quote clientside (no server render).
 * Suitable for emailing or saving from the job site.
 */
export function downloadQuotePdf(payload: QuotePdfPayload) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  let y = 18;

  doc.setFontSize(18);
  doc.setTextColor(185, 28, 28);
  doc.text("Roofing quote", 14, y);
  y += 10;

  doc.setTextColor(69, 10, 10);
  doc.setFontSize(11);
  doc.text(`Customer: ${payload.customerName}`, 14, y);
  y += 6;
  if (payload.address) {
    doc.text(`Address: ${payload.address}`, 14, y);
    y += 6;
  }
  doc.text(`Roof size: ${payload.roofSizeSqm} m²`, 14, y);
  y += 6;
  doc.text(`Roof type: ${payload.roofTypeLabel}`, 14, y);
  y += 6;
  doc.text(`Pitch: ${payload.pitchLabel}`, 14, y);
  y += 10;

  doc.setFontSize(10);
  const lines: [string, string][] = [
    ["Materials (total)", fmt(payload.breakdown.totalMaterialCost)],
    ["Labour (total)", fmt(payload.breakdown.totalLabourCost)],
    ["Subtotal", fmt(payload.breakdown.subtotal)],
    [`Margin (${payload.marginPercent}%)`, fmt(payload.breakdown.marginAmount)],
    ["Total (incl. margin)", fmt(payload.breakdown.finalPrice)],
  ];
  lines.forEach(([k, v], i) => {
    const isTotal = i === lines.length - 1;
    if (isTotal) {
      doc.setFillColor(254, 243, 199);
      doc.rect(12, y - 4, pageW - 24, 8, "F");
      doc.setTextColor(185, 28, 28);
    } else {
      doc.setTextColor(69, 10, 10);
    }
    doc.text(k, 14, y);
    doc.text(v, pageW - 14, y, { align: "right" });
    y += 6;
  });

  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(146, 64, 14);
  doc.text(
    payload.footerNote ?? "Generated with Roofmate — rates shown are indicative.",
    14,
    y,
    { maxWidth: pageW - 28 }
  );

  const safeName = payload.customerName.replace(/[^\w\-]+/g, "_").slice(0, 40);
  doc.save(`roofmate-quote-${safeName}.pdf`);
}

function fmt(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "AUD" }).format(n);
}
