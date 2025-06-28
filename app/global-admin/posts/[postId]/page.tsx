'use client';

import { useParams, useRouter } from 'next/navigation';
import { AdminPostForm } from '@/app/components/admin/AdminPostForm';

export default function EditPostPage(): React.ReactElement {
	const { postId } = useParams<{ postId: string }>();
	const router = useRouter();

	return (
		<div className="container mx-auto py-6">
			<AdminPostForm id={postId} onSuccess={() => router.push('/global-admin/posts')} />
		</div>
	);
}
