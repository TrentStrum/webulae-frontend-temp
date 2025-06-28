import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';


const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:8000';

    

export async function POST(request: NextRequest, { params }: { params: { organizationId: string } }) {
    try {
        const { userId, orgId, orgRole } = await auth();
        const { organizationId } = params;

        if (!userId || !orgId || orgId !== organizationId || orgRole !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const fileContent = await file.text();

        const pythonResponse = await fetch(`${PYTHON_SERVICE_URL}/documents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                organization_id: orgId,
                content: fileContent,
                document_name: file.name,
                document_type: 'organization',
            }),
        });

        if (!pythonResponse.ok) {
            const errorData = await pythonResponse.text();
            console.error('Python service error:', errorData);
            return NextResponse.json({ error: 'Failed to process document' }, { status: pythonResponse.status });
        }

        const result = await pythonResponse.json();
        return NextResponse.json({ result });

    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
} 