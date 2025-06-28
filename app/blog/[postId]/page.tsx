'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePostService } from '@/app/hooks/usePostService';
import { useUser } from '@clerk/nextjs';
import sanitizeHtml from 'sanitize-html';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Clock, User, Calendar, ArrowLeft, Share2, Bookmark, MessageSquare, ThumbsUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { RevealOnScroll } from '@/components/ui/reveal-on-scroll';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function BlogPostPage({ params }: { params: { postId: string } }): React.ReactElement {
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { userId, user } = useUser();
  const router = useRouter();
  const { getPostBySlug } = usePostService().useGetPostBySlug;

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const postData = await getPostBySlug(params.postId);
        setPost(postData);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [params.postId, getPostBySlug]);

  // Check if user has access to premium content
  const checkAccess = () => {
    if (!post?.isPremium) return true;
    
    const tier = user?.publicMetadata?.subscriptionTier as string || 'free';
    const isPaid = Boolean(user?.privateMetadata?.isPaid);
    
    return tier !== 'free' || isPaid;
  };

  const hasAccess = checkAccess();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/3" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-4/5" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Card className="p-6 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900/30">
          <CardContent className="text-center">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-400 mb-2">Post Not Found</h2>
            <p className="text-red-600 dark:text-red-300 mb-4">{error || 'The requested post could not be found.'}</p>
            <Button asChild>
              <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sanitize HTML to prevent XSS attacks
  const sanitizedContent = sanitizeHtml(post.content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      'img': ['src', 'alt', 'width', 'height', 'loading'],
      'span': ['style'],
      'p': ['style'],
      'h1': ['style'],
      'h2': ['style'],
      'h3': ['style'],
      'h4': ['style'],
      'h5': ['style'],
      'h6': ['style'],
    },
    // Prevent JavaScript URLs in attributes
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    // Allow some CSS for styling
    allowedStyles: {
      '*': {
        'color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
        'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
        'font-size': [/^\d+(?:px|em|rem|%)$/],
        'background-color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
      },
    },
    // Prevent iframes and other potentially dangerous elements
    disallowedTagsMode: 'discard'
  });

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-6">
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link href="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>
      </motion.div>

      <article className="space-y-6">
        {/* Header */}
        <RevealOnScroll>
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {post.authorName && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{post.authorName}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.publishedAt || post.createdAt)}</span>
              </div>
              {post.readingTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{post.readingTime} min read</span>
                </div>
              )}
            </div>

            <h1 className="text-4xl font-bold leading-tight">{post.title}</h1>
            
            {post.excerpt && (
              <p className="text-xl text-muted-foreground leading-relaxed">{post.excerpt}</p>
            )}

            <div className="flex gap-2 flex-wrap">
              {post.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
              {post.isPremium && (
                <Badge variant="default" className="bg-gradient-to-r from-amber-500 to-orange-500">Premium</Badge>
              )}
            </div>
          </header>
        </RevealOnScroll>

        {/* Featured Image */}
        {post.featuredImage && (
          <RevealOnScroll delay={0.2}>
            <div className="relative h-96 w-full rounded-lg overflow-hidden">
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
                priority
              />
            </div>
          </RevealOnScroll>
        )}

        {/* Content */}
        <RevealOnScroll delay={0.3}>
          {post.isPremium && !hasAccess ? (
            <div className="p-8 border rounded-lg bg-muted/50 text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Premium Content</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                This article is available exclusively to premium members.
              </p>
              <Button asChild>
                <Link href="/pricing">Upgrade to Premium</Link>
              </Button>
            </div>
          ) : (
            <div 
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
            />
          )}
        </RevealOnScroll>

        {/* Social Sharing and Actions */}
        <RevealOnScroll delay={0.4} direction="up">
          <div className="flex flex-wrap justify-between items-center pt-6 border-t">
            <div className="flex items-center gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-full">
                      <ThumbsUp className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Like this article</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-full">
                      <Bookmark className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save for later</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-full">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share this article</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-full">
                      <MessageSquare className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Comment</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to Blog
            </Link>
          </div>
        </RevealOnScroll>
      </article>

      {/* Related Posts */}
      <RevealOnScroll delay={0.5} direction="up">
        <div className="pt-8 border-t">
          <h2 className="text-2xl font-bold mb-4">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="hover:shadow-md transition-all duration-300 border-border/50 hover:border-primary/30 overflow-hidden group">
                <div className="relative h-40 w-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 group-hover:opacity-0 transition-opacity duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 to-secondary-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2 group-hover:text-primary transition-colors">Related Article {i}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    This is a placeholder for a related article that shares similar tags or topics.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </RevealOnScroll>
    </main>
  );
}

// Add a Lock icon component since it's used in the premium content section
function Lock(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

// Generate static params for common posts
export async function generateStaticParams() {
  try {
    const posts = await getPostDataAccess().getPublished();
    return posts.slice(0, 10).map(post => ({
      postId: post.slug
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}