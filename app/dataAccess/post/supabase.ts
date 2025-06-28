import type { DataAccessInterface } from '@/app/contracts/DataAccess';
import type { Post } from '@/app/types';
import { createServerSupabaseClient } from '@/app/lib/supabase/server';
import { DataAccessError, NotFoundError } from '@/app/lib/dataAccess';

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 50);
}

// Helper function to calculate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export class SupabasePostDataAccess implements DataAccessInterface<Post> {
  async getById(id: string): Promise<Post> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundError('Post', id);
    }

    // Parse tags if they're stored as JSON string
    const post = data as Post;
    if (typeof post.tags === 'string') {
      try {
        post.tags = JSON.parse(post.tags);
      } catch {
        post.tags = [];
      }
    }

    return post;
  }

  async getBySlug(slug: string): Promise<Post> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      throw new NotFoundError('Post', slug);
    }

    // Parse tags if they're stored as JSON string
    const post = data as Post;
    if (typeof post.tags === 'string') {
      try {
        post.tags = JSON.parse(post.tags);
      } catch {
        post.tags = [];
      }
    }

    return post;
  }

  async getAll(): Promise<Post[]> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      throw new DataAccessError(`Database error: ${error.message}`, 500, error);
    }

    // Parse tags for each post
    return (data || []).map((row: any) => {
      const post = row as Post;
      if (typeof post.tags === 'string') {
        try {
          post.tags = JSON.parse(post.tags);
        } catch {
          post.tags = [];
        }
      }
      return post;
    });
  }

  async getPublished(): Promise<Post[]> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('isPublished', true)
      .order('publishedAt', { ascending: false });

    if (error) {
      throw new DataAccessError(`Database error: ${error.message}`, 500, error);
    }

    // Parse tags for each post
    return (data || []).map((row: any) => {
      const post = row as Post;
      if (typeof post.tags === 'string') {
        try {
          post.tags = JSON.parse(post.tags);
        } catch {
          post.tags = [];
        }
      }
      return post;
    });
  }

  async create(data: Partial<Post>): Promise<Post> {
    const supabase = await createServerSupabaseClient();
    const id = `post_${Date.now()}`;
    const now = new Date().toISOString();
    const tags = Array.isArray(data.tags) ? JSON.stringify(data.tags) : '[]';
    const slug = data.slug || generateSlug(data.title || '');
    const readingTime = data.readingTime || calculateReadingTime(data.content || '');

    const { data: inserted, error } = await supabase
      .from('posts')
      .insert([{
        id,
        slug,
        title: data.title || '',
        content: data.content || '',
        excerpt: data.excerpt || '',
        tags,
        isPremium: Boolean(data.isPremium),
        isPublished: Boolean(data.isPublished),
        publishedAt: data.isPublished ? now : null,
        authorId: data.authorId || null,
        authorName: data.authorName || null,
        featuredImage: data.featuredImage || null,
        readingTime,
        createdAt: now,
        updatedAt: now,
      }])
      .select()
      .single();

    if (error) {
      throw new DataAccessError(`Database error: ${error.message}`, 500, error);
    }

    return {
      ...inserted,
      tags: Array.isArray(data.tags) ? data.tags : [],
      isPremium: Boolean(data.isPremium),
      isPublished: Boolean(data.isPublished),
    } as Post;
  }

  async update(id: string, data: Partial<Post>): Promise<Post> {
    const supabase = await createServerSupabaseClient();
    const now = new Date().toISOString();

    // First check if the post exists
    await this.getById(id);

    const updateData: any = {
      updatedAt: now,
    };

    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) {
      updateData.content = data.content;
      updateData.readingTime = calculateReadingTime(data.content);
    }
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.isPremium !== undefined) updateData.isPremium = Boolean(data.isPremium);
    if (data.isPublished !== undefined) {
      updateData.isPublished = Boolean(data.isPublished);
      if (data.isPublished && !data.publishedAt) {
        updateData.publishedAt = now;
      }
    }
    if (data.publishedAt !== undefined) updateData.publishedAt = data.publishedAt;
    if (data.authorId !== undefined) updateData.authorId = data.authorId;
    if (data.authorName !== undefined) updateData.authorName = data.authorName;
    if (data.featuredImage !== undefined) updateData.featuredImage = data.featuredImage;
    if (Array.isArray(data.tags)) updateData.tags = JSON.stringify(data.tags);

    const { data: updated, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new DataAccessError(`Database error: ${error.message}`, 500, error);
    }

    // Parse tags if they're stored as JSON string
    const post = updated as Post;
    if (typeof post.tags === 'string') {
      try {
        post.tags = JSON.parse(post.tags);
      } catch {
        post.tags = [];
      }
    }

    return post;
  }

  async delete(id: string): Promise<void> {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      throw new DataAccessError(`Database error: ${error.message}`, 500, error);
    }
  }
}

export const postSupabaseDataAccess = new SupabasePostDataAccess(); 