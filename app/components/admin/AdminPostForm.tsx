'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { postSchema, type PostSchema } from '@/app/schemas/postSchema';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { Switch } from '@/app/components/ui/switch';
import { Label } from '@/app/components/ui/label';
import { usePostService } from '@/app/hooks/usePostService';
import { RichTextEditor } from './RichTextEditor';
import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

type Props = { id?: string; onSuccess?: () => void };

export function AdminPostForm({ id, onSuccess }: Props): React.ReactElement {
  const { useGetPostById, useCreatePost, useUpdatePost } = usePostService();
  const { userId, user } = useAuth();

  const form = useForm<PostSchema>({
    resolver: zodResolver(postSchema),
    defaultValues: { 
      title: '', 
      content: '', 
      excerpt: '',
      tags: [], 
      isPremium: false,
      isPublished: false,
      authorId: userId || '',
      authorName: user?.fullName || '',
    },
  });

  const isEditing = !!id;
  const { data: post } = useGetPostById(id ?? '', { enabled: Boolean(id) });
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || '',
        tags: post.tags,
        isPremium: post.isPremium,
        isPublished: post.isPublished,
        authorId: post.authorId || userId || '',
        authorName: post.authorName || user?.fullName || '',
        featuredImage: post.featuredImage || '',
      });
    }
  }, [post, form, userId, user]);

  const onSubmit = (data: PostSchema) => {
    if (isEditing && id) {
      updatePost.mutate({ id, ...data }, { onSuccess });
    } else {
      createPost.mutate(data, { onSuccess });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Label htmlFor="title" className="block text-sm font-medium mb-2">Title</Label>
          <Input 
            id="title"
            {...form.register('title')} 
            placeholder="Enter post title..."
          />
          {form.formState.errors.title && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.title.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="excerpt" className="block text-sm font-medium mb-2">Excerpt</Label>
          <Textarea 
            id="excerpt"
            rows={3}
            {...form.register('excerpt')} 
            placeholder="Brief description of the post..."
          />
          {form.formState.errors.excerpt && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.excerpt.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="featuredImage" className="block text-sm font-medium mb-2">Featured Image URL</Label>
          <Input 
            id="featuredImage"
            {...form.register('featuredImage')} 
            placeholder="https://example.com/image.jpg"
          />
          {form.formState.errors.featuredImage && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.featuredImage.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="tags" className="block text-sm font-medium mb-2">Tags (comma separated)</Label>
          <Input 
            id="tags"
            {...form.register('tags', { 
              setValueAs: (v) => (v as string).split(',').map((t) => t.trim()).filter(Boolean) 
            })} 
            placeholder="tag1, tag2, tag3"
          />
          {form.formState.errors.tags && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.tags.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="authorName" className="block text-sm font-medium mb-2">Author Name</Label>
          <Input 
            id="authorName"
            {...form.register('authorName')} 
            placeholder="Author name"
          />
          {form.formState.errors.authorName && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.authorName.message}</p>
          )}
        </div>
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="content" className="block text-sm font-medium mb-2">Content</Label>
        <RichTextEditor
          content={form.watch('content')}
          onChange={(content) => form.setValue('content', content)}
          placeholder="Start writing your blog post..."
        />
        {form.formState.errors.content && (
          <p className="text-sm text-red-500 mt-1">{form.formState.errors.content.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="isPremium"
            checked={form.watch('isPremium')}
            onCheckedChange={(checked) => form.setValue('isPremium', checked)}
          />
          <Label htmlFor="isPremium">Premium Article</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isPublished"
            checked={form.watch('isPublished')}
            onCheckedChange={(checked) => form.setValue('isPublished', checked)}
          />
          <Label htmlFor="isPublished">Published</Label>
        </div>
      </div>

      <div className="flex gap-4">
        <Button 
          type="submit" 
          disabled={createPost.isPending || updatePost.isPending}
          size="lg"
        >
          {isEditing ? 'Update Post' : 'Create Post'}
        </Button>
        
        {isEditing && (
          <Button 
            type="button" 
            variant="outline"
            onClick={() => form.setValue('isPublished', true)}
            disabled={createPost.isPending || updatePost.isPending}
          >
            Save & Publish
          </Button>
        )}
      </div>
    </form>
  );
}
