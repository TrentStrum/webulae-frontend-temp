import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'

// This is a placeholder for your vectorization service
// You'll need to import and use your actual vectorization service here
async function vectorizeDocument(filePath: string, userId: string, organizationId: string, fileName: string, documentType: string) {
    try {
        // Read the file content
        const fileContent = await readFile(filePath, 'utf-8')
        
        if (documentType === 'company') {
            // Send to company knowledge endpoint
            const response = await axios.post('http://localhost:8000/company-knowledge', {
                category: 'General',
                title: fileName,
                content: fileContent,
                service_name: null,
                service_description: null,
                pricing_info: null,
                use_cases: null
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            return response.data
        } else {
            // Send to organization documents endpoint
            const response = await axios.post('http://localhost:8000/documents', {
                user_id: userId,
                organization_id: organizationId,
                content: fileContent,
                document_name: fileName,
                chunk_size: 400,
                overlap: 50,
                document_type: 'organization'
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            return response.data
        }
    } catch (error) {
        console.error('Error vectorizing document:', error)
        throw error
    }
}

export async function POST(request: Request) {
    try {
        const { userId } = await auth()
        
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File
        const organizationId = formData.get('organizationId') as string
        const documentType = formData.get('documentType') as string

        if (!file) {
            return new NextResponse('No file provided', { status: 400 })
        }

        if (!organizationId) {
            return new NextResponse('Organization ID is required', { status: 400 })
        }

        // Create a unique filename
        const uniqueId = uuidv4()
        const fileExtension = file.name.split('.').pop()
        const fileName = `${uniqueId}.${fileExtension}`
        
        // Save the file temporarily
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const tempDir = join(process.cwd(), 'temp')
        const filePath = join(tempDir, fileName)
        
        await writeFile(filePath, buffer)

        // Vectorize the document using enhanced main service
        const result = await vectorizeDocument(filePath, userId, organizationId, file.name, documentType)

        // Clean up temporary file
        try {
            await writeFile(filePath, '') // Clear the file
        } catch (cleanupError) {
            console.warn('Failed to cleanup temporary file:', cleanupError)
        }

        return NextResponse.json({ 
            message: `Document vectorized and stored successfully in ${documentType === 'company' ? 'company knowledge base' : 'organization documents'}`,
            result: result
        })
    } catch (error) {
        console.error('Error processing document:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
} 