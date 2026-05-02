/**
 * Scaffold: Stripe payments per quote
 * ------------------------------------
 * Future flow (typical):
 * 1. Create a Stripe Customer (or reuse) linked to `auth.users.id`
 * 2. Create Checkout Session or PaymentIntent with metadata.quote_id
 * 3. Webhook `checkout.session.completed` / `payment_intent.succeeded` updates quote payment state
 *
 * Env vars (add when implementing):
 * - STRIPE_SECRET_KEY
 * - STRIPE_WEBHOOK_SECRET
 * - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
 */

export type CreateQuoteCheckoutParams = {
  quoteId: string;
  amountCents: number;
  successUrl: string;
  cancelUrl: string;
};

/** Placeholder — wire Stripe SDK here */
export async function createQuoteCheckoutSession(_params: CreateQuoteCheckoutParams): Promise<{ url: string }> {
  throw new Error("Stripe checkout is not implemented yet. See src/lib/integrations/stripe.ts");
}
