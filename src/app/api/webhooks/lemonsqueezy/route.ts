import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyWebhookSignature } from '@/lib/lemonsqueezy/client';
import type { LemonSqueezyWebhookEvent } from '@/types/lemonsqueezy';

/**
 * LemonSqueezy webhook handler
 * Handles subscription lifecycle events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    // Verify webhook signature
    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('LEMONSQUEEZY_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    const isValid = verifyWebhookSignature(body, signature, webhookSecret);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event: LemonSqueezyWebhookEvent = JSON.parse(body);
    const eventName = event.meta.event_name;
    const subscriptionData = event.data.attributes as unknown as WebhookSubscriptionData;

    console.log('LemonSqueezy webhook event:', eventName);

    const supabase = await createClient();

    // Handle different webhook events
    switch (eventName) {
      case 'subscription_created':
        await handleSubscriptionCreated(supabase, subscriptionData);
        break;

      case 'subscription_updated':
        await handleSubscriptionUpdated(supabase, subscriptionData);
        break;

      case 'subscription_cancelled':
      case 'subscription_expired':
        await handleSubscriptionCancelled(supabase, subscriptionData);
        break;

      case 'subscription_resumed':
        await handleSubscriptionResumed(supabase, subscriptionData);
        break;

      case 'subscription_payment_success':
        await handlePaymentSuccess(supabase, subscriptionData);
        break;

      case 'subscription_payment_failed':
        await handlePaymentFailed(supabase, subscriptionData);
        break;

      default:
        console.log('Unhandled event:', eventName);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

interface WebhookSubscriptionData {
  id: string;
  customer_id: string;
  status: string;
  product_id: string;
  variant_id: string;
  created_at: string;
  renews_at: string;
  cancelled: boolean;
  custom_data?: {
    user_id?: string;
  };
}

async function handleSubscriptionCreated(
  supabase: SupabaseClient,
  data: WebhookSubscriptionData
) {
  const customData = data.custom_data || {};
  const userId = customData.user_id;

  if (!userId) {
    console.error('No user_id in subscription metadata');
    return;
  }

  const { error } = await supabase.from('subscriptions').insert({
    user_id: userId,
    lemonsqueezy_subscription_id: data.id,
    lemonsqueezy_customer_id: data.customer_id,
    status: data.status,
    product_id: data.product_id,
    variant_id: data.variant_id,
    current_period_start: data.created_at,
    current_period_end: data.renews_at,
    cancel_at_period_end: data.cancelled || false,
  });

  if (error) {
    console.error('Error creating subscription:', error);
  }
}

async function handleSubscriptionUpdated(
  supabase: SupabaseClient,
  data: WebhookSubscriptionData
) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: data.status,
      current_period_end: data.renews_at,
      cancel_at_period_end: data.cancelled || false,
      updated_at: new Date().toISOString(),
    })
    .eq('lemonsqueezy_subscription_id', data.id);

  if (error) {
    console.error('Error updating subscription:', error);
  }
}

async function handleSubscriptionCancelled(
  supabase: SupabaseClient,
  data: WebhookSubscriptionData
) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancel_at_period_end: true,
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('lemonsqueezy_subscription_id', data.id);

  if (error) {
    console.error('Error cancelling subscription:', error);
  }
}

async function handleSubscriptionResumed(
  supabase: SupabaseClient,
  data: WebhookSubscriptionData
) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq('lemonsqueezy_subscription_id', data.id);

  if (error) {
    console.error('Error resuming subscription:', error);
  }
}

async function handlePaymentSuccess(
  supabase: SupabaseClient,
  data: WebhookSubscriptionData
) {
  // Update subscription status to active
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('lemonsqueezy_subscription_id', data.id);

  if (error) {
    console.error('Error updating subscription after payment:', error);
  }
}

async function handlePaymentFailed(
  supabase: SupabaseClient,
  data: WebhookSubscriptionData
) {
  // Update subscription status to past_due
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('lemonsqueezy_subscription_id', data.id);

  if (error) {
    console.error('Error updating subscription after failed payment:', error);
  }
}
