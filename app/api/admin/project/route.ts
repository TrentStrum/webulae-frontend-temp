import { NextResponse } from 'next/server';
import { getProjectDataAccess } from '@/app/config/backend';
import { projectSchema } from '@/app/schemas/projectSchema';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';

export const GET = withRateLimit(async () => {
	try {
		const dataAccess = getProjectDataAccess();
		const projects = await dataAccess.getAll();
		
		return NextResponse.json(projects, { 
			status: 200,
			headers: {
				'Cache-Control': 'private, max-age=60' // Cache for 1 minute for authenticated users
			}
		});
	} catch (error) {
		logServerError('Failed to fetch projects', error);
		return NextResponse.json(formatApiError(error), { status: 500 });
	}
});

export const POST = withRateLimit(async (req: Request) => {
	try {
		const body = await req.json();	
		const parsed = projectSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: 'Invalid input', details: parsed.error.format(), status: 400 },
				{ status: 400 }
			);
		}

		const dataAccess = getProjectDataAccess();
		const created = await dataAccess.create(parsed.data);
		
		return NextResponse.json(created, { status: 201 });
	} catch (error) {
		logServerError('Failed to create project', error);
		return NextResponse.json(formatApiError(error), { status: 500 });
	}
});