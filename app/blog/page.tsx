'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { usePostService } from '@/app/hooks/usePostService';
import { NewsletterForm } from '@/app/components/newsletter/NewsletterForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Clock, User, Calendar } from 'lucide-react';

export default function BlogPage(): React.ReactElement {
  const { useGetPublishedPosts } = usePostService();
  const { data: posts, isPending, isError, error } = useGetPublishedPosts();
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('');

  // Memoize the unique tags list
  const tags = useMemo(() => {
    if (!posts) return [];
    return Array.from(new Set(posts.flatMap((p) => p.tags)));
  }, [posts]);

  // Memoize the filtered posts list
  const filtered = useMemo(() => {
    if (!posts) return [];
    return posts
      .filter((p) => p.title.toLowerCase().includes(query.toLowerCase()))
      .filter((p) => (tag ? p.tags.includes(tag) : true))
      .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
  }, [posts, query, tag]);

  // Extract featured post
  const featured = useMemo(() => filtered[0], [filtered]);

  // Handle query change with debounce
  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isPending) {
    return (
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="flex gap-2 items-center">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-64 w-full" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-red-50 text-red-800 border-red-200 border rounded-lg p-4">
          <p>Failed to load posts: {error?.message || 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-4 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Blog</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Insights, tutorials, and updates from our team
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Input 
          placeholder="Search posts..." 
          value={query} 
          onChange={handleQueryChange} 
          aria-label="Search posts"
          className="flex-1"
        />
        <select 
          value={tag} 
          onChange={(e) => setTag(e.target.value)} 
          className="border rounded px-3 py-2 bg-background"
          aria-label="Filter by tag"
        >
          <option value="">All Tags</option>
          {tags.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      
      {featured && (
        <Card className="overflow-hidden">
          {featured.featuredImage && (
            <div className="relative h-64 w-full">
              <Image
                src={featured.featuredImage}
                alt={featured.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>
          )}
          <CardHeader>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              {featured.authorName && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{featured.authorName}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(featured.publishedAt || featured.createdAt)}</span>
              </div>
              {featured.readingTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{featured.readingTime} min read</span>
                </div>
              )}
            </div>
            <CardTitle className="text-2xl">
              <Link href={`/blog/${featured.slug}`} className="hover:text-primary transition-colors">
                {featured.title}
              </Link>
            </CardTitle>
            {featured.excerpt && (
              <p className="text-muted-foreground">{featured.excerpt}</p>
            )}
            <div className="flex gap-2">
              {featured.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
              {featured.isPremium && (
                <Badge variant="default">Premium</Badge>
              )}
            </div>
          </CardHeader>
        </Card>
      )}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.slice(1).map((post) => (
          <Card key={post.id} className="h-full flex flex-col">
            {post.featuredImage && (
              <div className="relative h-48 w-full">
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            )}
            <CardHeader className="flex-1">
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                {post.authorName && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{post.authorName}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                </div>
                {post.readingTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{post.readingTime} min</span>
                  </div>
                )}
              </div>
              <CardTitle className="text-lg">
                <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </Link>
              </CardTitle>
              {post.excerpt && (
                <p className="text-muted-foreground text-sm line-clamp-3">{post.excerpt}</p>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex gap-2 flex-wrap">
                {post.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {post.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{post.tags.length - 3} more
                  </Badge>
                )}
                {post.isPremium && (
                  <Badge variant="default" className="text-xs">Premium</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="pt-8 border-t">
        <h2 className="text-xl font-semibold mb-4">Stay Updated</h2>
        <NewsletterForm />
      </div>
    </main>
  );
}