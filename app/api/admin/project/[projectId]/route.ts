import { NextRequest, NextResponse } from 'next/server';
import { getProjectDataAccess } from '@/app/config/backend';
import { projectSchema } from '@/app/schemas/projectSchema';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';

export const GET = withRateLimit(async (req: NextRequest): Promise<Response> => {
	try {
		const projectId = req.nextUrl.pathname.split('/').pop();
		if (!projectId) {
			return NextResponse.json({ error: 'Project ID is required', status: 400 }, { status: 400 });
		}
		
		const project = await getProjectDataAccess().getById(projectId);
		if (!project) {
			return NextResponse.json({ error: 'Project not found', status: 404 }, { status: 404 });
		}
		return NextResponse.json(project);
	} catch (error) {
		logServerError('Failed to fetch project', error);
		return NextResponse.json(formatApiError(error), { status: 500 });
	}
});

export const PUT = withRateLimit(async (req: NextRequest): Promise<Response> => {
	try {
		const projectId = req.nextUrl.pathname.split('/').pop();
		if (!projectId) {
			return NextResponse.json({ error: 'Project ID is required', status: 400 }, { status: 400 });
		}
		
		const body = await req.json();
		const validated = projectSchema.partial().safeParse(body);
		if (!validated.success) {
			return NextResponse.json(
				{ error: 'Invalid data', details: validated.error.format(), status: 400 },
				{ status: 400 }
			);
		}

		const updatedProject = await getProjectDataAccess().update(projectId, validated.data);
		return NextResponse.json(updatedProject);
	} catch (error) {
		logServerError('Failed to update project', error);
		return NextResponse.json(formatApiError(error), { status: 500 });
	}
});

export const DELETE = withRateLimit(async (req: NextRequest): Promise<Response> => {
	try {
		const projectId = req.nextUrl.pathname.split('/').pop();
		if (!projectId) {
			return NextResponse.json({ error: 'Project ID is required', status: 400 }, { status: 400 });
		}
		
		await getProjectDataAccess().delete(projectId);
		return NextResponse.json({ success: true });
	} catch (error) {
		logServerError('Failed to delete project', error);
		return NextResponse.json(formatApiError(error), { status: 500 });
	}
});