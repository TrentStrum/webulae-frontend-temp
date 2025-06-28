'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/app/lib/apiClient';
import { queryKeys } from '@/app/lib/queryClient';
import type { Document } from '@/app/types';
import { useNotifications } from '@/app/lib/stateContext';
import { ARCHITECTURE_CONFIG } from '@/app/lib/env';

export function useDocumentService() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  // Helper function to get the appropriate endpoint
  const getDocumentEndpoint = (path: string = '') => {
    if (ARCHITECTURE_CONFIG.USE_MODULAR_FOR_DOCUMENTS) {
      return `/api/documents-new${path}`;
    }
    return `/api/documents${path}`;
  };

  function useGetDocuments() {
    return useQuery({
      queryKey: ['documents'],
      queryFn: () => apiClient.get<Document[]>(getDocumentEndpoint()),
      staleTime: 60000, // 1 minute
      gcTime: 300000, // 5 minutes
    });
  }

  function useGetDocumentById(id: string) {
    return useQuery({
      queryKey: ['documents', id],
      queryFn: () => apiClient.get<Document>(getDocumentEndpoint(`/${id}`)),
      enabled: !!id,
      staleTime: 60000, // 1 minute
      gcTime: 300000, // 5 minutes
    });
  }

  function useUploadDocument() {
    return useMutation({
      mutationFn: (data: { content: string }) => 
        apiClient.post<{ content: string }, { id: string }>(getDocumentEndpoint(), data),
      onSuccess: (data) => {
        // Invalidate documents query to refetch
        queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
        
        // Show success notification
        addNotification({
          message: 'Document uploaded successfully',
          type: 'success',
        });
        
        return data;
      },
      onError: (error) => {
        // Show error notification
        addNotification({
          message: `Failed to upload document: ${error.message}`,
          type: 'error',
        });
      },
    });
  }

  function useUploadDocumentFile() {
    return useMutation({
      mutationFn: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(getDocumentEndpoint(), {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to upload document');
        }
        
        return response.json();
      },
      onSuccess: () => {
        // Invalidate documents query to refetch
        queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
        
        // Show success notification
        addNotification({
          message: 'Document uploaded successfully',
          type: 'success',
        });
      },
      onError: (error) => {
        // Show error notification
        addNotification({
          message: `Failed to upload document: ${error.message}`,
          type: 'error',
        });
      },
    });
  }

  function useDeleteDocument() {
    return useMutation({
      mutationFn: (id: string) => apiClient.delete(getDocumentEndpoint(`/${id}`)),
      onSuccess: (_, id) => {
        // Remove the document from the cache
        queryClient.removeQueries({ queryKey: queryKeys.documents.detail(id) });
        
        // Update the documents list cache if it exists
        queryClient.setQueriesData({ queryKey: queryKeys.documents.all }, (oldData: Document[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.filter(doc => doc.id !== id);
        });
        
        // Show success notification
        addNotification({
          message: 'Document deleted successfully',
          type: 'success',
        });
      },
      onError: (error) => {
        // Show error notification
        addNotification({
          message: `Failed to delete document: ${error.message}`,
          type: 'error',
        });
      },
    });
  }

  return { 
    useGetDocuments, 
    useGetDocumentById, 
    useUploadDocument,
    useUploadDocumentFile,
    useDeleteDocument
  };
}