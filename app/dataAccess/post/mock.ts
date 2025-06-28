import type { DataAccessInterface } from '@/app/contracts/DataAccess';
import type { Post } from '@/app/types';
import { DataAccessError, NotFoundError } from '@/app/lib/dataAccess';

// In-memory cache for posts to reduce redundant operations
const postCache = new Map<string, Post>();

const mockPosts: Post[] = [
  {
    id: 'post_1',
    slug: 'welcome-to-the-blog',
    title: 'Welcome to the Blog',
    content: 'This is the first post.',
    tags: ['intro'],
    isPremium: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Initialize cache with mock data
mockPosts.forEach(post => postCache.set(post.id, post));

export const postMockDataAccess: DataAccessInterface<Post> = {
  async getById(id) {
    // Check cache first
    if (postCache.has(id)) {
      return postCache.get(id) as Post;
    }
    
    const post = mockPosts.find((p) => p.id === id);
    if (!post) {
      throw new NotFoundError('Post', id);
    }
    
    // Update cache
    postCache.set(id, post);
    return post;
  },
  
  async getAll() {
    return [...mockPosts];
  },
  
  async create(data) {
    try {
      const newPost: Post = {
        id: `post_${Date.now()}`,
        slug: data.slug || `post-${Date.now()}`,
        title: data.title || '',
        content: data.content || '',
        tags: data.tags || [],
        isPremium: Boolean(data.isPremium),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      mockPosts.push(newPost);
      
      // Update cache
      postCache.set(newPost.id, newPost);
      
      return newPost;
    } catch (error) {
      throw new DataAccessError(`Failed to create post: ${error instanceof Error ? error.message : 'Unknown error'}`, 500, error);
    }
  },
  
  async update(id, data) {
    const idx = mockPosts.findIndex((p) => p.id === id);
    if (idx === -1) {
      throw new NotFoundError('Post', id);
    }
    
    try {
      const updated = { 
        ...mockPosts[idx], 
        ...data, 
        updatedAt: new Date().toISOString() 
      } as Post;
      
      mockPosts[idx] = updated;
      
      // Update cache
      postCache.set(id, updated);
      
      return updated;
    } catch (error) {
      throw new DataAccessError(`Failed to update post: ${error instanceof Error ? error.message : 'Unknown error'}`, 500, error);
    }
  },
  
  async delete(id) {
    const idx = mockPosts.findIndex((p) => p.id === id);
    if (idx !== -1) {
      mockPosts.splice(idx, 1);
      
      // Remove from cache
      postCache.delete(id);
    }
  },
};