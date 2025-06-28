import type { Metadata } from "next";
import { montserrat, inter, robotoMono } from './fonts';
import "./globals.css";
import { AppProviders } from "./lib/providers";
import dynamic from 'next/dynamic';
import ErrorBoundary from './ErrorBoundary';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/sonner';

const MSWProvider = dynamic(() => import('./components/MSWProvider').then(mod => ({ default: mod.MSWProvider })), {
  ssr: false
});

export const metadata: Metadata = {
  title: "Webulae - AI-Powered Workspace",
  description: "Your personalized AI assistant, powered by your own data",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.variable} ${inter.variable} ${robotoMono.variable} antialiased`}>
        <ClerkProvider>
          <ErrorBoundary>
            <MSWProvider>
              <AppProviders>
                {children}
                <Toaster position="bottom-right" />
              </AppProviders>
            </MSWProvider>
          </ErrorBoundary>
        </ClerkProvider>
      </body>
    </html>
  );
}