import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, handleAuthError } from '@/app/lib/auth/adminAuth';
import { getAuditLogs, getAuditLogsByAdmin } from '@/app/lib/audit/auditLogger';

export async function GET(req: NextRequest): Promise<Response> {
	try {
		// Require admin authentication
		const adminUser = await requireAdmin();
		
		const url = new URL(req.url);
		const limit = parseInt(url.searchParams.get('limit') || '100');
		const offset = parseInt(url.searchParams.get('offset') || '0');
		const filterByAdmin = url.searchParams.get('filterByAdmin') === 'true';
		
		let logs;
		if (filterByAdmin) {
			logs = await getAuditLogsByAdmin(adminUser.id, limit);
		} else {
			logs = await getAuditLogs(limit, offset);
		}
		
		return NextResponse.json({
			logs,
			total: logs.length,
			limit,
			offset,
		}, { status: 200 });
	} catch (err) {
		console.error('GET audit logs failed:', err);
		return handleAuthError(err as Error);
	}
} 