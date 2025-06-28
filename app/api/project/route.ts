import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getProjectDataAccess, getBusinessMemberDataAccess } from '@/app/config/backend'
import { z } from 'zod'
import { formatApiError, logServerError } from '@/app/lib/errorHandler'
import { withRateLimit } from '@/app/api/middleware/withRateLimit'

// Validation schema for project creation
const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  organizationId: z.string().optional()
})

export const GET = withRateLimit(async (req) => {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 })
    }

    // Get the organizationId from the query string
    const url = new URL(req.url)
    const organizationId = url.searchParams.get('organizationId')

    if (process.env.NODE_ENV !== 'production') {
      console.log('Fetching projects for user:', userId, 'organizationId:', organizationId)
    }
    
    // If organizationId is provided, check if the user is a member of that organization
    if (organizationId) {
      const member = await getBusinessMemberDataAccess.getMemberByOrganizationAndUser(organizationId, userId)
      
      if (!member || !member.isActive) {
        return NextResponse.json({ error: 'Forbidden', status: 403 }, { status: 403 })
      }
      
      // Fetch projects for the organization
      const projects = await getProjectDataAccess.getAll()
      return NextResponse.json(projects, {
        headers: {
          'Cache-Control': 'private, max-age=60' // Cache for 1 minute for authenticated users
        }
      })
    } else {
      // Fetch projects for the user
      const projects = await getProjectDataAccess.getAll()
      return NextResponse.json(projects, {
        headers: {
          'Cache-Control': 'private, max-age=60' // Cache for 1 minute for authenticated users
        }
      })
    }
  } catch (error) {
    logServerError('PROJECTS_GET', error)
    return NextResponse.json(formatApiError(error), { status: 500 })
  }
})

export const POST = withRateLimit(async (req) => {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 })
    }

    // Parse and validate request body
    const body = await req.json()
    const result = projectSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.format(), status: 400 },
        { status: 400 }
      )
    }
    
    const { name, description, organizationId } = result.data

    // If organizationId is provided, check if the user is a member of that organization
    if (organizationId) {
      const member = await getBusinessMemberDataAccess.getMemberByOrganizationAndUser(organizationId, userId)
      
      if (!member || !member.isActive) {
        return NextResponse.json({ error: 'Forbidden', status: 403 }, { status: 403 })
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('Creating project for user:', userId, 'with data:', { name, description, organizationId })
    }
    
    const project = await getProjectDataAccess.create({
      name,
      description,
      user_id: userId,
      organizationId,
    })
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Project created:', project)
    }

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    logServerError('PROJECTS_POST', error)
    return NextResponse.json(formatApiError(error), { status: 500 })
  }
})