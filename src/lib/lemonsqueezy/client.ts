import {
  lemonSqueezySetup,
  createCheckout,
  getSubscription,
  updateSubscription,
  cancelSubscription,
  listProducts,
  listVariants,
  getCustomer,
  type Variant,
  type Subscription,
  type Product,
} from '@lemonsqueezy/lemonsqueezy.js';

// Initialize LemonSqueezy with API key
export function initializeLemonSqueezy() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;

  if (!apiKey) {
    throw new Error('LEMONSQUEEZY_API_KEY is not set');
  }

  lemonSqueezySetup({
    apiKey,
    onError: (error) => {
      console.error('LemonSqueezy API Error:', error);
      throw error;
    },
  });
}

// Re-export types for convenience
export type { Variant, Subscription, Product };

/**
 * Create a checkout session for a product variant
 */
export async function createCheckoutSession({
  variantId,
  customerId,
  userEmail,
  successUrl,
  cancelUrl,
}: {
  variantId: string;
  customerId?: string;
  userEmail?: string;
  successUrl?: string;
  cancelUrl?: string;
}) {
  initializeLemonSqueezy();

  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!storeId) {
    throw new Error('LEMONSQUEEZY_STORE_ID is not set');
  }

  const checkout = await createCheckout(storeId, variantId, {
    checkoutData: {
      email: userEmail,
      custom: customerId ? { user_id: customerId } : undefined,
    },
    checkoutOptions: {
      embed: false,
      media: true,
      logo: true,
    },
    expiresAt: undefined,
    preview: false,
    testMode: process.env.NODE_ENV === 'development',
  });

  return checkout;
}

/**
 * Get subscription details
 */
export async function getSubscriptionDetails(subscriptionId: string) {
  initializeLemonSqueezy();
  return await getSubscription(subscriptionId);
}

/**
 * Update a subscription (change plan, update billing)
 */
export async function updateSubscriptionPlan(
  subscriptionId: string,
  variantId: string
) {
  initializeLemonSqueezy();

  return await updateSubscription(subscriptionId, {
    variantId: parseInt(variantId),
  });
}

/**
 * Cancel a subscription
 */
export async function cancelSubscriptionNow(subscriptionId: string) {
  initializeLemonSqueezy();

  return await cancelSubscription(subscriptionId);
}

/**
 * Get all products from store
 */
export async function getStoreProducts() {
  initializeLemonSqueezy();

  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!storeId) {
    throw new Error('LEMONSQUEEZY_STORE_ID is not set');
  }

  return await listProducts({
    filter: { storeId },
    include: ['variants'],
  });
}

/**
 * Get all variants for a product
 */
export async function getProductVariants(productId: string) {
  initializeLemonSqueezy();

  return await listVariants({
    filter: { productId },
  });
}

/**
 * Get customer details
 */
export async function getCustomerDetails(customerId: string) {
  initializeLemonSqueezy();

  return await getCustomer(customerId);
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

/**
 * Helper to format price from cents to dollars
 */
export function formatPrice(cents: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

/**
 * Helper to get variant by price ID
 */
export async function getVariantByPriceId(priceId: string) {
  initializeLemonSqueezy();

  const variants = await listVariants();
  return variants.data?.find((v) => v.id === priceId);
}
