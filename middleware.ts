import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define your route matchers
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/api/public(.*)']);
const isGlobalAdminRoute = createRouteMatcher(['/global-admin(.*)']);
const isOrgAdminRoute = createRouteMatcher(['/org-admin(.*)']);
const isOrgMemberRoute = createRouteMatcher(['/org-member(.*)']);
const isProtectedRoute = createRouteMatcher(['/(dashboard|profile)(.*)']);

// Define the valid roles in your system
type UserRole = 'global_admin' | 'org_admin' | 'org_member' | 'moderator';

// Define a minimal type for session claims
type SessionClaims = {
	metadata?: {
		role?: UserRole;
		[key: string]: unknown;
	};
	[key: string]: unknown;
};

// Helper to extract role from session claims
function getUserRole(sessionClaims: SessionClaims): UserRole | undefined {
	return sessionClaims.metadata?.role as UserRole | undefined;
}

export default clerkMiddleware(async (auth, req) => {
	// Allow all API routes in development without authentication
	if (process.env.NODE_ENV === 'development' && req.nextUrl.pathname.startsWith('/api/')) {
		return NextResponse.next();
	}

	// Public routes (sign-in, sign-up, etc.)
	if (isPublicRoute(req)) {
		return NextResponse.next();
	}

	// All other routes require authentication
	const { sessionClaims } = await auth();

	// If not authenticated, redirect to sign-in
	if (!sessionClaims) {
		return NextResponse.redirect(new URL('/sign-in', req.url));
	}

	const userRole = getUserRole(sessionClaims);

	// Global admin routes
	if (isGlobalAdminRoute(req)) {
		if (userRole !== 'global_admin') {
			return NextResponse.redirect(new URL('/unauthorized', req.url));
		}
	}

	// Organization admin routes
	if (isOrgAdminRoute(req)) {
		if (userRole !== 'org_admin') {
			return NextResponse.redirect(new URL('/unauthorized', req.url));
		}
	}

	// Organization member routes
	if (isOrgMemberRoute(req)) {
		if (userRole !== 'org_member') {
			return NextResponse.redirect(new URL('/unauthorized', req.url));
		}
	}

	// Protected routes (any signed-in user)
	if (isProtectedRoute(req)) {
		// Already authenticated above
		return NextResponse.next();
	}

	// Default: allow
	return NextResponse.next();
});

// Matcher config: protect all routes except static assets and public files
export const config = {
	matcher: [
		// Match all pages and API except static assets and public files
		'/((?!_next|favicon.ico|public|.*\\.(?:html?|css|js|jpg|png|svg|ico|woff2?|csv|docx?|xlsx?|zip|webmanifest)).*)',
		'/api(.*)',
	],
};
