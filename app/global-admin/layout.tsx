// app/admin/layout.tsx
import type { ReactNode } from 'react';
import { AdminSidebarNew } from '@/app/components/admin/AdminSidebarNew';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import ErrorBoundary from '@/app/ErrorBoundary';

export default function AdminLayout({ children }: { children: ReactNode }) {
	return (
		<ErrorBoundary>
			<SidebarProvider>
				<div className="flex min-h-screen">
					<AdminSidebarNew />
					<SidebarInset>
						{children}
					</SidebarInset>
				</div>
			</SidebarProvider>
		</ErrorBoundary>
	);
} 
