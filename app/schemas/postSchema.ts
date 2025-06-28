import { z } from 'zod';

export const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  isPremium: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  publishedAt: z.string().optional(),
  authorId: z.string().optional(),
  authorName: z.string().optional(),
  featuredImage: z.string().optional(),
  readingTime: z.number().optional(),
});

export type PostSchema = z.infer<typeof postSchema>;
