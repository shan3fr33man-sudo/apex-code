/**
 * stripe-setup.ts — Create Stripe products and prices for APEX-CODE live mode
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_live_... npx tsx src/scripts/stripe-setup.ts
 *
 * This script is idempotent: it checks for existing products before creating.
 */

import Stripe from 'stripe';

{{Ft rest of file truncated}