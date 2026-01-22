/**
 * LemonSqueezy types for subscription management
 * Replaces Stripe-specific types
 */

export interface LemonSqueezySubscription {
  id: string;
  status: 'active' | 'cancelled' | 'expired' | 'past_due' | 'unpaid' | 'on_trial';
  customer_id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_name: string;
  user_name: string;
  user_email: string;
  status_formatted: string;
  card_brand: string | null;
  card_last_four: string | null;
  pause: null | {
    mode: string;
    resumes_at: string;
  };
  cancelled: boolean;
  trial_ends_at: string | null;
  billing_anchor: number;
  renews_at: string;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
  test_mode: boolean;
}

export interface LemonSqueezyCheckout {
  id: string;
  url: string;
  store_id: string;
  variant_id: string;
  custom_price: number | null;
  product_options: {
    name: string;
    description: string;
    media: string[];
    redirect_url: string;
    receipt_button_text: string;
    receipt_link_url: string;
    receipt_thank_you_note: string;
    enabled_variants: string[];
  };
  checkout_options: {
    embed: boolean;
    media: boolean;
    logo: boolean;
    desc: boolean;
    discount: boolean;
    dark: boolean;
    subscription_preview: boolean;
    button_color: string;
  };
  checkout_data: {
    email: string;
    name: string;
    billing_address: Record<string, unknown>;
    tax_number: string;
    discount_code: string;
    custom: Record<string, unknown>;
  };
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  test_mode: boolean;
}

export interface LemonSqueezyWebhookEvent {
  meta: {
    event_name: string;
    custom_data: Record<string, unknown>;
    webhook_id: string;
    test_mode: boolean;
  };
  data: {
    type: string;
    id: string;
    attributes: Record<string, unknown>;
    relationships: Record<string, unknown>;
  };
}

/**
 * Supabase subscription record with LemonSqueezy data
 */
export interface SubscriptionWithProduct {
  id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  lemonsqueezy_subscription_id: string;
  lemonsqueezy_customer_id: string;
  product: {
    id: string;
    name: string;
    description: string;
    features: Array<{
      feature_key: string;
      feature_value: unknown;
    }>;
    prices: Array<{
      amount: number;
      currency: string;
      interval_type: string;
    }>;
  };
}

/**
 * Helper function to get subscription period start
 */
export function getSubscriptionPeriodStart(subscription: LemonSqueezySubscription): number | null {
  return subscription.created_at ? new Date(subscription.created_at).getTime() / 1000 : null;
}

/**
 * Helper function to get subscription period end
 */
export function getSubscriptionPeriodEnd(subscription: LemonSqueezySubscription): number | null {
  return subscription.renews_at ? new Date(subscription.renews_at).getTime() / 1000 : null;
}

/**
 * Map LemonSqueezy subscription status to internal status
 */
export function mapSubscriptionStatus(
  status: LemonSqueezySubscription['status']
): 'active' | 'canceled' | 'past_due' | 'trialing' | 'expired' {
  const statusMap: Record<string, 'active' | 'canceled' | 'past_due' | 'trialing' | 'expired'> = {
    active: 'active',
    cancelled: 'canceled',
    expired: 'expired',
    past_due: 'past_due',
    unpaid: 'past_due',
    on_trial: 'trialing',
  };

  return statusMap[status] || 'expired';
}
