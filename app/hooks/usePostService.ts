'use client';

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import type { Post } from '@/app/types';
import { apiClient } from '@/app/lib/apiClient';
import { queryKeys } from '@/app/lib/queryClient';
import { useNotifications } from '@/app/lib/stateContext';

export function usePostService() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  
  function useGetPosts() {
    return useQuery({
      queryKey: queryKeys.posts.all,
      queryFn: () => apiClient.get<Post[]>('/api/post'),
      staleTime: 60000, // 1 minute
      gcTime: 300000, // 5 minutes
    });
  }

  function useGetPublishedPosts() {
    return useQuery({
      queryKey: queryKeys.posts.published,
      queryFn: () => apiClient.get<Post[]>('/api/post/published'),
      staleTime: 60000, // 1 minute
      gcTime: 300000, // 5 minutes
    });
  }

  function useGetPostById(id: string, options?: Omit<UseQueryOptions<Post, Error, Post, ReturnType<typeof queryKeys.posts.detail>>, 'queryKey' | 'queryFn'>) {
    return useQuery<Post, Error, Post, ReturnType<typeof queryKeys.posts.detail>>({
      queryKey: queryKeys.posts.detail(id),
      queryFn: () => apiClient.get<Post>(`/api/post/${id}`),
      enabled: !!id,
      staleTime: 60000, // 1 minute
      gcTime: 300000, // 5 minutes
      ...options,
    });
  }

  function useGetPostBySlug(slug: string, options?: Omit<UseQueryOptions<Post, Error, Post, ReturnType<typeof queryKeys.posts.detail>>, 'queryKey' | 'queryFn'>) {
    return useQuery<Post, Error, Post, ReturnType<typeof queryKeys.posts.detail>>({
      queryKey: queryKeys.posts.detail(slug),
      queryFn: () => apiClient.get<Post>(`/api/post/slug/${slug}`),
      enabled: !!slug,
      staleTime: 60000, // 1 minute
      gcTime: 300000, // 5 minutes
      ...options,
    });
  }

  function useCreatePost() {
    return useMutation({
      mutationFn: (data: Partial<Post>) => apiClient.post('/api/post', data),
      onSuccess: (newPost) => {
        // Update the posts list cache
        queryClient.setQueriesData({ queryKey: queryKeys.posts.all }, (oldData: Post[] | undefined) => {
          if (!oldData) return [newPost];
          return [...oldData, newPost];
        });
        
        // Invalidate to ensure fresh data on next fetch
        queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
        
        // Show success notification
        addNotification({
          message: 'Post created successfully',
          type: 'success',
        });
      },
      onError: (error) => {
        // Show error notification
        addNotification({
          message: `Failed to create post: ${error.message}`,
          type: 'error',
        });
      },
    });
  }

  function useUpdatePost() {
    return useMutation({
      mutationFn: ({ id, ...data }: { id: string } & Partial<Post>) => 
        apiClient.put<Post>(`/api/post/${id}`, data),
      onSuccess: (updatedPost) => {
        // Update the post in the cache
        queryClient.setQueryData(queryKeys.posts.detail(updatedPost.id), updatedPost);
        
        // Update the post in the posts list cache if it exists
        queryClient.setQueriesData({ queryKey: queryKeys.posts.all }, (oldData: Post[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map(post => post.id === updatedPost.id ? updatedPost : post);
        });
        
        // Show success notification
        addNotification({
          message: 'Post updated successfully',
          type: 'success',
        });
      },
      onError: (error) => {
        // Show error notification
        addNotification({
          message: `Failed to update post: ${error.message}`,
          type: 'error',
        });
      },
    });
  }

  function useDeletePost() {
    return useMutation({
      mutationFn: (id: string) => apiClient.delete(`/api/post/${id}`),
      onSuccess: (_, id) => {
        // Remove the post from the cache
        queryClient.removeQueries({ queryKey: queryKeys.posts.detail(id) });
        
        // Update the posts list cache if it exists
        queryClient.setQueriesData({ queryKey: queryKeys.posts.all }, (oldData: Post[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.filter(post => post.id !== id);
        });
        
        // Show success notification
        addNotification({
          message: 'Post deleted successfully',
          type: 'success',
        });
      },
      onError: (error) => {
        // Show error notification
        addNotification({
          message: `Failed to delete post: ${error.message}`,
          type: 'error',
        });
      },
    });
  }

  return { 
    useGetPosts, 
    useGetPublishedPosts, 
    useGetPostById, 
    useGetPostBySlug, 
    useCreatePost, 
    useUpdatePost, 
    useDeletePost 
  };
}