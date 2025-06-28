import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

const PYTHON_SERVICE_URL =
  process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:8000'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { userId } = await auth()
    const { organizationId } = params

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is an admin of this organization
    const clerk = await clerkClient()
    const memberships = await clerk.organizations.getOrganizationMembershipList({
      organizationId,
    })

    const userMembership = memberships.data.find(member => member.publicUserData?.userId === userId)
    if (!userMembership || (userMembership.role !== 'admin' && userMembership.role !== 'org:admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { document_name } = await request.json()

    if (!document_name) {
      return NextResponse.json({ error: 'Missing document_name' }, { status: 400 })
    }

    const pythonResponse = await fetch(`${PYTHON_SERVICE_URL}/documents`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        document_name,
        organization_id: organizationId, // Use the organizationId from params
      }),
    })

    if (!pythonResponse.ok) {
      const errorData = await pythonResponse.text()
      console.error('Python service error:', errorData)
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: pythonResponse.status }
      )
    }

    const result = await pythonResponse.json()
    return NextResponse.json(result)
  } catch (e) {
    console.error(e)
    const errorMessage = e instanceof Error ? e.message : 'Internal Server Error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { userId } = await auth()
    const { organizationId } = params

    console.log('GET /api/organization/[organizationId]/documents - Debug:', {
      userId,
      organizationId,
      url: request.url
    })

    if (!userId) {
      console.log('No userId found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is an admin of this organization
    const clerk = await clerkClient()
    const memberships = await clerk.organizations.getOrganizationMembershipList({
      organizationId,
    })

    console.log('Organization memberships:', {
      organizationId,
      totalMembers: memberships.data.length,
      members: memberships.data.map(m => ({
        userId: m.publicUserData?.userId,
        role: m.role,
        isCurrentUser: m.publicUserData?.userId === userId
      }))
    })

    const userMembership = memberships.data.find(member => member.publicUserData?.userId === userId)
    console.log('User membership found:', userMembership ? {
      role: userMembership.role,
      isAdmin: userMembership.role === 'admin' || userMembership.role === 'org:admin'
    } : 'No membership found')

    if (!userMembership || (userMembership.role !== 'admin' && userMembership.role !== 'org:admin')) {
      console.log('Access denied - not admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const pythonResponse = await fetch(`${PYTHON_SERVICE_URL}/documents/${organizationId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!pythonResponse.ok) {
      const errorData = await pythonResponse.text()
      console.error('Python service error:', errorData)
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: pythonResponse.status }
      )
    }

    const result = await pythonResponse.json()
    return NextResponse.json(result.documents || [])
  } catch (e) {
    console.error('Error in GET /api/organization/[organizationId]/documents:', e)
    const errorMessage = e instanceof Error ? e.message : 'Internal Server Error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
} 