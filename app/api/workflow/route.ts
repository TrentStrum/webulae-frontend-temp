import { NextRequest, NextResponse } from 'next/server';
import { getProjectDataAccess } from '@/app/config/backend';

export async function GET(req: NextRequest): Promise<Response> {
  try {
    const url = new URL(req.url);
    const projectDataAccess = getProjectDataAccess();
    
    if (url.searchParams.get('executions')) {
      // Return mock workflow executions data
      const executions = [
        {
          id: 'exec_1',
          workflowId: 'workflow_1',
          status: 'completed',
          startedAt: new Date(Date.now() - 3600000).toISOString(),
          finishedAt: new Date().toISOString(),
          data: { result: 'success' }
        },
        {
          id: 'exec_2',
          workflowId: 'workflow_2',
          status: 'running',
          startedAt: new Date(Date.now() - 1800000).toISOString(),
          data: { progress: 50 }
        }
      ];
      return NextResponse.json(executions);
    }
    
    // Return mock workflows data
    const workflows = [
      {
        id: 'workflow_1',
        name: 'Document Processing',
        active: true,
        nodes: [],
        connections: {}
      },
      {
        id: 'workflow_2',
        name: 'Data Analysis',
        active: true,
        nodes: [],
        connections: {}
      }
    ];
    return NextResponse.json(workflows);
  } catch (error) {
    console.error('Failed to fetch workflows:', error);
    return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const { workflowId } = await req.json();
    if (!workflowId) {
      return NextResponse.json({ error: 'workflowId required' }, { status: 400 });
    }
    
    // Return mock execution result
    const execution = {
      id: `exec_${Date.now()}`,
      workflowId,
      status: 'completed',
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      data: { result: 'success', workflowId }
    };
    
    return NextResponse.json(execution, { status: 200 });
  } catch (error) {
    console.error('Failed to trigger workflow:', error);
    return NextResponse.json({ error: 'Failed to trigger workflow' }, { status: 500 });
  }
}
