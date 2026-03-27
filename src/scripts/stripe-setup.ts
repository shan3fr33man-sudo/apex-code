/**
 * stripe-setup.ts — Create Stripe products and prices for APEX-CODE live mode
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_live_... npx tsx src/scripts/stripe-setup.ts
 *
 * This script is idempotent: it checks for existing products before creating.
 */

import Stripe from 'stripe';

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error('ERROR: Set STRIPE_SECRET_KEY environment variable');
    process.exit(1);
  }

  const isLive = key.startsWith('sk_live_');
  console.log(`\n🔑 Running in ${isLive ? 'LIVE' : 'TEST'} mode\n`);

  const stripe = new Stripe(key, { apiVersion: '2026-03-25.dahlia' });

  // Search for existing products
  const existingProducts = await stripe.products.list({ limit: 100 });
  const findProduct = (name: string) =>
    existingProducts.data.find(
      (p) => p.name === name && p.active
    );

  // === PRO PLAN ===
  let proProduct = findProduct('APEX-CODE Pro');
  if (!proProduct) {
    proProduct = await stripe.products.create({
      name: 'APEX-CODE Pro',
      description: 'Pro plan — 2M tokens/month, all models, priority support',
      metadata: { plan: 'pro', tokens: '2000000' },
    });
    console.log('✅ Created product: APEX-CODE Pro', proProduct.id);
  } else {
    console.log('⏭️  Product exists: APEX-CODE Pro', proProduct.id);
  }

  // Check for existing price
  const proPrices = await stripe.prices.list({
    product: proProduct.id,
    active: true,
    type: 'recurring',
  });

  let proPrice = proPrices.data.find(
    (p) => p.unit_amount === 2000 && p.recurring?.interval === 'month'
  );

  if (!proPrice) {
    proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 2000, // $20.00
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { plan: 'pro' },
    });
    console.log('✅ Created price: $20/month', proPrice.id);
  } else {
    console.log('⏭️  Price exists: $20/month', proPrice.id);
  }

  // === TEAM PLAN ===
  let teamProduct = findProduct('APEX-CODE Team');
  if (!teamProduct) {
    teamProduct = await stripe.products.create({
      name: 'APEX-CODE Team',
      description: 'Team plan — 10M tokens/month, collaboration, per-seat pricing',
      metadata: { plan: 'team', tokens: '10000000' },
    });
    console.log('✅ Created product: APEX-CODE Team', teamProduct.id);
  } else {
    console.log('⏭️  Product exists: APEX-CODE Team', teamProduct.id);
  }

  const teamPrices = await stripe.prices.list({
    product: teamProduct.id,
    active: true,
    type: 'recurring',
  });

  let teamPrice = teamPrices.data.find(
    (p) => p.unit_amount === 5000 && p.recurring?.interval === 'month'
  );

  if (!teamPrice) {
    teamPrice = await stripe.prices.create({
      product: teamProduct.id,
      unit_amount: 5000, // $50.00 per seat
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { plan: 'team' },
    });
    console.log('✅ Created price: $50/seat/month', teamPrice.id);
  } else {
    console.log('⏭️  Price exists: $50/seat/month', teamPrice.id);
  }

  // === OUTPUT ===
  console.log('\n' + '='.repeat(60));
  console.log('Copy these to your .env.local and Vercel env vars:');
  console.log('='.repeat(60));
  console.log(`STRIPE_PRICE_PRO_MONTHLY=${proPrice.id}`);
  console.log(`STRIPE_PRICE_TEAM_MONTHLY=${teamPrice.id}`);
  console.log('='.repeat(60));
  console.log('\nProducts and prices are ready. Update your environment variables.');
  console.log(`Mode: ${isLive ? '🔴 LIVE' : '🟡 TEST'}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
