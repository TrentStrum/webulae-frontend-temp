export const queryKeys = {
	users: {
		all: ['users'] as const,
		detail: (id: string) => ['users', id] as const,
		profile: ['users', 'profile'] as const,
	},
        dashboard: {
                base: ['dashboard'] as const,
                metrics: (userId: string) => ['dashboard', userId, 'metrics'] as const,
                activity: (userId: string) => ['dashboard', userId, 'activity'] as const,
        },
        metrics: {
                all: ['metrics'] as const,
        },
        documents: {
                all: ['documents'] as const,
        },
};
