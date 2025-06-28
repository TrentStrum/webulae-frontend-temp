import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    console.log('POST /api/org-admin/documents/submit - Debug:', {
      userId,
      url: request.url
    })

    if (!userId) {
      console.log('No userId found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const organizationId = formData.get('organizationId') as string
    const documentType = formData.get('documentType') as string
    const description = formData.get('description') as string

    console.log('Form data:', {
      fileName: file?.name,
      organizationId,
      documentType,
      description
    })

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 })
    }

    // Check if user is an admin of this organization
    const clerk = await clerkClient()
    const memberships = await clerk.organizations.getOrganizationMembershipList({
      organizationId,
    })

    console.log('Organization memberships for submission:', {
      organizationId,
      totalMembers: memberships.data.length,
      members: memberships.data.map(m => ({
        userId: m.publicUserData?.userId,
        role: m.role,
        isCurrentUser: m.publicUserData?.userId === userId
      }))
    })

    const userMembership = memberships.data.find(member => member.publicUserData?.userId === userId)
    console.log('User membership found for submission:', userMembership ? {
      role: userMembership.role,
      isAdmin: userMembership.role === 'admin' || userMembership.role === 'org:admin'
    } : 'No membership found')

    if (!userMembership || (userMembership.role !== 'admin' && userMembership.role !== 'org:admin')) {
      console.log('Access denied for submission - not admin')
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Validate file type
    const allowedTypes = ['text/plain', 'text/markdown']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'File type not supported. Supported types: TXT, MD' 
      }, { status: 400 })
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size: 10MB' 
      }, { status: 400 })
    }

    // Create a unique filename for storage
    const uniqueId = uuidv4()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${uniqueId}.${fileExtension}`
    
    // Save the file temporarily
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const tempDir = join(process.cwd(), 'temp', 'pending')
    const filePath = join(tempDir, fileName)
    
    await writeFile(filePath, buffer)

    // Read file content for preview
    const fileContent = buffer.toString('utf-8')

    // Validate content is not empty
    if (!fileContent || fileContent.trim().length === 0) {
      return NextResponse.json({ 
        error: 'File content is empty' 
      }, { status: 400 })
    }

    // Create submission record in database
    const submission = {
      id: uniqueId,
      organization_id: organizationId,
      user_id: userId,
      original_filename: file.name,
      stored_filename: fileName,
      file_path: filePath,
      file_size: file.size,
      file_type: file.type,
      description: description || '',
      status: 'pending',
      submitted_at: new Date().toISOString(),
      content_preview: fileContent.substring(0, 500) + (fileContent.length > 500 ? '...' : '')
    }

    // Store submission in database (you'll need to implement this)
    // For now, we'll store in a simple JSON file
    const submissionsPath = join(process.cwd(), 'data', 'document_submissions.json')
    let submissions = []
    
    try {
      const existingData = await import('fs/promises').then(fs => fs.readFile(submissionsPath, 'utf-8'))
      submissions = JSON.parse(existingData)
    } catch (error) {
      // File doesn't exist, start with empty array
    }

    submissions.push(submission)
    
    await import('fs/promises').then(fs => fs.writeFile(submissionsPath, JSON.stringify(submissions, null, 2)))

    return NextResponse.json({
      success: true,
      message: 'Document submitted for approval',
      submission_id: uniqueId,
      document_name: file.name,
      organization_id: organizationId,
      status: 'pending'
    })

  } catch (error) {
    console.error('Error submitting document:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal Server Error'
    }, { status: 500 })
  }
} 