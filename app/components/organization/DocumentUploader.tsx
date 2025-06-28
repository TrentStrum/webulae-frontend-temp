'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { UploadCloud, FileText, X, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { useNotifications } from '@/app/lib/stateContext'
import { useOrganization } from '@clerk/nextjs'
import { Progress } from '@/components/ui/progress'

interface UploadStatus {
  file: File
  status: 'submitting' | 'submitted' | 'error'
  progress: number
  error?: string
  submissionId?: string
}

export function DocumentUploader({ onUploadComplete }: { onUploadComplete?: () => void }) {
  const [files, setFiles] = useState<File[]>([])
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [descriptions, setDescriptions] = useState<{ [key: string]: string }>({})
  const { addNotification } = useNotifications()
  const { organization } = useOrganization()

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    const validFiles = selectedFiles.filter(file => {
      const validTypes = ['text/plain', 'text/markdown']
      if (!validTypes.includes(file.type)) {
        addNotification({
          message: `File type not supported: ${file.name}. Supported types: TXT, MD`,
          type: 'error'
        })
        return false
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        addNotification({
          message: `File too large: ${file.name}. Maximum size: 10MB`,
          type: 'error'
        })
        return false
      }
      return true
    })
    
    setFiles(prev => [...prev, ...validFiles])
  }, [addNotification])

  const removeFile = useCallback((index: number) => {
    const file = files[index]
    setFiles(prev => prev.filter((_, i) => i !== index))
    setUploadStatuses(prev => prev.filter((_, i) => i !== index))
    
    // Remove description for this file
    if (file) {
      setDescriptions(prev => {
        const newDescriptions = { ...prev }
        delete newDescriptions[file.name]
        return newDescriptions
      })
    }
  }, [files])

  const submitFile = async (file: File, index: number) => {
    if (!organization) {
      addNotification({ message: 'No active organization found', type: 'error' })
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('organizationId', organization.id)
    formData.append('documentType', 'organization')
    formData.append('description', descriptions[file.name] || '')

    try {
      // Update status to submitting
      setUploadStatuses(prev => prev.map((status, i) => 
        i === index ? { ...status, status: 'submitting', progress: 0 } : status
      ))

      const response = await fetch('/api/org-admin/documents/submit', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Submission failed')
      }

      const result = await response.json()
      
      // Update status to submitted
      setUploadStatuses(prev => prev.map((status, i) => 
        i === index ? { 
          ...status, 
          status: 'submitted', 
          progress: 100,
          submissionId: result.submission_id
        } : status
      ))

      addNotification({
        message: `Document "${file.name}" submitted for approval`,
        type: 'success'
      })

      // Remove file from list after successful submission
      setTimeout(() => {
        removeFile(index)
      }, 3000)

    } catch (error) {
      setUploadStatuses(prev => prev.map((status, i) => 
        i === index ? { 
          ...status, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Submission failed' 
        } : status
      ))

      addNotification({
        message: `Failed to submit "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      })
    }
  }

  const handleSubmit = async () => {
    if (!files.length) return

    setIsSubmitting(true)
    
    // Initialize upload statuses
    setUploadStatuses(files.map(file => ({
      file,
      status: 'submitting' as const,
      progress: 0
    })))

    // Submit files sequentially
    for (let i = 0; i < files.length; i++) {
      await submitFile(files[i], i)
    }

    setIsSubmitting(false)
    onUploadComplete?.()
  }

  const getStatusIcon = (status: UploadStatus['status']) => {
    switch (status) {
      case 'submitting':
        return <UploadCloud className="h-4 w-4 animate-pulse" />
      case 'submitted':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: UploadStatus['status']) => {
    switch (status) {
      case 'submitting':
        return 'text-blue-600'
      case 'submitted':
        return 'text-blue-600'
      case 'error':
        return 'text-red-600'
    }
  }

  const getStatusText = (status: UploadStatus['status']) => {
    switch (status) {
      case 'submitting':
        return 'submitting'
      case 'submitted':
        return 'pending approval'
      case 'error':
        return 'error'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Documents for Approval</CardTitle>
        <CardDescription>
          Upload documents to be reviewed and approved before being added to your organization's knowledge base.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Input */}
        <div className="space-y-2">
          <Label htmlFor="file-upload">Select Documents</Label>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  TXT, MD (MAX. 10MB each)
                </p>
              </div>
              <Input
                id="file-upload"
                type="file"
                multiple
                accept=".txt,.md"
                className="hidden"
                onChange={handleFileSelect}
                disabled={isSubmitting}
              />
            </label>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Files</Label>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {files.map((file, index) => {
                const status = uploadStatuses[index]
                return (
                  <div
                    key={`${file.name}-${index}`}
                    className="p-4 border rounded-lg bg-gray-50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {status && (
                          <>
                            <div className={`flex items-center space-x-1 ${getStatusColor(status.status)}`}>
                              {getStatusIcon(status.status)}
                              <span className="text-xs capitalize">{getStatusText(status.status)}</span>
                            </div>
                            {status.status === 'submitting' && (
                              <Progress value={status.progress} className="w-20" />
                            )}
                            {status.error && (
                              <p className="text-xs text-red-500 max-w-32 truncate">
                                {status.error}
                              </p>
                            )}
                          </>
                        )}
                        
                        {!isSubmitting && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(index)}
                            className="h-6 w-6"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Description field */}
                    <div className="space-y-2">
                      <Label htmlFor={`description-${index}`} className="text-xs">
                        Description (optional)
                      </Label>
                      <Textarea
                        id={`description-${index}`}
                        placeholder="Brief description of this document..."
                        value={descriptions[file.name] || ''}
                        onChange={(e) => setDescriptions(prev => ({
                          ...prev,
                          [file.name]: e.target.value
                        }))}
                        className="min-h-[60px] text-sm"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Submit Button */}
        {files.length > 0 && (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <UploadCloud className="mr-2 h-4 w-4 animate-pulse" />
                Submitting...
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 h-4 w-4" />
                Submit {files.length} Document{files.length > 1 ? 's' : ''} for Approval
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
} 