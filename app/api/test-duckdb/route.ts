import { NextRequest, NextResponse } from 'next/server';
import { getDuckDBConnection } from '@/app/lib/duckdb/serverConnection';

// Helper function to convert BigInt to number for JSON serialization
function convertBigIntToNumber(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return Number(obj);
  if (Array.isArray(obj)) return obj.map(convertBigIntToNumber);
  if (typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = convertBigIntToNumber(value);
    }
    return result;
  }
  return obj;
}

export async function GET(request: NextRequest) {
	try {
		const db = getDuckDBConnection();
		
		// Test project_requests table
		const query = `
			SELECT id, userId, query, status, createdAt, updatedAt
			FROM project_requests
			ORDER BY createdAt DESC
		`;
		
		const result = await db.all(query);
		
		// Convert BigInt to number for JSON serialization
		const convertedResult = result.map((row: any) => {
			const converted: any = {};
			for (const [key, value] of Object.entries(row)) {
				if (typeof value === 'bigint') {
					converted[key] = Number(value);
				} else {
					converted[key] = value;
				}
			}
			return converted;
		});
		
		return NextResponse.json({
			success: true,
			count: convertedResult.length,
			data: convertedResult
		});
	} catch (error) {
		return NextResponse.json({
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
} 
