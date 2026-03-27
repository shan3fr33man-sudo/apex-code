'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader } from 'lucide-react';
import { PLANS, PlanConfig } from '@/lib/stripe/config';

interface OrgData {
  id: string;
  plan: string;
  plan_status: string;
  tokens_used_this_month: number;
  monthly_token_limit: number;
}

interface PlanFeature {
  name: string;
  included: boolean;
}

const planFeatures: Record<string, PlanFeature[]> = {
  free: [
    { name: '100,000 tokens/month', included: true },
    { name: 'Claude Sonnet access', included: true },
    { name: 'Community support', included: true },
    { name: 'Priority support', included: false },
    { name: 'Custom integrations', included: false },
    { name: 'Team collaboration', included: false },
  ],
  pro: [
    { name: '2,000,000 tokens/month', included: true },
    { name: 'All models access', included: true },
    { name: 'Priority support', included: true },
    { name: 'Custom integrations', included: true },
    { name: 'Team collaboration', included: false },
    { name: 'Advanced analytics', included: true },
  ],
  team: [
    { name: '10,000,000 tokens/month', included: true },
    { name: 'All models access', included: true },
    { name: 'Priority support', included: true },
    { name: 'Custom integrations', included: true },
    { name: 'Team collaboration', included: true },
    { name: 'Advanced analytics', included: true },
  ],
};

export default function BillingPage() {
  const router = useRouter();
  const [org, setOrg] = useState<OrgData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetchOrgData();
  }, []);

  async function fetchOrgData() {
    try {
      const res = await fetch('/api/orgs/current');
      if (!res.ok) {
        console.error('Failed to fetch org data');
        return;
      }
      const data = await res.json();
      setOrg(data);
    } catch (error) {
      console.error('Error fetching org data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckout(priceId: string) {
    if (!org) return;
    setCheckoutLoading(priceId);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          orgId: org.id,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function handlePortal() {
    if (!org) return;
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: org.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No portal URL returned');
      }
    } catch (error) {
      console.error('Portal error:', error);
    } finally {
      setPortalLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-8">
          <h2 className="text-xl font-semibold text-white">Error</h2>
          <p className="text-gray-400 mt-2">Failed to load organization data</p>
        </div>
      </div>
    );
  }

  const currentPlanConfig = PLANS[org.plan] || PLANS.free;
  const usagePercent = Math.round(
    (org.tokens_used_this_month / org.monthly_token_limit) * 100
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Billing Settings</h1>
        <p className="text-gray-400 mt-1">Manage your subscription and billing</p>
      </div>

      {/* Current Plan Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Current Plan</h2>
          <Badge
            className={
              org.plan_status === 'active'
                ? 'bg-green-600'
                : org.plan_status === 'past_due'
                  ? 'bg-red-600'
                  : 'bg-yellow-600'
            }
          >
            {org.plan_status === 'active'
              ? 'Active'
              : org.plan_status === 'past_due'
                ? 'Past Due'
                : org.plan_status.charAt(0).toUpperCase() + org.plan_status.slice(1)}
          </Badge>
        </div>
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">
            {currentPlanConfig.displayName}
          </h3>
          <p className="text-gray-400 mb-4">
            {org.monthly_token_limit.toLocaleString()} tokens per month
          </p>

          {/* Token Usage */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Monthly Token Usage</span>
              <span className="text-sm font-medium text-gray-300">
                {org.tokens_used_this_month.toLocaleString()} /
                {org.monthly_token_limit.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  usagePercent >= 100
                    ? 'bg-red-500'
                    : usagePercent >= 80
                      ? 'bg-yellow-500'
                      : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {usagePercent}% of monthly limit used
            </p>
          </div>
        </div>

        {org.plan !== 'free' && (
          <Button
            onClick={handlePortal}
            disabled={portalLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {portalLoading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Manage Billing Portal'
            )}
          </Button>
        )}
      </div>

      {/* Plan Comparison */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-6">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(PLANS).map(([planKey, plan]) => {
            const isCurrent = org.plan === planKey;
            const features = planFeatures[planKey] || [];
            return (
              <div
                key={planKey}
                className={`rounded-lg border-2 p-6 transition-colors ${
                  isCurrent
                    ? 'border-blue-600 bg-gray-800'
                    : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                }`}
              >
                {/* Plan Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-white">
                      {plan.displayName}
                    </h3>
                    {isCurrent && (
                      <Badge className="bg-blue-600">Current</Badge>
                    )}
                  </div>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-white">
                      ${plan.monthlyPrice / 100}
                    </span>
                    <span className="text-gray-400 ml-2">/month</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {features.map((feature) => (
                    <div key={feature.name} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gray-700 flex-shrink-0" />
                      )}
                      <span
                        className={
                          feature.included
                            ? 'text-gray-300'
                            : 'text-gray-500 line-through'
                        }
                      >
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => handleCheckout(plan.priceId)}
                  disabled={isCurrent || checkoutLoading === plan.priceId}
                  className={
                    isCurrent
                      ? 'w-full bg-gray-700 text-white hover:bg-gray-600'
                      : 'w-full bg-blue-600 hover:bg-blue-700 text-white'
                  }
                >
                  {checkoutLoading === plan.priceId ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : isCurrent ? (
                    'Current Plan'
                  ) : (
                    'Upgrade'
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
        <h2 className="text-xl font-semibold text-white mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-white font-medium mb-2">Can I change plans anytime?</h3>
            <p className="text-gray-400 text-sm">
              Yes, you can upgrade or downgrade your plan at any time. Changes take
              effect immediately.
            </p>
          </div>
          <div>
            <h3 className="text-white font-medium mb-2">Do you offer annual billing discounts?</h3>
            <p className="text-gray-400 text-sm">
              Yes, annual plans come with a 20% discount. Contact our sales team for more
              information.
            </p>
          </div>
          <div>
            <h3 className="text-white font-medium mb-2">
              What happens if I exceed my token limit?
            </h3>
            <p className="text-gray-400 text-sm">
              We'll notify you when you're approaching your limit. You can upgrade at
              any time or purchase additional tokens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}