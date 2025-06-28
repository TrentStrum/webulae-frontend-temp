'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/app/components/ui/alert-dialog'
import { Textarea } from '@/app/components/ui/textarea'
import { Label } from '@/app/components/ui/label'
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  AlertCircle,
  Building2,
  User
} from 'lucide-react'
import { useNotifications } from '@/app/lib/stateContext'
import { formatDistanceToNow } from 'date-fns'

interface DocumentSubmission {
  id: string
  organization_id: string
  user_id: string
  original_filename: string
  stored_filename: string
  file_path: string
  file_size: number
  file_type: string
  description: string
  status: 'pending' | 'approved' | 'rejected' | 'failed'
  submitted_at: string
  content_preview: string
  approved_at?: string
  approved_by?: string
  rejected_at?: string
  rejected_by?: string
  rejection_reason?: string
  failed_at?: string
  failure_reason?: string
  vectorization_result?: any
}

export default function DocumentSubmissionsPage() {
  const [submissions, setSubmissions] = useState<DocumentSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<DocumentSubmission | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewContent, setPreviewContent] = useState('')
  const [previewTitle, setPreviewTitle] = useState('')
  const { addNotification } = useNotifications()

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/document-submissions?status=all')
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data)
      } else {
        throw new Error('Failed to fetch submissions')
      }
    } catch (error) {
      addNotification({
        message: 'Failed to load document submissions',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (submission: DocumentSubmission) => {
    try {
      setIsProcessing(true)
      const response = await fetch(`/api/admin/document-submissions/${submission.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' })
      })

      if (response.ok) {
        addNotification({
          message: `Document "${submission.original_filename}" approved and processed successfully`,
          type: 'success'
        })
        fetchSubmissions() // Refresh the list
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to approve document')
      }
    } catch (error) {
      addNotification({
        message: error instanceof Error ? error.message : 'Failed to approve document',
        type: 'error'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async (submission: DocumentSubmission) => {
    try {
      setIsProcessing(true)
      const response = await fetch(`/api/admin/document-submissions/${submission.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'reject',
          reason: rejectionReason || 'No reason provided'
        })
      })

      if (response.ok) {
        addNotification({
          message: `Document "${submission.original_filename}" rejected`,
          type: 'success'
        })
        setRejectionReason('')
        fetchSubmissions() // Refresh the list
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to reject document')
      }
    } catch (error) {
      addNotification({
        message: error instanceof Error ? error.message : 'Failed to reject document',
        type: 'error'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePreview = (submission: DocumentSubmission) => {
    setPreviewTitle(submission.original_filename)
    setPreviewContent(submission.content_preview || 'No preview available')
    setShowPreview(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>
      case 'approved':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>
      case 'failed':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusCounts = () => {
    const counts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      failed: 0
    }
    
    submissions.forEach(sub => {
      if (counts.hasOwnProperty(sub.status)) {
        counts[sub.status as keyof typeof counts]++
      }
    })
    
    return counts
  }

  const statusCounts = getStatusCounts()

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Document Submissions</h1>
          <p className="text-gray-500">Review and approve document submissions from organization admins.</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-2">Loading submissions...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Document Submissions</h1>
        <p className="text-gray-500">Review and approve document submissions from organization admins.</p>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-blue-600">{statusCounts.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-orange-600">{statusCounts.failed}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions List */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            Pending ({statusCounts.pending})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            Approved ({statusCounts.approved})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            Rejected ({statusCounts.rejected})
          </TabsTrigger>
          <TabsTrigger value="failed" className="flex items-center gap-2">
            Failed ({statusCounts.failed})
          </TabsTrigger>
        </TabsList>

        {['pending', 'approved', 'rejected', 'failed'].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {submissions.filter(sub => sub.status === status).length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No {status} submissions found.
                </CardContent>
              </Card>
            ) : (
              submissions
                .filter(sub => sub.status === status)
                .map((submission) => (
                  <Card key={submission.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-500" />
                          <div>
                            <h3 className="font-medium">{submission.original_filename}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{(submission.file_size / 1024 / 1024).toFixed(2)} MB</span>
                              <span>•</span>
                              <span>{formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true })}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {submission.organization_id}
                              </span>
                            </div>
                          </div>
                        </div>

                        {submission.description && (
                          <p className="text-sm text-gray-600">{submission.description}</p>
                        )}

                        {submission.rejection_reason && (
                          <div className="text-sm text-red-600">
                            <strong>Rejection Reason:</strong> {submission.rejection_reason}
                          </div>
                        )}

                        {submission.failure_reason && (
                          <div className="text-sm text-orange-600">
                            <strong>Failure Reason:</strong> {submission.failure_reason}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {getStatusBadge(submission.status)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Preview Content */}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handlePreview(submission)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>

                        {/* Action Buttons */}
                        {submission.status === 'pending' && (
                          <>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="default" size="sm" disabled={isProcessing}>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Approve Document</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will approve "{submission.original_filename}" and process it for vectorization. 
                                    The document will be added to the organization's knowledge base.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleApprove(submission)}>
                                    Approve
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" disabled={isProcessing}>
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Reject Document</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will reject "{submission.original_filename}". 
                                    Please provide a reason for the rejection.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-2">
                                  <Label htmlFor="rejection-reason">Rejection Reason</Label>
                                  <Textarea
                                    id="rejection-reason"
                                    placeholder="Enter reason for rejection..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                  />
                                </div>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleReject(submission)}>
                                    Reject
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{previewTitle}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(false)}
              >
                ×
              </Button>
            </div>
            <div className="text-sm text-gray-600 mb-2">Document content preview:</div>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 text-gray-900 p-4 rounded max-h-64 overflow-y-auto">
              {previewContent}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
} 