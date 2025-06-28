'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { accessRequestSchema, type AccessRequestSchema } from '@/app/schemas/accessRequestSchema';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/app/components/ui/alert-dialog';
import { CheckCircle, Clock, Building2, Users, Briefcase } from 'lucide-react';

export function AccessRequestForm(): React.ReactElement {
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [serverError, setServerError] = React.useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<AccessRequestSchema>({
    resolver: zodResolver(accessRequestSchema),
    defaultValues: {
      firstName: '',
      lastName: '', 
      email: '',
      companyName: '',
      jobTitle: '',
      useCase: '',
      teamSize: undefined,
      industry: '',
      expectedStartDate: '',
      additionalInfo: '',
    },
  });

  const onSubmit = async (data: AccessRequestSchema): Promise<void> => {
    setServerError('');
    try {
      const response = await fetch('/api/access-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit access request');
      }

      setIsSubmitted(true);
      reset();
    } catch (err: unknown) {
      setServerError((err as Error)?.message ?? 'Failed to submit access request');
    }
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Access Request Submitted!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Thank you for your interest in Webulae. We&apos;ve received your access request and will review it carefully.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <Clock className="h-4 w-4" />
              <span className="font-medium">What happens next?</span>
            </div>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 text-left">
              <li>• We&apos;ll review your request within 1-2 business days</li>
              <li>• You&apos;ll receive an email with our decision</li>
              <li>• If approved, we&apos;ll guide you through the onboarding process</li>
            </ul>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsSubmitted(false)}
            className="mt-4"
          >
            Submit Another Request
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Request Access to Webulae</CardTitle>
        <p className="text-center text-muted-foreground">
          Tell us about your organization and how you plan to use Webulae
        </p>
      </CardHeader>
      <CardContent>
        {serverError && (
          <AlertDialog>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Error</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogDescription>{serverError}</AlertDialogDescription>
            </AlertDialogContent>
          </AlertDialog>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name *</label>
                <Input {...register('firstName')} placeholder="Enter your first name" />
                {errors.firstName && (
                  <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name *</label>
                <Input {...register('lastName')} placeholder="Enter your last name" />
                {errors.lastName && (
                  <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email Address *</label>
              <Input 
                type="email" 
                {...register('email')} 
                placeholder="your.email@company.com" 
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </h3>
            <div>
              <label className="block text-sm font-medium mb-1">Company Name *</label>
              <Input {...register('companyName')} placeholder="Enter your company name" />
              {errors.companyName && (
                <p className="text-sm text-red-500 mt-1">{errors.companyName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Job Title *</label>
              <Input {...register('jobTitle')} placeholder="e.g., CEO, Operations Manager, etc." />
              {errors.jobTitle && (
                <p className="text-sm text-red-500 mt-1">{errors.jobTitle.message}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Industry *</label>
                <Input {...register('industry')} placeholder="e.g., Healthcare, Manufacturing, etc." />
                {errors.industry && (
                  <p className="text-sm text-red-500 mt-1">{errors.industry.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Team Size *</label>
                <Select onValueChange={(value) => setValue('teamSize', value as '1-5' | '6-25' | '26-100' | '100+')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-5">1-5 employees</SelectItem>
                    <SelectItem value="6-25">6-25 employees</SelectItem>
                    <SelectItem value="26-100">26-100 employees</SelectItem>
                    <SelectItem value="100+">100+ employees</SelectItem>
                  </SelectContent>
                </Select>
                {errors.teamSize && (
                  <p className="text-sm text-red-500 mt-1">{errors.teamSize.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Use Case */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              How will you use Webulae?
            </h3>
            <div>
              <label className="block text-sm font-medium mb-1">Use Case *</label>
              <Textarea 
                {...register('useCase')} 
                placeholder="Describe how you plan to use Webulae. What problems are you trying to solve? What processes would you like to automate?"
                rows={4}
              />
              {errors.useCase && (
                <p className="text-sm text-red-500 mt-1">{errors.useCase.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expected Start Date *</label>
              <Input 
                type="date" 
                {...register('expectedStartDate')} 
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.expectedStartDate && (
                <p className="text-sm text-red-500 mt-1">{errors.expectedStartDate.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Additional Information</label>
              <Textarea 
                {...register('additionalInfo')} 
                placeholder="Any additional context, questions, or specific requirements..."
                rows={3}
              />
              {errors.additionalInfo && (
                <p className="text-sm text-red-500 mt-1">{errors.additionalInfo.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting Request...' : 'Submit Access Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 