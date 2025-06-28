import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { accessRequestActionSchema } from '@/app/schemas/accessRequestSchema';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';
import { getAccessRequestDataAccess } from '@/app/config/backend';

// Email notification functions
async function sendApprovalEmail(requestData: any) {
  // TODO: Implement email sending logic for approval
  console.log('Approval email should be sent to:', {
    to: requestData.email,
    subject: 'Access Request Approved - Welcome to Webulae',
    data: requestData,
  });
}

async function sendRejectionEmail(requestData: any) {
  // TODO: Implement email sending logic for rejection
  console.log('Rejection email should be sent to:', {
    to: requestData.email,
    subject: 'Access Request Update - Webulae',
    data: requestData,
  });
}

export const PUT = withRateLimit(async (req: NextRequest, { params }: { params: { id: string; action: string } }) => {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
    }
    
    // Check if the current user is a global admin
    const clerk = await clerkClient();
    const currentUser = await clerk.users.getUser(userId);
    const isGlobalAdmin = currentUser.publicMetadata?.role === 'global_admin';
    
    if (!isGlobalAdmin) {
      return NextResponse.json({ error: 'Forbidden - Global admin access required', status: 403 }, { status: 403 });
    }
    
    const { id, action } = params;
    
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action', status: 400 }, { status: 400 });
    }
    
    // Parse and validate request body
    const body = await req.json();
    const result = accessRequestActionSchema.safeParse({ requestId: id, action: action as 'approve' | 'reject', notes: body.notes });
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.format(), status: 400 },
        { status: 400 }
      );
    }
    
    // Get data access layer
    const dataAccess = getAccessRequestDataAccess();
    
    // Get the access request
    const accessRequest = await dataAccess.getById(id);
    
    if (!accessRequest) {
      return NextResponse.json({ error: 'Access request not found', status: 404 }, { status: 404 });
    }
    
    if (accessRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Access request has already been processed', status: 400 }, { status: 400 });
    }
    
    let updatedRequest;
    
    if (action === 'approve') {
      // Update the access request status
      updatedRequest = await dataAccess.approve(id, body.notes, currentUser.emailAddresses[0]?.emailAddress);
      
      // Create user in Clerk
      try {
        const clerkUser = await clerk.users.createUser({
          emailAddress: [accessRequest.email],
          firstName: accessRequest.firstName,
          lastName: accessRequest.lastName,
          publicMetadata: {
            organizationName: accessRequest.companyName,
            role: 'org_admin', // Default role for approved users
            approvedFromRequest: true,
            originalRequestId: id,
          },
          // Clerk will send a password reset email to the user
        });
        
        // Send approval email
        await sendApprovalEmail({
          ...accessRequest,
          clerkUserId: clerkUser.id,
        });
        
      } catch (clerkError) {
        console.error('Failed to create user in Clerk:', clerkError);
        // Revert the access request status if Clerk creation fails
        await dataAccess.update(id, { status: 'pending' });
        throw new Error('Failed to create user account');
      }
      
    } else if (action === 'reject') {
      // Update the access request status
      updatedRequest = await dataAccess.reject(id, body.notes, currentUser.emailAddresses[0]?.emailAddress);
      
      // Send rejection email
      await sendRejectionEmail(accessRequest);
    }
    
    return NextResponse.json({
      success: true,
      message: `Access request ${action}d successfully`,
      request: updatedRequest,
    }, { status: 200 });
    
  } catch (error) {
    logServerError(`Failed to ${params.action} access request`, error);
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
}); 