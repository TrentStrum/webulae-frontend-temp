'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { accessRequestSchema, type AccessRequestSchema } from '@/app/schemas/accessRequestSchema';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  CheckCircle, 
  Clock, 
  Building2, 
  Users, 
  Briefcase,
  Mail,
  User
} from 'lucide-react';

export function AccessRequestForm(): React.ReactElement {
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [serverError, setServerError] = React.useState('');
  
  const form = useForm<AccessRequestSchema>({
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
      form.reset();
    } catch (err: unknown) {
      setServerError((err as Error)?.message ?? 'Failed to submit access request');
    }
  };

  if (isSubmitted) {
    return (
      <Card className="border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-900/30">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl text-green-800 dark:text-green-400">Access Request Submitted!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4 pt-2">
          <p className="text-green-700 dark:text-green-300">
            Thank you for your interest in Webulae. We've received your access request and will review it carefully.
          </p>
          <div className="bg-white/80 dark:bg-gray-900/50 rounded-lg p-4 space-y-2 border border-green-200 dark:border-green-900/30">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-400">
              <Clock className="h-4 w-4" />
              <span className="font-medium">What happens next?</span>
            </div>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1 text-left">
              <li>• We'll review your request within 1-2 business days</li>
              <li>• You'll receive an email with our decision</li>
              <li>• If approved, we'll guide you through the onboarding process</li>
            </ul>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsSubmitted(false)}
            className="mt-4 border-green-200 text-green-700 hover:bg-green-100 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20"
          >
            Submit Another Request
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Request Access to Webulae</h1>
        <p className="text-muted-foreground mt-1">
          Tell us about your organization and how you plan to use Webulae
        </p>
      </div>

      {serverError && (
        <AlertDialog open={!!serverError}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Error</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>{serverError}</AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-medium">
              <User className="h-5 w-5 text-primary" />
              <h2>Personal Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="your.email@company.com" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Company Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-medium">
              <Building2 className="h-5 w-5 text-primary" />
              <h2>Company Information</h2>
            </div>
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., CEO, Operations Manager, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Healthcare, Manufacturing, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="teamSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Size</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value as '1-5' | '6-25' | '26-100' | '100+')} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1-5">1-5 employees</SelectItem>
                      <SelectItem value="6-25">6-25 employees</SelectItem>
                      <SelectItem value="26-100">26-100 employees</SelectItem>
                      <SelectItem value="100+">100+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Use Case */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-medium">
              <Briefcase className="h-5 w-5 text-primary" />
              <h2>How will you use Webulae?</h2>
            </div>
            <FormField
              control={form.control}
              name="useCase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Use Case</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe how you plan to use Webulae. What problems are you trying to solve? What processes would you like to automate?"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expectedStartDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Start Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="additionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Information (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional context, questions, or specific requirements..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Submitting Request...' : 'Submit Access Request'}
          </Button>
        </form>
      </Form>
    </div>
  );
}