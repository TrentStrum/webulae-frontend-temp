import { ReactNode } from 'react';
import { MainNav } from '@/app/components/layout/main-nav';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import { ErrorFallback } from '@/app/components/ErrorFallback';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/app/components/ui/loading-spinner';
import FloatingChat from '@/app/components/ui/FloatingChat';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function AppLayout({ children }: { children: ReactNode }): React.ReactElement {
	return (
		<div className="min-h-screen flex flex-col bg-background">
			<header className="border-b border-border/40 p-4 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
				<div className="container mx-auto flex justify-between items-center">
					<MainNav />
					<div className="flex items-center gap-2">
						<ThemeToggle />
					</div>
				</div>
			</header>
			<ErrorBoundary fallback={<ErrorFallback />}>
				<main className="flex-1">
					<Suspense fallback={<LoadingSpinner className="h-screen" />}>
						{children}
					</Suspense>
				</main>
			</ErrorBoundary>
			<FloatingChat />
		</div>
	);
}