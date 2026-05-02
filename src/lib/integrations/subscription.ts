/**
 * Scaffold: subscription model for contractors
 * --------------------------------------------
 * Future ideas:
 * - Gate premium features (PDF branding, team seats, CRM export) by plan tier
 * - Store `subscription_status` on `profiles` or a dedicated `subscriptions` table
 * - Sync via Stripe Customer Portal + webhooks
 */

export type SubscriptionTier = "free" | "pro" | "business";

export async function getSubscriptionTierForUser(_userId: string): Promise<SubscriptionTier> {
  return "free";
}
