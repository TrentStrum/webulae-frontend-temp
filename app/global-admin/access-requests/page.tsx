'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Textarea } from '@/app/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Building2, 
  Users, 
  Calendar,
  Mail,
  Briefcase
} from 'lucide-react';
import type { AccessRequest } from '@/app/types/accessRequest.types';

// Mock API functions (replace with real API calls)
const fetchAccessRequests = async (status?: string): Promise<AccessRequest[]> => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  
  const response = await fetch(`/api/access-request?${params}`);
  if (!response.ok) throw new Error('Failed to fetch access requests');
  
  const data = await response.json();
  return data.requests;
};

const updateAccessRequest = async (id: string, action: 'approve' | 'reject', notes?: string): Promise<AccessRequest> => {
  const response = await fetch(`/api/access-request/${id}/${action}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
  });
  
  if (!response.ok) throw new Error(`Failed to ${action} access request`);
  return response.json();
};

export default function AccessRequestsPage(): React.ReactElement {
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch all requests
  const { data: allRequests, isLoading, error } = useQuery({
    queryKey: ['access-requests', 'all'],
    queryFn: () => fetchAccessRequests(),
  });

  // Filter requests by status
  const pendingRequests = allRequests?.filter(r => r.status === 'pending') || [];
  const approvedRequests = allRequests?.filter(r => r.status === 'approved') || [];
  const rejectedRequests = allRequests?.filter(r => r.status === 'rejected') || [];

  // Mutation for approving/rejecting requests
  const updateRequestMutation = useMutation({
    mutationFn: ({ id, action, notes }: { id: string; action: 'approve' | 'reject'; notes?: string }) =>
      updateAccessRequest(id, action, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-requests'] });
      setIsActionDialogOpen(false);
      setSelectedRequest(null);
      setActionNotes('');
      setPendingAction(null);
    },
    onError: (error) => {
      console.error('Failed to update request:', error);
      alert(`Failed to ${pendingAction} request: ${error.message}`);
    },
  });

  const handleAction = (request: AccessRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setPendingAction(action);
    setIsActionDialogOpen(true);
  };

  const submitAction = () => {
    if (!selectedRequest || !pendingAction) return;
    
    updateRequestMutation.mutate({
      id: selectedRequest.id,
      action: pendingAction,
      notes: actionNotes.trim() || undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800"><CheckCircle className="h-3 w-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) return <div className="p-6">Loading access requests...</div>;
  if (error) return <div className="p-6 text-red-600">Error loading access requests: {error.message}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Access Requests</h1>
          <p className="text-muted-foreground">Review and manage access requests from potential users</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedRequests.length}</div>
            <p className="text-xs text-muted-foreground">Access granted</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedRequests.length}</div>
            <p className="text-xs text-muted-foreground">Access denied</p>
          </CardContent>
        </Card>
      </div>

      {/* Requests Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approved ({approvedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Rejected ({rejectedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No pending access requests
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map((request) => (
              <AccessRequestCard
                key={request.id}
                request={request}
                onAction={handleAction}
                showActions={true}
                formatDate={formatDate}
                getStatusBadge={getStatusBadge}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedRequests.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No approved access requests
              </CardContent>
            </Card>
          ) : (
            approvedRequests.map((request) => (
              <AccessRequestCard
                key={request.id}
                request={request}
                onAction={handleAction}
                showActions={false}
                formatDate={formatDate}
                getStatusBadge={getStatusBadge}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedRequests.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No rejected access requests
              </CardContent>
            </Card>
          ) : (
            rejectedRequests.map((request) => (
              <AccessRequestCard
                key={request.id}
                request={request}
                onAction={handleAction}
                showActions={false}
                formatDate={formatDate}
                getStatusBadge={getStatusBadge}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {pendingAction === 'approve' ? 'Approve' : 'Reject'} Access Request
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedRequest && (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {selectedRequest.firstName} {selectedRequest.lastName} - {selectedRequest.companyName}
                </p>
                <p className="text-sm text-muted-foreground">{selectedRequest.email}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">
                Notes (optional)
              </label>
              <Textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder={`Add notes about why you're ${pendingAction}ing this request...`}
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsActionDialogOpen(false)}
                disabled={updateRequestMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant={pendingAction === 'approve' ? 'default' : 'destructive'}
                onClick={submitAction}
                disabled={updateRequestMutation.isPending}
              >
                {updateRequestMutation.isPending ? 'Processing...' : `${pendingAction === 'approve' ? 'Approve' : 'Reject'}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Access Request Card Component
interface AccessRequestCardProps {
  request: AccessRequest;
  onAction: (request: AccessRequest, action: 'approve' | 'reject') => void;
  showActions: boolean;
  formatDate: (date: string) => string;
  getStatusBadge: (status: string) => React.ReactElement;
}

function AccessRequestCard({ request, onAction, showActions, formatDate, getStatusBadge }: AccessRequestCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {request.firstName} {request.lastName}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              {request.email}
            </div>
          </div>
          {getStatusBadge(request.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{request.companyName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{request.jobTitle}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{request.teamSize} employees</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Start: {request.expectedStartDate}</span>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-sm mb-1">Use Case</h4>
          <p className="text-sm text-muted-foreground line-clamp-3">{request.useCase}</p>
        </div>

        {request.additionalInfo && (
          <div>
            <h4 className="font-medium text-sm mb-1">Additional Information</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">{request.additionalInfo}</p>
          </div>
        )}

        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Submitted: {formatDate(request.submittedAt)}</span>
          {request.reviewedAt && (
            <span>Reviewed: {formatDate(request.reviewedAt)}</span>
          )}
        </div>

        {showActions && (
          <div className="flex justify-end space-x-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction(request, 'reject')}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button
              size="sm"
              onClick={() => onAction(request, 'approve')}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </div>
        )}

        {request.adminNotes && (
          <div>
            <p>
              <strong>Admin Notes:</strong> {request.adminNotes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 