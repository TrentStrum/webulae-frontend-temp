'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Shield, Crown, ArrowRight, Lock } from 'lucide-react';

export default function PolicyBotCard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-muted rounded w-full"></div>
      </div>
    );
  }

  const userRole = user?.publicMetadata?.role;
  const orgRole = user?.organizationMemberships?.[0]?.role;
  const subscriptionTier = user?.publicMetadata?.subscriptionTier || 'free';

  // Check if user has access to Policy Bot
  const hasAccess = (userRole === 'global_admin' || userRole === 'admin') || 
                   (orgRole === 'org:admin' && subscriptionTier === 'pro_plus');

  const handleClick = () => {
    if (hasAccess) {
      router.push('/policy-bot');
    } else {
      router.push('/pricing');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Policy Bot</h3>
        </div>
        {hasAccess ? (
          <Badge variant="default" className="text-xs">
            <Crown className="h-3 w-3 mr-1" />
            Pro+
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">
            <Lock className="h-3 w-3 mr-1" />
            Upgrade
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {hasAccess 
            ? "Generate professional business policies with AI assistance"
            : "Upgrade to Pro+ to access Policy Bot and generate professional business policies"
          }
        </p>

        {hasAccess && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Available templates: PTO, Equipment, Onboarding</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>AI-powered generation with legal language</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Professional formatting and review workflow</span>
            </div>
          </div>
        )}

        <Button 
          onClick={handleClick}
          className="w-full"
          variant={hasAccess ? "default" : "outline"}
        >
          {hasAccess ? (
            <>
              Access Policy Bot
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          ) : (
            <>
              Upgrade to Pro+
              <Crown className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 