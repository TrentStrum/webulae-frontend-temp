import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

interface SessionMetadata {
  isPaid?: boolean;
  subscriptionTier?: string;
}

export default async function PremiumPage(): Promise<React.ReactElement> {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const tier = (sessionClaims?.publicMetadata as SessionMetadata)?.subscriptionTier || 'free';
  const isPaid = (sessionClaims?.privateMetadata as SessionMetadata)?.isPaid;
  if (tier === 'free' && !isPaid) {
    redirect('/pricing');
  }

  return (
    <main className="py-8 px-4">
      <h1 className="text-2xl font-semibold">Premium Content</h1>
      <p className="mt-2">This content is only available for subscribers.</p>
    </main>
  );
}
