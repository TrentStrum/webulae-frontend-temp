'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import { useAuth } from "@clerk/nextjs";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect } from 'react';
import axios from 'axios';
import { UIProvider } from './stateContext';
import { Notifications } from '../components/ui/Notifications';
import { ThemeProvider } from './theme/ThemeProvider';
import { GlobalStyles } from './theme/GlobalStyles';
import { Toaster } from 'sonner';

function AuthTokenProvider({ children }: { children: React.ReactNode }) {
	const { getToken } = useAuth();

	useEffect(() => {
		const interceptor = axios.interceptors.request.use(async (config) => {
			const token = await getToken?.();
			if (token && config.headers) {
				config.headers.Authorization = `Bearer ${token}`;
			}
			return config;
		});

		return () => {
			axios.interceptors.request.eject(interceptor);
		};
	}, [getToken]);

	return <>{children}</>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
        return (
                <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
                        <ThemeProvider defaultTheme="system">
                                <GlobalStyles />
                                <AuthTokenProvider>
                                        <QueryClientProvider client={queryClient}>
                                                <UIProvider>
                                                        {children}
                                                        <Notifications />
                                                        <Toaster />
                                                </UIProvider>
                                        </QueryClientProvider>
                                </AuthTokenProvider>
                        </ThemeProvider>
                </NextThemesProvider>
        );
}