'use client';

import { useState } from 'react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, AlertDescription } from '@/components/ui/alert';

const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

export function NewsletterForm(): React.ReactElement {
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema)
  });

  const onSubmit = async (data: NewsletterFormValues) => {
    setError(null);
    try {
      const response = await fetch('/api/newsletter', {
        method: subscribed ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to process subscription');
      }
      
      setSubscribed(!subscribed);
      if (!subscribed) {
        reset();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {subscribed && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <AlertDescription>
            Thank you for subscribing! You&apos;ll receive our updates soon.
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2 items-center">
        <div className="flex-1">
          <Input
            type="email"
            placeholder="Your email"
            aria-label="Email address"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register('email')}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-red-500 mt-1">
              {errors.email.message}
            </p>
          )}
        </div>
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {subscribed ? 'Unsubscribe' : 'Subscribe'}
        </Button>
      </form>
    </div>
  );
}