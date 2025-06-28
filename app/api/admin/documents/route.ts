import { NextResponse, NextRequest } from 'next/server'
import { requireAdmin, handleAuthError } from '@/app/lib/auth/adminAuth'

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:8000'

export async function GET(request: NextRequest) {
    try {
        await requireAdmin()

        const url = new URL(request.url)
        const organizationId = url.searchParams.get('organizationId')

        let fetchUrl = `${PYTHON_SERVICE_URL}/documents`
        if (organizationId) {
            fetchUrl = `${PYTHON_SERVICE_URL}/documents/${organizationId}`
        }

        const pythonResponse = await fetch(fetchUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!pythonResponse.ok) {
            const errorData = await pythonResponse.text()
            console.error('Python service error:', errorData)
            return NextResponse.json({ error: 'Failed to fetch documents from service' }, { status: pythonResponse.status })
        }

        const data = await pythonResponse.json()
        return NextResponse.json(data)

    } catch (e) {
        if (e instanceof Error) {
            return handleAuthError(e)
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await requireAdmin()

        const { document_name, organization_id } = await request.json()

        if (!document_name || !organization_id) {
            return NextResponse.json(
                { error: 'Missing document_name or organization_id' },
                { status: 400 }
            )
        }

        const pythonResponse = await fetch(`${PYTHON_SERVICE_URL}/documents`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                document_name,
                organization_id,
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
        if (e instanceof Error) {
            return handleAuthError(e)
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
} 