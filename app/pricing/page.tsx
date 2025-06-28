'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SubscriptionTier } from '@/app/types';

export default function PricingPage(): React.ReactElement {
  const [loading, setLoading] = useState<Record<SubscriptionTier, boolean>>({
    free: false,
    pro: false,
    pro_plus: false,
  });

  const handleSubscribe = async (tier: SubscriptionTier): Promise<void> => {
    setLoading(prev => ({ ...prev, [tier]: true }));
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoading(prev => ({ ...prev, [tier]: false }));
      }
    } catch (err) {
      console.error('Checkout error', err);
      setLoading(prev => ({ ...prev, [tier]: false }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-8">
      <h1 className="text-3xl font-bold text-center">Choose your plan</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6 space-y-4 text-center">
          <h2 className="text-xl font-semibold">Pro</h2>
          <p>Access premium content and unlimited documents.</p>
          <Button onClick={() => handleSubscribe('pro')} disabled={loading.pro} className="w-full">
            {loading.pro ? 'Redirecting...' : 'Subscribe'}
          </Button>
        </div>
        <div className="border rounded-lg p-6 space-y-4 text-center">
          <h2 className="text-xl font-semibold">Pro+</h2>
          <p>Unlock all features including Policy Bot.</p>
          <Button onClick={() => handleSubscribe('pro_plus')} disabled={loading.pro_plus} className="w-full">
            {loading.pro_plus ? 'Redirecting...' : 'Subscribe'}
          </Button>
        </div>
      </div>
    </div>
  );
}
