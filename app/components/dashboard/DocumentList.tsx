'use client';
import React, { memo } from 'react';
import { useDocumentService } from '@/app/hooks/useDocumentService';
import { Skeleton } from '@/components/ui/skeleton';
import { FileTextIcon, ClockIcon, PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Document } from '@/app/types';

// Memoized document item component to prevent unnecessary re-renders
const DocumentItem = memo(({ doc }: { doc: Document }) => (
  <div
    className="group relative rounded-lg border p-4 hover:border-primary/50 transition-colors"
  >
    <div className="flex items-start gap-4">
      <div className="mt-1">
        <FileTextIcon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold group-hover:text-primary transition-colors">
            Document {doc.id}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {doc.content}
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <ClockIcon className="h-3 w-3" aria-hidden="true" />
            <span>Last updated {new Date(doc.updatedAt || doc.createdAt || '').toLocaleString()}</span>
          </div>
        </div>
      </div>
      <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
        <Link href={`/documents/${doc.id}`} aria-label={`View document ${doc.id} details`}>
          <FileTextIcon className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  </div>
));

DocumentItem.displayName = 'DocumentItem';

export default function DocumentList(): React.ReactElement {
  const { useGetDocuments } = useDocumentService();
  const { data: docs, isPending, isError, error } = useGetDocuments();

  if (isPending) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading documents">
        <Skeleton className="h-8 w-1/3" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-6" role="alert" aria-live="assertive">
        <p className="text-red-500">Failed to load documents: {error?.message || 'Unknown error'}</p>
      </div>
    );
  }

  if (!docs?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground">No documents found</p>
            <Button asChild className="mt-4">
              <Link href="/documents/upload">Upload your first document</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Documents</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{docs.length} total</span>
          <Button size="sm" variant="outline" asChild>
            <Link href="/documents/upload" aria-label="Upload new document">
              <PlusIcon className="h-4 w-4 mr-1" />
              Upload
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {docs.map((doc) => (
          <DocumentItem key={doc.id} doc={doc} />
        ))}
      </div>
    </div>
  );
}