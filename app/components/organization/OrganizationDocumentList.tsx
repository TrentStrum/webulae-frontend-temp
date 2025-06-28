'use client'

import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table'
import { Input } from '@/app/components/ui/input'
import { formatDistanceToNow } from 'date-fns'
import { useNotifications } from '@/app/lib/stateContext'
import { Button } from '@/app/components/ui/button'
import { Trash2 } from 'lucide-react'
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
import { useOrganization } from '@clerk/nextjs'

// Define the StoredDocument type locally
interface StoredDocument {
  document_name: string;
  organization_id: string;
  document_type: string;
  last_updated: string;
}

export function OrganizationDocumentList({
  showActions = false,
}: {
  showActions?: boolean
}) {
  const [docs, setDocs] = useState<StoredDocument[]>([])
  const [filteredDocs, setFilteredDocs] = useState<StoredDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { addNotification } = useNotifications()
  const { organization } = useOrganization()

  useEffect(() => {
    if (!organization) return

    const fetchDocs = async () => {
      setLoading(true)
      try {
        const response = await fetch(
          `/api/organization/${organization.id}/documents`
        )
        if (!response.ok) {
          throw new Error('Failed to fetch documents')
        }
        const data = await response.json()
        setDocs(data)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchDocs()
  }, [organization, addNotification])

  useEffect(() => {
    let newFilteredDocs = docs
    if (searchTerm) {
      newFilteredDocs = newFilteredDocs.filter(doc =>
        doc.document_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    setFilteredDocs(newFilteredDocs)
  }, [docs, searchTerm])

  const handleDelete = async (documentName: string) => {
    if (!organization) {
      addNotification({ message: 'No active organization found', type: 'error' })
      return
    }

    try {
      const response = await fetch(
        `/api/organization/${organization.id}/documents`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ document_name: documentName }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete document')
      }

      setDocs(prevDocs =>
        prevDocs.filter(doc => doc.document_name !== documentName)
      )
      addNotification({
        message: 'Document deleted successfully',
        type: 'success',
      })
    } catch (error) {
      addNotification({
        message: error instanceof Error ? error.message : 'An error occurred',
        type: 'error',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Documents</CardTitle>
        <CardDescription>
          {showActions
            ? 'Manage documents available to your organization.'
            : 'All documents available to your organization.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 mb-4">
          <Input
            placeholder="Filter by name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        {loading && <p>Loading documents...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Name</TableHead>
                <TableHead>Last Updated</TableHead>
                {showActions && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocs.map(doc => (
                <TableRow key={doc.document_name}>
                  <TableCell className="font-medium">
                    {doc.document_name}
                  </TableCell>
                  <TableCell>
                    {doc.last_updated
                      ? formatDistanceToNow(new Date(doc.last_updated), {
                          addSuffix: true,
                        })
                      : 'N/A'}
                  </TableCell>
                  {showActions && (
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the document &quot;
                              {doc.document_name}
                              &quot;.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(doc.document_name)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
} 