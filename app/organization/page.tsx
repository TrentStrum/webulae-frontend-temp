'use client';

import React from 'react';
import Link from 'next/link';
import { useOrganizationService } from '@/app/hooks/useOrganizationService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Building2, Globe, Users, Calendar } from 'lucide-react';
import { Organization } from '@/app/types/organization.types';

export default function OrganizationPage() {
  const { useGetOrganizations } = useOrganizationService();
  const { data: organizations, isPending, isError, error } = useGetOrganizations();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6">Organization Management</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600">
              Failed to load organizations: {error?.message || 'Unknown error'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Organization Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your organizations and team collaborations
          </p>
        </div>
        <Button asChild>
          <Link href="/organization/new">
            <Building2 className="w-4 h-4 mr-2" />
            Create Organization
          </Link>
        </Button>
      </div>

      {isPending ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {organizations && organizations.length === 0 ? (
            <Card className="text-center py-12">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Building2 className="w-8 h-8 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl">No Organizations Yet</CardTitle>
                <CardDescription>
                  Create your first organization to start managing your team, projects, and settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/organization/new">
                    <Building2 className="w-4 h-4 mr-2" />
                    Create Organization
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizations?.map((org: Organization) => (
                <Card key={org.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={org.imageUrl} />
                        <AvatarFallback>
                          {getInitials(org.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{org.name}</CardTitle>
                        <CardDescription className="truncate">
                          {org.slug}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {org.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {org.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {org.industry && (
                        <Badge variant="secondary" className="text-xs">
                          <Building2 className="w-3 h-3 mr-1" />
                          {org.industry}
                        </Badge>
                      )}
                      
                      {org.website && (
                        <Badge variant="outline" className="text-xs">
                          <Globe className="w-3 h-3 mr-1" />
                          Website
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>Members</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(org.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button asChild variant="outline" className="flex-1">
                        <Link href={`/organization/${org.id}`}>
                          View Details
                        </Link>
                      </Button>
                      <Button asChild className="flex-1">
                        <Link href={`/org-admin`}>
                          Manage
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}