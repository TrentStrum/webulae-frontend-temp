'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { usePostService } from '@/app/hooks/usePostService';
import { NewsletterForm } from '@/app/components/newsletter/NewsletterForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Clock, User, Calendar, Search, Filter, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StaggeredList } from '@/components/ui/staggered-list';
import { RevealOnScroll } from '@/components/ui/reveal-on-scroll';

export default function BlogPage(): React.ReactElement {
  const { useGetPublishedPosts } = usePostService();
  const { data: posts, isPending, isError, error } = useGetPublishedPosts();
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  // Item animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  if (isPending) {
    return (
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="flex gap-2 items-center">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
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
      <RevealOnScroll>
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400">Blog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Insights, tutorials, and updates from our team
          </p>
        </div>
      </RevealOnScroll>

      <motion.div 
        className="flex flex-col sm:flex-row gap-4 items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search posts..." 
            value={query} 
            onChange={handleQueryChange} 
            aria-label="Search posts"
            className={`pl-9 transition-all duration-300 ${isSearchFocused ? 'border-primary ring-2 ring-primary/20' : ''}`}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </div>
        <Select value={tag} onValueChange={setTag}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Tags</SelectItem>
            {tags.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>
      
      {featured && (
        <RevealOnScroll delay={0.4}>
          <Card className="overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
            <div className="relative">
              {featured.featuredImage && (
                <div className="relative h-64 w-full">
                  <Image
                    src={featured.featuredImage}
                    alt={featured.title}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 800px"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center gap-4 text-sm mb-2">
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
                <h2 className="text-2xl font-bold mb-2 line-clamp-2">{featured.title}</h2>
                <div className="flex gap-2 mb-4">
                  {featured.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                      {tag}
                    </Badge>
                  ))}
                  {featured.isPremium && (
                    <Badge variant="default" className="bg-primary/80">Premium</Badge>
                  )}
                </div>
                <Button 
                  asChild 
                  variant="default" 
                  className="gap-2"
                >
                  <Link href={`/blog/${featured.slug}`}>
                    Read Article
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </RevealOnScroll>
      )}
      
      <div className="space-y-6">
        <RevealOnScroll delay={0.5}>
          <h2 className="text-2xl font-bold">Latest Articles</h2>
        </RevealOnScroll>
        
        <ScrollArea className="h-full max-h-[800px] pr-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <StaggeredList>
              {filtered.slice(1).map((post) => (
                <Card 
                  key={post.id} 
                  className="h-full flex flex-col hover:shadow-md transition-all duration-300 border-border/50 hover:border-primary/30 overflow-hidden group"
                >
                  {post.featuredImage && (
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-3">
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
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      <Link href={`/blog/${post.slug}`} className="line-clamp-2">
                        {post.title}
                      </Link>
                    </CardTitle>
                    {post.excerpt && (
                      <CardDescription className="text-sm line-clamp-3">{post.excerpt}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0 mt-auto">
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
            </StaggeredList>
          </div>
        </ScrollArea>
      </div>
      
      <RevealOnScroll direction="up">
        <div className="pt-8 border-t">
          <h2 className="text-xl font-semibold mb-4">Stay Updated</h2>
          <NewsletterForm />
        </div>
      </RevealOnScroll>
    </main>
  );
}