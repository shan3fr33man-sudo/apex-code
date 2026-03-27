import { getStripe, getPlanFromPriceId } from '@/lib/stripe/config';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // 1. Get raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Missing signature or webhook secret' },
        { status: 400 }
      );
    }

    // 2. Verify webhook signature
    let event;
    try {
      event = getStripe().webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // 3. Check idempotency
    const { data: existingEvent } = await supabaseAdmin
      .from('stripe_events')
      .select('id')
      .eq('stripe_event_id', event.id)
      .single();

    if (existingEvent) {
      // Already processed
      return NextResponse.json({ received: true });
    }

    // 4. Record event for idempotency
    await supabaseAdmin.from('stripe_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
      processed_at: new Date().toISOString(),
    });

    // 5. Handle event
    const { type, data } = event;

    switch (type) {
      case 'checkout.session.completed': {
        const session = data.object as any;
        const orgId = session.metadata?.org_id;
        const userId = session.metadata?.user_id;

        if (orgId) {
          // Get subscription to find price ID
          const subscription = await getStripe().subscriptions.retrieve(
            session.subscription as string
          );

          const priceId = subscription.items.data[0]?.price.id;
          const plan = priceId ? getPlanFromPriceId(priceId) : null;

          if (plan) {
            await supabaseAdmin
              .from('organizations')
              .update({
                plan: plan.name,
                plan_status: 'active',
                stripe_subscription_id: subscription.id,
                monthly_token_limit: plan.limits.monthlyTokens,
                token_reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              })
              .eq('id', orgId);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = data.object as any;
        const orgId = subscription.metadata?.org_id;

        if (orgId && subscription.items.data.length > 0) {
          const priceId = subscription.items.data[0].price.id;
          const plan = getPlanFromPriceId(priceId);

          if (plan) {
            const status = subscription.status === 'active' ? 'active' : 'past_due';
            await supabaseAdmin
              .from('organizations')
              .update({
                plan: plan.name,
                plan_status: status,
                monthly_token_limit: plan.limits.monthlyTokens,
              })
              .eq('id', orgId);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = data.object as any;
        const orgId = subscription.metadata?.org_id;

        if (orgId) {
          // Downgrade to free
          await supabaseAdmin
            .from('organizations')
            .update({
              plan: 'free',
              plan_status: 'active',
              monthly_token_limit: 100_000,
              stripe_subscription_id: null,
            })
            .eq('id', orgId);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = data.object as any;
        const customerId = invoice.customer;

        if (customerId) {
          // Find org by customer ID
          const { data: orgs } = await supabaseAdmin
            .from('organizations')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (orgs) {
            await supabaseAdmin
              .from('organizations')
              .update({ plan_status: 'past_due' })
              .eq('id', orgs.id);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
