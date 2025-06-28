'use client';
import React, { memo } from 'react';
import { useDocumentService } from '@/app/hooks/useDocumentService';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Clock, Plus, ExternalLink, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Document } from '@/app/types';
import { ScrollArea } from '@/components/ui/scroll-area';

// Memoized document item component to prevent unnecessary re-renders
const DocumentItem = memo(({ doc }: { doc: Document }) => (
  <div
    className="group relative rounded-lg border border-border/50 p-4 hover:border-primary/50 hover:shadow-sm transition-all"
  >
    <div className="flex items-start gap-4">
      <div className="mt-1 p-2 bg-primary/10 rounded-lg">
        <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium group-hover:text-primary transition-colors">
            Document {doc.id}
          </h3>
          <Badge variant="outline" className="text-xs">
            {doc.type || 'Document'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {doc.content}
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            <span>Last updated {new Date(doc.updatedAt || doc.createdAt || '').toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3">
        <Link href={`/documents/${doc.id}`} aria-label={`View document ${doc.id} details`}>
          <ExternalLink className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  </div>
));

DocumentItem.displayName = 'DocumentItem';

export default function DocumentList(): React.ReactElement {
  const { useGetDocuments } = useDocumentService();
  const { data: docs, isPending, isError, error } = useGetDocuments();
  const [searchTerm, setSearchTerm] = React.useState('');

  // Filter documents based on search term
  const filteredDocs = React.useMemo(() => {
    if (!docs) return [];
    if (!searchTerm) return docs;
    
    return docs.filter(doc => 
      doc.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.id?.toString().includes(searchTerm)
    );
  }, [docs, searchTerm]);

  if (isPending) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading documents">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-6 bg-destructive/10 border border-destructive/20 rounded-lg" role="alert" aria-live="assertive">
        <p className="text-destructive">Failed to load documents: {error?.message || 'Unknown error'}</p>
      </div>
    );
  }

  if (!docs?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No documents found</h3>
            <p className="text-muted-foreground mb-6">
              Upload your first document to get started with AI-powered insights
            </p>
            <Button asChild>
              <Link href="/documents/upload">
                <Plus className="h-4 w-4 mr-2" />
                Upload your first document
              </Link>
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
              <Plus className="h-4 w-4 mr-1" />
              Upload
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-3 pr-4">
          {filteredDocs.map((doc) => (
            <DocumentItem key={doc.id} doc={doc} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}