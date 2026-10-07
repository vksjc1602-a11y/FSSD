import React, { useState } from 'react';
import { aegisDb } from '../services/db';

export const PricingPage: React.FC = () => {
  const [subscription, setSubscription] = useState(aegisDb.getSubscription());
  const [billingPeriod, setBillingPeriod] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const handleToggleTier = (tier: 'FREE' | 'PRO') => {
    const updated = aegisDb.setSubscriptionTier(tier);
    setSubscription({ ...updated });
    setNotificationMsg(`Subscription updated to ${tier} tier (Sandbox Mode).`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-sans">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="font-mono text-xs uppercase tracking-widest text-[#D4AF37]">
          SUBSCRIPTION & ENTITLEMENTS
        </span>
        <h1 className="mt-1 font-mono text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Transparent Consumer Protection
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          Individual shopping security with verified server-side entitlement checks. University exhibition sandbox payment simulation active.
        </p>

        {/* Billing toggle */}
        <div className="mt-6 inline-flex items-center rounded-xl border border-white/10 bg-[#090909] p-1 font-mono text-xs">
          <button
            onClick={() => setBillingPeriod('MONTHLY')}
            className={`rounded-lg px-4 py-1.5 transition-colors ${
              billingPeriod === 'MONTHLY' ? 'bg-[#D4AF37] text-black font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('ANNUAL')}
            className={`rounded-lg px-4 py-1.5 transition-colors ${
              billingPeriod === 'ANNUAL' ? 'bg-[#D4AF37] text-black font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Annual (Save 44%)
          </button>
        </div>
      </div>

      {notificationMsg && (
        <div className="mb-8 max-w-md mx-auto rounded-xl border border-[#8FD3FF] bg-[#111111] p-3 text-center font-mono text-xs text-[#8FD3FF]">
          ✓ {notificationMsg}
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* FREE TIER CARD */}
        <div className="rounded-3xl border border-white/10 bg-[#090909] p-8 flex flex-col justify-between font-mono text-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-400 uppercase tracking-wider">AEGIS BASIC</span>
              {subscription.tier === 'FREE' && (
                <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-white font-bold">
                  ACTIVE TIER
                </span>
              )}
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">₹0</span>
              <span className="text-neutral-500">/ forever</span>
            </div>
            <p className="mt-2 text-neutral-400 font-sans text-xs">
              Essential shopping defense for casual online purchasers.
            </p>

            <div className="mt-8 space-y-3 font-mono text-xs text-neutral-300">
              <div className="flex items-center gap-2">
                <span className="text-[#8FD3FF]">✓</span> 15 Listing Scans / Month
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#8FD3FF]">✓</span> Basic Overall Risk Score (0-100)
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#8FD3FF]">✓</span> Standard Seller Rating Audit
              </div>
              <div className="flex items-center gap-2 text-neutral-600">
                <span>✕</span> Advanced Review Repetition AI
              </div>
              <div className="flex items-center gap-2 text-neutral-600">
                <span>✕</span> Multi-Product Comparison Matrix
              </div>
              <div className="flex items-center gap-2 text-neutral-600">
                <span>✕</span> Brand Typosquatting / Authenticity Module
              </div>
            </div>
          </div>

          <button
            onClick={() => handleToggleTier('FREE')}
            disabled={subscription.tier === 'FREE'}
            className={`mt-8 w-full rounded-xl py-3 font-bold uppercase tracking-wider transition-colors ${
              subscription.tier === 'FREE'
                ? 'border border-white/10 bg-white/5 text-neutral-500 cursor-default'
                : 'border border-white/20 bg-[#111111] text-white hover:border-white'
            }`}
          >
            {subscription.tier === 'FREE' ? 'Current Plan' : 'Downgrade to Free'}
          </button>
        </div>

        {/* PRO TIER CARD */}
        <div className="rounded-3xl border border-[#D4AF37] bg-[#090909] p-8 flex flex-col justify-between font-mono text-xs shadow-2xl relative">
          <div className="absolute -top-3 right-8 rounded-full border border-[#D4AF37] bg-[#D4AF37] px-3 py-0.5 text-[10px] font-extrabold text-black uppercase">
            RECOMMENDED FOR DEMO
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-[#D4AF37] uppercase tracking-wider font-bold">AEGIS PRO</span>
              {subscription.tier === 'PRO' && (
                <span className="rounded bg-[#D4AF37]/20 border border-[#D4AF37] px-2 py-0.5 text-[10px] text-[#FFE680] font-bold">
                  ACTIVE TIER
                </span>
              )}
            </div>

            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">
                {billingPeriod === 'MONTHLY' ? '₹149' : '₹999'}
              </span>
              <span className="text-neutral-500">
                {billingPeriod === 'MONTHLY' ? '/ month' : '/ year'}
              </span>
            </div>
            <p className="mt-2 text-neutral-400 font-sans text-xs">
              Complete automated defense shield with unthrottled AI pipelines.
            </p>

            <div className="mt-8 space-y-3 font-mono text-xs text-neutral-200">
              <div className="flex items-center gap-2">
                <span className="text-[#D4AF37]">✓</span> Unlimited Scanning (500/month fair use)
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#D4AF37]">✓</span> Advanced Tri-gram Review Ring Intelligence
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#D4AF37]">✓</span> Statistical Price Anomaly Engine
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#D4AF37]">✓</span> Brand Typosquatting & Authenticity Auditor
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#D4AF37]">✓</span> Multi-Product Side-by-Side Comparison
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#D4AF37]">✓</span> Priority Cloud Inference Execution
              </div>
            </div>
          </div>

          <button
            onClick={() => handleToggleTier('PRO')}
            className={`mt-8 w-full rounded-xl py-3 font-bold uppercase tracking-wider transition-colors ${
              subscription.tier === 'PRO'
                ? 'border border-[#D4AF37] bg-[#D4AF37] text-black cursor-default'
                : 'border border-[#D4AF37] bg-[#D4AF37] text-black hover:bg-[#FFE680]'
            }`}
          >
            {subscription.tier === 'PRO' ? 'PRO Entitlement Active' : 'Upgrade to Pro (Sandbox Test)'}
          </button>
        </div>
      </div>
    </div>
  );
};
