import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, handleAuthError } from '@/app/lib/auth/adminAuth'
import { readFile, writeFile, unlink } from 'fs/promises'
import { join } from 'path'

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:8000'

export async function PUT(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    await requireAdmin()

    const { submissionId } = params
    const { action, reason } = await request.json()

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "approve" or "reject"' }, { status: 400 })
    }

    // Read submissions from JSON file
    const submissionsPath = join(process.cwd(), 'data', 'document_submissions.json')
    let submissions = []
    
    try {
      const data = await readFile(submissionsPath, 'utf-8')
      submissions = JSON.parse(data)
    } catch (error) {
      return NextResponse.json({ error: 'No submissions found' }, { status: 404 })
    }

    // Find the submission
    const submissionIndex = submissions.findIndex((sub: any) => sub.id === submissionId)
    if (submissionIndex === -1) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    const submission = submissions[submissionIndex]

    if (action === 'approve') {
      try {
        // Read the file content
        const fileContent = await readFile(submission.file_path, 'utf-8')

        // Send to Python service for vectorization
        const pythonResponse = await fetch(`${PYTHON_SERVICE_URL}/documents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: submission.user_id,
            organization_id: submission.organization_id,
            content: fileContent,
            document_name: submission.original_filename,
            chunk_size: 400,
            overlap: 50,
            document_type: 'organization'
          }),
        })

        if (!pythonResponse.ok) {
          const errorData = await pythonResponse.text()
          console.error('Python service error:', errorData)
          throw new Error('Failed to process document with vectorization service')
        }

        const result = await pythonResponse.json()

        // Update submission status
        submissions[submissionIndex] = {
          ...submission,
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: 'global_admin', // You might want to get the actual admin user ID
          vectorization_result: result
        }

        // Clean up the temporary file
        try {
          await unlink(submission.file_path)
        } catch (cleanupError) {
          console.warn('Failed to cleanup temporary file:', cleanupError)
        }

      } catch (error) {
        // Update submission status to failed
        submissions[submissionIndex] = {
          ...submission,
          status: 'failed',
          failed_at: new Date().toISOString(),
          failure_reason: error instanceof Error ? error.message : 'Unknown error'
        }

        await writeFile(submissionsPath, JSON.stringify(submissions, null, 2))

        return NextResponse.json({
          error: 'Failed to process document',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
      }
    } else if (action === 'reject') {
      // Update submission status
      submissions[submissionIndex] = {
        ...submission,
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejected_by: 'global_admin', // You might want to get the actual admin user ID
        rejection_reason: reason || 'No reason provided'
      }

      // Clean up the temporary file
      try {
        await unlink(submission.file_path)
      } catch (cleanupError) {
        console.warn('Failed to cleanup temporary file:', cleanupError)
      }
    }

    // Save updated submissions
    await writeFile(submissionsPath, JSON.stringify(submissions, null, 2))

    return NextResponse.json({
      success: true,
      message: `Document ${action === 'approve' ? 'approved and processed' : 'rejected'}`,
      submission_id: submissionId,
      status: action === 'approve' ? 'approved' : 'rejected'
    })

  } catch (e) {
    if (e instanceof Error) {
      return handleAuthError(e)
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 