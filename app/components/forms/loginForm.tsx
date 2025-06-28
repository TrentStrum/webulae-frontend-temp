'use client';

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useSignIn, useAuth, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { OAuthStrategy } from '@clerk/types'
import { Github } from 'lucide-react'
import { loginSchema, type LoginSchema } from '@/app/schemas/loginSchema'
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'

// Separate component for the actual login form functionality
function LoginFormContent(): React.ReactElement {
	const form = useForm<LoginSchema>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: '', password: '' },
	});
  
	const { signIn, setActive, isLoaded: isSignInLoaded } = useSignIn();
	const { isSignedIn, isLoaded: isAuthLoaded, sessionClaims } = useAuth();
	const { user, isLoaded: isUserLoaded } = useUser();
	const router = useRouter();
	const [serverError, setServerError] = React.useState('');

	// Function to determine redirect URL based on user role
	const getRedirectUrl = React.useCallback(() => {
		if (!user || !sessionClaims) return null; // Don't redirect until you know!
		const userRole = sessionClaims?.metadata?.role as string | undefined;
		if (userRole === 'global_admin') return '/global-admin';
		if (userRole === 'org_admin') return '/org-admin';
		if (userRole === 'org_member') return '/org-member';
		// Fallback to publicMetadata for backward compatibility
		const publicMetadataRole = user.publicMetadata?.role;
		const isLegacyAdmin = publicMetadataRole === 'global_admin' || 
							  publicMetadataRole === 'org:admin' || 
							  user.publicMetadata?.isAdmin === true;
		if (isLegacyAdmin) return '/global-admin';
		// Default to regular dashboard
		return '/dashboard';
	}, [user, sessionClaims]);

	const onSubmit = async (data: LoginSchema): Promise<void> => {
		setServerError('');
		try {
			const result = await signIn?.create({ identifier: data.email, password: data.password });
			await setActive?.({ session: result?.createdSessionId });
			// No redirect here; let the top-level LoginForm handle it
		} catch (err: unknown) {
			console.error('Sign in failed:', err);
			setServerError((err as Error)?.message ?? 'Sign in failed');
		}
	};

	const handleOAuthSignIn = async (strategy: OAuthStrategy) => {
		// Early return if already signed in
		if (isSignedIn && user) {
			const redirectUrl = getRedirectUrl();
			if (redirectUrl) {
				router.push(redirectUrl);
			}
			return;
		}

		try {
			// Attempt OAuth authentication
            await signIn?.authenticateWithRedirect({
                strategy,
                redirectUrl: '/auth-callback',
                redirectUrlComplete: '/auth-callback',
            });
		} catch (error) {
			const errorMessage = (error as Error)?.message || 'OAuth sign in failed';

			// Handle "already signed in" error gracefully without logging
			if (
				errorMessage.includes('already signed in') ||
				errorMessage.includes('already authenticated')
			) {
				const redirectUrl = getRedirectUrl();
				if (redirectUrl) {
					router.push(redirectUrl);
				}
				return;
			}

			// Only log and show error for actual failures
			console.error('OAuth sign in failed:', error);
			setServerError(errorMessage);
		}
	};

	return (
		<div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>

			{serverError && (
				<Alert variant="destructive" className="mb-4">
					<AlertDescription>{serverError}</AlertDescription>
				</Alert>
			)}

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input 
                    type="email" 
                    placeholder="name@example.com" 
                    {...field} 
                  />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input 
                    type="password" 
                    placeholder="••••••••" 
                    {...field} 
                  />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

          <div className="flex items-center justify-end">
            <Link 
              href="/forgot-password" 
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

					<Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
						{form.formState.isSubmitting ? 'Signing in...' : 'Sign In'}
					</Button>
				</form>
			</Form>

			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<Separator className="w-full" />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-background px-2 text-muted-foreground">Or continue with</span>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-3">
				<Button
					variant="outline"
					onClick={() => handleOAuthSignIn('oauth_google')}
					className="w-full"
					type="button"
					disabled={isSignedIn}
				>
					<svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
						<path
							d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							fill="#4285F4"
						/>
						<path
							d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							fill="#34A853"
						/>
						<path
							d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							fill="#FBBC05"
						/>
						<path
							d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							fill="#EA4335"
						/>
					</svg>
					Google
				</Button>
				<Button
					variant="outline"
					onClick={() => handleOAuthSignIn('oauth_github')}
					className="w-full"
					type="button"
					disabled={isSignedIn}
				>
					<Github className="h-4 w-4 mr-2" />
					GitHub
				</Button>
			</div>

      <div className="text-center text-sm">
        <p className="text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/sign-up" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
		</div>
	);
}

export function LoginForm(): React.ReactElement {
	const { isSignedIn, isLoaded: isAuthLoaded, sessionClaims } = useAuth();
	const { user, isLoaded: isUserLoaded } = useUser();
	const router = useRouter();

	// Function to determine redirect URL based on user role
	const getRedirectUrl = React.useCallback(() => {
		if (!user || !sessionClaims) return null; // Don't redirect until you know!
		const userRole = sessionClaims?.metadata?.role as string | undefined;
		if (userRole === 'global_admin') return '/global-admin';
		if (userRole === 'org_admin') return '/org-admin';
		if (userRole === 'org_member') return '/org-member';
		// Fallback to publicMetadata for backward compatibility
		const publicMetadataRole = user.publicMetadata?.role;
		const isLegacyAdmin = publicMetadataRole === 'global_admin' || 
							  publicMetadataRole === 'org:admin' || 
							  user.publicMetadata?.isAdmin === true;
		if (isLegacyAdmin) return '/global-admin';
		// Default to regular dashboard
		return '/dashboard';
	}, [user, sessionClaims]);

	// Redirect if already signed in and all data is loaded
	React.useEffect(() => {
		if (isAuthLoaded && isUserLoaded && isSignedIn && user && sessionClaims) {
			const redirectUrl = getRedirectUrl();
			if (redirectUrl) {
				router.push(redirectUrl);
			}
		}
	}, [isAuthLoaded, isUserLoaded, isSignedIn, user, sessionClaims, router, getRedirectUrl]);

	// Show loading state until Clerk is loaded
	if (!isAuthLoaded || !isUserLoaded) {
		return <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
	}

	if (isSignedIn && user && sessionClaims) {
		return <div className="text-center py-8">
      <p className="text-muted-foreground">Redirecting to your dashboard...</p>
    </div>;
	}

	return <LoginFormContent />;
}