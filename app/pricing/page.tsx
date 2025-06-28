'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SubscriptionTier } from '@/app/types';
import { CheckCircle, Zap, Shield, MessageSquare, FileText, Loader2 } from 'lucide-react';

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
    <div className="max-w-6xl mx-auto py-24 px-4 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Select the perfect plan for your needs and start experiencing the power of AI-driven workspaces
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Free Tier */}
        <Card className="border-border/50 hover:border-primary/30 transition-all duration-300">
          <CardHeader className="text-center pb-4">
            <div className="mb-1">
              <Badge variant="outline" className="text-sm font-normal">
                Free
              </Badge>
            </div>
            <CardTitle className="text-3xl font-bold">$0</CardTitle>
            <CardDescription>Get started with basic features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Limited document uploads</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Basic chat assistance</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Single organization</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Community support</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => handleSubscribe('free')}
              disabled={loading.free}
            >
              {loading.free ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Get Started'
              )}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Pro Tier */}
        <Card className="border-primary/30 shadow-md relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Badge className="bg-primary text-primary-foreground px-3 py-1">
              Most Popular
            </Badge>
          </div>
          <CardHeader className="text-center pb-4">
            <div className="mb-1">
              <Badge variant="default" className="text-sm font-normal">
                Pro
              </Badge>
            </div>
            <CardTitle className="text-3xl font-bold">$29</CardTitle>
            <CardDescription>per month, billed monthly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Unlimited document uploads</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Advanced chat with context</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Multiple organizations</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Priority support</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Custom workflows</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Advanced analytics</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => handleSubscribe('pro')}
              disabled={loading.pro}
            >
              {loading.pro ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Subscribe to Pro'
              )}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Pro+ Tier */}
        <Card className="border-border/50 hover:border-primary/30 transition-all duration-300">
          <CardHeader className="text-center pb-4">
            <div className="mb-1">
              <Badge variant="secondary" className="text-sm font-normal">
                Pro+
              </Badge>
            </div>
            <CardTitle className="text-3xl font-bold">$49</CardTitle>
            <CardDescription>per month, billed monthly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Everything in Pro</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="font-medium">Policy Bot</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="font-medium">Advanced AI assistants</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="font-medium">Document processing</span>
              </li>
              <li className="flex items-start gap-2">
                <MessageSquare className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="font-medium">Custom integrations</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Dedicated support</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => handleSubscribe('pro_plus')}
              disabled={loading.pro_plus}
            >
              {loading.pro_plus ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Subscribe to Pro+'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="max-w-3xl mx-auto bg-muted/50 rounded-lg p-6 border border-border/50">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Can I upgrade or downgrade my plan?</h3>
            <p className="text-muted-foreground">Yes, you can change your plan at any time. Changes will be reflected in your next billing cycle.</p>
          </div>
          <div>
            <h3 className="font-medium">Is there a free trial?</h3>
            <p className="text-muted-foreground">Yes, all paid plans come with a 14-day free trial. No credit card required to start.</p>
          </div>
          <div>
            <h3 className="font-medium">How secure is my data?</h3>
            <p className="text-muted-foreground">We use enterprise-grade encryption and security practices to ensure your data is always protected.</p>
          </div>
        </div>
      </div>
    </div>
  );
}