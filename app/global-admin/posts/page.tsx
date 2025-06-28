'use client';

import { useRouter } from 'next/navigation';
import { usePostService } from '@/app/hooks/usePostService';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';

export default function AdminPostsPage(): React.ReactElement {
	const router = useRouter();
	const { useGetPosts, useDeletePost } = usePostService();
	const { data: posts, isPending, isError } = useGetPosts();
	const { mutate: deletePost, isPending: isDeleting } = useDeletePost();

	if (isPending) {
		return <div>Loading posts...</div>;
	}

	if (isError || !posts) {
		return <div>Error loading posts</div>;
	}

	return (
		<div className="container mx-auto py-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">Posts</h1>
				<Button variant="outline" onClick={() => router.push('/global-admin/posts/new')}>New Post</Button>
			</div>

			{posts.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<p className="text-muted-foreground mb-4">No posts found</p>
						<Button onClick={() => router.push('/global-admin/posts/new')}>
							Create Your First Post
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4">
					{posts.map((post) => (
						<Card key={post.id}>
							<CardHeader>
								<CardTitle className="flex justify-between items-start">
									<div>
										{post.title}
										{post.isPremium && (
											<Badge variant="secondary" className="ml-2">
												Premium
											</Badge>
										)}
									</div>
									<Button size="sm" variant="secondary" onClick={() => router.push(`/global-admin/posts/${post.id}`)}>Edit</Button>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground line-clamp-2">{post.content}</p>
								<div className="flex justify-between items-center mt-4">
									<div className="flex gap-2">
										{post.tags.map((tag) => (
											<Badge key={tag} variant="outline">
												{tag}
											</Badge>
										))}
									</div>
									<Button
										variant="destructive"
										size="sm"
										onClick={() => deletePost(post.id)}
										disabled={isDeleting}
									>
										Delete
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
