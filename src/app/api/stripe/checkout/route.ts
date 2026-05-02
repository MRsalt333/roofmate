import { NextResponse } from "next/server";

/**
 * Example API route for starting Checkout (scaffold).
 * Prefer server actions calling `createQuoteCheckoutSession` once Stripe is wired.
 */
export async function POST() {
  return NextResponse.json(
    { ok: false, message: "Stripe checkout API not implemented. See src/lib/integrations/stripe.ts" },
    { status: 501 }
  );
}
