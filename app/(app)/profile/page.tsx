import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
// import { UserProfileForm } from '@/app/components/forms/userProfileForm';

export default async function ProfilePage(): Promise<React.ReactElement> {
	const { userId } = await auth();

	if (!userId) {
		redirect('/sign-in');   
	}

	return (
		<main className="max-w-3xl mx-auto py-8 px-4">
			<h1 className="text-2xl font-semibold mb-4">My Profile</h1>
			<div className="bg-gray-50 p-6 rounded-lg">
				<p className="text-gray-600">Profile form coming soon...</p>
			</div>
		</main>
	);
}
