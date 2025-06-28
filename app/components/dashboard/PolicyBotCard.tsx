'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Crown, ArrowRight, Lock, CheckCircle } from 'lucide-react';

export default function PolicyBotCard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-5 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-10 bg-muted rounded w-full mt-4"></div>
          </div>
        </CardContent>
      </Card>
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
    <Card className={cn(
      "border-border/50 overflow-hidden transition-all duration-300",
      hasAccess ? "hover:border-primary/50 hover:shadow-md" : "hover:border-secondary/50 hover:shadow-md"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Policy Bot
          </CardTitle>
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
      </CardHeader>

      <CardContent className="pt-2 space-y-4">
        <p className="text-sm text-muted-foreground">
          {hasAccess 
            ? "Generate professional business policies with AI assistance"
            : "Upgrade to Pro+ to access Policy Bot and generate professional business policies"
          }
        </p>

        {hasAccess && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Available templates: PTO, Equipment, Onboarding</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>AI-powered generation with legal language</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Professional formatting and review workflow</span>
            </div>
          </div>
        )}

        <Button 
          onClick={handleClick}
          className="w-full gap-2"
          variant={hasAccess ? "default" : "outline"}
        >
          {hasAccess ? (
            <>
              Access Policy Bot
              <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            <>
              Upgrade to Pro+
              <Crown className="h-4 w-4" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// Helper function for conditional class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}