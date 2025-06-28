'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Shield, ArrowRight, Crown, Building2 } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';

export default function PolicyBotPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      const userRole = user.publicMetadata?.role;
      const orgRole = user.organizationMemberships?.[0]?.role;
      const subscriptionTier = user.publicMetadata?.subscriptionTier || 'free';

      // Redirect based on role and subscription
      if (userRole === 'global_admin' || userRole === 'admin') {
        router.push('/global-admin/policy-bot');
      } else if (orgRole === 'org:admin' && subscriptionTier === 'pro_plus') {
        router.push('/org-admin/policy-bot');
      } else {
        // Show upgrade page for users without access
        return;
      }
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const subscriptionTier = user?.publicMetadata?.subscriptionTier || 'free';
  const orgRole = user?.organizationMemberships?.[0]?.role;

  // Show upgrade page for users without access
  if (subscriptionTier !== 'pro_plus' || orgRole !== 'org:admin') {
    return (
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold">Policy Bot</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Generate professional business policies with AI-powered assistance
          </p>
        </div>

        {/* Feature Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Professional Templates</CardTitle>
              <CardDescription>
                Pre-built templates for common business policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• PTO and Leave Policies</li>
                <li>• Equipment Checkout Procedures</li>
                <li>• Onboarding Checklists</li>
                <li>• Remote Work Guidelines</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>AI-Powered Generation</CardTitle>
              <CardDescription>
                Intelligent policy creation with legal language
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Customizable content</li>
                <li>• Legal compliance checks</li>
                <li>• Professional formatting</li>
                <li>• Review and approval workflow</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Organization Management</CardTitle>
              <CardDescription>
                Centralized policy management for your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Team collaboration</li>
                <li>• Version control</li>
                <li>• Access permissions</li>
                <li>• Policy distribution</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Upgrade CTA */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Crown className="h-6 w-6 text-primary" />
              Upgrade to Pro+ to Access Policy Bot
            </CardTitle>
            <CardDescription>
              Policy Bot is available exclusively to Pro+ subscribers and organization administrators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Current Plan</p>
                <p className="text-sm text-muted-foreground">
                  {subscriptionTier === 'free' ? 'Free Tier' : 
                   subscriptionTier === 'pro' ? 'Pro Tier' : 'Pro+ Tier'}
                </p>
              </div>
              <Badge variant={subscriptionTier === 'pro_plus' ? 'default' : 'secondary'}>
                {subscriptionTier === 'free' ? 'Free' : 
                 subscriptionTier === 'pro' ? 'Pro' : 'Pro+'}
              </Badge>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Pro+ Benefits:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Access to Policy Bot assistant</li>
                <li>• Advanced AI assistants (Data Analyst, Workflow Executor)</li>
                <li>• Unlimited document processing</li>
                <li>• Priority support</li>
                <li>• Custom integrations</li>
              </ul>
            </div>

            <div className="flex gap-4 pt-4">
              <Button className="flex-1" onClick={() => router.push('/pricing')}>
                View Pricing
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => router.push('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state while redirecting
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Redirecting to Policy Bot...</p>
        </div>
      </div>
    </div>
  );
} 