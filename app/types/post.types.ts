export type Post = {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  tags: string[];
  isPremium: boolean;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  authorId?: string;
  authorName?: string;
  featuredImage?: string;
  readingTime?: number;
};
