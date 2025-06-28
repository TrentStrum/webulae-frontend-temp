// /app/types/project.types.ts

export type Project = {
	id: string;
	name: string;
	description?: string;
	status?: 'active' | 'archived' | 'pending';
	user_id: string;
	organizationId?: string;
	created_at: string;
	updated_at: string;
};

export type UpdatePayload = { id: string } & Partial<Project>;
