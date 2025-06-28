import { ReactNode } from 'react';
import { MainNav } from '@/app/components/layout/main-nav';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import { ErrorFallback } from '@/app/components/ErrorFallback';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/app/components/ui/loading-spinner';
import FloatingChat from '@/app/components/ui/FloatingChat';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { motion } from 'framer-motion';

export default function AppLayout({ children }: { children: ReactNode }): React.ReactElement {
	return (
		<div className="min-h-screen flex flex-col bg-background">
			<motion.header 
				className="border-b border-border/40 p-4 bg-background/95 backdrop-blur-sm sticky top-0 z-10"
				initial={{ y: -20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.3 }}
			>
				<div className="container mx-auto flex justify-between items-center">
					<MainNav />
					<div className="flex items-center gap-2">
						<ThemeToggle />
					</div>
				</div>
			</motion.header>
			<ErrorBoundary fallback={<ErrorFallback />}>
				<motion.main 
					className="flex-1"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3, delay: 0.2 }}
				>
					<Suspense fallback={<LoadingSpinner className="h-screen" />}>
						{children}
					</Suspense>
				</motion.main>
			</ErrorBoundary>
			<FloatingChat />
		</div>
	);
}