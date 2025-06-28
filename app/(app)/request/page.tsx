'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import { projectRequestSchema, type ProjectRequestSchema } from '@/app/schemas/projectRequestSchema';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { useAuth } from '@clerk/nextjs';

// Temporary schema until the real one is available
const projectRequestSchema = {
  query: { required: 'Query is required' }
};

type ProjectRequestSchema = {
  query: string;
};

export default function ProjectRequestPage(): React.ReactElement {
  const { userId } = useAuth();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProjectRequestSchema>({
    resolver: zodResolver(projectRequestSchema as any),
    defaultValues: { query: '' },
  });

  const onSubmit = async (data: ProjectRequestSchema): Promise<void> => {
    setServerError('');
    try {
      const res = await fetch('/api/project-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to submit request');
      }
      setSuccess(true);
      reset();
    } catch (err) {
      setServerError((err as Error).message);
    }
  };

  return (
    <main className="max-w-md mx-auto py-8 space-y-4">
      <h1 className="text-2xl font-bold">Request a Project</h1>
      {success && <p className="text-green-600">Request submitted!</p>}
      {serverError && <p className="text-red-500">{serverError}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Query</label>
          <Input {...register('query')} />
          {errors.query && (
            <p className="text-sm text-red-500">{errors.query.message}</p>
          )}
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </main>
  );
}
