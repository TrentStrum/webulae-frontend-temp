import { z } from 'zod';

export const projectSchema = z.object({
	name: z
		.string()
		.min(1, 'Project name is required')
		.max(100, 'Project name must be under 100 characters'),
	description: z
		.string()
		.max(500, 'Description must be under 500 characters')
		.optional()
		.or(z.literal('')), // Allows empty string
});

export type ProjectSchema = z.infer<typeof projectSchema>;
