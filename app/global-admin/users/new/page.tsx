'use client';

import React from 'react';
import { CreateUserForm } from '@/app/components/admin/CreateUserForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewUserPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/global-admin/users">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Link>
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">Create New User</h1>
          <p className="text-muted-foreground">
            Add a new user to the system. They will receive an email to complete their account setup.
          </p>
        </div>

        <CreateUserForm 
          onSuccess={() => {
            // Redirect to users list after successful creation
            router.push('/global-admin/users');
          }}
        />
      </div>
    </div>
  );
} 