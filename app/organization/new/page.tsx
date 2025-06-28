'use client';

import React from 'react';
import { CreateOrganizationForm } from '@/app/components/organization/CreateOrganizationForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewOrganizationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Organization</h1>
          <p className="text-muted-foreground">
            Set up a new organization to collaborate with your team
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>
              Fill in the details below to create your new organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateOrganizationForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}