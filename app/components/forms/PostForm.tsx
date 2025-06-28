'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { postSchema, type PostSchema } from '@/app/schemas/postSchema';
import { usePostService } from '@/app/hooks/usePostService';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";

interface PostFormProps {
  id?: string;
  onSuccess?: () => void;
  initialData?: Partial<PostSchema>;
}

export function PostForm({ id, onSuccess, initialData }: PostFormProps): React.ReactElement {
  const { useGetPostById, useCreatePost, useUpdatePost } = usePostService();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PostSchema>({
    resolver: zodResolver(postSchema),
    defaultValues: initialData || {
      title: '',
      content: '',
      tags: [],
      isPremium: false,
    },
  });

  const isEditing = !!id;
  const { data: post } = useGetPostById(id ?? '', { enabled: Boolean(id) });
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  // Populate form with post data when editing
  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        content: post.content,
        tags: post.tags,
        isPremium: post.isPremium,
      });
    }
  }, [post, form]);

  const onSubmit = async (data: PostSchema) => {
    setError(null);
    try {
      if (isEditing && id) {
        await updatePost.mutateAsync({ id, ...data });
      } else {
        await createPost.mutateAsync(data);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        {error && (
          <div className="bg-red-50 text-red-800 border-red-200">
            <p>{error}</p>
          </div>
        )}

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Post title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Write your post content here..." 
                  className="min-h-[200px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter tags separated by commas" 
                  {...field} 
                  onChange={(e) => {
                    const value = e.target.value;
                    form.setValue(
                      "tags", 
                      value.split(',').map(tag => tag.trim()).filter(Boolean)
                    );
                  }}
                  value={field.value.join(', ')}
                />
              </FormControl>
              <FormDescription>
                Separate tags with commas (e.g., &quot;technology, news, tutorial&quot;)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPremium"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Premium Content</FormLabel>
                <FormDescription>
                  Mark this post as premium content for subscribers only
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={createPost.isPending || updatePost.isPending || form.formState.isSubmitting}
        >
          {isEditing ? 'Update Post' : 'Create Post'}
        </Button>
      </form>
    </Form>
  );
}