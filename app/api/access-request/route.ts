import { NextRequest, NextResponse } from 'next/server';
import { accessRequestSchema } from '@/app/schemas/accessRequestSchema';
import { formatApiError, logServerError } from '@/app/lib/errorHandler';
import { withRateLimit } from '@/app/api/middleware/withRateLimit';
import { getAccessRequestDataAccess } from '@/app/config/backend';

// Email notification function (you'll need to implement this based on your email service)
async function sendAccessRequestNotification(requestData: any) {
  // TODO: Implement email sending logic
  // This could use SendGrid, Resend, or any other email service
  console.log('Access request notification should be sent to global admin:', {
    to: process.env.GLOBAL_ADMIN_EMAIL || 'admin@webulae.com',
    subject: 'New Access Request - Webulae',
    data: requestData,
  });
}

export const POST = withRateLimit(async (req: NextRequest) => {
  try {
    // Parse and validate request body
    const body = await req.json();
    const result = accessRequestSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.format(), status: 400 },
        { status: 400 }
      );
    }

    const requestData = result.data;
    
    // Get data access layer
    const dataAccess = getAccessRequestDataAccess();
    
    // Store the access request in the database
    const accessRequest = await dataAccess.create({
      ...requestData,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    });

    // Send email notification to global admin
    try {
      await sendAccessRequestNotification({
        ...requestData,
        id: accessRequest.id,
        submittedAt: accessRequest.submittedAt,
      });
    } catch (emailError) {
      // Log email error but don't fail the request
      console.error('Failed to send access request notification:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Access request submitted successfully',
      requestId: accessRequest.id,
    }, { status: 201 });

  } catch (error) {
    logServerError('Failed to submit access request', error);
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
});

export const GET = withRateLimit(async (req: NextRequest) => {
  try {
    // This endpoint would be used by the global admin to fetch access requests
    // It should require authentication and admin privileges
    const dataAccess = getAccessRequestDataAccess();
    
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    const requests = await dataAccess.list({
      status: status as any,
      limit,
      offset,
    });

    return NextResponse.json({
      requests,
      total: requests.length,
      limit,
      offset,
    }, { status: 200 });

  } catch (error) {
    logServerError('Failed to fetch access requests', error);
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
}); 