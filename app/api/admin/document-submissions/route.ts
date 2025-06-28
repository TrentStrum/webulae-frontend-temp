import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, handleAuthError } from '@/app/lib/auth/adminAuth'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const url = new URL(request.url)
    const status = url.searchParams.get('status') || 'pending'

    // Read submissions from JSON file
    const submissionsPath = join(process.cwd(), 'data', 'document_submissions.json')
    let submissions = []
    
    try {
      const data = await readFile(submissionsPath, 'utf-8')
      submissions = JSON.parse(data)
    } catch (error) {
      // File doesn't exist, return empty array
      return NextResponse.json([])
    }

    // Filter by status if provided
    if (status !== 'all') {
      submissions = submissions.filter((sub: any) => sub.status === status)
    }

    // Sort by submitted_at (newest first)
    submissions.sort((a: any, b: any) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())

    return NextResponse.json(submissions)

  } catch (e) {
    if (e instanceof Error) {
      return handleAuthError(e)
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 