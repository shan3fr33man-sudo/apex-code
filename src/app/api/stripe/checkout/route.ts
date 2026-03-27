import { getStripe, getPlanFromPriceId } from '@/lib/stripe/config';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request
    const body = await req.json();
    const { priceId, orgId } = body;

    if (!priceId || !orgId) {
      return NextResponse.json(
        { error: 'Missing priceId or orgId' },
        { status: 400 }
      );
    }

    // 3. Validate price ID against known plans
    const plan = getPlanFromPriceId(priceId);
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      );
    }

    // 4. Verify user has access to this org
    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('org_id', orgId)
      .single();

    if (!membership || membership.role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized to manage this organization' },
        { status: 403 }
      );
    }

    // 5. Get or create Stripe customer
    const { data: org } = await supabase
      .from('organizations')
      .select('stripe_customer_id')
      .eq('id', orgId)
      .single();

    let customerId = org?.stripe_customer_id;

    if (!customerId) {
      // Create new Stripe customer
      const customer = await getStripe().customers.create({
        email: user.email,
        metadata: {
          org_id: orgId,
          user_id: user.id,
        },
      });
      customerId = customer.id;

      // Save customer ID to org
      await supabase
        .from('organizations')
        .update({ stripe_customer_id: customerId })
        .eq('id', orgId);
    }

    // 6. Create checkout session
    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        org_id: orgId,
        user_id: user.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Checkout failed' },
      { status: 500 }
    );
  }
}
