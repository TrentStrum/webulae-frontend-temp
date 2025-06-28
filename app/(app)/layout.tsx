import { ReactNode } from 'react';
import { MainNav } from '@/app/components/layout/main-nav';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import { ErrorFallback } from '@/app/components/ErrorFallback';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/app/components/ui/loading-spinner';
import FloatingChat from '@/app/components/ui/FloatingChat';

export default function AppLayout({ children }: { children: ReactNode }): React.ReactElement {
	return (
		<div className="min-h-screen flex flex-col">
			<header className="border-b p-4">
				<MainNav />
			</header>
			<ErrorBoundary fallback={<ErrorFallback />}>
				<main className="flex-1 p-4">
					<Suspense fallback={<LoadingSpinner className="h-screen" />}>
						{children}
					</Suspense>
				</main>
			</ErrorBoundary>
			<FloatingChat />
		</div>
	);
}