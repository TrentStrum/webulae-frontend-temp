import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import { getPostDataAccess } from '@/app/config/backend';
import sanitizeHtml from 'sanitize-html';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Clock, User, Calendar, ArrowLeft } from 'lucide-react';

export default async function BlogPostPage({ params }: { params: { postId: string } }): Promise<React.ReactElement> {
  const post = await getPostDataAccess().getBySlug(params.postId).catch(() => null);
  if (!post) return notFound();
  
  const { sessionClaims } = await auth();
  const tier = (sessionClaims?.publicMetadata as { subscriptionTier?: string })?.subscriptionTier || 'free';
  const hasPaid = Boolean((sessionClaims?.privateMetadata as { isPaid?: boolean })?.isPaid);
  const hasAccess = tier !== 'free' || hasPaid;

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="mb-6">
        <Link href="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>
      </div>

      <article className="space-y-6">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
            {post.isPremium && (
              <Badge variant="default">Premium</Badge>
            )}
          </div>
        </header>

        {/* Featured Image */}
        {post.featuredImage && (
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
        )}

        {/* Content */}
        {post.isPremium && !hasAccess ? (
          <div className="p-8 border rounded-lg bg-muted text-center space-y-4">
            <h2 className="text-2xl font-semibold">Premium Content</h2>
            <p className="text-muted-foreground">
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

        {/* Footer */}
        <footer className="pt-8 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {post.authorName && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>By {post.authorName}</span>
                </div>
              )}
            </div>
            <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back to Blog
            </Link>
          </div>
        </footer>
      </article>
    </main>
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