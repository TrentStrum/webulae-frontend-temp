'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { UploadCloud, FileText, X, Play } from 'lucide-react'
import { useNotifications } from '@/app/lib/stateContext'
import { OrganizationDocumentList } from '@/app/components/organization/OrganizationDocumentList'
import { DocumentUploader } from '@/app/components/organization/DocumentUploader'
import { useOrganization } from '@clerk/nextjs'
import { MultiStepLoader } from '@/app/components/ui/multi-step-loader'

export default function OrgAdminDocumentsPage() {
    // Key to force re-render of document list
    const [listKey, setListKey] = useState(0)

    const handleUploadComplete = () => {
        // Force re-render of document list to show newly uploaded documents
        setListKey(prev => prev + 1)
    }

    return (
        <div className="space-y-6">
            <DocumentUploader onUploadComplete={handleUploadComplete} />
            <div key={listKey}>
                <OrganizationDocumentList showActions={true} />
            </div>
        </div>
    )
} 