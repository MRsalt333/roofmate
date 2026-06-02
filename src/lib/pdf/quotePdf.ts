import { jsPDF } from "jspdf";
import type { DetailedQuoteBreakdown } from "@/types/quotePricing";
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
  breakdown: DetailedQuoteBreakdown | PricingBreakdown;
  gstPercent?: number;
  depositRequired?: number;
  footerNote?: string;
};

function isDetailed(b: DetailedQuoteBreakdown | PricingBreakdown): b is DetailedQuoteBreakdown {
  return "profitMarginAmount" in b;
}

/**
 * Builds a minimal A4 PDF quote clientside (no server render).
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
  const lines: [string, string][] = isDetailed(payload.breakdown)
    ? buildDetailedLines(payload)
    : buildLegacyLines(payload);

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

function buildDetailedLines(payload: QuotePdfPayload): [string, string][] {
  const b = payload.breakdown as DetailedQuoteBreakdown;
  const lines: [string, string][] = [
    ["Materials (base)", fmt(b.baseMaterialCost)],
  ];
  if (b.wasteAllowanceAmount > 0) lines.push(["Waste allowance", fmt(b.wasteAllowanceAmount)]);
  if (b.fixingAllowanceAmount > 0) lines.push(["Fixing allowance", fmt(b.fixingAllowanceAmount)]);
  lines.push(["Materials (total)", fmt(b.totalMaterialCost)]);
  lines.push(["Labour", fmt(b.labourAfterMinimum)]);
  for (const extra of b.optionalExtraLines) {
    lines.push([extra.label, fmt(extra.amount)]);
  }
  if (b.travelFee > 0) lines.push(["Travel / call-out", fmt(b.travelFee)]);
  if (b.steepPitchSurchargeAmount > 0) lines.push(["Steep pitch surcharge", fmt(b.steepPitchSurchargeAmount)]);
  lines.push([`Profit margin (${payload.marginPercent}%)`, fmt(b.profitMarginAmount)]);
  if (payload.gstPercent != null) {
    lines.push([`GST (${payload.gstPercent}%)`, fmt(b.gstAmount)]);
  }
  lines.push(["Final total", fmt(b.finalPrice)]);
  if (payload.depositRequired != null && payload.depositRequired > 0) {
    lines.push(["Deposit required", fmt(payload.depositRequired)]);
  }
  return lines;
}

function buildLegacyLines(payload: QuotePdfPayload): [string, string][] {
  const b = payload.breakdown as PricingBreakdown;
  return [
    ["Materials (total)", fmt(b.totalMaterialCost)],
    ["Labour (total)", fmt(b.totalLabourCost)],
    ["Subtotal", fmt(b.subtotal)],
    [`Margin (${payload.marginPercent}%)`, fmt(b.marginAmount)],
    ["Total", fmt(b.finalPrice)],
  ];
}

function fmt(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "AUD" }).format(n);
}
