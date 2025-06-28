import { QueryClient } from '@tanstack/react-query';

// Define query keys for better organization and type safety
export const queryKeys = {
  posts: {
    all: ['posts'] as const,
    published: ['posts', 'published'] as const,
    detail: (id: string) => ['post', id] as const,
  },
  users: {
    all: ['users'] as const,
    detail: (id: string) => ['user', id] as const,
    profile: ['users', 'profile'] as const,
  },
  projects: {
    all: ['projects'] as const,
    detail: (id: string) => ['project', id] as const,
    byUser: (userId: string) => ['projects', 'user', userId] as const,
  },
  documents: {
    all: ['documents'] as const,
    detail: (id: string) => ['document', id] as const,
    byUser: (userId: string) => ['documents', 'user', userId] as const,
  },
  workflows: {
    all: ['workflows'] as const,
    executions: ['workflowExecutions'] as const,
    detail: (id: string) => ['workflow', id] as const,
  },
  metrics: {
    all: ['metrics'] as const,
    dashboard: ['metrics', 'dashboard'] as const,
    globalAdmin: ['metrics', 'global-admin'] as const,
    organization: (organizationId: string) => ['metrics', 'organization', organizationId] as const,
    timeSeries: (timeframe: string) => ['metrics', 'timeseries', timeframe] as const,
  },
};

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000, // 5 minutes
			gcTime: 10 * 60 * 1000, // 10 minutes
			retry: 1,
			refetchOnWindowFocus: false,
		},
		mutations: {
			retry: 1,
		},
	},
});