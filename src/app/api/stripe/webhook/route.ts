import { NextResponse } from "next/server";

/**
 * Stripe webhook receiver (scaffold).
 * When live: verify signature with STRIPE_WEBHOOK_SECRET, handle invoice/payment events.
 */
export async function POST() {
  return NextResponse.json(
    { ok: false, message: "Stripe webhook handler not implemented. Configure STRIPE_WEBHOOK_SECRET first." },
    { status: 501 }
  );
}
