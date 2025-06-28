'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/app/components/ui/badge'
import { UploadCloud, FileText, X, Play, CheckCircle, Building2, Briefcase, ArrowRight } from 'lucide-react'
import { useNotifications } from '@/app/lib/stateContext'
import { MultiStepLoader } from '@/app/components/ui/multi-step-loader'

interface ProcessedFile {
    name: string
    outputFile: string
    slug: string
}

interface Organization {
    id: string
    name: string
    slug: string
}

export default function DocumentsPage() {
    const [files, setFiles] = useState<File[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([])
    const [showTokenEstimate, setShowTokenEstimate] = useState(false)
    const [tokenEstimate, setTokenEstimate] = useState<number | null>(null)
    const [costEstimate, setCostEstimate] = useState<number | null>(null)
    
    // Organization and document type state
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>('')
    const [isCompanyKnowledge, setIsCompanyKnowledge] = useState(true)
    const [activeTab, setActiveTab] = useState('upload')
    const [loadingStates, setLoadingStates] = useState<{text: string}[]>([])
    
    const { addNotification } = useNotifications()

    // Fetch organizations on component mount
    useEffect(() => {
        fetchOrganizations()
    }, [])

    const fetchOrganizations = async () => {
        try {
            const response = await fetch('/api/organization')
            if (response.ok) {
                const data = await response.json()
                setOrganizations(data.organizations || [])
            }
        } catch (error) {
            console.error('Failed to fetch organizations:', error)
            addNotification({
                message: 'Failed to load organizations',
                type: 'error'
            })
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files
        if (selectedFiles) {
            const newFiles = [...files, ...Array.from(selectedFiles)]
            setFiles(newFiles)
            estimateTokens(newFiles)
        }
    }

    const handleRemoveFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index)
        setFiles(newFiles)
        if (newFiles.length === 0) {
            setTokenEstimate(null)
            setCostEstimate(null)
        } else {
            estimateTokens(newFiles)
        }
    }

    const estimateTokens = (selectedFiles: File[]) => {
        const totalBytes = selectedFiles.reduce((sum, file) => sum + file.size, 0)
        const estimatedTokens = Math.ceil(totalBytes / 4)
        setTokenEstimate(estimatedTokens)
        
        const costPer1KTokens = 0.0004
        const estimatedCost = (estimatedTokens / 1000) * costPer1KTokens
        setCostEstimate(estimatedCost)
        
        setShowTokenEstimate(true)
    }

    const handleProcess = async () => {
        if (files.length === 0) {
            addNotification({
                message: 'Please upload at least one document.',
                type: 'error'
            })
            return
        }

        // Validate organization selection
        if (!isCompanyKnowledge && !selectedOrganizationId) {
            addNotification({
                message: 'Please select an organization or enable company knowledge.',
                type: 'error'
            })
            return
        }
        
        const states = [
            { text: 'Initializing vectorization process...' },
            ...files.map(file => ({ text: `Processing ${file.name}` })),
            { text: 'Generating and storing embeddings...' },
            { text: 'Finalizing process...' },
        ];
        setLoadingStates(states);

        setIsProcessing(true)
        
        try {
            const newProcessedFiles = []
            
            for (const file of files) {
                
                const formData = new FormData()
                formData.append('file', file)
                
                // Add organization ID or company knowledge flag
                if (isCompanyKnowledge) {
                    formData.append('organizationId', 'company_knowledge')
                } else {
                    formData.append('organizationId', selectedOrganizationId)
                }
                
                const response = await fetch('/api/admin/documents/vectorize', {
                    method: 'POST',
                    body: formData,
                })
                
                if (!response.ok) {
                    throw new Error('Failed to process file')
                }
                
                const result = await response.json()
                newProcessedFiles.push({
                    name: file.name,
                    outputFile: result.result?.document_name || 'processed',
                    slug: result.result?.slug || ''
                })
                
            }
            
            setProcessedFiles(newProcessedFiles)
            setActiveTab('results')
            
            addNotification({
                message: `Documents have been processed successfully and saved to ${isCompanyKnowledge ? 'company knowledge base' : 'organization documents'}.`,
                type: 'success'
            })
        } catch (error) {
            addNotification({
                message: error instanceof Error ? error.message : 'An error occurred during processing',
                type: 'error'
            })
        } finally {
            setIsProcessing(false)
        }
    }

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase()
        switch(ext) {
            case 'pdf': return <FileText className="w-5 h-5 text-red-500" />
            case 'docx': return <FileText className="w-5 h-5 text-blue-500" />
            case 'txt': return <FileText className="w-5 h-5 text-gray-500" />
            default: return <FileText className="w-5 h-5 text-gray-500" />
        }
    }

    const getDocumentTypeLabel = () => {
        return isCompanyKnowledge ? 'Company Knowledge' : 'Organization Documents'
    }

    const getDocumentTypeIcon = () => {
        return isCompanyKnowledge ? <Briefcase className="w-4 h-4" /> : <Building2 className="w-4 h-4" />
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Document Vectorization</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Upload and process documents to create vector embeddings for organizations or company knowledge base.
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                    <TabsTrigger value="process" disabled={files.length === 0}>Process</TabsTrigger>
                    <TabsTrigger value="results" disabled={processedFiles.length === 0}>Results</TabsTrigger>
                </TabsList>

                <TabsContent value="upload">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload Documents</CardTitle>
                            <CardDescription>
                                Upload documents to be vectorized. Supported formats: PDF, DOCX, TXT
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Document Type Selection */}
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="company-knowledge"
                                            checked={isCompanyKnowledge}
                                            onCheckedChange={setIsCompanyKnowledge}
                                        />
                                        <Label htmlFor="company-knowledge" className="text-sm font-medium">
                                            Save to Company Knowledge Base
                                        </Label>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        {getDocumentTypeIcon()}
                                        <Badge variant={isCompanyKnowledge ? "default" : "secondary"}>
                                            {getDocumentTypeLabel()}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Organization Selection (only show if not company knowledge) */}
                                {!isCompanyKnowledge && (
                                    <div className="space-y-2">
                                        <Label htmlFor="organization">Select Organization</Label>
                                        <Select value={selectedOrganizationId} onValueChange={setSelectedOrganizationId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose an organization" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {organizations.map((org) => (
                                                    <SelectItem key={org.id} value={org.id}>
                                                        {org.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {organizations.length === 0 && (
                                            <p className="text-sm text-gray-500">
                                                No organizations found. Please create an organization first.
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* File Upload */}
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                    <div className="flex flex-col items-center justify-center space-y-4">
                                        <UploadCloud className="w-12 h-12 text-gray-400" />
                                        <div className="text-center">
                                            <Label htmlFor="document" className="cursor-pointer">
                                                <span className="text-blue-600 hover:text-blue-500">
                                                    Click to upload
                                                </span>
                                                {' '}or drag and drop
                                            </Label>
                                            <Input
                                                id="document"
                                                type="file"
                                                accept=".pdf,.docx,.txt"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                multiple
                                            />
                                        </div>
                                    </div>
                                </div>

                                {files.length > 0 && (
                                    <div className="space-y-2">
                                        {files.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                                <div className="flex items-center space-x-2 overflow-hidden">
                                                    {getFileIcon(file.name)}
                                                    <span className="text-gray-900 dark:text-gray-100 truncate" title={file.name}>
                                                        {file.name}
                                                    </span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveFile(index)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {showTokenEstimate && tokenEstimate && (
                                    <div className="text-sm text-gray-500">
                                        Estimated tokens: {tokenEstimate.toLocaleString()}
                                        {costEstimate && (
                                            <span> (Estimated cost: ${costEstimate.toFixed(4)})</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={() => setActiveTab('process')}
                                disabled={files.length === 0}
                                className="ml-auto"
                            >
                                Next <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="process">
                    <Card>
                        <CardHeader>
                            <CardTitle>Process Documents</CardTitle>
                            <CardDescription>
                                Review and process your uploaded documents
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Processing Summary */}
                                <div className="bg-gray-50 rounded-lg p-4 dark:bg-gray-800">
                                    <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Processing Summary</h3>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Document Type:</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">{getDocumentTypeLabel()}</span>
                                        </div>
                                        {!isCompanyKnowledge && selectedOrganizationId && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Organization:</span>
                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                    {organizations.find(org => org.id === selectedOrganizationId)?.name || selectedOrganizationId}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Files to Process:</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">{files.length}</span>
                                        </div>
                                    </div>
                                </div>

                                {isProcessing ? (
                                    <MultiStepLoader loadingStates={loadingStates} loading={isProcessing} duration={1500} />
                                ) : (
                                    <Button
                                        onClick={handleProcess}
                                        disabled={files.length === 0 || (!isCompanyKnowledge && !selectedOrganizationId)}
                                        className="w-full"
                                    >
                                        <Play className="w-4 h-4 mr-2" />
                                        Process Documents
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="results">
                    <Card>
                        <CardHeader>
                            <CardTitle>Processing Results</CardTitle>
                            <CardDescription>
                                View the results of your document processing
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {processedFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                        <div className="flex items-center space-x-2 overflow-hidden">
                                            {getFileIcon(file.name)}
                                            <span className="text-gray-900 dark:text-gray-100 truncate" title={file.name}>{file.name}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span className="text-sm text-gray-500">Processed</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
} 