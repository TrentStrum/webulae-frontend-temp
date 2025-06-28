export {};

// Create a type for the roles
export type Roles = 'global_admin' | 'moderator' | 'org_admin' | 'org_member';

declare global {
	interface CustomJwtSessionClaims {
		metadata: {
			role?: Roles;
		};
	}
}
