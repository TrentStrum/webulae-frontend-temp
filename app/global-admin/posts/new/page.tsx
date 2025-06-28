'use client';

import { useRouter } from 'next/navigation';
import { AdminPostForm } from '@/app/components/admin/AdminPostForm';

export default function NewPostPage(): React.ReactElement {
	const router = useRouter();

	return (
		<div className="container mx-auto py-6">
			<AdminPostForm onSuccess={() => router.push('/global-admin/posts')} />
		</div>
	);
}
