import { NextRequest } from 'next/server';

export interface AuditLogEntry {
	id: string;
	action: string;
	targetUserId: string;
	adminUserId: string;
	changes?: unknown;
	timestamp: string;
	ipAddress: string;
	userAgent?: string;
	success: boolean;
	errorMessage?: string;
}

// Simple in-memory audit log for development
// In production, you'd want to use a proper database
let auditLogs: AuditLogEntry[] = [];

export async function logAdminAction(
	action: string,
	targetUserId: string,
	adminUserId: string,
	req: NextRequest,
	changes?: unknown,
	success: boolean = true,
	errorMessage?: string,
): Promise<void> {
	const entry: AuditLogEntry = {
		id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
		action,
		targetUserId,
		adminUserId,
		changes,
		timestamp: new Date().toISOString(),
		ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
		userAgent: req.headers.get('user-agent') || 'unknown',
		success,
		errorMessage,
	};

	auditLogs.push(entry);

	// Keep only last 1000 entries in memory
	if (auditLogs.length > 1000) {
		auditLogs = auditLogs.slice(-1000);
	}

	// Log to console for development
	console.log('AUDIT LOG:', {
		action,
		targetUserId,
		adminUserId,
		timestamp: entry.timestamp,
		success,
		errorMessage,
	});
}

export async function getAuditLogs(
	limit: number = 100,
	offset: number = 0,
): Promise<AuditLogEntry[]> {
	return auditLogs
		.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
		.slice(offset, offset + limit);
}

export async function getAuditLogsByAdmin(
	adminUserId: string,
	limit: number = 100,
): Promise<AuditLogEntry[]> {
	return auditLogs
		.filter((log) => log.adminUserId === adminUserId)
		.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
		.slice(0, limit);
}

export async function getAuditLogsByTarget(
	targetUserId: string,
	limit: number = 100,
): Promise<AuditLogEntry[]> {
	return auditLogs
		.filter((log) => log.targetUserId === targetUserId)
		.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
		.slice(0, limit);
}
